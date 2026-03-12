import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadConfig, saveConfig, configPath } from "../utils/config.js";
import { isGitRepo } from "../utils/git.js";
import type { RepoConfig } from "../types.js";

export function registerConfigTools(server: McpServer): void {
  // --- list_repos ---
  server.tool(
    "list_repos",
    "List all configured repos with their label, path, type, and visibility.",
    {},
    async () => {
      const config = loadConfig();
      if (config.repos.length === 0) {
        return { content: [{ type: "text", text: "No repos configured. Use add_repo to add one." }] };
      }
      const lines = config.repos.map((r) => {
        const vis = r.show ? "visible" : "hidden";
        return `[${vis}] ${r.label} (${r.type})\n  path: ${r.path}`;
      });
      const header = [
        `Status bar: ${config.statusbar.enabled ? "ON" : "OFF"}`,
        `Show reference repos: ${config.statusbar.showReferenceRepos ? "yes" : "no"}`,
        "",
      ].join("\n");
      return { content: [{ type: "text", text: header + lines.join("\n\n") }] };
    }
  );

  // --- add_repo ---
  server.tool(
    "add_repo",
    "Add a repository to the status bar. The path must be an absolute filesystem path to a git repo root.",
    {
      path: z.string().describe("Absolute path to the git repo"),
      label: z.string().describe("Short display label, e.g. 'payment-service'"),
      type: z.enum(["active", "reference"]).default("active").describe("'active' for dev repos, 'reference' for read-only refs"),
      show: z.boolean().default(true).describe("Whether to show this repo in the status bar immediately"),
    },
    async ({ path, label, type, show }) => {
      const config = loadConfig();
      const exists = config.repos.find((r) => r.path === path || r.label === label);
      if (exists) {
        return { content: [{ type: "text", text: `Repo already configured: ${exists.label} (${exists.path}). Use set_repo_visibility or remove_repo first.` }] };
      }
      if (!isGitRepo(path)) {
        return { content: [{ type: "text", text: `Warning: "${path}" does not appear to be a git repo. Added anyway — verify the path is correct.` }] };
      }
      const repo: RepoConfig = { path, label, type, show };
      config.repos.push(repo);
      saveConfig(config);
      return { content: [{ type: "text", text: `Added repo: ${label} (${path}) [${type}, ${show ? "visible" : "hidden"}]` }] };
    }
  );

  // --- remove_repo ---
  server.tool(
    "remove_repo",
    "Remove a repository from the status bar by its label.",
    { label: z.string().describe("Repo label to remove") },
    async ({ label }) => {
      const config = loadConfig();
      const before = config.repos.length;
      config.repos = config.repos.filter((r) => r.label !== label);
      if (config.repos.length === before) {
        return { content: [{ type: "text", text: `No repo found with label "${label}".` }] };
      }
      saveConfig(config);
      return { content: [{ type: "text", text: `Removed repo: ${label}` }] };
    }
  );

  // --- set_repo_visibility ---
  server.tool(
    "set_repo_visibility",
    "Show or hide a specific repo in the status bar by its label.",
    {
      label: z.string().describe("Repo label"),
      show: z.boolean().describe("true = show in status bar, false = hide"),
    },
    async ({ label, show }) => {
      const config = loadConfig();
      const repo = config.repos.find((r) => r.label === label);
      if (!repo) {
        return { content: [{ type: "text", text: `No repo found with label "${label}".` }] };
      }
      repo.show = show;
      saveConfig(config);
      return { content: [{ type: "text", text: `${label}: now ${show ? "visible" : "hidden"} in status bar.` }] };
    }
  );

  // --- toggle_statusbar ---
  server.tool(
    "toggle_statusbar",
    "Enable or disable the entire status bar. When disabled the status line script outputs nothing.",
    { enabled: z.boolean().describe("true = enable, false = disable") },
    async ({ enabled }) => {
      const config = loadConfig();
      config.statusbar.enabled = enabled;
      saveConfig(config);
      return { content: [{ type: "text", text: `Status bar ${enabled ? "enabled" : "disabled"}.` }] };
    }
  );

  // --- toggle_reference_repos ---
  server.tool(
    "toggle_reference_repos",
    "Show or hide repos marked as type 'reference' in the status bar.",
    { show: z.boolean().describe("true = include reference repos, false = active repos only") },
    async ({ show }) => {
      const config = loadConfig();
      config.statusbar.showReferenceRepos = show;
      saveConfig(config);
      return { content: [{ type: "text", text: `Reference repos: ${show ? "shown" : "hidden"} in status bar.` }] };
    }
  );

  // --- get_config_info ---
  server.tool(
    "get_config_info",
    "Return the path to the config file and the full current configuration.",
    {},
    async () => {
      const config = loadConfig();
      return {
        content: [
          { type: "text", text: `Config file: ${configPath()}\n\n${JSON.stringify(config, null, 2)}` },
        ],
      };
    }
  );
}
