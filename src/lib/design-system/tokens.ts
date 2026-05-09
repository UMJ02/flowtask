export const designSystemVersion = "58.21.3-design-system-foundation-visual-consistency";

export const typography = {
  pageTitle: "text-[28px] leading-[1.08] tracking-[-0.03em] font-semibold text-slate-950 lg:text-[32px]",
  sectionTitle: "text-[20px] leading-tight tracking-[-0.02em] font-semibold text-slate-950 lg:text-[22px]",
  cardTitle: "text-[17px] leading-tight font-semibold text-slate-950",
  smallTitle: "text-[14px] leading-tight font-semibold text-slate-900",
  body: "text-[15px] leading-6 text-slate-700",
  secondary: "text-[14px] leading-5 text-slate-500",
  meta: "text-[12px] leading-4 text-slate-500",
  label: "text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500",
} as const;

export const surfaces = {
  app: "bg-[#F6F8FB] text-slate-950",
  mainCard: "rounded-[28px] border border-[#E7ECF3] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02)]",
  sectionCard: "rounded-3xl border border-[#E7ECF3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]",
  miniCard: "rounded-2xl border border-[#E7ECF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]",
} as const;

export const controls = {
  buttonPrimary: "h-11 rounded-2xl px-5 text-[14px] font-semibold transition active:scale-[0.98]",
  buttonSecondary: "h-11 rounded-2xl px-5 text-[14px] font-semibold transition active:scale-[0.98]",
  buttonSmall: "h-9 rounded-xl px-3 text-[12px] font-semibold transition active:scale-[0.98]",
  iconButton: "h-10 w-10 rounded-2xl transition active:scale-[0.98]",
  input: "h-12 rounded-2xl border-[#E7ECF3] text-[14px] focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50",
  inputLarge: "h-14 rounded-[18px] border-[#E7ECF3] text-[15px] focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50",
  chip: "inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold",
} as const;

export const flowtaskDesignSystem = {
  typography,
  surfaces,
  controls,
};
