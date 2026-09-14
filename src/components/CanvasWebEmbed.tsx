import React, { useState } from "react";
import {
  ExternalLink,
  Globe,
  Youtube,
  Music,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { CanvasCardItem } from "../types";

interface Props {
  card: CanvasCardItem;
  onUpdate: (updates: Partial<CanvasCardItem>) => void;
  isLocked?: boolean;
}

const EMBED_PRESETS = [
  {
    name: "Lo-Fi Beats (YouTube Live)",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    type: "youtube",
  },
  {
    name: "Calm Christian Piano (YouTube)",
    url: "https://www.youtube.com/watch?v=0k73PqM-7pU",
    type: "youtube",
  },
  {
    name: "Nature Rain Sounds (YouTube)",
    url: "https://www.youtube.com/watch?v=mPZkdNFkNps",
    type: "youtube",
  },
  {
    name: "Peaceful Meditation (Spotify)",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6",
    type: "spotify",
  },
  {
    name: "Desmos Graphing Calculator",
    url: "https://www.desmos.com/calculator",
    type: "website",
  },
  {
    name: "Wikipedia Daily Portal",
    url: "https://en.m.wikipedia.org/wiki/Main_Page",
    type: "website",
  },
];

/**
 * Normalizes user-pasted URLs into embeddable iframe URLs
 */
function normalizeEmbedUrl(rawUrl: string): { url: string; type: "youtube" | "spotify" | "codepen" | "website" } {
  if (!rawUrl || !rawUrl.trim()) return { url: "", type: "website" };
  const trimmed = rawUrl.trim();

  // YouTube detection
  // Format 1: youtube.com/watch?v=ID
  // Format 2: youtu.be/ID
  // Format 3: youtube.com/embed/ID
  const ytMatch1 = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch1 && ytMatch1[1]) {
    return {
      url: `https://www.youtube.com/embed/${ytMatch1[1]}?autoplay=0`,
      type: "youtube",
    };
  }

  // Spotify detection
  // Format: open.spotify.com/(track|album|playlist|episode)/ID
  const spotifyMatch = trimmed.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
  if (spotifyMatch) {
    const type = spotifyMatch[1];
    const id = spotifyMatch[2];
    return {
      url: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      type: "spotify",
    };
  }

  // CodePen detection
  // Format: codepen.io/user/pen/ID
  const codepenMatch = trimmed.match(/codepen\.io\/([^\/]+)\/pen\/([a-zA-Z0-9]+)/i);
  if (codepenMatch) {
    const user = codepenMatch[1];
    const id = codepenMatch[2];
    return {
      url: `https://codepen.io/${user}/embed/${id}?default-tab=result&theme-id=dark`,
      type: "codepen",
    };
  }

  // General website (ensure https://)
  let formatted = trimmed;
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = "https://" + formatted;
  }

  return { url: formatted, type: "website" };
}

export const CanvasWebEmbed: React.FC<Props> = ({ card, onUpdate, isLocked }) => {
  const [inputUrl, setInputUrl] = useState(card.embedUrl || "");
  const [isEditingUrl, setIsEditingUrl] = useState(!card.embedUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUrl = card.embedUrl || "";
  const normalized = normalizeEmbedUrl(currentUrl);

  const handleSaveUrl = (urlToSave: string) => {
    const norm = normalizeEmbedUrl(urlToSave);
    onUpdate({
      embedUrl: norm.url,
      embedType: norm.type,
      title: card.title || (norm.type === "youtube" ? "YouTube Video" : norm.type === "spotify" ? "Spotify Player" : "Web Embed"),
    });
    setIsEditingUrl(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-700/80">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {normalized.type === "youtube" ? (
            <Youtube className="w-4 h-4 text-rose-500 shrink-0" />
          ) : normalized.type === "spotify" ? (
            <Music className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span className="font-bold truncate text-slate-200">
            {card.title || (normalized.type === "youtube" ? "YouTube" : normalized.type === "spotify" ? "Spotify" : "Web Embed")}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Preset Quick Loader */}
          <select
            onChange={(e) => {
              if (e.target.value !== "") {
                const preset = EMBED_PRESETS[Number(e.target.value)];
                if (preset) {
                  setInputUrl(preset.url);
                  handleSaveUrl(preset.url);
                }
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
            title="Load Popular Media & Tools"
          >
            <option value="" disabled>Presets...</option>
            {EMBED_PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>{p.name}</option>
            ))}
          </select>

          {/* Change URL toggle */}
          <button
            onClick={() => setIsEditingUrl(!isEditingUrl)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isEditingUrl ? "Hide URL bar" : "Edit URL"}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Refresh iframe */}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh frame"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Open in new tab */}
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Open link in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* URL Input Bar when editing or empty */}
      {isEditingUrl && (
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveUrl(inputUrl);
            }}
            disabled={isLocked}
            placeholder="Paste YouTube, Spotify, or website URL..."
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleSaveUrl(inputUrl)}
            disabled={isLocked || !inputUrl.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Embed
          </button>
        </div>
      )}

      {/* Iframe Display Area */}
      <div className="flex-1 min-h-0 bg-black relative flex flex-col justify-center items-center">
        {normalized.url ? (
          <>
            <iframe
              key={refreshKey}
              src={normalized.url}
              title={card.title || "Embedded Content"}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
              loading="lazy"
            />
            {/* Helpful note footer for external websites */}
            {normalized.type === "website" && (
              <div className="absolute bottom-1 right-2 pointer-events-none opacity-50 hover:opacity-100 transition-opacity bg-black/70 px-2 py-0.5 rounded text-[9px] text-slate-400">
                Note: Some websites block iframes (X-Frame-Options). Click the external link icon to open in a new tab if blocked.
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 text-slate-400 flex flex-col items-center gap-3">
            <Globe className="w-10 h-10 text-slate-600 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-slate-200">No URL embedded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Paste any YouTube video, Spotify track/playlist, or website link above, or choose a preset!
              </p>
            </div>
            <button
              onClick={() => {
                const demo = EMBED_PRESETS[0];
                setInputUrl(demo.url);
                handleSaveUrl(demo.url);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Try Lo-Fi Chill Beats Preset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
