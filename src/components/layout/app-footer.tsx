import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

const socialLinks = [
  { href: "https://www.facebook.com", label: "Facebook", icon: Facebook },
  { href: "https://www.instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://www.youtube.com", label: "YouTube", icon: Youtube },
];

export function AppFooter() {
  return (
    <footer className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-slate-700">
          FlowTask desarrollo de Ulises Monge C. 2026, derechos reservados, Costa Rica.
        </p>
        <div className="flex items-center gap-2">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
