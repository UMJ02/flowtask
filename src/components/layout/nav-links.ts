import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  ClipboardList,
  Contact,
  CreditCard,
  FolderKanban,
  LayoutGrid,
  Settings,
  Shield,
  Users,
  BrainCircuit,
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
  { href: '/app/workspace', label: 'Workspace', hint: 'Tu tablero principal', icon: LayoutGrid },
  { href: '/app/projects', label: 'Projects', hint: 'Proyectos y avance', icon: FolderKanban },
  { href: '/app/tasks', label: 'Tasks', hint: 'Tareas y pizarra', icon: ClipboardList },
  { href: '/app/clients', label: 'Clients', hint: 'Clientes activos', icon: Users },
  { href: '/app/intelligence', label: 'Intelligence', hint: 'Lectura clara del trabajo', icon: BrainCircuit },
  { href: '/app/reports', label: 'Reports', hint: 'Resumen y PDF', icon: BarChart3 },
  { href: '/app/organization', label: 'Organización', hint: 'Equipo y estructura', icon: Building2 },
  { href: '/app/organization/roles', label: 'Permisos', hint: 'Roles del equipo', icon: Shield },
  { href: '/app/organization/billing', label: 'Plan', hint: 'Suscripción y límites', icon: CreditCard },
  { href: '/contact', label: 'Contacto', hint: 'Ayuda rápida', icon: Contact },
  { href: '/app/settings', label: 'Settings', hint: 'Perfil y preferencias', icon: Settings },
];
