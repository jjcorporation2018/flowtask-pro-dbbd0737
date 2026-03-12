#!/bin/bash

# Configuration
BACKUP_DIR="/var/www/polaryon/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# Extract DATABASE_URL from .env
ENV_FILE="/var/www/polaryon/backend/.env"

if [ -f "$ENV_FILE" ]; then
    # Parse out DATABASE_URL (stripping quotes, whitespace, and query params like ?schema=public)
    DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -n1 | cut -d '=' -f 2- | tr -d '"' | tr -d "'" | tr -d '\r' | cut -d '?' -f 1)
    
    if [ -n "$DB_URL" ]; then
        # Use pg_dump directly
        pg_dump "$DB_URL" | gzip > "$BACKUP_FILE"
        
        # Cleanup old backups gracefully
        ls -tp "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | grep -v '/$' | tail -n +3 | xargs -I {} rm -- {}
        
        echo "Backup created: $BACKUP_FILE"
    else
        echo "DATABASE_URL is empty in $ENV_FILE" >&2
        exit 1
    fi
else
    echo "ERROR: $ENV_FILE not found" >&2
    exit 1
fi
