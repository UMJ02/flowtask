"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <Card className="overflow-hidden rounded-[28px] border border-emerald-200/80 bg-[linear-gradient(180deg,rgba(240,253,250,0.98),rgba(248,250,252,0.98))] px-5 py-5 shadow-[0_14px_38px_rgba(16,185,129,0.08)] md:px-6 md:py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px] xl:items-center">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Crear equipo</p>
              <h2 className="mt-2 text-[clamp(1.7rem,2.6vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.03em] text-slate-950">
                Crea un equipo cuando necesites colaborar con más personas
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600 md:text-base">
                Puedes seguir usando FlowTask de forma individual sin crear equipo. Si decides crear uno, quedas con rol <strong>{formatOrganizationRole("admin_global")}</strong> y se activa la configuración inicial del workspace compartido.
              </p>
            </div>
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-[0_10px_22px_rgba(16,185,129,0.10)] ring-1 ring-emerald-200/80 xl:hidden">
              <Sparkles className="h-6 w-6" />
            </span>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.84fr)_auto] xl:items-end">
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
            className="h-[52px] rounded-[24px] border-slate-200/90 bg-white/95 px-5 text-base placeholder:text-slate-400 focus:border-emerald-300"
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
            className="h-[52px] rounded-[24px] border-slate-200/90 bg-white/95 px-5 text-base placeholder:text-slate-400 focus:border-emerald-300"
          />
        </div>
        <Button
          type="submit"
          loading={isPending}
          className="h-[52px] rounded-[24px] px-6 text-base shadow-[0_14px_28px_rgba(15,23,42,0.12)]"
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
        </div>

        <div className="relative hidden h-full min-h-[300px] overflow-hidden rounded-[24px] border border-white/70 bg-white/70 xl:block">
          <div className="absolute right-5 top-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="absolute inset-x-0 bottom-0 top-0">
            <Image
              src="/imagenes/organization-team-hero.png"
              alt="Equipo colaborando en FlowTask"
              fill
              className="object-contain object-center p-4"
              priority
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
