#!/usr/bin/env node

// CNC Design & Control MCP Server

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { client } from "./cncjs-client.js";
import { registerQueryTools } from "./tools/query.js";
import { registerConnectionTools } from "./tools/connection.js";
import { registerSafetyTools } from "./tools/safety.js";
import { registerControlTools } from "./tools/control.js";
import { registerManagementTools } from "./tools/management.js";
import { registerAnalysisTools } from "./tools/analysis.js";
import { registerDesignTools } from "./tools/design.js";
import { registerFusion360Tools } from "./tools/fusion360.js";
import { registerFreeCADTools } from "./tools/freecad.js";
import { registerIllustratorTools } from "./tools/illustrator.js";
import { registerMarketplaceTools } from "./tools/marketplace.js";

const server = new McpServer({
  name: "cnc-design-control-mcp",
  version: "1.0.0",
});

// Register all tools
registerQueryTools(server);
registerConnectionTools(server);
registerSafetyTools(server);
registerControlTools(server);
registerManagementTools(server);
registerAnalysisTools(server);
registerDesignTools(server);
registerFusion360Tools(server);
registerFreeCADTools(server);
registerIllustratorTools(server);
registerMarketplaceTools(server);

// Auto-connect to CNCjs on startup (best-effort, non-blocking)
async function tryConnect(): Promise<void> {
  try {
    await client.connectToServer();
    console.error("[cnc-design-control-mcp] Auto-connected to CNCjs server");
  } catch (e: any) {
    console.error(`[cnc-design-control-mcp] CNCjs not available at startup (will connect on first use): ${e.message}`);
  }
}

// Start server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[cnc-design-control-mcp] MCP server running on stdio");

  // Try to connect to CNCjs in background
  tryConnect();
}

main().catch((e) => {
  console.error("[cnc-design-control-mcp] Fatal error:", e);
  process.exit(1);
});
