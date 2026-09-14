import React, { useState } from "react";
import {
  Palette,
  Plus,
  Music,
  PenTool,
  Sparkles,
  ExternalLink,
  Trash2,
  Brush,
  Camera,
  Layers,
  Check,
} from "lucide-react";
import { CreativeHobbyItem, UserLifeOSState } from "../types";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
}

export const CreativeStudio: React.FC<Props> = ({ state, updateState }) => {
  const [filterType, setFilterType] = useState<string>("All");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Hobby Item State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<CreativeHobbyItem["hobbyType"]>("Digital Art & Illustration");
  const [newTools, setNewTools] = useState("Procreate, iPad, Apple Pencil");
  const [newNotes, setNewNotes] = useState("");

  const filteredHobbies = state.creativeHobbies.filter(
    (h) => filterType === "All" || h.hobbyType === filterType
  );

  const handleCreateHobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: CreativeHobbyItem = {
      id: "hobby-" + Date.now(),
      title: newTitle.trim(),
      hobbyType: newType,
      status: "Work in Progress",
      toolsUsed: newTools.split(",").map((t) => t.trim()).filter(Boolean),
      notes: newNotes.trim() || "Creative project exploration.",
      dateStarted: new Date().toISOString().split("T")[0],
    };

    updateState((prev) => ({
      ...prev,
      creativeHobbies: [newItem, ...prev.creativeHobbies],
    }));

    setIsNewModalOpen(false);
    setNewTitle("");
    setNewNotes("");
  };

  const handleDelete = (id: string) => {
    updateState((prev) => ({
      ...prev,
      creativeHobbies: prev.creativeHobbies.filter((h) => h.id !== id),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-fuchsia-500" />
            Creative Studio & Art Hobbies
          </h1>
          <p className="text-xs text-slate-500">
            Nurture your creative side: digital illustrations, music production, writing, 3D and photography.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-3.5 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Creative Piece
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          "All",
          "Digital Art & Illustration",
          "Music & Audio",
          "Writing & Storytelling",
          "3D Modeling & Animation",
          "Game Design",
          "Photography & Video",
        ].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
              filterType === type
                ? "bg-fuchsia-600 text-white font-semibold shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Creative Pieces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHobbies.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300">
                  {item.hobbyType}
                </span>

                <div className="flex items-center gap-1">
                  <select
                    value={item.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as CreativeHobbyItem["status"];
                      updateState((prev) => ({
                        ...prev,
                        creativeHobbies: prev.creativeHobbies.map((h) =>
                          h.id === item.id ? { ...h, status: newStatus } : h
                        ),
                      }));
                    }}
                    className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <option value="Brainstorm">Brainstorm</option>
                    <option value="Work in Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Showcased">Showcased</option>
                  </select>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>

              <div className="flex flex-wrap gap-1 mb-3">
                {item.toolsUsed.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  >
                    🛠️ {tool}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {item.notes}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Started: {item.dateStarted}</span>
              <span className="font-medium text-fuchsia-600 dark:text-fuchsia-400">{item.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Creative Item Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleCreateHobby}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Creative Artwork / Hobby</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Concept Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Alleyway, Ambient Synth EP..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Creative Domain
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Digital Art & Illustration">Digital Art & Illustration</option>
                  <option value="Music & Audio">Music & Audio</option>
                  <option value="Writing & Storytelling">Writing & Storytelling</option>
                  <option value="3D Modeling & Animation">3D Modeling & Animation</option>
                  <option value="Game Design">Game Design</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Crafts & Physical">Crafts & Physical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tools Used (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Procreate, Blender, Ableton, Camera..."
                  value={newTools}
                  onChange={(e) => setNewTools(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Notes & Creative Vision
                </label>
                <textarea
                  rows={3}
                  placeholder="What is the story, color palette, mood, or goal?"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-semibold rounded-xl"
              >
                Save Creative Piece
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
