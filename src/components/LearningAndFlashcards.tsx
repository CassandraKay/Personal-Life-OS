import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  RotateCw,
  Award,
  ExternalLink,
  Trash2,
  Loader2,
  Check,
  ChevronRight,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import { FlashcardItem, LearningItem, UserLifeOSState } from "../types";
import { generateStructuredAI } from "../services/aiService";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  selectedTopicId?: string;
}

export const LearningAndFlashcards: React.FC<Props> = ({ state, updateState, selectedTopicId }) => {
  const [activeTab, setActiveTab] = useState<"roadmaps" | "quiz">("roadmaps");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Quiz Mode State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState({ known: 0, review: 0 });

  // AI Flashcards Generator State
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState("");

  // New Roadmap Topic Modal
  const [isNewTopicModal, setIsNewTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState<LearningItem["category"]>("Coding & Tech");
  const [newTakeaways, setNewTakeaways] = useState("");

  const filteredTopics = state.learning.filter(
    (item) => categoryFilter === "All" || item.category === categoryFilter
  );

  const activeCards = state.flashcards;

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newItem: LearningItem = {
      id: "learn-" + Date.now(),
      topic: newTopicName.trim(),
      category: newTopicCategory,
      status: "In Progress",
      progressPct: 20,
      keyTakeaways: newTakeaways.trim() || "Key mental models and principles.",
      resources: [
        { id: "r1", title: "Read core documentation or primer", type: "Doc", completed: true },
        { id: "r2", title: "Build 1 interactive exercise", type: "Project", completed: false },
      ],
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      learning: [newItem, ...prev.learning],
    }));

    setIsNewTopicModal(false);
    setNewTopicName("");
    setNewTakeaways("");
  };

  // Generate Flashcards via AI
  const handleAIGenerateCards = async () => {
    if (!aiTopicInput.trim()) return;
    setIsGeneratingCards(true);

    const res = await generateStructuredAI<any[]>("flashcards", aiTopicInput.trim());
    setIsGeneratingCards(false);

    if (res.data && Array.isArray(res.data)) {
      const newCards: FlashcardItem[] = res.data.map((item: any, i: number) => ({
        id: "fc-" + Date.now() + "-" + i,
        question: item.question,
        answer: item.answer,
        category: item.category || "General",
        difficulty: item.difficulty || "Medium",
        timesReviewed: 0,
      }));

      updateState((prev) => ({
        ...prev,
        flashcards: [...newCards, ...prev.flashcards],
      }));

      confetti({ particleCount: 50, spread: 60 });
      setAiTopicInput("");
      setActiveTab("quiz");
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      setQuizFinished(false);
    }
  };

  // Handle Quiz Card Review
  const handleCardResult = (known: boolean) => {
    const card = activeCards[currentCardIndex];
    if (card) {
      updateState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((fc) =>
          fc.id === card.id
            ? {
                ...fc,
                timesReviewed: fc.timesReviewed + 1,
                lastScore: known ? "know" : "forgot",
              }
            : fc
        ),
      }));
    }

    if (known) {
      setQuizScore((prev) => ({ ...prev, known: prev.known + 1 }));
    } else {
      setQuizScore((prev) => ({ ...prev, review: prev.review + 1 }));
    }

    if (currentCardIndex + 1 < activeCards.length) {
      setIsCardFlipped(false);
      setCurrentCardIndex((i) => i + 1);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 80, spread: 70 });
    }
  };

  const resetQuiz = () => {
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setQuizFinished(false);
    setQuizScore({ known: 0, review: 0 });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Learning Hub & Spaced Repetition
          </h1>
          <p className="text-xs text-slate-500">
            Retain what you study, track roadmaps, and quiz yourself with AI-generated flashcards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("roadmaps")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "roadmaps"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Roadmaps ({state.learning.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("quiz");
                resetQuiz();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "quiz"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Quiz Deck ({state.flashcards.length})
            </button>
          </div>

          <button
            onClick={() => setIsNewTopicModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Topic
          </button>
        </div>
      </div>

      {activeTab === "roadmaps" ? (
        <>
          {/* AI Generator Bar */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white rounded-2xl p-5 border border-amber-900/60 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" />
                AI Spaced-Repetition Generator
              </div>
              <h3 className="text-base font-bold text-white">
                Generate high-yield flashcards on any concept or language
              </h3>
              <p className="text-xs text-slate-300">
                Enter any topic (e.g. React Performance, Docker, System Design, UX Heuristics)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Topic or question prompt..."
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                className="bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden w-full sm:w-72"
              />
              <button
                onClick={handleAIGenerateCards}
                disabled={isGeneratingCards}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
              >
                {isGeneratingCards ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Deck
              </button>
            </div>
          </div>

          {/* Roadmaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTopics.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {item.category}
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as LearningItem["status"];
                        updateState((prev) => ({
                          ...prev,
                          learning: prev.learning.map((l) =>
                            l.id === item.id ? { ...l, status: newStatus } : l
                          ),
                        }));
                      }}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <option value="Want to Learn">Want to Learn</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Proficient">Proficient</option>
                      <option value="Mastered">Mastered</option>
                    </select>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.topic}</h3>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span>{item.progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${item.progressPct}%` }}
                      />
                    </div>
                  </div>

                  {item.keyTakeaways && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                      <strong className="text-slate-700 dark:text-slate-300 block mb-1">Key Mental Model:</strong>
                      {item.keyTakeaways}
                    </div>
                  )}

                  {/* Resources checklist */}
                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Resources
                    </div>
                    {item.resources.map((res) => (
                      <div key={res.id} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-0.5">
                        <span className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{res.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded-sm">
                          {res.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      updateState((prev) => ({
                        ...prev,
                        learning: prev.learning.filter((l) => l.id !== item.id),
                      }));
                    }}
                    className="text-slate-400 hover:text-rose-500 text-xs p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Interactive Flashcard Quiz Deck */
        <div className="max-w-2xl mx-auto space-y-6">
          {activeCards.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
              <Layers className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Flashcards In Deck</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Use the AI Generator above to auto-generate cards from any subject or from your notes repository!
              </p>
            </div>
          ) : quizFinished ? (
            /* Quiz Completed Scorecard */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-5">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review Session Complete!</h2>
                <p className="text-xs text-slate-500 mt-1">
                  You reviewed {activeCards.length} flashcards today. Spaced repetition strengthens memory retention.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 py-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-5 py-3 rounded-2xl">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{quizScore.known}</div>
                  <div className="text-xs text-slate-500">Mastered</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-5 py-3 rounded-2xl">
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{quizScore.review}</div>
                  <div className="text-xs text-slate-500">Needs Review</div>
                </div>
              </div>

              <button
                onClick={resetQuiz}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" /> Practice Again
              </button>
            </div>
          ) : (
            /* Interactive Flip Card */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
                <span>
                  Card {currentCardIndex + 1} of {activeCards.length}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {activeCards[currentCardIndex].category}
                </span>
              </div>

              {/* Card Container */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="min-h-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between cursor-pointer select-none hover:border-amber-400/80 transition-all text-center relative group"
              >
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  {isCardFlipped ? "Answer" : "Question (Click to flip)"}
                </div>

                <div className="my-auto py-6">
                  {isCardFlipped ? (
                    <p className="text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {activeCards[currentCardIndex].answer}
                    </p>
                  ) : (
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                      {activeCards[currentCardIndex].question}
                    </h3>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  {isCardFlipped ? "Rate your memory below 👇" : "Click anywhere on the card to reveal answer"}
                </div>
              </div>

              {/* Answer Feedback Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleCardResult(false)}
                  className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 rounded-2xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
                >
                  Need Review 🔄
                </button>
                <button
                  onClick={() => handleCardResult(true)}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold transition-all shadow-md"
                >
                  I Know This! ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Topic Modal */}
      {isNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleCreateTopic}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Learning Topic</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced React Architecture, Japanese Kanji, SEO..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Coding & Tech">Coding & Tech</option>
                  <option value="Design & Art">Design & Art</option>
                  <option value="Business & Marketing">Business & Marketing</option>
                  <option value="Life & Philosophy">Life & Philosophy</option>
                  <option value="Languages">Languages</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Core Mental Model / Key Takeaway
                </label>
                <textarea
                  rows={3}
                  placeholder="What is the #1 principle to remember?"
                  value={newTakeaways}
                  onChange={(e) => setNewTakeaways(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewTopicModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                Save Topic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
