"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-xl border border-[var(--wf-border)] px-3 py-2 text-sm font-medium text-[var(--wf-gray-dark)] transition hover:border-[var(--wf-red)] hover:bg-[var(--wf-red-soft)] hover:text-[var(--wf-red-dark)]">
      Cerrar sesion
    </button>
  );
}
