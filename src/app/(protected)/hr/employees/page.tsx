import { RoleCode } from "@prisma/client";

import { requireRole } from "@/auth";
import { EmployeeCrudForm } from "@/components/crud-forms";
import { Badge, DataTable, PageShell, SectionCard, StatCard } from "@/components/ui";
import { formatRut } from "@/lib/rut";
import { prisma } from "@/lib/prisma";

export default async function HrEmployeesPage() {
  const session = await requireRole([RoleCode.CLIENT_HR, RoleCode.WESTERFOOD_ADMIN]);
  const clientId = session.user.clientId ?? (await prisma.client.findFirstOrThrow()).id;

  const [employees, shifts, snackTypes, client] = await Promise.all([
    prisma.employee.findMany({
      where: { clientId },
      include: { shift: true, snackType: true, contract: true, worksite: true, costCenter: true },
      orderBy: [{ active: "desc" }, { lastName: "asc" }],
    }),
    prisma.shift.findMany({ where: { clientId, active: true }, orderBy: { name: "asc" } }),
    prisma.snackType.findMany({ where: { clientId, active: true }, orderBy: { name: "asc" } }),
    prisma.client.findUniqueOrThrow({ where: { id: clientId } }),
  ]);

  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Trabajadores" value={employees.length} />
        <StatCard label="Activos" value={employees.filter((employee) => employee.active).length} />
        <StatCard label="Con colacion" value={employees.filter((employee) => employee.hasSnack).length} />
        <StatCard label="Cliente" value={client.name} />
      </div>
      <SectionCard title="Nuevo trabajador" description="Perfil con turno, colacion, faena, contrato y centro de costo.">
        <EmployeeCrudForm clientId={clientId} shifts={shifts.map((shift) => ({ id: shift.id, name: shift.name }))} snackTypes={snackTypes.map((snackType) => ({ id: snackType.id, name: snackType.name }))} mode="create" />
      </SectionCard>
      <SectionCard title="Dotacion" description="RRHH puede crear, editar, activar, desactivar y auditar la configuracion alimentaria de cada trabajador.">
        <div className="grid gap-4">
          {employees.map((employee) => (
            <div key={employee.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">{employee.firstName} {employee.lastName}</h3>
                  <p className="text-sm text-zinc-500">{formatRut(employee.rut)} · {employee.email ?? "Sin correo"}</p>
                </div>
                <Badge variant={employee.active ? "success" : "warning"}>{employee.active ? "Activo" : "Inactivo"}</Badge>
              </div>
              <EmployeeCrudForm
                mode="edit"
                clientId={clientId}
                shifts={shifts.map((shift) => ({ id: shift.id, name: shift.name }))}
                snackTypes={snackTypes.map((snackType) => ({ id: snackType.id, name: snackType.name }))}
                defaultValues={{
                  id: employee.id,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  rut: employee.rut,
                  email: employee.email ?? "",
                  shiftId: employee.shiftId,
                  active: employee.active,
                  hasSnack: employee.hasSnack,
                  snackTypeId: employee.snackTypeId ?? "",
                  hireDate: employee.hireDate.toISOString().slice(0, 10),
                  shiftStartDate: employee.shiftStartDate.toISOString().slice(0, 10),
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Vista tabular" description="Resumen rapido de dotacion, turno y colacion por trabajador.">
        <DataTable
          columns={["Trabajador", "RUT", "Turno", "Colacion", "Faena / CC", "Estado"]}
          rows={employees.map((employee) => [
            `${employee.firstName} ${employee.lastName}`,
            formatRut(employee.rut),
            employee.shift.name,
            employee.hasSnack ? employee.snackType?.name ?? "Si" : "No",
            `${employee.worksite?.name ?? "Sin faena"} / ${employee.costCenter?.name ?? "Sin CC"}`,
            <Badge key={employee.id} variant={employee.active ? "success" : "warning"}>{employee.active ? "Activo" : "Inactivo"}</Badge>,
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
