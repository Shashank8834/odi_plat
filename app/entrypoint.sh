#!/bin/sh
set -e

echo "Syncing database schema..."
node ./node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma --url="$DATABASE_URL"

if [ -f ./prisma/seed-clients.ts ] && [ -f ./prisma/clients-data.json ]; then
  echo "Seeding clients from ODI list..."
  npx tsx ./prisma/seed-clients.ts || echo "Client seed skipped/failed (non-fatal)"
fi

echo "Starting server..."
exec node server.js
