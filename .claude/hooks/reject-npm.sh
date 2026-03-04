#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

if echo "$command" | grep -qE '(^|[;&|]\s*)npm(\s|$)'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"npm is not allowed in this project. Use pnpm instead (e.g. `pnpm install`, `pnpm run <script>`)."}}'
fi
