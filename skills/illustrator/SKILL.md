---
name: illustrator
description: Generate Adobe Illustrator ExtendScript (.jsx) files for design automation and SVG/DXF export for CNC. Use when the user wants to automate Illustrator, create designs programmatically, or export Illustrator artwork for CNC cutting.
---

# Adobe Illustrator Integration

Generate ExtendScript (.jsx) files to automate Adobe Illustrator for design-to-manufacturing workflows.

## Available Tools

- **generate_illustrator_script** — Generate an Illustrator ExtendScript for:
  - Creating shapes, paths, text, and compound paths
  - Applying colors, strokes, and effects
  - Arranging and transforming artwork
  - Parameters: description, elements, documentSize, outputPath
- **generate_illustrator_export_script** — Generate an export script to:
  - Export artwork as SVG, DXF, PDF, or PNG
  - Configure export settings (precision, units, artboard handling)
  - Batch export multiple formats
  - Parameters: exportFormat, settings, outputPath
- **list_illustrator_scripts** — List previously generated Illustrator scripts

## Workflow

1. Discuss the design requirements with the user
2. Generate the creation script to build the artwork
3. Generate an export script to save as SVG or DXF
4. Use the exported file with CNC G-code generation tools

## Notes

- Scripts use ExtendScript (.jsx), run via File > Scripts > Other Script
- Units default to millimeters for CNC compatibility
- Export to SVG or DXF for direct use in CNC workflows
