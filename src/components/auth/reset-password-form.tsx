"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setServerError(null);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setMessage("Contraseña actualizada. Te llevaremos al login.");
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1200);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Nueva contraseña</label>
        <Input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Confirmar contraseña</label>
        <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
        {errors.confirmPassword ? <p className="text-sm text-red-600">{errors.confirmPassword.message}</p> : null}
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
