# WesterFood SaaS

Plataforma SaaS multiempresa para gestionar alimentacion corporativa, validacion operativa y autoservicio por totem.

## 1. Resumen ejecutivo del sistema

WesterFood SaaS centraliza la operacion de alimentacion B2B entre WesterFood, sus clientes corporativos y los trabajadores finales. El MVP incluido en este repositorio cubre:

- login con roles
- panel admin WesterFood
- panel RRHH cliente
- panel trabajador
- CRUD base de clientes y trabajadores
- configuracion de turnos y tipos de colacion
- menu semanal con fondo y postre por dia
- seleccion diaria restringida a 1 fondo + 1 postre
- asignacion diaria por turno
- ticket unico diario
- totem por RUT
- validacion de consumo y bloqueo de duplicados
- reportes operativos base

## 2. Arquitectura recomendada

- **Frontend / Backend**: Next.js App Router
- **Lenguaje**: TypeScript estricto
- **Persistencia**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth con credenciales y roles
- **Validacion**: Zod
- **Formularios**: React Hook Form
- **Estilo**: Tailwind CSS
- **Patron de codigo**:
  - `src/app`: rutas, layouts y endpoints
  - `src/modules`: reglas de negocio por modulo
  - `src/lib`: infraestructura, utilidades y acceso transversal
  - `prisma`: modelo de datos y seed

### Estrategia multi-tenant

Se usa aislamiento logico por `clientId` en las entidades operativas y maestras del tenant. El rol WesterFood puede operar transversalmente; RRHH y trabajador quedan acotados a su `clientId` y, en el caso del trabajador, a su `employeeId`.

## 3. Estructura de carpetas propuesta

```text
prisma/
  schema.prisma
  seed.ts
src/
  app/
    api/
    login/
    totem/
    (protected)/
      admin/
      hr/
      menus/
      my-menu/
      reports/
  components/
  lib/
  modules/
    auth/
    menus/
    reports/
    shifts/
    tickets/
  types/
```

## 4. Esquema Prisma inicial

El esquema incluye como minimo las entidades pedidas:

- User
- Role
- Client
- Contract
- Worksite
- CostCenter
- Employee
- EmployeeIdentifier
- Shift
- Menu
- MenuDay
- MainCourseOption
- DessertOption
- MenuSelection
- DailyServiceAssignment
- SnackType
- ConsumptionTicket
- TicketValidationLog
- TotemDevice

Ademas incorpora enums para roles, tipos de turno, estados de menu, estados de ticket y trazabilidad.

## 5. Roadmap tecnico por etapas

1. **Fundacion**: Next.js, Prisma, auth, roles y esquema multi-tenant.
2. **Maestros**: clientes, trabajadores, turnos, colacion, faenas y contratos.
3. **Operacion alimentaria**: menu semanal, seleccion por dia y asignacion diaria.
4. **Validacion**: ticket unico, totem por RUT, bloqueo de duplicados y logs.
5. **Analitica**: reportes por periodo y base de estado de pago.

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

## Notas de diseno

- La seleccion diaria valida en frontend y backend que exista exactamente 1 fondo y 1 postre.
- La colacion no esta hardcodeada; se modela con `SnackType` por tenant.
- El calculo de elegibilidad usa configuracion de turno y fecha de inicio del ciclo.
- El ticket es unico por trabajador y fecha y registra trazabilidad en `TicketValidationLog`.
- El totem no requiere sesion; opera por `clientSlug`, `deviceCode` y RUT.