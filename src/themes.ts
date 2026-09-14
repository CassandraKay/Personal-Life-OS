export type ThemeId =
  | "cherry_blossom"
  | "scripture_grace"
  | "soft_sage_linen"
  | "midnight"
  | "sunset_amber"
  | "cyber_neon";

export interface ScriptureVerse {
  reference: string;
  verse: string;
  theme: string;
}

export const SCRIPTURE_COLLECTION: ScriptureVerse[] = [
  {
    reference: "Philippians 4:13",
    verse: "I can do all things through Christ who strengthens me.",
    theme: "Strength & Perseverance",
  },
  {
    reference: "Jeremiah 29:11",
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    theme: "Hope & Purpose",
  },
  {
    reference: "Proverbs 3:5-6",
    verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    theme: "Guidance & Faith",
  },
  {
    reference: "Isaiah 40:31",
    verse: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    theme: "Renewal & Energy",
  },
  {
    reference: "Matthew 6:33",
    verse: "Seek first the kingdom of God and his righteousness, and all these things will be added to you.",
    theme: "Priorities & Focus",
  },
  {
    reference: "Psalm 23:1-3",
    verse: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    theme: "Peace & Rest",
  },
  {
    reference: "Romans 8:28",
    verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    theme: "Trust & Assurance",
  },
  {
    reference: "Joshua 1:9",
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    theme: "Courage",
  },
  {
    reference: "Colossians 3:23",
    verse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    theme: "Diligence & Craft",
  },
];

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  emoji: string;
  badge: string;
  description: string;
  accentColor: string;
  previewColors: string[];
  isDarkByDefault: boolean;
  wrapperClass: string;
  cardClass: string;
  headerClass: string;
  navClass: string;
  activeNavClass: string;
  badgeClass: string;
  accentBtnClass: string;
  brandGradient: string;
  bgPatternSvg?: string;
  hasScriptureBanner?: boolean;
  hasFloralAccents?: boolean;
  isEasyOnEyes?: boolean;
}

export const THEME_REGISTRY: Record<ThemeId, ThemeDefinition> = {
  cherry_blossom: {
    id: "cherry_blossom",
    name: "Sakura & Rose Garden",
    tagline: "Soft blush pinks, blooming roses & delicate petals",
    emoji: "🌸",
    badge: "Floral & Pink",
    description: "Gentle rose water and cherry blossom aesthetic with soft blush surfaces, rose-gold accents, and delicate floral watermark textures.",
    accentColor: "text-rose-500",
    previewColors: ["#FFF1F5", "#FB7185", "#F43F5E", "#881337"],
    isDarkByDefault: false,
    wrapperClass: "theme-cherry-blossom bg-rose-50/60 dark:bg-[#1f1015] text-slate-900 dark:text-rose-50",
    cardClass: "bg-white/95 dark:bg-[#2a171e]/90 border-rose-200/70 dark:border-rose-900/50 shadow-rose-100/50 dark:shadow-none",
    headerClass: "bg-white/90 dark:bg-[#24131a]/90 border-rose-200/60 dark:border-rose-900/60",
    navClass: "bg-white/95 dark:bg-[#24131a] border-rose-200/60 dark:border-rose-900/50",
    activeNavClass: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-200 dark:shadow-none",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    accentBtnClass: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-300/40",
    brandGradient: "from-pink-400 via-rose-500 to-rose-600",
    hasFloralAccents: true,
  },

  scripture_grace: {
    id: "scripture_grace",
    name: "Grace & Scripture",
    tagline: "Celestial gold, parchment warmth & daily scripture verse",
    emoji: "✝️",
    badge: "Faith & Scripture",
    description: "A peaceful Christian-inspired sanctuary featuring warm ivory parchment, radiant gold highlights, subtle dove/cross watermarks, and a rotating daily Bible verse bar.",
    accentColor: "text-amber-600",
    previewColors: ["#FDFBF7", "#FEF3C7", "#D97706", "#78350F"],
    isDarkByDefault: false,
    wrapperClass: "theme-scripture bg-[#FAF7F0] dark:bg-[#1a1713] text-stone-900 dark:text-amber-50",
    cardClass: "bg-white/95 dark:bg-[#25201a]/90 border-amber-200/70 dark:border-amber-900/40 shadow-amber-900/5 dark:shadow-none",
    headerClass: "bg-[#FDFBF7]/90 dark:bg-[#211c16]/90 border-amber-200/60 dark:border-amber-900/50",
    navClass: "bg-[#FAF7F0]/95 dark:bg-[#211c16] border-amber-200/60 dark:border-amber-900/40",
    activeNavClass: "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-200 dark:shadow-none",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accentBtnClass: "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-500/20",
    brandGradient: "from-amber-500 via-amber-600 to-yellow-600",
    hasScriptureBanner: true,
  },

  soft_sage_linen: {
    id: "soft_sage_linen",
    name: "Serene Linen & Soft Sage",
    tagline: "Low-glare oat canvas, calming muted sage & zero eye strain",
    emoji: "🍵",
    badge: "Easy on the Eyes",
    description: "Scientifically calibrated soft light theme using warm oatmeal paper tones, non-glare charcoal typography, and gentle matcha sage accents for prolonged reading & coding comfort.",
    accentColor: "text-emerald-700 dark:text-emerald-400",
    previewColors: ["#F6F5F0", "#E4EBE4", "#5B7A63", "#2C3E30"],
    isDarkByDefault: false,
    wrapperClass: "theme-soft-sage bg-[#F5F4EE] dark:bg-[#141A16] text-[#2D3748] dark:text-[#E2E8F0]",
    cardClass: "bg-[#FCFBF8] dark:bg-[#1B231E]/95 border-[#E2DFD2] dark:border-emerald-950/60 shadow-stone-200/30 dark:shadow-none",
    headerClass: "bg-[#FCFBF8]/95 dark:bg-[#18201B]/95 border-[#E2DFD2] dark:border-emerald-950/60",
    navClass: "bg-[#F5F4EE] dark:bg-[#18201B] border-[#E2DFD2] dark:border-emerald-950/50",
    activeNavClass: "bg-emerald-800 dark:bg-emerald-700 text-white shadow-sm",
    badgeClass: "bg-[#E7EFE8] text-[#2F4F38] dark:bg-emerald-950 dark:text-emerald-300 border-[#D4E2D6] dark:border-emerald-900",
    accentBtnClass: "bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-900/10",
    brandGradient: "from-emerald-700 to-teal-800",
    isEasyOnEyes: true,
  },

  midnight: {
    id: "midnight",
    name: "Midnight Obsidian & Slate",
    tagline: "Modern deep slate, electric indigo & crisp contrast",
    emoji: "⚡",
    badge: "Tech & Focus",
    description: "Classic high-focus dark and modern slate palette engineered for developers, indie hackers, and night-owl builders.",
    accentColor: "text-sky-500",
    previewColors: ["#0F172A", "#1E293B", "#0EA5E9", "#38BDF8"],
    isDarkByDefault: true,
    wrapperClass: "theme-midnight bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100",
    cardClass: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs",
    headerClass: "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800",
    navClass: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    activeNavClass: "bg-slate-900 dark:bg-sky-500 text-white shadow-xs",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    accentBtnClass: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20",
    brandGradient: "from-sky-500 to-indigo-600",
  },

  sunset_amber: {
    id: "sunset_amber",
    name: "Warm Espresso & Sunset",
    tagline: "Cozy coffeehouse latte, warm bronze & terracotta vibes",
    emoji: "☕",
    badge: "Warm & Cozy",
    description: "Rich espresso neutrals with burnt orange and warm latte highlights for a comforting coffeehouse feel.",
    accentColor: "text-amber-600",
    previewColors: ["#FAF5EF", "#FED7AA", "#EA580C", "#431407"],
    isDarkByDefault: false,
    wrapperClass: "theme-sunset bg-[#FAF6F0] dark:bg-[#1c1410] text-stone-900 dark:text-amber-100",
    cardClass: "bg-white/95 dark:bg-[#291e18]/90 border-amber-200/80 dark:border-amber-950/60 shadow-xs",
    headerClass: "bg-white/90 dark:bg-[#231914]/90 border-amber-200/60 dark:border-amber-950/60",
    navClass: "bg-white dark:bg-[#231914] border-amber-200/60 dark:border-amber-950/60",
    activeNavClass: "bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-xs",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900",
    accentBtnClass: "bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white shadow-orange-900/20",
    brandGradient: "from-amber-600 via-orange-600 to-rose-600",
  },

  cyber_neon: {
    id: "cyber_neon",
    name: "Cyberpunk Synthwave",
    tagline: "Electric magenta, neon cyan & deep synthwave dark",
    emoji: "🌌",
    badge: "Retro Cyber",
    description: "Vibrant neon cyberpunk aesthetic with glowing cyan accents, vivid magenta highlights, and deep matrix obsidian.",
    accentColor: "text-cyan-400",
    previewColors: ["#090A0F", "#151828", "#06B6D4", "#EC4899"],
    isDarkByDefault: true,
    wrapperClass: "theme-cyber bg-[#08090E] text-slate-100",
    cardClass: "bg-[#10121B] border-cyan-900/50 shadow-[0_0_15px_rgba(6,182,212,0.05)]",
    headerClass: "bg-[#0c0d16]/95 border-cyan-900/60",
    navClass: "bg-[#0c0d16] border-cyan-900/50",
    activeNavClass: "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    badgeClass: "bg-cyan-950 text-cyan-300 border-cyan-800",
    accentBtnClass: "bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white shadow-cyan-500/30",
    brandGradient: "from-cyan-400 via-fuchsia-500 to-pink-500",
  },
};
