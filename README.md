# WesterFood SaaS

Plataforma SaaS multiempresa para gestionar alimentacion corporativa, validacion operativa y autoservicio por totem.

## Estado del proyecto

El repositorio ya incluye una base funcional del MVP con:

- autenticacion por roles
- clientes
- trabajadores
- turnos
- colacion
- contratos
- faenas
- centros de costo
- menus semanales
- seleccion diaria validada
- totem por RUT
- ticket unico diario
- reportes operativos
- base de estado de pago
- exportaciones CSV

## Documentacion principal

- [Fase 1 - Arquitectura, alcance MVP y decisiones tecnicas](./docs/fase-1-arquitectura.md)
- [Fase 2 - Modelo de datos, enums y estrategia multi-tenant](./docs/fase-2-modelo-de-datos.md)

## Stack tecnico

- Next.js App Router
- TypeScript estricto
- PostgreSQL
- Prisma ORM
- NextAuth por credenciales y roles
- Zod
- React Hook Form
- Tailwind CSS

## Estructura principal

```text
prisma/
  schema.prisma
  seed.ts
src/
  app/
  components/
  lib/
  modules/
  types/
docs/
  fase-1-arquitectura.md
  fase-2-modelo-de-datos.md
scripts/
  setup-local.sh
  start-local.sh
docker-compose.yml
```

## Ejecutar desde GitHub (recomendado)

### Opcion A: con Docker

1. Clona el repo
2. Copia variables de entorno
3. Levanta PostgreSQL
4. Aplica schema y seed
5. Ejecuta la app

```bash
git clone <TU_REPO_GITHUB>
cd cursor
cp .env.example .env

docker compose up -d postgres
# o: docker-compose up -d postgres

npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Abrir en navegador:

```text
http://localhost:3000/login
```

### Opcion B: setup rapido

Si ya tienes PostgreSQL local corriendo y accesible por `DATABASE_URL`:

```bash
cp .env.example .env
bash scripts/setup-local.sh
npm run dev
```

### Opcion C: arranque todo en uno

```bash
bash scripts/start-local.sh
```

## Variables de entorno

Archivo base:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/westerfood"
NEXTAUTH_SECRET="change-this-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Credenciales demo

- Admin WesterFood: `admin@westerfood.cl` / `WesterFood123!`
- RRHH cliente: `rrhh@acme.cl` / `WesterFood123!`
- Trabajador: `trabajador@acme.cl` / `WesterFood123!`

## Comandos utiles

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:push
npm run db:seed
```

## Notas

- la unicidad operativa esta preparada por `serviceType`
- el tenant define `timezone` para evolucionar reglas de cierre con mayor precision
- reportes operativos restringidos a Admin WesterFood y RRHH Cliente
- el repositorio queda listo para clonar y ejecutar localmente desde GitHub con PostgreSQL en Docker o una instancia propia
