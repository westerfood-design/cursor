import { RoleCode } from "@prisma/client";

import { requireRole } from "@/auth";
import { ShiftCrudForm, SnackTypeCrudForm } from "@/components/crud-forms";
import { Badge, DataTable, PageShell, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { describeShiftPattern } from "@/modules/shifts/shift-service";

export default async function AdminOperationsPage() {
  await requireRole([RoleCode.WESTERFOOD_ADMIN]);
  const defaultClient = await prisma.client.findFirst({ orderBy: { createdAt: "asc" } });
  const [shifts, snackTypes, devices] = await Promise.all([
    prisma.shift.findMany({ include: { client: true }, orderBy: [{ clientId: "asc" }, { name: "asc" }] }),
    prisma.snackType.findMany({ include: { client: true }, orderBy: [{ clientId: "asc" }, { name: "asc" }] }),
    prisma.totemDevice.findMany({ include: { client: true, worksite: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <PageShell>
      {defaultClient ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Crear turno" description="Configuracion operativa real de patrones de turno por tenant.">
            <ShiftCrudForm clientId={defaultClient.id} />
          </SectionCard>
          <SectionCard title="Crear tipo de colacion" description="Tipos configurables que impactan perfil, operacion, ticket y reportes.">
            <SnackTypeCrudForm clientId={defaultClient.id} />
          </SectionCard>
        </div>
      ) : null}
      <SectionCard title="Turnos configurados" description="Soporte para 7x7, 10x10, 14x14, lunes a viernes y patrones personalizados.">
        <DataTable columns={["Cliente", "Turno", "Codigo", "Tipo", "Patron"]} rows={shifts.map((shift) => [shift.client?.name ?? "Global", shift.name, shift.code, shift.type, describeShiftPattern(shift)])} />
      </SectionCard>
      <SectionCard title="Tipos de colacion" description="Configurables por cliente y reutilizados en perfil, operacion, ticket y reportes.">
        <DataTable
          columns={["Cliente", "Tipo", "Codigo", "Estado"]}
          rows={snackTypes.map((snackType) => [
            snackType.client.name,
            snackType.name,
            snackType.code,
            <Badge key={snackType.id} variant={snackType.active ? "success" : "warning"}>{snackType.active ? "Activo" : "Inactivo"}</Badge>,
          ])}
        />
      </SectionCard>
      <SectionCard title="Totems registrados" description="Cada dispositivo queda asociado a cliente, faena y punto de validacion.">
        <DataTable
          columns={["Cliente", "Dispositivo", "Codigo", "Faena", "Ultimo uso"]}
          rows={devices.map((device) => [
            device.client.name,
            device.name,
            device.code,
            device.worksite?.name ?? "Sin faena",
            device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString("es-CL") : "Sin actividad",
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
