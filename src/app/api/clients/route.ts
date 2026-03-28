import { RoleCode } from "@prisma/client";
import { z } from "zod";

import { requireRole } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  legalName: z.string().min(2),
  taxId: z.string().min(7),
  timezone: z.string().min(3),
  selectionCloseDay: z.number().min(0).max(6),
  selectionCloseHour: z.number().min(0).max(23),
  active: z.boolean().default(true),
});

export async function GET() {
  await requireRole([RoleCode.WESTERFOOD_ADMIN]);
  const clients = await prisma.client.findMany({
    include: {
      _count: { select: { employees: true, menus: true, totemDevices: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ clients });
}

export async function POST(request: Request) {
  await requireRole([RoleCode.WESTERFOOD_ADMIN]);
  try {
    const payload = schema.parse(await request.json());
    const client = await prisma.client.create({ data: payload });
    return jsonOk({ client }, 201);
  } catch (error) {
    return jsonError("No fue posible crear el cliente.", 400, error);
  }
}
