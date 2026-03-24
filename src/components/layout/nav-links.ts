import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BrainCircuit,
  Building2,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutGrid,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import type { AppRoute } from '@/lib/navigation/routes';

export type AppNavSection = 'core' | 'organization';

export type AppNavLink = {
  href: AppRoute;
  label: string;
  hint: string;
  icon: LucideIcon;
  section: AppNavSection;
  isNotifications?: boolean;
};

export const appNavLinks: AppNavLink[] = [
  { href: '/app/workspace', label: 'Workspace', hint: 'Centro operativo', icon: LayoutGrid, section: 'core' },
  { href: '/app/projects', label: 'Proyectos', hint: 'Entrega y avance', icon: FolderKanban, section: 'core' },
  { href: '/app/tasks', label: 'Tareas', hint: 'Trabajo del día', icon: ClipboardList, section: 'core' },
  { href: '/app/clients', label: 'Clientes', hint: 'Cuentas y carga', icon: Users, section: 'core' },
  { href: '/app/intelligence', label: 'Intelligence', hint: 'Plan, riesgo y ejecución', icon: BrainCircuit, section: 'core' },
  { href: '/app/reports', label: 'Reportes', hint: 'Resumen y exportación', icon: BarChart3, section: 'core' },
  { href: '/app/organization', label: 'Equipo', hint: 'Miembros y espacio', icon: Building2, section: 'organization' },
  { href: '/app/organization/roles', label: 'Roles', hint: 'Accesos y permisos', icon: Shield, section: 'organization' },
  { href: '/app/organization/billing', label: 'Plan', hint: 'Límites y consumo', icon: CreditCard, section: 'organization' },
  { href: '/app/settings', label: 'Ajustes', hint: 'Perfil y preferencias', icon: Settings, section: 'organization' },
];

export const coreNavLinks = appNavLinks.filter((link) => link.section === 'core');
export const organizationNavLinks = appNavLinks.filter((link) => link.section === 'organization');
