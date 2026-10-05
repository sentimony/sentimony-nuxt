#!/usr/bin/env sh
set -e

# echo the command in cyan, then run it
run() { printf '\033[0;36m%s\033[0m\n' "$*"; "$@"; }

run npx -y skills -v

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

echo "npx -y skillio -v" && npx -y skillio -v
echo "npx -y skills -v" && npx -y skills -v
# echo "npx -y skillio ls" && npx -y skillio ls
echo "npx -y skillio rm . -y" && npx -y skillio rm . -y

# SENTIMONY SKILLS
# All at once
# npx skills add sentimony/skills -a codex claude-code -y
# Or each separately
run npx skills add https://github.com/sentimony/skills -s \
  web-debug \
  vitest \
  typescript \
  echarts \
  scope-triage \
  plan-crafting \
  dashfix \
  negafix \
  commit-all \
  maintaining-agent-context \
  frontend-crafting \
  tdd \
  debugging \
  cross-review \
  review-request \
  review-resolution \
  verification-gate \
  git-worktree-isolation \
  parallel-agents \
  inline-plan-dev \
  subagent-plan-dev \
  branch-finish \
  -a codex claude-code -y

# MATTPOCOCK SKILLS
run npx skills add https://github.com/mattpocock/skills -s \
  grill-me \
  grill-with-docs \
  grilling \
  domain-modeling \
  -a codex claude-code -y

# ln -sfn ../../../label-skills/skills/artist-upd \
#   "$PROJECT_ROOT/.agents/skills/artist-upd"
# ln -sfn ../../../label-skills/skills/artist-upd \
#   "$PROJECT_ROOT/.claude/skills/artist-upd"

# skills.local.sh passes --no-list and prints its own listing after the local skills
if [ "$1" != --no-list ]; then
  run npx -y skillio -v
  run npx skillio ls -g
  run npx skillio list
  run npx skillio usage --period 2w
fi
