import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Contact,
  CreditCard,
  FolderKanban,
  LayoutGrid,
  Settings,
  Shield,
  StickyNote,
  Users,
  BarChart3,
  CalendarDays,
  Rocket,
  Compass,
  Radar,
  ShieldAlert,
  BrainCircuit,
  PlayCircle,
} from 'lucide-react';
import type { AppRoute } from '@/lib/navigation/routes';

export type AppNavLink = {
  href: AppRoute;
  label: string;
  hint: string;
  icon: LucideIcon;
  isNotifications?: boolean;
};

export const appNavLinks: AppNavLink[] = [
  { href: '/app/dashboard', label: 'Inicio', hint: 'Tu resumen del día', icon: LayoutGrid },
  { href: '/app/tasks', label: 'Tareas', hint: 'Pendientes y seguimiento', icon: ClipboardList },
  { href: '/app/projects', label: 'Proyectos', hint: 'Trabajo personal y en equipo', icon: FolderKanban },
  { href: '/app/clients', label: 'Clientes', hint: 'Actividad y carga por cliente', icon: Users },
  { href: '/app/calendar', label: 'Calendario', hint: 'Fechas clave y agenda semanal', icon: CalendarDays },
  { href: '/app/notifications', label: 'Notificaciones', hint: 'Avisos y recordatorios', icon: Bell, isNotifications: true },
  { href: '/app/reminders', label: 'Recordatorios', hint: 'Fechas y alertas', icon: StickyNote },
  { href: '/app/reports', label: 'Reportes', hint: 'Exporta y revisa avances', icon: BarChart3 },
  { href: '/app/onboarding', label: 'Onboarding', hint: 'Checklist y readiness del workspace', icon: Rocket },
  { href: '/app/planning', label: 'Planning', hint: 'Capacidad, carga y próximos 14 días', icon: Compass },
  { href: '/app/control-tower', label: 'Control Tower', hint: 'Señales, foco y ejecución inmediata', icon: Radar },
  { href: '/app/risk-radar', label: 'Risk Radar', hint: 'Riesgo operativo, vencimientos y presión', icon: ShieldAlert },
  { href: '/app/workspace-intelligence', label: 'Intelligence', hint: 'Lectura unificada del workspace', icon: BrainCircuit },
  { href: '/app/execution-center', label: 'Execution Center', hint: 'Do now, unblock y monitor en una sola capa', icon: PlayCircle },
  { href: '/app/completed', label: 'Finalizadas', hint: 'Lo que ya quedó listo', icon: CheckCircle2 },
  { href: '/app/organization', label: 'Organización', hint: 'Equipo, clientes y uso', icon: Building2 },
  { href: '/app/organization/roles', label: 'Permisos', hint: 'Qué puede hacer cada persona', icon: Shield },
  { href: '/app/organization/billing', label: 'Plan', hint: 'Suscripción y límites', icon: CreditCard },
  { href: '/app/admin', label: 'Admin SaaS', hint: 'Vista global de la plataforma', icon: Settings },
  { href: '/contact', label: 'Contacto', hint: 'Ayuda rápida por WhatsApp', icon: Contact },
  { href: '/app/settings', label: 'Configuración', hint: 'Tu perfil y preferencias', icon: Settings },
];
