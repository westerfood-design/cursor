import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  active: z.boolean().optional(),
  shiftId: z.string().optional(),
  hasSnack: z.boolean().optional(),
  snackTypeId: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }

  try {
    const payload = schema.parse(await request.json());
    const { id } = await params;
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return jsonError("Trabajador no encontrado.", 404);
    if (session.user.roleCode === RoleCode.CLIENT_HR && employee.clientId !== session.user.clientId) {
      return jsonError("No autorizado para este trabajador.", 403);
    }
    const updated = await prisma.employee.update({ where: { id }, data: payload });
    return jsonOk({ employee: updated });
  } catch (error) {
    return jsonError("No fue posible actualizar el trabajador.", 400, error);
  }
}
