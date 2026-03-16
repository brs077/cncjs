---
name: gcode-analyze
description: Analyze loaded G-code to extract bounding box, move counts, feed rates, spindle speeds, and tool information. Use when the user wants to verify or inspect G-code before running it.
---

# G-code Analysis

Analyze G-code without any machine interaction — pure computation, zero risk.

## Available Tools

- **analyze_gcode** — Analyze the currently loaded G-code file. Returns:
  - Bounding box (X/Y/Z min/max)
  - Total line count and move counts (rapid vs. cutting)
  - Feed rate range (min/max)
  - Spindle speed range (min/max)
  - Tool numbers used
  - Estimated metrics

## Workflow

1. Load G-code with `load_gcode` first
2. Run `analyze_gcode` to inspect
3. Verify the bounding box fits within the machine's work area
4. Check that feed rates and spindle speeds are appropriate
5. Proceed with `start_job` if everything looks correct

## Notes

- Requires G-code to be loaded first via `load_gcode`
- This is a read-only analysis — no machine interaction or risk
- Use the bounding box to verify the job fits within your material and machine limits
