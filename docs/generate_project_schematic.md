# generate_project_schematic

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No

## Description
Generates an SVG schematic drawing showing each part of a woodworking project with accurate dimensions, grain direction arrows, and joinery feature locations. Creates a visual shop reference that can be printed or viewed on screen.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| projectName | string | Yes | - | Project name for the title block |
| parts | array | Yes | - | Parts to draw with dimensions and features |
| columns | number | No | 2 | Number of columns in the layout (1-4) |
| scale | number | No | 0.5 | Drawing scale relative to real size |
| outputPath | string | Yes | - | File path to save the SVG schematic |

### Part Object Properties
| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| name | string | Yes | - | Part name |
| length | number | Yes | - | Part length (mm) |
| width | number | Yes | - | Part width (mm) |
| thickness | number | Yes | - | Part thickness (mm) |
| features | array | No | [] | Joinery features to show on the part |

### Feature Object Properties
| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | string | Yes | - | Feature type: `dado`, `rabbet`, `mortise`, `hole`, `chamfer` |
| x | number | Yes | - | X position relative to part origin (mm) |
| y | number | Yes | - | Y position relative to part origin (mm) |
| width | number | No | 10 | Feature width (mm) |
| height | number | No | 10 | Feature height/length (mm) |
| diameter | number | No | - | Hole diameter (mm, for hole type) |
| depth | number | No | - | Feature depth (mm) |
| label | string | No | - | Label text for the feature |

## Returns
SVG file saved to the specified path. The SVG includes a title block, dimensioned part outlines, grain direction indicators, and labeled joinery features.

## Usage Notes
- Parts are laid out in a grid; use `columns` to control the layout width.
- Scale 0.5 (default) means 1mm in the drawing = 0.5mm on screen, suitable for most projects.
- Features are drawn as shaded rectangles (dados, rabbets, mortises) or circles (holes) with optional labels.
- Grain direction is shown as a dashed arrow along the part length.
- Open the SVG in any web browser, Inkscape, or print directly for a shop reference.
