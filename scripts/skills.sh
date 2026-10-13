#!/usr/bin/env sh
set -e

# blank line, the command in magenta, then run it
run() { printf '\n\033[0;35m%s\033[0m\n' "$*"; "$@"; }

run npx --prefer-online -y skl-x -v
# run npx -y skills -v
# run npx --prefer-online -y skl-x rm . -y -m sm

# SENTIMONY SKILLS https://github.com/sentimony/skills
# All at once
# run npx --prefer-online -y skl-x add sentimony/skills -a codex claude-code -y -m md

# Each one individually, using one command, the prefix " \ " intentionally disables the skill
# run npx --prefer-online -y skl-x add sentimony/skills -s \
#   scope-triage \
#   scope-check \
#   plan-crafting \
#   inline-plan-dev \
#   subagent-plan-dev \
#   git-worktree-isolation \
#   parallel-agents \
#   tdd \
#   cross-review \
#   review-request \
#   review-resolution \
#   debugging \
#   verification-gate \
#   branch-finish \
#   prose-crafting \
#   dashfix \
#   negafix \
#   \ skill-crafting \
#   \ echarts \
#   web-debug \
#   \ webapp-debugger \
#   commit-all \
#   gh-switch \
#   frontend-crafting \
#   vitest \
#   typescript \
#   maintaining-agent-context \
#   secret-hygiene \
#   -a codex claude-code -y -m md

# Each one individually, using separate commands
run npx --prefer-online -y skl-x add sentimony/skills -s scope-triage -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s scope-check -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s plan-crafting -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s inline-plan-dev -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s subagent-plan-dev -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s git-worktree-isolation -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s parallel-agents -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s tdd -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s cross-review -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s review-request -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s review-resolution -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s debugging -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s web-debug -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add sentimony/skills -s webapp-debugger -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s verification-gate -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s branch-finish -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s commit-all -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s gh-switch -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s frontend-crafting -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s vitest -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s typescript -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add sentimony/skills -s echarts -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s prose-crafting -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s dashfix -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s negafix -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s maintaining-agent-context -a codex claude-code -y -m md
run npx --prefer-online -y skl-x add sentimony/skills -s secret-hygiene -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add sentimony/skills -s skill-crafting -a codex claude-code -y -m md

# LOCAL SKILLS
skills_local="$(dirname "$0")/skills.local.sh"
if [ -f "$skills_local" ]; then
  run sh "$skills_local"
fi

# OTHER INTERESTING SKILLS
# MATTPOCOCK SKILLS https://github.com/mattpocock/skills
# run npx --prefer-online -y skl-x add mattpocock/skills -s grill-me -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add mattpocock/skills -s grill-with-docs -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add mattpocock/skills -s grilling -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add mattpocock/skills -s domain-modeling -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add mattpocock/skills -s improve-codebase-architecture -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add mattpocock/skills -s writing-for-agents -a codex claude-code -y -m md

# SHADCN UI https://github.com/shadcn/ui
# run npx --prefer-online -y skl-x add shadcn/ui -s migrate-radix-to-base -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add shadcn/ui -s shadcn -a codex claude-code -y -m md

# CLOUDFLARE SKILLS https://github.com/cloudflare/skills
# run npx --prefer-online -y skl-x add cloudflare/skills -s wrangler -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add cloudflare/skills -s cloudflare-one -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add cloudflare/skills -s workers-best-practices -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add cloudflare/skills -s durable-objects -a codex claude-code -y -m md

# ANTHROPIC SKILLS https://github.com/anthropics/skills
# run npx --prefer-online -y skl-x add anthropics/skills -s frontend-design -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/skills -s algorithmic-art -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/skills -s brand-guidelines -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/skills -s canvas-design -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/skills -s doc-coauthoring -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/skills -s webapp-testing -a codex claude-code -y -m md

# ANTHROPIC CLAUDE-PLUGINS-OFFICIAL https://github.com/anthropics/claude-plugins-official
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s agent-development -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s claude-md-improver -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s claude-automation-recommender -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s code-review -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s command-development -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s hook-development -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s session-report -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add anthropics/claude-plugins-official -s skill-development -a codex claude-code -y -m md

# BORGHEI PROJECT-MANAGEMENT https://github.com/borghei/claude-skills
# run npx --prefer-online -y skl-x add borghei/claude-skills -s agile-coach -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s scrum-master -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s sprint-retrospective -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s summarize-meeting -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s pm-interview-prep -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s cycle-time-analyzer -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s senior-pm -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s pm-onboarding -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s metrics-dashboard -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s interview-synthesis -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s pm-1on1s -a codex claude-code -y -m md
# run npx --prefer-online -y skl-x add borghei/claude-skills -s people-analytics -a codex claude-code -y -m md

# BLADER HUMANIZER https://github.com/blader/humanizer
# run npx --prefer-online -y skl-x add blader/humanizer -a codex claude-code -y -m md

# OBRA THE-ELEMENTS-OF-STYLE https://github.com/obra/the-elements-of-style
# run npx --prefer-online -y skl-x add obra/the-elements-of-style -s writing-clearly-and-concisely -a codex claude-code -y -m md

# LEONXLNX TASTE-SKILL https://github.com/Leonxlnx/taste-skill
# run npx --prefer-online -y skl-x add Leonxlnx/taste-skill -s design-taste-frontend -a codex claude-code -y -m md

# PBAKAUS IMPECCABLE https://github.com/pbakaus/impeccable
# run npx --prefer-online -y skl-x add pbakaus/impeccable -s impeccable -a codex claude-code -y -m md

# VERCEL-LABS AGENT-SKILLS https://github.com/vercel-labs/agent-skills
# run npx --prefer-online -y skl-x add vercel-labs/agent-skills -s web-design-guidelines -a codex claude-code -y -m md

# reports need agent session history, which CI (npm ci runs this as postinstall) lacks
if [ -n "${CI:-}" ]; then exit 0; fi

# run npx --prefer-online -y skl-x -v
run npx --prefer-online -y skl-x ls -g
run npx --prefer-online -y skl-x ls
run npx --prefer-online -y skl-x cst
run npx --prefer-online -y skl-x usg -p 2d
