import { ServiceType, TicketLogAction, TicketStatus, type Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { format } from "date-fns";

import { toDateOnly } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { normalizeRut } from "@/lib/rut";
import { isEmployeeScheduledForDate } from "@/modules/shifts/shift-service";

const assignmentInclude = {
  employee: { include: { shift: true, snackType: true, client: true, contract: true, worksite: true, costCenter: true } },
  shift: true,
  snackType: true,
  menuSelection: { include: { mainCourseOption: true, dessertOption: true } },
  worksite: true,
  contract: true,
  costCenter: true,
} satisfies Prisma.DailyServiceAssignmentInclude;

type AssignmentWithRelations = Prisma.DailyServiceAssignmentGetPayload<{ include: typeof assignmentInclude }>;

function buildTicketSummary(assignment: AssignmentWithRelations) {
  return {
    employee: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
    client: assignment.employee.client.name,
    date: assignment.serviceDate,
    serviceType: assignment.serviceType,
    shift: assignment.shift.name,
    mainCourse: assignment.menuSelection?.mainCourseOption?.name ?? null,
    dessert: assignment.menuSelection?.dessertOption?.name ?? null,
    hasSnack: assignment.hasSnack,
    snackType: assignment.snackType?.name ?? null,
    contract: assignment.contract?.name ?? null,
    worksite: assignment.worksite?.name ?? null,
    costCenter: assignment.costCenter?.name ?? null,
  };
}

async function writeLog(input: {
  clientId?: string | null;
  employeeId?: string | null;
  ticketId?: string | null;
  totemDeviceId?: string | null;
  action: TicketLogAction;
  statusSnapshot?: TicketStatus | null;
  reason?: string;
  payload?: Prisma.InputJsonValue;
}) {
  return prisma.ticketValidationLog.create({
    data: {
      clientId: input.clientId ?? undefined,
      employeeId: input.employeeId ?? undefined,
      ticketId: input.ticketId ?? undefined,
      totemDeviceId: input.totemDeviceId ?? undefined,
      action: input.action,
      statusSnapshot: input.statusSnapshot ?? undefined,
      reason: input.reason,
      payload: input.payload,
    },
  });
}

export async function getOrCreateDailyAssignment(employeeId: string, serviceDate: Date | string, serviceType: ServiceType = ServiceType.LUNCH) {
  const normalizedDate = toDateOnly(serviceDate);

  const existing = await prisma.dailyServiceAssignment.findUnique({
    where: { employeeId_serviceDate_serviceType: { employeeId, serviceDate: normalizedDate, serviceType } },
    include: assignmentInclude,
  });
  if (existing) return existing;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { client: true, shift: true, snackType: true, contract: true, worksite: true, costCenter: true },
  });
  if (!employee || !employee.active) throw new Error("El trabajador no se encuentra activo.");

  const eligible = isEmployeeScheduledForDate(employee.shift, employee.shiftStartDate, normalizedDate);
  const menuDay = await prisma.menuDay.findFirst({ where: { menu: { clientId: employee.clientId }, serviceDate: normalizedDate } });
  const selection = await prisma.menuSelection.findUnique({
    where: { employeeId_serviceDate_serviceType: { employeeId, serviceDate: normalizedDate, serviceType } },
  });

  return prisma.dailyServiceAssignment.create({
    data: {
      clientId: employee.clientId,
      employeeId: employee.id,
      contractId: employee.contractId,
      worksiteId: employee.worksiteId,
      costCenterId: employee.costCenterId,
      shiftId: employee.shiftId,
      menuDayId: menuDay?.id,
      menuSelectionId: selection?.id,
      serviceDate: normalizedDate,
      serviceType,
      eligible,
      hasSnack: employee.hasSnack,
      snackTypeId: employee.snackTypeId,
      closureApplied: false,
      source: "SHIFT_RULE",
    },
    include: assignmentInclude,
  });
}

export async function getOrCreateTicketForAssignment(assignmentId: string, totemDeviceId?: string) {
  const existing = await prisma.consumptionTicket.findUnique({
    where: { assignmentId },
    include: { assignment: { include: assignmentInclude }, selection: { include: { mainCourseOption: true, dessertOption: true } }, totemDevice: true },
  });
  if (existing) return existing;

  const assignment = await prisma.dailyServiceAssignment.findUnique({ where: { id: assignmentId }, include: assignmentInclude });
  if (!assignment || !assignment.eligible) throw new Error("No existe servicio habilitado para esta asignacion.");

  const created = await prisma.consumptionTicket.create({
    data: {
      clientId: assignment.clientId,
      employeeId: assignment.employeeId,
      assignmentId: assignment.id,
      selectionId: assignment.menuSelectionId,
      serviceDate: assignment.serviceDate,
      serviceType: assignment.serviceType,
      ticketCode: `WF-${format(assignment.serviceDate, "yyyyMMdd")}-${randomUUID().slice(0, 8).toUpperCase()}`,
      status: TicketStatus.ISSUED,
      issuedAt: new Date(),
      totemDeviceId,
      serviceSummary: buildTicketSummary(assignment),
    },
    include: { assignment: { include: assignmentInclude }, selection: { include: { mainCourseOption: true, dessertOption: true } }, totemDevice: true },
  });

  await writeLog({ clientId: created.clientId, employeeId: created.employeeId, ticketId: created.id, totemDeviceId, action: TicketLogAction.ISSUE, statusSnapshot: created.status, reason: "Ticket emitido o recuperado para servicio diario." });
  return created;
}

export async function lookupTotemService(input: { clientSlug: string; deviceCode: string; rut: string }) {
  const normalizedRut = normalizeRut(input.rut);
  const device = await prisma.totemDevice.findFirst({ where: { code: input.deviceCode, active: true, client: { slug: input.clientSlug } }, include: { client: true, worksite: true } });

  if (!device) {
    await writeLog({ action: TicketLogAction.REJECT, reason: "Totem no encontrado o inactivo.", payload: input });
    return { status: "ERROR", message: "Totem no configurado." } as const;
  }

  const employee = await prisma.employee.findFirst({
    where: { clientId: device.clientId, rut: normalizedRut },
    include: { client: true, shift: true, snackType: true, worksite: true, costCenter: true, contract: true },
  });
  if (!employee) {
    await writeLog({ clientId: device.clientId, totemDeviceId: device.id, action: TicketLogAction.REJECT, reason: "Trabajador no encontrado.", payload: { rut: normalizedRut } });
    return { status: "NOT_FOUND", message: "Trabajador no encontrado." } as const;
  }
  if (!employee.active) {
    await writeLog({ clientId: device.clientId, employeeId: employee.id, totemDeviceId: device.id, action: TicketLogAction.REJECT, reason: "Trabajador inactivo." });
    return { status: "NOT_AUTHORIZED", message: "Trabajador inactivo." } as const;
  }

  const assignment = await getOrCreateDailyAssignment(employee.id, new Date(), ServiceType.LUNCH);
  if (!assignment.eligible) {
    await writeLog({ clientId: device.clientId, employeeId: employee.id, totemDeviceId: device.id, action: TicketLogAction.NOT_ALLOWED, reason: "El trabajador no tiene servicio asignado hoy." });
    return { status: "NOT_AUTHORIZED", message: "No autorizado para consumir hoy." } as const;
  }

  const ticket = await getOrCreateTicketForAssignment(assignment.id, device.id);
  if (ticket.status === TicketStatus.CONSUMED) {
    await writeLog({ clientId: ticket.clientId, employeeId: ticket.employeeId, ticketId: ticket.id, totemDeviceId: device.id, action: TicketLogAction.DUPLICATE_ATTEMPT, statusSnapshot: ticket.status, reason: "Intento de consumo duplicado." });
    return { status: "ALREADY_CONSUMED", message: "El servicio ya fue consumido hoy.", ticket, employee, assignment } as const;
  }

  await prisma.totemDevice.update({ where: { id: device.id }, data: { lastSeenAt: new Date() } });
  await writeLog({ clientId: device.clientId, employeeId: employee.id, ticketId: ticket.id, totemDeviceId: device.id, action: TicketLogAction.LOOKUP, statusSnapshot: ticket.status, reason: "Consulta exitosa desde totem." });

  return { status: "VALID", message: "Servicio valido para consumir.", ticket, employee, assignment, device } as const;
}

export async function consumeTicketFromTotem(input: { clientSlug: string; deviceCode: string; ticketId: string }) {
  const device = await prisma.totemDevice.findFirst({ where: { code: input.deviceCode, active: true, client: { slug: input.clientSlug } } });
  if (!device) throw new Error("Totem no configurado.");

  const ticket = await prisma.consumptionTicket.findUnique({
    where: { id: input.ticketId },
    include: { assignment: { include: assignmentInclude }, selection: { include: { mainCourseOption: true, dessertOption: true } } },
  });
  if (!ticket || ticket.clientId !== device.clientId) throw new Error("Ticket no encontrado para este cliente.");

  if (ticket.status === TicketStatus.CONSUMED) {
    await writeLog({ clientId: ticket.clientId, employeeId: ticket.employeeId, ticketId: ticket.id, totemDeviceId: device.id, action: TicketLogAction.DUPLICATE_ATTEMPT, statusSnapshot: ticket.status, reason: "Se bloqueo un doble consumo." });
    return ticket;
  }

  const updated = await prisma.consumptionTicket.update({
    where: { id: ticket.id },
    data: { status: TicketStatus.CONSUMED, validatedAt: new Date(), consumedAt: new Date(), totemDeviceId: device.id },
    include: { assignment: { include: assignmentInclude }, selection: { include: { mainCourseOption: true, dessertOption: true } }, totemDevice: true },
  });

  await writeLog({ clientId: updated.clientId, employeeId: updated.employeeId, ticketId: updated.id, totemDeviceId: device.id, action: TicketLogAction.CONSUME, statusSnapshot: updated.status, reason: "Servicio consumido correctamente desde totem." });
  return updated;
}
