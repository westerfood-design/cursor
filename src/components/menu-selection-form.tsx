"use client";

import { ServiceType } from "@prisma/client";
import { useState, useTransition } from "react";

export function MenuSelectionForm({ employeeId, menuDay, serviceType = ServiceType.LUNCH, defaultMainCourseOptionId, defaultDessertOptionId }: {
  employeeId: string;
  menuDay: { id: string; mainCourseOptions: Array<{ id: string; name: string }>; dessertOptions: Array<{ id: string; name: string }> };
  serviceType?: ServiceType;
  defaultMainCourseOptionId?: string;
  defaultDessertOptionId?: string;
}) {
  const [mainCourseOptionId, setMainCourseOptionId] = useState(defaultMainCourseOptionId ?? "");
  const [dessertOptionId, setDessertOptionId] = useState(defaultDessertOptionId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submitSelection() {
    setMessage(null);
    if (!mainCourseOptionId || !dessertOptionId) {
      setMessage("Debes seleccionar 1 fondo y 1 postre.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/menu-selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, menuDayId: menuDay.id, serviceType, mainCourseOptionId, dessertOptionId }),
      });
      const data = await response.json();
      setMessage(response.ok ? "Seleccion guardada correctamente." : data.error ?? "No fue posible guardar la seleccion.");
    });
  }

  return (
    <div className="grid gap-3">
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--wf-gray-dark)]">Fondo</p>
        <div className="grid gap-2 md:grid-cols-2">
          {menuDay.mainCourseOptions.map((option) => (
            <button key={option.id} type="button" onClick={() => setMainCourseOptionId(option.id)} className={`rounded-xl border px-4 py-3 text-left transition ${mainCourseOptionId === option.id ? "border-[var(--wf-red)] bg-[var(--wf-red)] text-white" : "border-[var(--wf-border)] bg-white text-[var(--wf-gray-dark)] hover:bg-[var(--wf-red-soft)]"}`}>
              {option.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--wf-gray-dark)]">Postre</p>
        <div className="grid gap-2 md:grid-cols-2">
          {menuDay.dessertOptions.map((option) => (
            <button key={option.id} type="button" onClick={() => setDessertOptionId(option.id)} className={`rounded-xl border px-4 py-3 text-left transition ${dessertOptionId === option.id ? "border-[var(--wf-red)] bg-[var(--wf-red)] text-white" : "border-[var(--wf-border)] bg-white text-[var(--wf-gray-dark)] hover:bg-[var(--wf-red-soft)]"}`}>
              {option.name}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={submitSelection} disabled={isPending} className="rounded-xl bg-[var(--wf-red)] px-4 py-2 text-white transition hover:bg-[var(--wf-red-dark)]">{isPending ? "Guardando..." : "Guardar seleccion"}</button>
      {message ? <p className="text-sm text-[var(--wf-gray)]">{message}</p> : null}
    </div>
  );
}
