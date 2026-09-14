import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  TrendingUp,
  Plus,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Code2,
  DollarSign,
  Heart,
  Lightbulb,
  ArrowRight,
  Flame,
  Clock,
  Send,
  Loader2,
  Trash2,
  Target,
  RefreshCw,
  Check,
  Calendar,
  ListTree,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserLifeOSState, TabType } from "../types";
import { askGeminiAssistant } from "../services/aiService";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  onNavigate: (tab: TabType) => void;
}

export const CommandCenter: React.FC<Props> = ({ state, updateState, onNavigate }) => {
  const [quickInput, setQuickInput] = useState("");
  const [quickCategory, setQuickCategory] = useState<"task" | "note" | "expense" | "idea">("task");
  const [aiFocusPlan, setAiFocusPlan] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Focus Pomodoro Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"work" | "break">("work");

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({ particleCount: 80, spread: 60 });
      if (timerMode === "work") {
        setTimerMode("break");
        setTimerSeconds(5 * 60);
      } else {
        setTimerMode("work");
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Quick Capture handler
  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const text = quickInput.trim();
    if (quickCategory === "task") {
      updateState((prev) => ({
        ...prev,
        quickBrainDumpList: [
          { id: "qb-" + Date.now(), text, done: false, createdAt: new Date().toISOString() },
          ...prev.quickBrainDumpList,
        ],
      }));
    } else if (quickCategory === "note") {
      updateState((prev) => ({
        ...prev,
        notes: [
          {
            id: "n-" + Date.now(),
            title: text.length > 40 ? text.substring(0, 37) + "..." : text,
            content: text,
            folder: "Inbox",
            tags: ["QuickCapture"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...prev.notes,
        ],
      }));
    } else if (quickCategory === "expense") {
      const match = text.match(/\$?(\d+(\.\d+)?)/);
      const amount = match ? parseFloat(match[1]) : 10;
      updateState((prev) => ({
        ...prev,
        financeEntries: [
          {
            id: "fin-" + Date.now(),
            type: "expense",
            amount,
            category: "Living/Personal",
            description: text,
            date: todayStr,
          },
          ...prev.financeEntries,
        ],
      }));
    } else if (quickCategory === "idea") {
      updateState((prev) => ({
        ...prev,
        sideHustles: [
          {
            id: "sh-" + Date.now(),
            title: text,
            tagline: "Quick captured idea",
            targetAudience: "General audience",
            monetization: "To be determined",
            difficulty: "Medium",
            initialCost: "$0",
            timeToFirstDollar: "1-2 weeks",
            potentialMonthlyRevenue: "$500/mo",
            status: "Idea",
            score: 7,
            firstThreeSteps: ["Validate customer demand", "Build micro-prototype", "Share with 5 target users"],
            skillsNeeded: ["Building", "Marketing"],
            checklist: [],
            createdAt: new Date().toISOString(),
          },
          ...prev.sideHustles,
        ],
      }));
    }

    setQuickInput("");
  };

  // Toggle habit check
  const toggleHabit = (habitId: string) => {
    updateState((prev) => {
      const habitsList = prev.habits || [];
      const habit = habitsList.find((h) => h.id === habitId);
      if (!habit) return prev;
      const isCompletedToday = (habit.completedDates || []).includes(todayStr);

      const updatedCompleted = isCompletedToday
        ? (habit.completedDates || []).filter((d) => d !== todayStr)
        : [...(habit.completedDates || []), todayStr];

      if (!isCompletedToday) {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.8 },
        });
      }

      return {
        ...prev,
        habits: habitsList.map((h) => (h.id === habitId ? { ...h, completedDates: updatedCompleted } : h)),
      };
    });
  };

  // Generate Daily AI Strategy
  const handleGenerateDailyPlan = async () => {
    setIsAiLoading(true);
    const activeProjects = state.projects.map((p) => `${p.title} (${p.status})`).join(", ");
    const sideHustles = state.sideHustles.map((s) => `${s.title} (${s.status})`).join(", ");
    const habitStats = `${state.habits.filter((h) => h.completedDates.includes(todayStr)).length}/${state.habits.length} habits done today`;

    const prompt = `Give me a high-impact, grounded 3-point focus plan for today.
User Goal: "${state.profile.mainGoal}"
Active Projects: ${activeProjects}
Side Hustles: ${sideHustles}
Habits Status: ${habitStats}
Pending Tasks: ${state.quickBrainDumpList.filter((t) => !t.done).map((t) => t.text).join("; ")}

Structure your response into:
1. 🔥 Primary Mission (The single most important needle-mover for revenue or progress)
2. ⚡ 2 Fast Momentum Wins (<25 mins each)
3. 🧘 Self-Care Guardrail (How to avoid burnout and stay grounded today)`;

    const res = await askGeminiAssistant(prompt);
    setIsAiLoading(false);
    if (res.text) {
      setAiFocusPlan(res.text);
    }
  };

  // Financial calculations
  const totalIncomeMonth = state.financeEntries
    .filter((f) => f.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenseMonth = state.financeEntries
    .filter((f) => f.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const netSavings = totalIncomeMonth - totalExpenseMonth;
  const targetIncome = state.profile.monthlyRevenueTarget || 1000;
  const incomeProgressPct = Math.min(100, Math.round((totalIncomeMonth / targetIncome) * 100));

  // Today wellness
  const todayWellness = state.selfCareLogs[todayStr];

  // Active Daily Goal Resolution (retrieved from CodingWorkbench or SelfCareHub)
  const activeGoalSource = state.profile.dailyGoalSource || "coding";
  const [isEditingGoalInline, setIsEditingGoalInline] = useState(false);
  const [inlineGoalInput, setInlineGoalInput] = useState("");

  // 1. Coding Goal candidate from CodingWorkbench
  let codingGoal: {
    projectId: string;
    projectTitle: string;
    projectCategory: string;
    taskId: string;
    title: string;
    completed: boolean;
    isPinned?: boolean;
  } | null = null;

  const projectList = state.projects || [];

  for (const proj of projectList) {
    const tasks = proj.tasks || [];
    const pinned = tasks.find((t) => t.isDailyGoal);
    if (pinned) {
      codingGoal = {
        projectId: proj.id,
        projectTitle: proj.title,
        projectCategory: proj.category,
        taskId: pinned.id,
        title: pinned.title,
        completed: pinned.completed,
        isPinned: true,
      };
      break;
    }
  }

  if (!codingGoal) {
    for (const proj of projectList) {
      if (proj.status === "In Development" || proj.status === "Planning") {
        const tasks = proj.tasks || [];
        const uncompleted = tasks.find((t) => !t.completed);
        if (uncompleted) {
          codingGoal = {
            projectId: proj.id,
            projectTitle: proj.title,
            projectCategory: proj.category,
            taskId: uncompleted.id,
            title: uncompleted.title,
            completed: false,
          };
          break;
        }
      }
    }
  }

  if (!codingGoal) {
    for (const proj of projectList) {
      const tasks = proj.tasks || [];
      const uncompleted = tasks.find((t) => !t.completed);
      if (uncompleted) {
        codingGoal = {
          projectId: proj.id,
          projectTitle: proj.title,
          projectCategory: proj.category,
          taskId: uncompleted.id,
          title: uncompleted.title,
          completed: false,
        };
        break;
      }
    }
  }

  const firstProj = projectList[0];
  if (!codingGoal && firstProj && (firstProj.tasks || []).length > 0) {
    const firstTask = firstProj.tasks[0];
    codingGoal = {
      projectId: firstProj.id,
      projectTitle: firstProj.title,
      projectCategory: firstProj.category,
      taskId: firstTask.id,
      title: firstTask.title,
      completed: firstTask.completed,
    };
  }

  // 2. Self-Care Goal candidate from SelfCareHub
  const latestSelfCare = state.selfCareLogs?.[0];
  const habitsList = state.habits || [];
  const selfCareHabitFallback =
    habitsList.find((h) => h.category === "Mind & Health" && !(h.completedDates || []).includes(todayStr)) ||
    habitsList.find((h) => h.category === "Mind & Health") ||
    habitsList[0];

  const selfCareGoalTitle =
    latestSelfCare?.dailyGoal ||
    (selfCareHabitFallback ? selfCareHabitFallback.title : "Take a 30-min screen-free walk & hydrate");
  const selfCareGoalCompleted = Boolean(latestSelfCare?.dailyGoalCompleted);

  const handleToggleDailyGoal = () => {
    if (activeGoalSource === "coding") {
      if (!codingGoal) return;
      const nextDone = !codingGoal.completed;
      updateState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === codingGoal!.projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === codingGoal!.taskId ? { ...t, completed: nextDone } : t
                ),
              }
            : p
        ),
      }));
      if (nextDone) {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }
    } else {
      const nextDone = !selfCareGoalCompleted;
      updateState((prev) => {
        const logs = [...prev.selfCareLogs];
        if (logs.length === 0) {
          logs.push({
            id: "sc-" + Date.now(),
            date: todayStr,
            mood: "Good",
            sleepHours: 7.5,
            waterGlasses: 6,
            energyLevel: 8,
            gratitude: "Grateful for mindful progress.",
            wins: nextDone ? ["Achieved daily self-care focus"] : [],
            dailyGoal: selfCareGoalTitle,
            dailyGoalCompleted: nextDone,
          });
        } else {
          logs[0] = {
            ...logs[0],
            dailyGoalCompleted: nextDone,
            wins:
              nextDone && !logs[0].wins.includes("Achieved daily self-care focus")
                ? [...logs[0].wins, "Achieved daily self-care focus"]
                : logs[0].wins,
          };
        }
        return {
          ...prev,
          selfCareLogs: logs,
        };
      });
      if (nextDone) {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }
    }
  };

  const handleSelectGoalSource = (source: "coding" | "selfcare") => {
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        dailyGoalSource: source,
      },
    }));
  };

  const handleCycleDailyGoal = () => {
    if (activeGoalSource === "coding") {
      const allTasks: { projId: string; task: any }[] = [];
      (state.projects || []).forEach((p) => {
        (p.tasks || []).forEach((t) => {
          allTasks.push({ projId: p.id, task: t });
        });
      });
      if (allTasks.length <= 1) return;

      const currentIndex = allTasks.findIndex((item) =>
        codingGoal ? item.task.id === codingGoal.taskId : false
      );
      const nextIndex = (currentIndex + 1) % allTasks.length;
      const nextItem = allTasks[nextIndex];

      updateState((prev) => ({
        ...prev,
        projects: (prev.projects || []).map((p) => ({
          ...p,
          tasks: (p.tasks || []).map((t) => ({
            ...t,
            isDailyGoal: p.id === nextItem.projId && t.id === nextItem.task.id,
          })),
        })),
      }));
    } else {
      const SELF_CARE_PRESETS = [
        "Take a 30-min screen-free walk & complete evening mind declutter",
        "Drink 8 full glasses of water & do 3 deep breathing breaks",
        "Disconnect from dev tools 1 hour before bed for restorative sleep",
        "Write down 3 tiny wins and 1 thing I am truly grateful for",
        "Do a 15-minute physical stretch & reset posture",
      ];
      const currentIndex = SELF_CARE_PRESETS.indexOf(selfCareGoalTitle);
      const nextGoal = SELF_CARE_PRESETS[(currentIndex + 1) % SELF_CARE_PRESETS.length];

      updateState((prev) => {
        const logs = [...prev.selfCareLogs];
        if (logs.length === 0) {
          logs.push({
            id: "sc-" + Date.now(),
            date: todayStr,
            mood: "Good",
            sleepHours: 7.5,
            waterGlasses: 6,
            energyLevel: 8,
            gratitude: "Grateful for momentum.",
            wins: [],
            dailyGoal: nextGoal,
            dailyGoalCompleted: false,
          });
        } else {
          logs[0] = {
            ...logs[0],
            dailyGoal: nextGoal,
            dailyGoalCompleted: false,
          };
        }
        return {
          ...prev,
          selfCareLogs: logs,
        };
      });
    }
  };

  const handleStartSprintOnGoal = () => {
    setTimerMode("work");
    setTimerSeconds(25 * 60);
    setIsTimerRunning(true);
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
  };

  const handleSaveInlineGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineGoalInput.trim()) return;
    const text = inlineGoalInput.trim();

    if (activeGoalSource === "coding") {
      if (state.projects.length > 0) {
        const targetProj = state.projects[0];
        const newTaskId = "pt-" + Date.now();
        updateState((prev) => ({
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === targetProj.id
              ? {
                  ...p,
                  tasks: [
                    ...p.tasks.map((t) => ({ ...t, isDailyGoal: false })),
                    { id: newTaskId, title: text, completed: false, isDailyGoal: true },
                  ],
                }
              : p
          ),
        }));
      }
    } else {
      updateState((prev) => {
        const logs = [...prev.selfCareLogs];
        if (logs.length === 0) {
          logs.push({
            id: "sc-" + Date.now(),
            date: todayStr,
            mood: "Good",
            sleepHours: 7.5,
            waterGlasses: 6,
            energyLevel: 8,
            gratitude: "Grateful for clarity.",
            wins: [],
            dailyGoal: text,
            dailyGoalCompleted: false,
          });
        } else {
          logs[0] = {
            ...logs[0],
            dailyGoal: text,
            dailyGoalCompleted: false,
          };
        }
        return { ...prev, selfCareLogs: logs };
      });
    }

    setIsEditingGoalInline(false);
    setInlineGoalInput("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Focus Mode Active
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {state.profile.name || "Creator"}
              </h1>
              <button
                onClick={() => onNavigate("profile")}
                className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1"
                title="Open Profile & Digital Identity Card"
              >
                <span>ID Card</span>
                <span>→</span>
              </button>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl">
              <span className="text-indigo-300 font-medium">Core Goal:</span> {state.profile.mainGoal || "Keep building, learning, and staying in flow."}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-xs border border-slate-700/60 p-3 rounded-2xl shrink-0">
            <div className="px-3 border-r border-slate-700">
              <div className="text-xs text-slate-400">Side Revenue</div>
              <div className="text-base font-bold text-emerald-400">${totalIncomeMonth}</div>
            </div>
            <div className="px-3 border-r border-slate-700">
              <div className="text-xs text-slate-400">Projects</div>
              <div className="text-base font-bold text-sky-400">{state.projects.length}</div>
            </div>
            <div className="px-3">
              <div className="text-xs text-slate-400">Habits Today</div>
              <div className="text-base font-bold text-amber-400">
                {state.habits.filter((h) => h.completedDates.includes(todayStr)).length}/{state.habits.length}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Capture Form Bar */}
        <form onSubmit={handleQuickCapture} className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700/70 shadow-inner">
            <div className="flex items-center gap-1 px-2">
              <button
                type="button"
                onClick={() => setQuickCategory("task")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  quickCategory === "task" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                + Task
              </button>
              <button
                type="button"
                onClick={() => setQuickCategory("note")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  quickCategory === "note" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                + Note
              </button>
              <button
                type="button"
                onClick={() => setQuickCategory("expense")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  quickCategory === "expense" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                + Expense
              </button>
              <button
                type="button"
                onClick={() => setQuickCategory("idea")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  quickCategory === "idea" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                + Hustle Idea
              </button>
            </div>
            <input
              type="text"
              placeholder={
                quickCategory === "task"
                  ? "Type any task or brain dump to organize your mind... (Press Enter)"
                  : quickCategory === "note"
                  ? "Drop a quick note or code idea..."
                  : quickCategory === "expense"
                  ? "e.g., $15 domain renewal or $45 freelance invoice..."
                  : "e.g., AI micro-tool for video scriptwriters..."
              }
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Capture
            </button>
          </div>
        </form>

        {/* Quick Hub Navigation Shortcuts */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onNavigate("canvas")}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-amber-500/20 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Chaotic Corner Canvas</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded-md">
              {state.canvasCards?.length || 0} cards
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("calendar")}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-emerald-500/20 border border-slate-700/60 hover:border-emerald-500/40 text-slate-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Calendar & Holidays</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
              {state.calendarEvents?.length || 0} events
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("index")}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-sky-500/20 border border-slate-700/60 hover:border-sky-500/40 text-slate-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <ListTree className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Table of Contents</span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded-md">
              Index →
            </span>
          </button>
        </div>
      </div>

      {/* Daily Goal Section: Highlights single focused goal retrieved from SelfCareHub or CodingWorkbench */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all">
        {/* Top bar with Eyebrow and Source Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Today's Daily Goal
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                  Single Focus
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your highest-impact needle mover retrieved from {activeGoalSource === "coding" ? "Coding Workbench" : "Self-Care Hub"}.
              </p>
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => handleSelectGoalSource("coding")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeGoalSource === "coding"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Coding Goal</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectGoalSource("selfcare")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeGoalSource === "selfcare"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Self-Care Intention</span>
            </button>
          </div>
        </div>

        {/* Goal Content Box */}
        {isEditingGoalInline ? (
          <form onSubmit={handleSaveInlineGoal} className="space-y-3 py-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Set custom daily goal for {activeGoalSource === "coding" ? "Coding Workbench" : "Self-Care Hub"}:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder={
                  activeGoalSource === "coding"
                    ? "e.g. Implement user authentication middleware and write unit test..."
                    : "e.g. 30-min walk in nature, screen-free dinner, drink 8 glasses of water..."
                }
                value={inlineGoalInput}
                onChange={(e) => setInlineGoalInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingGoalInline(false)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Checkbox + Goal Title & Context */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <button
                type="button"
                onClick={handleToggleDailyGoal}
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  (activeGoalSource === "coding" ? codingGoal?.completed : selfCareGoalCompleted)
                    ? "bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/20"
                    : "border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/60 text-transparent hover:text-slate-400"
                }`}
                title={
                  (activeGoalSource === "coding" ? codingGoal?.completed : selfCareGoalCompleted)
                    ? "Goal completed! Click to mark as incomplete"
                    : "Click to complete today's goal"
                }
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                      activeGoalSource === "coding"
                        ? "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {activeGoalSource === "coding" ? (
                      <>
                        <Code2 className="w-3 h-3" />
                        <span>{codingGoal ? codingGoal.projectTitle : "Coding Project"}</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3 h-3" />
                        <span>Self-Care & Wellness</span>
                      </>
                    )}
                  </span>

                  {activeGoalSource === "coding" && codingGoal && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {codingGoal.projectCategory}
                    </span>
                  )}
                  {activeGoalSource === "selfcare" && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Mood: {latestSelfCare?.mood || "Good"} • Energy: {latestSelfCare?.energyLevel || 8}/10
                    </span>
                  )}

                  {(activeGoalSource === "coding" ? codingGoal?.completed : selfCareGoalCompleted) && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      ✓ Completed for today!
                    </span>
                  )}
                </div>

                <h3
                  className={`text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-all ${
                    (activeGoalSource === "coding" ? codingGoal?.completed : selfCareGoalCompleted)
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : ""
                  }`}
                >
                  {activeGoalSource === "coding"
                    ? codingGoal
                      ? codingGoal.title
                      : "Create your next milestone in Coding Workbench"
                    : selfCareGoalTitle}
                </h3>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              {/* Pomodoro Focus Sprint Button */}
              <button
                type="button"
                onClick={handleStartSprintOnGoal}
                className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Start a 25-minute Pomodoro timer dedicated to this goal"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">25m Sprint</span>
              </button>

              {/* Cycle to next goal */}
              <button
                type="button"
                onClick={handleCycleDailyGoal}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs transition-all cursor-pointer"
                title="Cycle to next pending task / intention"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Set custom goal inline */}
              <button
                type="button"
                onClick={() => {
                  setInlineGoalInput(
                    activeGoalSource === "coding"
                      ? (codingGoal?.title || "")
                      : selfCareGoalTitle
                  );
                  setIsEditingGoalInline(true);
                }}
                className="text-xs px-2.5 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-all cursor-pointer"
                title="Edit or set custom daily goal"
              >
                Edit
              </button>

              {/* Direct Jump to Origin Tab */}
              <button
                type="button"
                onClick={() => onNavigate(activeGoalSource === "coding" ? "coding" : "selfcare")}
                className="px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{activeGoalSource === "coding" ? "Workbench" : "Self-Care"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Priority Tasks, Habits, Projects & AI Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Habits Checklist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Daily Habits & Momentum</h2>
                  <p className="text-xs text-slate-500">Small daily actions create compound results.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("selfcare")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                Manage All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {state.habits.map((habit) => {
                const isDone = habit.completedDates.includes(todayStr);
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isDone
                        ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-900 dark:text-slate-100"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${isDone ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                          {habit.title}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <span>{habit.category}</span>
                          <span>•</span>
                          <span>{habit.completedDates.length} days logged</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Brain Dump & Priority Task Triage */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Brain Dump & Action Triage</h2>
                  <p className="text-xs text-slate-500">Clear your mind so you can focus on building.</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {state.quickBrainDumpList.filter((t) => !t.done).length} pending
              </span>
            </div>

            {state.quickBrainDumpList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                No items in brain dump. Use the capture bar above to add one!
              </div>
            ) : (
              <div className="space-y-2">
                {state.quickBrainDumpList.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 group"
                  >
                    <button
                      onClick={() => {
                        updateState((prev) => ({
                          ...prev,
                          quickBrainDumpList: prev.quickBrainDumpList.map((t) =>
                            t.id === item.id ? { ...t, done: !t.done } : t
                          ),
                        }));
                      }}
                      className="flex items-center gap-2.5 text-left flex-1"
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={`text-sm ${item.done ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {item.text}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        updateState((prev) => ({
                          ...prev,
                          quickBrainDumpList: prev.quickBrainDumpList.filter((t) => t.id !== item.id),
                        }));
                      }}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Coding Projects & Next Milestone */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Coding Projects</h2>
                  <p className="text-xs text-slate-500">Track progress and ship software steadily.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("coding")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                Workbench <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(state.projects || []).slice(0, 2).map((proj) => {
                const doneTasks = (proj.tasks || []).filter((t) => t.completed).length;
                const totalTasks = (proj.tasks || []).length;
                const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">
                          {proj.status}
                        </span>
                        <span className="text-xs text-slate-400">{proj.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{proj.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{proj.description}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Milestones</span>
                        <span>{doneTasks}/{totalTasks} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Focus Timer, Side Revenue Goal & AI Daily Strategist */}
        <div className="space-y-6">
          {/* Focus Pomodoro Timer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-center">
            <div className="flex items-center justify-between mb-3 text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Deep Work Timer</h3>
                  <p className="text-xs text-slate-400">{timerMode === "work" ? "25m Sprint" : "5m Break"}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${timerMode === "work" ? "bg-rose-100 dark:bg-rose-950 text-rose-600" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"}`}>
                {timerMode === "work" ? "Deep Focus" : "Rest"}
              </span>
            </div>

            {/* Big Countdown Display */}
            <div className="my-4">
              <div className="text-4xl font-black font-mono tracking-wider text-slate-900 dark:text-white">
                {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-white transition-all shadow-xs ${
                  isTimerRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? "Pause" : "Start Sprint"}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(timerMode === "work" ? 25 * 60 : 5 * 60);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Side Hustle & Financial Revenue Goal Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Monthly Revenue Goal</h3>
                  <p className="text-xs text-slate-400">${targetIncome}/mo Target</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("finance")}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                Details
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">${totalIncomeMonth}</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {incomeProgressPct}% of ${targetIncome}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${incomeProgressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Expenses: ${totalExpenseMonth}</span>
                <span className={netSavings >= 0 ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"}>
                  Net: {netSavings >= 0 ? `+$${netSavings}` : `-$${Math.abs(netSavings)}`}
                </span>
              </div>
            </div>
          </div>

          {/* AI Daily Focus & Strategy Coach */}
          <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Daily Focus Coach</h3>
                  <p className="text-xs text-slate-500">Gemini 3.7 Flash Strategy</p>
                </div>
              </div>
              <button
                onClick={handleGenerateDailyPlan}
                disabled={isAiLoading}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {aiFocusPlan ? "Refresh" : "Generate Plan"}
              </button>
            </div>

            {aiFocusPlan ? (
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-wrap leading-relaxed bg-white/70 dark:bg-slate-800/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-950">
                {aiFocusPlan}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                Click <strong>"Generate Plan"</strong> to get a prioritized 3-point strategy based on your active projects, side hustles, and pending tasks!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
