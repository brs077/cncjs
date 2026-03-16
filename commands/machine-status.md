---
description: Get a comprehensive CNC machine status report
disable-model-invocation: true
---

Get the full status of my CNC machine. Use these tools in order:

1. `get_connection_status` — check if connected
2. `get_machine_state` — full GRBL state
3. `get_machine_position` — current coordinates
4. `get_workflow_state` — idle/running/paused
5. If a job is running, also call `get_job_progress`

Present a clear summary with: connection status, machine state, position (both machine and work coordinates), and any active job progress.
