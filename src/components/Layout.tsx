import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  FileText,
  Code,
  KeyRound,
  DollarSign,
  BookOpen,
  Palette,
  Image as ImageIcon,
  Heart,
  Sparkles,
  Cloud,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Shield,
  Zap,
  Calendar,
  ListTree,
} from "lucide-react";
import { TabType, UserLifeOSState } from "../types";
import { ThemeId, THEME_REGISTRY } from "../themes";
import { ThemeWallpaper, DailyScriptureBanner } from "./ThemeWallpaper";
import { ThemeSelectorModal } from "./ThemeSelectorModal";

interface Props {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  state: UserLifeOSState;
  syncStatus: "synced" | "syncing" | "offline" | "error";
  lastSyncTime: string | null;
  onOpenSearch: () => void;
  onUpdateTheme: (themeId: ThemeId) => void;
  onToggleWallpaperMode: (mode: "pattern" | "clean") => void;
  children: React.ReactNode;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  color: string;
}

export const Layout: React.FC<Props> = ({
  currentTab,
  setCurrentTab,
  state,
  syncStatus,
  lastSyncTime,
  onOpenSearch,
  onUpdateTheme,
  onToggleWallpaperMode,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const activeThemeId: ThemeId = state.profile.activeTheme || "midnight";
  const activeTheme = THEME_REGISTRY[activeThemeId] || THEME_REGISTRY.midnight;
  const wallpaperMode = state.profile.themeWallpaperMode || "pattern";

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Command Center", icon: LayoutDashboard, color: "text-sky-500" },
    { id: "bible_study", label: "Bible Study & Prayer", icon: BookOpen, badge: state.prayers?.filter((p) => !p.isAnswered).length, color: "text-amber-500" },
    { id: "canvas", label: "Chaotic Corner", icon: Sparkles, badge: state.canvasCards?.length, color: "text-amber-500" },
    { id: "calendar", label: "Calendar & Events", icon: Calendar, badge: state.calendarEvents?.length, color: "text-emerald-500" },
    { id: "index", label: "Table of Contents", icon: ListTree, color: "text-sky-500" },
    { id: "profile", label: "Profile & Identity", icon: User, color: "text-sky-500" },
    { id: "notes", label: "Notes & Knowledge", icon: FileText, badge: state.notes.length, color: "text-indigo-500" },
    { id: "coding", label: "Coding Workbench", icon: Code, badge: state.projects.length, color: "text-sky-500" },
    { id: "vault", label: "Accounts & Passwords", icon: KeyRound, color: "text-rose-500" },
    { id: "finance", label: "Finances & Hustles", icon: DollarSign, color: "text-emerald-500" },
    { id: "learning", label: "Learning & Flashcards", icon: BookOpen, badge: state.flashcards.length, color: "text-amber-500" },
    { id: "creative", label: "Creative Studio & Art", icon: Palette, color: "text-fuchsia-500" },
    { id: "media", label: "Media & Assets", icon: ImageIcon, color: "text-indigo-500" },
    { id: "selfcare", label: "Self-Care & Declutter", icon: Heart, color: "text-rose-500" },
    { id: "ai_copilot", label: "Gemini Strategist", icon: Sparkles, color: "text-amber-400" },
    { id: "sync_settings", label: "Sync & Settings", icon: Cloud, color: "text-slate-400" },
  ];

  // Derive custom theme classes and styles
  const customFontClass =
    state.customTheme?.fontFamily === "serif"
      ? "font-serif"
      : state.customTheme?.fontFamily === "mono"
      ? "font-mono"
      : state.customTheme?.fontFamily === "handwriting"
      ? "font-sans italic"
      : "font-sans";

  const customScaleClass =
    state.customTheme?.fontSizeScale === "compact"
      ? "text-[92%]"
      : state.customTheme?.fontSizeScale === "spacious"
      ? "text-[108%]"
      : state.customTheme?.fontSizeScale === "large"
      ? "text-[120%]"
      : "";

  const customBgStyle: React.CSSProperties = {};
  if (state.customTheme?.customBgColor) {
    customBgStyle.backgroundColor = state.customTheme.customBgColor;
  }
  if (state.customTheme?.customBgImage) {
    customBgStyle.backgroundImage = `url("${state.customTheme.customBgImage}")`;
    if (state.customTheme.customBgMode === "tile") {
      customBgStyle.backgroundRepeat = "repeat";
      customBgStyle.backgroundSize = "auto";
    } else if (state.customTheme.customBgMode === "center") {
      customBgStyle.backgroundPosition = "center center";
      customBgStyle.backgroundRepeat = "no-repeat";
    } else {
      customBgStyle.backgroundSize = "cover";
      customBgStyle.backgroundPosition = "center center";
      customBgStyle.backgroundAttachment = "fixed";
    }
  }
  if (state.customTheme?.customTextColor) {
    customBgStyle.color = state.customTheme.customTextColor;
  }

  return (
    <div
      style={customBgStyle}
      className={`min-h-screen relative flex flex-col transition-colors ${customFontClass} ${customScaleClass} ${activeTheme.wrapperClass}`}
    >
      {/* Visual Ambient Theme Wallpaper & Floral / Scripture Watermarks */}
      <ThemeWallpaper themeId={activeThemeId} wallpaperMode={wallpaperMode} />

      {/* Top Universal Navbar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 lg:px-8 py-2.5 flex items-center justify-between shadow-2xs transition-colors ${activeTheme.headerClass}`}>
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setCurrentTab("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${activeTheme.brandGradient} text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform`}>
              {activeTheme.emoji}
            </div>
            <div>
              <div className="text-sm font-black tracking-tight flex items-center gap-1.5">
                OmniLife <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${activeTheme.badgeClass}`}>OS</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5 hidden sm:block">
                Personal Knowledge & Life Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Center: Global Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-3.5 py-1.5 rounded-xl text-xs border border-slate-200/60 dark:border-slate-800/60 transition-all max-w-sm w-full mx-4 shadow-2xs group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500" />
          <span className="flex-1 text-left truncate">Search notes, code, vault, finances...</span>
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Right Actions: Theme Selector, Sync status, Dark Mode Toggle, AI Strategist */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher Pill */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
            title="Switch Theme (Pink Blossom, Scripture Grace, Soft Sage, etc.)"
          >
            <Palette className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
            <span className="hidden md:inline text-[11px]">{activeTheme.name.split("&")[0]}</span>
            <span className="text-xs">{activeTheme.emoji}</span>
          </button>

          {/* Sync status pill */}
          <button
            onClick={() => setCurrentTab("sync_settings")}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 border border-slate-200/60 dark:border-slate-700/60 transition-all"
            title="Vault Sync Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === "synced"
                  ? "bg-emerald-500"
                  : syncStatus === "syncing"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-400"
              }`}
            />
            <span>{syncStatus === "synced" ? "Synced" : syncStatus === "syncing" ? "Syncing..." : "Local"}</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Quick AI trigger */}
          <button
            onClick={() => setCurrentTab("ai_copilot")}
            className={`p-2 bg-gradient-to-r ${activeTheme.brandGradient} text-white rounded-xl shadow-xs hover:opacity-90 transition-all`}
            title="Open Gemini Strategist"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main App Layout Shell */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className={`hidden lg:flex w-64 border-r flex-col justify-between p-3 select-none shrink-0 transition-colors ${activeTheme.navClass}`}>
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Personal Knowledge OS
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? activeTheme.activeNavClass
                      : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar User Pill & Theme Button */}
          <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-700 dark:text-slate-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-pink-500" />
                <span>Theme: {activeTheme.name.split("&")[0]}</span>
              </div>
              <span>{activeTheme.emoji}</span>
            </button>

            <div
              onClick={() => setCurrentTab("profile")}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all group"
              title="Open Personal Profile & Digital ID"
            >
              {state.profile.avatarUrl ? (
                <img
                  src={state.profile.avatarUrl}
                  alt={state.profile.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {state.profile.name.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 truncate">
                <div className="text-xs font-bold truncate group-hover:text-sky-500 transition-colors">
                  {state.profile.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {state.profile.title || `Focus: ${state.profile.primaryFocus || "Growth"}`}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <div className={`relative w-72 max-w-[85vw] h-full p-4 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto ${activeTheme.navClass}`}>
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-2">
                  <span className="font-bold text-sm">Navigation</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? activeTheme.activeNavClass
                          : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-black/5 dark:bg-white/10 text-slate-500">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
                <button
                  onClick={() => {
                    setIsThemeModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Palette className="w-4 h-4" /> Change Theme ({activeTheme.emoji})
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("sync_settings");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4" /> Vault & Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {/* Daily Scripture Banner (if Christian Scripture theme is active) */}
          <DailyScriptureBanner themeId={activeThemeId} />

          {children}
        </main>
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeThemeId={activeThemeId}
        onSelectTheme={(newTheme) => {
          onUpdateTheme(newTheme);
        }}
        wallpaperMode={wallpaperMode}
        onToggleWallpaperMode={onToggleWallpaperMode}
      />
    </div>
  );
};
