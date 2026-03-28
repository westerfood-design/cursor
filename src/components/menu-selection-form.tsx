"use client";

import { useState, useTransition } from "react";

export function MenuSelectionForm({
  employeeId,
  menuDay,
  defaultMainCourseOptionId,
  defaultDessertOptionId,
}: {
  employeeId: string;
  menuDay: {
    id: string;
    mainCourseOptions: Array<{ id: string; name: string }>;
    dessertOptions: Array<{ id: string; name: string }>;
  };
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
        body: JSON.stringify({
          employeeId,
          menuDayId: menuDay.id,
          mainCourseOptionId,
          dessertOptionId,
        }),
      });
      const data = await response.json();
      setMessage(response.ok ? "Seleccion guardada correctamente." : data.error ?? "No fue posible guardar la seleccion.");
    });
  }

  return (
    <div className="grid gap-3">
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700">Fondo</p>
        <div className="grid gap-2 md:grid-cols-2">
          {menuDay.mainCourseOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMainCourseOptionId(option.id)}
              className={`rounded-xl border px-4 py-3 text-left ${mainCourseOptionId === option.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-800"}`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700">Postre</p>
        <div className="grid gap-2 md:grid-cols-2">
          {menuDay.dessertOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setDessertOptionId(option.id)}
              className={`rounded-xl border px-4 py-3 text-left ${dessertOptionId === option.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-800"}`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={submitSelection} disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2 text-white">
        {isPending ? "Guardando..." : "Guardar seleccion"}
      </button>
      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
    </div>
  );
}
