import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">{children}</div>;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm", className)}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-zinc-600">{description}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ label, value, help }: { label: string; value: string | number; help?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
      {help ? <p className="mt-2 text-xs text-zinc-500">{help}</p> : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "danger" }) {
  const styles = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
  } as const;

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[variant])}>{children}</span>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-3 py-2 text-left font-medium text-zinc-500">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3 align-top text-zinc-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
