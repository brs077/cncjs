---
name: design-create
description: Generate SVG and DXF design files for CNC cutting. Use when the user wants to create vector design files, export shapes as SVG or DXF, or prepare designs for laser cutting or CNC routing.
---

# Design File Generation

Generate vector design files (SVG, DXF) for CNC and laser cutting workflows.

## Available Tools

- **generate_svg** — Generate SVG files with shapes, text, and paths. Supports:
  - Rectangles, circles, ellipses, lines, polygons, polylines, paths, text
  - Custom dimensions, colors, stroke widths
  - Multiple elements in a single SVG
- **generate_dxf** — Generate DXF files compatible with CAD/CAM software. Supports:
  - Lines, circles, arcs, rectangles, polylines, text
  - Layer assignments for organizing geometry
  - Standard DXF format readable by most CAD software

## Workflow

1. Discuss the design requirements with the user
2. Generate the design file in the appropriate format
3. Files are saved to the specified output path
4. Optionally convert to G-code using the G-code generation tools

## Notes

- SVG files are ideal for web preview and laser cutting software
- DXF files are the standard interchange format for CAD/CAM workflows
- Use `convert_design_format` to convert between formats if needed
