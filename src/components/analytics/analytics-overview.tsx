'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FolderKanban,
  ListChecks,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useMemo, useState, type ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import type { AnalyticsTimeSeriesPoint, WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

type IconType = ComponentType<{ className?: string }>;

type KpiTone = 'green' | 'blue' | 'amber' | 'violet' | 'rose';

type KpiItem = {
  label: string;
  value: string;
  helper: string;
  tone: KpiTone;
  icon: IconType;
  points: number[];
};

const palette = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', color: '#16C784', ring: 'ring-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', color: '#3B82F6', ring: 'ring-blue-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', color: '#F59E0B', ring: 'ring-amber-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', color: '#635BFF', ring: 'ring-violet-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', color: '#EF4444', ring: 'ring-rose-100' },
};

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((value) => '"' + String(value ?? '').replaceAll('"', '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

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
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const spread = max - min || 1;
  const coords = points.map((point, index) => ({
    x: (index / Math.max(points.length - 1, 1)) * width,
    y: height - ((point - min) / spread) * (height - 10) - 5,
  }));
  return smoothSvgPath(coords);
}

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  const line = buildPath(points.length ? points : [0, 0, 0]);
  const area = `${line} L 176 58 L 0 58 Z`;
  const id = `spark-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 176 58" className="h-[58px] w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} className="animate-[fadeIn_.45s_ease-out]" />
      <path d={line} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" className="animate-[drawLine_.7s_ease-out]" />
    </svg>
  );
}

function KpiCard({ item }: { item: KpiItem }) {
  const Icon = item.icon;
  const tone = palette[item.tone];

  return (
    <Card className="group rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[#334155]">{item.label}</p>
          <p className="mt-4 text-[30px] font-bold leading-none tracking-[-0.04em] text-[#0F172A]">{item.value}</p>
          <p className="mt-3 text-[12px] font-medium text-[#64748B]">{item.helper}</p>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${tone.bg} ${tone.text} ring-1 ${tone.ring}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4">
        <MiniSparkline points={item.points} color={tone.color} />
      </div>
    </Card>
  );
}

function seriesWindow(points: AnalyticsTimeSeriesPoint[], mode: '7d' | '30d') {
  return mode === '7d' ? points.slice(-7) : points;
}

function maxSeriesValue(points: AnalyticsTimeSeriesPoint[]) {
  return Math.max(1, ...points.flatMap((item) => [item.created, item.completed, item.activeDue]));
}

function TeamActivityChart({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const [hovered, setHovered] = useState<{ day: string; label: string; value: number; color: string; x: number; y: number } | null>(null);
  const [range, setRange] = useState<'7d' | '30d'>('30d');
  const data = useMemo(() => seriesWindow(summary.timeSeries, range), [summary.timeSeries, range]);
  const width = 720;
  const height = 248;
  const chartTop = 20;
  const chartBottom = 196;
  const chartLeft = 36;
  const chartRight = 690;
  const maxValue = maxSeriesValue(data);
  const x = (index: number) => chartLeft + (index / Math.max(data.length - 1, 1)) * (chartRight - chartLeft);
  const y = (value: number) => chartBottom - (value / maxValue) * (chartBottom - chartTop);
  const completedCoords = data.map((item, index) => ({ x: x(index), y: y(item.completed) }));
  const createdCoords = data.map((item, index) => ({ x: x(index), y: y(item.created) }));
  const dueCoords = data.map((item, index) => ({ x: x(index), y: y(item.activeDue) }));
  const completedPath = smoothSvgPath(completedCoords);
  const createdPath = smoothSvgPath(createdCoords);
  const duePath = smoothSvgPath(dueCoords);
  const completedArea = `${completedPath} L ${x(Math.max(data.length - 1, 0))} ${chartBottom} L ${chartLeft} ${chartBottom} Z`;
  const grid = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];

  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] xl:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A]">Actividad real del workspace</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-[#334155]">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#16C784]" /> Concluidas</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#94A3B8]" /> Creadas</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#F59E0B]" /> Vencen activas</span>
          </div>
        </div>
        <button type="button" onClick={() => setRange((value) => value === '30d' ? '7d' : '30d')} className="inline-flex items-center gap-2 rounded-2xl border border-[#E5EAF1] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
          {range === '30d' ? 'Últimos 30 días' : 'Últimos 7 días'} <ChevronDown className="h-4 w-4" />
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
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label="Gráfica real de actividad del workspace" onMouseLeave={() => setHovered(null)}>
          <defs>
            <linearGradient id="completedAreaReal" x1="0" x2="0" y1="0" y2="1">
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
          <path d={completedArea} fill="url(#completedAreaReal)" />
          <path d={completedPath} fill="none" stroke="#16C784" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" className="animate-[drawLine_.8s_ease-out]" />
          <path d={createdPath} fill="none" stroke="#64748B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" className="animate-[drawLine_.8s_ease-out]" />
          <path d={duePath} fill="none" stroke="#F59E0B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" strokeDasharray="5 5" className="animate-[drawLine_.8s_ease-out]" />
          {data.map((item, index) => (
            <g key={item.iso}>
              <circle cx={x(index)} cy={y(item.completed)} r="5" className="cursor-pointer transition-transform duration-150 hover:scale-125" fill="#16C784" stroke="white" strokeWidth="2" onMouseEnter={() => setHovered({ day: item.label, label: 'Concluidas', value: item.completed, color: '#16C784', x: x(index), y: y(item.completed) })} />
              <circle cx={x(index)} cy={y(item.created)} r="5" className="cursor-pointer transition-transform duration-150 hover:scale-125" fill="#94A3B8" stroke="white" strokeWidth="2" onMouseEnter={() => setHovered({ day: item.label, label: 'Creadas', value: item.created, color: '#94A3B8', x: x(index), y: y(item.created) })} />
              <circle cx={x(index)} cy={y(item.activeDue)} r="4" className="cursor-pointer transition-transform duration-150 hover:scale-125" fill="#F59E0B" stroke="white" strokeWidth="2" onMouseEnter={() => setHovered({ day: item.label, label: 'Vencen activas', value: item.activeDue, color: '#F59E0B', x: x(index), y: y(item.activeDue) })} />
              {(range === '7d' || index % 4 === 0 || index === data.length - 1) && <text x={x(index)} y="232" textAnchor="middle" fill="#64748B" fontSize="11">{item.label}</text>}
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
}

function DonutChart({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const values = summary.statusDistribution;
  const total = values.reduce((sum, item) => sum + item.count, 0) || 1;
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
            const dash = (item.count / total) * circumference;
            const isActive = activeLabel === item.label;
            const circle = (
              <circle
                key={item.status}
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
                <title>{`${item.label}: ${item.count} (${Math.round((item.count / total) * 100)}%)`}</title>
              </circle>
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[28px] font-bold tracking-[-0.04em] text-[#0F172A]">{total}</span>
          <span className="text-sm font-semibold text-[#64748B]">Tareas</span>
        </div>
        {activeItem ? (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-2xl border border-[#E5EAF1] bg-white px-3 py-2 text-center text-xs shadow-[0_16px_34px_rgba(15,23,42,0.13)]">
            <p className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold text-[#0F172A]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeItem.color }} /> {activeItem.label}</p>
            <p className="mt-1 font-semibold" style={{ color: activeItem.color }}>{activeItem.count} · {Math.round((activeItem.count / total) * 100)}%</p>
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        {values.map((item) => {
          const isActive = activeLabel === item.label;
          return (
            <button key={item.status} type="button" className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-slate-50" onClick={() => setActiveLabel(activeLabel === item.label ? null : item.label)} onMouseEnter={() => setActiveLabel(item.label)} onMouseLeave={() => setActiveLabel(null)}>
              <span className="inline-flex items-center gap-3 font-semibold text-[#334155]"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} /> {item.label}</span>
              <span className="rounded-full px-2 py-1 text-xs font-bold" style={{ color: item.color, backgroundColor: isActive ? `${item.color}18` : 'transparent' }}>{item.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskStatusDonut({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold text-[#0F172A]">Distribución real por estado</h2>
      <p className="mt-2 text-sm font-medium text-[#64748B]">Concluidas se muestran como cierre histórico, no como atraso.</p>
      <div className="mt-5">
        <DonutChart summary={summary} />
      </div>
    </Card>
  );
}

function ProgressBar({ label, percent, meta }: { label: string; percent: number; meta?: string }) {
  return (
    <div className="grid grid-cols-[1fr_150px_42px] items-center gap-4 text-sm max-sm:grid-cols-1 max-sm:gap-2">
      <span>
        <span className="block font-semibold text-[#334155]">{label}</span>
        {meta ? <span className="mt-1 block text-xs font-medium text-[#64748B]">{meta}</span> : null}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <span className="block h-full rounded-full bg-[#16C784] transition-all duration-700" style={{ width: `${clamp(percent)}%` }} />
      </span>
      <span className="text-right font-semibold text-[#64748B] max-sm:text-left">{percent}%</span>
    </div>
  );
}

function ProjectsProgressCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const rows = summary.projectProgress;
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold text-[#0F172A]">Progreso real por proyecto</h2>
      <div className="mt-5 space-y-4">
        {rows.length ? rows.map((item) => (
          <ProgressBar key={item.id} label={item.title} percent={item.percent} meta={`${item.completed}/${item.total} concluidas · ${item.active} activas · ${item.waiting} en espera`} />
        )) : <p className="rounded-2xl border border-dashed border-[#E5EAF1] p-5 text-sm font-medium text-[#64748B]">No hay proyectos con tareas para calcular progreso.</p>}
      </div>
      <Link href="/app/projects" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5EAF1] bg-white px-4 py-3 text-sm font-bold text-[#334155] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
        Ver todos los proyectos <ChevronDown className="h-4 w-4 -rotate-90" />
      </Link>
    </Card>
  );
}

function WorkloadCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const rows = summary.workload;
  const max = Math.max(1, ...rows.map((item) => item.total));
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold text-[#0F172A]">Carga operativa real</h2>
      <p className="mt-2 text-xs font-semibold text-[#64748B]">Tareas activas y en espera por cliente/departamento.</p>
      <div className="mt-5 space-y-4">
        {rows.length ? rows.map((item) => (
          <div key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[#0F172A] ring-2 ring-white">{item.label.slice(0, 2).toUpperCase()}</span>
            <div>
              <div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-[#334155]">{item.label}</span></div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-[#3B82F6] transition-all duration-700" style={{ width: `${Math.round((item.total / max) * 100)}%` }} /></span>
              <span className="mt-1 block text-[11px] font-medium text-[#64748B]">{item.active} en proceso · {item.waiting} en espera · {item.overdue} vencidas activas</span>
            </div>
            <span className="text-sm font-bold text-[#64748B]">{item.total}</span>
          </div>
        )) : <p className="rounded-2xl border border-dashed border-[#E5EAF1] p-5 text-sm font-medium text-[#64748B]">Sin carga operativa activa.</p>}
      </div>
      <button type="button" onClick={() => downloadCsv('flowtask-carga-operativa.csv', [['area', 'en_proceso', 'en_espera', 'vencidas_activas', 'total'], ...rows.map((item) => [item.label, String(item.active), String(item.waiting), String(item.overdue), String(item.total)])])} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5EAF1] bg-white px-4 py-3 text-sm font-bold text-[#334155] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
        Exportar carga real <Download className="h-4 w-4" />
      </button>
    </Card>
  );
}

function RecentActivityCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const items = summary.weeklyFocus.slice(0, 4);
  const iconForTone = {
    critical: AlertTriangle,
    attention: Clock3,
    stable: CheckCircle2,
  };
  const paletteForTone = {
    critical: 'bg-rose-50 text-rose-600',
    attention: 'bg-amber-50 text-amber-600',
    stable: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-bold text-[#0F172A]">Foco operativo</h2>
        <Link href="/app/tasks" className="rounded-2xl border border-[#E5EAF1] px-4 py-2 text-sm font-bold text-[#334155] transition hover:border-[#16C784]/40">Ver tareas</Link>
      </div>
      <div className="mt-5 space-y-4">
        {items.length ? items.map((item) => {
          const Icon = iconForTone[item.tone];
          return (
            <div key={`${item.id}-${item.title}`} className="grid grid-cols-[40px_1fr] gap-3">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${paletteForTone[item.tone]}`}><Icon className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-semibold leading-5 text-[#334155]">{item.title}</p>
                <p className="mt-1 text-xs font-medium text-[#64748B]">{item.meta} · {item.statusLabel}</p>
              </div>
            </div>
          );
        }) : <p className="rounded-2xl border border-dashed border-[#E5EAF1] p-5 text-sm font-medium text-[#64748B]">Sin foco operativo urgente.</p>}
      </div>
    </Card>
  );
}

function RecommendationsCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  return (
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] xl:col-span-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A]">Inteligencia operativa</h2>
          <p className="mt-1 text-sm font-medium text-[#64748B]">Lectura generada con tareas, proyectos, comentarios y adjuntos reales.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><Zap className="h-3.5 w-3.5" /> Datos reales</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {summary.recommendations.map((item) => (
          <div key={item} className="rounded-2xl border border-[#E5EAF1] bg-[#F8FAFC] p-4 text-sm font-semibold leading-6 text-[#334155]">{item}</div>
        ))}
      </div>
    </Card>
  );
}

export function AnalyticsOverview({ summary, compact = false }: { summary: WorkspaceAnalyticsSummary; compact?: boolean }) {
  const real = summary.realMetrics;
  const sparkCreated = summary.timeSeries.map((item) => item.created);
  const sparkCompleted = summary.timeSeries.map((item) => item.completed);
  const sparkDue = summary.timeSeries.map((item) => item.activeDue);
  const sparkOperational = summary.timeSeries.map((_, index) => Math.max(0, real.operationalTasks - (summary.timeSeries.length - index - 1)));
  const kpis: KpiItem[] = [
    { label: 'Tareas operativas', value: String(real.operationalTasks), helper: 'En proceso; excluye concluidas y espera.', tone: 'blue', icon: ListChecks, points: sparkOperational },
    { label: 'En espera', value: String(real.waitingTasks), helper: 'Standby; no cuenta como vencido.', tone: 'amber', icon: Clock3, points: summary.timeSeries.map(() => real.waitingTasks) },
    { label: 'Concluidas', value: String(real.completedTasks), helper: 'Histórico; ocultas de operación diaria.', tone: 'green', icon: CheckCircle2, points: sparkCompleted },
    { label: 'Vencidas reales', value: String(real.overdueActiveTasks), helper: 'Solo tareas en proceso vencidas.', tone: real.overdueActiveTasks > 0 ? 'rose' : 'green', icon: AlertTriangle, points: sparkDue },
    { label: 'Actividad documental', value: `${real.commentsCount}/${real.attachmentsCount}`, helper: 'Comentarios / adjuntos registrados.', tone: 'violet', icon: FolderKanban, points: sparkCreated },
  ];

  if (compact) {
    return (
      <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5">
        <h2 className="text-xl font-bold text-[#0F172A]">Analytics</h2>
        <p className="mt-2 text-sm text-[#64748B]">Lectura rápida del workspace con datos reales.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((item) => <KpiCard key={item.label} item={item} />)}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5 pb-1">
      <style jsx global>{`
        @keyframes drawLine {
          from { stroke-dasharray: 900; stroke-dashoffset: 900; }
          to { stroke-dasharray: 900; stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700"><RefreshCcw className="h-3.5 w-3.5" /> Realtime Intelligence</p>
          <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.04em] text-[#0F172A]">Analytics operativo</h1>
          <p className="mt-2 text-[15px] font-medium text-[#64748B]">Gráficas calculadas desde tareas, proyectos, comentarios y adjuntos reales. Concluidas y en espera no contaminan vencidos.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={() => downloadCsv('flowtask-analytics-real.csv', [['metric', 'value'], ['Tareas totales', String(real.totalTasks)], ['Tareas operativas', String(real.operationalTasks)], ['En espera', String(real.waitingTasks)], ['Concluidas', String(real.completedTasks)], ['Vencidas reales', String(real.overdueActiveTasks)], ['Adjuntos', String(real.attachmentsCount)], ['Comentarios', String(real.commentsCount)], ['Promedio cierre dias', String(real.avgCloseDays)]])} className="inline-flex h-12 items-center justify-center gap-3 rounded-[16px] border border-[#E5EAF1] bg-white px-5 text-sm font-bold text-[#334155] shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition hover:border-[#16C784]/40 hover:text-[#0F172A]">
            <Download className="h-4 w-4" /> Exportar datos reales
          </button>
          <Link href="/app/tasks?includeCompleted=true" className="inline-flex h-12 items-center justify-center gap-3 rounded-[16px] bg-[#050B18] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.10)] transition hover:bg-[#111827]">
            <CalendarDays className="h-4 w-4" /> Ver concluidas
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => <KpiCard key={item.label} item={item} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <TeamActivityChart summary={summary} />
        <TaskStatusDonut summary={summary} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ProjectsProgressCard summary={summary} />
        <WorkloadCard summary={summary} />
        <RecentActivityCard summary={summary} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <RecommendationsCard summary={summary} />
      </section>
    </div>
  );
}
