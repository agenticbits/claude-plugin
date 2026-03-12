import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { PluginConfig } from "../types.js";

const CONFIG_DIR = join(homedir(), ".config", "agentic-bits");
const CONFIG_PATH = join(CONFIG_DIR, "plugin.json");

const DEFAULT_CONFIG: PluginConfig = {
  statusbar: {
    enabled: true,
    showReferenceRepos: false,
  },
  repos: [],
};

export function loadConfig(): PluginConfig {
  if (!existsSync(CONFIG_PATH)) {
    return structuredClone(DEFAULT_CONFIG);
  }
  try {
    const raw = readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw) as PluginConfig;
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function saveConfig(config: PluginConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function configPath(): string {
  return CONFIG_PATH;
}
