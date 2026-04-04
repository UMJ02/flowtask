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
    .replace(/[\u0300-\u036f]/g, "")
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
    <Card className="border border-emerald-200/80 bg-emerald-50/80 shadow-[0_16px_44px_rgba(16,185,129,0.10)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Crear equipo</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Crea un equipo cuando necesites colaborar con más personas</h2>
          <p className="mt-2 text-sm text-slate-600">
            Puedes seguir usando FlowTask de forma individual sin crear equipo. Si decides crear uno, quedas con rol <strong>{formatOrganizationRole("admin_global")}</strong> y se activa la configuración inicial del workspace compartido.
          </p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-200">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-[1.1fr_0.9fr_auto] md:items-end">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Nombre del workspace</p>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Canvas Gráfica CR" disabled={isPending} />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Slug</p>
          <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="canvas-grafica-cr" disabled={isPending} />
          <p className="mt-1 text-xs text-slate-500">Se guardará como /{computedSlug || "tu-workspace"}</p>
        </div>
        <Button type="submit" loading={isPending} className="h-11" disabled={isPending || !name.trim()}>
          <Building2 className="mr-2 h-4 w-4" />
          Crear equipo
        </Button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
    </Card>
  );
}
