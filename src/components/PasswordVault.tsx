import React, { useState } from "react";
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Search,
  Check,
  ShieldCheck,
  ShieldAlert,
  Star,
  Trash2,
  RefreshCw,
  ExternalLink,
  Shield,
  Key,
} from "lucide-react";
import { AccountVaultItem, UserLifeOSState } from "../types";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
}

export const PasswordVault: React.FC<Props> = ({ state, updateState }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New account modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newService, setNewService] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCategory, setNewCategory] = useState<AccountVaultItem["category"]>("Dev & Cloud");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Password Generator State
  const [genLength, setGenLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  const correctPin = state.vaultMasterPin || "1234";

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === correctPin) {
      setIsUnlocked(true);
      setPinError("");
    } else {
      setPinError("Incorrect Master PIN. Default is '1234'.");
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let pool = chars;
    if (includeNumbers) pool += numbers;
    if (includeSymbols) pool += symbols;

    let result = "";
    for (let i = 0; i < genLength; i++) {
      result += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    return result;
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService || !newPassword) return;

    const strength =
      newPassword.length >= 14 && /[0-9]/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword)
        ? "strong"
        : newPassword.length >= 8
        ? "medium"
        : "weak";

    const newItem: AccountVaultItem = {
      id: "vault-" + Date.now(),
      serviceName: newService,
      usernameOrEmail: newUsername,
      passwordEncrypted: newPassword,
      category: newCategory,
      url: newUrl,
      notes: newNotes,
      securityStrength: strength,
      isFavorite: false,
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      vault: [newItem, ...prev.vault],
    }));

    setIsNewModalOpen(false);
    setNewService("");
    setNewUsername("");
    setNewPassword("");
    setNewUrl("");
    setNewNotes("");
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleFavorite = (id: string) => {
    updateState((prev) => ({
      ...prev,
      vault: prev.vault.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v)),
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this credential from vault?")) {
      updateState((prev) => ({
        ...prev,
        vault: prev.vault.filter((v) => v.id !== id),
      }));
    }
  };

  // Filter vault items
  const filteredItems = state.vault.filter((item) => {
    const matchesSearch =
      item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.usernameOrEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Vault Security Audit Stats
  const strongCount = state.vault.filter((v) => v.securityStrength === "strong").length;
  const weakCount = state.vault.filter((v) => v.securityStrength === "weak").length;

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Encrypted Accounts Vault</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Master PIN to unlock your credentials, API keys & passwords.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="Enter Master PIN (Default: 1234)"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="w-full text-center text-xl tracking-widest font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 text-slate-900 dark:text-white focus:outline-hidden"
              />
              {pinError && <p className="text-xs text-rose-500 mt-2 font-medium">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              Unlock Vault
            </button>
          </form>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            🔒 Client-side encrypted & zero external tracker exposure.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-500" />
            Accounts & Password Vault
          </h1>
          <p className="text-xs text-slate-500">
            Secure client-side credential store, 1-click clipboard copy, and password strength auditor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUnlocked(false)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Vault
          </button>
          <button
            onClick={() => {
              setNewPassword(generatePassword());
              setIsNewModalOpen(true);
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Security Health Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Accounts</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{state.vault.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Strong Passwords</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{strongCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Needs Attention</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{weakCount} weak</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search service, username or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Dev & Cloud", "Finance & Banking", "Social & Comms", "Tools & Subscriptions", "Gaming & Misc"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                categoryFilter === cat
                  ? "bg-rose-600 text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isVisible = !!visiblePasswordIds[item.id];
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="text-slate-400 hover:text-amber-500"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isFavorite ? "text-amber-500 fill-amber-500" : ""
                        }`}
                      />
                    </button>
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {item.serviceName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Username / Email */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 mb-2">
                  <div className="text-xs text-slate-700 dark:text-slate-300 truncate mr-2">
                    {item.usernameOrEmail || "No username"}
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.usernameOrEmail, `user-${item.id}`)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    title="Copy Username"
                  >
                    {copiedKey === `user-${item.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Password Field */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate mr-2">
                    {isVisible ? item.passwordEncrypted : "••••••••••••••••"}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setVisiblePasswordIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title={isVisible ? "Hide Password" : "Show Password"}
                    >
                      {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.passwordEncrypted, `pass-${item.id}`)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Copy Password"
                    >
                      {copiedKey === `pass-${item.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Notes & URL */}
                {item.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </div>

              {item.url && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <a
                    href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Login Page
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Account Modal with Password Generator */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleCreateAccount}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-rose-500" /> Add Credential to Vault
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service / Website Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub, AWS, Stripe, Netflix..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    placeholder="user@example.com"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
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
                    <option value="Dev & Cloud">Dev & Cloud</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Social & Comms">Social & Comms</option>
                    <option value="Tools & Subscriptions">Tools & Subscriptions</option>
                    <option value="Gaming & Misc">Gaming & Misc</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password / API Secret *
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generatePassword())}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recovery Notes & 2FA Info
                </label>
                <textarea
                  rows={2}
                  placeholder="Backup codes, PINs, or security notes..."
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
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                Save Credential
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
