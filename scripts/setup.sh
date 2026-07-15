#!/usr/bin/env sh
set -e

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

mkdir -p \
  "$PROJECT_ROOT/.agents/skills" \
  "$PROJECT_ROOT/.claude/skills" \
  "$PROJECT_ROOT/.env"

touch \
  "$PROJECT_ROOT/.env/.env" \
  "$PROJECT_ROOT/.env/.env.local"

echo "npx -y skillio -v" && npx -y skillio -v
echo "npx -y skills -v" && npx -y skills -v
