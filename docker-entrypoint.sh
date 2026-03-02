#!/bin/sh

echo "=== Application Configuration ==="
echo "DATABASE_URL: $DATABASE_URL"
echo "Working directory: $(pwd)"
echo "Data directory: $(ls -la /app/data 2>&1)"
echo "================================="

# Ensure data directory exists
mkdir -p /app/data

# Check if we need to reset the database (if it has old schema)
# This is a safety measure for deployments with old database files
if [ -f "/app/data/dev.db" ] && [ "$RESET_DB" = "true" ]; then
  echo "Backing up and resetting old database..."
  mv /app/data/dev.db /app/data/dev.db.backup.$(date +%s)
fi

# Initialize database
echo "Initializing database..."
cd /app
node scripts/init-db.js

# Start application
echo "Starting application..."
exec node server.js
