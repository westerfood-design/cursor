import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2),
  code: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }
  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined;
  const contracts = await prisma.contract.findMany({ where: clientId ? { clientId } : undefined, include: { client: true }, orderBy: { createdAt: "desc" } });
  return jsonOk({ contracts });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }
  try {
    const payload = schema.parse(await request.json());
    if (session.user.roleCode === RoleCode.CLIENT_HR && session.user.clientId !== payload.clientId) {
      return jsonError("No autorizado para este cliente.", 403);
    }
    const contract = await prisma.contract.create({
      data: {
        clientId: payload.clientId,
        name: payload.name,
        code: payload.code,
        startDate: new Date(payload.startDate),
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        active: payload.active,
      },
      include: { client: true },
    });
    return jsonOk({ contract }, 201);
  } catch (error) {
    return jsonError("No fue posible crear el contrato.", 400, error);
  }
}
