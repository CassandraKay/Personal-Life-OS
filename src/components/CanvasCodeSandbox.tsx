import React, { useState, useMemo } from "react";
import { Play, RotateCcw, Code, Eye, Sparkles, Copy, Check } from "lucide-react";
import { CanvasCardItem } from "../types";

interface Props {
  card: CanvasCardItem;
  onUpdate: (updates: Partial<CanvasCardItem>) => void;
  isLocked?: boolean;
}

const DEFAULT_HTML = `<div class="container">
  <h1>✨ Welcome to My Sandbox!</h1>
  <p>Type HTML, CSS, and JS to build anything live.</p>
  <button id="clickBtn" class="btn">Click Me! 🎉</button>
  <div id="counter">Clicks: 0</div>
</div>`;

const DEFAULT_CSS = `body {
  margin: 0;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

.container {
  text-align: center;
  background: #1e293b;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  border: 1px solid #334155;
  max-width: 320px;
  width: 100%;
}

h1 {
  font-size: 1.25rem;
  margin-top: 0;
  color: #38bdf8;
}

p {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.4;
}

.btn {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  margin-top: 12px;
}

.btn:active {
  transform: scale(0.96);
}

#counter {
  margin-top: 14px;
  font-size: 0.9rem;
  color: #a7f3d0;
  font-weight: bold;
}`;

const DEFAULT_JS = `let count = 0;
const btn = document.getElementById('clickBtn');
const counter = document.getElementById('counter');

btn.addEventListener('click', () => {
  count++;
  counter.textContent = 'Clicks: ' + count;
  btn.style.transform = 'scale(1.08)';
  setTimeout(() => {
    btn.style.transform = 'scale(1)';
  }, 120);
});`;

const PRESETS = [
  {
    name: "Interactive Counter",
    html: DEFAULT_HTML,
    css: DEFAULT_CSS,
    js: DEFAULT_JS,
  },
  {
    name: "Neon Glow Card",
    html: `<div class="neon-box">
  <h2>🌟 Neon Pulse</h2>
  <p>Glowing box with pure CSS animation</p>
</div>`,
    css: `body {
  margin: 0;
  background: #09090b;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: system-ui;
}
.neon-box {
  padding: 28px 36px;
  border: 2px solid #06b6d4;
  border-radius: 18px;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.2);
  text-align: center;
  color: #e0f2fe;
}
h2 { margin: 0 0 8px; color: #38bdf8; text-shadow: 0 0 10px #38bdf8; }
p { margin: 0; color: #94a3b8; font-size: 0.85rem; }`,
    js: `// Pure CSS animation`,
  },
  {
    name: "Bouncing Ball",
    html: `<div class="court">
  <div id="ball"></div>
</div>`,
    css: `body { margin: 0; background: #111827; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.court { width: 260px; height: 260px; border-bottom: 4px solid #10b981; position: relative; }
#ball {
  width: 44px;
  height: 44px;
  background: radial-gradient(circle at 30% 30%, #f43f5e, #881337);
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  left: 108px;
  animation: bounce 0.9s infinite alternate ease-in;
}
@keyframes bounce {
  0% { bottom: 0; height: 32px; border-radius: 50% 50% 40% 40%; }
  25% { height: 44px; border-radius: 50%; }
  100% { bottom: 180px; }
}`,
    js: ``,
  },
];

export const CanvasCodeSandbox: React.FC<Props> = ({ card, onUpdate, isLocked }) => {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js" | "split" | "preview">(
    (card.sandboxActiveTab as any) || "split"
  );
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const html = card.sandboxHtml ?? DEFAULT_HTML;
  const css = card.sandboxCss ?? DEFAULT_CSS;
  const js = card.sandboxJs ?? DEFAULT_JS;

  const srcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
  }, [html, css, js, refreshKey]);

  const handleCopyAll = () => {
    const combined = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JavaScript\n${js}`;
    navigator.clipboard.writeText(combined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApplyPreset = (idx: number) => {
    const preset = PRESETS[idx];
    if (!preset) return;
    onUpdate({
      sandboxHtml: preset.html,
      sandboxCss: preset.css,
      sandboxJs: preset.js,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-700/80 select-none">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveTab("split")}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "split"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Split Editor & Live Preview"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Split</span>
          </button>
          <button
            onClick={() => setActiveTab("html")}
            className={`px-2 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              activeTab === "html" ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setActiveTab("css")}
            className={`px-2 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              activeTab === "css" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            CSS
          </button>
          <button
            onClick={() => setActiveTab("js")}
            className={`px-2 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              activeTab === "js" ? "bg-yellow-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            JS
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "preview" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Presets dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value !== "") {
                handleApplyPreset(Number(e.target.value));
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
            title="Load Starter Preset"
          >
            <option value="" disabled>Presets...</option>
            {PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>{p.name}</option>
            ))}
          </select>

          {/* Refresh / Re-run */}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Re-run sandbox"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Copy code */}
          <button
            onClick={handleCopyAll}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Copy all code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 min-h-0 relative flex overflow-hidden">
        {/* Editor Area (Shown in HTML, CSS, JS or Split view) */}
        {(activeTab === "html" || activeTab === "css" || activeTab === "js" || activeTab === "split") && (
          <div
            className={`flex flex-col bg-slate-900 border-r border-slate-800 ${
              activeTab === "split" ? "w-1/2" : "w-full"
            }`}
          >
            {/* Editor Sub-header when in split mode */}
            {activeTab === "split" && (
              <div className="flex items-center gap-1 px-3 py-1 bg-slate-950/60 border-b border-slate-800/80 text-[11px]">
                <Code className="w-3 h-3 text-indigo-400" />
                <span className="font-mono text-slate-400">Editor</span>
              </div>
            )}

            {/* Code Inputs */}
            <div className="flex-1 flex flex-col p-2 space-y-2 overflow-y-auto font-mono text-xs select-text">
              {(activeTab === "html" || activeTab === "split") && (
                <div className="flex-1 flex flex-col min-h-[90px]">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">HTML</span>
                  <textarea
                    value={html}
                    onChange={(e) => onUpdate({ sandboxHtml: e.target.value })}
                    disabled={isLocked}
                    className="flex-1 w-full bg-slate-950 text-orange-200 p-2.5 rounded-xl border border-slate-800 focus:border-orange-500/50 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                    spellCheck={false}
                    placeholder="<!-- HTML markup here -->"
                  />
                </div>
              )}

              {(activeTab === "css" || activeTab === "split") && (
                <div className="flex-1 flex flex-col min-h-[90px]">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">CSS</span>
                  <textarea
                    value={css}
                    onChange={(e) => onUpdate({ sandboxCss: e.target.value })}
                    disabled={isLocked}
                    className="flex-1 w-full bg-slate-950 text-sky-200 p-2.5 rounded-xl border border-slate-800 focus:border-sky-500/50 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                    spellCheck={false}
                    placeholder="/* CSS styles here */"
                  />
                </div>
              )}

              {(activeTab === "js" || activeTab === "split") && (
                <div className="flex-1 flex flex-col min-h-[90px]">
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">JavaScript</span>
                  <textarea
                    value={js}
                    onChange={(e) => onUpdate({ sandboxJs: e.target.value })}
                    disabled={isLocked}
                    className="flex-1 w-full bg-slate-950 text-yellow-200 p-2.5 rounded-xl border border-slate-800 focus:border-yellow-500/50 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                    spellCheck={false}
                    placeholder="// JavaScript code here"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Preview Iframe */}
        {(activeTab === "preview" || activeTab === "split") && (
          <div className={`flex flex-col bg-white ${activeTab === "split" ? "w-1/2" : "w-full"}`}>
            {activeTab === "split" && (
              <div className="flex items-center justify-between px-3 py-1 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-bold">
                  <Eye className="w-3 h-3 text-emerald-500" />
                  Live Preview
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                  Sandboxed iframe
                </span>
              </div>
            )}
            <iframe
              key={refreshKey}
              srcDoc={srcDoc}
              title="Code Sandbox Live Preview"
              sandbox="allow-scripts"
              className="w-full flex-1 border-0 bg-white"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};
