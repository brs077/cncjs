// Socket.IO client wrapper for CNCjs with GRBL state caching

import io from "socket.io-client";
import type {
  GrblState,
  GrblStatus,
  GrblParserState,
  Position,
  SenderStatus,
  FeederStatus,
  SerialPort,
  MacroRecord,
  MachineProfile,
} from "./types.js";

interface CNCjsConfig {
  url: string;
  token?: string;
}

type EventCallback = (...args: any[]) => void;

const DEFAULT_POS: Position = { x: 0, y: 0, z: 0 };

const DEFAULT_STATUS: GrblStatus = {
  activeState: "Unknown",
  mpos: { ...DEFAULT_POS },
  wpos: { ...DEFAULT_POS },
  wco: { ...DEFAULT_POS },
  ov: [100, 100, 100],
  buf: { planner: 0, rx: 0 },
  feedrate: 0,
  spindle: 0,
};

const DEFAULT_PARSER: GrblParserState = {
  modal: {
    motion: "G0",
    wcs: "G54",
    plane: "G17",
    units: "G21",
    distance: "G90",
    feedrate: "G94",
    program: "M0",
    spindle: "M5",
    coolant: "M9",
  },
  tool: 0,
  feedrate: 0,
  spindle: 0,
};

export class CNCjsClient {
  private socket: ReturnType<typeof io> | null = null;
  private config: CNCjsConfig;

  // Connection state
  private _connected = false;
  private _connectedPort: string | null = null;
  private _controllerType: string | null = null;

  // Cached GRBL state
  private _status: GrblStatus = { ...DEFAULT_STATUS };
  private _parserState: GrblParserState = JSON.parse(JSON.stringify(DEFAULT_PARSER));
  private _settings: Record<string, string> = {};

  // Workflow & sender
  private _workflowState: string = "idle"; // idle, running, paused
  private _senderStatus: SenderStatus | null = null;
  private _feederStatus: FeederStatus = {
    hold: false,
    holdReason: null,
    queue: 0,
    pending: false,
  };

  // Loaded G-code
  private _gcodeFile: string | null = null;
  private _gcodeContent: string | null = null;

  // Alarm & errors
  private _alarmCode: number | null = null;
  private _lastErrorCode: number | null = null;

  // Console ring buffer
  private static readonly CONSOLE_BUFFER_SIZE = 200;
  private _consoleBuffer: string[] = [];

  // Probe result
  private _lastProbeResult: { success: boolean; position: Position } | null = null;
  private _probeResolve: ((result: { success: boolean; position: Position }) => void) | null = null;

  // Lists (fetched on demand)
  private _macros: MacroRecord[] = [];
  private _machines: MachineProfile[] = [];

  constructor() {
    const url = process.env.CNCJS_URL || "http://localhost:8000";
    const token = process.env.CNCJS_TOKEN || undefined;
    this.config = { url, token };
  }

  // ── Connection ──────────────────────────────────────────────

  get isConnectedToServer(): boolean {
    return this._connected;
  }

  get connectedPort(): string | null {
    return this._connectedPort;
  }

  get controllerType(): string | null {
    return this._controllerType;
  }

  async connectToServer(): Promise<void> {
    if (this.socket && this._connected) return;

    return new Promise((resolve, reject) => {
      const opts: Record<string, any> = {
        query: this.config.token ? `token=${this.config.token}` : "",
      };

      this.socket = io(this.config.url, opts);

      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout to CNCjs at ${this.config.url}`));
      }, 10000);

      this.socket.on("connect", () => {
        clearTimeout(timeout);
        this._connected = true;
        console.error(`[cnc-design-control-mcp] Connected to CNCjs at ${this.config.url}`);
        this.setupListeners();
        resolve();
      });

      this.socket.on("connect_error", (err: Error) => {
        clearTimeout(timeout);
        this._connected = false;
        reject(new Error(`Failed to connect to CNCjs: ${err.message}`));
      });

      this.socket.on("disconnect", () => {
        this._connected = false;
        this._connectedPort = null;
        console.error("[cnc-design-control-mcp] Disconnected from CNCjs");
      });
    });
  }

  disconnectFromServer(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._connected = false;
      this._connectedPort = null;
    }
  }

  private setupListeners(): void {
    if (!this.socket) return;

    // Controller state updates (high frequency)
    this.socket.on("controller:state", (_type: string, state: any) => {
      if (state?.status) {
        this._status = {
          activeState: state.status.activeState || "Unknown",
          mpos: state.status.mpos || { ...DEFAULT_POS },
          wpos: state.status.wpos || { ...DEFAULT_POS },
          wco: state.status.wco || { ...DEFAULT_POS },
          ov: state.status.ov || [100, 100, 100],
          buf: state.status.buf || { planner: 0, rx: 0 },
          feedrate: state.status.feedrate || 0,
          spindle: state.status.spindle || 0,
        };

        // Track alarm state
        if (state.status.activeState === "Alarm") {
          // Alarm code may come from a separate event
        } else {
          this._alarmCode = null;
        }
      }
      if (state?.parserstate) {
        this._parserState = state.parserstate;
      }
    });

    // Controller settings
    this.socket.on("controller:settings", (_type: string, settings: any) => {
      if (settings?.settings) {
        this._settings = settings.settings;
      }
    });

    // Serial port open/close
    this.socket.on("serialport:open", (data: any) => {
      this._connectedPort = data?.port || null;
      this._controllerType = data?.controllerType || "Grbl";
      console.error(`[cnc-design-control-mcp] Serial port opened: ${data?.port}`);
    });

    this.socket.on("serialport:close", (_data: any) => {
      this._connectedPort = null;
      this._controllerType = null;
      this.resetState();
      console.error("[cnc-design-control-mcp] Serial port closed");
    });

    // Workflow state
    this.socket.on("workflow:state", (state: string) => {
      this._workflowState = state;
    });

    // Sender status
    this.socket.on("sender:status", (status: any) => {
      this._senderStatus = status;
    });

    // Feeder status
    this.socket.on("feeder:status", (status: any) => {
      this._feederStatus = {
        hold: status?.hold || false,
        holdReason: status?.holdReason?.data || null,
        queue: status?.queue || 0,
        pending: status?.pending || false,
      };
    });

    // G-code load
    this.socket.on("gcode:load", (name: string, content: string) => {
      this._gcodeFile = name;
      this._gcodeContent = content;
    });

    // G-code unload
    this.socket.on("gcode:unload", () => {
      this._gcodeFile = null;
      this._gcodeContent = null;
      this._senderStatus = null;
    });

    // Serial port error
    this.socket.on("serialport:error", (data: any) => {
      console.error(`[cnc-design-control-mcp] Serial port error: ${JSON.stringify(data)}`);
    });

    // Serial data parsing (alarms, errors, probes, console buffer)
    this.socket.on("serialport:read", (data: string) => {
      if (!data) return;

      // Add to console ring buffer
      const lines = data.split("\n").filter((l: string) => l.trim());
      for (const line of lines) {
        this._consoleBuffer.push(line);
        if (this._consoleBuffer.length > CNCjsClient.CONSOLE_BUFFER_SIZE) {
          this._consoleBuffer.shift();
        }
      }

      // Alarm parsing
      const alarmMatch = data.match(/ALARM:(\d+)/);
      if (alarmMatch) {
        this._alarmCode = parseInt(alarmMatch[1], 10);
      }

      // Error parsing
      const errorMatch = data.match(/error:(\d+)/);
      if (errorMatch) {
        this._lastErrorCode = parseInt(errorMatch[1], 10);
      }

      // Probe result parsing: [PRB:x.xxx,y.yyy,z.zzz:1] or [PRB:x.xxx,y.yyy,z.zzz:0]
      const probeMatch = data.match(/\[PRB:([-\d.]+),([-\d.]+),([-\d.]+):([01])\]/);
      if (probeMatch) {
        const result = {
          success: probeMatch[4] === "1",
          position: {
            x: parseFloat(probeMatch[1]),
            y: parseFloat(probeMatch[2]),
            z: parseFloat(probeMatch[3]),
          },
        };
        this._lastProbeResult = result;
        if (this._probeResolve) {
          this._probeResolve(result);
          this._probeResolve = null;
        }
      }
    });

    // Capture outgoing commands to console buffer
    this.socket.on("serialport:write", (data: string) => {
      if (!data) return;
      const lines = data.split("\n").filter((l: string) => l.trim());
      for (const line of lines) {
        this._consoleBuffer.push(`> ${line}`);
        if (this._consoleBuffer.length > CNCjsClient.CONSOLE_BUFFER_SIZE) {
          this._consoleBuffer.shift();
        }
      }
    });
  }

  private resetState(): void {
    this._status = { ...DEFAULT_STATUS };
    this._parserState = JSON.parse(JSON.stringify(DEFAULT_PARSER));
    this._settings = {};
    this._workflowState = "idle";
    this._senderStatus = null;
    this._feederStatus = { hold: false, holdReason: null, queue: 0, pending: false };
    this._gcodeFile = null;
    this._gcodeContent = null;
    this._alarmCode = null;
    this._lastErrorCode = null;
    this._consoleBuffer = [];
    this._lastProbeResult = null;
    this._probeResolve = null;
  }

  // ── Getters (cached, no round-trip) ─────────────────────────

  get status(): GrblStatus {
    return this._status;
  }

  get parserState(): GrblParserState {
    return this._parserState;
  }

  get grblState(): GrblState {
    return { status: this._status, parserstate: this._parserState };
  }

  get settings(): Record<string, string> {
    return this._settings;
  }

  get workflowState(): string {
    return this._workflowState;
  }

  get senderStatus(): SenderStatus | null {
    return this._senderStatus;
  }

  get feederStatus(): FeederStatus {
    return this._feederStatus;
  }

  get gcodeFile(): string | null {
    return this._gcodeFile;
  }

  get gcodeContent(): string | null {
    return this._gcodeContent;
  }

  get alarmCode(): number | null {
    return this._alarmCode;
  }

  get activeState(): string {
    return this._status.activeState;
  }

  get lastErrorCode(): number | null {
    return this._lastErrorCode;
  }

  get consoleOutput(): string[] {
    return [...this._consoleBuffer];
  }

  get lastProbeResult(): { success: boolean; position: Position } | null {
    return this._lastProbeResult;
  }

  waitForProbeResult(timeoutMs: number = 30000): Promise<{ success: boolean; position: Position }> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._probeResolve = null;
        reject(new Error("Probe timeout — no probe contact detected within timeout period."));
      }, timeoutMs);

      this._probeResolve = (result) => {
        clearTimeout(timeout);
        resolve(result);
      };
    });
  }

  // ── Port Operations ─────────────────────────────────────────

  async listPorts(): Promise<SerialPort[]> {
    this.ensureConnected();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("List ports timeout")), 5000);
      this.socket!.emit("list", (ports: SerialPort[]) => {
        clearTimeout(timeout);
        resolve(ports || []);
      });
    });
  }

  async openPort(
    port: string,
    baudrate: number = 115200,
    controllerType: string = "Grbl"
  ): Promise<void> {
    this.ensureConnected();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Open port timeout")), 10000);

      // Listen for success or error
      const onOpen = () => {
        clearTimeout(timeout);
        cleanup();
        resolve();
      };
      const onError = (data: any) => {
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`Failed to open port: ${JSON.stringify(data)}`));
      };
      const cleanup = () => {
        this.socket!.removeListener("serialport:open", onOpen);
        this.socket!.removeListener("serialport:error", onError);
      };

      this.socket!.on("serialport:open", onOpen);
      this.socket!.on("serialport:error", onError);
      this.socket!.emit("open", port, { controllerType, baudrate });
    });
  }

  async closePort(port?: string): Promise<void> {
    this.ensureConnected();
    const p = port || this._connectedPort;
    if (!p) throw new Error("No port to close");

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Close port timeout")), 5000);
      const onClose = () => {
        clearTimeout(timeout);
        this.socket!.removeListener("serialport:close", onClose);
        resolve();
      };
      this.socket!.on("serialport:close", onClose);
      this.socket!.emit("close", p);
    });
  }

  // ── Commands ────────────────────────────────────────────────

  sendGcode(lines: string | string[]): void {
    this.ensurePortOpen();
    const cmds = Array.isArray(lines) ? lines : [lines];
    for (const cmd of cmds) {
      this.socket!.emit("command", this._connectedPort, "gcode", cmd);
    }
  }

  sendCommand(cmd: string, ...args: any[]): void {
    this.ensurePortOpen();
    this.socket!.emit("command", this._connectedPort, cmd, ...args);
  }

  // Raw write — bypasses command queue (for emergency stop)
  writeRaw(data: string): void {
    this.ensurePortOpen();
    this.socket!.emit("write", this._connectedPort, data, {});
  }

  // Job control
  startJob(): void {
    this.sendCommand("gcode:start");
  }

  pauseJob(): void {
    this.sendCommand("gcode:pause");
  }

  resumeJob(): void {
    this.sendCommand("gcode:resume");
  }

  stopJob(force: boolean = false): void {
    if (force) {
      this.sendCommand("gcode:stop", { force: true });
    } else {
      this.sendCommand("gcode:stop");
    }
  }

  loadGcode(name: string, content: string): void {
    this.ensurePortOpen();
    this.socket!.emit("gcode:load", name, content);
  }

  // Homing
  home(): void {
    this.sendGcode("$H");
  }

  // Unlock
  unlock(): void {
    this.sendGcode("$X");
  }

  // Feed hold (controlled deceleration)
  feedHold(): void {
    this.writeRaw("!");
  }

  // Cycle start / resume from hold
  cycleStart(): void {
    this.writeRaw("~");
  }

  // Emergency stop (soft reset)
  emergencyStop(): void {
    this.writeRaw("\x18");
  }

  // Jog cancel (realtime command)
  jogCancel(): void {
    this.writeRaw("\x85");
  }

  // Jog
  jog(axis: string, distance: number, feedrate: number): void {
    const cmd = `$J=G91 ${axis.toUpperCase()}${distance} F${feedrate}`;
    this.sendGcode(cmd);
  }

  // Overrides
  setFeedOverride(value: number): void {
    // GRBL real-time feed override uses specific byte commands
    // CNCjs abstracts this via command
    this.sendCommand("feedOverride", value);
  }

  setSpindleOverride(value: number): void {
    this.sendCommand("spindleOverride", value);
  }

  // ── Macros ──────────────────────────────────────────────────

  async fetchMacros(): Promise<MacroRecord[]> {
    this.ensureConnected();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Fetch macros timeout")), 5000);
      // CNCjs REST-style fetch via socket
      this.socket!.emit("macros:list", (err: any, macros: any[]) => {
        clearTimeout(timeout);
        if (err) {
          reject(new Error(`Failed to fetch macros: ${JSON.stringify(err)}`));
          return;
        }
        this._macros = (macros || []).map((m: any) => ({
          id: m.id || m._id,
          name: m.name,
          content: m.content,
        }));
        resolve(this._macros);
      });
    });
  }

  get macros(): MacroRecord[] {
    return this._macros;
  }

  runMacro(id: string): void {
    this.ensurePortOpen();
    this.socket!.emit("command", this._connectedPort, "macro:run", id, {});
  }

  // ── Machines ────────────────────────────────────────────────

  async fetchMachines(): Promise<MachineProfile[]> {
    this.ensureConnected();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Fetch machines timeout")), 5000);
      this.socket!.emit("machines:list", (err: any, machines: any[]) => {
        clearTimeout(timeout);
        if (err) {
          reject(new Error(`Failed to fetch machines: ${JSON.stringify(err)}`));
          return;
        }
        this._machines = (machines || []).map((m: any) => ({
          id: m.id || m._id,
          name: m.name,
          limits: m.limits || { xmin: 0, xmax: 0, ymin: 0, ymax: 0, zmin: 0, zmax: 0 },
        }));
        resolve(this._machines);
      });
    });
  }

  get machines(): MachineProfile[] {
    return this._machines;
  }

  // ── Validation helpers ──────────────────────────────────────

  private ensureConnected(): void {
    if (!this.socket || !this._connected) {
      throw new Error("Not connected to CNCjs server. Set CNCJS_URL and ensure CNCjs is running.");
    }
  }

  ensurePortOpen(): void {
    this.ensureConnected();
    if (!this._connectedPort) {
      throw new Error("No serial port is open. Use connect_to_port first.");
    }
  }

  isPortOpen(): boolean {
    return this._connected && this._connectedPort !== null;
  }
}

// Singleton instance
export const client = new CNCjsClient();
