import React, { useState } from "react";
import {
  Heart,
  Smile,
  Moon,
  Droplet,
  Sparkles,
  Zap,
  CheckCircle2,
  Trash2,
  Plus,
  Coffee,
  Sun,
  ShieldCheck,
  Send,
  Loader2,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { SelfCareLog, UserLifeOSState } from "../types";
import { generateStructuredAI } from "../services/aiService";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
}

export const SelfCareHub: React.FC<Props> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<"checkin" | "declutter">("checkin");

  // Current Check-in state
  const latestLog = state.selfCareLogs[0] || {
    id: "sc-today",
    date: new Date().toISOString().split("T")[0],
    mood: "Good",
    sleepHours: 7.5,
    waterGlasses: 5,
    energyLevel: 8,
    gratitude: "Grateful for clean code, coffee, and peace of mind.",
    wins: ["Made solid progress on Life OS", "Took a 20 min walk"],
    dailyGoal: "Take a 30-min screen-free walk & complete evening mind declutter",
    dailyGoalCompleted: false,
  };

  const [currentMood, setCurrentMood] = useState<SelfCareLog["mood"]>(latestLog.mood);
  const [currentSleep, setCurrentSleep] = useState<number>(latestLog.sleepHours);
  const [currentWater, setCurrentWater] = useState<number>(latestLog.waterGlasses);
  const [currentEnergy, setCurrentEnergy] = useState<number>(latestLog.energyLevel);
  const [dailyGoalText, setDailyGoalText] = useState<string>(latestLog.dailyGoal || "Take a 30-min screen-free walk & complete evening mind declutter");
  const [dailyGoalDone, setDailyGoalDone] = useState<boolean>(latestLog.dailyGoalCompleted || false);
  const [gratitudeText, setGratitudeText] = useState<string>(latestLog.gratitude);
  const [winInput, setWinInput] = useState<string>("");
  const [winsList, setWinsList] = useState<string[]>(latestLog.wins);
  const [savedBanner, setSavedBanner] = useState(false);

  // Declutter Mind Triage State
  const [brainDumpText, setBrainDumpText] = useState("");
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    urgentQuickWins: string[];
    scheduleTasks: string[];
    letGoWorries: string[];
    creativeIdeas: string[];
  } | null>(null);

  const handleSaveCheckin = () => {
    const updatedLog: SelfCareLog = {
      id: "sc-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      mood: currentMood,
      sleepHours: currentSleep,
      waterGlasses: currentWater,
      energyLevel: currentEnergy,
      gratitude: gratitudeText,
      wins: winsList,
      dailyGoal: dailyGoalText,
      dailyGoalCompleted: dailyGoalDone,
    };

    updateState((prev) => ({
      ...prev,
      selfCareLogs: [
        updatedLog,
        ...prev.selfCareLogs.filter((l) => l.date !== updatedLog.date),
      ],
    }));

    setSavedBanner(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleAddWin = () => {
    if (!winInput.trim()) return;
    setWinsList((prev) => [...prev, winInput.trim()]);
    setWinInput("");
  };

  // Run AI Mind Declutter Triage
  const handleDeclutterMind = async () => {
    if (!brainDumpText.trim()) return;
    setIsTriaging(true);

    const res = await generateStructuredAI<any>("brain_dump_triage", brainDumpText);
    setIsTriaging(false);

    if (res.data) {
      setTriageResult({
        urgentQuickWins: res.data.urgentQuickWins || [],
        scheduleTasks: res.data.scheduleTasks || [],
        letGoWorries: res.data.letGoWorries || [],
        creativeIdeas: res.data.creativeIdeas || [],
      });
      confetti({ particleCount: 60, spread: 60 });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Self-Care & Mind De-Cluttering
          </h1>
          <p className="text-xs text-slate-500">
            Keep your mental battery charged, log daily gratitude, and unpack mental overload into structured actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("checkin")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "checkin"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Daily Wellness Check-In
            </button>
            <button
              onClick={() => setActiveTab("declutter")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "declutter"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              De-Clutter My Mind
            </button>
          </div>
        </div>
      </div>

      {savedBanner && (
        <div className="bg-emerald-500 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4" /> Self-care check-in recorded for today! Keep thriving.
        </div>
      )}

      {activeTab === "checkin" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Vitals Form (7 cols) */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" /> Today's Wellness Pulse
            </h3>

            {/* Mood Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                How are you feeling right now?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(["Overwhelmed", "Low", "Neutral", "Good", "Great"] as const).map(
                  (mood) => {
                    const emojis: Record<string, string> = {
                      Overwhelmed: "🤯",
                      Low: "🌧️",
                      Neutral: "😐",
                      Good: "🌱",
                      Great: "⚡",
                    };
                    const isSelected = currentMood === mood;
                    return (
                      <button
                        key={mood}
                        onClick={() => setCurrentMood(mood)}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300 scale-105 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{emojis[mood] || "✨"}</span>
                        <span className="text-[11px] font-semibold">{mood}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Water & Sleep & Energy sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Water */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-sky-500" /> Water
                  </span>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                    {currentWater} glasses
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentWater((w) => Math.max(0, w - 1))}
                    className="w-7 h-7 bg-white dark:bg-slate-700 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setCurrentWater((w) => w + 1)}
                    className="flex-1 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold"
                  >
                    + Drink
                  </button>
                </div>
              </div>

              {/* Sleep */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {currentSleep}h
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={currentSleep}
                  onChange={(e) => setCurrentSleep(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Energy */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Energy
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {currentEnergy}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEnergy}
                  onChange={(e) => setCurrentEnergy(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Daily Self-Care Goal / Intention */}
            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Today's Core Self-Care Goal / Intention
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200/70 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200 font-medium">
                  Highlights on CommandCenter
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDailyGoalDone(!dailyGoalDone)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors shrink-0 ${
                    dailyGoalDone
                      ? "bg-emerald-500 text-white"
                      : "border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-400"
                  }`}
                  title={dailyGoalDone ? "Mark as Incomplete" : "Mark as Completed"}
                >
                  {dailyGoalDone ? "✓" : ""}
                </button>
                <input
                  type="text"
                  placeholder="e.g. 30-min screen-free walk, yoga stretch, read 1 chapter..."
                  value={dailyGoalText}
                  onChange={(e) => setDailyGoalText(e.target.value)}
                  className={`flex-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden ${
                    dailyGoalDone ? "line-through text-slate-400" : ""
                  }`}
                />
              </div>
            </div>

            {/* Gratitude Statement */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Gratitude & Grounding
              </label>
              <textarea
                rows={2}
                placeholder="What is 1 thing you are truly grateful for right now?"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 resize-none focus:outline-hidden"
              />
            </div>

            {/* Daily Wins */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Small Daily Wins (No matter how tiny!)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Fixed that bug, drank water, went outside..."
                  value={winInput}
                  onChange={(e) => setWinInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddWin()}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={handleAddWin}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-xl"
                >
                  + Add Win
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {winsList.map((win, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    🏆 {win}
                    <button
                      onClick={() => setWinsList(winsList.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 text-[10px] ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveCheckin}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Today's Self-Care Log
            </button>
          </div>

          {/* Right: Historic Log Feed (5 cols) */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Days History</h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {state.selfCareLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{log.date}</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Mood: {log.mood}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span>💧 {log.waterGlasses} glasses</span>
                    <span>😴 {log.sleepHours}h sleep</span>
                    <span>⚡ {log.energyLevel}/10 energy</span>
                  </div>

                  {log.gratitude && (
                    <p className="text-slate-600 dark:text-slate-300 italic border-l-2 border-rose-300 pl-2">
                      "{log.gratitude}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* De-Clutter My Mind Triage View */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 border border-rose-900/60 shadow-xl space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                ADHD-Friendly Mind Declutter Engine
              </div>
              <h2 className="text-lg font-bold text-white">
                Pour out whatever is cluttering your mind, stress, or to-do overload
              </h2>
              <p className="text-xs text-slate-300">
                AI will organize the chaos into: Quick Wins, Scheduled Tasks, Things to Release, and Ideas.
              </p>
            </div>

            <textarea
              rows={4}
              placeholder="Dump everything here: I need to fix that bug, my bank account is low, remember to buy groceries, call my mom, what if my project fails, need to design an icon pack..."
              value={brainDumpText}
              onChange={(e) => setBrainDumpText(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                onClick={handleDeclutterMind}
                disabled={isTriaging || !brainDumpText.trim()}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
              >
                {isTriaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                De-Clutter & Prioritize My Brain
              </button>
            </div>
          </div>

          {/* Triaged Results Columns */}
          {triageResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Quick Wins */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500" /> Quick Wins (Under 5 Minutes)
                </h4>
                <div className="space-y-1.5">
                  {triageResult.urgentQuickWins.map((item, i) => (
                    <div key={i} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Schedule */}
              <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-500" /> Schedule for This Week
                </h4>
                <div className="space-y-1.5">
                  {triageResult.scheduleTasks.map((item, i) => (
                    <div key={i} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-sky-100 dark:border-sky-900/40">
                      <span className="text-sky-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Release / Let Go */}
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-500" /> Let Go / Out of Your Control
                </h4>
                <div className="space-y-1.5">
                  {triageResult.letGoWorries.map((item, i) => (
                    <div key={i} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      <span className="text-rose-500 font-bold">🕊️</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Creative Ideas */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Incubate & Future Ideas
                </h4>
                <div className="space-y-1.5">
                  {triageResult.creativeIdeas.map((item, i) => (
                    <div key={i} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40">
                      <span className="text-amber-500 font-bold">💡</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
