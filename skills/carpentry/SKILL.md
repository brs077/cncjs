---
name: carpentry
description: Generate wood joinery toolpaths, calculate material requirements, and get recommended cutting parameters for wood species. Use when the user wants to create finger joints, dado joints, rabbet joints, mortises, shelf pin holes, or plan a woodworking project.
---

# Carpentry & Woodworking

Generate CNC toolpaths for traditional wood joinery and plan woodworking projects with material calculations.

## Available MCP Tools

### Joinery

- `generate_finger_joint` — Cut interlocking box/finger joints along a board edge. Creates evenly spaced rectangular tabs for strong glue joints without fasteners. Great for boxes, drawers, and decorative corners.
- `generate_dado_joint` — Cut a rectangular channel (groove) into a board to receive another board edge. The go-to joint for fixed shelving, cabinet dividers, and bookcase construction.
- `generate_rabbet_joint` — Cut a step/ledge along a board edge for overlapping joints. Commonly used for drawer backs, cabinet backs, and panel frames.
- `generate_mortise` — Cut a rectangular pocket for mortise-and-tenon joinery. The strongest traditional wood joint, used for table legs, door frames, and structural connections.

### Drilling

- `generate_shelf_pin_holes` — Drill two parallel columns of holes for adjustable shelf pins. Standard 32mm system compatible with commercial shelf pins and supports.

### Planning

- `get_wood_settings` — Look up recommended CNC feed rates, spindle speeds, and step-down values for 10 wood types (pine, oak, walnut, maple, cherry, birch, cedar, plywood, MDF, bamboo).
- `calculate_material` — Compute board feet, sheet goods needed, cut lists, and waste estimates for project planning.

## Supported Wood Types

All joinery tools accept a `wood` parameter for automatic feed/speed selection:

| Wood | Hardness | Best For |
|------|----------|----------|
| Pine | Soft | Framing, basic projects |
| Cedar | Soft | Outdoor furniture, decks |
| Cherry | Medium | Fine furniture, cabinets |
| Walnut | Medium | Premium furniture, accents |
| Birch | Hard | Cabinetry, plywood projects |
| Oak | Hard | Furniture, flooring |
| Maple | Very Hard | Cutting boards, countertops |
| Bamboo | Hard | Cutting boards, decorative |
| Plywood | Varies | Cabinets, shelving |
| MDF | Medium | Painted projects, templates |

## Workflow

1. Discuss the project with the user (what are they building?)
2. Use `calculate_material` to plan material purchases
3. Use `get_wood_settings` to verify cutting parameters
4. Generate joinery toolpaths with the appropriate joint tools
5. Use `analyze_gcode` to verify bounding box and moves
6. Use `load_gcode` and `start_job` to execute on the CNC

## Tips

- Always verify generated G-code bounds fit the workpiece
- For finger joints, finger width should be 2-3x the material thickness for best strength
- Dado depth should be 1/3 to 1/2 the board thickness
- Mortise depth should be 2/3 to 3/4 the receiving member thickness
- Use conservative feeds for hardwoods — the presets are a starting point
- Test cuts in scrap wood before committing to the final piece
