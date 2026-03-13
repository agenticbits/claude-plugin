# @agenticbits/claude-plugin

Claude Code MCP plugin that adds a **live git branch status bar** to the Claude footer.

```
⎇ payment-service:feature/PAYM-43  |  payments-ui:main  |  payments-infra:main
```

---

## Features

- **Branch status bar** — shows the current git branch for every configured repo in the Claude footer
- **Master toggle** — enable/disable the status bar entirely
- **Reference repo toggle** — show/hide read-only reference repos separately from active dev repos
- **Per-repo visibility** — show or hide individual repos without removing them from config
- **MCP tools** — manage everything via natural language in Claude chat

---

## Quick start

```bash
git clone git@gitlab.com:raptortech1/agentic-bits-claude-plugin.git
cd agentic-bits-claude-plugin
npm install && npm run build
bash scripts/setup.sh
```

Then add the MCP server to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "agentic-bits": {
      "command": "node",
      "args": ["/path/to/agentic-bits-claude-plugin/dist/index.js"]
    }
  }
}
```

See **[docs/setup-guide.md](docs/setup-guide.md)** for full instructions including payment-service workspace pre-population.

---

## MCP tools

| Tool | What it does |
|------|-------------|
| `get_branch_status` | Live branch status for all visible repos |
| `add_repo` | Add a repo to track |
| `remove_repo` | Remove a repo |
| `set_repo_visibility` | Show/hide a specific repo |
| `toggle_statusbar` | Enable/disable the status bar |
| `toggle_reference_repos` | Show/hide reference repos |
| `list_repos` | List all repos and their config |
| `get_config_info` | Dump full config + path |

---

## Config file

`~/.config/agentic-bits/plugin.json`

```json
{
  "statusbar": {
    "enabled": true,
    "showReferenceRepos": false
  },
  "repos": [
    {
      "path": "/absolute/path/to/repo",
      "label": "my-repo",
      "type": "active",
      "show": true
    }
  ]
}
```

---

## Publishing

Tag a commit to publish to npm:

```bash
git tag v1.0.0 && git push origin v1.0.0
```

Pipeline: typecheck → build → npm publish → GitLab release.
