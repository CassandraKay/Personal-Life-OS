import React, { useState } from "react";
import {
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Download,
  Upload,
  Shield,
  User,
  Sliders,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Smartphone,
  Laptop,
  Palette,
  Sparkles,
  Eye,
  Image as ImageIcon,
  Type,
  Paintbrush,
  FileImage,
  Trash2,
  Plus,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserLifeOSState } from "../types";
import { ThemeId, THEME_REGISTRY } from "../themes";
import { syncWithServer } from "../services/storage";
import { INITIAL_LIFE_OS_DATA } from "../data/initialData";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  syncStatus: "synced" | "syncing" | "offline" | "error";
  lastSyncTime: string | null;
  triggerManualSync: () => Promise<void>;
  onUpdateTheme?: (themeId: ThemeId) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const SyncAndSettings: React.FC<Props> = ({
  state,
  updateState,
  syncStatus,
  lastSyncTime,
  triggerManualSync,
  onUpdateTheme,
  onNavigateToTab,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [customVaultId, setCustomVaultId] = useState(state.vaultId);

  // Profile form state
  const [profileName, setProfileName] = useState(state.profile.name);
  const [profileAge, setProfileAge] = useState(state.profile.age?.toString() || "");
  const [profileEmail, setProfileEmail] = useState(state.profile.email || "");
  const [profilePhone, setProfilePhone] = useState(state.profile.phone || "");
  const [profileAddress, setProfileAddress] = useState(state.profile.streetAddress || "");
  const [profileCity, setProfileCity] = useState(state.profile.city || "");
  const [profileTarget, setProfileTarget] = useState(state.profile.monthlyRevenueTarget.toString());
  const [profileFocus, setProfileFocus] = useState(state.profile.primaryFocus || "");
  const [vaultPin, setVaultPin] = useState(state.vaultMasterPin || "1234");
  const [savedBanner, setSavedBanner] = useState(false);

  const activeThemeId = state.profile.activeTheme || "midnight";
  const activeWallpaperMode = state.profile.themeWallpaperMode || "pattern";

  // 🎨 Custom Theme Editor State
  const [customBgColor, setCustomBgColor] = useState(state.customTheme?.customBgColor || "");
  const [customBgImage, setCustomBgImage] = useState(state.customTheme?.customBgImage || "");
  const [customBgMode, setCustomBgMode] = useState(state.customTheme?.customBgMode || "cover");
  const [fontFamily, setFontFamily] = useState(state.customTheme?.fontFamily || "sans");
  const [fontSizeScale, setFontSizeScale] = useState(state.customTheme?.fontSizeScale || "normal");
  const [customTextColor, setCustomTextColor] = useState(state.customTheme?.customTextColor || "");
  const [customAccentColor, setCustomAccentColor] = useState(state.customTheme?.customAccentColor || "");
  const [colorCodePalette, setColorCodePalette] = useState<Record<string, string>>(
    state.customTheme?.colorCodePalette || {
      urgent: "#EF4444",
      finance: "#10B981",
      creative: "#EC4899",
      tech: "#0EA5E9",
      learning: "#F59E0B",
    }
  );
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagColor, setNewTagColor] = useState("#8B5CF6");
  const [themeSavedBanner, setThemeSavedBanner] = useState(false);

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomBgImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomTheme = (e: React.FormEvent) => {
    e.preventDefault();
    updateState((prev) => ({
      ...prev,
      customTheme: {
        ...prev.customTheme,
        customBgColor: customBgColor.trim() || undefined,
        customBgImage: customBgImage.trim() || undefined,
        customBgMode,
        fontFamily,
        fontSizeScale,
        customTextColor: customTextColor.trim() || undefined,
        customAccentColor: customAccentColor.trim() || undefined,
        colorCodePalette,
      },
    }));
    setThemeSavedBanner(true);
    confetti({ particleCount: 35, spread: 50 });
    setTimeout(() => setThemeSavedBanner(false), 3000);
  };

  const handleAddColorTag = () => {
    if (!newTagKey.trim()) return;
    setColorCodePalette((prev) => ({
      ...prev,
      [newTagKey.trim().toLowerCase()]: newTagColor,
    }));
    setNewTagKey("");
  };

  const handleRemoveColorTag = (key: string) => {
    setColorCodePalette((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        activeTheme: themeId,
      },
    }));
    if (onUpdateTheme) {
      onUpdateTheme(themeId);
    }
    confetti({ particleCount: 30, spread: 60 });
  };

  const handleToggleWallpaper = (mode: "pattern" | "clean") => {
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        themeWallpaperMode: mode,
      },
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: profileName.trim(),
        age: profileAge ? Number(profileAge) || profileAge : undefined,
        email: profileEmail.trim() || undefined,
        phone: profilePhone.trim() || undefined,
        streetAddress: profileAddress.trim() || undefined,
        city: profileCity.trim() || undefined,
        monthlyRevenueTarget: parseFloat(profileTarget) || 1000,
        primaryFocus: profileFocus.trim(),
      },
      vaultMasterPin: vaultPin.trim() || "1234",
    }));

    setSavedBanner(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerManualSync();
    setIsSyncing(false);
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleSwitchVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVaultId.trim()) return;
    updateState((prev) => ({
      ...prev,
      vaultId: customVaultId.trim(),
    }));
    triggerManualSync();
  };

  const exportBackupJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `OmniLifeOS_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.notes && parsed.projects) {
          updateState(() => parsed);
          alert("Backup successfully restored!");
          triggerManualSync();
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to parse backup JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm("Reset application data back to default template? Make sure to export a backup if you have custom data.")) {
      updateState(() => ({
        ...INITIAL_LIFE_OS_DATA,
        vaultId: state.vaultId,
      }));
    }
  };

  const themes = Object.values(THEME_REGISTRY);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-500" />
            Themes, Personalization & Cross-Platform Sync
          </h1>
          <p className="text-xs text-slate-500">
            Customize visual themes (Pink Blossom, Scripture Grace, Soft Sage), pair devices, and manage data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Now
          </button>
        </div>
      </div>

      {savedBanner && (
        <div className="bg-emerald-500 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
        </div>
      )}

      {/* 🎨 Dedicated Theme & Atmosphere Picker Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Workspace Aesthetic Themes
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your favorite theme vibe. All cards, sidebars, accents, and wallpapers update instantly.
            </p>
          </div>

          {/* Wallpaper mode toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleToggleWallpaper("pattern")}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                activeWallpaperMode === "pattern"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              ✨ Watermark / Ambient
            </button>
            <button
              onClick={() => handleToggleWallpaper("clean")}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                activeWallpaperMode === "clean"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              Minimal / Clean
            </button>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const isSelected = activeThemeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? "border-sky-500 dark:border-sky-400 bg-sky-50/50 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20 scale-[1.01]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:scale-[1.01]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{theme.emoji}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {theme.name}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shadow-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        {theme.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {theme.description}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {theme.previewColors.map((hex, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {theme.hasFloralAccents
                      ? "🌸 Soft Pink & Petals"
                      : theme.hasScriptureBanner
                      ? "✝️ Scripture & Celestial"
                      : theme.isEasyOnEyes
                      ? "🍵 Non-Glare Paper"
                      : "⚡ Clean Tech"}
                  </span>
                  <span
                    className={`font-semibold ${
                      isSelected
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    }`}
                  >
                    {isSelected ? "Active Theme ✓" : "Activate"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎨 Theme Editor (Background color/image, text style/color/size, and color-coding) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Workspace Theme Editor & Personalization Studio
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize background colors, upload computer wallpaper images, adjust text styles, font scale, and set color coding palettes.
            </p>
          </div>

          {themeSavedBanner && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" /> Theme Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveCustomTheme} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Background Color & Custom Wallpaper */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <FileImage className="w-4 h-4 text-sky-500" />
                <span>Background Color & Wallpaper Image</span>
              </div>

              {/* Custom BG Color */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Canvas & Workspace Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customBgColor || "#0F172A"}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-8 h-8 rounded-xl border border-slate-300 dark:border-slate-600 p-0 cursor-pointer overflow-hidden shrink-0"
                  />
                  <input
                    type="text"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    placeholder="Hex code (e.g. #F8FAFC, #1E1E2E) or leave blank for theme default"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Wallpaper Image upload from computer */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Custom Wallpaper Image (Search Computer or Enter URL)
                </label>

                {customBgImage && (
                  <div className="relative rounded-xl overflow-hidden h-24 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                    <img
                      src={customBgImage}
                      alt="Custom Wallpaper"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomBgImage("")}
                      className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-sky-500" />
                    <span>Search Computer for Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomWallpaperUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    value={customBgImage.startsWith("data:") ? "" : customBgImage}
                    onChange={(e) => setCustomBgImage(e.target.value)}
                    placeholder="Or paste wallpaper image URL..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Wallpaper mode */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">Fit Mode:</span>
                  {(["cover", "tile", "center", "blur"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCustomBgMode(mode)}
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        customBgMode === mode
                          ? "bg-sky-600 text-white"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Text Style, Color & Sizing */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Type className="w-4 h-4 text-purple-500" />
                <span>Typography, Text Style & Size</span>
              </div>

              {/* Font Family / Style */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Text Style & Font Family
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "sans", name: "Modern Clean", font: "font-sans" },
                    { id: "serif", name: "Classic Editorial", font: "font-serif" },
                    { id: "mono", name: "Developer Code", font: "font-mono" },
                    { id: "handwriting", name: "Casual Handwriting", font: "italic" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontFamily(f.id as any)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        fontFamily === f.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 font-bold shadow-2xs"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className={f.font}>{f.name}</div>
                      <div className="text-[10px] text-slate-400">The quick brown fox</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Scaling */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Text Font Size Scaling
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "compact", label: "Compact 90%" },
                    { id: "normal", label: "Standard 100%" },
                    { id: "spacious", label: "Relaxed 110%" },
                    { id: "large", label: "Large 125%" },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setFontSizeScale(sz.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        fontSizeScale === sz.id
                          ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color & Accent Color */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Custom Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customTextColor || "#0F172A"}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-slate-300 p-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      placeholder="#0F172A or empty"
                      className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Custom Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customAccentColor || "#0284C7"}
                      onChange={(e) => setCustomAccentColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-slate-300 p-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={customAccentColor}
                      onChange={(e) => setCustomAccentColor(e.target.value)}
                      placeholder="#0284C7 or empty"
                      className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Color-Coding Tag Palette */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Palette className="w-4 h-4 text-rose-500" />
                <span>Workspace Color-Coding Tags & Categories</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Change backgrounds and color-code cards, tags, and projects
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(colorCodePalette).map(([tagKey, hex]) => (
                <div
                  key={tagKey}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-black/10 text-xs font-bold shadow-2xs"
                  style={{ backgroundColor: hex + "25", color: hex }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hex }} />
                  <span className="capitalize">{tagKey}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColorTag(tagKey)}
                    className="ml-1 text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add custom color-coded tag */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <input
                type="text"
                value={newTagKey}
                onChange={(e) => setNewTagKey(e.target.value)}
                placeholder="New Category Tag (e.g. Urgent, Health, SideHustle)..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-8 h-8 rounded-xl border border-slate-300 p-0 cursor-pointer overflow-hidden shrink-0"
              />
              <button
                type="button"
                onClick={handleAddColorTag}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tag
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply & Save Theme Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sync Pairing Hub Card */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 border border-sky-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
              <Cloud className="w-4 h-4" /> Live Cross-Device Sync Engine
            </div>
            <h2 className="text-lg font-bold text-white">Your Universal Vault ID</h2>
            <p className="text-xs text-slate-300">
              Enter this Vault ID on any device (phone, laptop, iPad) to synchronize notes, projects, and finances.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-2xl flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Sync Status</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {syncStatus.toUpperCase()} {lastSyncTime ? `(${lastSyncTime})` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Pairing Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
          <div className="flex-1 font-mono text-sm text-sky-300 px-2 truncate">
            {state.vaultId}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(state.vaultId);
                setCopiedId(true);
                setTimeout(() => setCopiedId(false), 2000);
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId ? "Copied" : "Copy Vault ID"}
            </button>
          </div>
        </div>

        {/* Switch / Connect Custom Vault Form */}
        <form onSubmit={handleSwitchVault} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Connect to another existing Vault ID..."
            value={customVaultId}
            onChange={(e) => setCustomVaultId(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shrink-0"
          >
            Pair Device
          </button>
        </form>

        <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-sky-400" /> Desktop / Web Browser Active
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" /> Mobile PWA Ready
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile & Life OS Strategy Targets */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-sky-500" /> Identity & Contact Profile
            </h3>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab("profile")}
                className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Full Profile & ID Card →
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Handle
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={profileAge}
                  onChange={(e) => setProfileAge(e.target.value)}
                  placeholder="e.g. 26"
                  className="w-full bg-slate-50 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Street Address / Location
              </label>
              <input
                type="text"
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                placeholder="e.g. 742 Evergreen Terrace"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Side Revenue Goal ($)
                </label>
                <input
                  type="number"
                  value={profileTarget}
                  onChange={(e) => setProfileTarget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Focus
                </label>
                <input
                  type="text"
                  value={profileFocus}
                  onChange={(e) => setProfileFocus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-rose-500" /> Vault Master PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={vaultPin}
                onChange={(e) => setVaultPin(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 font-mono tracking-widest border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Profile & Preferences
            </button>
          </form>
        </div>

        {/* Data Portability & Backups */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" /> Data Portability & JSON Backups
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You own 100% of your data. Export a complete JSON snapshot anytime or restore from a previous backup.
            </p>

            <div className="space-y-2">
              <button
                onClick={exportBackupJSON}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
              >
                <Download className="w-4 h-4" /> Download Complete JSON Backup
              </button>

              <label className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer">
                <Upload className="w-4 h-4" /> Restore Backup from JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleResetData}
              className="w-full py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Starter Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
