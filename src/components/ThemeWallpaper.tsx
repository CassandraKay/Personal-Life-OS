import React, { useState } from "react";
import { ThemeId, SCRIPTURE_COLLECTION, ScriptureVerse } from "../themes";
import { BookOpen, Copy, Check, RefreshCw, Sparkles, Heart } from "lucide-react";

interface Props {
  themeId: ThemeId;
  wallpaperMode?: "pattern" | "clean";
}

export const ThemeWallpaper: React.FC<Props> = ({ themeId, wallpaperMode = "pattern" }) => {
  const [verseIndex, setVerseIndex] = useState(0);
  const [copiedVerse, setCopiedVerse] = useState(false);

  const currentVerse: ScriptureVerse = SCRIPTURE_COLLECTION[verseIndex % SCRIPTURE_COLLECTION.length];

  const handleNextVerse = () => {
    setVerseIndex((prev) => (prev + 1) % SCRIPTURE_COLLECTION.length);
  };

  const handleCopyVerse = () => {
    navigator.clipboard.writeText(`"${currentVerse.verse}" — ${currentVerse.reference}`);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  if (wallpaperMode === "clean") {
    return null;
  }

  return (
    <>
      {/* 🌸 1. Sakura & Rose Garden Wallpaper Overlay */}
      {themeId === "cherry_blossom" && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
          {/* Ambient blush radial gradients */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-pink-300/20 dark:bg-rose-900/15 blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-rose-200/25 dark:bg-pink-950/20 blur-3xl" />
          <div className="absolute -bottom-32 right-1/3 w-80 h-80 rounded-full bg-pink-400/15 dark:bg-rose-950/25 blur-3xl" />

          {/* Floating cherry blossom floral SVG watermarks */}
          <svg
            className="absolute top-12 right-6 w-36 h-36 text-rose-300/25 dark:text-rose-600/10"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M50 30 C45 10 30 15 35 32 C20 25 10 40 28 48 C10 55 20 70 35 63 C30 80 45 85 50 68 C55 85 70 80 65 63 C80 70 90 55 72 48 C90 40 80 25 65 32 C70 15 55 10 50 30 Z" />
          </svg>

          <svg
            className="absolute bottom-16 left-6 w-48 h-48 text-pink-300/20 dark:text-rose-500/10"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M50 30 C45 10 30 15 35 32 C20 25 10 40 28 48 C10 55 20 70 35 63 C30 80 45 85 50 68 C55 85 70 80 65 63 C80 70 90 55 72 48 C90 40 80 25 65 32 C70 15 55 10 50 30 Z" />
          </svg>

          {/* Subtle rose petal scatter dots */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-rose-300/30 dark:bg-rose-700/20 transform rotate-45" />
          <div className="absolute top-3/4 right-1/4 w-4 h-2 rounded-full bg-pink-300/30 dark:bg-pink-700/20 transform -rotate-12" />
          <div className="absolute top-1/3 right-12 w-2.5 h-2.5 rounded-full bg-rose-400/25 dark:bg-rose-800/20" />
        </div>
      )}

      {/* ✝️ 2. Christian Grace & Scripture Wallpaper Overlay */}
      {themeId === "scripture_grace" && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
          {/* Warm celestial radiance */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-amber-200/25 dark:bg-amber-900/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-10 w-96 h-96 bg-amber-300/15 dark:bg-yellow-950/15 rounded-full blur-3xl" />

          {/* Elegant Cross Watermark */}
          <svg
            className="absolute top-16 right-8 w-40 h-52 text-amber-300/15 dark:text-amber-700/10"
            viewBox="0 0 100 130"
            fill="currentColor"
          >
            <rect x="42" y="10" width="16" height="110" rx="3" />
            <rect x="15" y="38" width="70" height="16" rx="3" />
          </svg>

          {/* Gentle Dove of Peace watermark */}
          <svg
            className="absolute bottom-20 left-10 w-36 h-36 text-amber-400/15 dark:text-amber-600/10"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M20,60 C35,45 60,35 75,40 C85,30 95,25 90,45 C85,55 75,65 60,65 C45,75 30,70 20,60 Z M65,42 C68,38 72,36 75,38 C75,42 70,45 65,42 Z" />
          </svg>
        </div>
      )}

      {/* 🍵 3. Serene Linen & Soft Sage Overlay */}
      {themeId === "soft_sage_linen" && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
          {/* Earthy soft sage soothing ambient orbs */}
          <div className="absolute -top-32 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-950/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-300/20 dark:bg-stone-900/20 rounded-full blur-3xl" />

          {/* Minimalist botanical leaf branch watermark */}
          <svg
            className="absolute top-20 right-8 w-36 h-48 text-emerald-600/10 dark:text-emerald-500/5"
            viewBox="0 0 100 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M50 140 Q 50 70 70 20" />
            <path d="M52 110 Q 75 100 80 85 Q 60 90 52 110" fill="currentColor" fillOpacity="0.08" />
            <path d="M50 85 Q 25 80 20 65 Q 40 70 50 85" fill="currentColor" fillOpacity="0.08" />
            <path d="M58 55 Q 80 45 85 30 Q 65 40 58 55" fill="currentColor" fillOpacity="0.08" />
          </svg>
        </div>
      )}

      {/* 🌌 4. Cyberpunk Neon Grid Overlay */}
      {themeId === "cyber_neon" && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      {/* ☕ 5. Warm Espresso Overlay */}
      {themeId === "sunset_amber" && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
          <div className="absolute -top-32 right-10 w-96 h-96 bg-orange-300/15 dark:bg-amber-950/25 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-400/10 dark:bg-orange-950/20 rounded-full blur-3xl" />
        </div>
      )}
    </>
  );
};

export const DailyScriptureBanner: React.FC<{ themeId: ThemeId }> = ({ themeId }) => {
  const [verseIndex, setVerseIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (themeId !== "scripture_grace") {
    return null;
  }

  const currentVerse = SCRIPTURE_COLLECTION[verseIndex % SCRIPTURE_COLLECTION.length];

  const handleNext = () => {
    setVerseIndex((prev) => (prev + 1) % SCRIPTURE_COLLECTION.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentVerse.verse}" — ${currentVerse.reference}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-10 mb-6 bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 dark:from-[#2a2219] dark:via-[#332a1f] dark:to-[#2a2219] border border-amber-300/70 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-serif font-bold text-sm">
            ✝
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 font-mono">
                Daily Scripture & Meditation
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">
                {currentVerse.theme}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-serif italic text-stone-800 dark:text-amber-100 leading-relaxed">
              "{currentVerse.verse}"
            </p>
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
              — {currentVerse.reference}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 bg-white/80 dark:bg-amber-950/60 hover:bg-white dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-semibold border border-amber-300/60 dark:border-amber-800 flex items-center gap-1.5 transition-all"
            title="Copy verse to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleNext}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Next inspirational verse"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Next Verse</span>
          </button>
        </div>
      </div>
    </div>
  );
};
