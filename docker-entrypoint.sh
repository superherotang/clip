#!/bin/sh
set -e

# Database file path
DB_FILE="/app/data/dev.db"

# Ensure data directory exists
mkdir -p /app/data

# Check if database exists, if not create it
if [ ! -f "$DB_FILE" ]; then
    echo "Database not found at $DB_FILE. Creating database..."
    # Run Prisma migrations or push schema
    npx prisma migrate deploy || npx prisma db push --accept-data-loss
    echo "Database created successfully!"
else
    echo "Database exists at $DB_FILE. Running migrations to ensure schema is up to date..."
    npx prisma migrate deploy || echo "No new migrations to apply"
fi

# Execute the main command
exec "$@"
