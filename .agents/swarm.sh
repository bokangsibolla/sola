#!/bin/bash
# SWARM MODE: Launch multiple agents simultaneously (Figure 6-7)
# Each runs in its own worktree, in the background
#
# Usage:
#   .agents/swarm.sh
#
# Edit the TASKS array below to define what each agent does.
# Output is logged to .agents/logs/

set -e

BASE_DIR="/Users/bokangsibolla/sola_backup"
LOG_DIR="$BASE_DIR/sola/.agents/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ============================================
# DEFINE YOUR AGENT TASKS HERE
# Format: "worktree|task description"
# ============================================
TASKS=(
  "bugfix|Go through every screen in the app and fix TypeScript errors. Run npx tsc --noEmit and fix all errors in app/, components/, and data/ directories. Ignore scripts/ and supabase/functions/."
  "content|Audit all external URLs and image references in the codebase. Check that every image in assets/images/ is actually used. List any broken references."
  "infra|Review all Supabase migrations in supabase/migrations/ for correctness. Check that every table has RLS policies. Create a summary report."
)

echo "=== SOLA AGENT SWARM ==="
echo "Launching ${#TASKS[@]} agents..."
echo "Logs: $LOG_DIR/"
echo ""

PIDS=()

for task_entry in "${TASKS[@]}"; do
  IFS='|' read -r worktree task <<< "$task_entry"
  WORKTREE_PATH="$BASE_DIR/sola-$worktree"
  LOG_FILE="$LOG_DIR/${worktree}_${TIMESTAMP}.log"

  if [ ! -d "$WORKTREE_PATH" ]; then
    echo "SKIP: Worktree sola-$worktree does not exist"
    continue
  fi

  echo "LAUNCHING: sola-$worktree"
  echo "  Task: ${task:0:80}..."
  echo "  Log:  $LOG_FILE"

  (cd "$WORKTREE_PATH" && claude --print "$task" > "$LOG_FILE" 2>&1) &
  PIDS+=($!)
done

echo ""
echo "=== All agents launched ==="
echo "PIDs: ${PIDS[*]}"
echo ""
echo "Monitor with:"
echo "  tail -f $LOG_DIR/*_${TIMESTAMP}.log"
echo ""
echo "Wait for all to finish:"
echo "  wait ${PIDS[*]}"

# Wait for all agents
for pid in "${PIDS[@]}"; do
  wait "$pid" 2>/dev/null || true
done

echo ""
echo "=== All agents completed ==="
echo "Review logs in $LOG_DIR/"
