# Fase 1 - Resumen ejecutivo, arquitectura y decisiones tecnicas

## 1. Inspeccion del estado actual del repositorio

El repositorio ya cuenta con una base funcional del producto:

- Next.js App Router con TypeScript estricto
- Prisma con PostgreSQL
- autenticacion por credenciales con roles
- dashboards iniciales por rol
- modulos de menu, turnos, tickets, totem y reportes
- estructura modular en `src/app`, `src/modules`, `src/lib`, `prisma`

## 2. Que faltaba explicitar

Aunque la base tecnica existe, faltaba dejar documentado de forma mas rigurosa:

- arquitectura final objetivo del sistema
- alcance real del MVP y limites de esta iteracion
- estrategia multi-tenant formal
- decisiones tecnicas y trade-offs
- criterios para evolucionar a produccion sin reescribir el nucleo

## 3. Resumen ejecutivo del sistema

WesterFood SaaS es una plataforma multiempresa para administrar la operacion de alimentacion corporativa entre WesterFood, clientes corporativos y trabajadores finales.

El sistema debe resolver cinco flujos criticos:

1. planificacion del servicio por menu semanal
2. administracion de trabajadores, turnos, faenas y colacion
3. asignacion diaria automatica de servicio segun reglas operativas
4. validacion de consumo mediante ticket unico diario
5. consolidacion operativa para reportes y estado de pago

## 4. Arquitectura final recomendada

### Frontend y backend
- Next.js App Router como BFF y capa web principal
- Server Components para vistas protegidas y consultas iniciales
- Route Handlers para endpoints internos del producto
- componentes cliente solo donde exista interaccion real

### Dominio
Separacion por modulos de negocio:
- `auth`
- `menus`
- `shifts`
- `tickets`
- `reports`
- futuros modulos: `clients`, `contracts`, `worksites`, `billing`, `totems`

### Datos
- PostgreSQL como fuente de verdad
- Prisma como ORM
- estrategia de aislamiento logico por `clientId`
- claves compuestas e indices para consultas por tenant y fecha

### Seguridad
- autenticacion por credenciales y sesion JWT
- autorizacion por rol
- aislamiento de datos por tenant en servicios y endpoints
- endurecimiento recomendado a futuro con middleware, auditoria y politicas mas finas

## 5. Alcance del MVP

### Incluido en la base actual
- login con roles
- panel admin WesterFood
- panel RRHH cliente
- panel trabajador
- CRUD inicial de clientes
- CRUD inicial de trabajadores
- configuracion y lectura de turnos
- tipos de colacion configurables
- menu semanal con opciones por dia
- seleccion diaria de 1 fondo y 1 postre
- asignacion diaria de servicio
- ticket unico diario
- totem por RUT
- validacion de consumo y bloqueo de duplicados
- reportes operativos basicos

### No incluido aun
- CRUD completo de contratos, faenas y centros de costo
- administracion completa de dispositivos totem
- exportaciones avanzadas
- estado de pago formal por periodo
- auditoria de negocio transversal
- migraciones versionadas y CI
- SSO, invitaciones y gobierno enterprise

## 6. Decisiones tecnicas explicitas

1. **Multi-tenant logico por `clientId`**
   - simple de operar en MVP
   - compatible con futura separacion fisica si el negocio escala

2. **Modelo relacional fuerte**
   - se prioriza trazabilidad y consistencia sobre flexibilidad excesiva
   - contratos, faenas, centros de costo y tickets permanecen normalizados

3. **Servicios de dominio reutilizables**
   - reglas de menu, turnos y tickets no viven en la UI
   - backend y frontend comparten invariantes a traves de Zod y servicios

4. **Soporte por tipo de servicio**
   - se incorpora `ServiceType` para que el sistema pueda evolucionar desde almuerzo a desayuno, once o snack sin romper unicidad ni reportes

5. **Timezone por tenant**
   - el cierre de seleccion debe depender del cliente, no del servidor
   - se agrega `timezone` en `Client` como preparacion operativa

6. **Prisma 6 estable**
   - se mantiene Prisma 6.x para evitar complejidad no esencial del cambio mayor a Prisma 7 en esta etapa

## 7. Gap analysis actual

### Bien encaminado
- stack correcto para MVP SaaS
- esquema relacional amplio y expresivo
- base de auth y UI funcional
- experiencia de totem operativa

### Falta endurecer
- permisos mas granulares
- maestros completos para operacion enterprise
- exportaciones y billing base
- middleware transversal y auditoria
- migraciones formales y pipeline de calidad

## 8. Estructura objetivo del proyecto

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
  components/
  lib/
  modules/
    auth/
    clients/
    contracts/
    employees/
    menus/
    reports/
    shifts/
    tickets/
    totems/
  types/
docs/
  fase-1-arquitectura.md
  fase-2-modelo-de-datos.md
```

## 9. Preparacion para siguientes fases

La base queda lista para que las siguientes iteraciones implementen:
- CRUD completos de maestros
- administracion de menus desde UI
- gestion de totems
- consolidado de estado de pago
- exportaciones y gobernanza operativa
