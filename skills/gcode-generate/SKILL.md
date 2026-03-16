---
name: gcode-generate
description: Generate G-code toolpaths for CNC machining including profiles, pockets, drilling, and facing operations. Use when the user wants to create G-code for cutting shapes, clearing pockets, drilling holes, or facing surfaces.
---

# G-code Generation

Generate ready-to-run G-code toolpaths for common CNC operations.

## Available MCP Tools

- `generate_gcode_profile` — Cut 2D shapes (rectangle, circle, or custom points) with multi-pass step-down. Supports inside/outside/on-line cutting with tool radius compensation.
- `generate_gcode_pocket` — Clear rectangular or circular pockets with zigzag or spiral strategies. Multi-pass depth with configurable stepover.
- `generate_gcode_drill` — Drilling patterns (single, grid, circular, or custom coordinates) with optional peck drilling for chip clearing.
- `generate_gcode_facing` — Surface facing/leveling operations with configurable stepover and climb/conventional milling direction.

## Parameters Common to All

- `outputPath` — Where to save the generated `.nc` file
- `spindleSpeed` — RPM (default varies by operation)
- `feedRate` — Cutting feed rate in mm/min
- `depthOfCut` — Total depth to cut
- `stepDown` — Depth per pass
- `toolDiameter` — Cutter diameter in mm

## Workflow

1. Discuss the part geometry and material with the user
2. Determine appropriate feeds, speeds, and depths for the material
3. Generate the G-code with the appropriate tool
4. Use `analyze_gcode` to verify bounding box and moves
5. Use `load_gcode` to load into CNCjs for execution

## Tips

- Always verify the generated G-code bounds fit the workpiece
- Use conservative feeds and speeds for first cuts
- Step-down should typically be 1/2 to 1x tool diameter for wood, less for metal
