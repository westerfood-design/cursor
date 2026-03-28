import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientId: z.string().min(1),
  contractId: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  location: z.string().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }
  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined;
  const worksites = await prisma.worksite.findMany({ where: clientId ? { clientId } : undefined, include: { client: true, contract: true }, orderBy: { createdAt: "desc" } });
  return jsonOk({ worksites });
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
    const worksite = await prisma.worksite.create({
      data: {
        clientId: payload.clientId,
        contractId: payload.contractId || null,
        name: payload.name,
        code: payload.code,
        location: payload.location || null,
        active: payload.active,
      },
      include: { client: true, contract: true },
    });
    return jsonOk({ worksite }, 201);
  } catch (error) {
    return jsonError("No fue posible crear la faena.", 400, error);
  }
}
