import type { ReactNode } from "react";

import { requireSession } from "@/auth";
import { AppSidebar } from "@/components/nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <AppSidebar roleCode={session.user.roleCode} />
        <div className="space-y-4">
          <header className="flex flex-col gap-3 rounded-2xl border border-[var(--wf-border)] bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[var(--wf-gray)]">Sesion activa</p>
              <h1 className="text-lg font-semibold text-[var(--wf-gray-dark)]">{session.user.name}</h1>
              <p className="text-sm text-[var(--wf-gray)]">Rol: {session.user.roleCode}</p>
            </div>
            <SignOutButton />
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
