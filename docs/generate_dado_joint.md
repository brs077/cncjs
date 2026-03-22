# generate_dado_joint

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No (if autoLoad=false), Yes (if autoLoad=true)

## Description
Generates G-code for a dado (groove/channel) joint. Cuts a rectangular channel in one board to receive another board edge. The standard joint for fixed shelving, cabinet dividers, and bookcase construction.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| dadoLength | number | Yes | - | Length of the dado channel (mm) |
| dadoWidth | number | Yes | - | Width of the dado — should match mating board thickness (mm) |
| dadoDepth | number | Yes | - | Depth of the dado (mm) |
| startX | number | No | 0 | Starting X position (mm) |
| startY | number | No | 0 | Starting Y position (mm) |
| orientation | string | No | horizontal | Dado direction: `horizontal` or `vertical` |
| toolDiameter | number | Yes | - | End mill diameter (mm) |
| wood | string | No | pine | Wood type for automatic feed/speed selection |
| feedrate | number | No | auto | Override cutting feed rate (mm/min) |
| spindleSpeed | number | No | auto | Override spindle speed (RPM) |
| autoLoad | boolean | No | true | Automatically load into CNCjs |

## Returns
Generated G-code string containing the complete dado joint cutting program.

## Usage Notes
- Dado width must be at least the tool diameter. Use a smaller bit if needed.
- Standard dado depth is 1/3 to 1/2 the board thickness for structural integrity.
- The raster clearing pattern uses 40% tool stepover for a clean channel floor.
- Horizontal dados cut along X and step over in Y; vertical dados cut along Y and step over in X.
