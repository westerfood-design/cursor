import { RoleCode } from "@prisma/client";

import { requireSession } from "@/auth";
import { Badge, DataTable, EmptyState, PageShell, SectionCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function MenusPage() {
  const session = await requireSession();
  const clientId = session.user.clientId ?? undefined;

  const menus = await prisma.menu.findMany({
    where: clientId ? { clientId } : undefined,
    include: {
      client: true,
      days: {
        include: {
          mainCourseOptions: true,
          dessertOptions: true,
          selections: true,
        },
        orderBy: { serviceDate: "asc" },
      },
    },
    orderBy: { weekStartDate: "desc" },
  });

  return (
    <PageShell>
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
      {session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? (
        <SectionCard title="Decisiones técnicas" description="Base de producción razonable y simple para evolucionar a una plataforma mayor.">
          <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700">
            <li>Multi-tenant por <code>clientId</code> en las entidades operativas y maestras.</li>
            <li>Validación frontend y backend con Zod y servicios de dominio.</li>
            <li>Turnos configurables sin hardcodeo de patrones de negocio.</li>
            <li>Ticket único diario por trabajador y fecha, con logs de trazabilidad.</li>
          </ul>
        </SectionCard>
      ) : null}
    </PageShell>
  );
}
