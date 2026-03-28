import { RoleCode } from "@prisma/client";
import { subDays } from "date-fns";

import { requireSession } from "@/auth";
import { DataTable, PageShell, SectionCard, StatCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { getConsumptionReport } from "@/modules/reports/report-service";

export default async function ReportsPage() {
  const session = await requireSession();
  const report = await getConsumptionReport({
    from: subDays(new Date(), 15),
    to: new Date(),
    clientId: session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined,
  });

  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Asignaciones" value={report.summary.totalAssignments} />
        <StatCard label="Elegibles" value={report.summary.eligibleAssignments} />
        <StatCard label="Consumidos" value={report.summary.consumedTickets} />
        <StatCard label="Con colacion" value={report.summary.withSnack} />
      </div>
      <SectionCard title="Reporte operacional" description="Base para estados de pago quincenales o mensuales, con trazabilidad por fecha y trabajador.">
        <DataTable
          columns={["Fecha", "Trabajador", "Turno", "Fondo / Postre", "Colacion", "Ticket"]}
          rows={report.rows.map((row) => [
            formatDate(row.serviceDate),
            `${row.employee.firstName} ${row.employee.lastName}`,
            row.shift.name,
            `${row.menuSelection?.mainCourseOption?.name ?? "Sin fondo"} / ${row.menuSelection?.dessertOption?.name ?? "Sin postre"}`,
            row.hasSnack ? row.snackType?.name ?? "Si" : "No",
            row.ticket?.status ?? "Sin ticket",
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
