---
name: cnc-control
description: Control CNC machine operations including sending G-code, running jobs, jogging, homing, and adjusting overrides. Use when the user wants to move the machine, run a job, home, jog, set work zero, control the spindle, or adjust feed/spindle overrides.
---

# CNC Machine Control

Control the CNC machine's physical operations. **These tools cause real physical motion — always confirm with the user before executing.**

## Available Tools

- **send_gcode** — Send one or more G-code lines directly to the machine (HIGH RISK)
- **load_gcode** — Load G-code content into CNCjs for execution
- **start_job** — Start executing the loaded G-code program
- **pause_job** — Pause the running job (feed hold)
- **resume_job** — Resume a paused job (cycle start)
- **stop_job** — Stop and cancel the running job
- **home_machine** — Execute GRBL homing cycle ($H)
- **unlock_machine** — Clear alarm lock ($X)
- **jog** — Jog the machine in any axis at a specified feed rate
- **set_feed_override** — Adjust real-time feed rate override (percentage)
- **set_spindle_override** — Adjust real-time spindle speed override (percentage)
- **set_work_zero** — Set current position as work zero for specified axes
- **spindle_control** — Turn spindle on (CW/CCW) or off with speed
- **coolant_control** — Toggle flood or mist coolant
- **set_wcs** — Switch active work coordinate system (G54-G59)
- **probe_z** — Run a Z-axis probe cycle for tool length offset
- **run_macro** — Execute a saved CNCjs macro by name or ID (HIGH RISK)

## Safety

- Always confirm with the user before sending G-code or starting jobs
- Verify work zero is set correctly before cutting operations
- Use jog for manual positioning — it supports incremental moves
- Monitor feed and spindle overrides during operation
- Use `emergency_stop` or `feed_hold` if anything goes wrong
