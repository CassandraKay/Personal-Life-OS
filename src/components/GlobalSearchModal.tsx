import React, { useState, useEffect } from "react";
import { Search, X, BookOpen, Code, Lock, DollarSign, Palette, FileText, CheckCircle2, ArrowRight, User } from "lucide-react";
import { UserLifeOSState, TabType } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: UserLifeOSState;
  onNavigate: (tab: TabType, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, state, onNavigate }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search through notes, projects, learning, vault, side hustles, hobbies
  const matchingNotes = state.notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q))
  );

  const matchingProjects = state.projects.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.techStack.some((t) => t.toLowerCase().includes(q))
  );

  const matchingLearning = state.learning.filter(
    (l) => l.topic.toLowerCase().includes(q) || l.keyTakeaways.toLowerCase().includes(q)
  );

  const matchingVault = state.vault.filter(
    (v) => v.serviceName.toLowerCase().includes(q) || v.usernameOrEmail.toLowerCase().includes(q)
  );

  const matchingHustles = state.sideHustles.filter(
    (s) => s.title.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q) || s.monetization.toLowerCase().includes(q)
  );

  const profileMatch =
    q &&
    (state.profile.name.toLowerCase().includes(q) ||
      (state.profile.email && state.profile.email.toLowerCase().includes(q)) ||
      (state.profile.emails &&
        state.profile.emails.some((e) =>
          (typeof e === "string" ? e : e.value).toLowerCase().includes(q)
        )) ||
      (state.profile.phone && state.profile.phone.toLowerCase().includes(q)) ||
      (state.profile.phoneNumbers &&
        state.profile.phoneNumbers.some((p) =>
          (typeof p === "string" ? p : p.value).toLowerCase().includes(q)
        )) ||
      (state.profile.streetAddress && state.profile.streetAddress.toLowerCase().includes(q)) ||
      (state.profile.city && state.profile.city.toLowerCase().includes(q)) ||
      (state.profile.title && state.profile.title.toLowerCase().includes(q)) ||
      (state.profile.bio && state.profile.bio.toLowerCase().includes(q)));

  const totalResults =
    (profileMatch ? 1 : 0) +
    matchingNotes.length +
    matchingProjects.length +
    matchingLearning.length +
    matchingVault.length +
    matchingHustles.length;

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search everything: notes, coding projects, accounts, side hustles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden text-base"
          />
          {query && (
            <button
              id="clear-search-btn"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {query && totalResults === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No matches found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or search by tags</p>
            </div>
          ) : (
            <>
              {/* Profile & Identity Match */}
              {profileMatch && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <User className="w-3.5 h-3.5 text-sky-500" />
                    Personal Profile & Identity Card
                  </div>
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800 hover:bg-sky-100 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs">
                        {state.profile.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600">
                          {state.profile.name} {state.profile.preferredName ? `(${state.profile.preferredName})` : ""}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {[state.profile.email, state.profile.phone, state.profile.city].filter(Boolean).join(" • ") || "Personal details & address"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sky-500" />
                  </button>
                </div>
              )}

              {/* Notes */}
              {matchingNotes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Notes ({matchingNotes.length})
                  </div>
                  <div className="space-y-1">
                    {matchingNotes.slice(0, 4).map((note) => (
                      <button
                        key={note.id}
                        onClick={() => {
                          onNavigate("notes", note.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {note.title}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {note.folder} • {note.tags.join(", ")}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {matchingProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <Code className="w-3.5 h-3.5 text-sky-500" />
                    Coding Projects ({matchingProjects.length})
                  </div>
                  <div className="space-y-1">
                    {matchingProjects.slice(0, 3).map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onNavigate("coding", proj.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                            {proj.title}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {proj.category} • {proj.status} • {proj.techStack.join(", ")}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Side Hustles & Business */}
              {matchingHustles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    Side Hustles & Business ({matchingHustles.length})
                  </div>
                  <div className="space-y-1">
                    {matchingHustles.slice(0, 3).map((h) => (
                      <button
                        key={h.id}
                        onClick={() => {
                          onNavigate("finance", h.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {h.title}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">{h.tagline}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning */}
              {matchingLearning.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    Learning & Roadmaps ({matchingLearning.length})
                  </div>
                  <div className="space-y-1">
                    {matchingLearning.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate("learning", item.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                            {item.topic}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {item.category} • {item.progressPct}% complete
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vault */}
              {matchingVault.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    Password Vault ({matchingVault.length})
                  </div>
                  <div className="space-y-1">
                    {matchingVault.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate("vault", item.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                            {item.serviceName}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">{item.usernameOrEmail}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Tip: Press <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700">Ctrl+K</kbd> anywhere</span>
          <span>Personal Life OS</span>
        </div>
      </div>
    </div>
  );
};
