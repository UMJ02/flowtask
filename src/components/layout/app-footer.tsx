import Link from 'next/link';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

const socialLinks = [
  { href: 'https://www.linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://www.instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://www.youtube.com', label: 'YouTube', icon: Youtube },
];

const footerLinks = [
  { href: '/app/settings', label: 'Privacidad' },
  { href: '/app/support', label: 'Soporte' },
];

export function AppFooter() {
  return (
    <footer className="min-h-14 rounded-[20px] border border-[#E8EDF3] bg-white px-5 py-4 text-[14px] text-[#64748B] shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="whitespace-nowrap font-medium">© 2026 FlowTask · Costa Rica</p>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#16C784] shadow-[0_0_0_4px_rgba(22,199,132,0.10)]" aria-hidden="true" />
          <span>Estado del sistema</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="font-medium transition-colors duration-150 hover:text-[#0F172A]">
              {link.label}
            </Link>
          ))}
          <span className="text-slate-300" aria-hidden="true">·</span>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E8EDF3] bg-white text-[#64748B] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#16C784]/25 hover:bg-[#F7F9FC] hover:text-[#16C784]">
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
