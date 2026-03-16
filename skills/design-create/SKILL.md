---
name: design-create
description: Generate SVG and DXF design files for CNC projects. Use when the user wants to create vector designs, templates, or technical drawings for laser cutting or CNC routing.
---

# Design File Generation

Generate SVG and DXF vector files for CNC and laser cutting projects.

## Available MCP Tools

- `generate_svg` — Create SVG files with shapes (rectangles, circles, lines, paths, text). Supports fill, stroke, transforms, and grouping. Ideal for laser cutting templates, design previews, and web-compatible vector art.
- `generate_dxf` — Create DXF files with geometric entities (lines, circles, arcs, polylines, text). Industry-standard CAD format compatible with most CNC and CAD software.

## SVG Capabilities

- Shapes: rectangles, circles, ellipses, lines, polylines, polygons, paths
- Styling: fill, stroke, stroke-width, opacity
- Transforms: translate, rotate, scale
- Text with font control
- Groups for organization

## DXF Capabilities

- Entities: lines, circles, arcs, polylines (2D and 3D), text
- Layers with color control
- Compatible with AutoCAD, Fusion 360, FreeCAD, Inkscape, and most CAM software

## Workflow

1. Discuss the design requirements with the user
2. Generate the design file in the appropriate format
3. The file can then be:
   - Imported into CAD/CAM software for toolpath generation
   - Used directly for laser cutting
   - Converted to G-code using `generate_gcode_profile` or CAM tools
