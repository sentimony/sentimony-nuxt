#!/usr/bin/env sh
set -e

echo "npx -y skillio -v" && npx -y skillio -v
echo "npx -y skills -v" && npx -y skills -v
# echo "npx -y skillio ls" && npx -y skillio ls
echo "npx -y skillio rm . -y" && npx -y skillio rm . -y

# SENTIMONY SKILLS
# All at once
# npx skills add sentimony/skills -a codex claude-code -y
# Or each separately
npx skills add https://github.com/sentimony/skills -s \
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
npx skills add https://github.com/mattpocock/skills -s \
  grill-me \
  grill-with-docs \
  grilling \
  domain-modeling \
  -a codex claude-code -y

# LOCAL SKILLS
# sc-manage is not published anywhere, it lives in the sentimony/label-skills checkout
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
SC_MANAGE_SKILL=$(dirname "$(dirname "$PROJECT_ROOT")")/sentimony/label-skills/skills/sc-manage

if [ -d "$SC_MANAGE_SKILL" ]; then
  for dir in "$PROJECT_ROOT/.claude/skills" "$PROJECT_ROOT/.agents/skills"; do
    mkdir -p "$dir"
    link="$dir/sc-manage"
    if [ -e "$link" ] && [ ! -L "$link" ]; then
      echo "warning: $link exists and is not a symlink, skipped" >&2
      continue
    fi
    ln -sfn "$SC_MANAGE_SKILL" "$link"
    echo "linked $link"
  done
else
  echo "warning: $SC_MANAGE_SKILL not found, sc-manage not linked" >&2
fi

echo "npx -y skillio ls" && npx -y skillio ls
