---
description: Generate G-code to cut a shape with guided parameter input
---

# Cut Shape Workflow

Help me cut a shape on my CNC. Walk me through these parameters:

1. **Shape**: What shape? (rectangle, circle)
2. **Dimensions**: Size in mm
3. **Material**: What material? (determines feeds/speeds)
4. **Depth**: Total cut depth in mm
5. **Tool**: End mill diameter in mm

Based on my answers:
- Calculate appropriate feed rate and spindle speed for the material
- Set step-down per pass (no more than 50% of tool diameter for wood, 25% for metal)
- Generate the G-code with `generate_gcode_profile`
- Analyze the result with `analyze_gcode`
- Show me the key parameters and ask for confirmation before loading

$ARGUMENTS
