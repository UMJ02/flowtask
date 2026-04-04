"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatOrganizationRole } from "@/lib/organization/labels";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function OrganizationBootstrapCard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const computedSlug = slugify(slug || name);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/organization/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: computedSlug }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload?.error ?? "No fue posible crear el equipo.");
        return;
      }

      setMessage("Equipo creado. Ahora eres Owner · Admin del workspace.");
      router.refresh();
      router.push(payload?.redirectTo ?? "/app/organization");
    });
  }

  return (
    <Card className="rounded-[30px] border border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(240,253,250,0.94))] px-5 py-6 shadow-[0_18px_48px_rgba(16,185,129,0.10)] md:px-7 md:py-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Crear equipo</p>
          <h2 className="mt-3 text-[clamp(2rem,3vw,2.85rem)] font-bold leading-tight text-slate-950">
            Crea un equipo cuando necesites colaborar con más personas
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
            Puedes seguir usando FlowTask de forma individual sin crear equipo. Si decides crear uno, quedas con rol <strong>{formatOrganizationRole("admin_global")}</strong> y se activa la configuración inicial del workspace compartido.
          </p>
        </div>
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-[0_12px_28px_rgba(16,185,129,0.12)] ring-1 ring-emerald-200/80">
          <Sparkles className="h-7 w-7" />
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5 xl:grid-cols-[1.18fr_0.92fr_auto] xl:items-end">
        <div className="space-y-2">
          <label htmlFor="organization-name" className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Nombre del workspace
          </label>
          <Input
            id="organization-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Canvas Gráfica CR"
            disabled={isPending}
            className="h-14 rounded-[28px] border-slate-200/90 bg-white/95 px-5 text-lg placeholder:text-slate-400 focus:border-emerald-300"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="organization-slug" className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Slug
          </label>
          <Input
            id="organization-slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="canvas-grafica-cr"
            disabled={isPending}
            className="h-14 rounded-[28px] border-slate-200/90 bg-white/95 px-5 text-lg placeholder:text-slate-400 focus:border-emerald-300"
          />
        </div>
        <Button
          type="submit"
          loading={isPending}
          className="h-14 rounded-[28px] px-7 text-lg shadow-[0_16px_34px_rgba(15,23,42,0.14)]"
          disabled={isPending || !name.trim()}
        >
          <Building2 className="mr-2 h-5 w-5" />
          Crear equipo
        </Button>
      </form>

      {computedSlug ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-600">Slug listo:</span>
          <span className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 font-semibold text-emerald-700">
            {computedSlug}
          </span>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
    </Card>
  );
}
