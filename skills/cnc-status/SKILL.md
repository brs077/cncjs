---
name: cnc-status
description: Query CNC machine state, position, settings, and job progress. Use when the user asks about machine status, position, settings, or wants to monitor a running job.
---

# CNC Machine Status & Monitoring

Query the current state of the CNC machine. All tools are read-only and safe to use at any time.

## Available MCP Tools

- `get_machine_state` — Full GRBL state: positions, feed rate, spindle speed, overrides, buffer status
- `get_machine_position` — Current machine and work coordinates (X, Y, Z)
- `get_work_coordinate_offset` — Work coordinate system offsets (G54-G59)
- `get_machine_settings` — All GRBL `$` settings with descriptions and units
- `get_parser_state` — Active G-code modal state (units, distance mode, feed rate mode, etc.)
- `get_loaded_gcode` — Currently loaded G-code content and metadata
- `get_job_progress` — Job progress: lines sent/total, elapsed time, estimated remaining
- `get_workflow_state` — CNCjs workflow state (idle, running, paused)
- `get_feeder_status` — G-code feeder queue status
- `get_console_output` — Recent serial console messages (last 200 lines)
- `get_alarm_info` — Decode GRBL alarm codes with descriptions and solutions
- `get_error_info` — Decode GRBL error codes with descriptions
- `list_macros` — List all CNCjs macros
- `list_machines` — List configured machine profiles

## Tips

- Use `get_machine_state` for a comprehensive snapshot
- Use `get_job_progress` to monitor running jobs
- Use `get_alarm_info` when the machine enters an alarm state
- Use `get_console_output` to debug communication issues
