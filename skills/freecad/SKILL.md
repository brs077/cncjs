---
name: freecad
description: Generate FreeCAD Python scripts for parametric CAD modeling and CAM toolpath generation. Use when the user wants to create FreeCAD models, generate CAM toolpaths with FreeCAD's Path workbench, or automate FreeCAD workflows.
---

# FreeCAD Integration

Generate Python scripts for FreeCAD's API, supporting both GUI and headless (freecadcmd) operation.

## Available Tools

- **generate_freecad_model** — Generate a FreeCAD Python script for parametric 3D modeling:
  - Primitive shapes (boxes, cylinders, spheres, cones, tori)
  - Boolean operations (union, cut, intersection)
  - Sketches with constraints and pad/pocket features
  - Parameters: description, features, headless mode, outputPath
- **generate_freecad_cam** — Generate a FreeCAD Path workbench script for CAM:
  - Profile, pocket, drilling, and facing operations
  - Tool definitions and feed/speed settings
  - Post-processing to G-code
  - Parameters: description, operations, tool, outputPath
- **list_freecad_scripts** — List previously generated FreeCAD scripts

## Workflow

1. Discuss the model or CAM operation with the user
2. Generate the appropriate script
3. Run in FreeCAD GUI or headless with `freecadcmd <script.py>`
4. For CAM, post-process to G-code and load into CNCjs

## Notes

- FreeCAD is free and open-source — no license costs
- Headless mode enables fully automated CAD/CAM pipelines
- Path workbench generates G-code compatible with GRBL
