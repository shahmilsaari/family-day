#!/bin/sh
set -e

# Initialize SQLite database if it doesn't exist
if [ ! -f /app/data/family-day.db ]; then
  echo "Initializing SQLite database..."
  node scripts/init-sqlite.mjs
  echo "Database initialized."
else
  echo "Database already exists, skipping initialization."
fi

# Start the Next.js server
exec node server.js