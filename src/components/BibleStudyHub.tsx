import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Heart,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Filter,
  Calendar,
  Tag,
  Share2,
  Trash2,
  Edit3,
  Flame,
  Award,
  ShieldCheck,
  X,
  Play,
  Pause,
  RotateCcw,
  Sun,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  UserLifeOSState,
  PrayerItem,
  PrayerCategory,
  BibleStudyNote,
  BibleBookmark,
} from "../types";
import {
  BIBLE_BOOKS,
  PRELOADED_BIBLE_CHAPTERS,
  TOPICAL_SCRIPTURES,
  getBibleChapter,
  BibleChapterData,
  BibleBookMeta,
} from "../data/bibleData";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
}

export const PRAYER_CATEGORY_LABELS: Record<
  PrayerCategory,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  praise: {
    label: "Praise & Thanksgiving",
    emoji: "🙌",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
  },
  personal: {
    label: "Personal Walk & Petitions",
    emoji: "🌱",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  family: {
    label: "Family & Loved Ones",
    emoji: "🏡",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
  },
  salvation: {
    label: "Salvation of Friends & Lost",
    emoji: "✝️",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
  },
  healing: {
    label: "Healing & Restoration",
    emoji: "🩺",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
  },
  guidance: {
    label: "Wisdom & God's Will",
    emoji: "🧭",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  church_world: {
    label: "Church & Mission",
    emoji: "🌍",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800",
  },
};

export const BibleStudyHub: React.FC<Props> = ({ state, updateState }) => {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"prayers" | "bible" | "soap_notes" | "topical">("prayers");

  // Prayers state
  const prayers = state.prayers || [];
  const bibleNotes = state.bibleNotes || [];
  const bibleBookmarks = state.bibleBookmarks || [];

  const [prayerFilter, setPrayerFilter] = useState<"all" | "active" | "answered" | "urgent">("active");
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | "all">("all");
  const [prayerSearch, setPrayerSearch] = useState("");
  const [isAddPrayerOpen, setIsAddPrayerOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerItem | null>(null);

  // Answered prayer celebration modal
  const [answeringPrayerId, setAnsweringPrayerId] = useState<string | null>(null);
  const [praiseReportText, setPraiseReportText] = useState("");

  // Guided Quiet Time & Prayer Session
  const [isPrayerSessionOpen, setIsPrayerSessionOpen] = useState(false);
  const [prayerSessionStep, setPrayerSessionStep] = useState<0 | 1 | 2 | 3>(0);
  const [sessionActiveItemIndex, setSessionActiveItemIndex] = useState(0);

  // Downloaded Bible Reader state
  const [selectedTestament, setSelectedTestament] = useState<"ALL" | "OT" | "NT">("NT");
  const [selectedBook, setSelectedBook] = useState<string>("John");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [currentChapterData, setCurrentChapterData] = useState<BibleChapterData | null>(
    PRELOADED_BIBLE_CHAPTERS["John-1"] || null
  );
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [bibleSearchQuery, setBibleSearchQuery] = useState("");
  const [readerFontSize, setReaderFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [readerFontFamily, setReaderFontFamily] = useState<"serif" | "sans">("serif");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // S.O.A.P. Notes state
  const [isAddSoapOpen, setIsAddSoapOpen] = useState(false);
  const [soapSearch, setSoapSearch] = useState("");
  const [editingSoap, setEditingSoap] = useState<BibleStudyNote | null>(null);

  // Topical scriptures filter
  const [topicalFilter, setTopicalFilter] = useState<string>("All");

  // Copy notification state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load chapter text whenever book or chapter changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingChapter(true);
    getBibleChapter(selectedBook, selectedChapter).then((data) => {
      if (isMounted) {
        setCurrentChapterData(data);
        setIsLoadingChapter(false);
      }
    });
    return () => {
      isMounted = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [selectedBook, selectedChapter]);

  // Current Book Meta
  const currentBookMeta = useMemo(() => {
    return BIBLE_BOOKS.find((b) => b.name === selectedBook) || BIBLE_BOOKS[42]; // Default John
  }, [selectedBook]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    if (selectedTestament === "ALL") return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter((b) => b.testament === selectedTestament);
  }, [selectedTestament]);

  // Filtered Prayers
  const filteredPrayers = useMemo(() => {
    return prayers.filter((p) => {
      if (prayerFilter === "active" && p.isAnswered) return false;
      if (prayerFilter === "answered" && !p.isAnswered) return false;
      if (prayerFilter === "urgent" && !p.isUrgent) return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (prayerSearch.trim()) {
        const q = prayerSearch.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchRef = p.scriptureReference?.toLowerCase().includes(q);
        const matchAnswer = p.answerPraiseReport?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchRef || matchAnswer;
      }
      return true;
    });
  }, [prayers, prayerFilter, selectedCategory, prayerSearch]);

  const activePrayersCount = useMemo(() => prayers.filter((p) => !p.isAnswered).length, [prayers]);
  const answeredPrayersCount = useMemo(() => prayers.filter((p) => p.isAnswered).length, [prayers]);

  // Handle Prayed Today increment
  const handlePrayToday = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const today = new Date().toISOString().split("T")[0];
    updateState((prev) => ({
      ...prev,
      prayers: (prev.prayers || []).map((p) => {
        if (p.id === id) {
          return {
            ...p,
            timesPrayed: (p.timesPrayed || 0) + 1,
            lastPrayedDate: today,
          };
        }
        return p;
      }),
    }));
  };

  // Handle Mark as Answered (Praise Report)
  const handleConfirmAnswered = () => {
    if (!answeringPrayerId) return;
    const today = new Date().toISOString().split("T")[0];

    updateState((prev) => ({
      ...prev,
      prayers: (prev.prayers || []).map((p) => {
        if (p.id === answeringPrayerId) {
          return {
            ...p,
            isAnswered: true,
            dateAnswered: today,
            answerPraiseReport: praiseReportText.trim() || "The Lord faithfully answered this prayer! Praise Jesus!",
          };
        }
        return p;
      }),
    }));

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setAnsweringPrayerId(null);
    setPraiseReportText("");
  };

  // Audio Read Aloud (Text to Speech)
  const handleToggleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentChapterData || currentChapterData.verses.length === 0) return;

    const fullText = `${currentChapterData.book} chapter ${currentChapterData.chapter}. ` +
      currentChapterData.verses.map((v) => `Verse ${v.verse}: ${v.text}`).join(" ");

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.95; // Peaceful, steady reading speed
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Copy text helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-stone-50/50 dark:bg-stone-950/40 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Sanctuary Header */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white px-6 py-6 border-b border-amber-700/50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <BookOpen className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-amber-50 flex items-center gap-2">
                  Bible Study & Quiet Time with the Lord
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                    Jesus Christ Our Lord & Savior
                  </span>
                </h1>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  &ldquo;Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.&rdquo; — Hebrews 4:16
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setIsPrayerSessionOpen(true);
                setPrayerSessionStep(0);
                setSessionActiveItemIndex(0);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-100" />
              <span>Start Quiet Time / Prayer Walk</span>
            </button>

            <button
              onClick={() => {
                setEditingPrayer(null);
                setIsAddPrayerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prayer Request</span>
            </button>

            <button
              onClick={() => {
                setEditingSoap(null);
                setIsAddSoapOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>New S.O.A.P. Note</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2 overflow-x-auto pb-1 border-t border-amber-700/40 pt-3">
          <button
            onClick={() => setActiveSubTab("prayers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "prayers"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-amber-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${activeSubTab === "prayers" ? "text-rose-600" : "text-amber-300"}`} />
            <span>Prayer List & Answers</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                activeSubTab === "prayers" ? "bg-stone-200 text-stone-800" : "bg-black/30 text-amber-200"
              }`}
            >
              {activePrayersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("bible")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "bible"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-amber-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeSubTab === "bible" ? "text-amber-700" : "text-amber-300"}`} />
            <span>Downloaded Holy Bible (66 Books)</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                activeSubTab === "bible" ? "bg-stone-200 text-stone-800" : "bg-black/30 text-amber-200"
              }`}
            >
              Offline
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("soap_notes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "soap_notes"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-amber-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Edit3 className={`w-4 h-4 ${activeSubTab === "soap_notes" ? "text-indigo-600" : "text-amber-300"}`} />
            <span>S.O.A.P. Study Journal</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                activeSubTab === "soap_notes" ? "bg-stone-200 text-stone-800" : "bg-black/30 text-amber-200"
              }`}
            >
              {bibleNotes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("topical")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "topical"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-amber-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeSubTab === "topical" ? "text-emerald-600" : "text-amber-300"}`} />
            <span>Christ-Centered Foundations</span>
          </button>
        </div>
      </div>

      {/* Main Sanctuary Body */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: PRAYER LIST & ANSWERS */}
        {/* ========================================================================= */}
        {activeSubTab === "prayers" && (
          <div className="space-y-6">
            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Active Petitions & Prayers</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {activePrayersCount}
                  </div>
                  <div className="text-[11px] text-stone-400">Praying directly to the Father in Jesus&apos; name</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <Heart className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Answered Praise Reports</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {answeredPrayersCount}
                  </div>
                  <div className="text-[11px] text-stone-400">Recorded testimonies of God&apos;s faithfulness</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-700 to-amber-900 text-white rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-200 font-medium">Quiet Time Focus</div>
                  <div className="text-sm font-bold text-white mt-1">
                    One Mediator: Jesus Christ
                  </div>
                  <div className="text-[11px] text-amber-300/90 mt-0.5">
                    1 Timothy 2:5 — Direct access to God
                  </div>
                </div>
                <button
                  onClick={() => setIsPrayerSessionOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-stone-900 hover:bg-amber-100 shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  Pray Now
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={prayerSearch}
                    onChange={(e) => setPrayerSearch(e.target.value)}
                    placeholder="Search prayers, scriptures, answers..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  {prayerSearch && (
                    <button
                      onClick={() => setPrayerSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-x-auto w-full md:w-auto">
                  <button
                    onClick={() => setPrayerFilter("active")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prayerFilter === "active"
                        ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-2xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    Active ({activePrayersCount})
                  </button>
                  <button
                    onClick={() => setPrayerFilter("answered")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prayerFilter === "answered"
                        ? "bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    Answered 🎉 ({answeredPrayersCount})
                  </button>
                  <button
                    onClick={() => setPrayerFilter("urgent")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prayerFilter === "urgent"
                        ? "bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-2xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    Urgent
                  </button>
                  <button
                    onClick={() => setPrayerFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prayerFilter === "all"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    All ({prayers.length})
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
                  Category:
                </span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                  }`}
                >
                  All Categories
                </button>
                {(Object.keys(PRAYER_CATEGORY_LABELS) as PrayerCategory[]).map((catKey) => {
                  const info = PRAYER_CATEGORY_LABELS[catKey];
                  const isSelected = selectedCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? `${info.bg} ${info.color} font-bold border ${info.border}`
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      <span>{info.emoji}</span>
                      <span>{info.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prayers Grid */}
            {filteredPrayers.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                  {prayerFilter === "answered"
                    ? "No Answered Praise Reports in this filter yet"
                    : "No Prayer Requests Found"}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  &ldquo;Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.&rdquo; — Matthew 7:7
                </p>
                <button
                  onClick={() => setIsAddPrayerOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Prayer Request</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrayers.map((prayer) => {
                  const catInfo = PRAYER_CATEGORY_LABELS[prayer.category] || PRAYER_CATEGORY_LABELS.personal;
                  return (
                    <div
                      key={prayer.id}
                      className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        prayer.isAnswered
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs"
                          : prayer.isUrgent
                          ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-300 shadow-2xs"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 ${catInfo.bg} ${catInfo.color} border ${catInfo.border}`}
                            >
                              <span>{catInfo.emoji}</span>
                              <span>{catInfo.label}</span>
                            </span>

                            {prayer.isUrgent && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                Urgent
                              </span>
                            )}

                            {prayer.pinned && (
                              <span className="text-amber-500 text-xs" title="Pinned to top">
                                📌
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-stone-400">
                            <button
                              onClick={() => {
                                setEditingPrayer(prayer);
                                setIsAddPrayerOpen(true);
                              }}
                              className="p-1 hover:text-stone-700 dark:hover:text-stone-200 rounded-md"
                              title="Edit Prayer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this prayer request?")) {
                                  updateState((prev) => ({
                                    ...prev,
                                    prayers: (prev.prayers || []).filter((p) => p.id !== prayer.id),
                                  }));
                                }
                              }}
                              className="p-1 hover:text-rose-600 rounded-md"
                              title="Delete Prayer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            {prayer.title}
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 whitespace-pre-line leading-relaxed">
                            {prayer.description}
                          </p>
                        </div>

                        {/* Attached Scripture Reference */}
                        {prayer.scriptureReference && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                            <div className="flex items-center gap-1.5 font-serif font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                              <span>{prayer.scriptureReference}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(prayer.scriptureReference!, `ref-${prayer.id}`)}
                              className="text-[11px] text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                            >
                              {copiedId === `ref-${prayer.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === `ref-${prayer.id}` ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        )}

                        {/* Answered Praise Report Banner */}
                        {prayer.isAnswered && prayer.answerPraiseReport && (
                          <div className="p-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-300/80 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span>Praise Report: God Answered! ({prayer.dateAnswered || "Answered"})</span>
                            </div>
                            <p className="italic leading-relaxed">{prayer.answerPraiseReport}</p>
                          </div>
                        )}

                        {/* Updates Timeline Log */}
                        {prayer.updates && prayer.updates.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                            <div className="text-[10px] uppercase font-bold text-stone-400">Prayer Updates</div>
                            {prayer.updates.map((upd) => (
                              <div key={upd.id} className="text-[11px] text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg">
                                <span className="font-mono text-stone-400 mr-1.5 font-bold">{upd.date}:</span>
                                {upd.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <span>Prayed {prayer.timesPrayed || 0} times</span>
                          {prayer.lastPrayedDate && (
                            <>
                              <span>•</span>
                              <span>Last: {prayer.lastPrayedDate}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!prayer.isAnswered ? (
                            <>
                              <button
                                onClick={(e) => handlePrayToday(prayer.id, e)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-2xs transition-all cursor-pointer"
                                title="Record praying for this today"
                              >
                                <Heart className="w-3.5 h-3.5 fill-current text-amber-200" />
                                <span>Pray Today (+1)</span>
                              </button>

                              <button
                                onClick={() => {
                                  setAnsweringPrayerId(prayer.id);
                                  setPraiseReportText("");
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
                                title="Record an answered prayer praise report"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Answered!</span>
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Answered</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DOWNLOADED HOLY BIBLE */}
        {/* ========================================================================= */}
        {activeSubTab === "bible" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Book & Chapter Navigator */}
            <div className="lg:col-span-1 space-y-4">
              {/* Testament Toggle */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Canon (66 Books)
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                  <button
                    onClick={() => setSelectedTestament("ALL")}
                    className={`py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedTestament === "ALL"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs"
                        : "text-stone-500"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedTestament("OT")}
                    className={`py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedTestament === "OT"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs"
                        : "text-stone-500"
                    }`}
                  >
                    OT (39)
                  </button>
                  <button
                    onClick={() => setSelectedTestament("NT")}
                    className={`py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedTestament === "NT"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs"
                        : "text-stone-500"
                    }`}
                  >
                    NT (27)
                  </button>
                </div>

                {/* Books List */}
                <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1">
                  {filteredBooks.map((book) => {
                    const isSelected = selectedBook === book.name;
                    return (
                      <button
                        key={book.id}
                        onClick={() => {
                          setSelectedBook(book.name);
                          setSelectedChapter(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-600 text-white font-bold shadow-xs"
                            : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10">
                            {book.id}
                          </span>
                          <span className="truncate">{book.name}</span>
                        </div>
                        <span className="text-[10px] opacity-75">{book.chaptersCount} ch</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chapter Selector Grid */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {selectedBook} Chapters
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Total: {currentBookMeta.chaptersCount}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {Array.from({ length: currentBookMeta.chaptersCount }, (_, i) => i + 1).map((ch) => {
                    const isSelected = selectedChapter === ch;
                    return (
                      <button
                        key={ch}
                        onClick={() => setSelectedChapter(ch)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-600 text-white shadow-2xs"
                            : "bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Offline Status Badge */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Downloaded & Cached Offline</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  Chapters you view are automatically stored in browser offline storage. Core books (John, Romans, Psalms, Ephesians, Philippians, Isaiah, etc.) are pre-bundled permanently.
                </p>
              </div>
            </div>

            {/* Right Column: Scripture Reader View */}
            <div className="lg:col-span-3 space-y-4">
              {/* Reader Controls Toolbar */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedChapter > 1) setSelectedChapter((prev) => prev - 1);
                    }}
                    disabled={selectedChapter <= 1}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                    title="Previous Chapter"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      {selectedBook} {selectedChapter}
                    </h3>
                    <span className="text-[11px] text-stone-400">
                      {currentChapterData?.translation || "King James Version (KJV)"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedChapter < currentBookMeta.chaptersCount) setSelectedChapter((prev) => prev + 1);
                    }}
                    disabled={selectedChapter >= currentBookMeta.chaptersCount}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                    title="Next Chapter"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Reader Controls: Audio Listen, Font size, Serif/Sans */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Audio Listen Aloud */}
                  <button
                    onClick={handleToggleSpeak}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSpeaking
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200"
                    }`}
                    title={isSpeaking ? "Stop reading aloud" : "Listen to chapter read aloud"}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{isSpeaking ? "Stop Audio" : "Listen Aloud"}</span>
                  </button>

                  {/* Font Type Toggle */}
                  <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                    <button
                      onClick={() => setReaderFontFamily("serif")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-serif transition-all ${
                        readerFontFamily === "serif"
                          ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white font-bold shadow-2xs"
                          : "text-stone-500"
                      }`}
                    >
                      Serif
                    </button>
                    <button
                      onClick={() => setReaderFontFamily("sans")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-sans transition-all ${
                        readerFontFamily === "sans"
                          ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white font-bold shadow-2xs"
                          : "text-stone-500"
                      }`}
                    >
                      Sans
                    </button>
                  </div>

                  {/* Font Size Toggle */}
                  <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                    <button
                      onClick={() => setReaderFontSize("sm")}
                      className={`px-2 py-1 text-xs rounded-lg font-mono ${readerFontSize === "sm" ? "bg-white dark:bg-stone-700 font-bold" : "text-stone-500"}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setReaderFontSize("base")}
                      className={`px-2 py-1 text-xs rounded-lg font-mono ${readerFontSize === "base" ? "bg-white dark:bg-stone-700 font-bold" : "text-stone-500"}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setReaderFontSize("lg")}
                      className={`px-2 py-1 text-xs rounded-lg font-mono ${readerFontSize === "lg" ? "bg-white dark:bg-stone-700 font-bold" : "text-stone-500"}`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setReaderFontSize("xl")}
                      className={`px-2 py-1 text-xs rounded-lg font-mono ${readerFontSize === "xl" ? "bg-white dark:bg-stone-700 font-bold" : "text-stone-500"}`}
                    >
                      A++
                    </button>
                  </div>
                </div>
              </div>

              {/* Book Theme Banner */}
              <div className="px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-800 dark:text-amber-300 mr-2">Theme:</span>
                  <span>{currentBookMeta.theme}</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md font-bold text-amber-900 dark:text-amber-200">
                  {currentBookMeta.category}
                </span>
              </div>

              {/* Chapter Scripture Text Display */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 md:p-8 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
                {isLoadingChapter ? (
                  <div className="py-20 text-center text-stone-400 space-y-2">
                    <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs">Loading {selectedBook} Chapter {selectedChapter}...</p>
                  </div>
                ) : (
                  <div
                    className={`space-y-3.5 leading-relaxed text-stone-800 dark:text-stone-200 ${
                      readerFontFamily === "serif" ? "font-serif" : "font-sans"
                    } ${
                      readerFontSize === "sm"
                        ? "text-sm"
                        : readerFontSize === "base"
                        ? "text-base"
                        : readerFontSize === "lg"
                        ? "text-lg"
                        : "text-xl"
                    }`}
                  >
                    {currentChapterData?.verses.map((v) => {
                      const verseRef = `${selectedBook} ${selectedChapter}:${v.verse}`;
                      const isCopied = copiedId === verseRef;
                      return (
                        <div
                          key={v.verse}
                          className="group relative rounded-xl p-2 -mx-2 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors flex items-start gap-2"
                        >
                          <span className="font-mono text-xs text-amber-700 dark:text-amber-400 font-bold select-none pt-1 shrink-0 w-7 text-right">
                            {v.verse}
                          </span>
                          <span className="flex-1 select-text">{v.text}</span>

                          {/* Hover Action Buttons */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 bg-white/90 dark:bg-stone-800/90 shadow-2xs border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded-lg text-xs">
                            <button
                              onClick={() => handleCopy(`"${v.text}" — ${verseRef}`, verseRef)}
                              className="p-1 hover:text-amber-600 rounded"
                              title="Copy Verse"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                            </button>

                            <button
                              onClick={() => {
                                setEditingSoap({
                                  id: `soap-${Date.now()}`,
                                  title: `Study on ${verseRef}`,
                                  passage: verseRef,
                                  date: new Date().toISOString().split("T")[0],
                                  scriptureText: v.text,
                                  observation: "",
                                  application: "",
                                  prayer: "",
                                  tags: [selectedBook],
                                });
                                setIsAddSoapOpen(true);
                              }}
                              className="p-1 hover:text-indigo-600 rounded"
                              title="Start S.O.A.P. Note on this verse"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingPrayer({
                                  id: `prayer-${Date.now()}`,
                                  title: `Prayer standing on ${verseRef}`,
                                  description: "",
                                  category: "personal",
                                  scriptureReference: verseRef,
                                  dateCreated: new Date().toISOString().split("T")[0],
                                  isAnswered: false,
                                  timesPrayed: 0,
                                });
                                setIsAddPrayerOpen(true);
                              }}
                              className="p-1 hover:text-rose-600 rounded"
                              title="Add to Prayer List"
                            >
                              <Heart className="w-3.5 h-3.5 text-stone-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: S.O.A.P. STUDY JOURNAL */}
        {/* ========================================================================= */}
        {activeSubTab === "soap_notes" && (
          <div className="space-y-6">
            {/* Guide Explainer */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                    <Edit3 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      The S.O.A.P. Bible Study Method
                    </h3>
                    <p className="text-xs text-stone-500">
                      A simple, time-tested biblical method to commune with the Lord in His Word:
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingSoap(null);
                    setIsAddSoapOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write New Study Note</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <div className="text-xs font-black text-indigo-600">S — Scripture</div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Write down the verse or passage God spoke to your heart through today.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <div className="text-xs font-black text-indigo-600">O — Observation</div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    What does this text reveal about God the Father, Jesus Christ, and His truth?
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <div className="text-xs font-black text-indigo-600">A — Application</div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    How does this personally apply to my thoughts, work, and actions today?
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <div className="text-xs font-black text-indigo-600">P — Prayer</div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Pray the Word directly back to God in sincerity and thanksgiving.
                  </div>
                </div>
              </div>
            </div>

            {/* Notes List */}
            {bibleNotes.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 mx-auto flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                  No Bible Study Notes Yet
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Take a moment during your quiet time to capture observations from Scripture and turn them into personal prayer.
                </p>
                <button
                  onClick={() => setIsAddSoapOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write First Note</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bibleNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {note.passage}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {note.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-stone-400">
                        <span className="text-xs text-stone-400 font-mono">{note.date}</span>
                        <button
                          onClick={() => {
                            setEditingSoap(note);
                            setIsAddSoapOpen(true);
                          }}
                          className="p-1 hover:text-stone-700 dark:hover:text-stone-200"
                          title="Edit Note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this study note?")) {
                              updateState((prev) => ({
                                ...prev,
                                bibleNotes: (prev.bibleNotes || []).filter((n) => n.id !== note.id),
                              }));
                            }
                          }}
                          className="p-1 hover:text-rose-600"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* S.O.A.P. Content Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* S: Scripture */}
                      <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                        <div className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                          Scripture ({note.passage})
                        </div>
                        <p className="font-serif italic text-stone-700 dark:text-stone-300 leading-relaxed">
                          &ldquo;{note.scriptureText}&rdquo;
                        </p>
                      </div>

                      {/* O: Observation */}
                      <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-1">
                        <div className="font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                          Observation (Truth Revealed)
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                          {note.observation}
                        </p>
                      </div>

                      {/* A: Application */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[10px]">
                          Application (Living it Out)
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                          {note.application}
                        </p>
                      </div>

                      {/* P: Prayer */}
                      <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-1">
                        <div className="font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider text-[10px]">
                          Prayer to the Lord
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 italic leading-relaxed">
                          {note.prayer}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CHRIST-CENTERED TOPICAL SCRIPTURES */}
        {/* ========================================================================= */}
        {activeSubTab === "topical" && (
          <div className="space-y-6">
            {/* Sub-header Banner */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Foundational Biblical Truths & Promises</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Rooted exclusively in the Holy Bible: Christ our Savior, God manifest in the flesh, His atonement on the cross, and direct prayer to God alone through Him.
                </p>
              </div>

              {/* Topic Selector Filter */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-100 dark:border-stone-800">
                {["All", "Deity of Jesus Christ", "Christ Died for Our Sins", "Praying Directly to God Alone", "Salvation by Grace Alone", "Peace, Trust & Anxiety", "Strength in Trials"].map((topic) => {
                  const isSelected = topicalFilter === topic;
                  return (
                    <button
                      key={topic}
                      onClick={() => setTopicalFilter(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topical Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOPICAL_SCRIPTURES.filter((t) => topicalFilter === "All" || t.topic === topicalFilter).map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {item.topic}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                          {item.reference}
                        </span>
                      </div>

                      <blockquote className="font-serif italic text-sm text-stone-800 dark:text-stone-200 border-l-2 border-amber-500 pl-3 leading-relaxed">
                        &ldquo;{item.text}&rdquo;
                      </blockquote>

                      <p className="text-xs text-stone-500 dark:text-stone-400 pt-1">
                        {item.explanation}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <button
                        onClick={() => handleCopy(`"${item.text}" — ${item.reference}`, item.id)}
                        className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? "Copied" : "Copy Verse"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingPrayer({
                            id: `prayer-${Date.now()}`,
                            title: `Prayer based on ${item.reference}`,
                            description: item.explanation,
                            category: "praise",
                            scriptureReference: item.reference,
                            dateCreated: new Date().toISOString().split("T")[0],
                            isAnswered: false,
                            timesPrayed: 0,
                          });
                          setIsAddPrayerOpen(true);
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Pray This Truth</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PRAYER REQUEST */}
      {/* ========================================================================= */}
      {isAddPrayerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{editingPrayer ? "Edit Prayer Request" : "New Prayer Request"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddPrayerOpen(false);
                  setEditingPrayer(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
                const category = (form.elements.namedItem("category") as HTMLSelectElement).value as PrayerCategory;
                const scriptureReference = (form.elements.namedItem("scriptureReference") as HTMLInputElement).value;
                const isUrgent = (form.elements.namedItem("isUrgent") as HTMLInputElement).checked;
                const pinned = (form.elements.namedItem("pinned") as HTMLInputElement).checked;

                if (editingPrayer) {
                  updateState((prev) => ({
                    ...prev,
                    prayers: (prev.prayers || []).map((p) =>
                      p.id === editingPrayer.id
                        ? {
                            ...p,
                            title,
                            description,
                            category,
                            scriptureReference: scriptureReference || undefined,
                            isUrgent,
                            pinned,
                          }
                        : p
                    ),
                  }));
                } else {
                  const newPrayer: PrayerItem = {
                    id: `prayer-${Date.now()}`,
                    title,
                    description,
                    category,
                    scriptureReference: scriptureReference || undefined,
                    dateCreated: new Date().toISOString().split("T")[0],
                    isAnswered: false,
                    timesPrayed: 0,
                    isUrgent,
                    pinned,
                  };
                  updateState((prev) => ({
                    ...prev,
                    prayers: [newPrayer, ...(prev.prayers || [])],
                  }));
                }

                setIsAddPrayerOpen(false);
                setEditingPrayer(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Prayer Title / Person / Need *
                </label>
                <input
                  name="title"
                  defaultValue={editingPrayer?.title || ""}
                  required
                  placeholder="e.g. Salvation of my brother, Healing for mom, Peace in decisions..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    defaultValue={editingPrayer?.category || "personal"}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
                  >
                    {(Object.keys(PRAYER_CATEGORY_LABELS) as PrayerCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {PRAYER_CATEGORY_LABELS[c].emoji} {PRAYER_CATEGORY_LABELS[c].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Scripture Promise (Optional)
                  </label>
                  <input
                    name="scriptureReference"
                    defaultValue={editingPrayer?.scriptureReference || ""}
                    placeholder="e.g. Philippians 4:6-7, John 14:14"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Details & Specific Requests
                </label>
                <textarea
                  name="description"
                  defaultValue={editingPrayer?.description || ""}
                  rows={3}
                  placeholder="What specifically are you laying before God's throne in prayer?"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    defaultChecked={editingPrayer?.isUrgent || false}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Mark as Urgent</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="pinned"
                    defaultChecked={editingPrayer?.pinned || false}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Pin to Top</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPrayerOpen(false);
                    setEditingPrayer(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingPrayer ? "Save Changes" : "Add Prayer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CELEBRATE & RECORD ANSWERED PRAYER (PRAISE REPORT) */}
      {/* ========================================================================= */}
      {answeringPrayerId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                Praise God! Record Answered Prayer
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                &ldquo;Bless the Lord, O my soul, and forget not all his benefits.&rdquo; — Psalm 103:2
              </p>
            </div>

            <div className="text-left space-y-2 text-xs">
              <label className="block font-bold text-stone-700 dark:text-stone-300">
                Praise Report / How Did the Lord Answer?
              </label>
              <textarea
                value={praiseReportText}
                onChange={(e) => setPraiseReportText(e.target.value)}
                rows={4}
                placeholder="Share the testimony of what God did! (e.g., The Lord provided unexpectedly, doctor test came back clear, peace was given...)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setAnsweringPrayerId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAnswered}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Praise Report 🎉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: GUIDED QUIET TIME & PRAYER WALK SESSION */}
      {/* ========================================================================= */}
      {isPrayerSessionOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-amber-500/40 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Quiet Time Session with the Lord
                  </h3>
                  <p className="text-xs text-stone-500">
                    In the presence of our Heavenly Father through Jesus Christ
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPrayerSessionOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Steps Indicator */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { label: "1. Adoration", icon: "🙌" },
                { label: "2. Confession", icon: "🕊️" },
                { label: "3. Thanksgiving", icon: "☀️" },
                { label: "4. Intercession", icon: "🙏" },
              ].map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrayerSessionStep(idx as 0 | 1 | 2 | 3)}
                  className={`p-2 rounded-xl transition-all ${
                    prayerSessionStep === idx
                      ? "bg-amber-600 text-white font-bold shadow-xs"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}
                >
                  <div className="text-sm">{step.icon}</div>
                  <div className="text-[10px] truncate">{step.label}</div>
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[220px] flex flex-col justify-center space-y-4">
              {prayerSessionStep === 0 && (
                <div className="text-center space-y-3">
                  <span className="text-3xl">🙌</span>
                  <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Step 1: Adoration & Praise
                  </h4>
                  <p className="text-sm font-serif italic text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                    &ldquo;Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.&rdquo; — Psalm 100:4
                  </p>
                  <p className="text-xs text-stone-500 max-w-lg mx-auto leading-relaxed">
                    Begin by taking a slow breath. Worship God for who He is: holy, almighty, full of grace. Thank Jesus Christ for coming in the flesh, bearing our sins on the cross, and giving us life.
                  </p>
                </div>
              )}

              {prayerSessionStep === 1 && (
                <div className="text-center space-y-3">
                  <span className="text-3xl">🕊️</span>
                  <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Step 2: Confession & Cleansing
                  </h4>
                  <p className="text-sm font-serif italic text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                    &ldquo;If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.&rdquo; — 1 John 1:9
                  </p>
                  <p className="text-xs text-stone-500 max-w-lg mx-auto leading-relaxed">
                    In quietness before God, acknowledge any areas of stumbling, pride, or worry. There is no condemnation in Christ Jesus; His blood cleanses us completely. Receive His peace right now.
                  </p>
                </div>
              )}

              {prayerSessionStep === 2 && (
                <div className="text-center space-y-3">
                  <span className="text-3xl">☀️</span>
                  <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Step 3: Thanksgiving
                  </h4>
                  <p className="text-sm font-serif italic text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                    &ldquo;In every thing give thanks: for this is the will of God in Christ Jesus concerning you.&rdquo; — 1 Thessalonians 5:18
                  </p>
                  <p className="text-xs text-stone-500 max-w-lg mx-auto leading-relaxed">
                    Name 3 specific blessings from today or this past week. Thank the Lord for His breath in your lungs, His daily provision, and His salvation.
                  </p>
                </div>
              )}

              {prayerSessionStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Step 4: Intercession for Your Prayer List
                    </h4>
                    <p className="text-xs text-stone-400">
                      Lifting up your active petitions one by one before the throne
                    </p>
                  </div>

                  {filteredPrayers.filter((p) => !p.isAnswered).length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs">
                      All prayers marked answered! Add more to cycle through them here.
                    </div>
                  ) : (
                    (() => {
                      const activeList = filteredPrayers.filter((p) => !p.isAnswered);
                      const current = activeList[sessionActiveItemIndex % activeList.length];
                      if (!current) return null;

                      return (
                        <div className="bg-amber-50/60 dark:bg-stone-800/80 rounded-2xl p-5 border border-amber-200 dark:border-stone-700 space-y-3 text-center">
                          <div className="text-[11px] uppercase font-bold text-amber-700 dark:text-amber-400">
                            Prayer {((sessionActiveItemIndex % activeList.length) + 1)} of {activeList.length}
                          </div>
                          <h5 className="text-base font-bold text-stone-900 dark:text-stone-100">
                            {current.title}
                          </h5>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-md mx-auto">
                            {current.description}
                          </p>
                          {current.scriptureReference && (
                            <div className="text-xs font-serif italic text-amber-800 dark:text-amber-300">
                              Promise: {current.scriptureReference}
                            </div>
                          )}

                          <div className="pt-3 flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                handlePrayToday(current.id);
                                if (sessionActiveItemIndex < activeList.length - 1) {
                                  setSessionActiveItemIndex((prev) => prev + 1);
                                }
                              }}
                              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current" />
                              <span>Prayed! Next Request →</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-4">
              <button
                disabled={prayerSessionStep === 0}
                onClick={() => setPrayerSessionStep((prev) => (prev > 0 ? ((prev - 1) as any) : 0))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
              >
                ← Back
              </button>

              {prayerSessionStep < 3 ? (
                <button
                  onClick={() => setPrayerSessionStep((prev) => ((prev + 1) as any))}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsPrayerSessionOpen(false);
                    confetti({ particleCount: 50, spread: 60 });
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                >
                  Complete Quiet Time Amen! 🙏
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT S.O.A.P. STUDY NOTE */}
      {/* ========================================================================= */}
      {isAddSoapOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>{editingSoap ? "Edit S.O.A.P. Study Note" : "New S.O.A.P. Study Note"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddSoapOpen(false);
                  setEditingSoap(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                const passage = (form.elements.namedItem("passage") as HTMLInputElement).value;
                const scriptureText = (form.elements.namedItem("scriptureText") as HTMLTextAreaElement).value;
                const observation = (form.elements.namedItem("observation") as HTMLTextAreaElement).value;
                const application = (form.elements.namedItem("application") as HTMLTextAreaElement).value;
                const prayer = (form.elements.namedItem("prayer") as HTMLTextAreaElement).value;
                const tagsRaw = (form.elements.namedItem("tags") as HTMLInputElement).value;
                const tags = tagsRaw
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);

                if (editingSoap) {
                  updateState((prev) => ({
                    ...prev,
                    bibleNotes: (prev.bibleNotes || []).map((n) =>
                      n.id === editingSoap.id
                        ? {
                            ...n,
                            title,
                            passage,
                            scriptureText,
                            observation,
                            application,
                            prayer,
                            tags,
                          }
                        : n
                    ),
                  }));
                } else {
                  const newNote: BibleStudyNote = {
                    id: `soap-${Date.now()}`,
                    title,
                    passage,
                    date: new Date().toISOString().split("T")[0],
                    scriptureText,
                    observation,
                    application,
                    prayer,
                    tags,
                  };
                  updateState((prev) => ({
                    ...prev,
                    bibleNotes: [newNote, ...(prev.bibleNotes || [])],
                  }));
                }

                setIsAddSoapOpen(false);
                setEditingSoap(null);
              }}
              className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Passage Reference *
                  </label>
                  <input
                    name="passage"
                    defaultValue={editingSoap?.passage || ""}
                    required
                    placeholder="e.g. John 1:1-14, Romans 5:8"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Title / Theme *
                  </label>
                  <input
                    name="title"
                    defaultValue={editingSoap?.title || ""}
                    required
                    placeholder="e.g. The Word Was God in the Flesh"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  S — Scripture (The Verse or Passage) *
                </label>
                <textarea
                  name="scriptureText"
                  defaultValue={editingSoap?.scriptureText || ""}
                  required
                  rows={2}
                  placeholder="Paste or write the verses you read today..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  O — Observation (What does the text teach about God/Christ?) *
                </label>
                <textarea
                  name="observation"
                  defaultValue={editingSoap?.observation || ""}
                  required
                  rows={2}
                  placeholder="What is the Holy Spirit emphasizing in this passage?"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  A — Application (How will I live this out today?) *
                </label>
                <textarea
                  name="application"
                  defaultValue={editingSoap?.application || ""}
                  required
                  rows={2}
                  placeholder="How does this truth shape my decisions, attitude, and walk with Christ today?"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  P — Prayer (Praying this truth back to God) *
                </label>
                <textarea
                  name="prayer"
                  defaultValue={editingSoap?.prayer || ""}
                  required
                  rows={2}
                  placeholder="Lord Jesus, thank You for Your Word. Help me..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 italic leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  name="tags"
                  defaultValue={editingSoap?.tags?.join(", ") || ""}
                  placeholder="Grace, Faith, Prayer, Deity of Christ"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSoapOpen(false);
                    setEditingSoap(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingSoap ? "Save Changes" : "Save S.O.A.P. Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
