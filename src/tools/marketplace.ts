// Marketplace tools: package designs for selling on Etsy, Cults3D, Gumroad, etc.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  writeFileSync, mkdirSync, existsSync, readdirSync,
  statSync, readFileSync, copyFileSync,
} from "fs";
import { join, resolve, basename, extname } from "path";
import { execSync } from "child_process";

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

function json(obj: unknown) {
  return text(JSON.stringify(obj, null, 2));
}

function err(s: string) {
  return { content: [{ type: "text" as const, text: s }], isError: true };
}

// ── SVG generation helpers (for preview images) ──────────

function gcodeToPreviewSvg(gcode: string, width: number, height: number): string {
  // Parse G-code and render toolpaths as SVG for preview
  const lines = gcode.split("\n");
  let currentX = 0, currentY = 0;
  let absoluteMode = true;
  const paths: { d: string; rapid: boolean }[] = [];
  let currentPath = "";
  let isRapid = true;

  for (const rawLine of lines) {
    const line = rawLine.split(";")[0].split("(")[0].trim().toUpperCase();
    if (!line) continue;

    if (line.includes("G90")) absoluteMode = true;
    if (line.includes("G91")) absoluteMode = false;

    const isG0 = /G0(?!\d)/.test(line);
    const isG1 = /G1(?!\d)/.test(line);
    const isG2 = /G[23](?!\d)/.test(line);

    if (!isG0 && !isG1 && !isG2) continue;

    const xMatch = line.match(/X([-\d.]+)/);
    const yMatch = line.match(/Y([-\d.]+)/);

    let newX = currentX, newY = currentY;
    if (xMatch) newX = absoluteMode ? parseFloat(xMatch[1]) : currentX + parseFloat(xMatch[1]);
    if (yMatch) newY = absoluteMode ? parseFloat(yMatch[1]) : currentY + parseFloat(yMatch[1]);

    const newRapid = isG0;
    if (newRapid !== isRapid && currentPath) {
      paths.push({ d: currentPath, rapid: isRapid });
      currentPath = "";
    }

    if (!currentPath) {
      currentPath = `M${currentX.toFixed(2)},${currentY.toFixed(2)}`;
    }
    currentPath += ` L${newX.toFixed(2)},${newY.toFixed(2)}`;
    isRapid = newRapid;
    currentX = newX;
    currentY = newY;
  }
  if (currentPath) {
    paths.push({ d: currentPath, rapid: isRapid });
  }

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of paths) {
    const coords = p.d.match(/[-\d.]+/g);
    if (!coords) continue;
    for (let i = 0; i < coords.length; i += 2) {
      const x = parseFloat(coords[i]);
      const y = parseFloat(coords[i + 1]);
      if (!isNaN(x) && !isNaN(y)) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 100; maxY = 100; }

  const margin = 10;
  const vbW = maxX - minX + margin * 2;
  const vbH = maxY - minY + margin * 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - margin} ${minY - margin} ${vbW} ${vbH}">\n`;
  svg += `  <rect x="${minX - margin}" y="${minY - margin}" width="${vbW}" height="${vbH}" fill="white"/>\n`;

  for (const p of paths) {
    if (p.rapid) {
      svg += `  <path d="${p.d}" fill="none" stroke="#cccccc" stroke-width="0.3" stroke-dasharray="2,2"/>\n`;
    } else {
      svg += `  <path d="${p.d}" fill="none" stroke="#2563eb" stroke-width="0.5"/>\n`;
    }
  }

  svg += `</svg>\n`;
  return svg;
}

function dxfToPreviewSvg(dxfContent: string, width: number, height: number): string {
  // Simple DXF to SVG preview — parse LINE and CIRCLE entities
  const svgPaths: string[] = [];
  const dxfLines = dxfContent.split("\n");

  let i = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  while (i < dxfLines.length) {
    if (dxfLines[i].trim() === "LINE") {
      let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
      i++;
      while (i < dxfLines.length && dxfLines[i].trim() !== "0") {
        const code = parseInt(dxfLines[i].trim());
        const val = dxfLines[i + 1]?.trim();
        if (code === 10) x1 = parseFloat(val);
        if (code === 20) y1 = parseFloat(val);
        if (code === 11) x2 = parseFloat(val);
        if (code === 21) y2 = parseFloat(val);
        i += 2;
      }
      svgPaths.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2563eb" stroke-width="0.5"/>`);
      minX = Math.min(minX, x1, x2); minY = Math.min(minY, y1, y2);
      maxX = Math.max(maxX, x1, x2); maxY = Math.max(maxY, y1, y2);
    } else if (dxfLines[i].trim() === "CIRCLE") {
      let cx = 0, cy = 0, r = 0;
      i++;
      while (i < dxfLines.length && dxfLines[i].trim() !== "0") {
        const code = parseInt(dxfLines[i].trim());
        const val = dxfLines[i + 1]?.trim();
        if (code === 10) cx = parseFloat(val);
        if (code === 20) cy = parseFloat(val);
        if (code === 40) r = parseFloat(val);
        i += 2;
      }
      svgPaths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2563eb" stroke-width="0.5"/>`);
      minX = Math.min(minX, cx - r); minY = Math.min(minY, cy - r);
      maxX = Math.max(maxX, cx + r); maxY = Math.max(maxY, cy + r);
    } else {
      i++;
    }
  }

  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 100; maxY = 100; }

  const margin = 10;
  const vbW = maxX - minX + margin * 2;
  const vbH = maxY - minY + margin * 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - margin} ${minY - margin} ${vbW} ${vbH}">\n`;
  svg += `  <rect x="${minX - margin}" y="${minY - margin}" width="${vbW}" height="${vbH}" fill="white"/>\n`;
  svg += svgPaths.map((p) => `  ${p}`).join("\n") + "\n";
  svg += `</svg>\n`;
  return svg;
}

export function registerMarketplaceTools(server: McpServer): void {
  // ── package_design ──────────────────────────────────────

  server.tool(
    "package_design",
    "Package a design into a marketplace-ready bundle with multiple formats, preview images, and a README. Ready for upload to Etsy, Cults3D, Gumroad, etc.",
    {
      name: z.string().describe("Design name (used for folder and file names)"),
      description: z.string().describe("Design description for the README and listing"),
      tags: z.array(z.string()).default([]).describe("Search tags for marketplace listing (e.g., ['cnc', 'wall art', 'woodworking'])"),
      sourceFiles: z.array(z.string()).min(1).describe("Paths to source design files to include (SVG, DXF, G-code, AI, STL, etc.)"),
      outputDir: z.string().describe("Directory to create the package in"),
      dimensions: z.object({
        width: z.number().positive().optional().describe("Design width (mm)"),
        height: z.number().positive().optional().describe("Design height (mm)"),
        depth: z.number().positive().optional().describe("Material thickness / cut depth (mm)"),
      }).default({}).describe("Design dimensions for the README"),
      materials: z.array(z.string()).default([]).describe("Recommended materials (e.g., ['plywood 3mm', 'acrylic 5mm', 'MDF'])"),
      tools: z.array(z.string()).default([]).describe("Recommended tools/bits (e.g., ['1/8\" flat end mill', '60° V-bit'])"),
      license: z.enum([
        "personal_use",
        "commercial_use",
        "personal_and_commercial",
        "creative_commons_by",
        "creative_commons_by_nc",
      ]).default("personal_and_commercial").describe("License type for the design"),
      price: z.string().optional().describe("Suggested price (e.g., '$4.99')"),
      generatePreview: z.boolean().default(true).describe("Generate SVG preview images from design files"),
      createZip: z.boolean().default(true).describe("Create a .zip archive of the package (requires zip command)"),
    },
    async ({ name, description, tags, sourceFiles, outputDir, dimensions, materials, tools, license, price, generatePreview, createZip }) => {
      try {
        const packageDir = resolve(outputDir, slugify(name));
        const filesDir = join(packageDir, "files");
        const previewDir = join(packageDir, "preview");

        // Create directory structure
        mkdirSync(filesDir, { recursive: true });
        if (generatePreview) {
          mkdirSync(previewDir, { recursive: true });
        }

        // Copy source files and generate previews
        const includedFiles: string[] = [];
        const formatSet = new Set<string>();

        for (const srcPath of sourceFiles) {
          const absPath = resolve(srcPath);
          if (!existsSync(absPath)) {
            return err(`Source file not found: ${absPath}`);
          }

          const fileName = basename(absPath);
          const ext = extname(absPath).toLowerCase();
          const destPath = join(filesDir, fileName);

          copyFileSync(absPath, destPath);
          includedFiles.push(fileName);
          formatSet.add(ext.replace(".", "").toUpperCase());

          // Generate preview SVGs
          if (generatePreview) {
            const content = readFileSync(absPath, "utf-8");

            if (ext === ".nc" || ext === ".gcode" || ext === ".ngc" || ext === ".tap") {
              const previewSvg = gcodeToPreviewSvg(content, 800, 600);
              writeFileSync(join(previewDir, `${fileName}_preview.svg`), previewSvg, "utf-8");
            } else if (ext === ".dxf") {
              const previewSvg = dxfToPreviewSvg(content, 800, 600);
              writeFileSync(join(previewDir, `${fileName}_preview.svg`), previewSvg, "utf-8");
            } else if (ext === ".svg") {
              // SVG is its own preview — just copy
              copyFileSync(absPath, join(previewDir, `${fileName}_preview.svg`));
            }
          }
        }

        // Generate README
        const licenseText: Record<string, string> = {
          personal_use: "Personal Use Only — This design is for personal, non-commercial use only. You may not sell products made from this design.",
          commercial_use: "Commercial License — You may use this design to create and sell physical products. You may NOT redistribute the digital files.",
          personal_and_commercial: "Personal & Commercial License — You may use this design for personal projects and to create and sell physical products. You may NOT redistribute the digital files.",
          creative_commons_by: "Creative Commons Attribution 4.0 (CC BY) — You may share, adapt, and use commercially with attribution.",
          creative_commons_by_nc: "Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC) — You may share and adapt for non-commercial purposes with attribution.",
        };

        let readme = `# ${name}\n\n`;
        readme += `${description}\n\n`;

        if (dimensions.width || dimensions.height || dimensions.depth) {
          readme += `## Dimensions\n`;
          if (dimensions.width) readme += `- Width: ${dimensions.width}mm\n`;
          if (dimensions.height) readme += `- Height: ${dimensions.height}mm\n`;
          if (dimensions.depth) readme += `- Depth / Material Thickness: ${dimensions.depth}mm\n`;
          readme += `\n`;
        }

        readme += `## Included Files\n`;
        readme += `Formats: ${Array.from(formatSet).join(", ")}\n\n`;
        for (const f of includedFiles) {
          readme += `- \`${f}\`\n`;
        }
        readme += `\n`;

        if (materials.length > 0) {
          readme += `## Recommended Materials\n`;
          for (const m of materials) readme += `- ${m}\n`;
          readme += `\n`;
        }

        if (tools.length > 0) {
          readme += `## Recommended Tools\n`;
          for (const t of tools) readme += `- ${t}\n`;
          readme += `\n`;
        }

        readme += `## How to Use\n`;
        readme += `1. Open the design file in your preferred CAM software (Carveco, Fusion 360, Easel, VCarve, etc.)\n`;
        readme += `2. Set up your material dimensions and work zero\n`;
        readme += `3. Configure toolpaths if using SVG/DXF (or use the included G-code directly)\n`;
        readme += `4. Run the job on your CNC machine\n\n`;

        if (formatSet.has("NC") || formatSet.has("GCODE") || formatSet.has("NGC") || formatSet.has("TAP")) {
          readme += `### G-code Notes\n`;
          readme += `- The included G-code is generated for GRBL controllers\n`;
          readme += `- Review feed rates and spindle speeds before running\n`;
          readme += `- Always do a dry run (air cut) first\n\n`;
        }

        readme += `## License\n`;
        readme += `${licenseText[license]}\n\n`;

        readme += `## Support\n`;
        readme += `If you have questions or issues with this design, please contact the seller.\n`;

        writeFileSync(join(packageDir, "README.md"), readme, "utf-8");
        writeFileSync(join(packageDir, "README.txt"), readme, "utf-8"); // .txt for buyers who can't read .md

        // Generate marketplace listing metadata
        const listing = {
          title: name,
          description: description,
          tags: tags,
          formats: Array.from(formatSet),
          files: includedFiles,
          dimensions: dimensions,
          materials: materials,
          tools: tools,
          license: license,
          suggestedPrice: price || null,
        };
        writeFileSync(join(packageDir, "listing.json"), JSON.stringify(listing, null, 2), "utf-8");

        // Create zip if requested
        let zipPath: string | null = null;
        if (createZip) {
          zipPath = `${packageDir}.zip`;
          try {
            execSync(`cd "${resolve(outputDir)}" && zip -r "${basename(packageDir)}.zip" "${basename(packageDir)}"`, { stdio: "pipe" });
          } catch {
            // zip not available — try tar
            try {
              execSync(`cd "${resolve(outputDir)}" && tar -czf "${basename(packageDir)}.tar.gz" "${basename(packageDir)}"`, { stdio: "pipe" });
              zipPath = `${packageDir}.tar.gz`;
            } catch {
              zipPath = null;
            }
          }
        }

        // Summary
        const previewFiles = generatePreview && existsSync(previewDir)
          ? readdirSync(previewDir)
          : [];

        let summary = `Design package created: ${packageDir}\n\n`;
        summary += `Contents:\n`;
        summary += `  files/        ${includedFiles.length} design files (${Array.from(formatSet).join(", ")})\n`;
        if (previewFiles.length > 0) {
          summary += `  preview/      ${previewFiles.length} preview images\n`;
        }
        summary += `  README.md     Product description & instructions\n`;
        summary += `  README.txt    Plain text version\n`;
        summary += `  listing.json  Marketplace metadata\n`;
        if (zipPath) {
          summary += `\nArchive: ${zipPath}\n`;
        }
        summary += `\nReady for upload to Etsy, Cults3D, Gumroad, or other marketplaces.`;

        return text(summary);
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  // ── generate_listing_description ──────────────────────────

  server.tool(
    "generate_listing_description",
    "Generate a marketplace listing description optimized for Etsy, Cults3D, or Gumroad. Includes SEO-friendly formatting and all required details.",
    {
      name: z.string().describe("Design name"),
      description: z.string().describe("Design description"),
      platform: z.enum(["etsy", "cults3d", "gumroad", "generic"]).describe("Target marketplace platform"),
      formats: z.array(z.string()).describe("File formats included (e.g., ['SVG', 'DXF', 'G-code'])"),
      dimensions: z.object({
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        depth: z.number().positive().optional(),
      }).default({}).describe("Design dimensions (mm)"),
      materials: z.array(z.string()).default([]).describe("Recommended materials"),
      tools: z.array(z.string()).default([]).describe("Recommended tools"),
      tags: z.array(z.string()).default([]).describe("Search tags"),
      license: z.enum(["personal_use", "commercial_use", "personal_and_commercial"]).default("personal_and_commercial"),
      price: z.string().optional().describe("Price"),
    },
    async ({ name, description, platform, formats, dimensions, materials, tools, tags, license, price }) => {
      try {
        let listing = "";

        if (platform === "etsy") {
          // Etsy-optimized: short title, detailed description, tags
          listing += `=== ETSY LISTING ===\n\n`;
          listing += `TITLE (max 140 chars):\n`;
          listing += `${name} - CNC File - ${formats.join(" ")} - Digital Download\n\n`;

          listing += `DESCRIPTION:\n`;
          listing += `${description}\n\n`;
          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `WHAT YOU GET\n`;
          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `This is a DIGITAL DOWNLOAD — no physical item will be shipped.\n\n`;
          listing += `Included file formats:\n`;
          for (const f of formats) listing += `✓ ${f}\n`;
          listing += `\n`;

          if (dimensions.width || dimensions.height) {
            listing += `━━━━━━━━━━━━━━━━━━━━\n`;
            listing += `DIMENSIONS\n`;
            listing += `━━━━━━━━━━━━━━━━━━━━\n`;
            if (dimensions.width) listing += `Width: ${dimensions.width}mm (${(dimensions.width / 25.4).toFixed(1)}")\n`;
            if (dimensions.height) listing += `Height: ${dimensions.height}mm (${(dimensions.height / 25.4).toFixed(1)}")\n`;
            if (dimensions.depth) listing += `Depth/Thickness: ${dimensions.depth}mm\n`;
            listing += `\nDesign can be scaled in your CAM software.\n\n`;
          }

          if (materials.length > 0) {
            listing += `━━━━━━━━━━━━━━━━━━━━\n`;
            listing += `RECOMMENDED MATERIALS\n`;
            listing += `━━━━━━━━━━━━━━━━━━━━\n`;
            for (const m of materials) listing += `• ${m}\n`;
            listing += `\n`;
          }

          if (tools.length > 0) {
            listing += `━━━━━━━━━━━━━━━━━━━━\n`;
            listing += `RECOMMENDED TOOLS\n`;
            listing += `━━━━━━━━━━━━━━━━━━━━\n`;
            for (const t of tools) listing += `• ${t}\n`;
            listing += `\n`;
          }

          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `COMPATIBLE SOFTWARE\n`;
          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `Works with any CNC software that supports ${formats.join("/")}:\n`;
          listing += `• Easel (Inventables)\n• VCarve / Aspire (Vectric)\n• Carveco\n• Fusion 360\n• CNCjs\n• Carbide Create\n• LightBurn (laser)\n\n`;

          const licenseMap: Record<string, string> = {
            personal_use: "PERSONAL USE ONLY — You may NOT sell products made from this design.",
            commercial_use: "COMMERCIAL LICENSE INCLUDED — You may sell physical products made from this design. Redistribution of digital files is prohibited.",
            personal_and_commercial: "PERSONAL & COMMERCIAL USE — You may use this design for personal projects and sell physical products. Redistribution of digital files is prohibited.",
          };

          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `LICENSE\n`;
          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `${licenseMap[license]}\n\n`;

          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `IMPORTANT\n`;
          listing += `━━━━━━━━━━━━━━━━━━━━\n`;
          listing += `• This is a digital file, NOT a physical product\n`;
          listing += `• No refunds on digital downloads\n`;
          listing += `• You need a CNC machine and compatible software to use these files\n`;
          listing += `• Please message me if you have any questions before purchasing\n\n`;

          listing += `TAGS:\n`;
          listing += tags.join(", ") + "\n";

        } else if (platform === "cults3d") {
          listing += `=== CULTS3D LISTING ===\n\n`;
          listing += `TITLE: ${name}\n\n`;
          listing += `DESCRIPTION:\n`;
          listing += `${description}\n\n`;
          listing += `**File Formats:** ${formats.join(", ")}\n\n`;
          if (dimensions.width) listing += `**Dimensions:** ${dimensions.width}mm x ${dimensions.height || "—"}mm\n`;
          if (dimensions.depth) listing += `**Material Thickness:** ${dimensions.depth}mm\n`;
          listing += `\n`;
          if (materials.length > 0) listing += `**Materials:** ${materials.join(", ")}\n`;
          if (tools.length > 0) listing += `**Tools:** ${tools.join(", ")}\n`;
          listing += `\n**License:** ${license.replace(/_/g, " ")}\n`;
          listing += `\nTAGS: ${tags.join(", ")}\n`;

        } else if (platform === "gumroad") {
          listing += `=== GUMROAD LISTING ===\n\n`;
          listing += `PRODUCT NAME: ${name}\n`;
          if (price) listing += `PRICE: ${price}\n`;
          listing += `\n`;
          listing += `DESCRIPTION (supports Markdown):\n\n`;
          listing += `# ${name}\n\n`;
          listing += `${description}\n\n`;
          listing += `## What's Included\n`;
          for (const f of formats) listing += `- **${f}** format\n`;
          listing += `\n`;
          if (dimensions.width) listing += `## Dimensions\n- ${dimensions.width}mm x ${dimensions.height || "—"}mm\n\n`;
          if (materials.length > 0) listing += `## Materials\n${materials.map((m) => `- ${m}`).join("\n")}\n\n`;
          listing += `## Compatibility\nWorks with Easel, VCarve, Carveco, Fusion 360, CNCjs, Carbide Create, LightBurn, and any software supporting ${formats.join("/")}.\n\n`;
          listing += `## License\n${license.replace(/_/g, " ")}\n\n`;
          listing += `TAGS: ${tags.join(", ")}\n`;

        } else {
          listing += `=== GENERIC LISTING ===\n\n`;
          listing += `Title: ${name}\n`;
          listing += `Description: ${description}\n`;
          listing += `Formats: ${formats.join(", ")}\n`;
          if (dimensions.width) listing += `Dimensions: ${dimensions.width}mm x ${dimensions.height || "—"}mm\n`;
          if (materials.length > 0) listing += `Materials: ${materials.join(", ")}\n`;
          if (tools.length > 0) listing += `Tools: ${tools.join(", ")}\n`;
          listing += `License: ${license.replace(/_/g, " ")}\n`;
          listing += `Tags: ${tags.join(", ")}\n`;
        }

        return text(listing);
      } catch (e: any) {
        return err(e.message);
      }
    }
  );

  // ── convert_design_format ──────────────────────────────────

  server.tool(
    "convert_design_format",
    "Convert a design file between formats. Supports SVG↔DXF conversion and G-code preview generation.",
    {
      inputPath: z.string().describe("Input file path"),
      outputPath: z.string().describe("Output file path"),
      inputFormat: z.enum(["svg", "dxf", "gcode"]).describe("Input format"),
      outputFormat: z.enum(["svg", "dxf", "svg_preview"]).describe("Output format (svg_preview generates a visual preview)"),
    },
    async ({ inputPath, outputPath, inputFormat, outputFormat }) => {
      try {
        const absInput = resolve(inputPath);
        if (!existsSync(absInput)) {
          return err(`Input file not found: ${absInput}`);
        }

        const content = readFileSync(absInput, "utf-8");
        let output = "";

        if (inputFormat === "gcode" && outputFormat === "svg_preview") {
          output = gcodeToPreviewSvg(content, 800, 600);
        } else if (inputFormat === "dxf" && outputFormat === "svg_preview") {
          output = dxfToPreviewSvg(content, 800, 600);
        } else if (inputFormat === "svg" && outputFormat === "svg_preview") {
          // SVG is its own preview
          copyFileSync(absInput, resolve(outputPath));
          return text(`SVG copied as preview to ${outputPath}`);
        } else if (inputFormat === "svg" && outputFormat === "dxf") {
          // Basic SVG to DXF conversion (paths and shapes)
          output = svgToDxf(content);
        } else if (inputFormat === "dxf" && outputFormat === "svg") {
          output = dxfToPreviewSvg(content, 800, 600); // reuse preview generator
        } else {
          return err(`Conversion from ${inputFormat} to ${outputFormat} is not supported.`);
        }

        writeFileSync(resolve(outputPath), output, "utf-8");
        return text(`Converted ${inputFormat} → ${outputFormat}: ${outputPath}`);
      } catch (e: any) {
        return err(e.message);
      }
    }
  );
}

// ── Utility functions ──────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function svgToDxf(svgContent: string): string {
  // Basic SVG to DXF R12 conversion — handles rect, circle, line, path (moveto/lineto)
  let dxf = "0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n";
  dxf += "0\nSECTION\n2\nENTITIES\n";

  // Parse SVG elements with regex (basic — handles common shapes)
  // Rectangles
  const rectRegex = /<rect[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*width="([^"]*)"[^>]*height="([^"]*)"/g;
  let match;
  while ((match = rectRegex.exec(svgContent)) !== null) {
    const x = parseFloat(match[1]), y = parseFloat(match[2]);
    const w = parseFloat(match[3]), h = parseFloat(match[4]);
    // Rectangle as 4 lines
    const corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = corners[i];
      const [x2, y2] = corners[(i + 1) % 4];
      dxf += `0\nLINE\n8\n0\n10\n${x1}\n20\n${y1}\n30\n0\n11\n${x2}\n21\n${y2}\n31\n0\n`;
    }
  }

  // Circles
  const circleRegex = /<circle[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*r="([^"]*)"/g;
  while ((match = circleRegex.exec(svgContent)) !== null) {
    dxf += `0\nCIRCLE\n8\n0\n10\n${match[1]}\n20\n${match[2]}\n30\n0\n40\n${match[3]}\n`;
  }

  // Lines
  const lineRegex = /<line[^>]*x1="([^"]*)"[^>]*y1="([^"]*)"[^>]*x2="([^"]*)"[^>]*y2="([^"]*)"/g;
  while ((match = lineRegex.exec(svgContent)) !== null) {
    dxf += `0\nLINE\n8\n0\n10\n${match[1]}\n20\n${match[2]}\n30\n0\n11\n${match[3]}\n21\n${match[4]}\n31\n0\n`;
  }

  dxf += "0\nENDSEC\n0\nEOF\n";
  return dxf;
}
