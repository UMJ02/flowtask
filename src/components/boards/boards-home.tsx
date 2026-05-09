"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, Plus, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getClientWorkspaceContext } from "@/lib/supabase/workspace-client";
import type { VisualBoard, VisualBoardRow } from "@/lib/boards/board-types";
import { mapBoardRow } from "@/lib/boards/board-serialization";

export function BoardsHome() {
  const supabase = useMemo(() => createClient(), []);
  const [boards, setBoards] = useState<VisualBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadBoards() {
    setLoading(true);
    setError(null);
    const context = await getClientWorkspaceContext();
    if (!context.user) {
      setError("Inicia sesión para ver tus pizarras.");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("visual_boards")
      .select("id,owner_id,organization_id,project_id,task_id,title,description,visibility,thumbnail_url,created_at,updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    query = context.activeOrganizationId
      ? query.eq("organization_id", context.activeOrganizationId)
      : query.eq("owner_id", context.user.id).is("organization_id", null);

    const { data, error: queryError } = await query;
    if (queryError) {
      setError("No pudimos cargar tus pizarras. Revisa la migración de Boards o intenta de nuevo.");
      setBoards([]);
    } else {
      setBoards(((data ?? []) as VisualBoardRow[]).map(mapBoardRow));
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadBoards();
  }, []);

  async function createBoard() {
    setCreating(true);
    setError(null);
    const context = await getClientWorkspaceContext();
    if (!context.user) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión para crear una pizarra.");
      setCreating(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("visual_boards")
      .insert({
        owner_id: context.user.id,
        organization_id: context.activeOrganizationId,
        title: "Nueva pizarra",
        description: "Espacio visual para organizar ideas, diagramas y notas.",
        visibility: "private",
      })
      .select("id")
      .single();

    setCreating(false);
    if (insertError || !data?.id) {
      setError("No pudimos crear la pizarra. Confirma que la migración de Boards esté aplicada.");
      return;
    }
    window.location.href = `/app/boards/${data.id}`;
  }

  return (
    <div className="ft-governed-screen ft-density-dashboard">
      <Card className="ft-main-card overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Workflow className="h-5 w-5" />
            </span>
            <div>
              <p className="ft-text-label text-emerald-700">Pizarras visuales</p>
              <h1 className="ft-title-page mt-1">Crea diagramas, notas y mapas visuales</h1>
              <p className="ft-text-muted mt-2 max-w-3xl">Organiza ideas en un lienzo flexible: notas, textos, formas y tablas visuales con guardado real en Supabase.</p>
            </div>
          </div>
          <Button onClick={createBoard} disabled={creating} className="ft-btn-primary">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Nueva pizarra
          </Button>
        </div>
      </Card>

      {error ? <Card className="ft-mini-card border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700">{error}</Card> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? Array.from({ length: 3 }).map((_, index) => <Card key={index} className="ft-section-card h-40 animate-pulse bg-slate-100"><span className="sr-only">Cargando pizarra</span></Card>) : null}
        {!loading && boards.length === 0 ? (
          <Card className="ft-section-card sm:col-span-2 xl:col-span-3">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Sparkles className="h-6 w-6" /></span>
              <h2 className="ft-title-section mt-4">Todavía no tienes pizarras</h2>
              <p className="ft-text-muted mt-2 max-w-xl">Crea la primera para diseñar un flujo, ordenar ideas o preparar una propuesta visual.</p>
              <Button onClick={createBoard} disabled={creating} className="ft-btn-primary mt-5"><Plus className="h-4 w-4" /> Crear pizarra</Button>
            </div>
          </Card>
        ) : null}
        {!loading && boards.map((board) => (
          <Link key={board.id} href={`/app/boards/${board.id}`} className="group block">
            <Card className="ft-section-card ft-liquid-hover h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="ft-title-card truncate">{board.title}</h2>
                  <p className="ft-text-muted mt-2 line-clamp-2">{board.description || "Pizarra visual para ideas y diagramas."}</p>
                </div>
                <span className="ft-arrow-action grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 group-hover:text-emerald-700"><ArrowRight className="h-4 w-4" /></span>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-[#FBFCFE] p-4">
                <div className="grid grid-cols-3 gap-2 opacity-80">
                  <span className="h-10 rounded-xl bg-amber-100" />
                  <span className="h-10 rounded-xl bg-emerald-100" />
                  <span className="h-10 rounded-xl bg-violet-100" />
                </div>
              </div>
              <p className="ft-text-meta mt-4">Actualizada {new Date(board.updatedAt).toLocaleDateString("es-CR")}</p>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
