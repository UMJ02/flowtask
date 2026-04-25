import Link from 'next/link';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

const footerLinks = [
  { href: '/app/settings', label: 'Privacidad' },
  { href: '/app/support', label: 'Términos' },
  { href: '/app/support', label: 'Soporte' },
];

const socialLinks = [
  { href: 'https://www.linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://www.instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://www.youtube.com', label: 'YouTube', icon: Youtube },
];

export function AppFooter() {
  return (
    <footer className="animate-[flowtaskFadeUp_.25s_ease-out] rounded-[20px] border border-[#E5EAF1] bg-white px-5 py-4 text-sm text-[#64748B] shadow-[0_8px_24px_rgba(15,23,42,.035)] md:min-h-[72px] md:px-7">
      <div className="flex min-h-10 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="font-medium">© 2026 FlowTask · Costa Rica</p>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium" aria-label="Enlaces del footer">
          {footerLinks.map((link, index) => (
            <span key={link.label} className="inline-flex items-center gap-3">
              {index > 0 ? <span className="text-slate-300">·</span> : null}
              <Link href={link.href} className="transition hover:text-[#0F172A]">{link.label}</Link>
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5EAF1] bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50 hover:text-[#0F172A]">
              <Icon className="h-[18px] w-[18px]" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
