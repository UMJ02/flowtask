"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setMessage(null);
    setServerError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setMessage("Te enviamos un correo para restablecer tu contraseña.");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Correo</label>
        <Input type="email" placeholder="correo@empresa.com" {...register("email")} />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enviando..." : "Enviar correo"}
      </Button>
    </form>
  );
}
