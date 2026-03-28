import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getConsumptionReport(input: {
  from: Date;
  to: Date;
  clientId?: string;
}) {
  const where: Prisma.DailyServiceAssignmentWhereInput = {
    serviceDate: {
      gte: input.from,
      lte: input.to,
    },
    ...(input.clientId ? { clientId: input.clientId } : {}),
  };

  const assignments = await prisma.dailyServiceAssignment.findMany({
    where,
    include: {
      employee: true,
      worksite: true,
      costCenter: true,
      snackType: true,
      shift: true,
      ticket: true,
      menuSelection: {
        include: {
          mainCourseOption: true,
          dessertOption: true,
        },
      },
    },
    orderBy: [{ serviceDate: "desc" }, { employee: { lastName: "asc" } }],
  });

  const summary = assignments.reduce(
    (acc, assignment) => {
      acc.totalAssignments += 1;
      if (assignment.eligible) acc.eligibleAssignments += 1;
      if (assignment.ticket?.status === "CONSUMED") acc.consumedTickets += 1;
      if (assignment.ticket?.status === "ISSUED") acc.issuedTickets += 1;
      if (assignment.hasSnack) acc.withSnack += 1;
      return acc;
    },
    {
      totalAssignments: 0,
      eligibleAssignments: 0,
      consumedTickets: 0,
      issuedTickets: 0,
      withSnack: 0,
    },
  );

  return {
    summary,
    rows: assignments,
  };
}
