#!/bin/sh
set -e

echo "Syncing database schema..."
node ./node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma --skip-generate

echo "Starting server..."
exec node server.js
