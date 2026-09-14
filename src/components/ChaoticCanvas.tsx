import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Plus,
  StickyNote,
  Image as ImageIcon,
  Music,
  Video,
  Heart,
  Calendar as CalendarIcon,
  Type,
  Smile,
  Maximize2,
  Minimize2,
  Trash2,
  Link as LinkIcon,
  Play,
  Pause,
  Volume2,
  Lock,
  Unlock,
  Upload,
  RotateCw,
  Move,
  Check,
  ExternalLink,
  ChevronDown,
  Palette,
  Eye,
  EyeOff,
  GitFork,
  ArrowRight,
  Pencil,
  Minus,
  Square,
  Circle as CircleIcon,
  Eraser,
  Undo2,
  ZoomIn,
  ZoomOut,
  Layers,
  HelpCircle,
  ChevronUp,
  Diamond,
  Network,
  Mic,
  MicOff,
  Camera,
  Radio,
  StopCircle,
  Film,
  FileUp,
  FolderOpen,
  X,
  Code,
  Globe,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  UserLifeOSState,
  CanvasCardItem,
  CanvasCardKind,
  CanvasConnection,
  CanvasDrawingStroke,
  TabType,
} from "../types";
import { CANVAS_CARD_COLORS } from "../themeVariables";
import { CanvasCodeSandbox } from "./CanvasCodeSandbox";
import { CanvasWebEmbed } from "./CanvasWebEmbed";

interface Props {
  state: UserLifeOSState;
  updateState: (updater: (prev: UserLifeOSState) => UserLifeOSState) => void;
  onNavigateToTab: (tab: TabType, targetId?: string) => void;
}

// Preset color options for cards sourced from central themeVariables.ts
const COLOR_PRESETS = CANVAS_CARD_COLORS;

const STICKER_PRESETS = [
  "✨", "🌸", "💖", "🔥", "☕", "🚀", "💡", "🎯",
  "⭐", "📌", "🎨", "🍀", "🧠", "🎧", "⚡", "🌿",
  "🐱", "💻", "🌈", "🎉", "🕊️", "💎", "🌙", "🌊"
];

const DRAWING_COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#1E293B", "#FFFFFF"
];

export const ChaoticCanvas: React.FC<Props> = ({ state, updateState, onNavigateToTab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasSvgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas Viewport transform (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<
    "select" | "pencil" | "line" | "rect" | "circle" | "arrow" | "eraser"
  >("select");
  const [drawColor, setDrawColor] = useState("#3B82F6");
  const [drawWidth, setDrawWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<CanvasDrawingStroke | null>(null);

  // Dragging Card state
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Selection & Connecting Mode
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // Modal / Dropdown / Creation states
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [bottomMenuOpen, setBottomMenuOpen] = useState<
    "note" | "journal" | "mindmap" | "shape" | "video" | "song" | "image" | "sticker" | null
  >(null);
  const [pendingUploadCardId, setPendingUploadCardId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"image" | "audio" | "video">("image");

  // Audio Playback state tracking per card
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Voice Recording state
  const [activeVoiceCardId, setActiveVoiceCardId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);

  // Webcam Snapshot & Video Recording state
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [webcamMode, setWebcamMode] = useState<"photo" | "video">("photo");
  const [webcamTargetCardId, setWebcamTargetCardId] = useState<string | null>(null);
  const [isRecordingWebcamVideo, setIsRecordingWebcamVideo] = useState(false);
  const [webcamSeconds, setWebcamSeconds] = useState(0);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const webcamRecorderRef = useRef<MediaRecorder | null>(null);
  const webcamChunksRef = useRef<BlobPart[]>([]);

  // Voice recording timer
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => setVoiceSeconds((s) => s + 1), 1000);
    } else {
      setVoiceSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Webcam video recording timer
  useEffect(() => {
    let timer: any;
    if (isRecordingWebcamVideo) {
      timer = setInterval(() => setWebcamSeconds((s) => s + 1), 1000);
    } else {
      setWebcamSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingWebcamVideo]);

  // Bullet journal dot settings from customTheme or defaults
  const dotSpacing = state.customTheme?.bulletJournalDotSpacing || 24;
  const dotColor = state.customTheme?.bulletJournalDotColor || (document.documentElement.classList.contains("dark") ? "rgba(148,163,184,0.18)" : "#cbd5e1");
  const [showDots, setShowDots] = useState(true);

  // Unlocked private journal cards set (transient session unlocks)
  const [unlockedPrivateCards, setUnlockedPrivateCards] = useState<{ [id: string]: boolean }>({});

  // Bring card to front
  const bringToFront = (cardId: string) => {
    const cards = state.canvasCards || [];
    const maxZ = Math.max(0, ...cards.map((c) => c.zIndex || 0));
    updateState((prev) => ({
      ...prev,
      canvasCards: (prev.canvasCards || []).map((c) =>
        c.id === cardId ? { ...c, zIndex: maxZ + 1 } : c
      ),
    }));
  };

  // Card Mouse Down (Start Drag)
  const handleCardMouseDown = (e: React.MouseEvent, card: CanvasCardItem) => {
    if (activeTool !== "select") return;
    e.stopPropagation();
    e.preventDefault();

    // If in connecting mode, finish connection
    if (connectingFromId && connectingFromId !== card.id) {
      handleCreateConnection(connectingFromId, card.id);
      setConnectingFromId(null);
      return;
    }

    setSelectedCardId(card.id);
    bringToFront(card.id);

    // Calculate mouse offset relative to card position (scaled by zoom)
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const mouseX = (e.clientX - containerRect.left - pan.x) / zoom;
    const mouseY = (e.clientY - containerRect.top - pan.y) / zoom;

    setDraggingCardId(card.id);
    setDragOffset({
      x: mouseX - card.x,
      y: mouseY - card.y,
    });
  };

  // Canvas Mouse Down (Pan or Start Drawing)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (connectingFromId) {
      setConnectingFromId(null);
      return;
    }

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const canvasX = (e.clientX - containerRect.left - pan.x) / zoom;
    const canvasY = (e.clientY - containerRect.top - pan.y) / zoom;

    if (activeTool === "select") {
      setBottomMenuOpen(null);
      setIsAddCardOpen(false);
      setIsStickerPickerOpen(false);
      const isCardClick = Boolean((e.target as HTMLElement).closest?.('[data-card="true"]'));
      if (!isCardClick) {
        setIsPanning(true);
        setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        setSelectedCardId(null);
      }
    } else if (activeTool === "eraser") {
      setIsDrawing(true);
      eraseStrokesNear(canvasX, canvasY);
    } else {
      // Drawing stroke
      setIsDrawing(true);
      const newStroke: CanvasDrawingStroke = {
        id: "stroke-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9),
        type: activeTool,
        points: [{ x: canvasX, y: canvasY }],
        color: drawColor,
        width: drawWidth,
      };
      setCurrentStroke(newStroke);
    }
  };

  // Canvas Mouse Move (Dragging Card, Panning, or Drawing)
  const handleMouseMove = (e: React.MouseEvent) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const canvasX = (e.clientX - containerRect.left - pan.x) / zoom;
    const canvasY = (e.clientY - containerRect.top - pan.y) / zoom;

    if (draggingCardId) {
      const newX = Math.round(canvasX - dragOffset.x);
      const newY = Math.round(canvasY - dragOffset.y);

      updateState((prev) => ({
        ...prev,
        canvasCards: (prev.canvasCards || []).map((c) =>
          c.id === draggingCardId ? { ...c, x: newX, y: newY } : c
        ),
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (isDrawing) {
      if (activeTool === "eraser") {
        eraseStrokesNear(canvasX, canvasY);
      } else if (currentStroke) {
        if (activeTool === "pencil") {
          setCurrentStroke((prev) =>
            prev ? { ...prev, points: [...prev.points, { x: canvasX, y: canvasY }] } : null
          );
        } else {
          // Line, rect, circle, arrow: 2 points (start and current)
          setCurrentStroke((prev) =>
            prev ? { ...prev, points: [prev.points[0], { x: canvasX, y: canvasY }] } : null
          );
        }
      }
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    if (draggingCardId) {
      setDraggingCardId(null);
    }
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDrawing) {
      setIsDrawing(false);
      if (currentStroke && currentStroke.points.length > 0) {
        const strokeToSave = currentStroke;
        setCurrentStroke(null);
        updateState((prev) => {
          const existing = prev.canvasDrawings || [];
          if (existing.some((s) => s.id === strokeToSave.id)) {
            return prev;
          }
          return {
            ...prev,
            canvasDrawings: [...existing, strokeToSave],
          };
        });
      } else {
        setCurrentStroke(null);
      }
    }
  };

  // Erase strokes near coordinates
  const eraseStrokesNear = (x: number, y: number) => {
    const threshold = 20;
    updateState((prev) => ({
      ...prev,
      canvasDrawings: (prev.canvasDrawings || []).filter((stroke) => {
        return !stroke.points.some(
          (p) => Math.hypot(p.x - x, p.y - y) < threshold
        );
      }),
    }));
  };

  // Global Window Mousemove & Mouseup for smooth dragging & drawing without drop-offs
  useEffect(() => {
    if (!isDrawing && !draggingCardId && !isPanning) return;

    const onWindowMouseMove = (e: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const canvasX = (e.clientX - containerRect.left - pan.x) / zoom;
      const canvasY = (e.clientY - containerRect.top - pan.y) / zoom;

      if (draggingCardId) {
        const newX = Math.round(canvasX - dragOffset.x);
        const newY = Math.round(canvasY - dragOffset.y);

        updateState((prev) => ({
          ...prev,
          canvasCards: (prev.canvasCards || []).map((c) =>
            c.id === draggingCardId ? { ...c, x: newX, y: newY } : c
          ),
        }));
      } else if (isPanning) {
        setPan({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        });
      } else if (isDrawing) {
        if (activeTool === "eraser") {
          eraseStrokesNear(canvasX, canvasY);
        } else if (currentStroke) {
          if (activeTool === "pencil") {
            setCurrentStroke((prev) =>
              prev ? { ...prev, points: [...prev.points, { x: canvasX, y: canvasY }] } : null
            );
          } else {
            setCurrentStroke((prev) =>
              prev ? { ...prev, points: [prev.points[0], { x: canvasX, y: canvasY }] } : null
            );
          }
        }
      }
    };

    const onWindowMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, [isDrawing, draggingCardId, isPanning, activeTool, currentStroke, dragOffset, pan, zoom, startPan]);

  // Add Card helper
  const handleAddCard = (kind: CanvasCardKind, extraProps?: Partial<CanvasCardItem>) => {
    setIsAddCardOpen(false);
    setBottomMenuOpen(null);

    // Calculate center spawn coordinates based on current pan and zoom
    const containerRect = containerRef.current?.getBoundingClientRect();
    const spawnX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 140) : 200;
    const spawnY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 100) : 200;
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));

    let defaultTitle = "New Note";
    let defaultContent = "Type your creative spark here...";
    let defaultBg = "#FEF08A";
    let defaultText = "#713F12";
    let rotation = Math.floor(Math.random() * 7) - 3; // -3 to 3 deg
    let width = 260;

    if (kind === "post_it") {
      defaultTitle = "Sticky Note";
      defaultBg = COLOR_PRESETS[Math.floor(Math.random() * 5)].bg;
      defaultText = "#1E293B";
    } else if (kind === "image") {
      defaultTitle = "Photo Card";
      defaultContent = "";
      defaultBg = "#FFFFFF";
      width = 280;
    } else if (kind === "audio") {
      defaultTitle = "Audio Tune / Voice Clip";
      defaultBg = "#E0F2FE";
      defaultText = "#0369A1";
      width = 300;
    } else if (kind === "video") {
      defaultTitle = "Video Clip";
      defaultBg = "#F8FAFC";
      defaultText = "#1E293B";
      width = 320;
    } else if (kind === "journal") {
      defaultTitle = "Heartfelt Journal";
      defaultContent = "Write down your raw thoughts, feelings, or milestones...";
      defaultBg = "#FFE4E6";
      defaultText = "#9F1239";
      width = 280;
    } else if (kind === "event") {
      defaultTitle = "New Appointment / Event";
      defaultContent = "Important date linked to your Calendar";
      defaultBg = "#ECFDF5";
      defaultText = "#065F46";
      width = 270;
    } else if (kind === "text_box") {
      defaultTitle = "";
      defaultContent = "Double click to write thoughts directly on canvas...";
      defaultBg = "transparent";
      defaultText = "#334155";
      width = 250;
    } else if (kind === "shape") {
      const isCirc = extraProps?.shapeKind === "circle";
      const isDia = extraProps?.shapeKind === "diamond";
      const isArr = extraProps?.shapeKind === "arrow";
      defaultTitle = isCirc ? "Focus Badge" : isDia ? "Milestone Diamond" : isArr ? "Next Phase ➔" : "Container Frame";
      defaultContent = isCirc || isArr ? "" : "Visual grouping box for cards";
      defaultBg = isCirc ? "rgba(238, 242, 255, 0.75)" : isDia ? "rgba(254, 243, 199, 0.8)" : isArr ? "rgba(224, 242, 254, 0.85)" : "rgba(248, 250, 252, 0.65)";
      defaultText = isCirc ? "#3730A3" : isDia ? "#92400E" : isArr ? "#0369A1" : "#1E293B";
      width = isCirc ? 200 : isDia ? 190 : isArr ? 260 : 280;
    } else if (kind === "code_sandbox") {
      defaultTitle = "Interactive Code Sandbox";
      defaultBg = "#0F172A";
      defaultText = "#F8FAFC";
      width = 560;
      rotation = 0;
    } else if (kind === "web_embed") {
      defaultTitle = "Media & Web Embed";
      defaultBg = "#0F172A";
      defaultText = "#F8FAFC";
      width = 480;
      rotation = 0;
    }

    const newCard: CanvasCardItem = {
      id: "card-" + Date.now(),
      type: kind,
      x: spawnX,
      y: spawnY,
      width,
      height: kind === "code_sandbox" ? 420 : kind === "web_embed" ? 380 : undefined,
      zIndex: maxZ + 1,
      rotation,
      title: defaultTitle,
      content: defaultContent,
      backgroundColor: defaultBg,
      textColor: defaultText,
      journalShape: kind === "journal" ? "heart" : undefined,
      shapeKind: extraProps?.shapeKind || (kind === "shape" ? "rect" : undefined),
      shapeBorder: extraProps?.shapeBorder || (kind === "shape" ? "dashed" : undefined),
      isPrivate: false,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      eventDate: new Date().toISOString().split("T")[0],
      sandboxActiveTab: kind === "code_sandbox" ? "split" : undefined,
      embedUrl: kind === "web_embed" ? (extraProps?.embedUrl || "https://www.youtube.com/watch?v=jfKfPfyJRdk") : undefined,
      embedType: kind === "web_embed" ? (extraProps?.embedType || "youtube") : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...extraProps,
    };

    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), newCard],
    }));

    setSelectedCardId(newCard.id);
    confetti({ particleCount: 25, spread: 45 });
  };

  // Add Sticker to canvas
  const handleAddSticker = (emoji: string) => {
    setIsStickerPickerOpen(false);
    const containerRect = containerRef.current?.getBoundingClientRect();
    const spawnX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 30) : 250;
    const spawnY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 30) : 250;
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));

    const newSticker: CanvasCardItem = {
      id: "sticker-" + Date.now(),
      type: "sticker",
      x: spawnX,
      y: spawnY,
      width: 70,
      zIndex: maxZ + 2,
      rotation: Math.floor(Math.random() * 20) - 10,
      stickerEmoji: emoji,
      stickerCategory: "emoji",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), newSticker],
    }));
  };

  // Update a card
  const handleUpdateCard = (cardId: string, updates: Partial<CanvasCardItem>) => {
    updateState((prev) => ({
      ...prev,
      canvasCards: (prev.canvasCards || []).map((c) =>
        c.id === cardId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }));
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    updateState((prev) => ({
      ...prev,
      canvasCards: (prev.canvasCards || []).filter((c) => c.id !== cardId),
      canvasConnections: (prev.canvasConnections || []).filter(
        (conn) => conn.fromId !== cardId && conn.toId !== cardId
      ),
    }));
    if (selectedCardId === cardId) setSelectedCardId(null);
  };

  // Create Connection between two cards
  const handleCreateConnection = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const newConn: CanvasConnection = {
      id: "conn-" + Date.now(),
      fromId,
      toId,
      label: "Connected",
      color: drawColor || "#3B82F6",
      style: "curved",
    };
    updateState((prev) => ({
      ...prev,
      canvasConnections: [...(prev.canvasConnections || []), newConn],
    }));
    confetti({ particleCount: 20, spread: 40 });
  };

  // Mind map: Add child card branching off to the right
  const handleAddMindMapChild = (parentCard: CanvasCardItem) => {
    const childX = parentCard.x + (parentCard.width || 260) + 70;
    const childY = parentCard.y + Math.floor(Math.random() * 80) - 40;
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));

    const childCard: CanvasCardItem = {
      id: "card-" + Date.now(),
      type: "post_it",
      x: childX,
      y: childY,
      width: 230,
      zIndex: maxZ + 1,
      rotation: Math.floor(Math.random() * 6) - 3,
      title: "Branch Idea",
      content: "Sub-thought stemming from " + (parentCard.title || "idea"),
      backgroundColor: "#FEF08A",
      textColor: "#713F12",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newConn: CanvasConnection = {
      id: "conn-" + Date.now(),
      fromId: parentCard.id,
      toId: childCard.id,
      label: "Branches to",
      color: "#0284C7",
      style: "curved",
    };

    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), childCard],
      canvasConnections: [...(prev.canvasConnections || []), newConn],
    }));

    setSelectedCardId(childCard.id);
  };

  // Add Complete Mind Map Diagram with connected branches
  const handleAddMindMapDiagram = (preset: "classic" | "brainstorm" = "classic") => {
    setBottomMenuOpen(null);
    const containerRect = containerRef.current?.getBoundingClientRect();
    const centerX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 130) : 300;
    const centerY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 80) : 250;
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));

    const rootId = "card-mm-" + Date.now();
    const branch1Id = "card-mm-" + (Date.now() + 1);
    const branch2Id = "card-mm-" + (Date.now() + 2);
    const branch3Id = "card-mm-" + (Date.now() + 3);

    const rootCard: CanvasCardItem = {
      id: rootId,
      type: "post_it",
      x: centerX,
      y: centerY,
      width: 240,
      zIndex: maxZ + 1,
      rotation: 0,
      title: "🧠 Central Concept",
      content: "Core idea or project focus. Click '+ Branch' to link more thoughts!",
      backgroundColor: "#E0F2FE",
      textColor: "#0369A1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const branch1: CanvasCardItem = {
      id: branch1Id,
      type: "post_it",
      x: centerX + 290,
      y: centerY - 100,
      width: 210,
      zIndex: maxZ + 2,
      rotation: -2,
      title: "💡 Key Objective",
      content: "First core initiative or thesis",
      backgroundColor: "#FEF08A",
      textColor: "#713F12",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const branch2: CanvasCardItem = {
      id: branch2Id,
      type: "post_it",
      x: centerX + 290,
      y: centerY + 90,
      width: 210,
      zIndex: maxZ + 2,
      rotation: 2,
      title: "⚡ Action Deliverable",
      content: "Executable steps & milestones",
      backgroundColor: "#DCFCE7",
      textColor: "#14532D",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const conn1: CanvasConnection = {
      id: "conn-" + Date.now() + "-1",
      fromId: rootId,
      toId: branch1Id,
      label: "Branches to",
      color: "#0284C7",
      style: "curved",
    };

    const conn2: CanvasConnection = {
      id: "conn-" + Date.now() + "-2",
      fromId: rootId,
      toId: branch2Id,
      label: "Leads to",
      color: "#0284C7",
      style: "curved",
    };

    const newCards = [rootCard, branch1, branch2];
    const newConns = [conn1, conn2];

    if (preset === "brainstorm") {
      const branch3: CanvasCardItem = {
        id: branch3Id,
        type: "post_it",
        x: centerX - 270,
        y: centerY,
        width: 210,
        zIndex: maxZ + 2,
        rotation: 1,
        title: "🔮 Opportunities & Risks",
        content: "Exploratory thoughts & mitigation",
        backgroundColor: "#FFE4E6",
        textColor: "#9F1239",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const conn3: CanvasConnection = {
        id: "conn-" + Date.now() + "-3",
        fromId: rootId,
        toId: branch3Id,
        label: "Considers",
        color: "#F43F5E",
        style: "curved",
      };
      newCards.push(branch3);
      newConns.push(conn3);
    }

    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), ...newCards],
      canvasConnections: [...(prev.canvasConnections || []), ...newConns],
    }));

    setSelectedCardId(rootId);
    confetti({ particleCount: 35, spread: 55 });
  };

  // Add Shape Card helper
  const handleAddShape = (shapeKind: "rect" | "circle" | "diamond" | "arrow") => {
    setBottomMenuOpen(null);
    const containerRect = containerRef.current?.getBoundingClientRect();
    const spawnX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 130) : 250;
    const spawnY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 90) : 250;
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));

    let width = 280;
    let height = 180;
    let bg = "rgba(248, 250, 252, 0.7)";
    let textColor = "#1E293B";
    let title = "Container Box";

    if (shapeKind === "circle") {
      width = 200;
      height = 200;
      bg = "rgba(238, 242, 255, 0.75)";
      textColor = "#3730A3";
      title = "Focus Cluster";
    } else if (shapeKind === "diamond") {
      width = 190;
      height = 190;
      bg = "rgba(254, 243, 199, 0.8)";
      textColor = "#92400E";
      title = "Key Decision";
    } else if (shapeKind === "arrow") {
      width = 260;
      height = 80;
      bg = "rgba(224, 242, 254, 0.85)";
      textColor = "#0369A1";
      title = "Next Phase ➔";
    }

    const newShapeCard: CanvasCardItem = {
      id: "shape-" + Date.now(),
      type: "shape",
      shapeKind,
      shapeBorder: "dashed",
      x: spawnX,
      y: spawnY,
      width,
      height,
      zIndex: maxZ + 1,
      rotation: 0,
      title,
      content: shapeKind === "rect" ? "Drag cards inside or use as grouping section" : "",
      backgroundColor: bg,
      textColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), newShapeCard],
    }));

    setSelectedCardId(newShapeCard.id);
    confetti({ particleCount: 20, spread: 40 });
  };

  // Add Media Card with optional immediate local file prompt
  const handleAddMediaCardWithUpload = (
    type: "image" | "audio" | "video",
    promptUploadDirectly: boolean = false
  ) => {
    setBottomMenuOpen(null);
    const containerRect = containerRef.current?.getBoundingClientRect();
    const spawnX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 140) : 200;
    const spawnY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 100) : 200;
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));

    const defaultTitle =
      type === "image" ? "Photo Card" : type === "audio" ? "Audio Tune" : "Video Clip";
    const defaultBg =
      type === "image" ? "#FFFFFF" : type === "audio" ? "#E0F2FE" : "#F8FAFC";
    const defaultText = type === "audio" ? "#0369A1" : "#1E293B";
    const width = type === "video" ? 320 : type === "audio" ? 300 : 280;

    const cardId = "card-" + Date.now();
    const newCard: CanvasCardItem = {
      id: cardId,
      type,
      x: spawnX,
      y: spawnY,
      width,
      zIndex: maxZ + 1,
      rotation: Math.floor(Math.random() * 5) - 2,
      title: defaultTitle,
      backgroundColor: defaultBg,
      textColor: defaultText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), newCard],
    }));
    setSelectedCardId(cardId);

    if (promptUploadDirectly) {
      triggerFileUpload(cardId, type);
    } else {
      confetti({ particleCount: 25, spread: 45 });
    }
  };

  // File Upload Handler (Search computer for Image, Audio, or Video)
  const triggerFileUpload = (cardId: string, type: "image" | "audio" | "video") => {
    setPendingUploadCardId(cardId);
    setUploadType(type);
    if (fileInputRef.current) {
      if (type === "image") fileInputRef.current.accept = "image/*";
      else if (type === "audio") fileInputRef.current.accept = "audio/*";
      else if (type === "video") fileInputRef.current.accept = "video/*";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadCardId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleUpdateCard(pendingUploadCardId, {
        mediaUrl: dataUrl,
        mediaFileName: file.name,
      });
      confetti({ particleCount: 30, spread: 50 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Direct file handler for in-card buttons and drag-and-drop
  const handleDirectFileUpload = (cardId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleUpdateCard(cardId, {
        mediaUrl: dataUrl,
        mediaFileName: file.name,
      });
      confetti({ particleCount: 30, spread: 50 });
    };
    reader.readAsDataURL(file);
  };

  // Voice Recording Handlers
  const startVoiceRecording = async (cardId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      voiceRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          handleUpdateCard(cardId, {
            mediaUrl: dataUrl,
            mediaFileName: `Voice-Memo-${new Date().toLocaleTimeString().replace(/:/g, "-")}.webm`,
            title: "🎙️ Voice Memo Note",
          });
          confetti({ particleCount: 30, spread: 50 });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setActiveVoiceCardId(cardId);
      setIsRecordingVoice(true);
      setVoiceSeconds(0);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current && voiceRecorderRef.current.state !== "inactive") {
      voiceRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setActiveVoiceCardId(null);
  };

  // Add a brand new Voice Memo Card and immediately start voice recording
  const handleAddVoiceMemoCard = () => {
    setIsAddCardOpen(false);
    const containerRect = containerRef.current?.getBoundingClientRect();
    const spawnX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 150) : 200;
    const spawnY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 100) : 200;
    const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));
    const cardId = "card-" + Date.now();
    const newCard: CanvasCardItem = {
      id: cardId,
      type: "audio",
      x: spawnX,
      y: spawnY,
      width: 310,
      zIndex: maxZ + 1,
      rotation: -1,
      title: "🎙️ Voice Memo Note",
      content: "",
      backgroundColor: "#E0F2FE",
      textColor: "#0369A1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      canvasCards: [...(prev.canvasCards || []), newCard],
    }));
    setSelectedCardId(cardId);
    startVoiceRecording(cardId);
  };

  // Webcam Handlers (Photo & Video)
  const openWebcam = async (mode: "photo" | "video", cardId?: string) => {
    setIsAddCardOpen(false);
    setWebcamMode(mode);
    setWebcamTargetCardId(cardId || null);
    setWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === "video",
      });
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch((e) => console.warn(e));
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setWebcamOpen(false);
    }
  };

  const closeWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    if (webcamRecorderRef.current && webcamRecorderRef.current.state !== "inactive") {
      webcamRecorderRef.current.stop();
    }
    setWebcamOpen(false);
    setIsRecordingWebcamVideo(false);
    setWebcamSeconds(0);
  };

  const switchWebcamMode = async (mode: "photo" | "video") => {
    if (webcamMode === mode) return;
    if (isRecordingWebcamVideo) stopWebcamVideoRecording();
    closeWebcam();
    setTimeout(() => openWebcam(mode, webcamTargetCardId || undefined), 150);
  };

  const snapWebcamPhoto = () => {
    if (!webcamVideoRef.current) return;
    const video = webcamVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");

    if (webcamTargetCardId) {
      handleUpdateCard(webcamTargetCardId, {
        mediaUrl: dataUrl,
        mediaFileName: `Webcam-Photo-${new Date().toLocaleTimeString().replace(/:/g, "-")}.png`,
      });
    } else {
      // Spawn new photo card
      const containerRect = containerRef.current?.getBoundingClientRect();
      const spawnX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 140) : 220;
      const spawnY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 100) : 220;
      const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));
      const cardId = "card-" + Date.now();
      const newCard: CanvasCardItem = {
        id: cardId,
        type: "image",
        x: spawnX,
        y: spawnY,
        width: 280,
        zIndex: maxZ + 1,
        rotation: 1,
        title: "Webcam Snapshot",
        mediaUrl: dataUrl,
        mediaFileName: `Webcam-Photo-${new Date().toLocaleTimeString().replace(/:/g, "-")}.png`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateState((prev) => ({
        ...prev,
        canvasCards: [...(prev.canvasCards || []), newCard],
      }));
      setSelectedCardId(cardId);
    }
    confetti({ particleCount: 35, spread: 60 });
    closeWebcam();
  };

  const startWebcamVideoRecording = () => {
    if (!webcamStreamRef.current) return;
    webcamChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(webcamStreamRef.current);
      webcamRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          webcamChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(webcamChunksRef.current, { type: "video/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          if (webcamTargetCardId) {
            handleUpdateCard(webcamTargetCardId, {
              mediaUrl: dataUrl,
              mediaFileName: `Webcam-Video-${new Date().toLocaleTimeString().replace(/:/g, "-")}.webm`,
            });
          } else {
            const containerRect = containerRef.current?.getBoundingClientRect();
            const spawnX = containerRect ? Math.round((-pan.x + containerRect.width / 2) / zoom - 160) : 220;
            const spawnY = containerRect ? Math.round((-pan.y + containerRect.height / 2) / zoom - 100) : 220;
            const maxZ = Math.max(0, ...(state.canvasCards || []).map((c) => c.zIndex || 0));
            const cardId = "card-" + Date.now();
            const newCard: CanvasCardItem = {
              id: cardId,
              type: "video",
              x: spawnX,
              y: spawnY,
              width: 320,
              zIndex: maxZ + 1,
              rotation: 0,
              title: "Webcam Video Clip",
              mediaUrl: dataUrl,
              mediaFileName: `Webcam-Video-${new Date().toLocaleTimeString().replace(/:/g, "-")}.webm`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            updateState((prev) => ({
              ...prev,
              canvasCards: [...(prev.canvasCards || []), newCard],
            }));
            setSelectedCardId(cardId);
          }
          confetti({ particleCount: 35, spread: 60 });
          closeWebcam();
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setIsRecordingWebcamVideo(true);
      setWebcamSeconds(0);
    } catch (err) {
      console.error("Failed to start webcam recording:", err);
    }
  };

  const stopWebcamVideoRecording = () => {
    if (webcamRecorderRef.current && webcamRecorderRef.current.state !== "inactive") {
      webcamRecorderRef.current.stop();
    }
    setIsRecordingWebcamVideo(false);
  };

  // Audio Playback toggle
  const togglePlayAudio = (cardId: string, url?: string) => {
    if (!url) return;
    if (playingAudioId === cardId) {
      audioElementsRef.current[cardId]?.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing audio
      if (playingAudioId && audioElementsRef.current[playingAudioId]) {
        audioElementsRef.current[playingAudioId].pause();
      }
      if (!audioElementsRef.current[cardId]) {
        const audio = new Audio(url);
        audio.onended = () => setPlayingAudioId(null);
        audioElementsRef.current[cardId] = audio;
      }
      audioElementsRef.current[cardId].play();
      setPlayingAudioId(cardId);
    }
  };

  // Render SVG Connector Lines between cards
  const renderConnections = () => {
    const cardMap = new Map<string, CanvasCardItem>((state.canvasCards || []).map((c) => [c.id, c]));

    return (state.canvasConnections || []).map((conn, idx) => {
      const fromCard = cardMap.get(conn.fromId);
      const toCard = cardMap.get(conn.toId);
      if (!fromCard || !toCard) return null;

      const fromW = fromCard.width || 260;
      const fromH = fromCard.height || 180;
      const toW = toCard.width || 260;
      const toH = toCard.height || 180;

      const startX = fromCard.x + fromW / 2;
      const startY = fromCard.y + fromH / 2;
      const endX = toCard.x + toW / 2;
      const endY = toCard.y + toH / 2;

      // Bezier control point
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const dx = endX - startX;
      const dy = endY - startY;
      const ctrlX = midX - dy * 0.15;
      const ctrlY = midY + dx * 0.15;

      const pathData = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

      return (
        <g key={conn.id ? `${conn.id}-${idx}` : `conn-${idx}`} className="group cursor-pointer">
          {/* Broad click target */}
          <path
            d={pathData}
            fill="none"
            stroke="transparent"
            strokeWidth="18"
            onClick={() => {
              if (confirm("Remove this connector link?")) {
                updateState((prev) => ({
                  ...prev,
                  canvasConnections: (prev.canvasConnections || []).filter((c) => c.id !== conn.id),
                }));
              }
            }}
          />
          {/* Visual line */}
          <path
            d={pathData}
            fill="none"
            stroke={conn.color || "#3B82F6"}
            strokeWidth="2.5"
            strokeDasharray={conn.style === "dashed" ? "6,6" : undefined}
            markerEnd="url(#arrowhead)"
            className="transition-all hover:stroke-rose-500 hover:stroke-[4]"
          />
          {/* Label badge */}
          {conn.label && (
            <foreignObject
              x={ctrlX - 50}
              y={ctrlY - 14}
              width="100"
              height="28"
              className="overflow-visible pointer-events-none"
            >
              <div className="flex items-center justify-center">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs">
                  {conn.label}
                </span>
              </div>
            </foreignObject>
          )}
        </g>
      );
    });
  };

  // Render SVG Drawing Strokes
  const renderDrawings = () => {
    const seenIds = new Set<string>();
    const uniqueStrokes: CanvasDrawingStroke[] = [];

    for (const stroke of state.canvasDrawings || []) {
      if (!stroke || !stroke.points || stroke.points.length === 0) continue;
      const sId = stroke.id || `s-${uniqueStrokes.length}`;
      if (!seenIds.has(sId)) {
        seenIds.add(sId);
        uniqueStrokes.push(stroke);
      }
    }

    if (currentStroke && currentStroke.points && currentStroke.points.length > 0) {
      if (!seenIds.has(currentStroke.id)) {
        uniqueStrokes.push(currentStroke);
      }
    }

    return uniqueStrokes.map((stroke, idx) => {
      const strokeKey = stroke.id ? `${stroke.id}-${idx}` : `stroke-${idx}`;
      if (stroke.points.length === 0) return null;

      if (stroke.type === "pencil") {
        const d = stroke.points.reduce((acc, p, i) => {
          return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
        }, "");
        return (
          <path
            key={strokeKey}
            d={d}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      } else if (stroke.type === "line" || stroke.type === "arrow") {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        return (
          <line
            key={strokeKey}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            markerEnd={stroke.type === "arrow" ? "url(#arrowhead)" : undefined}
          />
        );
      } else if (stroke.type === "rect") {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const w = Math.abs(end.x - start.x);
        const h = Math.abs(end.y - start.y);
        return (
          <rect
            key={strokeKey}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={stroke.color + "15"}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            rx="4"
          />
        );
      } else if (stroke.type === "circle") {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        const cx = Math.min(start.x, end.x) + rx;
        const cy = Math.min(start.y, end.y) + ry;
        return (
          <ellipse
            key={strokeKey}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={stroke.color + "15"}
            stroke={stroke.color}
            strokeWidth={stroke.width}
          />
        );
      }
      return null;
    });
  };

  const selectedCard = (state.canvasCards || []).find((c) => c.id === selectedCardId);

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] flex flex-col bg-slate-100 dark:bg-[#12141C] overflow-hidden select-none">
      {/* Hidden File Input for browsing computer files */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Floating Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Branding & Quick Add Menu */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Chaotic Corner for Creations</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
              {(state.canvasCards || []).length}
            </span>
          </div>

          {/* Add Card Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsAddCardOpen(!isAddCardOpen)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Card</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isAddCardOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-fade-in space-y-1">
                <button
                  onClick={() => handleAddCard("post_it")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <StickyNote className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-bold">Post-It Note</div>
                    <div className="text-[10px] text-slate-400">Colorful sticky note with pushpin</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("journal", { journalShape: "heart" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-bold">Fancy Heart Journal</div>
                    <div className="text-[10px] text-slate-400">Heart shaped card with Private toggle</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("journal", { journalShape: "flower" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <span className="text-sm">🌸</span>
                  <div>
                    <div className="font-bold">Fancy Flower Journal</div>
                    <div className="text-[10px] text-slate-400">Blossom shaped card with date stamp</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("image")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="font-bold">Photo / Image Card</div>
                    <div className="text-[10px] text-slate-400">Search computer for image file or URL</div>
                  </div>
                </button>

                <button
                  onClick={() => openWebcam("photo")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="font-bold">📷 Take Webcam Photo</div>
                    <div className="text-[10px] text-slate-400">Snap a quick snapshot from camera</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("audio")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Music className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-bold">Audio / Tune Card</div>
                    <div className="text-[10px] text-slate-400">Browse tunes from computer or URL</div>
                  </div>
                </button>

                <button
                  onClick={handleAddVoiceMemoCard}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-bold">🎙️ Record Voice Memo</div>
                    <div className="text-[10px] text-slate-400">Record voice note with microphone</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("video")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-bold">Video Clip Card</div>
                    <div className="text-[10px] text-slate-400">Browse computer video or URL</div>
                  </div>
                </button>

                <button
                  onClick={() => openWebcam("video")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Film className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">📹 Record Webcam Video</div>
                    <div className="text-[10px] text-slate-400">Capture video clip from webcam</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("event")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <CalendarIcon className="w-4 h-4 text-teal-500" />
                  <div>
                    <div className="font-bold">Event & Appointment</div>
                    <div className="text-[10px] text-slate-400">Linked to Calendar page</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("text_box")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Type className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-bold">Text Box on Canvas</div>
                    <div className="text-[10px] text-slate-400">Freeform text on bullet journal</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("code_sandbox")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Code className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-bold">💻 Code Sandbox</div>
                    <div className="text-[10px] text-slate-400">Live HTML/CSS/JS playground</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAddCard("web_embed")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-all text-left cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="font-bold">🌐 Media & Web Embed</div>
                    <div className="text-[10px] text-slate-400">YouTube, Spotify & iframes</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Stickers & Emojis Picker Button */}
          <div className="relative">
            <button
              onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Stickers & Emojis to stick on canvas"
            >
              <Smile className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Stickers</span>
            </button>

            {isStickerPickerOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-fade-in space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Stick on Canvas
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {STICKER_PRESETS.map((stk) => (
                    <button
                      key={stk}
                      onClick={() => handleAddSticker(stk)}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-transform cursor-pointer"
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Drawing & Tools Toolbar */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          {/* Select Tool */}
          <button
            onClick={() => setActiveTool("select")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              activeTool === "select"
                ? "bg-sky-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Select & Move Cards"
          >
            <Move className="w-4 h-4" />
          </button>

          {/* Pencil */}
          <button
            onClick={() => setActiveTool("pencil")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              activeTool === "pencil"
                ? "bg-sky-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Freehand Pencil / Pen"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Straight Line */}
          <button
            onClick={() => setActiveTool("line")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              activeTool === "line"
                ? "bg-sky-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Straight Line Pen"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Arrow */}
          <button
            onClick={() => setActiveTool("arrow")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              activeTool === "arrow"
                ? "bg-sky-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Arrow Pen"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Rectangle */}
          <button
            onClick={() => setActiveTool("rect")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              activeTool === "rect"
                ? "bg-sky-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Rectangle Shape Pen"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Circle */}
          <button
            onClick={() => setActiveTool("circle")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              activeTool === "circle"
                ? "bg-sky-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Circle Shape Pen"
          >
            <CircleIcon className="w-4 h-4" />
          </button>

          {/* Eraser */}
          <button
            onClick={() => setActiveTool("eraser")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              activeTool === "eraser"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Eraser (click strokes to erase)"
          >
            <Eraser className="w-4 h-4" />
          </button>

          {/* Color Picker for drawing */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
            {DRAWING_COLORS.slice(0, 5).map((col) => (
              <button
                key={col}
                onClick={() => setDrawColor(col)}
                className={`w-4 h-4 rounded-full border border-black/20 transition-transform ${
                  drawColor === col ? "scale-125 ring-2 ring-sky-500" : ""
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
            <input
              type="color"
              value={drawColor}
              onChange={(e) => setDrawColor(e.target.value)}
              className="w-5 h-5 rounded-full border-0 p-0 cursor-pointer overflow-hidden"
              title="Custom Pen Color"
            />
          </div>

          {/* Stroke Width selector */}
          <select
            value={drawWidth}
            onChange={(e) => setDrawWidth(Number(e.target.value))}
            className="text-[11px] bg-slate-100 dark:bg-slate-800 rounded-lg px-1.5 py-1 text-slate-700 dark:text-slate-300 border-0 focus:outline-hidden cursor-pointer"
          >
            <option value="2">Fine (2px)</option>
            <option value="3">Med (3px)</option>
            <option value="6">Bold (6px)</option>
            <option value="12">Thick (12px)</option>
          </select>

          {/* Undo drawing stroke */}
          {(state.canvasDrawings || []).length > 0 && (
            <button
              onClick={() => {
                updateState((prev) => ({
                  ...prev,
                  canvasDrawings: (prev.canvasDrawings || []).slice(0, -1),
                }));
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-all"
              title="Undo last stroke"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: View & Dotted Background Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          {/* Bullet Journal Dot toggle */}
          <button
            onClick={() => setShowDots(!showDots)}
            className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              showDots
                ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                : "text-slate-400"
            }`}
            title="Toggle Bullet Journal Dotted Grid"
          >
            <span>Dotted Grid</span>
          </button>

          {/* Background tone quick switcher */}
          <div className="flex items-center gap-1 px-1 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium hidden md:inline">Bg:</span>
            {[
              { label: "Light Gray", color: "#F3F4F6" },
              { label: "Soft Silver", color: "#E5E7EB" },
              { label: "Warm Paper", color: "#FAF9F5" },
              { label: "Crisp White", color: "#FFFFFF" },
              { label: "Dark Gray", color: "#13151D" },
            ].map((bg) => (
              <button
                key={bg.label}
                onClick={() =>
                  updateState((prev) => ({
                    ...prev,
                    customTheme: {
                      ...(prev.customTheme || {}),
                      customBgColor: bg.color,
                    },
                  }))
                }
                className={`w-3.5 h-3.5 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer ${
                  (state.customTheme?.customBgColor || "#F3F4F6") === bg.color ? "ring-2 ring-sky-500 scale-110" : ""
                }`}
                style={{ backgroundColor: bg.color }}
                title={`Canvas Background: ${bg.label}`}
              />
            ))}
          </div>

          {/* Zoom In/Out */}
          <button
            onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono font-bold text-slate-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Reset Canvas Position"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Connecting Notice Banner */}
      {connectingFromId && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <GitFork className="w-4 h-4" />
          <span>Click any target card to connect them together!</span>
          <button
            onClick={() => setConnectingFromId(null)}
            className="ml-2 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* The Main Infinite Canvas Stage */}
      <div
        id="canvas-bg"
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full relative overflow-hidden bg-[#F3F4F6] dark:bg-[#13151D] ${
          activeTool === "select" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
        }`}
        style={{
          backgroundColor: state.customTheme?.customBgColor || "#F3F4F6",
          backgroundImage: showDots
            ? `radial-gradient(circle, ${dotColor} 1.3px, transparent 1.3px)`
            : undefined,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        }}
      >
        {/* World Space Container (Transformed with Pan and Zoom) */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG Overlay for Connections (Behind cards) */}
          <svg
            className="absolute -top-[10000px] -left-[10000px] w-[30000px] h-[30000px] pointer-events-none z-0"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill={drawColor || "#3B82F6"} />
              </marker>
            </defs>

            {/* Mind map and connection lines */}
            {renderConnections()}
          </svg>

          {/* Cards Layer */}
          {(state.canvasCards || []).map((card) => {
            const isSelected = selectedCardId === card.id;
            const isConnecting = connectingFromId === card.id;
            const isUnlocked = !card.isPrivate || unlockedPrivateCards[card.id];

            // 1. STICKER CARD
            if (card.type === "sticker") {
              const isCardDragging = draggingCardId === card.id;
              return (
                <div
                  key={card.id}
                  data-card="true"
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    zIndex: card.zIndex,
                    touchAction: "none",
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing text-4xl p-2 select-none group ${
                    isCardDragging ? "" : "transition-transform duration-75"
                  } ${
                    isSelected ? "ring-2 ring-sky-500 rounded-2xl bg-sky-50/20 dark:bg-sky-950/30" : ""
                  }`}
                >
                  <span className="pointer-events-none select-none block leading-none">{card.stickerEmoji}</span>
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete sticker"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            }

            // 2. TEXT BOX CARD
            if (card.type === "text_box") {
              return (
                <div
                  key={card.id}
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px)`,
                    width: card.width || 250,
                    zIndex: card.zIndex,
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-3 rounded-xl transition-shadow group ${
                    isSelected ? "ring-2 ring-sky-500 bg-white/40 dark:bg-slate-900/40" : "hover:ring-1 hover:ring-slate-300"
                  }`}
                >
                  <textarea
                    value={card.content || ""}
                    onChange={(e) => handleUpdateCard(card.id, { content: e.target.value })}
                    placeholder="Write freeform notes..."
                    rows={4}
                    style={{ color: card.textColor || "#334155" }}
                    className="w-full bg-transparent border-0 resize-none font-serif text-sm focus:outline-hidden leading-relaxed"
                  />
                  {isSelected && (
                    <div className="flex items-center justify-end gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1 hover:bg-rose-100 text-rose-500 rounded-md text-xs cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // 2.5 SHAPE CARD (Container frame, Circle badge, Diamond milestone, Arrow)
            if (card.type === "shape") {
              const isCircle = card.shapeKind === "circle";
              const isDiamond = card.shapeKind === "diamond";
              const isArrow = card.shapeKind === "arrow";
              const borderClass =
                card.shapeBorder === "solid"
                  ? "border-solid"
                  : card.shapeBorder === "dotted"
                  ? "border-dotted"
                  : "border-dashed";

              return (
                <div
                  key={card.id}
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || (isCircle ? 200 : isDiamond ? 190 : isArrow ? 260 : 280),
                    height: card.height || (isCircle ? 200 : isDiamond ? 190 : isArrow ? 80 : 160),
                    zIndex: card.zIndex,
                    backgroundColor: card.backgroundColor || "rgba(241, 245, 249, 0.65)",
                    color: card.textColor || "#1E293B",
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-3.5 border-2 transition-all group backdrop-blur-xs flex flex-col justify-between ${
                    isCircle
                      ? "rounded-full aspect-square text-center items-center justify-center p-6 border-indigo-300 dark:border-indigo-700"
                      : isDiamond
                      ? "rounded-3xl border-amber-300 dark:border-amber-700"
                      : isArrow
                      ? "rounded-2xl border-sky-400 dark:border-sky-600"
                      : "rounded-2xl border-slate-300 dark:border-slate-700"
                  } ${borderClass} ${
                    isSelected ? "ring-4 ring-sky-500/40 scale-[1.01]" : "hover:border-sky-400"
                  }`}
                >
                  <div className="w-full flex items-center justify-between pb-1 border-b border-black/10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isCircle && <CircleIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                      {isDiamond && <Diamond className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      {isArrow && <ArrowRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                      {!isCircle && !isDiamond && !isArrow && (
                        <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <input
                        type="text"
                        value={card.title || ""}
                        onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                        placeholder="Shape Title..."
                        className="bg-transparent font-bold text-xs border-0 focus:outline-hidden truncate"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 hover:bg-rose-100 text-rose-500 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      title="Delete shape"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isCircle && !isArrow && (
                    <textarea
                      value={card.content || ""}
                      onChange={(e) => handleUpdateCard(card.id, { content: e.target.value })}
                      placeholder="Grouping description or notes..."
                      rows={2}
                      className="w-full bg-transparent border-0 resize-none text-xs focus:outline-hidden opacity-85 leading-relaxed my-1"
                    />
                  )}

                  {/* Footer actions: Connect & Border Toggle */}
                  <div className="w-full pt-1 flex items-center justify-between text-[10px] opacity-75 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFromId(card.id);
                      }}
                      className="px-2 py-0.5 rounded-md hover:bg-black/10 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <GitFork className="w-3 h-3" /> Connect
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateCard(card.id, {
                          shapeBorder:
                            card.shapeBorder === "dashed"
                              ? "solid"
                              : card.shapeBorder === "solid"
                              ? "dotted"
                              : "dashed",
                        });
                      }}
                      className="px-1.5 py-0.5 rounded-md hover:bg-black/10 text-[9px] font-mono capitalize cursor-pointer"
                      title="Toggle border style"
                    >
                      {card.shapeBorder || "dashed"}
                    </button>
                  </div>
                </div>
              );
            }

            // 3. FANCY HEART OR FLOWER JOURNAL CARD
            if (card.type === "journal") {
              const isHeart = card.journalShape === "heart";

              return (
                <div
                  key={card.id}
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || 280,
                    zIndex: card.zIndex,
                    backgroundColor: card.backgroundColor || (isHeart ? "#FFE4E6" : "#F3E8FF"),
                    color: card.textColor || (isHeart ? "#9F1239" : "#581C87"),
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-5 rounded-3xl shadow-lg border-2 transition-all group ${
                    isHeart
                      ? "border-rose-300/80 dark:border-rose-800"
                      : "border-purple-300/80 dark:border-purple-800"
                  } ${isSelected ? "ring-4 ring-sky-500/40 scale-[1.02]" : ""}`}
                >
                  {/* Decorative corner blossom / heart icon */}
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <div className="flex items-center gap-1.5">
                      {isHeart ? (
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                      ) : (
                        <span className="text-base">🌸</span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {isHeart ? "Heart Journal" : "Blossom Journal"}
                      </span>
                    </div>

                    {/* Public / Private Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateCard(card.id, { isPrivate: !card.isPrivate });
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        card.isPrivate
                          ? "bg-purple-900 text-white shadow-2xs"
                          : "bg-white/80 dark:bg-black/20 text-slate-700 dark:text-slate-200"
                      }`}
                      title="Toggle Public / Private. If private, sensitive text is concealed behind a padlock!"
                    >
                      {card.isPrivate ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-300" />
                          <span>Private</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          <span>Public</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Timestamp (Always Visible!) */}
                  <div className="pt-2">
                    <input
                      type="text"
                      value={card.title || ""}
                      onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                      placeholder="Journal Title..."
                      className="w-full bg-transparent font-bold text-sm border-0 focus:outline-hidden placeholder-black/30"
                    />
                    <div className="text-[10px] font-mono opacity-70 mt-0.5">
                      {card.timestamp || "Today"}
                    </div>
                  </div>

                  {/* Content or Private Lock Screen */}
                  <div className="pt-3">
                    {card.isPrivate && !isUnlocked ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnlockedPrivateCards((prev) => ({ ...prev, [card.id]: true }));
                        }}
                        className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 backdrop-blur-xs text-center space-y-1.5 cursor-pointer border border-dashed border-black/20 hover:bg-black/10 transition-colors"
                      >
                        <Lock className="w-5 h-5 mx-auto text-amber-500" />
                        <div className="text-xs font-bold">Confidential Reflections</div>
                        <div className="text-[10px] opacity-75">Click to unlock & reveal contents</div>
                      </div>
                    ) : (
                      <div className="relative">
                        <textarea
                          value={card.content || ""}
                          onChange={(e) => handleUpdateCard(card.id, { content: e.target.value })}
                          placeholder="Pour your heart into this card..."
                          rows={4}
                          className="w-full bg-transparent resize-none text-xs leading-relaxed focus:outline-hidden font-serif placeholder-black/30"
                        />
                        {card.isPrivate && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUnlockedPrivateCards((prev) => ({ ...prev, [card.id]: false }));
                            }}
                            className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                          >
                            <Lock className="w-3 h-3" /> Re-lock entry
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Controls */}
                  <div className="pt-3 flex items-center justify-between border-t border-black/10 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnectingFromId(card.id);
                        }}
                        className="p-1 hover:bg-black/10 rounded-lg transition-all cursor-pointer"
                        title="Connect to another card"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMindMapChild(card);
                        }}
                        className="p-1 hover:bg-black/10 rounded-lg transition-all cursor-pointer text-[10px] font-bold"
                        title="Add child branch (Mind Map)"
                      >
                        + Branch
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 hover:bg-rose-100 text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 4. IMAGE CARD
            if (card.type === "image") {
              const isCardDragging = draggingCardId === card.id;
              return (
                <div
                  key={card.id}
                  data-card="true"
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      handleDirectFileUpload(card.id, file);
                    }
                  }}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || 280,
                    zIndex: card.zIndex,
                    backgroundColor: card.backgroundColor || "#FFFFFF",
                    touchAction: "none",
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-3 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 transition-all group ${
                    isCardDragging ? "" : "transition-transform duration-75"
                  } ${isSelected ? "ring-4 ring-sky-500/40 scale-[1.01]" : ""}`}
                >
                  {/* Direct Hidden File Input */}
                  <input
                    type="file"
                    id={`image-file-${card.id}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDirectFileUpload(card.id, file);
                    }}
                  />

                  {/* Header Bar */}
                  <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                      <span>Photo / Art</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById(`image-file-${card.id}`)?.click();
                        }}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Browse computer files"
                      >
                        <FolderOpen className="w-3 h-3 text-sky-500" />
                        <span>Browse</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openWebcam("photo", card.id);
                        }}
                        className="px-2 py-0.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Take webcam photo"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Camera</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Display or Upload Dropzone */}
                  {card.mediaUrl ? (
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-4/3 group/img">
                      <img
                        src={card.mediaUrl}
                        alt={card.title || "Canvas Photo"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById(`image-file-${card.id}`)?.click();
                        }}
                        className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white rounded-lg text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Upload className="w-3 h-3" /> Replace
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(`image-file-${card.id}`)?.click();
                      }}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-xl p-5 text-center space-y-1.5 cursor-pointer bg-slate-50/70 dark:bg-slate-800/50 transition-colors"
                    >
                      <ImageIcon className="w-7 h-7 mx-auto text-sky-500" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Choose or Drop Image
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Click to browse computer or drag & drop here
                      </div>
                    </div>
                  )}

                  {/* Title & Caption */}
                  <div className="pt-2 space-y-1">
                    <input
                      type="text"
                      value={card.title || ""}
                      onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                      placeholder="Photo Title..."
                      className="w-full bg-transparent font-bold text-xs text-slate-900 dark:text-white border-0 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={card.mediaCaption || ""}
                      onChange={(e) => handleUpdateCard(card.id, { mediaCaption: e.target.value })}
                      placeholder="Add caption or memo..."
                      className="w-full bg-transparent text-[11px] text-slate-500 border-0 focus:outline-hidden"
                    />
                    {/* URL Input fallback */}
                    {!card.mediaUrl && (
                      <input
                        type="url"
                        placeholder="Or paste image web link..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCard(card.id, { mediaUrl: e.currentTarget.value });
                          }
                        }}
                        className="w-full text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border-0 focus:outline-hidden"
                      />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFromId(card.id);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <GitFork className="w-3 h-3" /> Connect
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 5. AUDIO CARD (Tunes / Voice Clips)
            if (card.type === "audio") {
              const isPlaying = playingAudioId === card.id;
              const isVoiceRecordingThis = isRecordingVoice && activeVoiceCardId === card.id;
              const isCardDragging = draggingCardId === card.id;

              return (
                <div
                  key={card.id}
                  data-card="true"
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("audio/")) {
                      handleDirectFileUpload(card.id, file);
                    }
                  }}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || 310,
                    zIndex: card.zIndex,
                    backgroundColor: card.backgroundColor || "#E0F2FE",
                    color: card.textColor || "#0369A1",
                    touchAction: "none",
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-4 rounded-3xl shadow-lg border-2 border-sky-200 dark:border-sky-800 transition-all group ${
                    isCardDragging ? "" : "transition-transform duration-75"
                  } ${isSelected ? "ring-4 ring-sky-500/40 scale-[1.01]" : ""}`}
                >
                  {/* Direct Hidden File Input */}
                  <input
                    type="file"
                    id={`audio-file-${card.id}`}
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDirectFileUpload(card.id, file);
                    }}
                  />

                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <div className="flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-sky-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Audio & Voice
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isVoiceRecordingThis ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            stopVoiceRecording();
                          }}
                          className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs animate-pulse cursor-pointer"
                        >
                          <Square className="w-3 h-3 fill-white" />
                          <span>Stop ({voiceSeconds}s)</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startVoiceRecording(card.id);
                          }}
                          className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="Record voice note with microphone"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Record Mic</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById(`audio-file-${card.id}`)?.click();
                        }}
                        className="px-2 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Browse computer for audio file"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>

                  {/* Recording Status Banner if actively recording on this card */}
                  {isVoiceRecordingThis && (
                    <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      <span>Recording voice note... {voiceSeconds}s</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <input
                      type="text"
                      value={card.title || ""}
                      onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                      placeholder="Track / Clip Title..."
                      className="w-full bg-transparent font-bold text-xs border-0 focus:outline-hidden"
                    />
                    <div className="text-[10px] opacity-75 font-mono truncate">
                      {card.mediaFileName || card.mediaCaption || "Browse computer audio or record mic"}
                    </div>
                  </div>

                  {/* Audio Player & Waveform Visualizer */}
                  {card.mediaUrl ? (
                    <div className="pt-3 space-y-2">
                      <div className="flex items-center gap-3 bg-white/80 dark:bg-black/30 p-2.5 rounded-2xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayAudio(card.id, card.mediaUrl);
                          }}
                          className="w-9 h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>

                        {/* Animated waveform bars */}
                        <div className="flex items-center gap-1 flex-1 h-6">
                          {[30, 70, 45, 90, 60, 80, 40, 65, 85, 50, 75, 95].map((h, idx) => (
                            <div
                              key={idx}
                              className={`flex-1 rounded-full bg-sky-500 transition-all ${
                                isPlaying ? "animate-pulse" : "opacity-40"
                              }`}
                              style={{
                                height: isPlaying ? `${h}%` : "30%",
                                animationDelay: `${idx * 80}ms`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-1.5">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById(`audio-file-${card.id}`)?.click();
                        }}
                        className="border border-dashed border-sky-400/60 rounded-xl p-3 text-center cursor-pointer hover:bg-white/40 transition-colors"
                      >
                        <div className="text-[11px] font-bold">Click to browse computer sound file</div>
                        <div className="text-[9px] opacity-70">Supports .mp3, .wav, .m4a, .webm</div>
                      </div>
                      <input
                        type="url"
                        placeholder="Or enter audio URL (.mp3, .ogg)..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCard(card.id, { mediaUrl: e.currentTarget.value });
                          }
                        }}
                        className="w-full text-[10px] bg-white/60 dark:bg-black/20 px-2 py-1 rounded-xl border-0 focus:outline-hidden"
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-2 mt-2 border-t border-black/10 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFromId(card.id);
                      }}
                      className="p-1 text-[10px] font-bold flex items-center gap-1 hover:bg-black/10 rounded-lg cursor-pointer"
                    >
                      <GitFork className="w-3 h-3" /> Connect
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 hover:bg-rose-100 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 6. VIDEO CARD
            if (card.type === "video") {
              const isCardDragging = draggingCardId === card.id;
              return (
                <div
                  key={card.id}
                  data-card="true"
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("video/")) {
                      handleDirectFileUpload(card.id, file);
                    }
                  }}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || 320,
                    zIndex: card.zIndex,
                    backgroundColor: card.backgroundColor || "#FFFFFF",
                    touchAction: "none",
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-3.5 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 transition-all group ${
                    isCardDragging ? "" : "transition-transform duration-75"
                  } ${isSelected ? "ring-4 ring-sky-500/40 scale-[1.01]" : ""}`}
                >
                  {/* Direct Hidden File Input */}
                  <input
                    type="file"
                    id={`video-file-${card.id}`}
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDirectFileUpload(card.id, file);
                    }}
                  />

                  {/* Header Bar */}
                  <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span>Video Clip</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById(`video-file-${card.id}`)?.click();
                        }}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Browse computer for video"
                      >
                        <FolderOpen className="w-3 h-3 text-sky-500" />
                        <span>Browse</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openWebcam("video", card.id);
                        }}
                        className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Record webcam video"
                      >
                        <Video className="w-3 h-3" />
                        <span>Record Cam</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Player */}
                  {card.mediaUrl ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-16/9">
                      <video
                        src={card.mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(`video-file-${card.id}`)?.click();
                      }}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 rounded-2xl p-5 text-center space-y-1.5 cursor-pointer bg-slate-50/70 dark:bg-slate-800/50"
                    >
                      <Video className="w-7 h-7 mx-auto text-rose-500" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Choose or Drop Video
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Click to browse computer or drag & drop here
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-1">
                    <input
                      type="text"
                      value={card.title || ""}
                      onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                      placeholder="Video Title..."
                      className="w-full bg-transparent font-bold text-xs text-slate-900 dark:text-white border-0 focus:outline-hidden"
                    />
                    {!card.mediaUrl && (
                      <input
                        type="url"
                        placeholder="Or enter video link (.mp4, etc.)..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCard(card.id, { mediaUrl: e.currentTarget.value });
                          }
                        }}
                        className="w-full text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl border-0 focus:outline-hidden"
                      />
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFromId(card.id);
                      }}
                      className="p-1 text-[10px] font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                    >
                      <GitFork className="w-3 h-3" /> Connect
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 hover:bg-rose-100 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 7. EVENT & APPOINTMENTS CARD (Linked to Calendar page)
            if (card.type === "event") {
              return (
                <div
                  key={card.id}
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || 270,
                    zIndex: card.zIndex,
                    backgroundColor: card.backgroundColor || "#ECFDF5",
                    color: card.textColor || "#065F46",
                  }}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-4 rounded-3xl shadow-lg border-2 border-emerald-300 dark:border-emerald-800 transition-all group ${
                    isSelected ? "ring-4 ring-emerald-500/40 scale-[1.01]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Calendar Appointment
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToTab("calendar");
                      }}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Open Calendar Page"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Calendar</span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <input
                      type="text"
                      value={card.title || ""}
                      onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                      placeholder="Appointment / Holiday..."
                      className="w-full bg-transparent font-bold text-xs border-0 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={card.eventDate || ""}
                        onChange={(e) => handleUpdateCard(card.id, { eventDate: e.target.value })}
                        className="bg-white/70 dark:bg-black/20 text-[11px] font-mono px-2 py-1 rounded-lg border-0 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={card.eventTime || ""}
                        onChange={(e) => handleUpdateCard(card.id, { eventTime: e.target.value })}
                        placeholder="Time (e.g. 10:30 AM)"
                        className="w-24 bg-white/70 dark:bg-black/20 text-[11px] font-mono px-2 py-1 rounded-lg border-0 focus:outline-hidden"
                      />
                    </div>

                    <textarea
                      value={card.content || ""}
                      onChange={(e) => handleUpdateCard(card.id, { content: e.target.value })}
                      placeholder="Location, notes, or prep..."
                      rows={2}
                      className="w-full bg-transparent text-xs leading-snug border-0 resize-none focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 mt-2 border-t border-black/10 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFromId(card.id);
                      }}
                      className="p-1 text-[10px] font-bold flex items-center gap-1 hover:bg-black/10 rounded-lg cursor-pointer"
                    >
                      <GitFork className="w-3 h-3" /> Connect
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-1 hover:bg-rose-100 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 7b. INTERACTIVE CODE SANDBOX CARD (HTML/CSS/JS Playground)
            if (card.type === "code_sandbox") {
              return (
                <div
                  key={card.id}
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || 560,
                    height: card.height || 420,
                    zIndex: card.zIndex,
                  }}
                  className={`absolute pointer-events-auto rounded-3xl shadow-2xl transition-all group flex flex-col bg-slate-900 border-2 border-indigo-500/40 ${
                    isSelected ? "ring-4 ring-indigo-500/50 scale-[1.005]" : ""
                  }`}
                >
                  {/* Top Drag Handle Header */}
                  <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none rounded-t-3xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Code className="w-4 h-4 text-indigo-400" />
                      <span>{card.title || "Code Playground"}</span>
                      <span className="text-[10px] font-normal text-slate-500 font-mono">HTML/CSS/JS</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnectingFromId(card.id);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-1 cursor-pointer"
                        title="Connect with another card"
                      >
                        <GitFork className="w-3 h-3 text-indigo-400" /> Connect
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateCard(card.id, {
                            width: (card.width || 560) === 720 ? 560 : 720,
                            height: (card.height || 420) === 520 ? 420 : 520,
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
                        title="Toggle Card Size"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        className="p-1 hover:bg-rose-900/60 text-rose-400 rounded-md cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sandbox Body */}
                  <div className="flex-1 min-h-0 overflow-hidden rounded-b-3xl">
                    <CanvasCodeSandbox
                      card={card}
                      onUpdate={(updates) => handleUpdateCard(card.id, updates)}
                      isLocked={card.pinned}
                    />
                  </div>
                </div>
              );
            }

            // 7c. MEDIA & WEB EMBED CARD (YouTube, Spotify, Webpages, iframes)
            if (card.type === "web_embed") {
              return (
                <div
                  key={card.id}
                  onMouseDown={(e) => handleCardMouseDown(e, card)}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                    width: card.width || 480,
                    height: card.height || 380,
                    zIndex: card.zIndex,
                  }}
                  className={`absolute pointer-events-auto rounded-3xl shadow-2xl transition-all group flex flex-col bg-slate-900 border-2 border-sky-500/40 ${
                    isSelected ? "ring-4 ring-sky-500/50 scale-[1.005]" : ""
                  }`}
                >
                  {/* Top Drag Handle Header */}
                  <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none rounded-t-3xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>{card.title || "Web & Media Embed"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnectingFromId(card.id);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-1 cursor-pointer"
                        title="Connect with another card"
                      >
                        <GitFork className="w-3 h-3 text-sky-400" /> Connect
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateCard(card.id, {
                            width: (card.width || 480) === 640 ? 480 : 640,
                            height: (card.height || 380) === 480 ? 380 : 480,
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
                        title="Toggle Card Size"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        className="p-1 hover:bg-rose-900/60 text-rose-400 rounded-md cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Embed Body */}
                  <div className="flex-1 min-h-0 overflow-hidden rounded-b-3xl">
                    <CanvasWebEmbed
                      card={card}
                      onUpdate={(updates) => handleUpdateCard(card.id, updates)}
                      isLocked={card.pinned}
                    />
                  </div>
                </div>
              );
            }

            // 8. STANDARD POST-IT NOTE CARD
            return (
              <div
                key={card.id}
                onMouseDown={(e) => handleCardMouseDown(e, card)}
                style={{
                  transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation || 0}deg)`,
                  width: card.width || 250,
                  zIndex: card.zIndex,
                  backgroundColor: card.backgroundColor || "#FEF08A",
                  color: card.textColor || "#713F12",
                }}
                className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing p-4 rounded-2xl shadow-md border border-black/10 transition-all group ${
                  isSelected ? "ring-4 ring-sky-500/40 scale-[1.01]" : ""
                }`}
              >
                {/* Pushpin at top center */}
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white/60 shadow-md mx-auto -mt-6 mb-2" />

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={card.title || ""}
                    onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                    placeholder="Sticky Title..."
                    className="w-full bg-transparent font-bold text-xs border-0 focus:outline-hidden"
                  />
                  <textarea
                    value={card.content || ""}
                    onChange={(e) => handleUpdateCard(card.id, { content: e.target.value })}
                    placeholder="Quick thought..."
                    rows={4}
                    className="w-full bg-transparent text-xs leading-relaxed border-0 resize-none focus:outline-hidden"
                  />
                </div>

                {/* Cross-App Link Badge (if attached) */}
                {card.linkedAppItem && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.linkedAppItem) {
                        onNavigateToTab(
                          card.linkedAppItem.targetType === "note"
                            ? "notes"
                            : card.linkedAppItem.targetType === "project"
                            ? "coding"
                            : card.linkedAppItem.targetType === "hustle"
                            ? "finance"
                            : "dashboard",
                          card.linkedAppItem.targetId
                        );
                      }
                    }}
                    className="mt-2 px-2 py-1 rounded-lg bg-black/10 hover:bg-black/20 text-[10px] font-bold flex items-center gap-1 truncate cursor-pointer transition-colors"
                  >
                    <LinkIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{card.linkedAppItem.targetTitle}</span>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-2 mt-2 border-t border-black/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFromId(card.id);
                      }}
                      className="p-1 hover:bg-black/10 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Connect to another card"
                    >
                      <GitFork className="w-3 h-3" /> Connect
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddMindMapChild(card);
                      }}
                      className="p-1 hover:bg-black/10 rounded-lg text-[10px] font-bold cursor-pointer"
                      title="Branch child idea"
                    >
                      + Branch
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(card.id);
                    }}
                    className="p-1 hover:bg-rose-100 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* SVG Overlay for Drawings (On top of cards) */}
          <svg
            ref={canvasSvgRef}
            className="absolute -top-[10000px] -left-[10000px] w-[30000px] h-[30000px] pointer-events-none z-30"
          >
            {renderDrawings()}
          </svg>
        </div>

        {/* Drawing Mode Interceptor: When activeTool !== 'select', user can freely doodle anywhere without cards interfering */}
        {activeTool !== "select" && (
          <div
            className="absolute inset-0 z-40 cursor-crosshair pointer-events-auto"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        )}
      </div>

      {/* Selected Card Floating Customizer Bar */}
      {selectedCard && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-3 animate-fade-in text-xs max-w-[94vw] overflow-x-auto">
          <div className="font-bold text-slate-700 dark:text-slate-200 pr-2 border-r border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shrink-0">
            <Palette className="w-3.5 h-3.5 text-sky-500" />
            <span>Customize Card</span>
          </div>

          {/* Color Presets */}
          <div className="flex items-center gap-1.5 shrink-0">
            {COLOR_PRESETS.map((col) => (
              <button
                key={col.name}
                onClick={() =>
                  handleUpdateCard(selectedCard.id, {
                    backgroundColor: col.bg,
                    textColor: col.text,
                  })
                }
                className="w-5 h-5 rounded-full border border-black/20 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: col.bg }}
                title={col.name}
              />
            ))}
          </div>

          {/* Stacking Order buttons */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => bringToFront(selectedCard.id)}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-[10px] font-bold cursor-pointer"
              title="Bring Card to Front"
            >
              Bring Front
            </button>
            <button
              onClick={() => {
                const minZ = Math.min(...(state.canvasCards || []).map((c) => c.zIndex || 0));
                handleUpdateCard(selectedCard.id, { zIndex: Math.max(0, minZ - 1) });
              }}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-[10px] font-bold cursor-pointer"
              title="Send Card to Back"
            >
              Send Back
            </button>
          </div>

          {/* Cross-App Link Trigger */}
          <button
            onClick={() => setIsLinkingModalOpen(true)}
            className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{selectedCard.linkedAppItem ? "Change App Link" : "Link to App Item"}</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDeleteCard(selectedCard.id)}
            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer ml-1 shrink-0"
            title="Delete Card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dedicated Bottom Canvas Creation Toolbar */}
      <div
        id="canvas-bottom-toolbar-container"
        className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto max-w-[96vw]"
      >
        {/* Submenu Popover Panels above active button */}
        {bottomMenuOpen && (
          <div className="mb-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl animate-fade-in text-xs z-50">
            {/* 1. Note palette menu */}
            {bottomMenuOpen === "note" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <StickyNote className="w-4 h-4 text-amber-500" />
                    <span>Sticky Note Color</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLOR_PRESETS.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => {
                        handleAddCard("post_it", {
                          backgroundColor: col.bg,
                          textColor: col.text,
                        });
                        setBottomMenuOpen(null);
                      }}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl border border-black/10 hover:scale-105 transition-all text-left cursor-pointer"
                      style={{ backgroundColor: col.bg, color: col.text }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: col.bg }}
                      />
                      <span className="text-[10px] font-bold truncate">
                        {col.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Journal menu */}
            {bottomMenuOpen === "journal" && (
              <div className="w-68 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>New Journal Entry</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleAddCard("journal", { journalShape: "heart" });
                      setBottomMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                      <Heart className="w-4 h-4 fill-rose-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Fancy Heart Journal</div>
                      <div className="text-[10px] text-slate-400">Heart silhouette with date stamp & privacy lock</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleAddCard("journal", { journalShape: "flower" });
                      setBottomMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                      <span>🌸</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Fancy Flower Journal</div>
                      <div className="text-[10px] text-slate-400">Blossom-shaped journal card</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleAddCard("journal", { journalShape: "heart", isPrivate: true });
                      setBottomMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Locked Private Journal</div>
                      <div className="text-[10px] text-slate-400">Starts masked with password-style toggle</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Mind Map menu */}
            {bottomMenuOpen === "mindmap" && (
              <div className="w-72 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <GitFork className="w-4 h-4 text-sky-500" />
                    <span>Mind Map Diagram</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleAddMindMapDiagram("classic")}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                      <GitFork className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Concept Diagram Tree</div>
                      <div className="text-[10px] text-slate-400">Central theme with connected branches & curved lines</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddMindMapDiagram("brainstorm")}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">360° Brainstorm Cluster</div>
                      <div className="text-[10px] text-slate-400">Goals, deliverables & opportunity nodes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleAddCard("post_it", {
                        title: "🧠 Mind Map Node",
                        content: "Sub-topic node. Click '+ Branch' to link thoughts!",
                        backgroundColor: "#E0F2FE",
                        textColor: "#0369A1",
                      });
                      setBottomMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Single Branch Node</div>
                      <div className="text-[10px] text-slate-400">Add an individual node to manually connect</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Shape menu */}
            {bottomMenuOpen === "shape" && (
              <div className="w-72 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <Square className="w-4 h-4 text-violet-500" />
                    <span>Canvas Shapes & Frames</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleAddShape("rect")}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Rectangle</div>
                      <div className="text-[9px] text-slate-400">Grouping Box</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddShape("circle")}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800"
                  >
                    <CircleIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Circle</div>
                      <div className="text-[9px] text-slate-400">Focus Badge</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddShape("diamond")}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-all cursor-pointer border border-amber-200 dark:border-amber-800"
                  >
                    <Diamond className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Diamond</div>
                      <div className="text-[9px] text-slate-400">Milestone</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddShape("arrow")}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/40 text-left transition-all cursor-pointer border border-sky-200 dark:border-sky-800"
                  >
                    <ArrowRight className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Arrow</div>
                      <div className="text-[9px] text-slate-400">Phase Pointer</div>
                    </div>
                  </button>
                </div>

                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Draw with pen:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveTool("rect");
                        setBottomMenuOpen(null);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      Pen Rect
                    </button>
                    <button
                      onClick={() => {
                        setActiveTool("circle");
                        setBottomMenuOpen(null);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      Pen Circle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Video menu */}
            {bottomMenuOpen === "video" && (
              <div className="w-68 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <Video className="w-4 h-4 text-emerald-500" />
                    <span>Add Video Clip</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleAddMediaCardWithUpload("video", true)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Search Computer for Video</div>
                      <div className="text-[10px] text-slate-400">Select .mp4, .webm, or video clip</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddMediaCardWithUpload("video", false)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Paste Video Web Link</div>
                      <div className="text-[10px] text-slate-400">Stream directly using online URL</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 6. Song menu */}
            {bottomMenuOpen === "song" && (
              <div className="w-68 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <Music className="w-4 h-4 text-indigo-500" />
                    <span>Add Song & Audio Tune</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleAddMediaCardWithUpload("audio", true)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Search Computer for Audio</div>
                      <div className="text-[10px] text-slate-400">Upload .mp3, .wav, or voice clip</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddMediaCardWithUpload("audio", false)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Stream Audio URL</div>
                      <div className="text-[10px] text-slate-400">Play web stream or audio link</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 7. Image menu */}
            {bottomMenuOpen === "image" && (
              <div className="w-68 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <ImageIcon className="w-4 h-4 text-cyan-500" />
                    <span>Add Image & Photo Card</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleAddMediaCardWithUpload("image", true)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Search Computer for Photo</div>
                      <div className="text-[10px] text-slate-400">Select .png, .jpg, or graphics</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddMediaCardWithUpload("image", false)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Paste Image Web Link</div>
                      <div className="text-[10px] text-slate-400">Embed online photo via URL</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 8. Sticker menu */}
            {bottomMenuOpen === "sticker" && (
              <div className="w-72 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <Smile className="w-4 h-4 text-amber-500" />
                    <span>Stamp Sticker on Canvas</span>
                  </div>
                  <button
                    onClick={() => setBottomMenuOpen(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1">
                  {STICKER_PRESETS.map((stk) => (
                    <button
                      key={stk}
                      onClick={() => {
                        handleAddSticker(stk);
                        setBottomMenuOpen(null);
                      }}
                      className="w-9 h-9 flex items-center justify-center text-2xl hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-transform cursor-pointer"
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Toolbar Dock Bar */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl sm:rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-2xl flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full">
          {/* 1. Note */}
          <button
            id="canvas-toolbar-note"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "note" ? null : "note")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "note"
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 shadow-xs ring-2 ring-amber-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            }`}
            title="Add Sticky Note"
          >
            <StickyNote className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Note</span>
            <ChevronUp className="w-3 h-3 opacity-50 shrink-0" />
          </button>

          {/* 2. Journal Entry */}
          <button
            id="canvas-toolbar-journal"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "journal" ? null : "journal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "journal"
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 shadow-xs ring-2 ring-rose-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
            title="Add Fancy Journal Entry"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />
            <span className="hidden sm:inline">Journal</span>
            <ChevronUp className="w-3 h-3 opacity-50 shrink-0" />
          </button>

          {/* 3. Mind Map Diagram */}
          <button
            id="canvas-toolbar-mindmap"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "mindmap" ? null : "mindmap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "mindmap"
                ? "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 shadow-xs ring-2 ring-sky-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/30"
            }`}
            title="Add Mind Map Diagram"
          >
            <GitFork className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="hidden sm:inline">Mind Map</span>
            <ChevronUp className="w-3 h-3 opacity-50 shrink-0" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0" />

          {/* 4. Shape */}
          <button
            id="canvas-toolbar-shape"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "shape" ? null : "shape")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "shape"
                ? "bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-200 shadow-xs ring-2 ring-violet-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/30"
            }`}
            title="Add Shapes & Frames"
          >
            <Square className="w-4 h-4 text-violet-500 shrink-0" />
            <span className="hidden sm:inline">Shape</span>
            <ChevronUp className="w-3 h-3 opacity-50 shrink-0" />
          </button>

          {/* 5. Video */}
          <button
            id="canvas-toolbar-video"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "video" ? null : "video")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "video"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            }`}
            title="Add Video Card"
          >
            <Video className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="hidden sm:inline">Video</span>
            <ChevronUp className="w-3 h-3 opacity-50 shrink-0" />
          </button>

          {/* 6. Song */}
          <button
            id="canvas-toolbar-song"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "song" ? null : "song")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "song"
                ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 shadow-xs ring-2 ring-indigo-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            }`}
            title="Add Song & Tune"
          >
            <Music className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">Song</span>
            <ChevronUp className="w-3 h-3 opacity-50 shrink-0" />
          </button>

          {/* 7. Image */}
          <button
            id="canvas-toolbar-image"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "image" ? null : "image")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "image"
                ? "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 shadow-xs ring-2 ring-cyan-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
            }`}
            title="Add Image Card"
          >
            <ImageIcon className="w-4 h-4 text-cyan-500 shrink-0" />
            <span className="hidden sm:inline">Image</span>
            <ChevronUp className="w-3 h-3 opacity-50 shrink-0" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0" />

          {/* 8. Event Card */}
          <button
            id="canvas-toolbar-event"
            onClick={() => handleAddCard("event")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all cursor-pointer"
            title="Add Event & Appointment"
          >
            <CalendarIcon className="w-4 h-4 text-teal-500 shrink-0" />
            <span className="hidden sm:inline">Event</span>
          </button>

          {/* 9. Text Box */}
          <button
            id="canvas-toolbar-text"
            onClick={() => handleAddCard("text_box")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Add Text directly on canvas"
          >
            <Type className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="hidden sm:inline">Text</span>
          </button>

          {/* 10. Sticker */}
          <button
            id="canvas-toolbar-sticker"
            onClick={() => setBottomMenuOpen(bottomMenuOpen === "sticker" ? null : "sticker")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
              bottomMenuOpen === "sticker"
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 shadow-xs ring-2 ring-amber-400/50"
                : "text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            }`}
            title="Stamp Stickers"
          >
            <Smile className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Sticker</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0" />

          {/* 11. Code Sandbox */}
          <button
            id="canvas-toolbar-code"
            onClick={() => handleAddCard("code_sandbox")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer"
            title="Interactive Code Sandbox (HTML/CSS/JS)"
          >
            <Code className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">Code</span>
          </button>

          {/* 12. Web Embed */}
          <button
            id="canvas-toolbar-embed"
            onClick={() => handleAddCard("web_embed")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-all cursor-pointer"
            title="Embed YouTube Video, Spotify, or Webpage"
          >
            <Globe className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="hidden sm:inline">Embed</span>
          </button>
        </div>
      </div>

      {/* Cross-App Linking Modal (Connects cards to Notes, Projects, Hustles, etc.) */}
      {isLinkingModalOpen && selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Link Card to Workspace Item
                </h3>
              </div>
              <button
                onClick={() => setIsLinkingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select any document, project, side hustle, or account from your OS to link directly with this card:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {/* Notes */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes & Knowledge</div>
              {state.notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    handleUpdateCard(selectedCard.id, {
                      linkedAppItem: {
                        targetType: "note",
                        targetId: note.id,
                        targetTitle: note.title,
                      },
                    });
                    setIsLinkingModalOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{note.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Note</span>
                </button>
              ))}

              {/* Projects */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Coding Workbench</div>
              {state.projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    handleUpdateCard(selectedCard.id, {
                      linkedAppItem: {
                        targetType: "project",
                        targetId: proj.id,
                        targetTitle: proj.title,
                      },
                    });
                    setIsLinkingModalOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{proj.title}</span>
                  <span className="text-[10px] text-sky-500 font-mono">Project</span>
                </button>
              ))}

              {/* Side Hustles */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Side Hustles</div>
              {state.sideHustles.map((hustle) => (
                <button
                  key={hustle.id}
                  onClick={() => {
                    handleUpdateCard(selectedCard.id, {
                      linkedAppItem: {
                        targetType: "hustle",
                        targetId: hustle.id,
                        targetTitle: hustle.title,
                      },
                    });
                    setIsLinkingModalOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{hustle.title}</span>
                  <span className="text-[10px] text-emerald-500 font-mono">Hustle</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Webcam Studio Modal (Live Camera Viewport for Photos & Video Recording) */}
      {webcamOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-700 max-w-lg w-full p-5 shadow-2xl space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold">
                  {webcamMode === "photo" ? "Webcam Snapshot Camera" : "Webcam Video Recorder"}
                </h3>
              </div>
              <button
                onClick={closeWebcam}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl gap-1">
              <button
                onClick={() => switchWebcamMode("photo")}
                disabled={isRecordingWebcamVideo}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  webcamMode === "photo"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                } ${isRecordingWebcamVideo ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take Photo</span>
              </button>
              <button
                onClick={() => switchWebcamMode("video")}
                disabled={isRecordingWebcamVideo}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  webcamMode === "video"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                } ${isRecordingWebcamVideo ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Record Video</span>
              </button>
            </div>

            {/* Live Camera Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-800">
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Recording indicator */}
              {isRecordingWebcamVideo && (
                <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>REC {String(Math.floor(webcamSeconds / 60)).padStart(2, "0")}:{String(webcamSeconds % 60).padStart(2, "0")}</span>
                </div>
              )}
            </div>

            {/* Shutter / Record Controls */}
            <div className="pt-1 flex items-center justify-center gap-4">
              {webcamMode === "photo" ? (
                <button
                  onClick={snapWebcamPhoto}
                  className="px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap & Save Photo</span>
                </button>
              ) : !isRecordingWebcamVideo ? (
                <button
                  onClick={startWebcamVideoRecording}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopWebcamVideoRecording}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-200 text-rose-600 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-600" />
                  <span>Stop & Save Video</span>
                </button>
              )}

              <button
                onClick={closeWebcam}
                className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
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
