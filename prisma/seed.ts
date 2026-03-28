import bcrypt from "bcryptjs";
import { MenuStatus, PrismaClient, RoleCode, ShiftType, TicketLogAction, TicketStatus } from "@prisma/client";
import { addDays, startOfWeek } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      code: RoleCode.WESTERFOOD_ADMIN,
      name: "Admin WesterFood",
      description: "Administra clientes, menus, operacion y reportes globales.",
    },
    {
      code: RoleCode.CLIENT_HR,
      name: "RRHH Cliente",
      description: "Administra trabajadores, turnos y consumo del cliente.",
    },
    {
      code: RoleCode.EMPLOYEE,
      name: "Trabajador",
      description: "Selecciona menu y revisa su servicio diario.",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: RoleCode.WESTERFOOD_ADMIN } });
  const hrRole = await prisma.role.findUniqueOrThrow({ where: { code: RoleCode.CLIENT_HR } });
  const employeeRole = await prisma.role.findUniqueOrThrow({ where: { code: RoleCode.EMPLOYEE } });

  const client = await prisma.client.upsert({
    where: { slug: "acme-mining" },
    update: {
      name: "Acme Mining",
      legalName: "Acme Mining Services SpA",
      taxId: "76000001-1",
    },
    create: {
      name: "Acme Mining",
      slug: "acme-mining",
      legalName: "Acme Mining Services SpA",
      taxId: "76000001-1",
      selectionCloseDay: 4,
      selectionCloseHour: 17,
    },
  });

  const contract = await prisma.contract.upsert({
    where: { clientId_code: { clientId: client.id, code: "CTR-001" } },
    update: { name: "Contrato Operacion Mina Norte", active: true },
    create: {
      clientId: client.id,
      name: "Contrato Operacion Mina Norte",
      code: "CTR-001",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      active: true,
    },
  });

  const worksite = await prisma.worksite.upsert({
    where: { clientId_code: { clientId: client.id, code: "FAENA-NORTE" } },
    update: { name: "Faena Norte", contractId: contract.id, active: true },
    create: {
      clientId: client.id,
      contractId: contract.id,
      code: "FAENA-NORTE",
      name: "Faena Norte",
      location: "Antofagasta",
      active: true,
    },
  });

  const costCenter = await prisma.costCenter.upsert({
    where: { clientId_code: { clientId: client.id, code: "CC-OPER" } },
    update: { name: "Centro de costo Operaciones", contractId: contract.id, active: true },
    create: {
      clientId: client.id,
      contractId: contract.id,
      code: "CC-OPER",
      name: "Centro de costo Operaciones",
      active: true,
    },
  });

  const shifts = [
    {
      code: "LUN-VIE",
      name: "Lunes a Viernes",
      type: ShiftType.FIXED_MONDAY_TO_FRIDAY,
      cycleLength: null,
      activeDays: { weekdays: [1, 2, 3, 4, 5] },
      description: "Servicio para jornada administrativa estandar.",
    },
    {
      code: "7X7",
      name: "Turno 7x7",
      type: ShiftType.CYCLICAL,
      cycleLength: 14,
      activeDays: { workDays: 7, offDays: 7 },
      description: "Siete dias trabajados, siete dias libres.",
    },
    {
      code: "10X10",
      name: "Turno 10x10",
      type: ShiftType.CYCLICAL,
      cycleLength: 20,
      activeDays: { workDays: 10, offDays: 10 },
      description: "Diez dias trabajados, diez dias libres.",
    },
    {
      code: "14X14",
      name: "Turno 14x14",
      type: ShiftType.CYCLICAL,
      cycleLength: 28,
      activeDays: { workDays: 14, offDays: 14 },
      description: "Catorce dias trabajados, catorce dias libres.",
    },
  ];

  for (const shiftData of shifts) {
    await prisma.shift.upsert({
      where: { clientId_code: { clientId: client.id, code: shiftData.code } },
      update: { ...shiftData, clientId: client.id, active: true },
      create: { ...shiftData, clientId: client.id, active: true },
    });
  }

  const snackTypes = [
    { code: "FRIA", name: "Fria" },
    { code: "CALIENTE", name: "Caliente" },
    { code: "SNACK", name: "Snack" },
    { code: "DESAYUNO", name: "Desayuno" },
    { code: "ONCE", name: "Once" },
  ];

  for (const snackType of snackTypes) {
    await prisma.snackType.upsert({
      where: { clientId_code: { clientId: client.id, code: snackType.code } },
      update: { ...snackType, active: true },
      create: { clientId: client.id, ...snackType, active: true },
    });
  }

  const snackHot = await prisma.snackType.findUniqueOrThrow({
    where: { clientId_code: { clientId: client.id, code: "CALIENTE" } },
  });
  const shift7x7 = await prisma.shift.findUniqueOrThrow({
    where: { clientId_code: { clientId: client.id, code: "7X7" } },
  });
  const shiftLv = await prisma.shift.findUniqueOrThrow({
    where: { clientId_code: { clientId: client.id, code: "LUN-VIE" } },
  });

  const hashedPassword = await bcrypt.hash("WesterFood123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@westerfood.cl" },
    update: {
      name: "Admin WesterFood",
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      active: true,
      clientId: null,
      employeeId: null,
    },
    create: {
      email: "admin@westerfood.cl",
      name: "Admin WesterFood",
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "rrhh@acme.cl" },
    update: {
      name: "RRHH Acme Mining",
      passwordHash: hashedPassword,
      roleId: hrRole.id,
      active: true,
      clientId: client.id,
    },
    create: {
      email: "rrhh@acme.cl",
      name: "RRHH Acme Mining",
      passwordHash: hashedPassword,
      roleId: hrRole.id,
      active: true,
      clientId: client.id,
    },
  });

  const employee = await prisma.employee.upsert({
    where: { clientId_rut: { clientId: client.id, rut: "11111111K" } },
    update: {
      firstName: "Juan",
      lastName: "Perez",
      email: "trabajador@acme.cl",
      active: true,
      shiftId: shift7x7.id,
      contractId: contract.id,
      worksiteId: worksite.id,
      costCenterId: costCenter.id,
      hasSnack: true,
      snackTypeId: snackHot.id,
      hireDate: new Date("2026-01-10T00:00:00.000Z"),
      shiftStartDate: new Date("2026-03-24T00:00:00.000Z"),
    },
    create: {
      clientId: client.id,
      contractId: contract.id,
      worksiteId: worksite.id,
      costCenterId: costCenter.id,
      shiftId: shift7x7.id,
      firstName: "Juan",
      lastName: "Perez",
      rut: "11111111K",
      email: "trabajador@acme.cl",
      active: true,
      hireDate: new Date("2026-01-10T00:00:00.000Z"),
      shiftStartDate: new Date("2026-03-24T00:00:00.000Z"),
      hasSnack: true,
      snackTypeId: snackHot.id,
      identifiers: {
        create: [{ type: "RUT", value: "11111111K", isPrimary: true }],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "trabajador@acme.cl" },
    update: {
      name: "Juan Perez",
      passwordHash: hashedPassword,
      roleId: employeeRole.id,
      active: true,
      clientId: client.id,
      employeeId: employee.id,
    },
    create: {
      email: "trabajador@acme.cl",
      name: "Juan Perez",
      passwordHash: hashedPassword,
      roleId: employeeRole.id,
      active: true,
      clientId: client.id,
      employeeId: employee.id,
    },
  });

  const totem = await prisma.totemDevice.upsert({
    where: { clientId_code: { clientId: client.id, code: "TOTEM-NORTE-01" } },
    update: { name: "Totem Casino Norte", worksiteId: worksite.id, active: true },
    create: {
      clientId: client.id,
      worksiteId: worksite.id,
      code: "TOTEM-NORTE-01",
      name: "Totem Casino Norte",
      locationDescription: "Acceso principal casino faena norte",
      active: true,
    },
  });

  const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const menu = await prisma.menu.upsert({
    where: { clientId_weekStartDate: { clientId: client.id, weekStartDate } },
    update: {
      name: "Menu semanal demo",
      selectionCloseDay: client.selectionCloseDay,
      selectionCloseHour: client.selectionCloseHour,
      status: MenuStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    create: {
      clientId: client.id,
      name: "Menu semanal demo",
      weekStartDate,
      selectionCloseDay: client.selectionCloseDay,
      selectionCloseHour: client.selectionCloseHour,
      status: MenuStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  for (let index = 0; index < 5; index += 1) {
    const serviceDate = addDays(weekStartDate, index);
    const menuDay = await prisma.menuDay.upsert({
      where: { menuId_serviceDate: { menuId: menu.id, serviceDate } },
      update: { notes: `Menu del ${serviceDate.toLocaleDateString("es-CL")}` },
      create: {
        menuId: menu.id,
        serviceDate,
        notes: `Menu del ${serviceDate.toLocaleDateString("es-CL")}`,
      },
    });

    const mainNames = [
      `Fondo ${index + 1}A - Pasta bolognesa`,
      `Fondo ${index + 1}B - Pollo grillado`,
    ];
    const dessertNames = [
      `Postre ${index + 1}A - Fruta fresca`,
      `Postre ${index + 1}B - Mousse de chocolate`,
    ];

    for (const name of mainNames) {
      const existing = await prisma.mainCourseOption.findFirst({ where: { menuDayId: menuDay.id, name } });
      if (!existing) {
        await prisma.mainCourseOption.create({
          data: {
            menuDayId: menuDay.id,
            name,
            active: true,
          },
        });
      }
    }

    for (const name of dessertNames) {
      const existing = await prisma.dessertOption.findFirst({ where: { menuDayId: menuDay.id, name } });
      if (!existing) {
        await prisma.dessertOption.create({
          data: {
            menuDayId: menuDay.id,
            name,
            active: true,
          },
        });
      }
    }
  }

  const today = new Date();
  const serviceDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const assignment = await prisma.dailyServiceAssignment.upsert({
    where: {
      employeeId_serviceDate: {
        employeeId: employee.id,
        serviceDate,
      },
    },
    update: {
      clientId: client.id,
      contractId: contract.id,
      worksiteId: worksite.id,
      costCenterId: costCenter.id,
      shiftId: shift7x7.id,
      eligible: true,
      hasSnack: true,
      snackTypeId: snackHot.id,
      source: "SEED",
    },
    create: {
      clientId: client.id,
      employeeId: employee.id,
      contractId: contract.id,
      worksiteId: worksite.id,
      costCenterId: costCenter.id,
      shiftId: shift7x7.id,
      serviceDate,
      eligible: true,
      hasSnack: true,
      snackTypeId: snackHot.id,
      source: "SEED",
    },
  });

  await prisma.consumptionTicket.upsert({
    where: {
      employeeId_serviceDate: {
        employeeId: employee.id,
        serviceDate,
      },
    },
    update: {
      clientId: client.id,
      assignmentId: assignment.id,
      status: TicketStatus.ISSUED,
      ticketCode: `WF-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-DEMO`,
      issuedAt: new Date(),
      totemDeviceId: totem.id,
      serviceSummary: {
        employee: "Juan Perez",
        client: client.name,
        shift: shiftLv.name,
        snackType: snackHot.name,
      },
    },
    create: {
      clientId: client.id,
      employeeId: employee.id,
      assignmentId: assignment.id,
      status: TicketStatus.ISSUED,
      serviceDate,
      ticketCode: `WF-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-DEMO`,
      issuedAt: new Date(),
      totemDeviceId: totem.id,
      serviceSummary: {
        employee: "Juan Perez",
        client: client.name,
        shift: shiftLv.name,
        snackType: snackHot.name,
      },
    },
  });

  await prisma.ticketValidationLog.create({
    data: {
      clientId: client.id,
      employeeId: employee.id,
      totemDeviceId: totem.id,
      action: TicketLogAction.ISSUE,
      statusSnapshot: TicketStatus.ISSUED,
      reason: "Ticket demo inicializado por seed.",
      payload: {
        seeded: true,
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
