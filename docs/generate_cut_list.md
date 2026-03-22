# generate_cut_list

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No

## Description
Generates a detailed, formatted cut list for a woodworking project. Parts are grouped by material and thickness, with grain direction, edge banding requirements, and notes. Outputs a printable shop-ready text file or CSV for spreadsheet import.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| projectName | string | Yes | - | Name of the project |
| parts | array | Yes | - | List of parts with dimensions, material, grain, edge banding, and notes |
| outputPath | string | No | - | File path to save the cut list (.txt or .csv) |
| format | string | No | text | Output format: `text` for printable shop list, `csv` for spreadsheet import |

### Part Object Properties
| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| name | string | Yes | - | Part name (e.g., 'Side panel') |
| length | number | Yes | - | Part length along the grain (mm) |
| width | number | Yes | - | Part width across the grain (mm) |
| thickness | number | Yes | - | Part thickness (mm) |
| quantity | number | No | 1 | Number needed |
| material | string | No | plywood | Material type |
| grainDirection | string | No | length | Grain orientation: `length`, `width`, or `none` |
| edgeBanding | array | No | [] | Edges needing banding: `length1`, `length2`, `width1`, `width2` |
| notes | string | No | - | Additional fabrication notes |

## Returns
Formatted cut list as text or CSV. When outputPath is provided, the file is saved and the content is also returned.

## Usage Notes
- Parts are automatically grouped by material and thickness for efficient cutting.
- The text format includes a printable header, part numbering, and an edge banding length summary.
- Edge banding total length includes a 10% waste recommendation.
- Grain direction is shown as L (length), W (width), or - (none) in the text format.
- Use CSV format for import into Google Sheets or Excel for further editing.
