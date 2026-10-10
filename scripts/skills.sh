#!/usr/bin/env sh
set -e

# echo the command in cyan, then run it
run() { printf '\033[0;36m%s\033[0m\n' "$*"; "$@"; }

run npx --prefer-online -y skl-x -v
# run npx -y skills -v
# run npx --prefer-online -y skl-x rm . -y -m s
run npx --prefer-online -y skl-x rm . -y

# SENTIMONY SKILLS https://github.com/sentimony/skills
# All at once
# run npx --prefer-online -y skl-x add sentimony/skills -a codex claude-code -y -m s

# Each one individually, using one command, the prefix " \ " intentionally disables the skill
# run npx --prefer-online -y skl-x add sentimony/skills -s \
#   scope-triage \
#   \ scope-check \
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
#   -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s \
#   prose-crafting \
#   dashfix \
#   negafix \
#   -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s \
#   \ skill-crafting \
#   -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s \
#   \ echarts \
#   -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s \
#   web-debug \
#   \ webapp-debugger \
#   commit-all \
#   gh-switch \
#   frontend-crafting \
#   vitest \
#   typescript \
#   maintaining-agent-context \
#   secret-hygiene \
#   -a codex claude-code -y -m s

# Each one individually, using separate commands
run npx --prefer-online -y skl-x add sentimony/skills -s scope-triage -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s scope-check -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s plan-crafting -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s inline-plan-dev -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s subagent-plan-dev -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s git-worktree-isolation -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s parallel-agents -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s tdd -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s cross-review -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s review-request -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s review-resolution -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s debugging -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s web-debug -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s webapp-debugger -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s verification-gate -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s branch-finish -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s commit-all -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s gh-switch -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s frontend-crafting -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s vitest -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s typescript -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s echarts -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s prose-crafting -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s dashfix -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s negafix -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s maintaining-agent-context -a codex claude-code -y -m s
run npx --prefer-online -y skl-x add sentimony/skills -s secret-hygiene -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add sentimony/skills -s skill-crafting -a codex claude-code -y -m s

# SHADCN UI https://github.com/shadcn/ui
# run npx --prefer-online -y skl-x add shadcn/ui -s migrate-radix-to-base -a codex claude-code -y -m s
# run npx --prefer-online -y skl-x add shadcn/ui -s shadcn -a codex claude-code -y -m s

# LOCAL & OTHER INTERESTING SKILLS
skills_local="$(dirname "$0")/skills.local.sh"
if [ -f "$skills_local" ]; then
  run sh "$skills_local"
fi

# reports need agent session history, which CI (npm ci runs this as postinstall) lacks
if [ -n "${CI:-}" ]; then exit 0; fi

# run npx --prefer-online -y skl-x -v
run npx --prefer-online -y skl-x ls -g
run npx --prefer-online -y skl-x ls
run npx --prefer-online -y skl-x cst
run npx --prefer-online -y skl-x usg -p 2d
