# WesterFood SaaS

Plataforma SaaS multiempresa para gestionar alimentacion corporativa, validacion operativa y autoservicio por totem.

## Estado actual del repositorio

El proyecto ya cuenta con una base funcional de MVP sobre Next.js, Prisma y autenticacion por roles. En esta iteracion quedaron explicitadas y reforzadas la **Fase 1** y la **Fase 2** del producto.

## Documentacion principal

- [Fase 1 - Arquitectura, alcance MVP y decisiones tecnicas](./docs/fase-1-arquitectura.md)
- [Fase 2 - Modelo de datos, enums y estrategia multi-tenant](./docs/fase-2-modelo-de-datos.md)

## Resumen rapido

WesterFood SaaS centraliza:
- seleccion de menu semanal
- administracion de trabajadores y turnos
- colacion configurable por tenant
- ticket unico diario por servicio
- validacion de consumo via totem
- reportes operativos base

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
```

## Puesta en marcha

1. Copia `.env.example` a `.env`
2. Configura una base PostgreSQL accesible en `DATABASE_URL`
3. Ejecuta:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Credenciales demo

- Admin WesterFood: `admin@westerfood.cl` / `WesterFood123!`
- RRHH cliente: `rrhh@acme.cl` / `WesterFood123!`
- Trabajador: `trabajador@acme.cl` / `WesterFood123!`

## Notas de implementacion

- la unicidad operativa ya esta preparada por `serviceType`
- el tenant define `timezone` para evolucionar reglas de cierre con mayor precision
- reportes operativos restringidos a Admin WesterFood y RRHH Cliente
- la siguiente fase natural es completar CRUDs de contratos, faenas, centros de costo, menus y administracion de totems
