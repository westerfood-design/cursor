import { RoleCode, ShiftType } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientId: z.string().nullable().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.nativeEnum(ShiftType),
  cycleLength: z.number().nullable().optional(),
  activeDays: z.any(),
  description: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  const shifts = await prisma.shift.findMany({
    where: session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : { clientId: session.user.clientId },
    orderBy: { name: "asc" },
  });
  return jsonOk({ shifts });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }

  try {
    const payload = schema.parse(await request.json());
    const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? payload.clientId ?? null : session.user.clientId ?? null;
    const shift = await prisma.shift.create({ data: { ...payload, clientId } });
    return jsonOk({ shift }, 201);
  } catch (error) {
    return jsonError("No fue posible crear el turno.", 400, error);
  }
}
