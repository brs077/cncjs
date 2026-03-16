---
name: cnc-connect
description: Connect to a CNC machine via CNCjs. Use when the user wants to connect, disconnect, list serial ports, or set up a CNC connection.
---

# CNC Connection Management

Help the user connect to their CNC machine through CNCjs.

## Available MCP Tools

- `list_serial_ports` — List available serial ports to find the CNC controller
- `connect_to_port` — Open a serial connection (port, baudrate, controllerType)
- `disconnect_port` — Close the current serial connection
- `get_connection_status` — Check if connected to CNCjs and which serial port is active

## Workflow

1. First use `list_serial_ports` to discover available ports
2. Use `connect_to_port` with the correct port path (e.g., `/dev/cu.usbmodem14201` on macOS, `COM3` on Windows)
3. Default baudrate is 115200, default controller is Grbl
4. Verify connection with `get_connection_status`

## Environment

- CNCjs server must be running (default: `http://localhost:8000`)
- Set `CNCJS_URL` environment variable if CNCjs is on a different host/port
- Set `CNCJS_TOKEN` for authenticated CNCjs instances
