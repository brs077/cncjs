# generate_finger_joint

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No (if autoLoad=false), Yes (if autoLoad=true)

## Description
Generates G-code for finger (box) joints along a board edge. Creates evenly spaced interlocking rectangular tabs for strong wood-to-wood glue joints without fasteners. Commonly used for boxes, drawers, and decorative corners.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| boardLength | number | Yes | - | Length of the board edge to joint (mm) |
| boardThickness | number | Yes | - | Thickness of the mating board — sets finger depth (mm) |
| fingerWidth | number | Yes | - | Width of each finger/tab (mm) |
| fingerCount | number | No | auto | Number of fingers (auto-calculated from boardLength/fingerWidth if omitted) |
| startX | number | No | 0 | Starting X position (mm) |
| startY | number | No | 0 | Starting Y position (mm) |
| toolDiameter | number | Yes | - | End mill diameter (mm) |
| wood | string | No | pine | Wood type for automatic feed/speed selection |
| feedrate | number | No | auto | Override cutting feed rate (mm/min) |
| spindleSpeed | number | No | auto | Override spindle speed (RPM) |
| autoLoad | boolean | No | true | Automatically load into CNCjs |

## Returns
Generated G-code string containing the complete finger joint cutting program.

## Usage Notes
- Finger width should be at least 2x the tool diameter for clean cuts.
- For best joint strength, finger width should be 2-3x the material thickness.
- The tool cuts alternating slots (every other finger) — the mating board needs the opposite pattern.
- Each slot is cleared with a raster pocket strategy using 40% tool stepover.
- Feed rates and spindle speeds are automatically selected based on the wood type.
