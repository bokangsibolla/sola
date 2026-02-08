#!/bin/bash
# Launch a Claude Code agent in a specific worktree
#
# Usage:
#   .agents/launch-agent.sh bugfix "Audit all screens for iOS bugs and fix safe area issues"
#   .agents/launch-agent.sh content "Populate safety data for all cities in the database"
#   .agents/launch-agent.sh infra "Set up RevenueCat subscription integration"

set -e

WORKTREE="$1"
TASK="$2"
BASE_DIR="/Users/bokangsibolla/sola_backup"

if [ -z "$WORKTREE" ] || [ -z "$TASK" ]; then
  echo "Usage: .agents/launch-agent.sh <worktree> <task>"
  echo ""
  echo "Worktrees available:"
  git worktree list
  echo ""
  echo "Examples:"
  echo '  .agents/launch-agent.sh bugfix "Fix all TypeScript errors in app/ and components/"'
  echo '  .agents/launch-agent.sh content "Verify all city URLs and links work"'
  echo '  .agents/launch-agent.sh infra "Add RevenueCat subscription flow"'
  exit 1
fi

WORKTREE_PATH="$BASE_DIR/sola-$WORKTREE"

if [ ! -d "$WORKTREE_PATH" ]; then
  echo "Error: Worktree '$WORKTREE_PATH' does not exist."
  echo "Available worktrees:"
  git worktree list
  exit 1
fi

echo "=== Launching agent in sola-$WORKTREE ==="
echo "Task: $TASK"
echo "Path: $WORKTREE_PATH"
echo ""

# Launch Claude Code in the worktree directory
cd "$WORKTREE_PATH"
claude --print "$TASK"
