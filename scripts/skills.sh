#!/usr/bin/env sh
set -e

# ANTHROPIC SKILLS
npx skills add https://github.com/anthropics/skills -s \
  frontend-design \
  -a codex claude-code -y
  # algorithmic-art \
  # brand-guidelines \
  # canvas-design \
  # doc-coauthoring \
  # skill-creator \
  # webapp-testing \

# ANTHROPIC CLAUDE-PLUGINS-OFFICIAL
npx skills add https://github.com/anthropics/claude-plugins-official -s \
  claude-md-improver \
  -a codex claude-code -y
  # agent-development \
  # claude-automation-recommender \
  # command-development \
  # hook-development \
  # session-report \
  # skill-development \

# OBRA SUPERPOWERS
npx skills add https://github.com/obra/superpowers -s \
  executing-plans \
  finishing-a-development-branch \
  test-driven-development \
  systematic-debugging \
  verification-before-completion \
  using-git-worktrees \
  requesting-code-review \
  receiving-code-review \
  dispatching-parallel-agents \
  subagent-driven-development \
  -a codex claude-code -y
  # brainstorming \
  # writing-plans \
  # writing-skills \

# SENTIMONY SKILLS
npx skills add https://github.com/sentimony/skills -s \
  scope-triage \
  plan-crafting \
  web-debug \
  vitest \
  typescript \
  echarts \
  dashfix \
  negafix \
  -a codex claude-code -y

# TASTE SKILL
npx skills add https://github.com/Leonxlnx/taste-skill -s design-taste-frontend -a codex claude-code -y

# IMPECCABLE
npx skills add https://github.com/pbakaus/impeccable -s impeccable -a codex claude-code -y
npx skills add https://github.com/Leonxlnx/taste-skill -s design-taste-frontend -a codex claude-code -y

echo ""
echo "npx skillio ls" && npx skillio ls
