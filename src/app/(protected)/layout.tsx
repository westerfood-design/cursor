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
          <header className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm text-zinc-500">Sesión activa</p>
              <h1 className="text-lg font-semibold text-zinc-900">{session.user.name}</h1>
            </div>
            <SignOutButton />
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
