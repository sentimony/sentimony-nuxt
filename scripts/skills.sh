#!/usr/bin/env sh
set -e

# ANTHROPIC
npx skills add https://github.com/anthropics/skills -s \
  frontend-design \
  -a codex claude-code -y
  # algorithmic-art \
  # brand-guidelines \
  # canvas-design \
  # doc-coauthoring \
  # skill-creator \
  # webapp-testing \
npx skills add https://github.com/anthropics/claude-plugins-official -s \
  claude-md-improver \
  -a codex claude-code -y
  # agent-development \
  # claude-automation-recommender \
  # command-development \
  # hook-development \
  # session-report \
  # skill-development \

# SENTIMONY
npx skills add https://github.com/sentimony/skills -s \
  web-debug \
  vitest \
  typescript \
  echarts \
  -a codex claude-code -y

# SUPERPOWERS
npx skills add https://github.com/obra/superpowers -s \
  brainstorming \
  writing-plans \
  executing-plans \
  test-driven-development \
  systematic-debugging \
  verification-before-completion \
  finishing-a-development-branch \
  -a codex claude-code -y
  # using-git-worktrees \
  # receiving-code-review \
  # requesting-code-review \
  # dispatching-parallel-agents \
  # subagent-driven-development \
  # writing-skills \

echo "npx skillio ls" && npx skillio ls
