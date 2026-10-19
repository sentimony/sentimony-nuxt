#!/usr/bin/env sh
set -e

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

mkdir -p \
  "$PROJECT_ROOT/.agents/skills" \
  "$PROJECT_ROOT/.claude/skills" \
  "$PROJECT_ROOT/.env" \
  "$PROJECT_ROOT/repositories"

touch \
  "$PROJECT_ROOT/.env/.env" \
  "$PROJECT_ROOT/.env/.env.local"

# Links ../label-skills when it is cloned next to this repo and not linked yet
if [ -d "$PROJECT_ROOT/../label-skills" ] \
  && [ ! -e "$PROJECT_ROOT/repositories/label-skills" ] \
  && [ ! -L "$PROJECT_ROOT/repositories/label-skills" ]; then
  ln -s ../../label-skills "$PROJECT_ROOT/repositories/label-skills"
fi

SETTINGS="$PROJECT_ROOT/.claude/settings.json"
if [ ! -f "$SETTINGS" ]; then
  printf '%s\n' \
    '{' \
    '  "attribution": {' \
    '    "commits": false,' \
    '    "pullRequests": false' \
    '  }' \
    '}' > "$SETTINGS"
elif command -v jq >/dev/null 2>&1; then
  TMP=$(mktemp)
  jq '
    .attribution.commits = (.attribution.commits // false)
    | .attribution.pullRequests = (.attribution.pullRequests // false)
  ' "$SETTINGS" > "$TMP" && mv "$TMP" "$SETTINGS"
else
  echo "warning: jq not found, skipping attribution merge in $SETTINGS" >&2
fi
