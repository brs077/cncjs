---
name: gcode-analyze
description: Analyze G-code for bounding box, move counts, feed rates, spindle speeds, and tool usage. Use when the user wants to verify G-code before running, check dimensions, or understand a G-code file.
---

# G-code Analysis

Analyze loaded G-code without any machine interaction. Completely safe — no motion or state changes.

## Available MCP Tools

- `analyze_gcode` — Parse the currently loaded G-code and extract:
  - **Bounding box** (X/Y/Z min/max) — verify the cut fits the workpiece
  - **Move counts** — number of rapid (G0) and cutting (G1/G2/G3) moves
  - **Feed rates** — all feed rates used in the program
  - **Spindle speeds** — all spindle speeds used
  - **Tool changes** — any T commands in the program
  - **Estimated run time** — based on move distances and feed rates

## Workflow

1. Load G-code with `load_gcode` first
2. Run `analyze_gcode` to inspect it
3. Check that the bounding box fits within the machine's work area
4. Verify feed rates and spindle speeds are appropriate for the material
5. Proceed with `start_job` if everything looks correct

## Tips

- Compare the bounding box against your workpiece dimensions
- Check for unexpected Z depths that could damage the spoilboard
- Look for very high or very low feed rates that might indicate errors
