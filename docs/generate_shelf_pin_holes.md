# generate_shelf_pin_holes

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No (if autoLoad=false), Yes (if autoLoad=true)

## Description
Generates G-code for shelf pin hole patterns. Drills two parallel columns of evenly spaced holes for adjustable shelf pins, following the industry-standard 32mm system. Used in bookcases, cabinets, and entertainment centers.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| panelHeight | number | Yes | - | Height of the side panel (mm) |
| holeSpacing | number | No | 32 | Vertical spacing between holes (mm, 32mm is industry standard) |
| rowSpacing | number | Yes | - | Horizontal distance between the two columns of holes (mm) |
| holeDepth | number | No | 12 | Depth of each pin hole (mm) |
| holeDiameter | number | No | 5 | Diameter of shelf pin holes (mm, 5mm is standard) |
| marginTop | number | No | 50 | Distance from top of panel to first hole (mm) |
| marginBottom | number | No | 50 | Distance from bottom of panel to last hole (mm) |
| startX | number | No | 0 | Starting X position — left column (mm) |
| startY | number | No | 0 | Starting Y position — bottom of panel (mm) |
| toolDiameter | number | Yes | - | Drill bit diameter (mm) |
| wood | string | No | plywood | Wood type for automatic feed/speed selection |
| feedrate | number | No | auto | Override drilling feed rate (mm/min) |
| spindleSpeed | number | No | auto | Override spindle speed (RPM) |
| autoLoad | boolean | No | true | Automatically load into CNCjs |

## Returns
Generated G-code string containing the complete shelf pin drilling program.

## Usage Notes
- The 32mm spacing is the industry standard compatible with commercial shelf pins and supports.
- Peck drilling (3mm pecks) is used automatically for clean holes and chip clearing.
- Drilling feed rate is automatically set to 50% of the wood preset's cutting feed rate.
- Use a 5mm brad-point or spiral drill bit for cleanest results in wood.
