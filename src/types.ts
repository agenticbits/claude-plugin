export interface RepoConfig {
  /** Absolute path to the git repository root */
  path: string;
  /** Short display label shown in the status bar */
  label: string;
  /** Whether this is an active dev target or a read-only reference repo */
  type: "active" | "reference";
  /** Whether to include this repo in the status bar output */
  show: boolean;
}

export interface StatusBarConfig {
  /** Master toggle — false hides the entire status bar output */
  enabled: boolean;
  /** When false, repos with type "reference" are omitted regardless of their show flag */
  showReferenceRepos: boolean;
}

export interface PluginConfig {
  statusbar: StatusBarConfig;
  repos: RepoConfig[];
}

export interface BranchInfo {
  label: string;
  path: string;
  branch: string | null;
  type: "active" | "reference";
  error?: string;
}
