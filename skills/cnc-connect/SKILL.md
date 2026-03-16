---
name: cnc-connect
description: Connect to and manage CNC machine serial ports. Use when the user wants to connect to a CNC machine, list available serial ports, or disconnect from a machine.
---

# CNC Connection Management

Help the user connect to their CNC machine through CNCjs.

## Available Tools

- **list_serial_ports** — List all available serial ports on the system
- **connect_to_port** — Open a serial connection to a CNC controller (requires port path, optional baudrate defaulting to 115200, optional controllerType defaulting to Grbl)
- **disconnect_port** — Close the current serial connection

## Workflow

1. First use `list_serial_ports` to discover available ports
2. Use `connect_to_port` with the appropriate port path to establish a connection
3. Verify connection with `get_connection_status`

## Notes

- The CNCjs server must be running (default: http://localhost:8000)
- Default baud rate is 115200 for GRBL controllers
- Only one port can be connected at a time — disconnect before connecting to a different port
