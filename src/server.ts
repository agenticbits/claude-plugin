import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBranchTools } from "./tools/branches.js";
import { registerConfigTools } from "./tools/config-tools.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "agentic-bits-claude-plugin",
    version: "1.0.0",
  });

  registerBranchTools(server);
  registerConfigTools(server);

  return server;
}
