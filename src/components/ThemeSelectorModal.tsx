import React from "react";
import { ThemeId, THEME_REGISTRY } from "../themes";
import { Check, X, Palette, Sparkles, Eye, Sun, Moon } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  wallpaperMode?: "pattern" | "clean";
  onToggleWallpaperMode?: (mode: "pattern" | "clean") => void;
}

export const ThemeSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  wallpaperMode = "pattern",
  onToggleWallpaperMode,
}) => {
  if (!isOpen) return null;

  const themes = Object.values(THEME_REGISTRY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-pink-500 via-amber-500 to-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Choose Aesthetic Theme
              </h2>
              <p className="text-xs text-slate-500">
                Transform your entire workspace styling, colors, and wallpapers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {themes.map((theme) => {
              const isSelected = activeThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? "border-sky-500 dark:border-sky-400 bg-sky-50/40 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header with Emoji & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{theme.emoji}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {theme.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                          {theme.badge}
                        </span>
                      )}
                    </div>

                    {/* Tagline */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {theme.tagline}
                    </p>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {theme.previewColors.map((hex, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Highlights tag */}
                  <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {theme.hasFloralAccents
                        ? "🌸 Petals & Rose Watermark"
                        : theme.hasScriptureBanner
                        ? "✝️ Daily Bible Verse Banner"
                        : theme.isEasyOnEyes
                        ? "🍵 Zero-Glare Earthy Tones"
                        : "⚡ Modern Clean UI"}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {isSelected ? "Active" : "Click to Apply"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wallpaper watermark toggle */}
          {onToggleWallpaperMode && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between border border-slate-200 dark:border-slate-700/50">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Atmospheric Wallpaper & Watermarks
                </div>
                <div className="text-[11px] text-slate-500">
                  Enable subtle background petals, scripture watermarks, or botanical leaves
                </div>
              </div>

              <button
                onClick={() =>
                  onToggleWallpaperMode(wallpaperMode === "pattern" ? "clean" : "pattern")
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  wallpaperMode === "pattern"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {wallpaperMode === "pattern" ? "Enabled ✨" : "Clean / Minimal"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Selected: <strong className="text-slate-700 dark:text-slate-300">{THEME_REGISTRY[activeThemeId]?.name}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
