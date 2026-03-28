import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientId: z.string().min(1),
  code: z.string().min(2),
  name: z.string().min(2),
});

export async function GET() {
  const session = await requireSession();
  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined;
  const snackTypes = await prisma.snackType.findMany({ where: clientId ? { clientId } : undefined, orderBy: { name: "asc" } });
  return jsonOk({ snackTypes });
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
    const snackType = await prisma.snackType.create({ data: payload });
    return jsonOk({ snackType }, 201);
  } catch (error) {
    return jsonError("No fue posible crear el tipo de colacion.", 400, error);
  }
}
