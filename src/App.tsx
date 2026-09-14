import React, { useState, useEffect, useCallback } from "react";
import { TabType, UserLifeOSState } from "./types";
import { ThemeId } from "./themes";
import { loadLocalState, saveLocalState, syncWithServer } from "./services/storage";
import { Layout } from "./components/Layout";
import { CommandCenter } from "./components/CommandCenter";
import { NotesRepository } from "./components/NotesRepository";
import { CodingWorkbench } from "./components/CodingWorkbench";
import { PasswordVault } from "./components/PasswordVault";
import { FinanceAndHustles } from "./components/FinanceAndHustles";
import { LearningAndFlashcards } from "./components/LearningAndFlashcards";
import { CreativeStudio } from "./components/CreativeStudio";
import { MediaOrganizer } from "./components/MediaOrganizer";
import { SelfCareHub } from "./components/SelfCareHub";
import { AICopilot } from "./components/AICopilot";
import { SyncAndSettings } from "./components/SyncAndSettings";
import { ProfileHub } from "./components/ProfileHub";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { ChaoticCanvas } from "./components/ChaoticCanvas";
import { CalendarPage } from "./components/CalendarPage";
import { UniversalIndex } from "./components/UniversalIndex";
import { BibleStudyHub } from "./components/BibleStudyHub";

export default function App() {
  const [state, setState] = useState<UserLifeOSState>(loadLocalState);
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline" | "error">("synced");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Selected item sub-routes
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedHustleId, setSelectedHustleId] = useState<string | undefined>();

  // State update wrapper with automatic local persistence and background server sync
  const updateState = useCallback(
    (updater: (prev: UserLifeOSState) => UserLifeOSState) => {
      setState((prev) => {
        const nextState = updater(prev);
        saveLocalState(nextState);
        return nextState;
      });
    },
    []
  );

  // Cross-device server sync trigger
  const triggerManualSync = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const syncedState = await syncWithServer(state);
      setState(syncedState);
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.warn("Sync notice:", err);
      setSyncStatus("offline");
    }
  }, [state]);

  // Initial mount sync
  useEffect(() => {
    triggerManualSync();
  }, []);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Render Current Active Tab
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <CommandCenter
            state={state}
            updateState={updateState}
            onNavigate={(tab, targetId) => {
              setCurrentTab(tab);
              if (tab === "notes") setSelectedNoteId(targetId);
              if (tab === "coding") setSelectedProjectId(targetId);
              if (tab === "finance") setSelectedHustleId(targetId);
            }}
          />
        );
      case "canvas":
        return (
          <ChaoticCanvas
            state={state}
            updateState={updateState}
            onNavigateToTab={(tab, targetId) => {
              setCurrentTab(tab);
              if (tab === "notes") setSelectedNoteId(targetId);
              if (tab === "coding") setSelectedProjectId(targetId);
              if (tab === "finance") setSelectedHustleId(targetId);
            }}
          />
        );
      case "calendar":
        return (
          <CalendarPage
            state={state}
            updateState={updateState}
            onNavigateToTab={(tab, targetId) => {
              setCurrentTab(tab);
              if (tab === "notes") setSelectedNoteId(targetId);
              if (tab === "coding") setSelectedProjectId(targetId);
              if (tab === "finance") setSelectedHustleId(targetId);
            }}
          />
        );
      case "index":
        return (
          <UniversalIndex
            state={state}
            updateState={updateState}
            onNavigateToTab={(tab, targetId) => {
              setCurrentTab(tab);
              if (tab === "notes") setSelectedNoteId(targetId);
              if (tab === "coding") setSelectedProjectId(targetId);
              if (tab === "finance") setSelectedHustleId(targetId);
            }}
          />
        );
      case "bible_study":
        return <BibleStudyHub state={state} updateState={updateState} />;
      case "profile":
        return (
          <ProfileHub
            state={state}
            updateState={updateState}
            onNavigateToTab={setCurrentTab}
          />
        );
      case "notes":
        return (
          <NotesRepository
            state={state}
            updateState={updateState}
            selectedNoteId={selectedNoteId}
          />
        );
      case "coding":
        return (
          <CodingWorkbench
            state={state}
            updateState={updateState}
            selectedProjectId={selectedProjectId}
          />
        );
      case "vault":
        return <PasswordVault state={state} updateState={updateState} />;
      case "finance":
        return (
          <FinanceAndHustles
            state={state}
            updateState={updateState}
            selectedHustleId={selectedHustleId}
          />
        );
      case "learning":
        return <LearningAndFlashcards state={state} updateState={updateState} />;
      case "creative":
        return <CreativeStudio state={state} updateState={updateState} />;
      case "media":
        return <MediaOrganizer state={state} updateState={updateState} />;
      case "selfcare":
        return <SelfCareHub state={state} updateState={updateState} />;
      case "ai_copilot":
        return <AICopilot state={state} updateState={updateState} />;
      case "sync_settings":
        return (
          <SyncAndSettings
            state={state}
            updateState={updateState}
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
            triggerManualSync={triggerManualSync}
            onNavigateToTab={setCurrentTab}
            onUpdateTheme={(themeId: ThemeId) => {
              updateState((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  activeTheme: themeId,
                },
              }));
            }}
          />
        );
      default:
        return (
          <CommandCenter
            state={state}
            updateState={updateState}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
    }
  };

  const handleUpdateTheme = (themeId: ThemeId) => {
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        activeTheme: themeId,
      },
    }));
  };

  const handleToggleWallpaperMode = (mode: "pattern" | "clean") => {
    updateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        themeWallpaperMode: mode,
      },
    }));
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      state={state}
      syncStatus={syncStatus}
      lastSyncTime={lastSyncTime}
      onOpenSearch={() => setIsSearchOpen(true)}
      onUpdateTheme={handleUpdateTheme}
      onToggleWallpaperMode={handleToggleWallpaperMode}
    >
      {renderTabContent()}

      {/* Universal Search Modal (Command Palette) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        state={state}
        onSelectResult={(tab, id) => {
          setCurrentTab(tab);
          if (tab === "notes") setSelectedNoteId(id);
          if (tab === "coding") setSelectedProjectId(id);
          if (tab === "finance") setSelectedHustleId(id);
        }}
      />
    </Layout>
  );
}
