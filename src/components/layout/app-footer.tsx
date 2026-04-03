import { Facebook, Instagram, Youtube } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-slate-800">FlowTask</span>
          <span>Desarrollada en 2026 por canvasgraficacr. Todos los derechos reservados.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <a
            href="#"
            aria-label="Facebook"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <Youtube className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
