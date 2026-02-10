#!/bin/bash
# Launch an INTERACTIVE Claude Code session in a worktree
# Use this when you want to pair-code with the agent (design-sensitive work)
#
# Usage:
#   .agents/launch-interactive.sh bugfix
#   .agents/launch-interactive.sh content

set -e

WORKTREE="$1"
BASE_DIR="/Users/bokangsibolla/sola_backup"

if [ -z "$WORKTREE" ]; then
  echo "Usage: .agents/launch-interactive.sh <worktree>"
  echo ""
  echo "Worktrees:"
  git worktree list
  exit 1
fi

WORKTREE_PATH="$BASE_DIR/sola-$WORKTREE"

if [ ! -d "$WORKTREE_PATH" ]; then
  echo "Error: Worktree '$WORKTREE_PATH' does not exist."
  exit 1
fi

echo "=== Opening interactive Claude Code in sola-$WORKTREE ==="
cd "$WORKTREE_PATH"
claude
