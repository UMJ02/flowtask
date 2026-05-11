import { Instagram, Linkedin, Youtube } from 'lucide-react';

export function SettingsFooter() {
  return (
    <footer className="flex flex-col gap-4 px-1 pb-2 text-xs font-semibold text-[#64748B] md:flex-row md:items-center md:justify-between">
      <p>© 2026 FlowTask · Costa Rica</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#16C784]" />
        <span>Estado del sistema</span>
      </div>
      <div className="flex items-center gap-3">
        <span>Privacidad</span>
        <span>Soporte</span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EAF1] bg-white"><Linkedin className="h-4 w-4" /></span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EAF1] bg-white"><Instagram className="h-4 w-4" /></span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EAF1] bg-white"><Youtube className="h-4 w-4" /></span>
      </div>
    </footer>
  );
}
