import { RoleCode } from "@prisma/client";
import { startOfWeek } from "date-fns";

import { requireRole } from "@/auth";
import { MenuSelectionForm } from "@/components/menu-selection-form";
import { Badge, EmptyState, PageShell, SectionCard, StatCard } from "@/components/ui";
import { getSelectionClosureDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function MyMenuPage() {
  const session = await requireRole([RoleCode.EMPLOYEE]);
  const employeeId = session.user.employeeId!;
  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
    include: { snackType: true, shift: true, client: true },
  });

  const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const menu = await prisma.menu.findFirst({
    where: {
      clientId: employee.clientId,
      weekStartDate: currentWeek,
    },
    include: {
      days: {
        include: {
          mainCourseOptions: { where: { active: true } },
          dessertOptions: { where: { active: true } },
          selections: {
            where: { employeeId },
          },
        },
        orderBy: { serviceDate: "asc" },
      },
    },
  });

  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Cliente" value={employee.client.name} />
        <StatCard label="Turno" value={employee.shift.name} />
        <StatCard label="Colacion" value={employee.hasSnack ? employee.snackType?.name ?? "Si" : "No"} />
        <StatCard label="Cierre semanal" value={menu ? formatDateTime(getSelectionClosureDate(menu.weekStartDate, menu.selectionCloseDay, menu.selectionCloseHour)) : "Sin menu"} />
      </div>
      <SectionCard title="Calendario de alimentacion" description="Seleccion semanal validada con restriccion de un fondo y un postre por dia.">
        {!menu ? (
          <EmptyState title="Sin menu publicado" description="Aun no hay un menu semanal disponible para tu cliente." />
        ) : (
          <div className="grid gap-4">
            {menu.days.map((day) => {
              const selection = day.selections[0];
              return (
                <div key={day.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">{formatDate(day.serviceDate, "EEEE dd MMM yyyy")}</h3>
                      <p className="text-sm text-zinc-500">{day.notes ?? "Servicio diario programado"}</p>
                    </div>
                    <Badge variant={selection ? "success" : "default"}>{selection ? "Seleccionado" : "Pendiente"}</Badge>
                  </div>
                  <MenuSelectionForm
                    employeeId={employee.id}
                    menuDay={{
                      id: day.id,
                      mainCourseOptions: day.mainCourseOptions.map((option) => ({ id: option.id, name: option.name })),
                      dessertOptions: day.dessertOptions.map((option) => ({ id: option.id, name: option.name })),
                    }}
                    defaultMainCourseOptionId={selection?.mainCourseOptionId}
                    defaultDessertOptionId={selection?.dessertOptionId}
                  />
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
