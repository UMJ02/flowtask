export const designSystemVersion = "58.21.4-design-system-governance-core-screen-migration";

export const ds = {
  semantic: true,
  color: {
    surface: {
      app: "bg-[#F6F8FB]",
      card: "bg-white",
      muted: "bg-slate-50",
      elevated: "bg-white",
    },
    text: {
      primary: "text-slate-950",
      secondary: "text-slate-600",
      muted: "text-slate-500",
      inverse: "text-white",
    },
    border: {
      subtle: "border-[#E7ECF3]",
      strong: "border-slate-300",
    },
    brand: {
      solid: "bg-[#16C784]",
      hover: "hover:bg-emerald-600",
      text: "text-emerald-700",
      soft: "bg-[#ECFDF5]",
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
    pageTitle: "text-[28px] leading-[1.08] tracking-[-0.03em] font-semibold text-slate-950 lg:text-[32px]",
    sectionTitle: "text-[20px] leading-tight tracking-[-0.02em] font-semibold text-slate-950 lg:text-[22px]",
    cardTitle: "text-[17px] leading-tight font-semibold text-slate-950",
    smallTitle: "text-[14px] leading-tight font-semibold text-slate-900",
    body: "text-[15px] leading-6 text-slate-700",
    bodySmall: "text-[14px] leading-5 text-slate-600",
    caption: "text-[12px] leading-4 text-slate-500",
    label: "text-[12px] font-medium uppercase tracking-[0.12em] text-slate-500",
  },
  layout: {
    page: "mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8",
    pageHeader: "mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
    gridSidebar: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]",
    stack: "space-y-6",
  },
  card: {
    base: "rounded-3xl border border-[#E7ECF3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
    main: "rounded-[28px] border border-[#E7ECF3] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
    section: "rounded-3xl border border-[#E7ECF3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
    compact: "rounded-2xl border border-[#E7ECF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
    interactive: "transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]",
  },
  control: {
    input: "h-12 rounded-2xl border border-[#E7ECF3] bg-white px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10",
    inputLarge: "h-14 rounded-[18px] border border-[#E7ECF3] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10",
    textarea: "min-h-[132px] rounded-2xl border border-[#E7ECF3] bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10",
  },
  button: {
    primary: "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    secondary: "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#E7ECF3] bg-white px-5 text-[14px] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    ghost: "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-[14px] font-medium text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]",
    icon: "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7ECF3] bg-white text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]",
    small: "inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-[12px] font-semibold transition active:scale-[0.98]",
  },
  radius: {
    main: "rounded-[28px]",
    card: "rounded-3xl",
    compact: "rounded-2xl",
    control: "rounded-2xl",
  },
};

export const typography = ds.type;
export const surfaces = {
  app: `${ds.color.surface.app} ${ds.color.text.primary}`,
  mainCard: ds.card.main,
  sectionCard: ds.card.section,
  miniCard: ds.card.compact,
} as const;
export const controls = {
  buttonPrimary: ds.button.primary,
  buttonSecondary: ds.button.secondary,
  buttonSmall: ds.button.small,
  iconButton: ds.button.icon,
  input: ds.control.input,
  inputLarge: ds.control.inputLarge,
  chip: "inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold",
} as const;

export const flowtaskDesignSystem = { ds, typography, surfaces, controls } as const;
