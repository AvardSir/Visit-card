#!/bin/sh
set -e

echo "[entrypoint] applying schema to database..."
npx prisma db push --skip-generate

echo "[entrypoint] seeding database (idempotent)..."
node dist/prisma/seed.js

echo "[entrypoint] starting application..."
exec node dist/src/main.js