---
name: cnc-status
description: Query CNC machine state, position, settings, and job progress. Use when the user asks about machine status, position, settings, loaded G-code, job progress, workflow state, or console output.
---

# CNC Machine Status & Monitoring

Provide the user with current machine state and diagnostic information.

## Available Tools

- **get_connection_status** — Check if connected to CNCjs and which port
- **get_machine_state** — Full GRBL state: positions, feed, spindle, overrides, buffer
- **get_machine_position** — Current machine and work coordinates
- **get_work_coordinate_offset** — Work coordinate system offsets (G54-G59)
- **get_machine_settings** — All GRBL $-settings with descriptions
- **get_parser_state** — Active G-code parser state (modal groups)
- **get_loaded_gcode** — Currently loaded G-code file content
- **get_job_progress** — Job completion percentage, elapsed time, remaining lines
- **get_workflow_state** — Current workflow state (idle, running, paused)
- **get_feeder_status** — G-code feeder queue status
- **get_console_output** — Recent console messages (up to 200 lines)
- **list_macros** — List all CNCjs macros
- **list_machines** — List configured machine profiles
- **get_alarm_info** — Look up GRBL alarm code meaning
- **get_error_info** — Look up GRBL error code meaning

## Notes

- Most query tools require an active serial port connection
- All query tools are read-only and zero-risk
- Use `get_alarm_info` or `get_error_info` when the machine reports an alarm or error code
