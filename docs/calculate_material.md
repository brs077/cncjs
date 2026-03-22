# calculate_material

**Category:** Carpentry
**Risk Level:** None
**Requires CNCjs:** No

## Description
Calculates wood material requirements for a carpentry project. Computes board feet (for solid lumber), number of sheet goods needed, cut lists, and waste estimates to help plan material purchases.

## Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| parts | array | Yes | - | List of parts with name, length, width, thickness, and quantity |
| stockLength | number | No | 2440 | Available stock length (mm, default 2440mm / 8ft) |
| stockWidth | number | No | 1220 | Available stock width (mm, default 1220mm / 4ft) |
| kerfWidth | number | No | 3.2 | Saw blade kerf / CNC tool width (mm) |
| wasteMargin | number | No | 10 | Extra waste margin percentage (0-50%) |

## Returns
JSON object with:
- `cutList`: Detailed list of all parts with dimensions and areas
- `summary`: Total parts count, total area, board feet, sheets needed, and waste estimate

## Usage Notes
- Board feet are calculated using the standard formula: (L × W × T) / 144 (in inches).
- Sheet count assumes standard 4×8 ft (1220×2440mm) sheet goods by default.
- The kerf width is added to each dimension when calculating material needed.
- Use the waste margin to account for defects, grain matching, and cutting errors — 10% is typical, use 15-20% for figured or expensive woods.
