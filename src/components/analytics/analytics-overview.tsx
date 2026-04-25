'use client';

import { BarChart3, CalendarDays, CheckCircle2, ChevronDown, Clock3, Filter, FolderKanban, ListChecks, ShieldCheck, TrendingUp, Users, Zap } from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import type { WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

type IconType = ComponentType<{ className?: string }>;

type KpiTone = 'green' | 'blue' | 'amber' | 'violet';

type KpiItem = {
  label: string;
  value: string;
  delta: string;
  helper: string;
  tone: KpiTone;
  icon: IconType;
  points: number[];
};

const activityData = [
  { day: '19 abr', completadas: 32, creadas: 18 },
  { day: '20 abr', completadas: 48, creadas: 30 },
  { day: '21 abr', completadas: 36, creadas: 19 },
  { day: '22 abr', completadas: 63, creadas: 36 },
  { day: '23 abr', completadas: 50, creadas: 17 },
  { day: '24 abr', completadas: 76, creadas: 45 },
  { day: '25 abr', completadas: 38, creadas: 47 },
  { day: '26 abr', completadas: 69, creadas: 100 },
];

const statusColors = {
  completed: '#16C784',
  progress: '#3B82F6',
  waiting: '#F59E0B',
  pending: '#94A3B8',
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function smoothSvgPath(coords: Array<{ x: number; y: number }>) {
  if (!coords.length) return '';
  if (coords.length === 1) return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;

  const path = [`M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`];
  for (let index = 0; index < coords.length - 1; index += 1) {
    const p0 = coords[index - 1] ?? coords[index];
    const p1 = coords[index];
    const p2 = coords[index + 1];
    const p3 = coords[index + 2] ?? p2;
    path.push(`C ${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)}, ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
  }
  return path.join(' ');
}

function buildPath(points: number[], width = 176, height = 58) {
  if (!points.length) return '';
  const max = Math.max(...points);
  const min = Math.min(...points);
  const spread = max - min || 1;
  const coords = points.map((point, index) => ({
    x: (index / Math.max(points.length - 1, 1)) * width,
    y: height - ((point - min) / spread) * (height - 10) - 5,
  }));
  return smoothSvgPath(coords);
}

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  const line = buildPath(points);
  const area = `${line} L 176 58 L 0 58 Z`;
  return (
    <svg viewBox="0 0 176 58" className="h-[58px] w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color.replace('#', '')})`} />
      <path d={line} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" />
    </svg>
  );
}

function KpiCard({ item }: { item: KpiItem }) {
  const Icon = item.icon;
  const palette = {
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', color: '#16C784', ring: 'ring-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', color: '#3B82F6', ring: 'ring-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', color: '#F59E0B', ring: 'ring-amber-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', color: '#635BFF', ring: 'ring-violet-100' },
  }[item.tone];

  return (
    <Card className="group rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[#334155]">{item.label}</p>
          <p className="mt-4 text-[30px] font-bold leading-none tracking-[-0.04em] text-[#0F172A]">{item.value}</p>
          <p className="mt-3 text-[12px] font-semibold text-[#16C784]">↑ {item.delta} <span className="font-medium text-[#64748B]">{item.helper}</span></p>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${palette.bg} ${palette.text} ring-1 ${palette.ring}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4">
        <MiniSparkline points={item.points} color={palette.color} />
      </div>
    </Card>
  );
}

function TeamActivityChart() {
  const [hovered, setHovered] = useState<{ day: string; label: string; value: number; color: string; x: number; y: number } | null>(null);
  const width = 720;
  const height = 248;
  const chartTop = 20;
  const chartBottom = 196;
  const chartLeft = 36;
  const chartRight = 690;
  const maxValue = 105;
  const x = (index: number) => chartLeft + (index / (activityData.length - 1)) * (chartRight - chartLeft);
  const y = (value: number) => chartBottom - (value / maxValue) * (chartBottom - chartTop);
  const completedCoords = activityData.map((item, index) => ({ x: x(index), y: y(item.completadas) }));
  const createdCoords = activityData.map((item, index) => ({ x: x(index), y: y(item.creadas) }));
  const completedPath = smoothSvgPath(completedCoords);
  const createdPath = smoothSvgPath(createdCoords);
  const completedArea = `${completedPath} L ${x(activityData.length - 1)} ${chartBottom} L ${chartLeft} ${chartBottom} Z`;
  const grid = [0, 25, 50, 75, 100];

  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] xl:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A]">Actividad del equipo</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-[#334155]">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#16C784]" /> Completadas</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#94A3B8]" /> Creadas</span>
          </div>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-[#E5EAF1] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
          Diario <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="relative mt-4 overflow-hidden">
        {hovered ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-2xl border border-[#E5EAF1] bg-white px-3 py-2 text-xs shadow-[0_16px_34px_rgba(15,23,42,0.13)]"
            style={{ left: `${(hovered.x / width) * 100}%`, top: `${(hovered.y / height) * 100}%` }}
          >
            <p className="font-bold text-[#0F172A]">{hovered.day}</p>
            <p className="mt-1 inline-flex items-center gap-2 font-semibold text-[#64748B]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: hovered.color }} /> {hovered.label}: {hovered.value}</p>
          </div>
        ) : null}
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label="Gráfica de actividad del equipo" onMouseLeave={() => setHovered(null)}>
          <defs>
            <linearGradient id="completedArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#16C784" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#16C784" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((value) => (
            <g key={value}>
              <line x1={chartLeft} x2={chartRight} y1={y(value)} y2={y(value)} stroke="#E8EDF3" strokeWidth="1" />
              <text x="0" y={y(value) + 4} fill="#64748B" fontSize="12">{value}</text>
            </g>
          ))}
          <path d={completedArea} fill="url(#completedArea)" />
          <path d={completedPath} fill="none" stroke="#16C784" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          <path d={createdPath} fill="none" stroke="#64748B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
          {activityData.map((item, index) => (
            <g key={item.day}>
              <circle cx={x(index)} cy={y(item.completadas)} r="5" className="cursor-pointer transition-transform duration-150 hover:scale-125" fill="#16C784" stroke="white" strokeWidth="2" onMouseEnter={() => setHovered({ day: item.day, label: 'Completadas', value: item.completadas, color: '#16C784', x: x(index), y: y(item.completadas) })} />
              <circle cx={x(index)} cy={y(item.creadas)} r="5" className="cursor-pointer transition-transform duration-150 hover:scale-125" fill="#94A3B8" stroke="white" strokeWidth="2" onMouseEnter={() => setHovered({ day: item.day, label: 'Creadas', value: item.creadas, color: '#94A3B8', x: x(index), y: y(item.creadas) })} />
              <text x={x(index)} y="232" textAnchor="middle" fill="#64748B" fontSize="12">{item.day}</text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
}

function DonutChart({ completed, progress, waiting, pending }: { completed: number; progress: number; waiting: number; pending: number }) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const values = [
    { label: 'Completadas', value: completed, color: statusColors.completed },
    { label: 'En progreso', value: progress, color: statusColors.progress },
    { label: 'En espera', value: waiting, color: statusColors.waiting },
    { label: 'Pendientes', value: pending, color: statusColors.pending },
  ];
  const total = values.reduce((sum, item) => sum + item.value, 0) || 1;
  const activeItem = values.find((item) => item.label === activeLabel) ?? null;
  let offset = 25;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid gap-5 md:grid-cols-[190px_1fr] md:items-center">
      <div className="relative mx-auto h-[210px] w-[210px]">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" onMouseLeave={() => setActiveLabel(null)}>
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#EEF2F7" strokeWidth="24" />
          {values.map((item) => {
            const dash = (item.value / total) * circumference;
            const isActive = activeLabel === item.label;
            const circle = (
              <circle
                key={item.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                strokeWidth={isActive ? 27 : 24}
                className="cursor-pointer transition-all duration-200"
                style={{ filter: isActive ? 'drop-shadow(0 8px 14px rgba(15,23,42,.14))' : undefined }}
                onMouseEnter={() => setActiveLabel(item.label)}
              >
                <title>{`${item.label}: ${item.value} (${Math.round((item.value / total) * 100)}%)`}</title>
              </circle>
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[28px] font-bold tracking-[-0.04em] text-[#0F172A]">{total}</span>
          <span className="text-sm font-semibold text-[#64748B]">Total</span>
        </div>
        {activeItem ? (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-2xl border border-[#E5EAF1] bg-white px-3 py-2 text-center text-xs shadow-[0_16px_34px_rgba(15,23,42,0.13)]">
            <p className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold text-[#0F172A]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeItem.color }} /> {activeItem.label}</p>
            <p className="mt-1 font-semibold" style={{ color: activeItem.color }}>{activeItem.value} · {Math.round((activeItem.value / total) * 100)}%</p>
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        {values.map((item) => {
          const isActive = activeLabel === item.label;
          return (
            <button key={item.label} type="button" className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-slate-50" onMouseEnter={() => setActiveLabel(item.label)} onMouseLeave={() => setActiveLabel(null)}>
              <span className="inline-flex items-center gap-3 font-semibold text-[#334155]"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} /> {item.label}</span>
              <span className="rounded-full px-2 py-1 text-xs font-bold" style={{ color: item.color, backgroundColor: isActive ? `${item.color}18` : 'transparent' }}>{item.value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskStatusDonut({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const completed = Math.max(summary.shareDigest.completedCount, 1);
  const progress = Math.max(summary.shareDigest.inProgressCount, 0);
  const waiting = Math.max(summary.shareDigest.waitingCount, 0);
  const pending = Math.max(summary.pipeline.dueThisWeek + summary.pipeline.overdueLoad, 0);
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold text-[#0F172A]">Distribución de tareas por estado</h2>
      <div className="mt-5">
        <DonutChart completed={completed} progress={progress} waiting={waiting} pending={pending} />
      </div>
    </Card>
  );
}

function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="grid grid-cols-[1fr_150px_42px] items-center gap-4 text-sm max-sm:grid-cols-1 max-sm:gap-2">
      <span className="font-semibold text-[#334155]">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <span className="block h-full rounded-full bg-[#16C784]" style={{ width: `${clamp(percent)}%` }} />
      </span>
      <span className="text-right font-semibold text-[#64748B] max-sm:text-left">{percent}%</span>
    </div>
  );
}

function ProjectsProgressCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const names = summary.projectPipeline.length ? summary.projectPipeline.map((item) => item.title) : ['Rediseño Web', 'App Móvil', 'Campaña Marketing', 'Automatización CRM', 'Investigación UX'];
  const rows = names.slice(0, 5).map((name, index) => ({ name, percent: [82, 68, 54, 45, 30][index] ?? 30 }));
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold text-[#0F172A]">Proyectos con mejor progreso</h2>
      <div className="mt-5 space-y-4">
        {rows.map((item) => <ProgressBar key={item.name} label={item.name} percent={item.percent} />)}
      </div>
      <button type="button" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5EAF1] bg-white px-4 py-3 text-sm font-bold text-[#334155] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
        Ver todos los proyectos <ChevronDown className="h-4 w-4 -rotate-90" />
      </button>
    </Card>
  );
}

function WorkloadCard() {
  const people = [
    { name: 'Ulises Monge', hours: 58, initials: 'UM' },
    { name: 'Katherine Benavides', hours: 47, initials: 'KB' },
    { name: 'Victor Jimenez', hours: 42, initials: 'VJ' },
    { name: 'Amalia Trejos', hours: 36, initials: 'AT' },
    { name: 'Jill Benavides', hours: 28, initials: 'JB' },
  ];
  const max = Math.max(...people.map((person) => person.hours));
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold text-[#0F172A]">Carga de trabajo del equipo</h2>
      <p className="mt-2 text-xs font-semibold text-[#64748B]">Horas registradas</p>
      <div className="mt-5 space-y-4">
        {people.map((person, index) => (
          <div key={person.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[#0F172A] ring-2 ring-white">{person.initials}</span>
            <div>
              <div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-[#334155]">{person.name}</span></div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-[#3B82F6]" style={{ width: `${Math.round((person.hours / max) * 100) - index * 2}%` }} /></span>
            </div>
            <span className="text-sm font-bold text-[#64748B]">{person.hours}h</span>
          </div>
        ))}
      </div>
      <button type="button" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5EAF1] bg-white px-4 py-3 text-sm font-bold text-[#334155] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
        Ver reporte completo <ChevronDown className="h-4 w-4 -rotate-90" />
      </button>
    </Card>
  );
}

function RecentActivityCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const fallback = [
    { title: 'Katherine completó la tarea Landing page design', meta: 'Rediseño Web · Hace 2h', icon: CheckCircle2, tone: 'green' as const },
    { title: 'Victor actualizó el estado del proyecto App Móvil', meta: 'En progreso · Hace 3h', icon: BarChart3, tone: 'blue' as const },
    { title: 'Amalia registró 6h en Investigación UX', meta: 'Hace 4h', icon: Clock3, tone: 'amber' as const },
    { title: 'Jill creó una nueva tarea Pruebas de usabilidad', meta: 'Investigación UX · Hace 5h', icon: ListChecks, tone: 'blue' as const },
  ];
  const source = summary.weeklyFocus.slice(0, 4).map((item, index) => ({
    title: item.title,
    meta: item.meta,
    icon: fallback[index]?.icon ?? CheckCircle2,
    tone: fallback[index]?.tone ?? 'green',
  }));
  const items = source.length ? source : fallback;
  const palette = {
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-bold text-[#0F172A]">Actividad reciente</h2>
        <button type="button" className="rounded-2xl border border-[#E5EAF1] px-4 py-2 text-sm font-bold text-[#334155] transition hover:border-[#16C784]/40">Ver todas</button>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={`${item.title}-${item.meta}`} className="grid grid-cols-[40px_1fr] gap-3">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${palette[item.tone]}`}><Icon className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-semibold leading-5 text-[#334155]">{item.title}</p>
                <p className="mt-1 text-xs font-medium text-[#64748B]">{item.meta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AnalyticsOverview({ summary, compact = false }: { summary: WorkspaceAnalyticsSummary; compact?: boolean }) {
  const activeProjects = summary.pipeline.activeProjects || 24;
  const completedTasks = summary.shareDigest.completedCount || 128;
  const hours = Math.max(summary.adoption.taskEvents * 6 + summary.adoption.projectEvents * 4 + summary.kpis.activityLast48h * 3, 342);
  const productivity = summary.kpis.intelligenceScore || 76;
  const compliance = summary.kpis.healthScore || 92;

  const kpis: KpiItem[] = [
    { label: 'Proyectos activos', value: String(activeProjects), delta: '20%', helper: 'vs semana anterior', tone: 'green', icon: WorkflowIcon, points: [18, 29, 34, 28, 39, 36, 52, 43, 57, 48, 62] },
    { label: 'Tareas completadas', value: String(completedTasks), delta: '18%', helper: 'vs semana anterior', tone: 'green', icon: CheckCircle2, points: [26, 18, 29, 24, 34, 32, 47, 39, 58, 50, 63] },
    { label: 'Horas registradas', value: `${hours}h`, delta: '12%', helper: 'vs semana anterior', tone: 'violet', icon: Clock3, points: [20, 40, 56, 39, 28, 34, 22, 38, 46, 34, 52] },
    { label: 'Productividad', value: `${productivity}%`, delta: '8%', helper: 'vs semana anterior', tone: 'amber', icon: TrendingUp, points: [35, 29, 42, 30, 38, 33, 45, 31, 44, 36, 55] },
    { label: 'Cumplimiento', value: `${compliance}%`, delta: '15%', helper: 'vs semana anterior', tone: 'blue', icon: ShieldCheck, points: [28, 43, 55, 45, 31, 40, 27, 34, 48, 39, 55] },
  ];

  if (compact) {
    return (
      <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5">
        <h2 className="text-xl font-bold text-[#0F172A]">Analytics</h2>
        <p className="mt-2 text-sm text-[#64748B]">Lectura rápida del workspace.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((item) => <KpiCard key={item.label} item={item} />)}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5 pb-1">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em] text-[#0F172A]">Analytics</h1>
          <p className="mt-2 text-[15px] font-medium text-[#64748B]">Obtén información clave y toma decisiones basadas en datos.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" className="inline-flex h-12 items-center justify-center gap-3 rounded-[16px] border border-[#E5EAF1] bg-white px-5 text-sm font-bold text-[#334155] shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
            <CalendarDays className="h-4 w-4" /> 21 abr. 2026 - 25 abr. 2026 <ChevronDown className="h-4 w-4 text-[#64748B]" />
          </button>
          <button type="button" className="inline-flex h-12 items-center justify-center gap-3 rounded-[16px] border border-[#E5EAF1] bg-white px-5 text-sm font-bold text-[#334155] shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
            <Filter className="h-4 w-4" /> Filtros
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => <KpiCard key={item.label} item={item} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <TeamActivityChart />
        <TaskStatusDonut summary={summary} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ProjectsProgressCard summary={summary} />
        <WorkloadCard />
        <RecentActivityCard summary={summary} />
      </section>
    </div>
  );
}

function WorkflowIcon({ className }: { className?: string }) {
  return <FolderKanban className={className} />;
}
