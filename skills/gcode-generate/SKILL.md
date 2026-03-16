---
name: gcode-generate
description: Generate G-code toolpaths for CNC cutting operations including profiles, pockets, drilling, and facing. Use when the user wants to create G-code for cutting shapes, clearing pockets, drilling holes, or facing/leveling a surface.
---

# G-code Generation

Generate ready-to-run G-code toolpaths for common CNC operations.

## Available Tools

- **generate_gcode_profile** — Cut 2D shapes (rectangles, circles) with multi-pass step-down. Supports inside/outside/on-line cutting with tool radius compensation.
  - Parameters: shape, dimensions, depth, stepDown, feedRate, spindleSpeed, toolDiameter, cutSide
- **generate_gcode_pocket** — Clear rectangular or circular pockets with stepover pattern.
  - Parameters: shape, dimensions, depth, stepDown, stepOver, feedRate, spindleSpeed, toolDiameter
- **generate_gcode_drill** — Drilling patterns (single, grid, circular) with optional peck drilling.
  - Parameters: pattern, positions/grid/circle params, depth, peckDepth, feedRate, spindleSpeed
- **generate_gcode_facing** — Surface facing/leveling with raster pattern.
  - Parameters: width, height, stepOver, depth, feedRate, spindleSpeed, toolDiameter

## Workflow

1. Discuss the desired operation and material with the user
2. Generate the G-code with appropriate feeds, speeds, and depths
3. Use `analyze_gcode` to verify the result before loading
4. Load with `load_gcode` and optionally start with `start_job`

## Notes

- All generated G-code uses millimeters (G21) and absolute positioning (G90)
- Safe Z height is 5mm above the work surface
- Always verify feeds and speeds are appropriate for the material and tooling
