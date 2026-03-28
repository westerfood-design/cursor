import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { getConsumptionReport, getPaymentBaseReport, toCsv } from "@/modules/reports/report-service";

const schema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(["consumption", "payment-base"]),
  clientId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await requireSession();
  const url = new URL(request.url);

  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return new Response("No autorizado", { status: 403 });
  }

  const payload = schema.parse({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
    type: url.searchParams.get("type"),
    clientId: url.searchParams.get("clientId") ?? undefined,
  });

  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? payload.clientId : session.user.clientId ?? undefined;

  if (payload.type === "payment-base") {
    const report = await getPaymentBaseReport({ from: new Date(payload.from), to: new Date(payload.to), clientId });
    const csv = toCsv(report.rows.map((row) => ({
      trabajador: row.employeeName,
      cliente: row.clientName,
      contrato: row.contractName,
      faena: row.worksiteName,
      centro_costo: row.costCenterName,
      turno: row.shiftName,
      dias_asignados: row.assignedDays,
      dias_habilitados: row.eligibleDays,
      dias_consumidos: row.consumedDays,
      dias_colacion: row.snackDays,
    })));
    return new Response(csv, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=payment-base-${payload.from}-${payload.to}.csv` } });
  }

  const report = await getConsumptionReport({ from: new Date(payload.from), to: new Date(payload.to), clientId });
  const csv = toCsv(report.rows.map((row) => ({
    fecha: row.serviceDate.toISOString().slice(0, 10),
    trabajador: `${row.employee.firstName} ${row.employee.lastName}`,
    cliente: row.employee.client.name,
    contrato: row.contract?.name ?? "",
    faena: row.worksite?.name ?? "",
    centro_costo: row.costCenter?.name ?? "",
    turno: row.shift.name,
    fondo: row.menuSelection?.mainCourseOption?.name ?? "",
    postre: row.menuSelection?.dessertOption?.name ?? "",
    colacion: row.hasSnack ? row.snackType?.name ?? "SI" : "NO",
    ticket: row.ticket?.status ?? "SIN_TICKET",
  })));

  return new Response(csv, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=consumption-${payload.from}-${payload.to}.csv` } });
}
