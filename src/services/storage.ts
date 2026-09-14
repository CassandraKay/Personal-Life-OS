import { UserLifeOSState } from "../types";
import { INITIAL_LIFE_OS_DATA } from "../data/initialData";

const STORAGE_KEY = "omnilife_os_user_state_v1";

export function sanitizeLifeOSState(rawState: any): UserLifeOSState {
  if (!rawState || typeof rawState !== "object") {
    return INITIAL_LIFE_OS_DATA;
  }

  const sanitizedProjects = Array.isArray(rawState.projects)
    ? rawState.projects.map((p: any) => ({
        ...p,
        tasks: Array.isArray(p?.tasks) ? p.tasks : [],
        techStack: Array.isArray(p?.techStack) ? p.techStack : [],
      }))
    : INITIAL_LIFE_OS_DATA.projects;

  const sanitizedCanvasCards =
    Array.isArray(rawState.canvasCards) && rawState.canvasCards.length > 0
      ? (() => {
          const seen = new Set<string>();
          return rawState.canvasCards.filter((card: any) => {
            if (!card || typeof card !== "object") return false;
            const id = card.id;
            if (id && seen.has(id)) return false;
            if (id) seen.add(id);
            return true;
          });
        })()
      : INITIAL_LIFE_OS_DATA.canvasCards;

  const sanitizedCanvasDrawings = Array.isArray(rawState.canvasDrawings)
    ? (() => {
        const seen = new Set<string>();
        return rawState.canvasDrawings.filter((stroke: any) => {
          if (!stroke || typeof stroke !== "object") return false;
          const id = stroke.id;
          if (id && seen.has(id)) return false;
          if (id) seen.add(id);
          return true;
        });
      })()
    : (INITIAL_LIFE_OS_DATA.canvasDrawings || []);

  const sanitizedCanvasConnections = Array.isArray(rawState.canvasConnections)
    ? (() => {
        const seen = new Set<string>();
        return rawState.canvasConnections.filter((conn: any) => {
          if (!conn || typeof conn !== "object") return false;
          const id = conn.id;
          if (id && seen.has(id)) return false;
          if (id) seen.add(id);
          return true;
        });
      })()
    : (INITIAL_LIFE_OS_DATA.canvasConnections || []);

  const sanitizedCalendarEvents =
    Array.isArray(rawState.calendarEvents) && rawState.calendarEvents.length > 0
      ? rawState.calendarEvents
      : INITIAL_LIFE_OS_DATA.calendarEvents;

  const sanitizedHabits = Array.isArray(rawState.habits)
    ? rawState.habits.map((h: any) => ({
        ...h,
        completedDates: Array.isArray(h?.completedDates) ? h.completedDates : [],
      }))
    : INITIAL_LIFE_OS_DATA.habits;

  const sanitizedNotes = Array.isArray(rawState.notes)
    ? rawState.notes
    : INITIAL_LIFE_OS_DATA.notes;

  const sanitizedLearning = Array.isArray(rawState.learning)
    ? rawState.learning
    : INITIAL_LIFE_OS_DATA.learning;

  const sanitizedFlashcards = Array.isArray(rawState.flashcards)
    ? rawState.flashcards
    : INITIAL_LIFE_OS_DATA.flashcards;

  const sanitizedVault = Array.isArray(rawState.vault)
    ? rawState.vault
    : INITIAL_LIFE_OS_DATA.vault;

  const sanitizedFinanceEntries = Array.isArray(rawState.financeEntries)
    ? rawState.financeEntries
    : INITIAL_LIFE_OS_DATA.financeEntries;

  const sanitizedSideHustles = Array.isArray(rawState.sideHustles)
    ? rawState.sideHustles.map((s: any) => ({
        ...s,
        milestones: Array.isArray(s?.milestones) ? s.milestones : [],
      }))
    : INITIAL_LIFE_OS_DATA.sideHustles;

  const sanitizedMediaAssets = Array.isArray(rawState.mediaAssets)
    ? rawState.mediaAssets
    : INITIAL_LIFE_OS_DATA.mediaAssets;

  const sanitizedCreativeHobbies = Array.isArray(rawState.creativeHobbies)
    ? rawState.creativeHobbies
    : INITIAL_LIFE_OS_DATA.creativeHobbies;

  const sanitizedSelfCareLogs =
    rawState.selfCareLogs && typeof rawState.selfCareLogs === "object"
      ? rawState.selfCareLogs
      : INITIAL_LIFE_OS_DATA.selfCareLogs;

  const sanitizedQuickBrainDumpList = Array.isArray(rawState.quickBrainDumpList)
    ? rawState.quickBrainDumpList
    : INITIAL_LIFE_OS_DATA.quickBrainDumpList;

  const sanitizedPrayers = Array.isArray(rawState.prayers)
    ? rawState.prayers
    : (INITIAL_LIFE_OS_DATA.prayers || []);

  const sanitizedBibleNotes = Array.isArray(rawState.bibleNotes)
    ? rawState.bibleNotes
    : (INITIAL_LIFE_OS_DATA.bibleNotes || []);

  const sanitizedBibleBookmarks = Array.isArray(rawState.bibleBookmarks)
    ? rawState.bibleBookmarks
    : (INITIAL_LIFE_OS_DATA.bibleBookmarks || []);

  return {
    ...INITIAL_LIFE_OS_DATA,
    ...rawState,
    profile: {
      ...INITIAL_LIFE_OS_DATA.profile,
      ...(rawState.profile || {}),
    },
    vaultId: rawState.vaultId || INITIAL_LIFE_OS_DATA.vaultId,
    projects: sanitizedProjects,
    canvasCards: sanitizedCanvasCards,
    canvasDrawings: sanitizedCanvasDrawings,
    canvasConnections: sanitizedCanvasConnections,
    calendarEvents: sanitizedCalendarEvents,
    prayers: sanitizedPrayers,
    bibleNotes: sanitizedBibleNotes,
    bibleBookmarks: sanitizedBibleBookmarks,
    habits: sanitizedHabits,
    notes: sanitizedNotes,
    learning: sanitizedLearning,
    flashcards: sanitizedFlashcards,
    vault: sanitizedVault,
    financeEntries: sanitizedFinanceEntries,
    sideHustles: sanitizedSideHustles,
    mediaAssets: sanitizedMediaAssets,
    creativeHobbies: sanitizedCreativeHobbies,
    selfCareLogs: sanitizedSelfCareLogs,
    quickBrainDumpList: sanitizedQuickBrainDumpList,
    customTheme: {
      ...INITIAL_LIFE_OS_DATA.customTheme,
      ...(rawState.customTheme || {}),
    },
  };
}

export function loadLocalState(): UserLifeOSState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_LIFE_OS_DATA;
    }
    const parsed = JSON.parse(raw);
    return sanitizeLifeOSState(parsed);
  } catch (e) {
    console.warn("Failed to load local state, using initial data:", e);
    return INITIAL_LIFE_OS_DATA;
  }
}

export function saveLocalState(state: UserLifeOSState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export async function syncWithServer(state: UserLifeOSState): Promise<UserLifeOSState> {
  const vaultId = state.vaultId || "default-vault";
  try {
    // 1. Fetch remote data first
    const getRes = await fetch(`/api/sync/${encodeURIComponent(vaultId)}`);
    if (getRes.ok) {
      const remote = await getRes.json();
      if (remote.found && remote.data) {
        const remoteData = remote.data as UserLifeOSState;
        const remoteTime = new Date(remote.lastSynced || 0).getTime();
        const localTime = new Date(state.lastSynced || 0).getTime();

        if (remoteTime > localTime) {
          const sanitizedRemote = sanitizeLifeOSState(remoteData);
          saveLocalState(sanitizedRemote);
          return sanitizedRemote;
        }
      }
    }

    // 2. Otherwise push local state to server
    const now = new Date().toISOString();
    const updatedLocal: UserLifeOSState = {
      ...state,
      lastSynced: now,
      version: (state.version || 1) + 1,
    };

    await fetch(`/api/sync/${encodeURIComponent(vaultId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: updatedLocal,
        version: updatedLocal.version,
      }),
    });

    saveLocalState(updatedLocal);
    return updatedLocal;
  } catch (error: any) {
    console.warn("Sync error (running in local mode):", error);
    return state;
  }
}

export function exportBackupJSON(state: UserLifeOSState) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `OmniLife_Backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBackupJSON(file: File): Promise<UserLifeOSState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.profile || !parsed.notes) {
          throw new Error("Invalid backup JSON format");
        }
        resolve(sanitizeLifeOSState(parsed));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
