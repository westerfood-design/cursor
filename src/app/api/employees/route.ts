import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { normalizeRut } from "@/lib/rut";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  rut: z.string().min(7),
  email: z.string().optional(),
  shiftId: z.string().min(1),
  clientId: z.string().min(1),
  contractId: z.string().optional(),
  worksiteId: z.string().optional(),
  costCenterId: z.string().optional(),
  active: z.boolean(),
  hasSnack: z.boolean(),
  snackTypeId: z.string().optional(),
  hireDate: z.string().min(1),
  shiftStartDate: z.string().min(1),
});

export async function GET() {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }

  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined;
  const employees = await prisma.employee.findMany({
    where: clientId ? { clientId } : undefined,
    include: {
      shift: true,
      snackType: true,
      contract: true,
      worksite: true,
      costCenter: true,
      client: true,
    },
    orderBy: [{ active: "desc" }, { lastName: "asc" }],
  });
  return jsonOk({ employees });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }

  try {
    const payload = schema.parse(await request.json());
    if (session.user.roleCode === RoleCode.CLIENT_HR && session.user.clientId !== payload.clientId) {
      return jsonError("No puedes crear trabajadores fuera de tu tenant.", 403);
    }
    if (payload.hasSnack && !payload.snackTypeId) {
      return jsonError("snackType es obligatorio cuando hasSnack=true.", 400);
    }

    const normalizedRut = normalizeRut(payload.rut);
    const employee = await prisma.employee.create({
      data: {
        clientId: payload.clientId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        rut: normalizedRut,
        email: payload.email || null,
        shiftId: payload.shiftId,
        contractId: payload.contractId || null,
        worksiteId: payload.worksiteId || null,
        costCenterId: payload.costCenterId || null,
        active: payload.active,
        hasSnack: payload.hasSnack,
        snackTypeId: payload.hasSnack ? payload.snackTypeId || null : null,
        hireDate: new Date(payload.hireDate),
        shiftStartDate: new Date(payload.shiftStartDate),
        identifiers: {
          create: [{ clientId: payload.clientId, type: "RUT", value: normalizedRut, isPrimary: true }],
        },
      },
      include: { shift: true, snackType: true },
    });
    return jsonOk({ employee }, 201);
  } catch (error) {
    return jsonError("No fue posible crear el trabajador.", 400, error);
  }
}
