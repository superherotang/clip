#!/bin/sh

echo "=== Application Configuration ==="
echo "DATABASE_URL: $DATABASE_URL"
echo "Working directory: $(pwd)"
echo "Data directory: $(ls -la /app/data 2>&1)"
echo "================================="

# Ensure data directory exists
mkdir -p /app/data

# Initialize database
echo "Initializing database..."
cd /app
node scripts/init-db.js

# Start application
echo "Starting application..."
exec node server.js
