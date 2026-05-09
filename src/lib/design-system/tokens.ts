export const designSystemVersion = "58.22.1-full-semantic-migration-motion-experience-layer";

export const ds = {
  semantic: true,
  density: "semantic-density-contracts",
  motionExperience: "full-semantic-motion-layer",
  spacing: {
    none: "0",
    xxs: "2px",
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    page: "24px",
  },
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
      subtle: "border-slate-200/75",
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
    pageTitle: "text-[23px] leading-[1.1] tracking-[-0.026em] font-semibold text-slate-950 lg:text-[27px]",
    sectionTitle: "text-[16px] leading-tight tracking-[-0.016em] font-semibold text-slate-950 lg:text-[18px]",
    cardTitle: "text-[14px] leading-tight font-semibold text-slate-950",
    smallTitle: "text-[13px] leading-tight font-semibold text-slate-900",
    body: "text-[14px] leading-5 text-slate-700",
    bodySmall: "text-[13px] leading-5 text-slate-600",
    caption: "text-[12px] leading-4 text-slate-500",
    label: "text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500",
  },
  layout: {
    page: "mx-auto w-full max-w-7xl px-3.5 py-3 md:px-5 md:py-4 lg:px-6",
    pageHeader: "mb-3 flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between",
    gridSidebar: "grid gap-3 lg:grid-cols-[minmax(0,1fr)_292px]",
    stack: "space-y-3",
  },
  card: {
    base: "rounded-[16px] border border-slate-200/75 bg-white",
    main: "rounded-[16px] border border-slate-200/75 bg-white p-3",
    hero: "rounded-[18px] border border-slate-200/80 bg-white p-3.5",
    section: "rounded-[14px] border border-slate-200/75 bg-white p-3",
    compact: "rounded-xl border border-slate-200/70 bg-slate-50/65 p-2.5",
    raised: "rounded-[16px] border border-slate-200/80 bg-white shadow-[var(--ft-shadow-raised)]",
    floating: "rounded-[16px] border border-slate-200/80 bg-white shadow-[var(--ft-shadow-floating)]",
    overlay: "rounded-[18px] border border-slate-200/80 bg-white shadow-[var(--ft-shadow-overlay)]",
    interactive: "transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white active:scale-[0.995]",
  },
  control: {
    input: "h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-500/10",
    inputLarge: "h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] text-slate-900 outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-500/10",
    textarea: "min-h-[96px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-500/10",
  },
  button: {
    primary: "inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-slate-950 px-3.5 text-[13px] font-semibold text-white transition-[transform,background-color,border-color,color,box-shadow] duration-150 hover:bg-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    primaryLarge: "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 text-[13px] font-semibold text-white transition-[transform,background-color,border-color,color,box-shadow] duration-150 hover:bg-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    secondary: "inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition-[transform,background-color,border-color,color,box-shadow] duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    ghost: "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-slate-600 transition-[transform,background-color,color] duration-150 hover:bg-slate-100 active:scale-[0.98]",
    icon: "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-[transform,background-color,border-color,color,box-shadow] duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]",
    small: "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-150 active:scale-[0.98]",
  },
  motion: {
    fast: "120ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    normal: "180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    enter: "220ms cubic-bezier(0.16, 1, 0.3, 1)",
    subtle: "transition duration-150 ease-out",
    hoverLift: "transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out hover:-translate-y-[1px]",
    press: "active:scale-[0.98]",
    reveal: "animate-ft-reveal",
    slideFade: "animate-ft-slide-fade",
    expand: "ft-motion-expand",
    pop: "ft-motion-pop",
  },
  radius: {
    hero: "rounded-[18px]",
    main: "rounded-[16px]",
    card: "rounded-[14px]",
    compact: "rounded-xl",
    control: "rounded-[10px]",
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
  chip: "inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold",
} as const;

export const flowtaskDesignSystem = { ds, typography, surfaces, controls } as const;

export const spacingGovernance = {
  policy: "strict style enforcement with governed spacing and named surface variants",
  largeSpacePolicy: "32px+ spacing is reserved for outer layout, not repeated cards",
  interactionPolicy: "motion supports orientation, reveal, feedback and expand states without decorative movement",
  shadowPolicy: "manual shadows are disallowed outside named raised, floating and overlay variants",
} as const;


export const styleEnforcement = {
  policy: "no manual heavy shadows, oversized radii or loose spacing in app components",
  allowedSurfaces: ["ft-section-card", "ft-main-card", "ft-mini-card", "ft-raised-card", "ft-floating-card", "ft-overlay-card"],
  forbiddenPatterns: ["heavy-bespoke-shadows", "oversized-radius", "loose-8-step-spacing"],
  migrationPolicy: "secondary app components must use named system surfaces instead of bespoke visual classes",
} as const;


export const densityContracts = {
  compact: { purpose: "tables, lists, filters and small repeated controls", gap: "8px", card: "ft-mini-card", text: "ft-text-meta" },
  medium: { purpose: "task/project detail workspaces", gap: "12px", card: "ft-section-card", text: "ft-text-body" },
  create: { purpose: "create flows that need guidance without landing-sized spacing", gap: "14px", card: "ft-main-card", text: "ft-text-body" },
  relaxed: { purpose: "auth, onboarding and public flows", gap: "16px", card: "ft-main-card", text: "ft-text-body" },
} as const;

export const semanticClasses = {
  titlePage: "ft-title-page",
  titleSection: "ft-title-section",
  titleCard: "ft-title-card",
  textBody: "ft-text-body",
  textMuted: "ft-text-muted",
  textMeta: "ft-text-meta",
  surfaceCard: "ft-surface-card",
  surfaceMuted: "ft-surface-muted",
  input: "ft-input",
  inputLarge: "ft-input-lg",
  textarea: "ft-textarea",
  buttonPrimary: "ft-btn ft-btn-md ft-btn-primary",
  buttonSecondary: "ft-btn ft-btn-md ft-btn-secondary",
} as const;

export const semanticGovernance = {
  policy: "components should consume semantic UI classes or named density contracts instead of raw visual values",
  typographyPolicy: "page, section, card, body, muted, meta and label roles govern text scale",
  densityPolicy: "compact, medium, create and relaxed density contracts define spacing by screen purpose",
} as const;


export const motionExperienceLayer = {
  policy: "motion is used for orientation, feedback and state changes, not decoration",
  surfaces: ["ft-glass-panel", "ft-glass-toolbar", "ft-popover-surface", "ft-drawer-surface", "ft-command-surface"],
  interactions: ["ft-motion-tab", "ft-motion-list-item", "ft-motion-expandable", "ft-motion-feedback", "ft-liquid-hover"],
  feedbackStates: ["ft-state-saving", "ft-state-success", "ft-state-error", "ft-state-selected"],
  skeleton: "ft-skeleton",
} as const;

export const semanticMigrationLayer = {
  policy: "core interactive components should use semantic surfaces, density contracts and motion roles",
  components: ["AppMotion", "AppSkeleton", "AppFeedback", "AppGlassPanel", "AppAnimatedTabs"],
  disallow: ["unscoped heavy manual shadows", "oversized controls", "unanimated expandable UI", "unstyled feedback states"],
} as const;
