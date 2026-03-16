---
name: marketplace-package
description: Package CNC designs for selling on marketplaces like Etsy, Cults3D, and Gumroad. Use when the user wants to package designs for sale, generate listing descriptions, or convert between design file formats.
---

# Design Marketplace Packaging

Package CNC designs for distribution and monetization on online marketplaces.

## Available Tools

- **package_design** — Package a design with all required files for marketplace listing:
  - Bundles G-code, SVG, DXF, and preview images
  - Generates README with cutting instructions
  - Creates ZIP-ready directory structure
  - Parameters: designName, files, marketplace (etsy/cults3d/gumroad), outputPath
- **generate_listing_description** — Generate marketplace listing copy:
  - Title, description, tags, and feature bullets
  - Optimized for the target marketplace's format and SEO
  - Parameters: designName, description, marketplace, material, dimensions
- **convert_design_format** — Convert between design file formats:
  - SVG to DXF and DXF to SVG conversion
  - G-code to SVG preview rendering
  - Parameters: inputPath, outputFormat, outputPath

## Workflow

1. Create the design using G-code generation or design tools
2. Generate preview images (SVG) from the G-code
3. Package all files with `package_design`
4. Generate listing copy with `generate_listing_description`
5. Upload the package to the target marketplace

## Supported Marketplaces

- **Etsy** — Handmade and digital goods marketplace
- **Cults3D** — 3D printing and CNC design marketplace
- **Gumroad** — Digital products platform
