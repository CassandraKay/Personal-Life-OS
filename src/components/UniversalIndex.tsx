import React, { useState, useMemo } from "react";
import {
  ListTree,
  Search,
  ArrowUpRight,
  Sparkles,
  StickyNote,
  Heart,
  Calendar as CalendarIcon,
  Code2,
  DollarSign,
  Lock,
  BookOpen,
  Palette,
  Film,
  Music,
  CheckCircle2,
  Filter,
  Plus,
  Tag,
  Clock,
  Layers,
  ExternalLink,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { UserLifeOSState, TabType } from "../types";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  onNavigateToTab: (tab: TabType, targetId?: string) => void;
}

interface IndexEntry {
  id: string;
  sourceModule: TabType;
  categoryLabel: string;
  typeIcon: React.ReactNode;
  title: string;
  snippet?: string;
  dateOrMeta?: string;
  tags?: string[];
  badgeColor: string;
}

export const UniversalIndex: React.FC<Props> = ({ state, updateState, onNavigateToTab }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "alpha" | "module">("recent");
  const [groupByModule, setGroupByModule] = useState(true);

  // Automatically aggregate all content across the entire OS into a single living index
  const allIndexEntries: IndexEntry[] = useMemo(() => {
    const list: IndexEntry[] = [];

    // 1. Chaotic Corner Cards
    (state.canvasCards || []).forEach((card, idx) => {
      let icon = <StickyNote className="w-4 h-4 text-amber-500" />;
      let catLabel = "Canvas Post-It";
      let badgeCol = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

      if (card.type === "journal") {
        icon = <Heart className="w-4 h-4 text-rose-500" />;
        catLabel = card.journalShape === "flower" ? "Blossom Journal" : "Heart Journal";
        badgeCol = "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
      } else if (card.type === "image") {
        icon = <Film className="w-4 h-4 text-sky-500" />;
        catLabel = "Canvas Photo";
        badgeCol = "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
      } else if (card.type === "audio") {
        icon = <Music className="w-4 h-4 text-indigo-500" />;
        catLabel = "Canvas Audio Tune";
        badgeCol = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300";
      } else if (card.type === "video") {
        icon = <Film className="w-4 h-4 text-emerald-500" />;
        catLabel = "Canvas Video Clip";
        badgeCol = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
      } else if (card.type === "event") {
        icon = <CalendarIcon className="w-4 h-4 text-teal-500" />;
        catLabel = "Canvas Appointment";
        badgeCol = "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300";
      } else if (card.type === "text_box") {
        catLabel = "Canvas Text Box";
      }

      list.push({
        id: card.id || `canvas-${idx}`,
        sourceModule: "canvas",
        categoryLabel: catLabel,
        typeIcon: icon,
        title: card.title || card.stickerEmoji || "Untitled Canvas Item",
        snippet: card.isPrivate ? "🔒 [Private Sensitive Entry]" : card.content || card.mediaCaption || "",
        dateOrMeta: card.timestamp || card.updatedAt?.split("T")[0] || "Canvas Item",
        badgeColor: badgeCol,
      });
    });

    // 2. Notes & Documents
    (state.notes || []).forEach((note, idx) => {
      list.push({
        id: note.id || `note-${idx}`,
        sourceModule: "notes",
        categoryLabel: `Notes / ${note.folder || "Unsorted"}`,
        typeIcon: <StickyNote className="w-4 h-4 text-blue-500" />,
        title: note.title,
        snippet: note.content.slice(0, 140).replace(/#/g, ""),
        dateOrMeta: note.updatedAt?.split("T")[0] || note.createdAt?.split("T")[0],
        tags: note.tags,
        badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      });
    });

    // 3. Calendar Events & Holidays
    (state.calendarEvents || []).forEach((evt, idx) => {
      list.push({
        id: evt.id || `event-${idx}`,
        sourceModule: "calendar",
        categoryLabel: evt.isHoliday ? "Holiday Celebration" : "Calendar Event",
        typeIcon: <CalendarIcon className="w-4 h-4 text-emerald-500" />,
        title: evt.title,
        snippet: evt.description || (evt.location ? `📍 ${evt.location}` : ""),
        dateOrMeta: `${evt.date}${evt.time ? ` at ${evt.time}` : ""}`,
        badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      });
    });

    // 4. Projects & Coding Workbench
    (state.projects || []).forEach((proj, idx) => {
      list.push({
        id: proj.id || `proj-${idx}`,
        sourceModule: "coding",
        categoryLabel: `Project / ${proj.status}`,
        typeIcon: <Code2 className="w-4 h-4 text-purple-500" />,
        title: proj.title,
        snippet: proj.description,
        dateOrMeta: proj.targetLaunchDate ? `Target: ${proj.targetLaunchDate}` : undefined,
        tags: proj.techStack,
        badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
      });
    });

    // 5. Side Hustles
    (state.sideHustles || []).forEach((hustle, idx) => {
      list.push({
        id: hustle.id || `hustle-${idx}`,
        sourceModule: "finance",
        categoryLabel: `Side Hustle / ${hustle.status}`,
        typeIcon: <DollarSign className="w-4 h-4 text-emerald-600" />,
        title: hustle.title,
        snippet: hustle.description,
        dateOrMeta: hustle.targetMonthlyRevenue ? `Target: $${hustle.targetMonthlyRevenue}/mo` : undefined,
        tags: hustle.monetizationModel ? [hustle.monetizationModel] : undefined,
        badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      });
    });

    // 6. Learning & Flashcard Decks
    (state.learning || []).forEach((learn, idx) => {
      list.push({
        id: learn.id || `learn-${idx}`,
        sourceModule: "learning",
        categoryLabel: `Learning / ${learn.category}`,
        typeIcon: <BookOpen className="w-4 h-4 text-amber-600" />,
        title: learn.title,
        snippet: learn.notes?.slice(0, 120),
        dateOrMeta: `${learn.progressPercent || 0}% Complete`,
        tags: learn.keyConcepts,
        badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      });
    });

    // 7. Creative Studio Hobbies
    (state.creativeHobbies || []).forEach((hobby, idx) => {
      list.push({
        id: hobby.id || `hobby-${idx}`,
        sourceModule: "creative",
        categoryLabel: `Creative / ${hobby.category}`,
        typeIcon: <Palette className="w-4 h-4 text-pink-500" />,
        title: hobby.name,
        snippet: hobby.description,
        dateOrMeta: `Current: ${hobby.currentProject || "Active"}`,
        tags: hobby.favoriteMediums,
        badgeColor: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
      });
    });

    // 8. Encrypted Vault Accounts
    (state.vault || []).forEach((item, idx) => {
      list.push({
        id: item.id || `vault-${idx}`,
        sourceModule: "vault",
        categoryLabel: `Vault / ${item.category}`,
        typeIcon: <Lock className="w-4 h-4 text-rose-500" />,
        title: item.serviceName,
        snippet: item.usernameOrEmail ? `User: ${item.usernameOrEmail}` : "Encrypted Credentials",
        dateOrMeta: item.lastUpdated?.split("T")[0],
        tags: item.tags,
        badgeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      });
    });

    // 9. Media Assets
    (state.mediaAssets || []).forEach((media, idx) => {
      list.push({
        id: media.id || `media-${idx}`,
        sourceModule: "media",
        categoryLabel: `Media / ${media.type}`,
        typeIcon: <Film className="w-4 h-4 text-cyan-500" />,
        title: media.title,
        snippet: media.description,
        dateOrMeta: media.fileSize ? `${(media.fileSize / 1024).toFixed(0)} KB` : undefined,
        tags: media.tags,
        badgeColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
      });
    });

    // 10. Prayers & Praise Reports
    (state.prayers || []).forEach((prayer, idx) => {
      list.push({
        id: prayer.id || `prayer-${idx}`,
        sourceModule: "bible_study",
        categoryLabel: prayer.isAnswered ? "Answered Praise Report" : `Prayer / ${prayer.category}`,
        typeIcon: <Heart className="w-4 h-4 text-rose-500" />,
        title: prayer.title,
        snippet: prayer.description,
        dateOrMeta: prayer.isAnswered ? `Answered: ${prayer.dateAnswered}` : `Prayed ${prayer.timesPrayed || 0}x`,
        tags: prayer.scriptureReference ? [prayer.scriptureReference] : undefined,
        badgeColor: prayer.isAnswered
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      });
    });

    // 11. S.O.A.P. Bible Study Notes
    (state.bibleNotes || []).forEach((note, idx) => {
      list.push({
        id: note.id || `note-soap-${idx}`,
        sourceModule: "bible_study",
        categoryLabel: `Bible Study / ${note.passage}`,
        typeIcon: <BookOpen className="w-4 h-4 text-amber-600" />,
        title: note.title,
        snippet: `Observation: ${note.observation}`,
        dateOrMeta: note.date,
        tags: note.tags,
        badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      });
    });

    return list;
  }, [state]);

  // Filter and Search logic
  const filteredEntries = useMemo(() => {
    return allIndexEntries.filter((entry) => {
      if (filterModule !== "all" && entry.sourceModule !== filterModule) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(q);
        const matchSnippet = (entry.snippet || "").toLowerCase().includes(q);
        const matchCat = entry.categoryLabel.toLowerCase().includes(q);
        const matchTags = (entry.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchSnippet || matchCat || matchTags;
      }
      return true;
    });
  }, [allIndexEntries, filterModule, searchQuery]);

  // Sorted entries
  const sortedEntries = useMemo(() => {
    const list = [...filteredEntries];
    if (sortBy === "alpha") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "module") {
      list.sort((a, b) => a.sourceModule.localeCompare(b.sourceModule));
    }
    return list;
  }, [filteredEntries, sortBy]);

  // Grouped by Module
  const groupedSections = useMemo(() => {
    const map: Record<string, IndexEntry[]> = {};
    sortedEntries.forEach((entry) => {
      if (!map[entry.sourceModule]) {
        map[entry.sourceModule] = [];
      }
      map[entry.sourceModule].push(entry);
    });
    return map;
  }, [sortedEntries]);

  const MODULE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    canvas: { label: "🎨 Chaotic Corner Creations", icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    notes: { label: "📝 Notes & Knowledge Base", icon: <StickyNote className="w-4 h-4 text-blue-500" /> },
    calendar: { label: "📅 Calendar & Appointments", icon: <CalendarIcon className="w-4 h-4 text-emerald-500" /> },
    coding: { label: "💻 Projects & Coding Workbench", icon: <Code2 className="w-4 h-4 text-purple-500" /> },
    finance: { label: "💡 Side Hustles & Finances", icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
    learning: { label: "📚 Learning Hub & Flashcards", icon: <BookOpen className="w-4 h-4 text-amber-600" /> },
    creative: { label: "🎨 Creative Studio & Hobbies", icon: <Palette className="w-4 h-4 text-pink-500" /> },
    vault: { label: "🔐 Encrypted Password Vault", icon: <Lock className="w-4 h-4 text-rose-500" /> },
    media: { label: "🖼️ Media Vault & File Assets", icon: <Film className="w-4 h-4 text-cyan-500" /> },
    bible_study: { label: "✝️ Bible Study & Prayer", icon: <BookOpen className="w-4 h-4 text-amber-600" /> },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ListTree className="w-5 h-5 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Universal Index & Table of Contents
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Never-ending dynamic table of contents. As you add notes, canvas cards, calendar dates, projects, or hustles anywhere in the app, they appear here automatically.
          </p>
        </div>

        {/* Live Counter Badge */}
        <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-4 py-2 rounded-2xl">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
            {allIndexEntries.length} Living Items Cataloged
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all titles, contents, tags, and categories in your entire OS..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Grouping and Sorting options */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="alpha">Sort: Alphabetical (A-Z)</option>
              <option value="module">Sort: By Category</option>
            </select>

            <button
              onClick={() => setGroupByModule(!groupByModule)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                groupByModule
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              {groupByModule ? "Grouped" : "Flat Feed"}
            </button>
          </div>
        </div>

        {/* Module Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setFilterModule("all")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterModule === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Modules ({allIndexEntries.length})
          </button>
          {Object.entries(MODULE_LABELS).map(([modKey, modMeta]) => {
            const count = allIndexEntries.filter((i) => i.sourceModule === modKey).length;
            if (count === 0) return null;
            return (
              <button
                key={`filter-chip-${modKey}`}
                onClick={() => setFilterModule(modKey)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterModule === modKey
                    ? "bg-sky-600 text-white shadow-2xs"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{modMeta.label.split(" ")[0]}</span>
                <span>{modMeta.label.split(" ").slice(1).join(" ")}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Living Index Items Feed */}
      {sortedEntries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Search className="w-8 h-8 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No items matched "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search keywords or clearing module filters.
          </p>
        </div>
      ) : groupByModule && filterModule === "all" ? (
        /* Grouped Sections */
        <div className="space-y-6">
          {(Object.entries(groupedSections) as [string, IndexEntry[]][]).map(([modKey, entries]) => {
            const meta = MODULE_LABELS[modKey] || { label: modKey, icon: <Layers className="w-4 h-4" /> };

            return (
              <div key={`group-section-${modKey}`} className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {meta.icon}
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {meta.label}
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {entries.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateToTab(modKey as TabType)}
                    className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {entries.map((entry, idx) =>
                    renderItemCard(entry, `grp-${modKey}-${entry.sourceModule}-${entry.id}-${idx}`)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedEntries.map((entry, idx) =>
            renderItemCard(entry, `flat-${entry.sourceModule}-${entry.id}-${idx}`)
          )}
        </div>
      )}
    </div>
  );

  function renderItemCard(entry: IndexEntry, customKey?: string) {
    return (
      <div
        key={customKey || `${entry.sourceModule}-${entry.id}`}
        onClick={() => onNavigateToTab(entry.sourceModule, entry.id)}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entry.badgeColor}`}
            >
              {entry.categoryLabel}
            </span>

            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {entry.title}
          </h3>

          {entry.snippet && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {entry.snippet}
            </p>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {entry.tags.filter(Boolean).slice(0, 3).map((t, tIdx) => (
                <span
                  key={`${entry.sourceModule}-${entry.id}-tag-${t}-${tIdx}`}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>{entry.dateOrMeta || "Cataloged item"}</span>
          <span className="font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
            Jump to item →
          </span>
        </div>
      </div>
    );
  }
};
