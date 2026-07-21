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
  brainstorming \
  writing-plans \
  executing-plans \
  -a codex claude-code -y
  # test-driven-development \
  # systematic-debugging \
  # verification-before-completion \
  # using-git-worktrees \
  # requesting-code-review \
  # receiving-code-review \
  # dispatching-parallel-agents \
  # subagent-driven-development \
  # finishing-a-development-branch \
  # writing-skills \

# SENTIMONY SKILLS
npx skills add https://github.com/sentimony/skills -s \
  web-debug \
  typescript \
  vitest \
  -a codex claude-code -y
  # echarts \

echo ""
echo "npx skillio ls" && npx skillio ls
