import { RoleCode } from "@prisma/client";

import { requireRole } from "@/auth";
import { ContractCrudForm, CostCenterCrudForm, ShiftCrudForm, SnackTypeCrudForm, TotemCrudForm, WorksiteCrudForm } from "@/components/crud-forms";
import { Badge, DataTable, PageShell, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { describeShiftPattern } from "@/modules/shifts/shift-service";

export default async function AdminOperationsPage() {
  await requireRole([RoleCode.WESTERFOOD_ADMIN]);
  const defaultClient = await prisma.client.findFirst({ orderBy: { createdAt: "asc" } });

  const [contracts, worksites, costCenters, shifts, snackTypes, devices] = await Promise.all([
    prisma.contract.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
    prisma.worksite.findMany({ include: { client: true, contract: true }, orderBy: { createdAt: "desc" } }),
    prisma.costCenter.findMany({ include: { client: true, contract: true }, orderBy: { createdAt: "desc" } }),
    prisma.shift.findMany({ include: { client: true }, orderBy: [{ clientId: "asc" }, { name: "asc" }] }),
    prisma.snackType.findMany({ include: { client: true }, orderBy: [{ clientId: "asc" }, { name: "asc" }] }),
    prisma.totemDevice.findMany({ include: { client: true, worksite: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <PageShell>
      {defaultClient ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Crear contrato" description="Contrato base por cliente para organizar faenas y centros de costo.">
            <ContractCrudForm clientId={defaultClient.id} />
          </SectionCard>
          <SectionCard title="Crear faena" description="Ubicacion o frente operacional donde se presta el servicio.">
            <WorksiteCrudForm clientId={defaultClient.id} contracts={contracts.filter((item) => item.clientId === defaultClient.id).map((item) => ({ id: item.id, name: item.name }))} />
          </SectionCard>
          <SectionCard title="Crear centro de costo" description="Permite consolidar consumo y estado de pago por unidad de negocio.">
            <CostCenterCrudForm clientId={defaultClient.id} contracts={contracts.filter((item) => item.clientId === defaultClient.id).map((item) => ({ id: item.id, name: item.name }))} />
          </SectionCard>
          <SectionCard title="Crear totem" description="Asocia dispositivo de autoservicio a cliente y faena.">
            <TotemCrudForm clientId={defaultClient.id} worksites={worksites.filter((item) => item.clientId === defaultClient.id).map((item) => ({ id: item.id, name: item.name }))} />
          </SectionCard>
          <SectionCard title="Crear turno" description="Configuracion operativa real de patrones de turno por tenant.">
            <ShiftCrudForm clientId={defaultClient.id} />
          </SectionCard>
          <SectionCard title="Crear tipo de colacion" description="Tipos configurables que impactan perfil, operacion, ticket y reportes.">
            <SnackTypeCrudForm clientId={defaultClient.id} />
          </SectionCard>
        </div>
      ) : null}

      <SectionCard title="Contratos" description="Base contractual del servicio por cliente.">
        <DataTable columns={["Cliente", "Contrato", "Codigo", "Estado"]} rows={contracts.map((contract) => [contract.client.name, contract.name, contract.code, contract.active ? "Activo" : "Inactivo"])} />
      </SectionCard>
      <SectionCard title="Faenas" description="Puntos operativos o ubicaciones de servicio.">
        <DataTable columns={["Cliente", "Faena", "Codigo", "Contrato", "Ubicacion"]} rows={worksites.map((worksite) => [worksite.client.name, worksite.name, worksite.code, worksite.contract?.name ?? "Sin contrato", worksite.location ?? "Sin ubicacion"])} />
      </SectionCard>
      <SectionCard title="Centros de costo" description="Consolidacion para control de consumo y pago.">
        <DataTable columns={["Cliente", "Centro de costo", "Codigo", "Contrato", "Estado"]} rows={costCenters.map((center) => [center.client.name, center.name, center.code, center.contract?.name ?? "Sin contrato", center.active ? "Activo" : "Inactivo"])} />
      </SectionCard>
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
        <DataTable columns={["Cliente", "Dispositivo", "Codigo", "Faena", "Ultimo uso"]} rows={devices.map((device) => [device.client.name, device.name, device.code, device.worksite?.name ?? "Sin faena", device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString("es-CL") : "Sin actividad"])} />
      </SectionCard>
    </PageShell>
  );
}
