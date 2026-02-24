#!/bin/bash
# Daily Supabase database backup script

set -euo pipefail

PROJECT_DIR="/Users/bokangsibolla/sola_backup/sola"
BACKUP_DIR="$PROJECT_DIR/backups/$(date +%Y-%m-%d)"
DB_HOST="db.bfyewxgdfkmkviajmfzp.supabase.co"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="postgres"
PG_DUMP="/opt/homebrew/opt/libpq/bin/pg_dump"

# Load password from .env
PGPASSWORD=$(grep SUPABASE_DB_PASSWORD "$PROJECT_DIR/.env" | cut -d'=' -f2)
export PGPASSWORD

mkdir -p "$BACKUP_DIR"

# Schema-only backup
"$PG_DUMP" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --schema=public --no-owner --no-privileges \
  -f "$BACKUP_DIR/schema.sql"

# Full backup (schema + data)
"$PG_DUMP" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --schema=public --no-owner --no-privileges --inserts \
  -f "$BACKUP_DIR/full-backup.sql"

# Delete backups older than 30 days
find "$PROJECT_DIR/backups" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true

echo "$(date): Backup complete → $BACKUP_DIR"
