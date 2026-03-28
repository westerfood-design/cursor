import { redirect } from "next/navigation";

import { getCurrentSession } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl lg:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-zinc-950 p-10 text-white">
          <BrandLogo className="h-16 w-[290px]" priority />
          <h1 className="mt-8 text-4xl font-semibold">SaaS de alimentacion corporativa multiempresa</h1>
          <p className="mt-4 text-zinc-300">
            Gestiona trabajadores, turnos, colacion, menus, tickets unicos, totems y reportes operativos en una sola plataforma.
          </p>
          <div className="mt-8 space-y-2 text-sm text-zinc-300">
            <p>Demo admin: admin@westerfood.cl / WesterFood123!</p>
            <p>Demo RRHH: rrhh@acme.cl / WesterFood123!</p>
            <p>Demo trabajador: trabajador@acme.cl / WesterFood123!</p>
          </div>
        </section>
        <section className="p-10">
          <div className="mb-6 border-b border-zinc-100 pb-6">
            <BrandLogo className="h-12 w-[210px]" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900">Ingreso seguro</h2>
          <p className="mt-2 text-sm text-zinc-600">Credenciales con roles y redireccion segun perfil.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
