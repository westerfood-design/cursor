import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireRole } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).optional(),
  legalName: z.string().min(2).optional(),
  taxId: z.string().min(7).optional(),
  active: z.boolean().optional(),
  selectionCloseDay: z.number().min(0).max(6).optional(),
  selectionCloseHour: z.number().min(0).max(23).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole([RoleCode.WESTERFOOD_ADMIN]);
  try {
    const payload = schema.parse(await request.json());
    const { id } = await params;
    const client = await prisma.client.update({ where: { id }, data: payload });
    return jsonOk({ client });
  } catch (error) {
    return jsonError("No fue posible actualizar el cliente.", 400, error);
  }
}
