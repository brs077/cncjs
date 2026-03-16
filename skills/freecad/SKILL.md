---
name: freecad
description: Generate FreeCAD Python scripts for 3D modeling and CAM toolpath generation. Use when the user wants to create 3D models or generate CAM toolpaths using FreeCAD (open-source CAD/CAM).
---

# FreeCAD Integration

Generate Python scripts for FreeCAD's headless or GUI modes for 3D modeling and CAM.

## Available MCP Tools

- `generate_freecad_model` — Generate a Python script to create 3D models in FreeCAD. Supports:
  - Part primitives (boxes, cylinders, spheres, cones, tori)
  - Boolean operations (union, cut, intersection)
  - Sketch-based features (extrude, revolve, pocket)
  - Export to STEP, STL, or other formats
  - Headless mode for automated workflows (`freecadcmd script.py`)
- `generate_freecad_cam` — Generate a Python script for FreeCAD Path workbench (CAM). Creates:
  - Profile, pocket, drilling, and facing operations
  - Tool definitions with geometry
  - Stock definition from bounding box
  - G-code post-processing
- `list_freecad_scripts` — List previously generated FreeCAD scripts

## Script Execution

- **GUI mode**: Run inside FreeCAD's Python console
- **Headless mode**: `freecadcmd script.py` (no display needed, great for automation)

## Workflow

1. Discuss part geometry and machining requirements
2. Generate the 3D model script with `generate_freecad_model`
3. Generate CAM toolpaths with `generate_freecad_cam`
4. Run scripts in FreeCAD to produce G-code
5. Load G-code with `load_gcode` for execution
