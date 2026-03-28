import { RoleCode } from "@prisma/client";

import { requireRole } from "@/auth";
import { ClientCrudForm } from "@/components/crud-forms";
import { DataTable, PageShell, SectionCard, StatCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage() {
  await requireRole([RoleCode.WESTERFOOD_ADMIN]);
  const clients = await prisma.client.findMany({
    include: {
      _count: { select: { employees: true, menus: true, totemDevices: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Clientes activos" value={clients.filter((client) => client.active).length} />
        <StatCard label="Menus publicados" value={clients.reduce((sum, client) => sum + client._count.menus, 0)} />
        <StatCard label="Totems registrados" value={clients.reduce((sum, client) => sum + client._count.totemDevices, 0)} />
      </div>
      <SectionCard title="Crear cliente" description="Alta de tenant con timezone, cierre operativo y configuracion base.">
        <ClientCrudForm mode="create" />
      </SectionCard>
      <SectionCard title="Clientes registrados" description="Edicion directa de tenants y de sus reglas base de operacion.">
        <div className="grid gap-4">
          {clients.map((client) => (
            <div key={client.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">{client.name}</h3>
                  <p className="text-sm text-zinc-500">{client.legalName} · {client.slug}</p>
                </div>
                <p className="text-sm text-zinc-500">Trabajadores: {client._count.employees} · Totems: {client._count.totemDevices}</p>
              </div>
              <ClientCrudForm
                mode="edit"
                defaultValues={{
                  id: client.id,
                  name: client.name,
                  slug: client.slug,
                  legalName: client.legalName,
                  taxId: client.taxId,
                  timezone: client.timezone,
                  selectionCloseDay: client.selectionCloseDay,
                  selectionCloseHour: client.selectionCloseHour,
                  active: client.active,
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Vista tabular" description="Resumen rapido multiempresa para gestion administrativa.">
        <DataTable
          columns={["Cliente", "Slug", "Timezone", "Cierre", "Trabajadores", "Totems"]}
          rows={clients.map((client) => [
            client.name,
            client.slug,
            client.timezone,
            `Dia ${client.selectionCloseDay} / ${client.selectionCloseHour}:00`,
            String(client._count.employees),
            String(client._count.totemDevices),
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
