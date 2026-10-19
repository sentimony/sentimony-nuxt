#!/usr/bin/env sh
set -e

npx -y --prefer-online skl-x -v
# npx -y skills -v
npx -y --prefer-online skl-x rm . -y -m sm

# A "\ name" line disables that skill on purpose: skl-x gets " name" and skips it

# SENTIMONY SKILLS https://github.com/sentimony/skills
npx -y --prefer-online skl-x add sentimony/skills -s \
  scope-triage \
  scope-check \
  plan-crafting \
  inline-plan-dev \
  subagent-plan-dev \
  \ git-worktree-isolation \
  \ parallel-agents \
  tdd \
  cross-review \
  review-request \
  review-resolution \
  debugging \
  web-debug \
  \ webapp-debugger \
  verification-gate \
  branch-finish \
  commit-all \
  gh-switch \
  frontend-crafting \
  vitest \
  typescript \
  \ echarts \
  prose-crafting \
  dashfix \
  negafix \
  maintaining-agent-context \
  secret-hygiene \
  \ skill-crafting \
  -a codex claude-code -y -m sm

# SENTIMONY AGENTIC WORKFLOW https://github.com/sentimony/agentic-workflow
npx -y --prefer-online skl-x add sentimony/agentic-workflow -s \
  cr-request \
  cr-received \
  session-learnings \
  -a codex claude-code -y -m sm

# LOCAL SKILLS
skills_local="$(dirname "$0")/skills.local.sh"
if [ -f "$skills_local" ]; then
  sh "$skills_local"
fi

# VERCEL-LABS AGENT-BROWSER https://github.com/vercel-labs/agent-browser
npx -y --prefer-online skl-x add vercel-labs/agent-browser -s \
  agent-browser \
  -a codex claude-code -y -m sm

# # MATTPOCOCK SKILLS https://github.com/mattpocock/skills
# npx -y --prefer-online skl-x add mattpocock/skills -s \
#   grill-me \
#   grill-with-docs \
#   grilling \
#   domain-modeling \
#   improve-codebase-architecture \
#   writing-for-agents \
#   -a codex claude-code -y -m sm

# # SHADCN UI https://github.com/shadcn/ui
# npx -y --prefer-online skl-x add shadcn/ui -s \
#   migrate-radix-to-base \
#   shadcn \
#   -a codex claude-code -y -m sm

# # CLOUDFLARE SKILLS https://github.com/cloudflare/skills
# npx -y --prefer-online skl-x add cloudflare/skills -s \
#   wrangler \
#   cloudflare-one \
#   workers-best-practices \
#   durable-objects \
#   -a codex claude-code -y -m sm

# # ANTHROPIC SKILLS https://github.com/anthropics/skills
# npx -y --prefer-online skl-x add anthropics/skills -s \
#   frontend-design \
#   algorithmic-art \
#   brand-guidelines \
#   canvas-design \
#   doc-coauthoring \
#   webapp-testing \
#   -a codex claude-code -y -m sm

# # ANTHROPIC CLAUDE-PLUGINS-OFFICIAL https://github.com/anthropics/claude-plugins-official
# npx -y --prefer-online skl-x add anthropics/claude-plugins-official -s \
#   agent-development \
#   claude-md-improver \
#   claude-automation-recommender \
#   code-review \
#   command-development \
#   hook-development \
#   session-report \
#   skill-development \
#   -a codex claude-code -y -m sm

# # BORGHEI PROJECT-MANAGEMENT https://github.com/borghei/claude-skills
# npx -y --prefer-online skl-x add borghei/claude-skills -s \
#   agile-coach \
#   scrum-master \
#   sprint-retrospective \
#   summarize-meeting \
#   pm-interview-prep \
#   cycle-time-analyzer \
#   senior-pm \
#   pm-onboarding \
#   metrics-dashboard \
#   interview-synthesis \
#   pm-1on1s \
#   people-analytics \
#   -a codex claude-code -y -m sm

# # BLADER HUMANIZER https://github.com/blader/humanizer
# npx -y --prefer-online skl-x add blader/humanizer -s \
#   humanizer \
#   -a codex claude-code -y -m sm

# # OBRA THE-ELEMENTS-OF-STYLE https://github.com/obra/the-elements-of-style
# npx -y --prefer-online skl-x add obra/the-elements-of-style -s \
#   writing-clearly-and-concisely \
#   -a codex claude-code -y -m sm

# # LEONXLNX TASTE-SKILL https://github.com/Leonxlnx/taste-skill
# npx -y --prefer-online skl-x add Leonxlnx/taste-skill -s \
#   design-taste-frontend \
#   -a codex claude-code -y -m sm

# # PBAKAUS IMPECCABLE https://github.com/pbakaus/impeccable
# npx -y --prefer-online skl-x add pbakaus/impeccable -s \
#   impeccable \
#   -a codex claude-code -y -m sm

# # VERCEL-LABS AGENT-SKILLS https://github.com/vercel-labs/agent-skills
# npx -y --prefer-online skl-x add vercel-labs/agent-skills -s \
#   web-design-guidelines \
#   -a codex claude-code -y -m sm

# npx -y --prefer-online skl-x -v
# npx -y --prefer-online skl-x ls -g
# npx -y --prefer-online skl-x ls
# npx -y --prefer-online skl-x cst
# npx -y --prefer-online skl-x usg -p 2d
