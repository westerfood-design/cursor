"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  legalName: z.string().min(2),
  taxId: z.string().min(7),
  selectionCloseDay: z.number().min(0).max(6),
  selectionCloseHour: z.number().min(0).max(23),
});

const employeeSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  rut: z.string().min(7),
  email: z.string().optional(),
  shiftId: z.string().min(1),
  clientId: z.string().min(1),
  contractId: z.string().optional(),
  worksiteId: z.string().optional(),
  costCenterId: z.string().optional(),
  active: z.boolean(),
  hasSnack: z.boolean(),
  snackTypeId: z.string().optional(),
  hireDate: z.string().min(1),
  shiftStartDate: z.string().min(1),
});

type ClientValues = z.infer<typeof clientSchema>;
type EmployeeValues = z.infer<typeof employeeSchema>;

export function ClientForm({ defaultValues, actionLabel = "Guardar" }: { defaultValues?: Partial<ClientValues>; actionLabel?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ClientValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      legalName: defaultValues?.legalName ?? "",
      taxId: defaultValues?.taxId ?? "",
      selectionCloseDay: defaultValues?.selectionCloseDay ?? 4,
      selectionCloseHour: defaultValues?.selectionCloseHour ?? 17,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre comercial" {...form.register("name")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Slug" {...form.register("slug")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Razón social" {...form.register("legalName")} />
      <input className="rounded-xl border px-3 py-2" placeholder="RUT empresa" {...form.register("taxId")} />
      <input className="rounded-xl border px-3 py-2" type="number" placeholder="Día cierre (0-6)" {...form.register("selectionCloseDay", { valueAsNumber: true })} />
      <input className="rounded-xl border px-3 py-2" type="number" placeholder="Hora cierre" {...form.register("selectionCloseHour", { valueAsNumber: true })} />
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">
        {isPending ? "Guardando..." : actionLabel}
      </button>
    </form>
  );
}

export function EmployeeForm({
  clientId,
  shifts,
  snackTypes,
}: {
  clientId: string;
  shifts: Array<{ id: string; name: string }>;
  snackTypes: Array<{ id: string; name: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);
  const form = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      clientId,
      firstName: "",
      lastName: "",
      rut: "",
      email: "",
      shiftId: shifts[0]?.id ?? "",
      active: true,
      hasSnack: false,
      snackTypeId: "",
      hireDate: today,
      shiftStartDate: today,
    },
  });

  const hasSnack = useWatch({
    control: form.control,
    name: "hasSnack",
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      window.location.reload();
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("clientId")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Nombre" {...form.register("firstName")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Apellido" {...form.register("lastName")} />
      <input className="rounded-xl border px-3 py-2" placeholder="RUT" {...form.register("rut")} />
      <input className="rounded-xl border px-3 py-2" placeholder="Correo" {...form.register("email")} />
      <select className="rounded-xl border px-3 py-2" {...form.register("shiftId")}>
        {shifts.map((shift) => (
          <option key={shift.id} value={shift.id}>{shift.name}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
        <input type="checkbox" {...form.register("hasSnack")} />
        Tiene colación
      </label>
      {hasSnack ? (
        <select className="rounded-xl border px-3 py-2 md:col-span-2" {...form.register("snackTypeId")}>
          <option value="">Selecciona tipo de colación</option>
          {snackTypes.map((snackType) => (
            <option key={snackType.id} value={snackType.id}>{snackType.name}</option>
          ))}
        </select>
      ) : null}
      <input className="rounded-xl border px-3 py-2" type="date" {...form.register("hireDate")} />
      <input className="rounded-xl border px-3 py-2" type="date" {...form.register("shiftStartDate")} />
      <button disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white md:col-span-2">
        {isPending ? "Guardando..." : "Crear trabajador"}
      </button>
    </form>
  );
}
