import { MenuStatus, RoleCode } from "@prisma/client";
import { startOfWeek } from "date-fns";
import { z } from "zod";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const optionSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const schema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2),
  weekStartDate: z.string().optional(),
  selectionCloseDay: z.number().min(0).max(6),
  selectionCloseHour: z.number().min(0).max(23),
  days: z.array(z.object({
    serviceDate: z.string(),
    notes: z.string().optional(),
    mainCourses: z.array(optionSchema).min(1),
    desserts: z.array(optionSchema).min(1),
  })).min(1),
});

export async function GET() {
  const session = await requireSession();
  const clientId = session.user.roleCode === RoleCode.WESTERFOOD_ADMIN ? undefined : session.user.clientId ?? undefined;
  const menus = await prisma.menu.findMany({
    where: clientId ? { clientId } : undefined,
    include: { days: { include: { mainCourseOptions: true, dessertOptions: true } } },
    orderBy: { weekStartDate: "desc" },
  });
  return jsonOk({ menus });
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

    const weekStartDate = payload.weekStartDate ? new Date(payload.weekStartDate) : startOfWeek(new Date(), { weekStartsOn: 1 });
    const menu = await prisma.menu.create({
      data: {
        clientId: payload.clientId,
        name: payload.name,
        weekStartDate,
        selectionCloseDay: payload.selectionCloseDay,
        selectionCloseHour: payload.selectionCloseHour,
        status: MenuStatus.PUBLISHED,
        publishedAt: new Date(),
        days: {
          create: payload.days.map((day) => ({
            serviceDate: new Date(day.serviceDate),
            notes: day.notes,
            mainCourseOptions: {
              create: day.mainCourses,
            },
            dessertOptions: {
              create: day.desserts,
            },
          })),
        },
      },
      include: { days: true },
    });

    return jsonOk({ menu }, 201);
  } catch (error) {
    return jsonError("No fue posible crear el menu.", 400, error);
  }
}
