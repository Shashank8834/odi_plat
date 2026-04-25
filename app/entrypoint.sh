#!/bin/sh
set -e

echo "Syncing database schema..."
./node_modules/.bin/prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss

echo "Starting server..."
exec node server.js
