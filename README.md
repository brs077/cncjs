# CNC-design-control-MCP

MCP server for CNC design, CAM generation, and GRBL machine control (FoxAlien XE Ultra).

## Architecture

```
Claude Code ←stdio/MCP→ CNC-design-control-MCP (Node.js) ←Socket.IO v1→ CNCjs :8000 ←USB Serial→ GRBL
```

## Tools (56 total)

### Read-Only / Query (17)
`list_serial_ports`, `get_connection_status`, `get_machine_state`, `get_machine_position`, `get_work_coordinate_offset`, `get_machine_settings`, `get_parser_state`, `get_loaded_gcode`, `get_job_progress`, `get_workflow_state`, `get_feeder_status`, `list_macros`, `list_machines`, `get_alarm_info`, `get_console_output`, `get_error_info`, `analyze_gcode`

### Connection (2)
`connect_to_port`, `disconnect_port`

### Control (16)
`send_gcode`, `load_gcode`, `start_job`, `pause_job`, `resume_job`, `stop_job`, `home_machine`, `unlock_machine`, `jog`, `set_feed_override`, `set_spindle_override`, `set_work_zero`, `spindle_control`, `coolant_control`, `set_wcs`, `probe_z`

### Safety (3)
`emergency_stop` (soft reset 0x18), `feed_hold`, `jog_cancel`

### Management (1)
`run_macro`

### G-code Generation (4)
`generate_gcode_profile` — cut 2D shapes (circle, rectangle, custom path)
`generate_gcode_pocket` — clear rectangular or circular pockets
`generate_gcode_drill` — drilling patterns (grid, circle, custom) with peck support
`generate_gcode_facing` — surface facing/leveling

### Design File Generation (2)
`generate_svg` — create SVG files for import into Carveco/Fusion 360
`generate_dxf` — create DXF R12 files for CAM software import

### Fusion 360 Integration (2)
`generate_fusion_script` — generate Python API scripts for Fusion 360 (sketch, extrude, revolve, fillet, chamfer, export, CAM setup)
`list_fusion_scripts` — list previously generated scripts

### FreeCAD Integration (3)
`generate_freecad_model` — generate Python scripts for headless 3D modeling (box, cylinder, sphere, cone, sketch, extrude, boolean ops, export STEP/STL)
`generate_freecad_cam` — generate CAM toolpath scripts with G-code export (profile, pocket, drill, face operations)
`list_freecad_scripts` — list previously generated FreeCAD scripts

### Adobe Illustrator Integration (3)
`generate_illustrator_script` — generate ExtendScript (.jsx) for vector artwork (rectangle, circle, polygon, star, text, paths, export to SVG/DXF/PDF)
`generate_illustrator_export_script` — batch export current document to SVG/DXF/PDF/EPS with text-to-outlines option
`list_illustrator_scripts` — list previously generated Illustrator scripts

### Marketplace & Packaging (3)
`package_design` — bundle designs into marketplace-ready packages (multi-format files, preview images, README, listing metadata, zip archive)
`generate_listing_description` — generate SEO-optimized listing descriptions for Etsy, Cults3D, or Gumroad
`convert_design_format` — convert between formats (SVG↔DXF, G-code→SVG preview)

## Windows PC Setup for CNCjs

1. **Node.js** (LTS recommended, v18+) — download from https://nodejs.org
2. **CNCjs** — install via npm after Node.js is set up:
   ```
   npm install -g cncjs
   ```
   Or download the desktop app installer from the CNCjs GitHub releases page.

3. **USB/Serial driver for your FoxAlien XE Ultra** — likely one of:
   - **CH340** driver (most common on FoxAlien boards) — download from the manufacturer site
   - **CP210x** driver (if it uses a SiLabs chip)
   - Windows 10/11 may auto-install these, but if your board doesn't show up in Device Manager under "Ports (COM & LPT)", install the driver manually

**Quick start after install:**
```
cncjs
```
Then open `http://localhost:8000` in your browser. Your FoxAlien will show up as a COM port (e.g., `COM3`). Select it, set baud rate to `115200`, controller type `Grbl`, and connect.

**Optional but recommended:**
- **Chrome/Edge** — CNCjs web UI works best in Chromium browsers
- **Python** (sometimes needed for `node-gyp` native module builds during npm install)

## MCP Server Setup

```bash
npm install
npm run build
```

Register with Claude Code:
```bash
claude mcp add cnc-design-control-mcp node /path/to/CNC-design-control-MCP/build/index.js
```

### Environment Variables
- `CNCJS_URL` — CNCjs server URL (default: `http://localhost:8000`)
- `CNCJS_TOKEN` — Optional JWT token for CNCjs authentication
