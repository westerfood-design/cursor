#!/usr/bin/env bash
set -euo pipefail

if command -v docker >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose up -d postgres
  else
    docker compose up -d postgres
  fi
else
  echo "Docker no esta instalado. Asegura una instancia PostgreSQL manualmente antes de continuar."
fi

npm run db:generate
npm run db:push
npm run db:seed
npm run dev
