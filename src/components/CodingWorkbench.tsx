import React, { useState } from "react";
import {
  Code,
  Plus,
  Github,
  ExternalLink,
  CheckCircle2,
  Circle,
  Sparkles,
  Copy,
  Trash2,
  Terminal,
  FolderGit2,
  Check,
  Edit2,
  Loader2,
  Cpu,
  Target,
  Globe,
  Play,
} from "lucide-react";
import { CanvasCardItem, ProjectItem, ProjectTask, UserLifeOSState } from "../types";
import { askGeminiAssistant } from "../services/aiService";
import { CanvasCodeSandbox } from "./CanvasCodeSandbox";
import { CanvasWebEmbed } from "./CanvasWebEmbed";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  selectedProjectId?: string;
}

interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
}

const DEFAULT_SNIPPETS: CodeSnippet[] = [
  {
    id: "snip-1",
    title: "TypeScript Safe Fetch Wrapper",
    language: "typescript",
    code: `export async function safeFetch<T>(url: string, init?: RequestInit): Promise<{ data: T | null; error?: string }> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(\`HTTP error \${res.status}\`);
    const data = await res.json();
    return { data: data as T };
  } catch (err: any) {
    return { data: null, error: err.message || 'Fetch failed' };
  }
}`,
    tags: ["Utility", "TypeScript", "Async"],
  },
  {
    id: "snip-2",
    title: "Tailwind Glassmorphic Card Class",
    language: "css",
    code: `/* Modern High-Contrast Neutral Card */
.pro-card {
  background-color: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(51, 65, 85, 0.8);
  border-radius: 1rem;
  backdrop-filter: blur(8px);
}`,
    tags: ["Tailwind", "CSS", "UI"],
  },
];

export const CodingWorkbench: React.FC<Props> = ({ state, updateState, selectedProjectId }) => {
  const [activeTab, setActiveTab] = useState<"projects" | "snippets" | "sandbox">("projects");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isNewProjectModal, setIsNewProjectModal] = useState(false);

  // Workbench Code Sandbox & Web Embed state
  const [sandboxSubTab, setSandboxSubTab] = useState<"sandbox" | "embed">("sandbox");
  const [workbenchSandboxCard, setWorkbenchSandboxCard] = useState<CanvasCardItem>(() => ({
    id: "workbench-sandbox",
    type: "code_sandbox",
    x: 0,
    y: 0,
    zIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const [workbenchEmbedCard, setWorkbenchEmbedCard] = useState<CanvasCardItem>(() => ({
    id: "workbench-embed",
    type: "web_embed",
    x: 0,
    y: 0,
    zIndex: 1,
    embedUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    embedType: "youtube",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Snippets state (persisted locally)
  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    try {
      const saved = localStorage.getItem("omnilife_code_snippets");
      return saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
    } catch {
      return DEFAULT_SNIPPETS;
    }
  });
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(snippets[0] || null);
  const [newSnippetModal, setNewSnippetModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const saveSnippets = (updated: CodeSnippet[]) => {
    setSnippets(updated);
    localStorage.setItem("omnilife_code_snippets", JSON.stringify(updated));
  };

  // Filtered projects
  const filteredProjects = state.projects.filter(
    (p) => statusFilter === "All" || p.status === statusFilter
  );

  // New Project Form Data
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<ProjectItem["category"]>("Full Stack");
  const [newTechStack, setNewTechStack] = useState("React, TypeScript, Tailwind");
  const [newRepo, setNewRepo] = useState("");
  const [newLive, setNewLive] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProject: ProjectItem = {
      id: "proj-" + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || "No description provided yet.",
      category: newCategory,
      status: "Planning",
      techStack: newTechStack.split(",").map((s) => s.trim()).filter(Boolean),
      repoUrl: newRepo.trim(),
      liveUrl: newLive.trim(),
      architectureNotes: "Client React SPA + Server Express API",
      tasks: [
        { id: "t1", title: "Set up project repository & initialize dependencies", completed: true },
        { id: "t2", title: "Build core feature & database model", completed: false },
        { id: "t3", title: "Test responsive layout & edge cases", completed: false },
        { id: "t4", title: "Deploy to production & verify live URL", completed: false },
      ],
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }));

    setIsNewProjectModal(false);
    setNewTitle("");
    setNewDesc("");
    setNewRepo("");
    setNewLive("");
  };

  // Toggle task inside project
  const toggleProjectTask = (projId: string, taskId: string) => {
    updateState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  // Add task to project
  const handleAddProjectTask = (projId: string, taskTitle: string) => {
    if (!taskTitle.trim()) return;
    updateState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projId) return p;
        return {
          ...p,
          tasks: [...p.tasks, { id: "t-" + Date.now(), title: taskTitle.trim(), completed: false }],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      updateState((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    }
  };

  // AI Architect Advice
  const handleAIArchitectAdvice = async (proj: ProjectItem) => {
    setAiLoading(true);
    const prompt = `Act as a principal software architect. Review this coding project and give me a crisp 3-part roadmap:
Project: "${proj.title}"
Category: ${proj.category}
Status: ${proj.status}
Tech Stack: ${proj.techStack.join(", ")}
Description: ${proj.description}
Current Milestones: ${proj.tasks.map((t) => `${t.title} [${t.completed ? "DONE" : "PENDING"}]`).join("; ")}

Provide:
1. 🏗️ Scalable Architecture & Data Flow recommendations
2. 🚀 The next 3 immediate coding tasks to ship an MVP
3. ⚠️ Common pitfalls or edge cases to avoid with this tech stack`;

    const res = await askGeminiAssistant(prompt);
    setAiLoading(false);
    if (res.text) {
      setAiOutput(res.text);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-sky-500" />
            Coding Projects & Tech Workbench
          </h1>
          <p className="text-xs text-slate-500">
            Track software builds, architecture specs, code milestones, and reusable snippet vaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "projects"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Projects ({state.projects.length})
            </button>
            <button
              onClick={() => setActiveTab("snippets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "snippets"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Snippets ({snippets.length})
            </button>
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === "sandbox"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sandbox & Embeds</span>
            </button>
          </div>

          {activeTab === "projects" && (
            <button
              onClick={() => setIsNewProjectModal(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
          {activeTab === "snippets" && (
            <button
              onClick={() => setNewSnippetModal(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Snippet
            </button>
          )}
        </div>
      </div>

      {activeTab === "projects" && (
        <>
          {/* Status Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["All", "Idea", "Planning", "In Development", "Beta", "Launched", "Paused"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  statusFilter === status
                    ? "bg-slate-900 dark:bg-sky-500 text-white font-semibold"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => {
              const completedTasks = proj.tasks.filter((t) => t.completed).length;
              const totalTasks = proj.tasks.length;
              const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div>
                    {/* Header: Category & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                          {proj.category}
                        </span>
                        <select
                          value={proj.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as ProjectItem["status"];
                            updateState((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p) =>
                                p.id === proj.id ? { ...p, status: newStatus } : p
                              ),
                            }));
                          }}
                          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <option value="Idea">Idea</option>
                          <option value="Planning">Planning</option>
                          <option value="In Development">In Development</option>
                          <option value="Beta">Beta</option>
                          <option value="Launched">Launched</option>
                          <option value="Paused">Paused</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAIArchitectAdvice(proj)}
                          disabled={aiLoading}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-xs"
                          title="AI Architecture Advisor"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{proj.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{proj.description}</p>

                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    {(proj.repoUrl || proj.liveUrl) && (
                      <div className="flex items-center gap-3 mb-4 text-xs font-medium">
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                          >
                            <Github className="w-3.5 h-3.5" /> Code Repo
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        )}
                      </div>
                    )}

                    {/* Milestones & Tasks */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Milestone Progress</span>
                        <span>{completedTasks}/{totalTasks} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>

                      <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto">
                        {proj.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 group"
                          >
                            <button
                              type="button"
                              onClick={() => toggleProjectTask(proj.id, task.id)}
                              className="flex items-center gap-2 text-left flex-1 min-w-0"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span
                                className={`text-xs truncate ${
                                  task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {task.title}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateState((prev) => ({
                                  ...prev,
                                  profile: {
                                    ...prev.profile,
                                    dailyGoalSource: "coding",
                                  },
                                  projects: prev.projects.map((p) => ({
                                    ...p,
                                    tasks: p.tasks.map((t) => ({
                                      ...t,
                                      isDailyGoal: p.id === proj.id && t.id === task.id ? !t.isDailyGoal : false,
                                    })),
                                  })),
                                }));
                              }}
                              className={`p-1 rounded-md text-[11px] transition-all flex items-center gap-1 shrink-0 ${
                                task.isDailyGoal
                                  ? "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 font-semibold"
                                  : "text-slate-400 hover:text-sky-500 opacity-0 group-hover:opacity-100"
                              }`}
                              title={task.isDailyGoal ? "Current Daily Goal on CommandCenter" : "Set as Daily Goal on CommandCenter"}
                            >
                              <Target className="w-3.5 h-3.5" />
                              {task.isDailyGoal && <span className="text-[10px]">Daily Goal</span>}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add task inline */}
                      <div className="pt-2">
                        <input
                          type="text"
                          placeholder="+ Add milestone (press Enter)..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                              handleAddProjectTask(proj.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "snippets" && (
        /* Snippets Vault View */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[550px]">
          {/* Left: Snippets List (4 cols) */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs max-h-[600px] overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Saved Snippets
            </div>
            {snippets.map((snip) => (
              <div
                key={snip.id}
                onClick={() => setSelectedSnippet(snip)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedSnippet?.id === snip.id
                    ? "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800"
                    : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/70 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {snip.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-slate-600 dark:text-slate-400">
                    {snip.language}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  {snip.tags.map((t) => (
                    <span key={t} className="text-[10px] text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Code Viewer & AI Optimizer (8 cols) */}
          <div className="md:col-span-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
            {selectedSnippet ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedSnippet.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-sky-400">{selectedSnippet.language}</span>
                      <span>•</span>
                      <span>{selectedSnippet.tags.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setAiLoading(true);
                        const prompt = `Analyze, optimize, and explain this ${selectedSnippet.language} code snippet. Provide bullet points on improvements, potential edge cases, and a refactored version:\n\n${selectedSnippet.code}`;
                        const res = await askGeminiAssistant(prompt);
                        setAiLoading(false);
                        if (res.text) setAiOutput(res.text);
                      }}
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      AI Code Review
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSnippet.code);
                        setCopiedId(selectedSnippet.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      {copiedId === selectedSnippet.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === selectedSnippet.id ? "Copied!" : "Copy Code"}
                    </button>
                    <button
                      onClick={() => {
                        const remaining = snippets.filter((s) => s.id !== selectedSnippet.id);
                        saveSnippets(remaining);
                        setSelectedSnippet(remaining[0] || null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                      title="Delete Snippet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-slate-900/90 rounded-xl p-4 font-mono text-xs text-sky-200 overflow-x-auto leading-relaxed border border-slate-800/80">
                  <pre>{selectedSnippet.code}</pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">Select or add a code snippet</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "sandbox" && (
        /* Interactive Code Sandbox & Embed Playground */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {sandboxSubTab === "sandbox" ? "Live HTML, CSS & JavaScript Playground" : "External Web & Media Embedder"}
                </h2>
                <p className="text-xs text-slate-500">
                  {sandboxSubTab === "sandbox"
                    ? "Safely isolated sandbox iframe running live client code with instant split-view reload."
                    : "Embed YouTube video tutorials, Spotify lofi music playlists, CodePens, or web reference tools."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setSandboxSubTab("sandbox")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sandboxSubTab === "sandbox"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code Sandbox</span>
              </button>
              <button
                onClick={() => setSandboxSubTab("embed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sandboxSubTab === "embed"
                    ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Media & Web Embed</span>
              </button>
            </div>
          </div>

          <div className="h-[620px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            {sandboxSubTab === "sandbox" ? (
              <CanvasCodeSandbox
                card={workbenchSandboxCard}
                onUpdate={(updates) => setWorkbenchSandboxCard((prev) => ({ ...prev, ...updates }))}
              />
            ) : (
              <CanvasWebEmbed
                card={workbenchEmbedCard}
                onUpdate={(updates) => setWorkbenchEmbedCard((prev) => ({ ...prev, ...updates }))}
              />
            )}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleCreateProject}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-sky-500" /> Create Coding Project
              </h3>
              <button
                type="button"
                onClick={() => setIsNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Invoice Generator, SaaS Boilerplate..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Full Stack">Full Stack</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend/API">Backend/API</option>
                  <option value="Mobile">Mobile</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Creative/Game">Creative/Game</option>
                  <option value="Tool/Script">Tool/Script</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Goal
                </label>
                <textarea
                  rows={2}
                  placeholder="What does this software solve or do?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind, Node, Postgres..."
                  value={newTechStack}
                  onChange={(e) => setNewTechStack(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://myapp.com"
                    value={newLive}
                    onChange={(e) => setNewLive(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewProjectModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Snippet Modal */}
      {newSnippetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Save Code Snippet</h3>
            {/* simple form */}
            <input
              id="snip-title-input"
              type="text"
              placeholder="Snippet Title..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
            />
            <input
              id="snip-lang-input"
              type="text"
              placeholder="Language (e.g. typescript, python, css)..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
            />
            <textarea
              id="snip-code-input"
              rows={6}
              placeholder="Paste code snippet here..."
              className="w-full bg-slate-900 text-sky-200 font-mono rounded-xl p-3 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNewSnippetModal(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const title = (document.getElementById("snip-title-input") as HTMLInputElement).value;
                  const lang = (document.getElementById("snip-lang-input") as HTMLInputElement).value || "typescript";
                  const code = (document.getElementById("snip-code-input") as HTMLTextAreaElement).value;
                  if (title && code) {
                    const newSnip: CodeSnippet = {
                      id: "snip-" + Date.now(),
                      title,
                      language: lang,
                      code,
                      tags: [lang],
                    };
                    const updated = [newSnip, ...snippets];
                    saveSnippets(updated);
                    setSelectedSnippet(newSnip);
                    setNewSnippetModal(false);
                  }
                }}
                className="px-4 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Advisor Modal */}
      {aiOutput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                AI Architecture & Tech Roadmap
              </h3>
              <button onClick={() => setAiOutput(null)} className="text-slate-400 text-xs">
                ✕
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed border border-slate-200 dark:border-slate-700">
              {aiOutput}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setAiOutput(null)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
