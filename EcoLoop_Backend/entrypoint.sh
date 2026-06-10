#!/bin/sh
set -e
echo "⏳ Corriendo migraciones Prisma..."
npx prisma migrate deploy
echo "✅ Migraciones listas. Iniciando servidor..."
exec node dist/index.js
