# generate_mortise

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No (if autoLoad=false), Yes (if autoLoad=true)

## Description
Generates G-code for a mortise (rectangular pocket for mortise-and-tenon joinery). The strongest traditional wood joint, used for table legs, door frames, and structural connections. The tenon is typically cut on a table saw and inserted into this CNC-cut mortise.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mortiseLength | number | Yes | - | Length of the mortise slot (mm) |
| mortiseWidth | number | Yes | - | Width of the mortise — should match tenon thickness (mm) |
| mortiseDepth | number | Yes | - | Depth of the mortise (mm) |
| centerX | number | No | 0 | Center X position (mm) |
| centerY | number | No | 0 | Center Y position (mm) |
| toolDiameter | number | Yes | - | End mill diameter — must be <= mortise width (mm) |
| wood | string | No | oak | Wood type for automatic feed/speed selection |
| feedrate | number | No | auto | Override cutting feed rate (mm/min) |
| spindleSpeed | number | No | auto | Override spindle speed (RPM) |
| autoLoad | boolean | No | true | Automatically load into CNCjs |

## Returns
Generated G-code string containing the complete mortise cutting program.

## Usage Notes
- The tool diameter must be less than or equal to the mortise width.
- Standard mortise depth is 2/3 to 3/4 of the receiving member thickness.
- Mortise width should match the tenon thickness for a snug fit.
- Uses raster pocket clearing with 40% tool stepover.
- Defaults to oak presets since mortise-and-tenon is most common in hardwoods.
