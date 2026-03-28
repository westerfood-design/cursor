"use client";

import { ShiftType } from "@prisma/client";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  legalName: z.string().min(2),
  taxId: z.string().min(7),
  timezone: z.string().min(3),
  selectionCloseDay: z.number().min(0).max(6),
  selectionCloseHour: z.number().min(0).max(23),
  active: z.boolean(),
});

const employeeSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  rut: z.string().min(7),
  email: z.string().optional(),
  shiftId: z.string().min(1),
  contractId: z.string().optional(),
  worksiteId: z.string().optional(),
  costCenterId: z.string().optional(),
  active: z.boolean(),
  hasSnack: z.boolean(),
  snackTypeId: z.string().optional(),
  hireDate: z.string().min(1),
  shiftStartDate: z.string().min(1),
});

const shiftSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.nativeEnum(ShiftType),
  cycleLength: z.number().nullable(),
  activeDaysRaw: z.string().min(2),
  description: z.string().optional(),
});

const snackTypeSchema = z.object({
  clientId: z.string().min(1),
  code: z.string().min(2),
  name: z.string().min(2),
});

const menuSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2),
  weekStartDate: z.string().min(1),
  selectionCloseDay: z.number().min(0).max(6),
  selectionCloseHour: z.number().min(0).max(23),
  mondayMainA: z.string().min(2),
  mondayMainB: z.string().min(2),
  mondayDessertA: z.string().min(2),
  mondayDessertB: z.string().min(2),
  tuesdayMainA: z.string().min(2),
  tuesdayMainB: z.string().min(2),
  tuesdayDessertA: z.string().min(2),
  tuesdayDessertB: z.string().min(2),
  wednesdayMainA: z.string().min(2),
  wednesdayMainB: z.string().min(2),
  wednesdayDessertA: z.string().min(2),
  wednesdayDessertB: z.string().min(2),
  thursdayMainA: z.string().min(2),
  thursdayMainB: z.string().min(2),
  thursdayDessertA: z.string().min(2),
  thursdayDessertB: z.string().min(2),
  fridayMainA: z.string().min(2),
  fridayMainB: z.string().min(2),
  fridayDessertA: z.string().min(2),
  fridayDessertB: z.string().min(2),
});

type ClientValues = z.infer<typeof clientSchema>;
type EmployeeValues = z.infer<typeof employeeSchema>;
type ShiftValues = z.infer<typeof shiftSchema>;
type SnackTypeValues = z.infer<typeof snackTypeSchema>;
type MenuValues = z.infer<typeof menuSchema>;
type ContractValues = z.infer<typeof contractSchema>;
type WorksiteValues = z.infer<typeof worksiteSchema>;
type CostCenterValues = z.infer<typeof costCenterSchema>;
type TotemValues = z.infer<typeof totemSchema>;


const contractSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2),
  code: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  active: z.boolean(),
});

const worksiteSchema = z.object({
  clientId: z.string().min(1),
  contractId: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  location: z.string().optional(),
  active: z.boolean(),
});

const costCenterSchema = z.object({
  clientId: z.string().min(1),
  contractId: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  active: z.boolean(),
});

const totemSchema = z.object({
  clientId: z.string().min(1),
  worksiteId: z.string().optional(),
  code: z.string().min(2),
  name: z.string().min(2),
  locationDescription: z.string().optional(),
  active: z.boolean(),
});

function FormError({ message }: { message: string | null }) {
  return message ? <p className="text-sm text-rose-600">{message}</p> : null;
}

export function ClientCrudForm({
  defaultValues,
  mode,
}: {
  defaultValues?: Partial<ClientValues>;
  mode: "create" | "edit";
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<ClientValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      id: defaultValues?.id,
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      legalName: defaultValues?.legalName ?? "",
      taxId: defaultValues?.taxId ?? "",
      timezone: defaultValues?.timezone ?? "America/Santiago",
      selectionCloseDay: defaultValues?.selectionCloseDay ?? 4,
      selectionCloseHour: defaultValues?.selectionCloseHour ?? 17,
      active: defaultValues?.active ?? true,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(mode === "create" ? "/api/clients" : `/api/clients/${values.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setMessage(response.ok ? "Cliente guardado correctamente." : data.error ?? "No fue posible guardar el cliente.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("id")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre comercial" {...form.register("name")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Slug" {...form.register("slug")} disabled={mode === "edit"} />
      <input className="rounded-xl border px-3 py-2" placeholder="Razon social" {...form.register("legalName")} />
      <input className="rounded-xl border px-3 py-2" placeholder="RUT empresa" {...form.register("taxId")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Timezone" {...form.register("timezone")} />
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
        <input type="checkbox" {...form.register("active")} />
        Cliente activo
      </label>
      <input className="rounded-xl border px-3 py-2" type="number" placeholder="Dia cierre (0-6)" {...form.register("selectionCloseDay", { valueAsNumber: true })} />
      <input className="rounded-xl border px-3 py-2" type="number" placeholder="Hora cierre" {...form.register("selectionCloseHour", { valueAsNumber: true })} />
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">
        {isPending ? "Guardando..." : mode === "create" ? "Crear cliente" : "Actualizar cliente"}
      </button>
      <FormError message={message} />
    </form>
  );
}

export function EmployeeCrudForm({
  defaultValues,
  clientId,
  shifts,
  snackTypes,
  contracts,
  worksites,
  costCenters,
  mode,
}: {
  defaultValues?: Partial<EmployeeValues>;
  clientId: string;
  shifts: Array<{ id: string; name: string }>;
  snackTypes: Array<{ id: string; name: string }>;
  contracts: Array<{ id: string; name: string }>;
  worksites: Array<{ id: string; name: string }>;
  costCenters: Array<{ id: string; name: string }>;
  mode: "create" | "edit";
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const form = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: defaultValues?.id,
      clientId,
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      rut: defaultValues?.rut ?? "",
      email: defaultValues?.email ?? "",
      shiftId: defaultValues?.shiftId ?? shifts[0]?.id ?? "",
      contractId: defaultValues?.contractId ?? "",
      worksiteId: defaultValues?.worksiteId ?? "",
      costCenterId: defaultValues?.costCenterId ?? "",
      active: defaultValues?.active ?? true,
      hasSnack: defaultValues?.hasSnack ?? false,
      snackTypeId: defaultValues?.snackTypeId ?? "",
      hireDate: defaultValues?.hireDate ?? today,
      shiftStartDate: defaultValues?.shiftStartDate ?? today,
    },
  });

  const hasSnack = useWatch({ control: form.control, name: "hasSnack" });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(mode === "create" ? "/api/employees" : `/api/employees/${values.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setMessage(response.ok ? "Trabajador guardado correctamente." : data.error ?? "No fue posible guardar el trabajador.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("id")} />
      <input type="hidden" {...form.register("clientId")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre" {...form.register("firstName")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Apellido" {...form.register("lastName")} />
      <input className="rounded-xl border px-3 py-2" placeholder="RUT" {...form.register("rut")} disabled={mode === "edit"} />
      <input className="rounded-xl border px-3 py-2" placeholder="Correo" {...form.register("email")} />
      <select className="rounded-xl border px-3 py-2" {...form.register("shiftId")}>
        {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name}</option>)}
      </select>
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
        <input type="checkbox" {...form.register("active")} />
        Trabajador activo
      </label>
      <select className="rounded-xl border px-3 py-2" {...form.register("contractId")}>
        <option value="">Sin contrato</option>
        {contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.name}</option>)}
      </select>
      <select className="rounded-xl border px-3 py-2" {...form.register("worksiteId")}>
        <option value="">Sin faena</option>
        {worksites.map((worksite) => <option key={worksite.id} value={worksite.id}>{worksite.name}</option>)}
      </select>
      <select className="rounded-xl border px-3 py-2 md:col-span-2" {...form.register("costCenterId")}>
        <option value="">Sin centro de costo</option>
        {costCenters.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}
      </select>
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2 md:col-span-2">
        <input type="checkbox" {...form.register("hasSnack")} />
        Tiene colacion
      </label>
      {hasSnack ? (
        <select className="rounded-xl border px-3 py-2 md:col-span-2" {...form.register("snackTypeId")}>
          <option value="">Selecciona tipo de colacion</option>
          {snackTypes.map((snackType) => <option key={snackType.id} value={snackType.id}>{snackType.name}</option>)}
        </select>
      ) : null}
      <input className="rounded-xl border px-3 py-2" type="date" {...form.register("hireDate")} />
      <input className="rounded-xl border px-3 py-2" type="date" {...form.register("shiftStartDate")} />
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">
        {isPending ? "Guardando..." : mode === "create" ? "Crear trabajador" : "Actualizar trabajador"}
      </button>
      <FormError message={message} />
    </form>
  );
}

export function ShiftCrudForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<ShiftValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      clientId,
      name: "",
      code: "",
      type: ShiftType.FIXED_MONDAY_TO_FRIDAY,
      cycleLength: null,
      activeDaysRaw: JSON.stringify({ weekdays: [1, 2, 3, 4, 5] }),
      description: "",
    },
  });

  const type = useWatch({ control: form.control, name: "type" });
  const suggestedJson = useMemo(() => {
    if (type === ShiftType.CYCLICAL) return JSON.stringify({ workDays: 7, offDays: 7 });
    return JSON.stringify({ weekdays: [1, 2, 3, 4, 5] });
  }, [type]);

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: values.clientId,
          name: values.name,
          code: values.code,
          type: values.type,
          cycleLength: values.type === ShiftType.CYCLICAL ? values.cycleLength : null,
          activeDays: JSON.parse(values.activeDaysRaw),
          description: values.description,
        }),
      });
      const data = await response.json();
      setMessage(response.ok ? "Turno creado correctamente." : data.error ?? "No fue posible crear el turno.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("clientId")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre turno" {...form.register("name")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Codigo" {...form.register("code")} />
      <select className="rounded-xl border px-3 py-2" {...form.register("type")}>
        {Object.values(ShiftType).map((shiftType) => <option key={shiftType} value={shiftType}>{shiftType}</option>)}
      </select>
      <input className="rounded-xl border px-3 py-2" type="number" placeholder="Cycle length" {...form.register("cycleLength", { setValueAs: (value) => value === "" ? null : Number(value) })} />
      <textarea className="rounded-xl border px-3 py-2 md:col-span-2" rows={5} placeholder={suggestedJson} {...form.register("activeDaysRaw")} />
      <input className="rounded-xl border px-3 py-2 md:col-span-2" placeholder="Descripcion" {...form.register("description")} />
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">
        {isPending ? "Guardando..." : "Crear turno"}
      </button>
      <FormError message={message} />
    </form>
  );
}

export function SnackTypeCrudForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<SnackTypeValues>({
    resolver: zodResolver(snackTypeSchema),
    defaultValues: { clientId, code: "", name: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/snack-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setMessage(response.ok ? "Tipo de colacion creado correctamente." : data.error ?? "No fue posible crear el tipo de colacion.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("clientId")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Codigo" {...form.register("code")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre" {...form.register("name")} />
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">
        {isPending ? "Guardando..." : "Crear tipo de colacion"}
      </button>
      <FormError message={message} />
    </form>
  );
}

export function WeeklyMenuForm({ clientId, selectionCloseDay, selectionCloseHour }: { clientId: string; selectionCloseDay: number; selectionCloseHour: number }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const nextMonday = new Date();
  const weekday = (nextMonday.getDay() + 6) % 7;
  nextMonday.setDate(nextMonday.getDate() - weekday);
  const weekStartDate = nextMonday.toISOString().slice(0, 10);

  const form = useForm<MenuValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      clientId,
      name: "Menu semanal",
      weekStartDate,
      selectionCloseDay,
      selectionCloseHour,
      mondayMainA: "Fondo lunes A",
      mondayMainB: "Fondo lunes B",
      mondayDessertA: "Postre lunes A",
      mondayDessertB: "Postre lunes B",
      tuesdayMainA: "Fondo martes A",
      tuesdayMainB: "Fondo martes B",
      tuesdayDessertA: "Postre martes A",
      tuesdayDessertB: "Postre martes B",
      wednesdayMainA: "Fondo miercoles A",
      wednesdayMainB: "Fondo miercoles B",
      wednesdayDessertA: "Postre miercoles A",
      wednesdayDessertB: "Postre miercoles B",
      thursdayMainA: "Fondo jueves A",
      thursdayMainB: "Fondo jueves B",
      thursdayDessertA: "Postre jueves A",
      thursdayDessertB: "Postre jueves B",
      fridayMainA: "Fondo viernes A",
      fridayMainB: "Fondo viernes B",
      fridayDessertA: "Postre viernes A",
      fridayDessertB: "Postre viernes B",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const baseDate = new Date(values.weekStartDate);
      const makeDay = (offset: number, notes: string, mainA: string, mainB: string, dessertA: string, dessertB: string) => ({
        serviceDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset).toISOString(),
        notes,
        mainCourses: [{ name: mainA }, { name: mainB }],
        desserts: [{ name: dessertA }, { name: dessertB }],
      });

      const response = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: values.clientId,
          name: values.name,
          weekStartDate: values.weekStartDate,
          selectionCloseDay: values.selectionCloseDay,
          selectionCloseHour: values.selectionCloseHour,
          days: [
            makeDay(0, "Lunes", values.mondayMainA, values.mondayMainB, values.mondayDessertA, values.mondayDessertB),
            makeDay(1, "Martes", values.tuesdayMainA, values.tuesdayMainB, values.tuesdayDessertA, values.tuesdayDessertB),
            makeDay(2, "Miercoles", values.wednesdayMainA, values.wednesdayMainB, values.wednesdayDessertA, values.wednesdayDessertB),
            makeDay(3, "Jueves", values.thursdayMainA, values.thursdayMainB, values.thursdayDessertA, values.thursdayDessertB),
            makeDay(4, "Viernes", values.fridayMainA, values.fridayMainB, values.fridayDessertA, values.fridayDessertB),
          ],
        }),
      });
      const data = await response.json();
      setMessage(response.ok ? "Menu creado correctamente." : data.error ?? "No fue posible crear el menu.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <input type="hidden" {...form.register("clientId")} />
        <input className="rounded-xl border px-3 py-2" placeholder="Nombre menu" {...form.register("name")} />
        <input className="rounded-xl border px-3 py-2" type="date" {...form.register("weekStartDate")} />
        <input className="rounded-xl border px-3 py-2" type="number" placeholder="Dia cierre" {...form.register("selectionCloseDay", { valueAsNumber: true })} />
        <input className="rounded-xl border px-3 py-2" type="number" placeholder="Hora cierre" {...form.register("selectionCloseHour", { valueAsNumber: true })} />
      </div>
      {[
        ["monday", "Lunes"],
        ["tuesday", "Martes"],
        ["wednesday", "Miercoles"],
        ["thursday", "Jueves"],
        ["friday", "Viernes"],
      ].map(([prefix, label]) => (
        <div key={prefix} className="rounded-2xl border border-zinc-200 p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-800">{label}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-xl border px-3 py-2" placeholder="Fondo A" {...form.register(`${prefix}MainA` as keyof MenuValues)} />
            <input className="rounded-xl border px-3 py-2" placeholder="Fondo B" {...form.register(`${prefix}MainB` as keyof MenuValues)} />
            <input className="rounded-xl border px-3 py-2" placeholder="Postre A" {...form.register(`${prefix}DessertA` as keyof MenuValues)} />
            <input className="rounded-xl border px-3 py-2" placeholder="Postre B" {...form.register(`${prefix}DessertB` as keyof MenuValues)} />
          </div>
        </div>
      ))}
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white">
        {isPending ? "Guardando..." : "Crear menu semanal"}
      </button>
      <FormError message={message} />
    </form>
  );
}


export function ContractCrudForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const form = useForm<ContractValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: { clientId, name: "", code: "", startDate: today, endDate: "", active: true },
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setMessage(response.ok ? "Contrato creado correctamente." : data.error ?? "No fue posible crear el contrato.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("clientId")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre contrato" {...form.register("name")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Codigo" {...form.register("code")} />
      <input className="rounded-xl border px-3 py-2" type="date" {...form.register("startDate")} />
      <input className="rounded-xl border px-3 py-2" type="date" {...form.register("endDate")} />
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2 md:col-span-2"><input type="checkbox" {...form.register("active")} />Contrato activo</label>
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">{isPending ? "Guardando..." : "Crear contrato"}</button>
      <FormError message={message} />
    </form>
  );
}

export function WorksiteCrudForm({ clientId, contracts }: { clientId: string; contracts: Array<{ id: string; name: string }> }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<WorksiteValues>({
    resolver: zodResolver(worksiteSchema),
    defaultValues: { clientId, contractId: contracts[0]?.id ?? "", name: "", code: "", location: "", active: true },
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/worksites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setMessage(response.ok ? "Faena creada correctamente." : data.error ?? "No fue posible crear la faena.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("clientId")} />
      <select className="rounded-xl border px-3 py-2" {...form.register("contractId")}>
        <option value="">Sin contrato</option>
        {contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.name}</option>)}
      </select>
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre faena" {...form.register("name")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Codigo" {...form.register("code")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Ubicacion" {...form.register("location")} />
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2 md:col-span-2"><input type="checkbox" {...form.register("active")} />Faena activa</label>
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">{isPending ? "Guardando..." : "Crear faena"}</button>
      <FormError message={message} />
    </form>
  );
}

export function CostCenterCrudForm({ clientId, contracts }: { clientId: string; contracts: Array<{ id: string; name: string }> }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<CostCenterValues>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: { clientId, contractId: contracts[0]?.id ?? "", name: "", code: "", active: true },
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/cost-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setMessage(response.ok ? "Centro de costo creado correctamente." : data.error ?? "No fue posible crear el centro de costo.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("clientId")} />
      <select className="rounded-xl border px-3 py-2" {...form.register("contractId")}>
        <option value="">Sin contrato</option>
        {contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.name}</option>)}
      </select>
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre centro de costo" {...form.register("name")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Codigo" {...form.register("code")} />
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2 md:col-span-2"><input type="checkbox" {...form.register("active")} />Centro de costo activo</label>
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">{isPending ? "Guardando..." : "Crear centro de costo"}</button>
      <FormError message={message} />
    </form>
  );
}

export function TotemCrudForm({ clientId, worksites }: { clientId: string; worksites: Array<{ id: string; name: string }> }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<TotemValues>({
    resolver: zodResolver(totemSchema),
    defaultValues: { clientId, worksiteId: worksites[0]?.id ?? "", code: "", name: "", locationDescription: "", active: true },
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/totem-devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setMessage(response.ok ? "Totem creado correctamente." : data.error ?? "No fue posible crear el totem.");
      if (response.ok) window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("clientId")} />
      <select className="rounded-xl border px-3 py-2" {...form.register("worksiteId")}>
        <option value="">Sin faena</option>
        {worksites.map((worksite) => <option key={worksite.id} value={worksite.id}>{worksite.name}</option>)}
      </select>
      <input className="rounded-xl border px-3 py-2" placeholder="Codigo dispositivo" {...form.register("code")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre totem" {...form.register("name")} />
      <input className="rounded-xl border px-3 py-2 md:col-span-2" placeholder="Ubicacion / descripcion" {...form.register("locationDescription")} />
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2 md:col-span-2"><input type="checkbox" {...form.register("active")} />Totem activo</label>
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">{isPending ? "Guardando..." : "Crear totem"}</button>
      <FormError message={message} />
    </form>
  );
}
