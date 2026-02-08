#!/bin/bash
# Check status of all worktrees and their branches
#
# Usage: .agents/status.sh

echo "=== SOLA WORKTREE STATUS ==="
echo ""

git worktree list | while read -r line; do
  path=$(echo "$line" | awk '{print $1}')
  branch=$(echo "$line" | sed 's/.*\[//' | sed 's/\]//')

  echo "--- $branch ---"
  echo "Path: $path"

  # Show uncommitted changes count
  changes=$(cd "$path" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  echo "Uncommitted changes: $changes"

  # Show commits ahead of main
  if [ "$branch" != "main" ]; then
    ahead=$(cd "$path" && git log main.."$branch" --oneline 2>/dev/null | wc -l | tr -d ' ')
    echo "Commits ahead of main: $ahead"
  fi

  echo ""
done
