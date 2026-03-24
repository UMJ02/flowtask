import { asRoute, reportsPrintRoute, type AppRoute } from '@/lib/navigation/routes';

export type ModuleLifecycle = 'core' | 'support' | 'legacy';
export type IntelligenceModuleId =
  | 'intelligence-hub'
  | 'planning'
  | 'risk-radar'
  | 'execution-center'
  | 'control-tower'
  | 'executive-suite'
  | 'workspace-intelligence'
  | 'workspace-os';

export type IntelligenceModuleDefinition = {
  id: IntelligenceModuleId;
  title: string;
  description: string;
  href: AppRoute;
  lifecycle: ModuleLifecycle;
  lifecycleLabel: string;
  category: 'hub' | 'delivery' | 'executive';
  shortLabel: string;
  cta: string;
  pdfHref?: AppRoute;
};

export const intelligenceModules: IntelligenceModuleDefinition[] = [
  {
    id: 'intelligence-hub',
    title: 'Intelligence Hub',
    description: 'Punto de entrada consolidado para leer señales, riesgo, capacidad y ejecución sin brincar entre vistas.',
    href: asRoute('/app/intelligence'),
    lifecycle: 'core',
    lifecycleLabel: 'Core',
    category: 'hub',
    shortLabel: 'Hub central',
    cta: 'Abrir hub',
    pdfHref: reportsPrintRoute('intelligence'),
  },
  {
    id: 'planning',
    title: 'Planning',
    description: 'Ordena horizonte, carga y prioridades de corto plazo para que la ejecución no nazca desalineada.',
    href: asRoute('/app/planning'),
    lifecycle: 'core',
    lifecycleLabel: 'Core',
    category: 'delivery',
    shortLabel: 'Capacidad y foco',
    cta: 'Abrir planning',
    pdfHref: reportsPrintRoute('planning'),
  },
  {
    id: 'risk-radar',
    title: 'Risk Radar',
    description: 'Detecta presión operativa antes de que se convierta en incidentes visibles para clientes o para el equipo.',
    href: asRoute('/app/risk-radar'),
    lifecycle: 'core',
    lifecycleLabel: 'Core',
    category: 'delivery',
    shortLabel: 'Riesgo operativo',
    cta: 'Abrir risk radar',
    pdfHref: reportsPrintRoute('risk'),
  },
  {
    id: 'execution-center',
    title: 'Execution Center',
    description: 'Convierte señales del workspace en acciones do now, unblock y monitor con una lectura accionable.',
    href: asRoute('/app/execution-center'),
    lifecycle: 'core',
    lifecycleLabel: 'Core',
    category: 'delivery',
    shortLabel: 'Acción inmediata',
    cta: 'Abrir execution',
    pdfHref: reportsPrintRoute('execution'),
  },
  {
    id: 'control-tower',
    title: 'Control Tower',
    description: 'Lectura táctica complementaria para priorizar foco inmediato por cliente, tareas y vencimientos.',
    href: asRoute('/app/control-tower'),
    lifecycle: 'support',
    lifecycleLabel: 'Soporte',
    category: 'executive',
    shortLabel: 'Táctica diaria',
    cta: 'Abrir control tower',
  },
  {
    id: 'executive-suite',
    title: 'Executive Suite',
    description: 'Capa ejecutiva para revisión semanal, alineación de decisiones y comunicación a dirección.',
    href: asRoute('/app/executive-suite'),
    lifecycle: 'support',
    lifecycleLabel: 'Soporte',
    category: 'executive',
    shortLabel: 'Gobierno semanal',
    cta: 'Abrir executive suite',
    pdfHref: reportsPrintRoute('executive-suite'),
  },
  {
    id: 'workspace-intelligence',
    title: 'Workspace Intelligence',
    description: 'Vista heredada que sigue disponible por compatibilidad, pero su lectura principal vive ya en Intelligence Hub.',
    href: asRoute('/app/workspace-intelligence'),
    lifecycle: 'legacy',
    lifecycleLabel: 'Legacy',
    category: 'executive',
    shortLabel: 'Compatibilidad',
    cta: 'Abrir vista legacy',
    pdfHref: reportsPrintRoute('intelligence'),
  },
  {
    id: 'workspace-os',
    title: 'Workspace OS',
    description: 'Vista heredada consolidada. Se conserva por compatibilidad mientras el flujo principal migra al hub.',
    href: asRoute('/app/workspace-os'),
    lifecycle: 'legacy',
    lifecycleLabel: 'Legacy',
    category: 'executive',
    shortLabel: 'Compatibilidad',
    cta: 'Abrir OS legacy',
  },
];

export function getIntelligenceModule(id: IntelligenceModuleId): IntelligenceModuleDefinition {
  const moduleDefinition = intelligenceModules.find((item) => item.id === id);
  if (!moduleDefinition) {
    throw new Error(`Unknown intelligence module: ${id}`);
  }
  return moduleDefinition;
}

export function getModulesByLifecycle(lifecycle: ModuleLifecycle): IntelligenceModuleDefinition[] {
  return intelligenceModules.filter((item) => item.lifecycle === lifecycle);
}
