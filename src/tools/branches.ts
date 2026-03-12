import { existsSync } from "fs";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadConfig } from "../utils/config.js";
import { getAllBranchInfo, getBranchInfo, isGitRepo } from "../utils/git.js";
import type { BranchInfo } from "../types.js";

function formatStatusLine(branches: BranchInfo[], showRef: boolean): string {
  const visible = branches.filter((b) => {
    if (b.type === "reference" && !showRef) return false;
    return true;
  });
  if (visible.length === 0) return "(no repos configured)";
  return visible
    .map((b) => {
      if (b.error) return `${b.label}:(${b.error})`;
      return `${b.label}:${b.branch ?? "detached"}`;
    })
    .join("  |  ");
}

export function registerBranchTools(server: McpServer): void {
  // --- get_branch_status ---
  server.tool(
    "get_branch_status",
    "Return the current git branch for every configured repo. Respects the enabled flag and showReferenceRepos toggle.",
    {},
    async () => {
      const config = loadConfig();
      if (!config.statusbar.enabled) {
        return { content: [{ type: "text", text: "Status bar is disabled. Use toggle_statusbar to enable it." }] };
      }
      const visible = config.repos.filter((r) => {
        if (!r.show) return false;
        if (r.type === "reference" && !config.statusbar.showReferenceRepos) return false;
        return true;
      });
      const branches = getAllBranchInfo(visible);
      const lines = branches.map((b) => {
        const tag = b.type === "reference" ? " [ref]" : "";
        const status = b.error ? `ERROR: ${b.error}` : (b.branch ?? "HEAD detached");
        return `${b.label}${tag}: ${status}`;
      });
      const statusLine = formatStatusLine(branches, config.statusbar.showReferenceRepos);
      return {
        content: [
          { type: "text", text: lines.join("\n") || "(no visible repos)" },
          { type: "text", text: `\nStatus line preview:\n${statusLine}` },
        ],
      };
    }
  );

  // --- check_repo_branch ---
  server.tool(
    "check_repo_branch",
    "Get the current branch for a single repo by its label or path.",
    { identifier: z.string().describe("Repo label or absolute path") },
    async ({ identifier }) => {
      const config = loadConfig();
      const repo = config.repos.find((r) => r.label === identifier || r.path === identifier);
      if (!repo) {
        return { content: [{ type: "text", text: `No repo found matching "${identifier}". Use list_repos to see all configured repos.` }] };
      }
      const info = getBranchInfo(repo);
      const text = info.error
        ? `${info.label}: ERROR — ${info.error}`
        : `${info.label}: ${info.branch ?? "HEAD detached"}`;
      return { content: [{ type: "text", text }] };
    }
  );

  // --- validate_repo_path ---
  server.tool(
    "validate_repo_path",
    "Check whether a given filesystem path exists and is a git repository.",
    { path: z.string().describe("Absolute path to check") },
    async ({ path }) => {
      if (!existsSync(path)) {
        return { content: [{ type: "text", text: `Path does not exist: ${path}` }] };
      }
      if (!isGitRepo(path)) {
        return { content: [{ type: "text", text: `Path exists but is not a git repo (no .git directory): ${path}` }] };
      }
      return { content: [{ type: "text", text: `Valid git repository: ${path}` }] };
    }
  );
}
