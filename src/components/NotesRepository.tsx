import React, { useState } from "react";
import {
  FileText,
  Folder,
  Plus,
  Search,
  Pin,
  Sparkles,
  Trash2,
  Edit3,
  Eye,
  Check,
  Tag,
  Loader2,
  Copy,
  FolderPlus,
} from "lucide-react";
import { NoteItem, UserLifeOSState } from "../types";
import { askGeminiAssistant, generateStructuredAI } from "../services/aiService";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  selectedNoteId?: string;
}

export const NotesRepository: React.FC<Props> = ({ state, updateState, selectedNoteId }) => {
  const [activeNoteId, setActiveNoteId] = useState<string>(
    selectedNoteId || (state.notes.length > 0 ? state.notes[0].id : "")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isEditing, setIsEditing] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutputModal, setAiOutputModal] = useState<{ title: string; text: string } | null>(null);

  // New folder input
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const notesList = state.notes || [];
  const activeNote = notesList.find((n) => n.id === activeNoteId) || notesList[0];

  // Derive unique folders & tags
  const folders = Array.from(new Set(notesList.map((n) => n.folder).filter(Boolean)));
  const allTags = Array.from(new Set(notesList.flatMap((n) => n.tags || [])));

  // Filter notes
  const filteredNotes = notesList.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFolder = selectedFolder === "All" || note.folder === selectedFolder;
    const matchesTag = selectedTag === "All" || note.tags.includes(selectedTag);

    return matchesSearch && matchesFolder && matchesTag;
  });

  // Create new note
  const handleCreateNote = (folder: string = "General") => {
    const newNote: NoteItem = {
      id: "note-" + Date.now(),
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing your thoughts, documentation, or code snippets here...",
      folder: folder === "All" ? "General" : folder,
      tags: ["Draft"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      color: "blue",
    };

    updateState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    setActiveNoteId(newNote.id);
    setIsEditing(true);
  };

  // Update active note field
  const handleUpdateNote = (field: keyof NoteItem, value: any) => {
    if (!activeNote) return;
    updateState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === activeNote.id ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n
      ),
    }));
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    updateState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    if (activeNoteId === id) {
      const remaining = state.notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  // AI Actions on Note
  const handleAISummarize = async () => {
    if (!activeNote) return;
    setAiLoading(true);
    const prompt = `Please summarize the following note, extract 3-5 concrete action items or key takeaways, and suggest 3 relevant tags:\n\nTitle: ${activeNote.title}\n\nContent:\n${activeNote.content}`;
    const res = await askGeminiAssistant(prompt);
    setAiLoading(false);
    if (res.text) {
      setAiOutputModal({
        title: `AI Summary & Action Items: "${activeNote.title}"`,
        text: res.text,
      });
    }
  };

  const handleAIGenerateFlashcards = async () => {
    if (!activeNote) return;
    setAiLoading(true);
    const res = await generateStructuredAI<any[]>("flashcards", activeNote.title, { content: activeNote.content });
    setAiLoading(false);
    if (res.data && Array.isArray(res.data)) {
      const newFlashcards = res.data.map((fc: any, i: number) => ({
        id: "fc-ai-" + Date.now() + "-" + i,
        topicId: activeNote.id,
        question: fc.question,
        answer: fc.answer,
        category: activeNote.folder || "General",
        difficulty: fc.difficulty || "Medium",
        timesReviewed: 0,
      }));

      updateState((prev) => ({
        ...prev,
        flashcards: [...prev.flashcards, ...newFlashcards],
      }));

      setAiOutputModal({
        title: "✨ Created Flashcards in Learning Hub!",
        text: `Generated and saved ${newFlashcards.length} spaced-repetition flashcards directly from this note into your Learning & Flashcards repository.`,
      });
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Second Brain & Notes Repository
          </h1>
          <p className="text-xs text-slate-500">
            Structured Markdown notes, cross-device sync, and intelligent AI knowledge extraction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCreateNote(selectedFolder)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Folders Sidebar, Notes List, Active Note Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[680px]">
        {/* Left Sidebar: Folders & Tags (3 cols) */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            {/* Search within notes */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes & tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            {/* Folders List */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                <span>Folders</span>
                <button
                  onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Add Folder"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showNewFolderInput && (
                <div className="mb-2 flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newFolderName.trim()) {
                        handleCreateNote(newFolderName.trim());
                        setNewFolderName("");
                        setShowNewFolderInput(false);
                      }
                    }}
                    className="p-1 bg-indigo-600 text-white rounded-lg text-xs"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedFolder("All")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedFolder === "All"
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-indigo-500" />
                    All Notes
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {state.notes.length}
                  </span>
                </button>

                {folders.map((folder) => {
                  const count = state.notes.filter((n) => n.folder === folder).length;
                  return (
                    <button
                      key={folder}
                      onClick={() => setSelectedFolder(folder)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedFolder === folder
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{folder}</span>
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Cloud */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                Filter by Tag
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedTag("All")}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-all ${
                    selectedTag === "All"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  #all
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-[11px] px-2 py-0.5 rounded-md transition-all ${
                      selectedTag === tag
                        ? "bg-indigo-600 text-white font-semibold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Markdown Supported</span>
            <span>Autosaved</span>
          </div>
        </div>

        {/* Middle Column: Note Cards List (4 cols) */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs overflow-y-auto max-h-[750px] space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notes found in this folder or search.
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-50/90 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-xs"
                      : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isActive ? "text-indigo-950 dark:text-indigo-200" : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {note.title || "Untitled Note"}
                    </h3>
                    {note.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                    {note.content.replace(/^#+\s/gm, "").substring(0, 120)}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                      {note.folder}
                    </span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Note Editor & AI Assistant (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          {activeNote ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Note Header & Actions */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateNote("pinned", !activeNote.pinned)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      activeNote.pinned
                        ? "bg-amber-50 dark:bg-amber-950 border-amber-300 text-amber-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"
                    }`}
                    title="Pin Note"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <select
                    value={activeNote.folder}
                    onChange={(e) => handleUpdateNote("folder", e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {folders.map((f) => (
                      <option key={f} value={f}>
                        📁 {f}
                      </option>
                    ))}
                    {!folders.includes(activeNote.folder) && (
                      <option value={activeNote.folder}>📁 {activeNote.folder}</option>
                    )}
                  </select>
                </div>

                {/* AI & Delete buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleAISummarize}
                    disabled={aiLoading}
                    className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Summarize & Action Items"
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI Summary
                  </button>
                  <button
                    onClick={handleAIGenerateFlashcards}
                    disabled={aiLoading}
                    className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Turn into Flashcards"
                  >
                    + Flashcards
                  </button>
                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Tags Input */}
              <div>
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateNote("title", e.target.value)}
                  placeholder="Note Title..."
                  className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent focus:outline-hidden"
                />
                <div className="flex items-center gap-2 mt-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={activeNote.tags.join(", ")}
                    onChange={(e) =>
                      handleUpdateNote(
                        "tags",
                        e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                      )
                    }
                    placeholder="comma-separated tags (e.g. React, SaaS, Design)..."
                    className="w-full text-xs text-slate-600 dark:text-slate-400 bg-transparent focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Edit / Preview Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 ${
                    isEditing ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 ${
                    !isEditing ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>

              {/* Content Box */}
              {isEditing ? (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote("content", e.target.value)}
                  placeholder="Write in Markdown or plain text..."
                  className="w-full flex-1 min-h-[350px] bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden leading-relaxed resize-none"
                />
              ) : (
                <div className="w-full flex-1 min-h-[350px] bg-slate-50/30 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-y-auto prose dark:prose-invert prose-xs max-w-none text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                  {activeNote.content}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Select or create a note to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Output Modal */}
      {aiOutputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                {aiOutputModal.title}
              </h3>
              <button
                onClick={() => setAiOutputModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed border border-slate-200 dark:border-slate-700">
              {aiOutputModal.text}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiOutputModal.text);
                  alert("Copied AI insights to clipboard!");
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button
                onClick={() => setAiOutputModal(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
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
