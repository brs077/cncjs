---
name: cnc-control
description: Control CNC machine operations including jogging, homing, G-code sending, job management, and spindle/coolant control. Use when the user wants to move the machine, run jobs, or adjust overrides.
---

# CNC Machine Control

Control the CNC machine. These tools cause physical motion — always confirm with the user before executing.

## Available MCP Tools

### Motion & Setup
- `send_gcode` — Send raw G-code lines to the machine (HIGH RISK — causes motion)
- `home_machine` — Run GRBL homing cycle ($H)
- `unlock_machine` — Clear GRBL alarm lock ($X)
- `jog` — Jog the machine in X/Y/Z at a specified feed rate
- `set_work_zero` — Set current position as work zero for specified axes
- `set_wcs` — Switch active work coordinate system (G54-G59)
- `probe_z` — Run Z-axis touch probe cycle

### Job Control
- `load_gcode` — Load G-code content into CNCjs
- `start_job` — Start executing loaded G-code
- `pause_job` — Pause the running job
- `resume_job` — Resume a paused job
- `stop_job` — Stop and cancel the current job

### Overrides
- `set_feed_override` — Adjust feed rate override (percentage)
- `set_spindle_override` — Adjust spindle speed override (percentage)

### Actuators
- `spindle_control` — Turn spindle on (CW/CCW with speed) or off
- `coolant_control` — Turn flood/mist coolant on or off

### Macros
- `run_macro` — Execute a CNCjs macro by name or ID

## Safety

- Always confirm motion commands with the user
- Check machine position before jogging
- Use `feed_hold` or `emergency_stop` if something goes wrong
- Verify work zero is set correctly before starting jobs
