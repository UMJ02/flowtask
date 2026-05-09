export const designSystemVersion = "58.21.5-modern-density-motion-system";

export const ds = {
  semantic: true,
  density: "modern-compact",
  color: {
    surface: {
      app: "bg-[#F7F8FA]",
      card: "bg-white",
      muted: "bg-slate-50",
      elevated: "bg-white",
      subtle: "bg-slate-50/70",
    },
    text: {
      primary: "text-slate-950",
      secondary: "text-slate-600",
      muted: "text-slate-500",
      inverse: "text-white",
    },
    border: {
      subtle: "border-slate-200/80",
      strong: "border-slate-300",
      focus: "border-emerald-300",
    },
    brand: {
      solid: "bg-slate-950",
      hover: "hover:bg-slate-900",
      text: "text-emerald-700",
      soft: "bg-emerald-50",
      border: "border-emerald-200",
    },
    status: {
      success: "border-emerald-200 bg-emerald-50 text-emerald-700",
      warning: "border-amber-200 bg-amber-50 text-amber-700",
      danger: "border-rose-200 bg-rose-50 text-rose-700",
      info: "border-blue-200 bg-blue-50 text-blue-700",
      neutral: "border-slate-200 bg-slate-100 text-slate-700",
    },
  },
  type: {
    pageTitle: "text-[26px] leading-[1.08] tracking-[-0.03em] font-semibold text-slate-950 lg:text-[30px]",
    sectionTitle: "text-[18px] leading-tight tracking-[-0.02em] font-semibold text-slate-950 lg:text-[20px]",
    cardTitle: "text-[15px] leading-tight font-semibold text-slate-950 lg:text-[16px]",
    smallTitle: "text-[13px] leading-tight font-semibold text-slate-900",
    body: "text-[14px] leading-6 text-slate-700",
    bodySmall: "text-[13px] leading-5 text-slate-600",
    caption: "text-[12px] leading-4 text-slate-500",
    label: "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500",
  },
  layout: {
    page: "mx-auto w-full max-w-7xl px-4 py-5 md:px-5 lg:px-7",
    pageHeader: "mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
    gridSidebar: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]",
    stack: "space-y-5",
  },
  card: {
    base: "rounded-[22px] border border-slate-200/80 bg-white",
    main: "rounded-[24px] border border-slate-200/80 bg-white p-5",
    hero: "rounded-[24px] border border-slate-200/80 bg-white p-5 md:p-5",
    section: "rounded-[22px] border border-slate-200/80 bg-white p-4",
    compact: "rounded-[18px] border border-slate-200/80 bg-white p-3",
    floating: "rounded-[22px] border border-slate-200/80 bg-white",
    interactive: "transition duration-200 ease-out hover:-translate-y-px hover:border-slate-300 hover:bg-white active:scale-[0.995]",
  },
  control: {
    input: "h-10 rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-3 focus:ring-emerald-500/10",
    inputLarge: "h-11 rounded-[14px] border border-slate-200 bg-white px-3.5 text-[14px] text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-3 focus:ring-emerald-500/10",
    textarea: "min-h-[112px] rounded-[14px] border border-slate-200 bg-white px-3.5 py-3 text-[14px] text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-3 focus:ring-emerald-500/10",
  },
  button: {
    primary: "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[13px] font-semibold text-white transition duration-150 hover:bg-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    primaryLarge: "inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-slate-950 px-5 text-[14px] font-semibold text-white transition duration-150 hover:bg-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    secondary: "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    ghost: "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-medium text-slate-600 transition duration-150 hover:bg-slate-100 active:scale-[0.98]",
    icon: "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]",
    small: "inline-flex h-8 items-center justify-center gap-2 rounded-lg px-3 text-[12px] font-semibold transition duration-150 active:scale-[0.98]",
  },
  motion: {
    subtle: "transition duration-150 ease-out",
    hoverLift: "transition duration-200 ease-out hover:-translate-y-px",
    press: "active:scale-[0.98]",
    reveal: "animate-ft-reveal",
    slideFade: "animate-ft-slide-fade",
  },
  radius: {
    hero: "rounded-[24px]",
    main: "rounded-[24px]",
    card: "rounded-[22px]",
    compact: "rounded-[18px]",
    control: "rounded-xl",
  },
};

export const typography = ds.type;
export const surfaces = {
  app: `${ds.color.surface.app} ${ds.color.text.primary}`,
  mainCard: ds.card.main,
  heroCard: ds.card.hero,
  sectionCard: ds.card.section,
  miniCard: ds.card.compact,
} as const;
export const controls = {
  buttonPrimary: ds.button.primary,
  buttonPrimaryLarge: ds.button.primaryLarge,
  buttonSecondary: ds.button.secondary,
  buttonSmall: ds.button.small,
  iconButton: ds.button.icon,
  input: ds.control.input,
  inputLarge: ds.control.inputLarge,
  chip: "inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-semibold",
} as const;

export const flowtaskDesignSystem = { ds, typography, surfaces, controls } as const;
