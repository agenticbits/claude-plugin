#!/usr/bin/env bash
# One-time setup script for the agentic-bits Claude plugin.
# - Creates ~/.config/agentic-bits/plugin.json with defaults
# - Installs the status line script to ~/.claude/scripts/
# - Patches ~/.claude/settings.json to register the status line

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

CONFIG_DIR="$HOME/.config/agentic-bits"
CONFIG_FILE="$CONFIG_DIR/plugin.json"
CLAUDE_DIR="$HOME/.claude"
CLAUDE_SCRIPTS_DIR="$CLAUDE_DIR/scripts"
CLAUDE_SETTINGS="$CLAUDE_DIR/settings.json"
STATUS_SCRIPT="$CLAUDE_SCRIPTS_DIR/branch-status.sh"

echo "==> agentic-bits Claude plugin setup"
echo ""

# 1. Create config directory and default config
mkdir -p "$CONFIG_DIR"
if [[ ! -f "$CONFIG_FILE" ]]; then
  cp "$PLUGIN_DIR/config/default.json" "$CONFIG_FILE"
  echo "✓ Created config: $CONFIG_FILE"
else
  echo "  Config already exists: $CONFIG_FILE"
fi

# 2. Install status line script
mkdir -p "$CLAUDE_SCRIPTS_DIR"
cp "$SCRIPT_DIR/branch-status.sh" "$STATUS_SCRIPT"
chmod +x "$STATUS_SCRIPT"
echo "✓ Installed status script: $STATUS_SCRIPT"

# 3. Patch ~/.claude/settings.json
if [[ ! -f "$CLAUDE_SETTINGS" ]]; then
  echo "{}" > "$CLAUDE_SETTINGS"
fi

if ! command -v jq &>/dev/null; then
  echo ""
  echo "⚠  jq not found — please add the status line manually."
  echo "   Add this to $CLAUDE_SETTINGS:"
  echo '   { "statusLine": "'"$STATUS_SCRIPT"'" }'
  echo ""
else
  # Merge statusLine key into existing settings
  UPDATED=$(jq --arg script "$STATUS_SCRIPT" '. + {statusLine: $script}' "$CLAUDE_SETTINGS")
  echo "$UPDATED" > "$CLAUDE_SETTINGS"
  echo "✓ Registered status line in: $CLAUDE_SETTINGS"
fi

echo ""
echo "==> Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add repos via Claude:  add_repo (MCP tool)"
echo "     Example prompt: 'Add /Users/eddie.flores/source/raptor/payment-service as payment-service (active)'"
echo ""
echo "  2. Or edit config directly:"
echo "     $CONFIG_FILE"
echo ""
echo "  3. To add the MCP server to a project, add this to .mcp.json:"
cat <<JSON
  {
    "mcpServers": {
      "agentic-bits": {
        "command": "node",
        "args": ["$PLUGIN_DIR/dist/index.js"]
      }
    }
  }
JSON
echo ""
echo "  For global use, add the same block to ~/.claude/claude_desktop_config.json"
