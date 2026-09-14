import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  Code,
  DollarSign,
  Heart,
  BookOpen,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { UserLifeOSState } from "../types";
import { askGeminiAssistant } from "../services/aiService";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  {
    icon: Code,
    label: "Debug Code Architecture",
    prompt: "I am building a web app. Help me plan a clean modular component architecture with TypeScript and minimal state complexity.",
  },
  {
    icon: DollarSign,
    label: "3 Side Hustles for Tonight",
    prompt: "Given my background in coding and digital art, suggest 3 high-profit micro digital products or freelance gigs I can launch within 48 hours.",
  },
  {
    icon: Heart,
    label: "ADHD Focus Routine",
    prompt: "I feel overwhelmed with too many tasks across coding, life, and finances. Give me a 3-step dopamine-friendly focus protocol for the next 2 hours.",
  },
  {
    icon: BookOpen,
    label: "Study Flashcard Concept",
    prompt: "Explain how React reconciler fiber architecture works like I'm 12, with a memorable analogy.",
  },
];

export const AICopilot: React.FC<Props> = ({ state, updateState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "assistant",
      text: `Hello ${state.profile.name || "friend"}! I am your OmniLife AI Strategist & Tech Co-Pilot powered by Gemini 3.7 Flash. How can I help you organize your coding, side hustles, learning, or mental clarity today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Context aware system context
    const contextPrompt = `You are OmniLife AI Co-Pilot, an empathetic, hyper-competent personal advisor for a developer and creator.
User context:
- Name: ${state.profile.name}
- Coding Projects: ${state.projects.map((p) => `${p.title} (${p.status})`).join(", ")}
- Monthly Side Revenue Target: $${state.profile.monthlyRevenueTarget}
- Current Side Hustles: ${state.sideHustles.map((h) => h.title).join(", ")}
- Active Notes: ${state.notes.length} notes in repository

User Question / Request:
"${query.trim()}"

Provide structured, actionable, and encouraging advice with code snippets, markdown formatting, or numbered steps where appropriate.`;

    const res = await askGeminiAssistant(contextPrompt);
    setIsLoading(false);

    const botMsg: ChatMessage = {
      id: "a-" + Date.now(),
      sender: "assistant",
      text: res.text || "I ran into a temporary issue reaching the AI engine. Please check your connection and try again.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Gemini 3.7 Life Strategist & Co-Pilot
            </h1>
            <p className="text-xs text-slate-500">
              Context-aware assistant integrated with your projects, finances, learning roadmaps and notes.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: "m-reset",
                sender: "assistant",
                text: "Chat cleared! How can I assist your productivity or mindset today?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title="Clear Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {PRESET_PROMPTS.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(preset.prompt)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0 transition-all shadow-2xs"
            >
              <Icon className="w-3.5 h-3.5 text-sky-500" />
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((msg) => {
          const isBot = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? "justify-start" : "justify-end"}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                  isBot
                    ? "bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    : "bg-sky-600 text-white shadow-xs"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div className="flex items-center justify-between text-[10px] opacity-60 pt-1">
                  <span>{msg.timestamp}</span>
                  {isBot && (
                    <button
                      onClick={() => copyMessage(msg.text, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-sky-500"
                      title="Copy Answer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl text-xs text-slate-500 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
              Gemini 3.7 Flash is synthesizing your personalized strategy...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center gap-2 shadow-sm shrink-0">
        <input
          type="text"
          placeholder="Ask for coding architecture, hustle validation, mind decluttering, or study tips..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
