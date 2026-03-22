# generate_materials_list

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No

## Description
Generates a complete bill of materials (BOM) for a woodworking project. Covers all material categories: lumber and sheet goods, hardware (screws, hinges, pulls, slides), edge banding, finishing supplies (stains, topcoats, sandpaper), and adhesives. Includes estimated costs with subtotals and a project total.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| projectName | string | Yes | - | Project name |
| lumber | array | No | [] | Lumber and sheet goods with quantities and costs |
| hardware | array | No | [] | Hardware items (screws, hinges, pulls, etc.) |
| edgeBanding | array | No | [] | Edge banding materials with lengths |
| finishing | array | No | [] | Finishing supplies (stains, sealers, topcoats) |
| adhesives | array | No | [] | Glues and adhesives |
| outputPath | string | No | - | File path to save the materials list |
| format | string | No | text | Output format: `text` or `csv` |

### Lumber Item Properties
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| material | string | Yes | Material name (e.g., '3/4 Baltic Birch Plywood') |
| thickness | number | Yes | Thickness in mm |
| quantity | number | Yes | Amount needed |
| unit | string | Yes | Unit: `board_feet`, `sheets`, `linear_feet`, or `pieces` |
| unitCost | number | No | Cost per unit |

### Hardware Item Properties
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| item | string | Yes | Item name |
| quantity | number | Yes | Number needed |
| unitCost | number | No | Cost per item |
| supplier | string | No | Supplier/store name |

## Returns
Formatted materials list with all categories, subtotals, and estimated total cost. When outputPath is provided, the file is saved and content is also returned.

## Usage Notes
- All cost fields are optional — omit them if you just need a shopping list without prices.
- The text format produces a print-ready document organized by category with subtotals.
- CSV format can be imported into spreadsheets for editing and sharing.
- Hardware supplier notes appear in brackets in the text format.
- Combine with `generate_cut_list` for a complete project package.
