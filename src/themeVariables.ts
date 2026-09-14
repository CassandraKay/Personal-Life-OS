/**
 * =====================================================================
 * THEME VARIABLES & STYLE DESIGN TOKENS
 * =====================================================================
 * This file is your single source of truth for all colors, palettes,
 * font styles, box models, text formatting (bold, underline, italic,
 * strikethrough, highlights), and card styling across the entire app.
 *
 * Feel free to edit, swap hex codes, or add new palettes here!
 */

// =====================================================================
// 1. UNIFIED NEUTRALS (Whites, Blacks & Grays)
// =====================================================================
// Instead of random scattered hex codes, use these canonical neutrals:
export const CORE_NEUTRALS = {
  // Pure & Soft Whites (Light modes & surfaces)
  pureWhite: "#FFFFFF",
  softWhite: "#FAFAFA", // Default light card background
  snowWhite: "#F8FAFC", // Very subtle cool white background
  warmIvory: "#FAF7F0", // Gentle, non-glare parchment white
  paperOatmeal: "#F5F4EE", // Ultra low-glare reading paper

  // Pure & Deep Blacks (Dark modes & typography)
  pureBlack: "#000000",
  deepNight: "#0B0F19", // Deep rich canvas dark
  slateDark: "#0F172A", // Slate dark mode background
  softBlack: "#18181B", // Soft charcoal dark background
  charcoal: "#27272A", // Dark card surface

  // Grays & Dividers
  borderLight: "#E2E8F0", // Clean light border
  borderSubtle: "#F1F5F9", // Very light subtle divider
  borderDark: "#334155", // Dark mode border
  textMutedLight: "#64748B", // Subtitle/secondary text on light
  textMutedDark: "#94A3B8", // Subtitle/secondary text on dark
} as const;

// =====================================================================
// 2. COORDINATED THEME COLOR PALETTES
// =====================================================================
export const THEME_PALETTES = {
  // Grace & Scripture Theme (Parchment, Radiant Gold & Bronze)
  scriptureGrace: {
    primary: "#D97706", // Radiant amber gold
    primaryHover: "#B45309",
    backgroundLight: "#FAF7F0",
    backgroundDark: "#1A1713",
    cardLight: "#FFFFFF",
    cardDark: "#25201A",
    borderLight: "#FDE68A",
    borderDark: "#78350F",
    accent: "#B45309",
    textLight: "#451A03",
    textDark: "#FEF3C7",
  },

  // Sakura & Rose Garden Theme (Soft Blush, Petal Pink & Rose Gold)
  cherryBlossom: {
    primary: "#F43F5E", // Rose pink
    primaryHover: "#E11D48",
    backgroundLight: "#FFF1F5",
    backgroundDark: "#1F1015",
    cardLight: "#FFFFFF",
    cardDark: "#2A171E",
    borderLight: "#FECDD3",
    borderDark: "#881337",
    accent: "#FB7185",
    textLight: "#881337",
    textDark: "#FFE4E6",
  },

  // Serene Linen & Soft Sage Theme (Calming Matcha & Low-glare Oat)
  softSage: {
    primary: "#5B7A63", // Calm matcha sage
    primaryHover: "#4A6552",
    backgroundLight: "#F5F4EE",
    backgroundDark: "#141A16",
    cardLight: "#FFFFFF",
    cardDark: "#1F2821",
    borderLight: "#D1DDD2",
    borderDark: "#2C3E30",
    accent: "#4A6552",
    textLight: "#2C3E30",
    textDark: "#E4EBE4",
  },

  // Midnight & Celestial Theme (Obsidian, Indigo & Star White)
  midnight: {
    primary: "#6366F1", // Indigo
    primaryHover: "#4F46E5",
    backgroundLight: "#F8FAFC",
    backgroundDark: "#0B0F19",
    cardLight: "#FFFFFF",
    cardDark: "#131C31",
    borderLight: "#CBD5E1",
    borderDark: "#1E293B",
    accent: "#38BDF8", // Cyan star glow
    textLight: "#0F172A",
    textDark: "#F8FAFC",
  },

  // Sunset Amber Theme (Warm Honey, Terracotta & Warm Sand)
  sunsetAmber: {
    primary: "#EA580C", // Warm terracotta
    primaryHover: "#C2410C",
    backgroundLight: "#FFF7ED",
    backgroundDark: "#1C130E",
    cardLight: "#FFFFFF",
    cardDark: "#2B1D15",
    borderLight: "#FED7AA",
    borderDark: "#7C2D12",
    accent: "#F59E0B",
    textLight: "#431407",
    textDark: "#FFEDD5",
  },

  // Cyber Neon Theme (Electric Cyan, Violet & Deep Space)
  cyberNeon: {
    primary: "#06B6D4", // Electric cyan
    primaryHover: "#0891B2",
    backgroundLight: "#F0FDFA",
    backgroundDark: "#050B14",
    cardLight: "#FFFFFF",
    cardDark: "#0C1726",
    borderLight: "#A5F3FC",
    borderDark: "#164E63",
    accent: "#EC4899", // Neon pink
    textLight: "#164E63",
    textDark: "#E0F2FE",
  },
} as const;

// =====================================================================
// 3. CANVAS & CARD COLOR PRESETS (Sticky notes, journals, cards)
// =====================================================================
export const CANVAS_CARD_COLORS = [
  { id: "canary_yellow", name: "Canary Yellow", bg: "#FEF08A", border: "#FDE047", text: "#713F12" },
  { id: "rose_blush", name: "Rose Blush", bg: "#FECDD3", border: "#FDA4AF", text: "#881337" },
  { id: "mint_sage", name: "Mint Sage", bg: "#BBF7D0", border: "#86EFAC", text: "#14532D" },
  { id: "sky_breeze", name: "Sky Breeze", bg: "#BAE6FD", border: "#7DD3FC", text: "#0C4A6E" },
  { id: "soft_lavender", name: "Lavender Dream", bg: "#DDD6FE", border: "#C4B5FD", text: "#4C1D95" },
  { id: "warm_peach", name: "Warm Peach", bg: "#FED7AA", border: "#FDBA74", text: "#7C2D12" },
  { id: "clean_white", name: "Crisp Card White", bg: "#FFFFFF", border: "#E2E8F0", text: "#0F172A" },
  { id: "slate_dark", name: "Obsidian Slate", bg: "#1E293B", border: "#334155", text: "#F8FAFC" },
] as const;

// =====================================================================
// 4. HIGHLIGHTER & MARKER PRESETS
// =====================================================================
// Use these for text highlighting, marker doodles, or emphasized phrases
export const HIGHLIGHT_PRESETS = {
  yellow: {
    name: "Classic Highlighter Yellow",
    bgClass: "bg-yellow-200/80 text-yellow-950 dark:bg-yellow-500/30 dark:text-yellow-200 px-1 py-0.5 rounded-sm",
    hex: "#FEF08A",
    cssStyle: { backgroundColor: "rgba(254, 240, 138, 0.85)" },
  },
  peach: {
    name: "Warm Sunset Peach",
    bgClass: "bg-orange-200/80 text-orange-950 dark:bg-orange-500/30 dark:text-orange-200 px-1 py-0.5 rounded-sm",
    hex: "#FED7AA",
    cssStyle: { backgroundColor: "rgba(254, 215, 170, 0.85)" },
  },
  mint: {
    name: "Fresh Mint Green",
    bgClass: "bg-emerald-200/80 text-emerald-950 dark:bg-emerald-500/30 dark:text-emerald-200 px-1 py-0.5 rounded-sm",
    hex: "#A7F3D0",
    cssStyle: { backgroundColor: "rgba(167, 243, 208, 0.85)" },
  },
  sky: {
    name: "Soft Sky Blue",
    bgClass: "bg-sky-200/80 text-sky-950 dark:bg-sky-500/30 dark:text-sky-200 px-1 py-0.5 rounded-sm",
    hex: "#BAE6FD",
    cssStyle: { backgroundColor: "rgba(186, 230, 253, 0.85)" },
  },
  rose: {
    name: "Petal Rose Pink",
    bgClass: "bg-rose-200/80 text-rose-950 dark:bg-rose-500/30 dark:text-rose-200 px-1 py-0.5 rounded-sm",
    hex: "#FECDD3",
    cssStyle: { backgroundColor: "rgba(254, 205, 211, 0.85)" },
  },
  lavender: {
    name: "Gentle Lavender",
    bgClass: "bg-purple-200/80 text-purple-950 dark:bg-purple-500/30 dark:text-purple-200 px-1 py-0.5 rounded-sm",
    hex: "#E9D5FF",
    cssStyle: { backgroundColor: "rgba(233, 213, 255, 0.85)" },
  },
} as const;

export type HighlightColor = keyof typeof HIGHLIGHT_PRESETS;

// =====================================================================
// 5. TEXT FORMATTING & FONT STYLING TOKENS
// =====================================================================
export const FONT_STYLES = {
  // Font Families
  families: {
    sans: "font-sans", // Clean modern UI
    serif: "font-serif", // Classic scripture & book reading
    mono: "font-mono", // Code workbench & technical data
    handwriting: "font-serif italic tracking-wide", // Post-it / journal feel
  },

  // Font Weights
  weights: {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  },

  // Text Sizes
  sizes: {
    xs: "text-xs", // 12px
    sm: "text-sm", // 14px
    base: "text-base", // 16px
    lg: "text-lg", // 18px
    xl: "text-xl", // 20px
    "2xl": "text-2xl", // 24px
    "3xl": "text-3xl", // 30px
    "4xl": "text-4xl", // 36px
  },

  // Text Decorations
  decorations: {
    normal: "no-underline",
    italic: "italic",
    bold: "font-bold",
    underline: "underline underline-offset-4 decoration-2",
    wavyUnderline: "underline underline-offset-4 decoration-wavy decoration-amber-500",
    strikethrough: "line-through opacity-60",
    uppercase: "uppercase tracking-wider",
  },
} as const;

// =====================================================================
// 6. BOX MODELS & CARD GEOMETRY (Padding, Radius, Borders, Shadows)
// =====================================================================
export const BOX_MODELS = {
  // Post-It / Sticky Note Card
  postIt: {
    borderRadius: "rounded-2xl",
    shadow: "shadow-md hover:shadow-lg transition-shadow",
    border: "border border-amber-200/60 dark:border-amber-900/40",
    padding: "p-4",
  },

  // Polaroid / Photo Card
  polaroid: {
    borderRadius: "rounded-xl",
    shadow: "shadow-lg hover:shadow-xl transition-shadow",
    border: "border-4 border-white dark:border-stone-800",
    padding: "p-3 pb-5",
  },

  // Standard App Card (Command Center, Notes, Prayer, Hustles)
  standardCard: {
    borderRadius: "rounded-3xl",
    shadow: "shadow-xs border border-slate-200 dark:border-slate-800",
    padding: "p-6",
  },

  // Compact Widget / Metric Pill
  widget: {
    borderRadius: "rounded-2xl",
    shadow: "shadow-2xs border border-slate-200/80 dark:border-slate-800/80",
    padding: "p-4",
  },

  // Dialog / Modal Container
  modal: {
    borderRadius: "rounded-3xl",
    shadow: "shadow-2xl border border-slate-200 dark:border-slate-700",
    padding: "p-6 sm:p-8",
  },
} as const;

// =====================================================================
// 7. HELPER FUNCTIONS FOR EASY INLINE USAGE
// =====================================================================

/**
 * Returns Tailwind class string for combined text formatting
 */
export function formatText(options: {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  highlight?: HighlightColor;
  size?: keyof typeof FONT_STYLES.sizes;
  family?: keyof typeof FONT_STYLES.families;
}): string {
  const classes: string[] = [];

  if (options.family) classes.push(FONT_STYLES.families[options.family]);
  if (options.size) classes.push(FONT_STYLES.sizes[options.size]);
  if (options.bold) classes.push(FONT_STYLES.weights.bold);
  if (options.italic) classes.push(FONT_STYLES.decorations.italic);
  if (options.underline) classes.push(FONT_STYLES.decorations.underline);
  if (options.strikethrough) classes.push(FONT_STYLES.decorations.strikethrough);
  if (options.highlight && HIGHLIGHT_PRESETS[options.highlight]) {
    classes.push(HIGHLIGHT_PRESETS[options.highlight].bgClass);
  }

  return classes.join(" ");
}

/**
 * Quick access to hex color of a theme
 */
export function getThemeColor(themeKey: keyof typeof THEME_PALETTES, token: "primary" | "accent" | "backgroundLight" | "cardLight" | "borderLight"): string {
  const palette = THEME_PALETTES[themeKey];
  return palette ? palette[token] : CORE_NEUTRALS.pureWhite;
}
