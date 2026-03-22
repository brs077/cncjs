# get_wood_settings

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No

## Description
Returns recommended CNC cutting parameters for a specific wood type or lists all available wood presets. Includes feed rate, spindle speed, and step-down values. Optionally adjusts recommendations based on tool diameter.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| wood | string | No | - | Specific wood type to query. Omit to list all presets. |
| toolDiameter | number | No | - | Tool diameter (mm) — adjusts recommendations for the specific bit size |

## Returns
JSON object with cutting parameters. When a specific wood is queried with a tool diameter, includes adjusted step-down and chip load calculation.

## Usage Notes
- Supported wood types: pine, oak, walnut, maple, cherry, birch, cedar, plywood, mdf, bamboo.
- The presets assume a 2-flute end mill. Adjust feed rates for different flute counts.
- These are starting-point recommendations — always test on scrap first.
- Chip load is calculated for a 2-flute cutter when toolDiameter is provided.
