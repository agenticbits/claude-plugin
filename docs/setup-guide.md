# agentic-bits Claude Plugin — Setup Guide

A Claude Code MCP plugin that adds a live git branch status bar to your Claude footer, with per-repo visibility controls.

---

## Requirements

- Node.js 20+
- `jq` (for the shell-based status line script)
- Claude Code CLI

Install jq if needed:
```bash
brew install jq   # macOS
```

---

## Installation

### Option A — Install from npm (after publish)

```bash
npm install -g @agenticbits/claude-plugin
```

Then run the setup wizard:
```bash
npx agentic-bits-setup
# or if installed globally:
agentic-bits-setup
```

### Option B — Install from source (local dev)

```bash
cd /Users/eddie.flores/source/agentic-bits-claude-plugin
npm install
npm run build
bash scripts/setup.sh
```

---

## What setup.sh does

1. Creates `~/.config/agentic-bits/plugin.json` with default config
2. Copies `branch-status.sh` to `~/.claude/scripts/branch-status.sh`
3. Adds `"statusLine": "~/.claude/scripts/branch-status.sh"` to `~/.claude/settings.json`

---

## Registering repos

After setup, add repos via Claude's chat interface (MCP tools) or by editing the config file directly.

### Via Claude (recommended)

Ask Claude to add your repos:
```
Add /Users/eddie.flores/source/raptor/payment-service as payment-service (active)
Add /Users/eddie.flores/source/raptor/payments-ui as payments-ui (active)
Add /Users/eddie.flores/source/raptor/payments-infrastructure as payments-infra (active)
Add /Users/eddie.flores/source/raptor/refs/payment-frontend-ym as payment-frontend-ym (reference)
```

### Via config file directly

Edit `~/.config/agentic-bits/plugin.json`:

```json
{
  "statusbar": {
    "enabled": true,
    "showReferenceRepos": false
  },
  "repos": [
    {
      "path": "/Users/eddie.flores/source/raptor/payment-service/repos/payment-service",
      "label": "payment-service",
      "type": "active",
      "show": true
    },
    {
      "path": "/Users/eddie.flores/source/raptor/payment-service/repos/payments-ui",
      "label": "payments-ui",
      "type": "active",
      "show": true
    },
    {
      "path": "/Users/eddie.flores/source/raptor/payment-service/repos/payments-infrastructure",
      "label": "payments-infra",
      "type": "active",
      "show": true
    },
    {
      "path": "/Users/eddie.flores/source/raptor/payment-service/repos/refs/payment-frontend-ym",
      "label": "payment-frontend-ym",
      "type": "reference",
      "show": true
    }
  ]
}
```

---

## Referencing the payment-service workspace

To auto-populate the payment-service repos, you can seed the config with a helper script:

```bash
WORKSPACE="/Users/eddie.flores/source/raptor/payment-service/repos"

# Add active repos
node dist/index.js &  # start server in background for tool calls
# OR edit config directly:

jq '.repos = [
  {"path":"'"$WORKSPACE"'/payment-service","label":"payment-service","type":"active","show":true},
  {"path":"'"$WORKSPACE"'/payments-ui","label":"payments-ui","type":"active","show":true},
  {"path":"'"$WORKSPACE"'/payments-infrastructure","label":"payments-infra","type":"active","show":true},
  {"path":"'"$WORKSPACE"'/refs/payment-frontend-ym","label":"payment-frontend-ym","type":"reference","show":false},
  {"path":"'"$WORKSPACE"'/refs/event-management-frontend","label":"event-mgmt-fe","type":"reference","show":false},
  {"path":"'"$WORKSPACE"'/refs/marketplace-frontend","label":"marketplace-fe","type":"reference","show":false}
]' ~/.config/agentic-bits/plugin.json > /tmp/plugin.json && mv /tmp/plugin.json ~/.config/agentic-bits/plugin.json

echo "Repos configured."
```

---

## Adding the MCP server to a project

Add to `.mcp.json` in any project root:

```json
{
  "mcpServers": {
    "agentic-bits": {
      "command": "node",
      "args": ["/Users/eddie.flores/source/agentic-bits-claude-plugin/dist/index.js"]
    }
  }
}
```

For global availability (all Claude Code sessions), add the same block to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentic-bits": {
      "command": "node",
      "args": ["/Users/eddie.flores/source/agentic-bits-claude-plugin/dist/index.js"]
    }
  }
}
```

---

## Available MCP tools

| Tool | Description |
|------|-------------|
| `get_branch_status` | Show current branch for all visible repos |
| `check_repo_branch` | Get branch for a single repo by label or path |
| `validate_repo_path` | Confirm a path is a valid git repo |
| `list_repos` | List all configured repos with visibility |
| `add_repo` | Add a repo to the status bar |
| `remove_repo` | Remove a repo from the status bar |
| `set_repo_visibility` | Show/hide a specific repo |
| `toggle_statusbar` | Enable/disable the entire status bar |
| `toggle_reference_repos` | Show/hide all reference repos at once |
| `get_config_info` | Show config file path and full config |

---

## Status bar output format

```
⎇ payment-service:feature/PAYM-43  |  payments-ui:main  |  payments-infra:main
```

- Hidden when `enabled: false`
- Reference repos omitted when `showReferenceRepos: false`
- Individual repos can be toggled via `set_repo_visibility`

---

## Toggling features via Claude

```
Toggle the status bar off
Show reference repos in my status bar
Hide the payment-frontend-ym repo from my status bar
What branches am I on?
```

---

## Publishing a new version

Tag a commit with a semver tag to trigger the CI pipeline:

```bash
git tag v1.0.1
git push origin v1.0.1
```

The pipeline will:
1. Typecheck and build
2. Publish to npm as `@agenticbits/claude-plugin`
3. Create a GitLab release with install instructions
