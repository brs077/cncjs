# generate_rabbet_joint

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No (if autoLoad=false), Yes (if autoLoad=true)

## Description
Generates G-code for a rabbet (rebate) joint. Cuts a step/ledge along a board edge for overlapping joints. Commonly used for drawer construction, cabinet backs, and panel frames.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| rabbetLength | number | Yes | - | Length along the board edge (mm) |
| rabbetWidth | number | Yes | - | Width of the rabbet step — typically matches mating board thickness (mm) |
| rabbetDepth | number | Yes | - | Depth of the rabbet (mm) |
| startX | number | No | 0 | Starting X position (mm) |
| startY | number | No | 0 | Starting Y position (mm) |
| edge | string | No | right | Which edge to rabbet: `top`, `bottom`, `left`, or `right` |
| toolDiameter | number | Yes | - | End mill diameter (mm) |
| wood | string | No | pine | Wood type for automatic feed/speed selection |
| feedrate | number | No | auto | Override cutting feed rate (mm/min) |
| spindleSpeed | number | No | auto | Override spindle speed (RPM) |
| autoLoad | boolean | No | true | Automatically load into CNCjs |

## Returns
Generated G-code string containing the complete rabbet joint cutting program.

## Usage Notes
- Rabbet depth is typically 1/2 to 2/3 of the board thickness.
- The `edge` parameter determines which side of the starting position the material is removed from.
- Uses raster pocket clearing with 40% tool stepover.
- Multi-pass step-down is applied automatically based on wood type preset.
