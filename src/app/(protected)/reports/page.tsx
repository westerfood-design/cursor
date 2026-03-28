import { RoleCode } from "@prisma/client";
import { format, subDays } from "date-fns";

import { requireRole } from "@/auth";
import { DataTable, PageShell, SectionCard, StatCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { getConsumptionReport, getPaymentBaseReport } from "@/modules/reports/report-service";

export default async function ReportsPage() {
  const session = await requireRole([RoleCode.WESTERFOOD_ADMIN, RoleCode.CLIENT_HR]);
  const from = subDays(new Date(), 15);
  const to = new Date();
  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined;

  const [report, paymentBase] = await Promise.all([
    getConsumptionReport({ from, to, clientId }),
    getPaymentBaseReport({ from, to, clientId }),
  ]);

  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");

  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Asignaciones" value={report.summary.totalAssignments} />
        <StatCard label="Elegibles" value={report.summary.eligibleAssignments} />
        <StatCard label="Consumidos" value={report.summary.consumedTickets} />
        <StatCard label="Con colacion" value={report.summary.withSnack} />
      </div>

      <SectionCard
        title="Exportaciones"
        description="Descarga base operativa y base de estado de pago en CSV para analisis quincenal o mensual."
        actions={
          <div className="flex flex-col gap-2 md:flex-row">
            <a className="rounded-xl bg-[var(--wf-red)] px-4 py-2 text-sm text-white transition hover:bg-[var(--wf-red-dark)]" href={`/api/reports/export?type=consumption&from=${fromStr}&to=${toStr}`}>Exportar consumo CSV</a>
            <a className="rounded-xl bg-[var(--wf-gray-dark)] px-4 py-2 text-sm text-white transition hover:bg-[var(--wf-gray)]" href={`/api/reports/export?type=payment-base&from=${fromStr}&to=${toStr}`}>Exportar base de pago CSV</a>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard label="Trabajadores base pago" value={paymentBase.totals.employees} />
          <StatCard label="Dias asignados" value={paymentBase.totals.assignedDays} />
          <StatCard label="Dias habilitados" value={paymentBase.totals.eligibleDays} />
          <StatCard label="Dias consumidos" value={paymentBase.totals.consumedDays} />
          <StatCard label="Dias colacion" value={paymentBase.totals.snackDays} />
        </div>
      </SectionCard>

      <SectionCard title="Reporte operacional" description="Base diaria para trazabilidad por fecha, trabajador y estado de ticket.">
        <DataTable
          columns={["Fecha", "Trabajador", "Turno", "Contrato / Faena / CC", "Fondo / Postre", "Colacion", "Ticket"]}
          rows={report.rows.map((row) => [
            formatDate(row.serviceDate),
            `${row.employee.firstName} ${row.employee.lastName}`,
            row.shift.name,
            `${row.contract?.name ?? "Sin contrato"} / ${row.worksite?.name ?? "Sin faena"} / ${row.costCenter?.name ?? "Sin CC"}`,
            `${row.menuSelection?.mainCourseOption?.name ?? "Sin fondo"} / ${row.menuSelection?.dessertOption?.name ?? "Sin postre"}`,
            row.hasSnack ? row.snackType?.name ?? "Si" : "No",
            row.ticket?.status ?? "Sin ticket",
          ])}
        />
      </SectionCard>

      <SectionCard title="Base de estado de pago" description="Consolidado por trabajador para cierres quincenales o mensuales.">
        <DataTable
          columns={["Trabajador", "Cliente", "Contrato / Faena / CC", "Turno", "Asignados", "Habilitados", "Consumidos", "Colacion"]}
          rows={paymentBase.rows.map((row) => [
            row.employeeName,
            row.clientName,
            `${row.contractName} / ${row.worksiteName} / ${row.costCenterName}`,
            row.shiftName,
            String(row.assignedDays),
            String(row.eligibleDays),
            String(row.consumedDays),
            String(row.snackDays),
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
