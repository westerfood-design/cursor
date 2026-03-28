import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientId: z.string().min(1),
  worksiteId: z.string().optional(),
  code: z.string().min(2),
  name: z.string().min(2),
  locationDescription: z.string().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await requireSession();
  if (session.user.roleCode !== RoleCode.WESTERFOOD_ADMIN && session.user.roleCode !== RoleCode.CLIENT_HR) {
    return jsonError("No autorizado.", 403);
  }
  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined;
  const devices = await prisma.totemDevice.findMany({ where: clientId ? { clientId } : undefined, include: { client: true, worksite: true }, orderBy: { createdAt: "desc" } });
  return jsonOk({ devices });
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
    const device = await prisma.totemDevice.create({
      data: {
        clientId: payload.clientId,
        worksiteId: payload.worksiteId || null,
        code: payload.code,
        name: payload.name,
        locationDescription: payload.locationDescription || null,
        active: payload.active,
      },
      include: { client: true, worksite: true },
    });
    return jsonOk({ device }, 201);
  } catch (error) {
    return jsonError("No fue posible crear el totem.", 400, error);
  }
}
