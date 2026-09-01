#!/usr/bin/env sh
set -e

echo "npx -y skillio -v" && npx -y skillio -v
echo "npx -y skills -v" && npx -y skills -v
echo "npx -y skillio ls" && npx -y skillio ls
echo "npx -y skillio rm . -y" && npx -y skillio rm . -y

# ANTHROPIC SKILLS
# npx skills add https://github.com/anthropics/skills -s \
#   frontend-design \
#   -a codex claude-code -y
#   # algorithmic-art \
#   # brand-guidelines \
#   # canvas-design \
#   # doc-coauthoring \
#   # skill-creator \
#   # webapp-testing \

# ANTHROPIC CLAUDE-PLUGINS-OFFICIAL
# npx skills add https://github.com/anthropics/claude-plugins-official -s \
#   claude-md-improver \
#   -a codex claude-code -y
#   # agent-development \
#   # claude-automation-recommender \
#   # command-development \
#   # hook-development \
#   # session-report \
#   # skill-development \

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
  commit-all \
  maintaining-agent-context \
  frontend-crafting \
  -a codex claude-code -y

# MATTPOCOCK SKILLS
npx skills add https://github.com/mattpocock/skills -s \
  grill-me \
  grill-with-docs \
  grilling \
  domain-modeling \
  -a codex claude-code -y
  # writing-for-agents \

# LEONXLNX TASTE-SKILL
# npx skills add https://github.com/Leonxlnx/taste-skill -s design-taste-frontend -a codex claude-code -y

# PBAKAUS IMPECCABLE
# npx skills add https://github.com/pbakaus/impeccable -s impeccable -a codex claude-code -y

# VERCEL-LABS AGENT-SKILLS
# npx skills add https://github.com/vercel-labs/agent-skills -s web-design-guidelines -a codex claude-code -y

echo ""
echo "npx -y skillio ls" && npx -y skillio ls
