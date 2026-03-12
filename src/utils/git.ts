import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import type { BranchInfo, RepoConfig } from "../types.js";

export function currentBranch(repoPath: string): string | null {
  try {
    const branch = execSync(`git -C "${repoPath}" branch --show-current`, {
      encoding: "utf8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return branch || null;
  } catch {
    return null;
  }
}

export function isGitRepo(path: string): boolean {
  return existsSync(join(path, ".git"));
}

export function getBranchInfo(repo: RepoConfig): BranchInfo {
  if (!existsSync(repo.path)) {
    return { label: repo.label, path: repo.path, branch: null, type: repo.type, error: "path not found" };
  }
  if (!isGitRepo(repo.path)) {
    return { label: repo.label, path: repo.path, branch: null, type: repo.type, error: "not a git repo" };
  }
  const branch = currentBranch(repo.path);
  return { label: repo.label, path: repo.path, branch, type: repo.type };
}

export function getAllBranchInfo(repos: RepoConfig[]): BranchInfo[] {
  return repos.map(getBranchInfo);
}
