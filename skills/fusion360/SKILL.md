---
name: fusion360
description: Generate Fusion 360 Python API scripts for parametric CAD modeling and CAM toolpath generation. Use when the user wants to create Fusion 360 models, generate CAM toolpaths, or automate Fusion 360 workflows.
---

# Fusion 360 Integration

Generate Python scripts for the Fusion 360 API to automate CAD modeling and CAM operations.

## Available Tools

- **generate_fusion_script** — Generate a Fusion 360 Python API script for:
  - Parametric 3D modeling (sketches, extrusions, revolves, fillets, chamfers)
  - CAM setup and toolpath generation
  - Design automation and batch operations
  - Parameters: description, scriptType (model/cam/utility), features, outputPath
- **list_fusion_scripts** — List previously generated Fusion 360 scripts in the output directory

## Workflow

1. Discuss what the user wants to create in Fusion 360
2. Generate the script with appropriate features and parameters
3. User runs the script in Fusion 360: Scripts and Add-Ins > Scripts > Run
4. Optionally generate CAM toolpaths and post-process to G-code

## Notes

- Scripts are generated as Python files for the Fusion 360 API
- Users must have Fusion 360 installed to run generated scripts
- Scripts use `adsk.core` and `adsk.fusion` modules
- CAM scripts can generate toolpaths that export to G-code for this CNC setup
