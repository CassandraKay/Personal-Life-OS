import React, { useState } from "react";
import {
  Image,
  Upload,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Maximize2,
  FolderOpen,
  FileCode,
} from "lucide-react";
import { MediaAsset, UserLifeOSState } from "../types";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
}

export const MediaOrganizer: React.FC<Props> = ({ state, updateState }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // New Media Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<MediaAsset["category"]>("Code Assets & Mockups");
  const [uploadTags, setUploadTags] = useState("avatar, ui, mockup");
  const [uploadUrl, setUploadUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredAssets = state.mediaAssets.filter((asset) => {
    const matchesCategory = selectedCategory === "All" || asset.category === selectedCategory;
    const matchesSearch =
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadUrl(dataUrl);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadUrl) return;

    const newAsset: MediaAsset = {
      id: "media-" + Date.now(),
      title: uploadTitle.trim(),
      category: uploadCategory,
      dataUrlOrPath: uploadUrl,
      mediaType: "image",
      tags: uploadTags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      mediaAssets: [newAsset, ...prev.mediaAssets],
    }));

    setIsUploadModalOpen(false);
    setUploadTitle("");
    setUploadUrl("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this media asset?")) {
      updateState((prev) => ({
        ...prev,
        mediaAssets: prev.mediaAssets.filter((m) => m.id !== id),
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-indigo-500" />
            Media Storage & Asset Organizer
          </h1>
          <p className="text-xs text-slate-500">
            Organize UI graphics, code assets, personal photos, and copy markdown tags or data URLs in 1 click.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Upload className="w-4 h-4" /> Upload Asset
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assets by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            "All",
            "Code Assets & Mockups",
            "Art & Illustrations",
            "Personal Photos",
            "Icons & UI Graphics",
            "Audio & Misc",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs group flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            {/* Image Preview Thumbnail */}
            <div
              onClick={() => setPreviewAsset(asset)}
              className="h-44 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer relative"
            >
              {asset.dataUrlOrPath ? (
                <img
                  src={asset.dataUrlOrPath}
                  alt={asset.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Image className="w-8 h-8 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                <Maximize2 className="w-4 h-4" /> Preview
              </div>
            </div>

            {/* Meta and Quick Actions */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {asset.title}
                </h4>
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md">
                  {asset.category}
                </span>
                {asset.tags.map((t) => (
                  <span key={t} className="text-[10px] text-indigo-500 dark:text-indigo-400">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => copyToClipboard(asset.dataUrlOrPath, `url-${asset.id}`)}
                  className="py-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center gap-1"
                >
                  {copiedId === `url-${asset.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedId === `url-${asset.id}` ? "Copied" : "Copy URL"}
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(`![${asset.title}](${asset.dataUrlOrPath})`, `md-${asset.id}`)
                  }
                  className="py-1 px-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center gap-1"
                >
                  {copiedId === `md-${asset.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <FileCode className="w-3 h-3" />}
                  {copiedId === `md-${asset.id}` ? "Copied" : "Copy Tag"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleCreateAsset}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" /> Upload Media Asset
            </h3>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById("file-picker-input")?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}
            >
              <input
                id="file-picker-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {uploadUrl ? (
                <div className="space-y-2">
                  <img
                    src={uploadUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="h-28 mx-auto rounded-lg object-contain"
                  />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                    ✓ File loaded successfully
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <FolderOpen className="w-8 h-8 text-indigo-500 mx-auto mb-1 opacity-70" />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Drag & Drop image here, or click to browse
                  </p>
                  <p className="text-[11px] text-slate-400">Supports PNG, JPG, SVG, WebP</p>
                </div>
              )}
            </div>

            {/* Or Paste Direct URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Or Direct Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={uploadUrl.startsWith("data:") ? "" : uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hero Graphic, Dashboard Avatar..."
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Code Assets & Mockups">Code Assets & Mockups</option>
                  <option value="Art & Illustrations">Art & Illustrations</option>
                  <option value="Personal Photos">Personal Photos</option>
                  <option value="Icons & UI Graphics">Icons & UI Graphics</option>
                  <option value="Audio & Misc">Audio & Misc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="react, branding, logo, banner"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Save to Organizer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{previewAsset.title}</h3>
              <button onClick={() => setPreviewAsset(null)} className="text-slate-400 text-xs">
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-hidden flex items-center justify-center bg-slate-950 rounded-2xl p-2">
              <img
                src={previewAsset.dataUrlOrPath}
                alt={previewAsset.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400">Category: {previewAsset.category}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(previewAsset.dataUrlOrPath, "preview-url")}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Data/URL
                </button>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
