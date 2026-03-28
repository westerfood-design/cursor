import Link from "next/link";
import { RoleCode } from "@prisma/client";

import { BrandLogo } from "@/components/brand-logo";
import { ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";

const linksByRole: Record<RoleCode, Array<{ href: string; label: string }>> = {
  WESTERFOOD_ADMIN: [
    { href: "/admin/clients", label: "Clientes" },
    { href: "/admin/operations", label: "Operacion" },
    { href: "/menus", label: "Menus" },
    { href: "/reports", label: "Reportes" },
  ],
  CLIENT_HR: [
    { href: "/hr/employees", label: "Trabajadores" },
    { href: "/menus", label: "Menus" },
    { href: "/reports", label: "Reportes" },
  ],
  EMPLOYEE: [
    { href: "/my-menu", label: "Mi menu" },
    { href: "/menus", label: "Calendario" },
  ],
};

export function AppSidebar({ roleCode }: { roleCode: RoleCode }) {
  return (
    <aside className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:w-64">
      <div className="mb-5 border-b border-zinc-100 pb-4">
        <BrandLogo className="h-12 w-[210px]" />
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Plataforma SaaS</p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-900">{ROLE_LABELS[roleCode]}</h2>
      </div>
      <nav className="flex flex-col gap-2">
        {linksByRole[roleCode].map((link) => (
          <Link key={link.href} href={link.href} className={cn("rounded-xl px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900")}>
            {link.label}
          </Link>
        ))}
        <Link href="/totem?client=acme-mining&device=TOTEM-NORTE-01" className="rounded-xl px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">
          Totem demo
        </Link>
      </nav>
    </aside>
  );
}
