import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().optional(),
  shiftId: z.string().optional(),
  contractId: z.string().optional(),
  worksiteId: z.string().optional(),
  costCenterId: z.string().optional(),
  active: z.boolean().optional(),
  hasSnack: z.boolean().optional(),
  snackTypeId: z.string().nullable().optional(),
  hireDate: z.string().optional(),
  shiftStartDate: z.string().optional(),
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

    if (payload.hasSnack === true && !payload.snackTypeId && !employee.snackTypeId) {
      return jsonError("snackType es obligatorio cuando hasSnack=true.", 400);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...payload,
        contractId: payload.contractId === "" ? null : payload.contractId,
        worksiteId: payload.worksiteId === "" ? null : payload.worksiteId,
        costCenterId: payload.costCenterId === "" ? null : payload.costCenterId,
        snackTypeId: payload.hasSnack === false ? null : payload.snackTypeId,
        hireDate: payload.hireDate ? new Date(payload.hireDate) : undefined,
        shiftStartDate: payload.shiftStartDate ? new Date(payload.shiftStartDate) : undefined,
      },
      include: {
        shift: true,
        snackType: true,
        contract: true,
        worksite: true,
        costCenter: true,
      },
    });
    return jsonOk({ employee: updated });
  } catch (error) {
    return jsonError("No fue posible actualizar el trabajador.", 400, error);
  }
}
