import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { getConsumptionReport } from "@/modules/reports/report-service";

const schema = z.object({
  from: z.string(),
  to: z.string(),
  clientId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await requireSession();
  const url = new URL(request.url);

  try {
    if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
      return jsonError("No autorizado.", 403);
    }

    const payload = schema.parse({
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
      clientId: url.searchParams.get("clientId") ?? undefined,
    });

    if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && payload.clientId && payload.clientId !== session.user.clientId) {
      return jsonError("No autorizado para consultar otro cliente.", 403);
    }

    const report = await getConsumptionReport({
      from: new Date(payload.from),
      to: new Date(payload.to),
      clientId: session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? payload.clientId : session.user.clientId ?? undefined,
    });

    return jsonOk(report);
  } catch (error) {
    return jsonError("No fue posible generar el reporte.", 400, error);
  }
}
