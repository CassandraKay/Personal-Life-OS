import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  Rocket,
  Trash2,
  Loader2,
  Check,
  Target,
  PieChart,
} from "lucide-react";
import { FinancialEntry, SideHustleIdea, UserLifeOSState } from "../types";
import { askGeminiAssistant, generateStructuredAI } from "../services/aiService";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  selectedHustleId?: string;
}

export const FinanceAndHustles: React.FC<Props> = ({ state, updateState, selectedHustleId }) => {
  const [activeTab, setActiveTab] = useState<"hustles" | "ledger">("hustles");

  // Ledger form state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"income" | "expense">("income");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryCategory, setEntryCategory] = useState<FinancialEntry["category"]>("Freelance/Coding");
  const [entryDesc, setEntryDesc] = useState("");
  const [entrySource, setEntrySource] = useState("");

  // AI Side Hustle Generator
  const [isGeneratingHustles, setIsGeneratingHustles] = useState(false);
  const [customHustleTopic, setCustomHustleTopic] = useState("");
  const [aiCanvasModal, setAiCanvasModal] = useState<{ title: string; text: string } | null>(null);

  // New Hustle Modal
  const [isNewHustleModal, setIsNewHustleModal] = useState(false);
  const [hustleTitle, setHustleTitle] = useState("");
  const [hustleTagline, setHustleTagline] = useState("");
  const [hustleAudience, setHustleAudience] = useState("");
  const [hustleMonetization, setHustleMonetization] = useState("");

  // Financial Stats
  const incomeEntries = state.financeEntries.filter((f) => f.type === "income");
  const expenseEntries = state.financeEntries.filter((f) => f.type === "expense");

  const totalIncome = incomeEntries.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseEntries.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const targetRevenue = state.profile.monthlyRevenueTarget || 1000;
  const revenuePct = Math.min(100, Math.round((totalIncome / targetRevenue) * 100));

  const handleAddFinancialEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(entryAmount);
    if (isNaN(amount) || amount <= 0 || !entryDesc) return;

    const newEntry: FinancialEntry = {
      id: "fin-" + Date.now(),
      type: entryType,
      amount,
      category: entryCategory,
      description: entryDesc,
      date: new Date().toISOString().split("T")[0],
      sourceOrClient: entrySource,
    };

    updateState((prev) => ({
      ...prev,
      financeEntries: [newEntry, ...prev.financeEntries],
    }));

    setIsEntryModalOpen(false);
    setEntryAmount("");
    setEntryDesc("");
    setEntrySource("");
  };

  const handleDeleteEntry = (id: string) => {
    updateState((prev) => ({
      ...prev,
      financeEntries: prev.financeEntries.filter((f) => f.id !== id),
    }));
  };

  // Generate AI Side Hustles
  const handleGenerateSideHustles = async () => {
    setIsGeneratingHustles(true);
    const topic = customHustleTopic || "Coding skills (React, Node, APIs), digital art & illustrations, low upfront capital, high profit margin micro-businesses";
    const res = await generateStructuredAI<any[]>("side_hustle_ideas", topic);
    setIsGeneratingHustles(false);

    if (res.data && Array.isArray(res.data)) {
      const generatedIdeas: SideHustleIdea[] = res.data.map((item: any, i: number) => ({
        id: "sh-ai-" + Date.now() + "-" + i,
        title: item.title || "New Side Hustle",
        tagline: item.tagline || "",
        targetAudience: item.targetAudience || "Online customers",
        monetization: item.monetization || "One-time purchase / Subscription",
        difficulty: item.difficulty || "Medium",
        initialCost: item.initialCost || "$0 - $30",
        timeToFirstDollar: item.timeToFirstDollar || "1-2 weeks",
        potentialMonthlyRevenue: item.potentialMonthlyRevenue || "$500 - $2,000/mo",
        status: "Idea",
        score: 8,
        firstThreeSteps: item.firstThreeSteps || [
          "Validate concept with 5 target users",
          "Build minimal prototype",
          "Launch initial offer on Gumroad/Stripe",
        ],
        skillsNeeded: item.skillsNeeded || ["Coding", "Marketing"],
        checklist: (item.firstThreeSteps || []).map((step: string, idx: number) => ({
          id: `step-${idx}`,
          text: step,
          done: false,
        })),
        createdAt: new Date().toISOString(),
      }));

      updateState((prev) => ({
        ...prev,
        sideHustles: [...generatedIdeas, ...prev.sideHustles],
      }));
      setCustomHustleTopic("");
    }
  };

  // AI Business Validation Canvas
  const handleValidateBusiness = async (hustle: SideHustleIdea) => {
    setIsGeneratingHustles(true);
    const prompt = `Act as an expert Y-Combinator startup coach and indie hacker mentor. Build a 1-page tactical validation plan for this online business idea:
Title: "${hustle.title}"
Tagline: "${hustle.tagline}"
Target Audience: "${hustle.targetAudience}"
Monetization: "${hustle.monetization}"

Provide:
1. 🎯 High-Converting Value Proposition
2. 🛠️ Minimum Viable Product (MVP) Scope (what to build in 3 days)
3. 💸 3 Specific Zero-Cost Marketing Channels to get your first 3 paying customers
4. 📈 Pricing Strategy and Upsell path`;

    const res = await askGeminiAssistant(prompt);
    setIsGeneratingHustles(false);
    if (res.text) {
      setAiCanvasModal({
        title: `Validation Blueprint: "${hustle.title}"`,
        text: res.text,
      });
    }
  };

  // Toggle checklist inside hustle
  const toggleHustleChecklist = (hustleId: string, taskId: string) => {
    updateState((prev) => ({
      ...prev,
      sideHustles: prev.sideHustles.map((h) => {
        if (h.id !== hustleId) return h;
        return {
          ...h,
          checklist: h.checklist.map((c) => (c.id === taskId ? { ...c, done: !c.done } : c)),
        };
      }),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Finances & Side Hustle Incubator
          </h1>
          <p className="text-xs text-slate-500">
            Track income from every gig, brainstorm profitable online businesses, and validate MVPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("hustles")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "hustles"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Side Hustle Incubator ({state.sideHustles.length})
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ledger"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Cashflow Ledger
            </button>
          </div>

          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> Log Money
          </button>
        </div>
      </div>

      {/* Revenue Goal & Cashflow Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs md:col-span-2 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Monthly Side Revenue Target</h3>
                <p className="text-xs text-slate-400">Target: ${targetRevenue}/month</p>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {revenuePct}% Achieved
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${revenuePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Earned this month: <strong>${totalIncome}</strong></span>
              <span>Remaining: <strong>${Math.max(0, targetRevenue - totalIncome)}</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Income</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">${totalIncome}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Expenses</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">${totalExpense}</div>
          </div>
        </div>
      </div>

      {activeTab === "hustles" ? (
        <>
          {/* AI Generator Bar */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-800 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Gemini 3.7 Flash Side Hustle Generator
              </div>
              <h3 className="text-base font-bold text-white">
                Brainstorm realistic low-capital business ideas tailored to your skills
              </h3>
              <p className="text-xs text-slate-300">
                Generate viable products, digital assets, or developer tools with initial steps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Optional skills or niche (e.g. Pixel art, Python bots, Notion templates)..."
                value={customHustleTopic}
                onChange={(e) => setCustomHustleTopic(e.target.value)}
                className="bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden w-full sm:w-72"
              />
              <button
                onClick={handleGenerateSideHustles}
                disabled={isGeneratingHustles}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
              >
                {isGeneratingHustles ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Ideas
              </button>
            </div>
          </div>

          {/* Hustle Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.sideHustles.map((hustle) => (
              <div
                key={hustle.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Status & Validation Button */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                      {hustle.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleValidateBusiness(hustle)}
                        disabled={isGeneratingHustles}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                        title="AI Validation Plan"
                      >
                        <Rocket className="w-3.5 h-3.5" /> AI Validate
                      </button>
                      <button
                        onClick={() => {
                          updateState((prev) => ({
                            ...prev,
                            sideHustles: prev.sideHustles.filter((h) => h.id !== hustle.id),
                          }));
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{hustle.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{hustle.tagline}</p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs mb-3">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Difficulty</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{hustle.difficulty}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Initial Cost</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{hustle.initialCost}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Potential Rev</div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">{hustle.potentialMonthlyRevenue}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">Audience:</strong> {hustle.targetAudience}
                    </div>
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">Monetization:</strong> {hustle.monetization}
                    </div>
                  </div>

                  {/* Checklist & Next Steps */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Launch Checklist
                    </div>
                    <div className="space-y-1.5">
                      {hustle.checklist &&
                        hustle.checklist.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleHustleChecklist(hustle.id, task.id)}
                            className="w-full flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left"
                          >
                            {task.done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span
                              className={`text-xs ${
                                task.done ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {task.text}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Cashflow Ledger View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Transaction History</h3>
            <span className="text-xs text-slate-400">{state.financeEntries.length} total entries</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {state.financeEntries.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      item.type === "income"
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.description}</div>
                    <div className="text-xs text-slate-400">
                      {item.category} {item.sourceOrClient ? `• ${item.sourceOrClient}` : ""} • {item.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold font-mono ${
                      item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.type === "income" ? `+$${item.amount}` : `-$${item.amount}`}
                  </span>
                  <button
                    onClick={() => handleDeleteEntry(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Money Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleAddFinancialEntry}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Income or Expense</h3>

            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setEntryType("income")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  entryType === "income" ? "bg-emerald-600 text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                + Income
              </button>
              <button
                type="button"
                onClick={() => setEntryType("expense")}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  entryType === "expense" ? "bg-rose-600 text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                - Expense
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sold 3 icon packs, Freelance invoice, Domain renew..."
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={entryCategory}
                  onChange={(e) => setEntryCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Freelance/Coding">Freelance / Coding</option>
                  <option value="Side Hustle/Product">Side Hustle / Digital Product</option>
                  <option value="Day Job">Day Job</option>
                  <option value="Subscriptions/Dev Tools">Subscriptions / Dev Tools</option>
                  <option value="Hosting/Servers">Hosting / Servers</option>
                  <option value="Learning/Books">Learning / Courses</option>
                  <option value="Art Supplies">Art Supplies / Software</option>
                  <option value="Living/Personal">Living / Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source / Client Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gumroad, Upwork, Client Name..."
                  value={entrySource}
                  onChange={(e) => setEntrySource(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEntryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
              >
                Record Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Business Canvas Modal */}
      {aiCanvasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-500" />
                {aiCanvasModal.title}
              </h3>
              <button onClick={() => setAiCanvasModal(null)} className="text-slate-400 text-xs">
                ✕
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed border border-slate-200 dark:border-slate-700">
              {aiCanvasModal.text}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setAiCanvasModal(null)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
