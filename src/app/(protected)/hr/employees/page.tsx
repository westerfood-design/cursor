import { RoleCode } from "@prisma/client";

import { requireRole } from "@/auth";
import { EmployeeForm } from "@/components/forms";
import { Badge, DataTable, PageShell, SectionCard, StatCard } from "@/components/ui";
import { formatRut } from "@/lib/rut";
import { prisma } from "@/lib/prisma";

export default async function HrEmployeesPage() {
  const session = await requireRole([RoleCode.CLIENT_HR]);
  const clientId = session.user.clientId!;

  const [employees, shifts, snackTypes, client] = await Promise.all([
    prisma.employee.findMany({
      where: { clientId },
      include: {
        shift: true,
        snackType: true,
        contract: true,
        worksite: true,
        costCenter: true,
      },
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
        <EmployeeForm
          clientId={clientId}
          shifts={shifts.map((shift) => ({ id: shift.id, name: shift.name }))}
          snackTypes={snackTypes.map((snackType) => ({ id: snackType.id, name: snackType.name }))}
        />
      </SectionCard>
      <SectionCard title="Dotacion" description="RRHH puede activar, desactivar y auditar la configuracion alimentaria de cada trabajador.">
        <DataTable
          columns={["Trabajador", "RUT", "Turno", "Colacion", "Faena / CC", "Estado"]}
          rows={employees.map((employee) => [
            <div key={employee.id}>
              <p className="font-medium text-zinc-900">{employee.firstName} {employee.lastName}</p>
              <p className="text-xs text-zinc-500">{employee.email ?? "Sin correo"}</p>
            </div>,
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
