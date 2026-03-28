import { RoleCode } from "@prisma/client";

import { requireSession } from "@/auth";
import { WeeklyMenuForm } from "@/components/crud-forms";
import { Badge, DataTable, EmptyState, PageShell, SectionCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function MenusPage() {
  const session = await requireSession();
  const clientId = session.user.clientId ?? (session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? (await prisma.client.findFirst())?.id : undefined);

  const menus = await prisma.menu.findMany({
    where: clientId ? { clientId } : undefined,
    include: {
      client: true,
      days: { include: { mainCourseOptions: true, dessertOptions: true, selections: true }, orderBy: { serviceDate: "asc" } },
    },
    orderBy: { weekStartDate: "desc" },
  });

  const client = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;

  return (
    <PageShell>
      {client && session.user.roleCode !== RoleCode.EMPLOYEE ? (
        <SectionCard title="Crear menu semanal" description="Publica rapidamente una semana operativa con 2 fondos y 2 postres por dia.">
          <WeeklyMenuForm clientId={client.id} selectionCloseDay={client.selectionCloseDay} selectionCloseHour={client.selectionCloseHour} />
        </SectionCard>
      ) : null}
      <SectionCard title="Menus semanales" description="Publicacion semanal con opciones de fondo y postre por dia, y cierre configurable por cliente.">
        {menus.length === 0 ? (
          <EmptyState title="Sin menus" description="Aun no existen menus publicados para este tenant." />
        ) : (
          <div className="grid gap-4">
            {menus.map((menu) => (
              <div key={menu.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">{menu.name}</h3>
                    <p className="text-sm text-zinc-500">{menu.client.name} · Semana desde {formatDate(menu.weekStartDate)}</p>
                  </div>
                  <Badge variant={menu.status === "PUBLISHED" ? "success" : menu.status === "CLOSED" ? "warning" : "default"}>{menu.status}</Badge>
                </div>
                <DataTable
                  columns={["Fecha", "Fondos", "Postres", "Selecciones"]}
                  rows={menu.days.map((day) => [
                    formatDate(day.serviceDate, "EEEE dd MMM"),
                    <ul key={`${day.id}-main`} className="list-disc pl-4">{day.mainCourseOptions.map((option) => <li key={option.id}>{option.name}</li>)}</ul>,
                    <ul key={`${day.id}-dessert`} className="list-disc pl-4">{day.dessertOptions.map((option) => <li key={option.id}>{option.name}</li>)}</ul>,
                    String(day.selections.length),
                  ])}
                />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
