#!/bin/sh
set -e

# Database file path
DB_FILE="/app/data/dev.db"

# Ensure data directory exists
mkdir -p /app/data

# Set DATABASE_URL if not already set
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="file:/app/data/dev.db"
fi

# Check if database exists, if not create it
if [ ! -f "$DB_FILE" ]; then
    echo "Database not found at $DB_FILE. Creating database..."
    echo "DATABASE_URL: $DATABASE_URL"
    # Try to run migrations first, if that fails use db push
    if ! npx prisma migrate deploy 2>/dev/null; then
        echo "No migrations found, using prisma db push..."
        npx prisma db push --accept-data-loss
    fi
    echo "Database created successfully!"
else
    echo "Database exists at $DB_FILE. Running migrations to ensure schema is up to date..."
    npx prisma migrate deploy || echo "No new migrations to apply"
fi

# Execute the main command
exec "$@"
