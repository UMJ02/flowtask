"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getClientWorkspaceContext } from "@/lib/supabase/workspace-client";
import type { VisualBoard, VisualBoardRow } from "@/lib/boards/board-types";
import { mapBoardRow, serializeElementForUpsert } from "@/lib/boards/board-serialization";
import { BOARD_TEMPLATES, createTemplateElements, type BoardTemplate, type BoardTemplateId } from "@/lib/boards/board-templates";

type DeleteTarget = Pick<VisualBoard, "id" | "title"> | null;

type TemplateVisual = {
  className: string;
  previewSrc: string;
  previewWidth: number;
  previewHeight: number;
  variant?: "default" | "wide";
};

const TEMPLATE_VISUALS: Record<BoardTemplateId, TemplateVisual> = {
  blank: { className: "board-home-template-mint", previewSrc: "/boards-home/pizarra_blanco.png", previewWidth: 100, previewHeight: 78 },
  flow: { className: "board-home-template-blue", previewSrc: "/boards-home/diagrama_fujo.png", previewWidth: 100, previewHeight: 78 },
  project: { className: "board-home-template-amber", previewSrc: "/boards-home/plan_proyecto.png", previewWidth: 100, previewHeight: 78 },
  meeting: { className: "board-home-template-mint", previewSrc: "/boards-home/hero.png", previewWidth: 645, previewHeight: 192, variant: "wide" },
  ideas: { className: "board-home-template-violet", previewSrc: "/boards-home/mapa_ideas.png", previewWidth: 100, previewHeight: 78 },
  wireframe: { className: "board-home-template-rose", previewSrc: "/boards-home/wireframe.png", previewWidth: 100, previewHeight: 78 },
};

const HERO_TOOL_ICONS = [
  { src: "/boards-home/icon-flecha.png", width: 50, height: 47 },
  { src: "/boards-home/icon-frame.png", width: 50, height: 47 },
  { src: "/boards-home/icon-text.png", width: 50, height: 47 },
  { src: "/boards-home/icon-puntos.png", width: 50, height: 47 },
] as const;

function TemplatePreview({ templateId }: { templateId: BoardTemplateId }) {
  const visual = TEMPLATE_VISUALS[templateId];

  return (
    <div className={`board-home-template-preview-asset ${visual.variant === "wide" ? "is-wide" : ""}`} aria-hidden="true">
      <Image
        src={visual.previewSrc}
        alt=""
        width={visual.previewWidth}
        height={visual.previewHeight}
        className="board-home-template-image"
      />
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="board-home-hero-visual" aria-hidden="true">
      <div className="board-home-hero-toolbar">
        {HERO_TOOL_ICONS.map((icon, index) => (
          <span key={icon.src} className={`board-home-hero-tool ${index === 0 ? "is-active" : ""}`}>
            <Image src={icon.src} alt="" width={icon.width} height={icon.height} className="board-home-hero-tool-image" priority={index === 0} />
          </span>
        ))}
      </div>
      <div className="board-home-hero-stage">
        <div className="board-home-hero-stage-frame">
          <Image src="/boards-home/hero.png" alt="" width={645} height={192} className="board-home-hero-image" priority />
        </div>
      </div>
    </div>
  );
}

function RecentBoardPreview({ board }: { board: VisualBoard }) {
  if (board.thumbnailUrl) {
    return <img src={board.thumbnailUrl} alt="" className="h-full w-full rounded-[18px] object-cover" />;
  }
  return (
    <div className="board-home-recent-preview" aria-hidden="true">
      <span className="tile a" /><span className="tile b" /><span className="tile c" />
      <span className="line a" /><span className="line b" />
      <span className="table">{Array.from({ length: 6 }).map((_, index) => <i key={index} />)}</span>
    </div>
  );
}

function BoardAccessBadge({ board }: { board: VisualBoard }) {
  const label = board.visibility === "public_link"
    ? board.publicCanEdit ? "Enlace editable" : "Enlace activo"
    : board.visibility === "workspace" || board.organizationId
      ? "Compartida"
      : "Privada";

  return (
    <span className="board-home-access-badge">
      <ShieldCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function TemplateCard({ template, creating, onCreate }: { template: BoardTemplate; creating: boolean; onCreate: (id: BoardTemplateId) => void }) {
  const visual = TEMPLATE_VISUALS[template.id];
  return (
    <button
      type="button"
      disabled={creating}
      onClick={() => onCreate(template.id)}
      className={`board-home-template-card ${visual.className}`}
    >
      <div className="board-home-template-preview"><TemplatePreview templateId={template.id} /></div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 text-left">
          <h3>{template.title}</h3>
          <p>{template.description}</p>
        </div>
        <span className="board-home-plus"><Plus className="h-4 w-4" /></span>
      </div>
    </button>
  );
}
export function BoardsHome() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [boards, setBoards] = useState<VisualBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);

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
      .select("id,owner_id,organization_id,project_id,task_id,title,description,visibility,share_token,public_can_edit,thumbnail_url,created_at,updated_at")
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

  async function createBoard(templateId: BoardTemplateId = "blank") {
    setCreating(true);
    setError(null);
    const context = await getClientWorkspaceContext();
    if (!context.user) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión para crear una pizarra.");
      setCreating(false);
      return;
    }

    const template = BOARD_TEMPLATES.find((item) => item.id === templateId);
    const { data, error: insertError } = await supabase
      .from("visual_boards")
      .insert({
        owner_id: context.user.id,
        organization_id: context.activeOrganizationId,
        title: templateId === "blank" ? "Nueva pizarra" : template?.title ?? "Nueva pizarra",
        description: template?.description ?? "Espacio visual para organizar ideas, diagramas y notas.",
        visibility: "private",
      })
      .select("id")
      .single();

    if (insertError || !data?.id) {
      setCreating(false);
      setError("No pudimos crear la pizarra. Confirma que la migración de Boards esté aplicada.");
      return;
    }

    const templateElements = createTemplateElements(templateId, data.id, context.user.id);
    if (templateElements.length) {
      const { error: templateError } = await supabase
        .from("visual_board_elements")
        .upsert(templateElements.map(serializeElementForUpsert), { onConflict: "id" })
        .select("id");
      if (templateError) {
        setCreating(false);
        setError("Creamos la pizarra, pero no pudimos cargar la plantilla. Abre la pizarra e intenta agregar elementos manualmente.");
        return;
      }
      await supabase.from("visual_board_activity").insert({
        board_id: data.id,
        actor_id: context.user.id,
        type: "template_applied",
        payload: { templateId, elements: templateElements.length },
      });
    } else {
      await supabase.from("visual_board_activity").insert({
        board_id: data.id,
        actor_id: context.user.id,
        type: "board_created",
        payload: { templateId },
      });
    }

    setCreating(false);
    router.push(`/app/boards/${data.id}`);
  }

  async function deleteBoard() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setError(null);
    const timestamp = new Date().toISOString();
    const { data, error: deleteError } = await supabase
      .from("visual_boards")
      .update({ deleted_at: timestamp, updated_at: timestamp })
      .eq("id", deleteTarget.id)
      .select("id")
      .maybeSingle();

    if (deleteError || !data?.id) {
      setError("No pudimos quitar la pizarra. Revisa permisos o intenta de nuevo.");
      setDeletingId(null);
      return;
    }

    setBoards((current) => current.filter((board) => board.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeletingId(null);
  }

  return (
    <div className="board-home-shell">
      <section className="board-home-hero">
        <div className="board-home-hero-copy">
          <p className="board-home-kicker">Pizarras visuales</p>
          <h1>Crea, organiza y visualiza tus ideas</h1>
          <p>Todo tu pensamiento en un solo espacio visual con sincronización, plantillas y colaboración en tiempo real.</p>
          <div className="board-home-hero-actions">
            <Button onClick={() => createBoard()} disabled={creating} className="board-home-primary-btn">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Nueva pizarra
            </Button>
            <button
              type="button"
              onClick={() => document.getElementById("board-templates")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="board-home-secondary-btn"
            >
              <Sparkles className="h-4 w-4" /> Ver plantillas
            </button>
          </div>
        </div>
        <HeroIllustration />
      </section>

      {error ? <div className="board-home-alert">{error}</div> : null}

      <section id="board-templates" className="board-home-section">
        <div className="board-home-section-head">
          <div>
            <h2>Empieza rápido</h2>
            <p>Elige una plantilla o comienza desde cero.</p>
          </div>
          <button type="button" className="board-home-link-btn" onClick={() => setShowAllTemplates((value) => !value)}>
            {showAllTemplates ? "Ver menos plantillas" : "Ver todas las plantillas"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="board-home-template-grid">
          {(showAllTemplates ? BOARD_TEMPLATES : BOARD_TEMPLATES.filter((template) => template.id !== "meeting")).map((template) => (
            <TemplateCard key={template.id} template={template} creating={creating} onCreate={createBoard} />
          ))}
        </div>
      </section>

      <section className="board-home-section">
        <div className="board-home-section-head">
          <div className="flex items-start gap-2">
            <Clock3 className="mt-1 h-5 w-5 text-slate-500" />
            <div>
              <h2>Mis pizarras recientes</h2>
              <p>Accede rápido a tus últimos trabajos.</p>
            </div>
          </div>
          <button type="button" className="board-home-link-btn" onClick={() => void loadBoards()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Actualizar
          </button>
        </div>
        <div className="board-home-recent-grid">
          {loading ? Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="board-home-recent-card board-home-skeleton"><span className="sr-only">Cargando pizarra</span></div>
          )) : null}

          {!loading && boards.map((board) => (
            <article key={board.id} className="board-home-recent-card group">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/app/boards/${board.id}`} className="min-w-0 flex-1">
                  <h3>{board.title}</h3>
                  <p>Editada {new Date(board.updatedAt).toLocaleDateString("es-CR")}</p>
                </Link>
                <button
                  type="button"
                  className="board-home-card-menu"
                  aria-label={`Eliminar ${board.title}`}
                  onClick={() => setDeleteTarget({ id: board.id, title: board.title })}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <Link href={`/app/boards/${board.id}`} className="mt-4 block h-[138px] overflow-hidden rounded-[20px] border border-[#E8EDF5] bg-white/80 p-3 transition group-hover:border-emerald-200">
                <RecentBoardPreview board={board} />
              </Link>
              <div className="mt-4 flex items-center justify-between gap-3">
                <BoardAccessBadge board={board} />
                <button type="button" onClick={() => setDeleteTarget({ id: board.id, title: board.title })} className="board-home-delete-btn"><Trash2 className="h-4 w-4" /> Quitar</button>
              </div>
            </article>
          ))}

          {!loading ? (
            <button type="button" disabled={creating} onClick={() => createBoard()} className="board-home-create-card">
              <span><Plus className="h-6 w-6" /></span>
              <strong>Crear nueva pizarra</strong>
              <small>Lienzo en blanco</small>
            </button>
          ) : null}
        </div>
      </section>

      {deleteTarget ? (
        <div className="board-home-delete-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-board-title">
          <div className="board-home-delete-dialog">
            <button type="button" className="board-home-delete-close" onClick={() => setDeleteTarget(null)} aria-label="Cerrar"><X className="h-4 w-4" /></button>
            <div className="board-home-delete-icon"><Trash2 className="h-5 w-5" /></div>
            <p className="board-home-delete-kicker">Quitar de tus pizarras</p>
            <h2 id="delete-board-title">¿Quitar esta pizarra?</h2>
            <p className="board-home-delete-copy">“{deleteTarget.title}” dejará de aparecer en esta vista. No se eliminarán otras pizarras ni se afectarán tus permisos.</p>
            <div className="board-home-delete-actions">
              <button type="button" className="board-home-delete-cancel" onClick={() => setDeleteTarget(null)} disabled={!!deletingId}>Cancelar</button>
              <button type="button" className="board-home-delete-danger" onClick={deleteBoard} disabled={!!deletingId}>{deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Quitar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
