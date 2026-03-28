import { RoleCode } from "@prisma/client";

import { requireRole } from "@/auth";
import { ClientForm } from "@/components/forms";
import { DataTable, PageShell, SectionCard, StatCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage() {
  await requireRole([RoleCode.WESTERFOOD_ADMIN]);
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: {
          employees: true,
          menus: true,
          totemDevices: true,
        },
      },
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
      <SectionCard title="Resumen ejecutivo" description="WesterFood centraliza clientes, contratos, menus, turnos, tickets y consumo con un modelo multi-tenant por clientId.">
        <div className="grid gap-3 text-sm text-zinc-700 md:grid-cols-2">
          <p><strong>Arquitectura recomendada:</strong> Next.js App Router, Prisma, PostgreSQL, auth por credenciales y servicios de dominio por modulo.</p>
          <p><strong>Alcance MVP:</strong> login por rol, CRUD de clientes y trabajadores, menús semanales, selección diaria, tótem, ticket único y reportes base.</p>
          <p><strong>Estructura propuesta:</strong> <code>src/app</code> para rutas, <code>src/modules</code> para negocio, <code>src/lib</code> para infraestructura, <code>prisma</code> para datos.</p>
          <p><strong>Roadmap técnico:</strong> 1) fundación y auth, 2) maestro de clientes y trabajadores, 3) menú y selección, 4) tickets/tótem, 5) reportes y estado de pago base.</p>
        </div>
      </SectionCard>
      <SectionCard title="Crear cliente" description="Alta de tenant con reglas de cierre de selección configurables.">
        <ClientForm />
      </SectionCard>
      <SectionCard title="Clientes registrados" description="Cada cliente tiene aislamiento lógico por tenant y configuración operativa propia.">
        <DataTable
          columns={["Cliente", "Slug", "RUT empresa", "Cierre", "Trabajadores", "Tótems"]}
          rows={clients.map((client) => [
            <div key={client.id}>
              <p className="font-medium text-zinc-900">{client.name}</p>
              <p className="text-xs text-zinc-500">{client.legalName}</p>
            </div>,
            client.slug,
            client.taxId,
            `Dia ${client.selectionCloseDay} / ${client.selectionCloseHour}:00`,
            String(client._count.employees),
            String(client._count.totemDevices),
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
