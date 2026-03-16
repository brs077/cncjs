---
description: Connect to CNC machine and verify it's ready
disable-model-invocation: true
---

Help me connect to my CNC machine:

1. Use `list_serial_ports` to find available ports
2. Show me the ports and ask which one to connect to (if multiple)
3. Connect with `connect_to_port` at 115200 baud for Grbl
4. Verify with `get_machine_state`
5. If the machine is in Alarm state, offer to unlock or home it
6. Report the machine's current position and state

$ARGUMENTS
