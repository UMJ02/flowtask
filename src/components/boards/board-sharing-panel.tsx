"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe2, Link2, Loader2, Lock, MailPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VisualBoard, VisualBoardCollaborator } from "@/lib/boards/board-types";

type BoardSharingPanelProps = {
  board: VisualBoard;
  collaborators: VisualBoardCollaborator[];
  saving: boolean;
  onClose: () => void;
  onUpdateSharing: (patch: { visibility?: VisualBoard["visibility"]; publicCanEdit?: boolean; ensureToken?: boolean }) => Promise<VisualBoard | null>;
  onInviteCollaborator: (email: string, role: "viewer" | "editor") => Promise<boolean>;
};

function boardShareUrl(token: string | null) {
  if (!token || typeof window === "undefined") return "";
  return `${window.location.origin}/share/boards/${token}`;
}

export function BoardSharingPanel({ board, collaborators, saving, onClose, onUpdateSharing, onInviteCollaborator }: BoardSharingPanelProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [inviteSaving, setInviteSaving] = useState(false);
  const shareUrl = useMemo(() => boardShareUrl(board.shareToken), [board.shareToken]);
  const publicEnabled = board.visibility === "public_link";

  async function enablePublicLink() {
    await onUpdateSharing({ visibility: "public_link", ensureToken: true });
  }

  async function disablePublicLink() {
    await onUpdateSharing({ visibility: "private", publicCanEdit: false });
    setCopied(false);
  }

  async function copyLink() {
    let next = board;
    if (!next.shareToken || next.visibility !== "public_link") {
      const updated = await onUpdateSharing({ visibility: "public_link", ensureToken: true });
      if (updated) next = updated;
    }
    const url = boardShareUrl(next.shareToken);
    if (!url) return;
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function submitInvite() {
    const value = email.trim().toLowerCase();
    if (!value || !value.includes("@")) return;
    setInviteSaving(true);
    const ok = await onInviteCollaborator(value, role);
    setInviteSaving(false);
    if (ok) setEmail("");
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-end bg-slate-950/20 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <aside
        className="ft-drawer-surface w-full max-w-[420px] p-4"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Compartir pizarra"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="ft-text-label text-emerald-700">Compartir</p>
            <h2 className="ft-title-section mt-1">Acceso a la pizarra</h2>
            <p className="ft-text-muted mt-1">Controla quién puede ver o editar este lienzo visual.</p>
          </div>
          <button type="button" onClick={onClose} className="ft-pressable grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">×</button>
        </div>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${publicEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{publicEnabled ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Enlace público</h3>
                <p className="text-xs font-medium text-slate-500">{publicEnabled ? "Cualquier persona con el enlace puede ver la pizarra." : "Solo personas con acceso al workspace pueden abrirla."}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={publicEnabled ? disablePublicLink : enablePublicLink}
              disabled={saving}
              className={`relative h-7 w-12 rounded-full transition ${publicEnabled ? "bg-emerald-500" : "bg-slate-200"}`}
              aria-label="Activar enlace público"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${publicEnabled ? "left-6" : "left-1"}`} />
            </button>
          </div>

          {publicEnabled ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <Link2 className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{shareUrl || "Generando enlace..."}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" onClick={copyLink} className="ft-btn-secondary flex-1">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar enlace"}
                </Button>
                <Button type="button" size="sm" onClick={() => onUpdateSharing({ publicCanEdit: !board.publicCanEdit })} className="ft-btn-ghost">
                  {board.publicCanEdit ? "Puede editar" : "Solo lectura"}
                </Button>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Por seguridad, el modo público editable queda preparado como configuración, pero la vista pública inicial es de lectura.</p>
            </div>
          ) : null}
        </section>

        <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Colaboradores</h3>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@empresa.com"
              className="ft-input min-w-0 flex-1"
            />
            <select value={role} onChange={(event) => setRole(event.target.value as "viewer" | "editor")} className="ft-input w-[104px]">
              <option value="viewer">Ver</option>
              <option value="editor">Editar</option>
            </select>
          </div>
          <Button type="button" size="sm" onClick={submitInvite} disabled={inviteSaving || !email.trim()} className="ft-btn-primary mt-2 w-full">
            {inviteSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailPlus className="h-4 w-4" />}
            Agregar colaborador
          </Button>
          <div className="mt-3 space-y-2">
            {collaborators.length ? collaborators.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="min-w-0 truncate text-xs font-bold text-slate-700">{item.email ?? item.userId ?? "Colaborador"}</span>
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">{item.role === "editor" ? "Editor" : item.role === "admin" ? "Admin" : "Lector"}</span>
              </div>
            )) : <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-500">Todavía no agregaste colaboradores directos.</p>}
          </div>
        </section>
      </aside>
    </div>
  );
}
