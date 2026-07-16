#!/usr/bin/env sh
set -e

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

cd "$PROJECT_ROOT"

echo "npx -y skillio -v" && npx -y skillio -v
echo "npx skillio rm . -y" && npx skillio rm . -y

echo "rm -rf node_modules/" && rm -rf node_modules/
echo "rm -rf package-lock.json" && rm -rf package-lock.json
echo "rm -rf dist/" && rm -rf dist/
echo "rm -rf .nuxt/" && rm -rf .nuxt/

echo "npx skillio ls" && npx skillio ls
