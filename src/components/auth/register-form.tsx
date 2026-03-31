"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    setSuccess(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    const hasSession = Boolean(data.session);
    setSuccess(
      hasSession
        ? "Cuenta creada. Te llevaremos al dashboard."
        : "Cuenta creada. Revisa tu correo antes de iniciar sesión si la confirmación está activa en Supabase.",
    );

    if (hasSession) {
      setTimeout(() => {
        router.push("/app/dashboard");
        router.refresh();
      }, 900);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Nombre completo</label>
        <Input placeholder="Tu nombre" {...register("fullName")} />
        {errors.fullName ? <p className="text-sm text-red-600">{errors.fullName.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Correo</label>
        <Input type="email" placeholder="correo@empresa.com" {...register("email")} />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Contraseña</label>
        <Input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Confirmar contraseña</label>
        <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
        {errors.confirmPassword ? <p className="text-sm text-red-600">{errors.confirmPassword.message}</p> : null}
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando..." : "Crear cuenta"}
      </Button>
      <div className="text-right text-sm text-slate-600">
        <Link href="/login">Ya tengo cuenta</Link>
      </div>
    </form>
  );
}
