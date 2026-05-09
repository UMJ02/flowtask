"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Play, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BoardTopbarProps = {
  title: string;
  savingState: "saved" | "saving" | "error";
  onTitleChange: (title: string) => void;
};

export function BoardTopbar({ title, savingState, onTitleChange }: BoardTopbarProps) {
  return (
    <header className="z-30 flex h-[64px] items-center justify-between border-b border-[#E5EAF1] bg-white/90 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/app/boards" className="ft-pressable grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Volver a pizarras">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="ft-text-meta hidden md:block">Pizarras / Lienzo visual</p>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="w-full min-w-[220px] border-none bg-transparent text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A] outline-none md:min-w-[360px]"
            aria-label="Nombre de la pizarra"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold md:inline-flex ${savingState === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {savingState === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {savingState === "saving" ? "Guardando" : savingState === "error" ? "Error al guardar" : "Guardado"}
        </span>
        <Button variant="ghost" size="sm" className="hidden md:inline-flex"><Play className="h-4 w-4" /> Presentar</Button>
        <Button size="sm" className="ft-btn-primary"><Share2 className="h-4 w-4" /> Compartir</Button>
      </div>
    </header>
  );
}
