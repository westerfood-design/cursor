"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginInput } from "@/modules/auth/schemas";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    const response = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: true,
      callbackUrl: "/",
    });

    if (response?.error) {
      setError("Credenciales invalidas.");
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Correo</label>
        <input className="w-full rounded-xl border border-zinc-300 px-3 py-2" {...form.register("email")} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Contrasena</label>
        <input type="password" className="w-full rounded-xl border border-zinc-300 px-3 py-2" {...form.register("password")} />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button className="rounded-xl bg-zinc-900 px-4 py-2 text-white" disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
