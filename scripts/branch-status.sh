#!/usr/bin/env bash
# Claude Code status line script — outputs current git branches for configured repos.
# Reads config from ~/.config/agentic-bits/plugin.json
# Output is a single line displayed in the Claude Code footer.

CONFIG_FILE="$HOME/.config/agentic-bits/plugin.json"

[[ ! -f "$CONFIG_FILE" ]] && exit 0

# Requires jq
if ! command -v jq &>/dev/null; then
  echo "⎇ [install jq to enable branch status]"
  exit 0
fi

ENABLED=$(jq -r '.statusbar.enabled' "$CONFIG_FILE" 2>/dev/null)
[[ "$ENABLED" != "true" ]] && exit 0

SHOW_REF=$(jq -r '.statusbar.showReferenceRepos' "$CONFIG_FILE" 2>/dev/null)

parts=()

while IFS= read -r repo_json; do
  path=$(echo "$repo_json" | jq -r '.path')
  label=$(echo "$repo_json" | jq -r '.label')
  show=$(echo "$repo_json" | jq -r '.show')
  type=$(echo "$repo_json" | jq -r '.type')

  [[ "$show" != "true" ]] && continue
  [[ "$type" == "reference" && "$SHOW_REF" != "true" ]] && continue
  [[ ! -d "$path" ]] && continue

  branch=$(git -C "$path" branch --show-current 2>/dev/null)
  if [[ -z "$branch" ]]; then
    branch="detached"
  fi

  parts+=("${label}:${branch}")
done < <(jq -c '.repos[]' "$CONFIG_FILE" 2>/dev/null)

if [[ ${#parts[@]} -eq 0 ]]; then
  exit 0
fi

# Join with separator and prefix with branch symbol
IFS='  |  '
echo "⎇ ${parts[*]}"
