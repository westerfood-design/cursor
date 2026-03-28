import { Prisma, TicketStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getConsumptionReport(input: { from: Date; to: Date; clientId?: string }) {
  const where: Prisma.DailyServiceAssignmentWhereInput = {
    serviceDate: { gte: input.from, lte: input.to },
    ...(input.clientId ? { clientId: input.clientId } : {}),
  };

  const assignments = await prisma.dailyServiceAssignment.findMany({
    where,
    include: {
      employee: { include: { client: true } },
      worksite: true,
      costCenter: true,
      contract: true,
      snackType: true,
      shift: true,
      ticket: true,
      menuSelection: { include: { mainCourseOption: true, dessertOption: true } },
    },
    orderBy: [{ serviceDate: "desc" }, { employee: { lastName: "asc" } }],
  });

  const summary = assignments.reduce(
    (acc, assignment) => {
      acc.totalAssignments += 1;
      if (assignment.eligible) acc.eligibleAssignments += 1;
      if (assignment.ticket?.status === TicketStatus.CONSUMED) acc.consumedTickets += 1;
      if (assignment.ticket?.status === TicketStatus.ISSUED) acc.issuedTickets += 1;
      if (assignment.hasSnack) acc.withSnack += 1;
      return acc;
    },
    { totalAssignments: 0, eligibleAssignments: 0, consumedTickets: 0, issuedTickets: 0, withSnack: 0 },
  );

  return { summary, rows: assignments };
}

export async function getPaymentBaseReport(input: { from: Date; to: Date; clientId?: string }) {
  const report = await getConsumptionReport(input);

  const grouped = new Map<string, {
    employeeId: string;
    employeeName: string;
    clientName: string;
    contractName: string;
    worksiteName: string;
    costCenterName: string;
    shiftName: string;
    assignedDays: number;
    eligibleDays: number;
    consumedDays: number;
    snackDays: number;
  }>();

  for (const row of report.rows) {
    const current = grouped.get(row.employeeId) ?? {
      employeeId: row.employeeId,
      employeeName: `${row.employee.firstName} ${row.employee.lastName}`,
      clientName: row.employee.client.name,
      contractName: row.contract?.name ?? "Sin contrato",
      worksiteName: row.worksite?.name ?? "Sin faena",
      costCenterName: row.costCenter?.name ?? "Sin centro de costo",
      shiftName: row.shift.name,
      assignedDays: 0,
      eligibleDays: 0,
      consumedDays: 0,
      snackDays: 0,
    };

    current.assignedDays += 1;
    if (row.eligible) current.eligibleDays += 1;
    if (row.ticket?.status === TicketStatus.CONSUMED) current.consumedDays += 1;
    if (row.hasSnack) current.snackDays += 1;
    grouped.set(row.employeeId, current);
  }

  const rows = [...grouped.values()].sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  const totals = rows.reduce(
    (acc, row) => {
      acc.employees += 1;
      acc.assignedDays += row.assignedDays;
      acc.eligibleDays += row.eligibleDays;
      acc.consumedDays += row.consumedDays;
      acc.snackDays += row.snackDays;
      return acc;
    },
    { employees: 0, assignedDays: 0, eligibleDays: 0, consumedDays: 0, snackDays: 0 },
  );

  return { totals, rows };
}

export function toCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(","))].join("\\n");
}
