#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
fi

npm install
npm run db:generate
npm run db:push
npm run db:seed

echo "
Setup local completado. Ejecuta: npm run dev"
