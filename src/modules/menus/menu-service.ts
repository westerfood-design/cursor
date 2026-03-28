import { MenuStatus, ServiceType } from "@prisma/client";
import { z } from "zod";

import { isSelectionOpen, toDateOnly } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export const menuSelectionSchema = z.object({
  menuDayId: z.string().min(1),
  employeeId: z.string().min(1),
  serviceType: z.nativeEnum(ServiceType).default(ServiceType.LUNCH),
  mainCourseOptionId: z.string().min(1, "Debes elegir un fondo."),
  dessertOptionId: z.string().min(1, "Debes elegir un postre."),
});

export type MenuSelectionInput = z.infer<typeof menuSelectionSchema>;

export async function upsertMenuSelection(input: MenuSelectionInput) {
  const payload = menuSelectionSchema.parse(input);

  const menuDay = await prisma.menuDay.findUnique({
    where: { id: payload.menuDayId },
    include: {
      menu: true,
      mainCourseOptions: { where: { active: true } },
      dessertOptions: { where: { active: true } },
    },
  });

  if (!menuDay) throw new Error("No se encontro el dia de menu solicitado.");
  if (menuDay.menu.status !== MenuStatus.PUBLISHED) throw new Error("El menu no esta publicado.");
  if (!isSelectionOpen(menuDay.menu.weekStartDate, menuDay.menu.selectionCloseDay, menuDay.menu.selectionCloseHour)) {
    throw new Error("La seleccion de menu ya se encuentra cerrada.");
  }

  const validMain = menuDay.mainCourseOptions.some((option) => option.id === payload.mainCourseOptionId);
  const validDessert = menuDay.dessertOptions.some((option) => option.id === payload.dessertOptionId);
  if (!validMain || !validDessert) throw new Error("La combinacion seleccionada no pertenece al menu del dia.");

  const employee = await prisma.employee.findUnique({ where: { id: payload.employeeId }, select: { id: true, clientId: true, active: true } });
  if (!employee || !employee.active) throw new Error("El trabajador no se encuentra activo.");

  return prisma.menuSelection.upsert({
    where: {
      employeeId_serviceDate_serviceType: {
        employeeId: payload.employeeId,
        serviceDate: toDateOnly(menuDay.serviceDate),
        serviceType: payload.serviceType,
      },
    },
    update: {
      clientId: employee.clientId,
      menuDayId: payload.menuDayId,
      serviceDate: toDateOnly(menuDay.serviceDate),
      serviceType: payload.serviceType,
      mainCourseOptionId: payload.mainCourseOptionId,
      dessertOptionId: payload.dessertOptionId,
      selectedAt: new Date(),
    },
    create: {
      clientId: employee.clientId,
      employeeId: payload.employeeId,
      menuDayId: payload.menuDayId,
      serviceDate: toDateOnly(menuDay.serviceDate),
      serviceType: payload.serviceType,
      mainCourseOptionId: payload.mainCourseOptionId,
      dessertOptionId: payload.dessertOptionId,
    },
    include: { mainCourseOption: true, dessertOption: true, menuDay: true },
  });
}
