"use client";

import { useState, useTransition } from "react";

import { BrandLogo } from "@/components/brand-logo";

type TotemResult = {
  status: string;
  message: string;
  ticket?: { id?: string; ticketCode?: string; status?: string; selection?: { mainCourseOption?: { name?: string } | null; dessertOption?: { name?: string } | null } | null } | null;
  employee?: { firstName: string; lastName: string; shift?: { name?: string } | null } | null;
  assignment?: { hasSnack?: boolean; shift?: { name?: string } | null; snackType?: { name?: string } | null } | null;
};

export function TotemClient({ clientSlug, deviceCode }: { clientSlug: string; deviceCode: string }) {
  const [rut, setRut] = useState("");
  const [result, setResult] = useState<TotemResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isConsuming, startConsume] = useTransition();

  const lookup = () => {
    setResult(null);
    startTransition(async () => {
      const response = await fetch("/api/totem/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientSlug, deviceCode, rut }) });
      const data = await response.json();
      setResult(data);
    });
  };

  const consume = () => {
    const ticketId = result?.ticket?.id;
    if (!ticketId) return;
    startConsume(async () => {
      const response = await fetch("/api/totem/consume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientSlug, deviceCode, ticketId }) });
      const data = await response.json();
      setResult({ ...result, ticket: data.ticket, status: data.status, message: data.message });
    });
  };

  const canConsume = result?.status === "VALID";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-6 px-6 py-10">
      <div className="flex flex-col items-center text-center">
        <BrandLogo className="h-16 w-[280px]" priority />
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[var(--wf-gray)]">Totem de autoatencion</p>
        <h1 className="mt-3 text-4xl font-semibold text-[var(--wf-gray-dark)]">Validacion diaria</h1>
        <p className="mt-3 text-[var(--wf-gray)]">Ingresa tu RUT para revisar y validar tu servicio del dia.</p>
      </div>

      <div className="rounded-3xl border border-[var(--wf-border)] bg-white p-6 shadow-lg">
        <input value={rut} onChange={(event) => setRut(event.target.value)} placeholder="Ingresa tu RUT" className="w-full rounded-2xl border border-[var(--wf-border)] px-4 py-4 text-2xl focus:border-[var(--wf-red)] focus:outline-none" />
        <button onClick={lookup} disabled={isPending} className="mt-4 w-full rounded-2xl bg-[var(--wf-red)] px-4 py-4 text-xl font-medium text-white transition hover:bg-[var(--wf-red-dark)]">{isPending ? "Validando..." : "Buscar servicio"}</button>
      </div>

      {result ? (
        <div className="rounded-3xl border border-[var(--wf-border)] bg-white p-6 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--wf-gray)]">Estado</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--wf-gray-dark)]">{result.message}</h2>
          {result.employee ? (
            <div className="mt-6 grid gap-3 text-lg text-[var(--wf-gray-dark)]">
              <p><span className="font-semibold text-[var(--wf-red-dark)]">Trabajador:</span> {result.employee.firstName} {result.employee.lastName}</p>
              <p><span className="font-semibold text-[var(--wf-red-dark)]">Turno:</span> {result.assignment?.shift?.name ?? result.employee.shift?.name}</p>
              <p><span className="font-semibold text-[var(--wf-red-dark)]">Colacion:</span> {result.assignment?.hasSnack ? result.assignment?.snackType?.name ?? "Si" : "No"}</p>
              <p><span className="font-semibold text-[var(--wf-red-dark)]">Fondo:</span> {result.ticket?.selection?.mainCourseOption?.name ?? "Sin seleccion"}</p>
              <p><span className="font-semibold text-[var(--wf-red-dark)]">Postre:</span> {result.ticket?.selection?.dessertOption?.name ?? "Sin seleccion"}</p>
              <p><span className="font-semibold text-[var(--wf-red-dark)]">Ticket:</span> {result.ticket?.ticketCode ?? "No emitido"}</p>
            </div>
          ) : null}
          {canConsume ? <button onClick={consume} disabled={isConsuming} className="mt-6 w-full rounded-2xl bg-[var(--wf-red)] px-4 py-4 text-xl font-semibold text-white transition hover:bg-[var(--wf-red-dark)]">{isConsuming ? "Registrando consumo..." : "Validar consumo"}</button> : null}
        </div>
      ) : null}
    </div>
  );
}
