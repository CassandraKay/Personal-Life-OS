import { ThemeId } from "./themes";

export type TabType =
  | "dashboard"
  | "profile"
  | "bible_study"
  | "canvas"
  | "calendar"
  | "index"
  | "notes"
  | "coding"
  | "vault"
  | "finance"
  | "learning"
  | "creative"
  | "media"
  | "selfcare"
  | "ai_copilot"
  | "sync_settings";

export type PrayerCategory =
  | "praise" // Praise & Adoration of God / Thanksgiving to Jesus Christ
  | "personal" // Personal Walk with God, Sanctification & Petitions
  | "family" // Family & Loved Ones
  | "salvation" // Salvation of Friends, Family & the Lost
  | "healing" // Health, Healing & Comfort
  | "guidance" // Wisdom, Decision-Making & God's Will
  | "church_world"; // Local Church, Pastors & Mission

export interface PrayerUpdate {
  id: string;
  date: string;
  text: string;
}

export interface PrayerItem {
  id: string;
  title: string;
  description: string;
  category: PrayerCategory;
  scriptureReference?: string; // e.g. "Philippians 4:6-7"
  dateCreated: string;
  isAnswered: boolean;
  dateAnswered?: string;
  answerPraiseReport?: string; // Testimony of how God answered
  timesPrayed: number;
  lastPrayedDate?: string;
  isUrgent?: boolean;
  pinned?: boolean;
  updates?: PrayerUpdate[];
}

export interface BibleStudyNote {
  id: string;
  title: string;
  passage: string; // e.g. "John 1:1-14"
  date: string;
  scriptureText: string;
  observation: string; // What does the text say about God, Christ, truth?
  application: string; // How does this apply to my life today in following Christ?
  prayer: string; // Prayer responding to this scripture
  tags: string[];
}

export interface BibleBookmark {
  id: string;
  book: string;
  chapter: number;
  verse?: number;
  title: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  isDailyGoal?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: "Full Stack" | "Frontend" | "Backend/API" | "Mobile" | "AI/ML" | "Creative/Game" | "Tool/Script";
  status: "Idea" | "Planning" | "In Development" | "Beta" | "Launched" | "Paused";
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  architectureNotes?: string;
  tasks: ProjectTask[];
  mediaAssetIds?: string[];
  targetLaunchDate?: string;
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  url?: string;
  type: "Course" | "Video" | "Book" | "Doc" | "Project" | "Interactive";
  completed: boolean;
}

export interface LearningItem {
  id: string;
  topic: string;
  category: "Coding & Tech" | "Design & Art" | "Business & Marketing" | "Life & Philosophy" | "Languages";
  status: "Want to Learn" | "In Progress" | "Proficient" | "Mastered";
  progressPct: number;
  keyTakeaways: string;
  resources: LearningResource[];
  targetCompletion?: string;
  updatedAt: string;
}

export interface FlashcardItem {
  id: string;
  topicId?: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timesReviewed: number;
  lastScore?: "know" | "forgot";
  nextReviewDate?: string;
}

export interface AccountVaultItem {
  id: string;
  serviceName: string;
  usernameOrEmail: string;
  passwordEncrypted: string;
  category: "Dev & Cloud" | "Finance & Banking" | "Social & Comms" | "Tools & Subscriptions" | "Gaming & Misc";
  url?: string;
  notes?: string;
  isFavorite?: boolean;
  twoFactorNote?: string;
  securityStrength?: "weak" | "medium" | "strong";
  updatedAt: string;
}

export interface FinancialEntry {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: "Freelance/Coding" | "Side Hustle/Product" | "Day Job" | "Subscriptions/Dev Tools" | "Hosting/Servers" | "Learning/Books" | "Art Supplies" | "Living/Personal" | "Other";
  description: string;
  date: string;
  sourceOrClient?: string;
}

export interface SideHustleTask {
  id: string;
  text: string;
  done: boolean;
}

export interface SideHustleIdea {
  id: string;
  title: string;
  tagline: string;
  targetAudience: string;
  monetization: string;
  difficulty: "Easy" | "Medium" | "Challenging";
  initialCost: string;
  timeToFirstDollar: string;
  potentialMonthlyRevenue: string;
  status: "Idea" | "Validating" | "Building MVP" | "Active & Earning" | "Archived";
  score: number;
  firstThreeSteps: string[];
  skillsNeeded: string[];
  notes?: string;
  checklist: SideHustleTask[];
  actualRevenueEarned?: number;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  fileName?: string;
  dataUrlOrPath: string;
  mediaType: "image" | "audio" | "code_asset" | "document";
  sizeKb?: number;
  category: string;
  tags: string[];
  width?: number;
  height?: number;
  createdAt: string;
}

export interface CreativeHobbyItem {
  id: string;
  title: string;
  hobbyType: "Digital Art & Illustration" | "Music & Audio" | "Writing & Storytelling" | "3D Modeling & Animation" | "Game Design" | "Photography & Video" | "Crafts & Physical";
  status: "Brainstorm" | "Work in Progress" | "Completed" | "Showcased";
  toolsUsed: string[];
  notes: string;
  imageUrls?: string[];
  dateStarted: string;
  inspirationLink?: string;
}

export interface SelfCareLog {
  id?: string;
  date: string; // YYYY-MM-DD
  mood: "Overwhelmed" | "Low" | "Neutral" | "Good" | "Great" | string;
  energyLevel: number; // 1 to 10
  sleepHours: number;
  waterGlasses: number;
  stressLevel?: number;
  gratitude: string;
  wins: string[];
  dailyGoal?: string;
  dailyGoalCompleted?: boolean;
}

export interface DailyHabit {
  id: string;
  title: string;
  category: "Mind & Health" | "Coding & Build" | "Learning" | "Art & Creation" | "Finance & Hustle";
  iconName: string;
  targetDaysPerWeek: number;
  completedDates: string[];
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface ContactDetailItem {
  id: string;
  value: string;
  label?: string; // e.g. "Personal", "Work", "Primary", "School", "Mobile", "Home", "Office", "Other"
  isPrimary?: boolean;
}

export interface SocialLinks {
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

export interface UserProfile {
  name: string;
  preferredName?: string;
  title?: string;
  age?: number | string;
  birthDate?: string;
  email?: string;
  emails?: (string | ContactDetailItem)[];
  phone?: string;
  phoneNumbers?: (string | ContactDetailItem)[];
  pronouns?: string;
  avatarUrl?: string;
  bio?: string;
  
  // Location & Address
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;

  // Emergency & Health reference
  emergencyContact?: EmergencyContact;
  bloodType?: string;
  medicalNotes?: string;

  // Social & Online links
  socialLinks?: SocialLinks;

  // Goals & Strengths
  mainGoal?: string;
  dailyGoalSource?: "coding" | "selfcare";
  pinnedDailyGoalId?: string;
  monthlyRevenueTarget: number;
  primaryFocus?: string;
  focusTheme?: string;
  skills?: string[];

  // Aesthetic settings
  activeTheme?: ThemeId;
  themeWallpaperMode?: "pattern" | "clean";
}

export type CanvasCardKind =
  | "post_it"
  | "image"
  | "audio"
  | "video"
  | "journal"
  | "event"
  | "text_box"
  | "sticker"
  | "shape"
  | "code_sandbox"
  | "web_embed";

export interface CanvasAppItemLink {
  targetType: "note" | "project" | "hustle" | "vault" | "habit" | "learning" | "media" | "calendar";
  targetId: string;
  targetTitle: string;
}

export interface CanvasCardItem {
  id: string;
  type: CanvasCardKind;
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex: number;
  rotation?: number; // In degrees, e.g. -6 to 6 for realistic post-it tilt
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  pinned?: boolean;

  // General content
  title?: string;
  content?: string;

  // Shape specific
  shapeKind?: "rect" | "circle" | "diamond" | "arrow";
  shapeBorder?: "solid" | "dashed" | "dotted";

  // Media (Photo, Audio, Video)
  mediaUrl?: string;
  mediaFileName?: string;
  mediaCaption?: string;

  // Journal specific (Heart/Flower shaped cards & Private toggle)
  journalShape?: "heart" | "flower" | "star" | "cloud";
  isPrivate?: boolean; // When true, content is concealed behind a padlock toggle but title & timestamp remain
  timestamp?: string;

  // Event specific (Bidirectionally linked to Calendar page)
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventCategory?: "appointment" | "holiday" | "deadline" | "personal" | "work" | "health";
  linkedEventId?: string;

  // Mind map & cross-app linkage
  linkedAppItem?: CanvasAppItemLink;

  // Stickers & Emojis
  stickerEmoji?: string;
  stickerCategory?: "emoji" | "badge" | "stamp" | "tape";

  // Code Sandbox specific (Interactive HTML/CSS/JS playground)
  sandboxHtml?: string;
  sandboxCss?: string;
  sandboxJs?: string;
  sandboxActiveTab?: "html" | "css" | "js" | "preview" | "split";

  // Web Embed & Media specific (YouTube, Spotify, Webpages, iframes)
  embedUrl?: string;
  embedType?: "youtube" | "spotify" | "website" | "codepen" | "generic";

  createdAt: string;
  updatedAt: string;
}

export interface CanvasConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  style?: "straight" | "curved" | "dashed";
}

export interface CanvasDrawingStroke {
  id: string;
  type: "pencil" | "line" | "rect" | "circle" | "arrow" | "star";
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  endTime?: string;
  category: "appointment" | "holiday" | "deadline" | "personal" | "work" | "health" | "birthday";
  color?: string;
  location?: string;
  isHoliday?: boolean;
  linkedCanvasCardId?: string;
  completed?: boolean;
}

export interface CustomThemeConfig {
  customBgColor?: string;
  customBgImage?: string; // Data URL or Image URL
  customBgMode?: "cover" | "tile" | "center" | "blur";
  fontFamily?: "sans" | "serif" | "mono" | "handwriting" | "playful" | "elegant";
  fontSizeScale?: "compact" | "normal" | "spacious" | "large";
  customTextColor?: string;
  customAccentColor?: string;
  bulletJournalDotColor?: string;
  bulletJournalDotSpacing?: number; // 16, 24, 32
  colorCodePalette?: Record<string, string>;
}

export interface UserLifeOSState {
  version: number;
  lastSynced?: string;
  profile: UserProfile;
  notes: NoteItem[];
  projects: ProjectItem[];
  learning: LearningItem[];
  flashcards: FlashcardItem[];
  vault: AccountVaultItem[];
  vaultMasterPin?: string;
  financeEntries: FinancialEntry[];
  sideHustles: SideHustleIdea[];
  mediaAssets: MediaAsset[];
  creativeHobbies: CreativeHobbyItem[];
  selfCareLogs: SelfCareLog[];
  habits: DailyHabit[];
  quickBrainDumpList: { id: string; text: string; done: boolean; createdAt: string }[];
  
  // Chaotic Corner for Creations & Spatial Board
  canvasCards: CanvasCardItem[];
  canvasDrawings: CanvasDrawingStroke[];
  canvasConnections: CanvasConnection[];

  // Dedicated Calendar & Appointments
  calendarEvents: CalendarEventItem[];

  // Bible Study, Quiet Time with the Lord & Prayer Section
  prayers: PrayerItem[];
  bibleNotes: BibleStudyNote[];
  bibleBookmarks: BibleBookmark[];

  // Personalization & Custom Theme Editor
  customTheme?: CustomThemeConfig;

  vaultId: string;
  syncVaultId?: string;
}
