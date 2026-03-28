# Fase 2 - Modelo de datos, relaciones, enums y estrategia multi-tenant

## 1. Estrategia multi-tenant

El modelo usa aislamiento logico por `clientId` en las entidades maestras y operativas del tenant.

### Reglas
- WesterFood Admin puede consultar transversalmente
- RRHH Cliente solo accede a su `clientId`
- Trabajador solo accede a su `employeeId` y a su tenant
- codigos de negocio deben ser unicos dentro del tenant, no globalmente

## 2. Entidades nucleares

### Identidad y acceso
- `Role`
- `User`

### Organizacion cliente
- `Client`
- `Contract`
- `Worksite`
- `CostCenter`

### Personas y configuracion de servicio
- `Employee`
- `EmployeeIdentifier`
- `Shift`
- `SnackType`

### Alimentacion y planificacion
- `Menu`
- `MenuDay`
- `MainCourseOption`
- `DessertOption`
- `MenuSelection`
- `DailyServiceAssignment`

### Validacion operacional
- `ConsumptionTicket`
- `TicketValidationLog`
- `TotemDevice`

## 3. Enums clave

### `RoleCode`
- `WESTERFOOD_ADMIN`
- `CLIENT_HR`
- `EMPLOYEE`

### `ShiftType`
- `FIXED_MONDAY_TO_FRIDAY`
- `CYCLICAL`
- `CUSTOM`

### `MenuStatus`
- `DRAFT`
- `PUBLISHED`
- `CLOSED`

### `TicketStatus`
- `PENDING`
- `ISSUED`
- `VALIDATED`
- `CONSUMED`
- `REJECTED`
- `CANCELLED`

### `TicketLogAction`
- `LOOKUP`
- `ISSUE`
- `VALIDATE`
- `CONSUME`
- `REJECT`
- `DUPLICATE_ATTEMPT`
- `NOT_ALLOWED`

### `IdentifierType`
- `RUT`
- `INTERNAL_CODE`
- `BADGE`

### `ServiceType`
- `LUNCH`
- `SNACK`
- `BREAKFAST`
- `DINNER`

## 4. Reglas del modelo

### Worker / Employee
- un `Employee` pertenece a un `Client`
- puede vincularse a contrato, faena y centro de costo
- tiene turno asignado
- define `hasSnack` y `snackTypeId`
- `rut` es unico dentro del tenant

### MenuSelection
- guarda exactamente una combinacion diaria de:
  - 1 fondo
  - 1 postre
- su unicidad es por `employeeId + serviceDate + serviceType`

### DailyServiceAssignment
- representa si al trabajador le corresponde servicio en una fecha
- se genera desde reglas de turno y contexto operativo
- puede apuntar a la seleccion diaria del menu

### ConsumptionTicket
- representa el ticket unico diario por trabajador y tipo de servicio
- su unicidad es por `employeeId + serviceDate + serviceType`
- referencia asignacion diaria y opcionalmente la seleccion del menu
- consolida un resumen JSON para lectura operacional rapida

### TicketValidationLog
- registra intentos, rechazos, validaciones y consumos
- permite auditoria y analitica operacional

### TotemDevice
- identifica punto de validacion fisico
- se vincula a tenant y opcionalmente a faena

## 5. Ajustes introducidos en esta fase

1. `Client.timezone`
   - prepara cierres operativos por tenant

2. `ServiceType`
   - hace consistente la regla de "1 ticket por trabajador por dia por servicio"
   - evita que el modelo quede implicitamente acoplado solo a almuerzo

3. `EmployeeIdentifier.clientId`
   - permite evitar colisiones globales entre tenants para credenciales o codigos internos

4. indices adicionales
   - menus por tenant y fecha
   - tickets por tenant, fecha, servicio y estado
   - maestros por tenant y estado

## 6. Invariantes de negocio

- un trabajador inactivo no puede seleccionar menu ni consumir
- no se puede seleccionar un menu no publicado
- no se puede seleccionar fuera de la ventana de cierre
- una seleccion diaria no puede tener multiples fondos ni multiples postres
- una asignacion diaria debe quedar ligada al turno vigente del trabajador
- un ticket consumido no puede volver a consumirse
- toda validacion relevante debe dejar rastro en `TicketValidationLog`

## 7. Proyeccion del modelo

El esquema ya permite evolucionar a:
- facturacion por periodo
- estado de pago quincenal o mensual
- multiples servicios por dia
- exportaciones operativas
- auditoria por tenant
- soporte de reglas de cierre mas complejas
