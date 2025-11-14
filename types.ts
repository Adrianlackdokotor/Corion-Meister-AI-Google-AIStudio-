

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Flashcard {
  id: string;
  categoryId: string;
  front: string;

  back: string;
  masteryLevel: number; // NS 0-5
  backgroundImageUrl?: string;
  imageUrl?: string; 
}

export interface FormelFlashcard {
  id: string;
  front: string;
  back: string;
  isUserCreated?: boolean;
}

export interface FlashcardEvaluation {
  result: 'richtig' | 'teilweise' | 'falsch';
  feedback: string;
  correctAnswerDE?: string;
}

export interface UserProgress {
  hubPoints: number;
  dailyStreak: number;
  masteredCards: number;
  inProgressCards: number;
}

export interface MultipleChoiceOption {
  id: string; // e.g., 'A', 'B', 'C'
  text: string;
}

export interface MultipleChoiceQuestion {
  question: string;
  options: MultipleChoiceOption[];
  correctAnswerId: string;
  explanation: string;
}

export interface LibraryEntry {
  id: string;
  question: string;
  answer: string;
  imageUrl?: string;
}

export interface LibraryCategory {
  title: string;
  entries: LibraryEntry[];
  isUserCreated?: boolean;
}

export interface FachgespraechTopic {
  id: string;
  title: string;
  content: string;
  backgroundImageUrl?: string;
}

export type Language = 'German' | 'Romanian' | 'English' | 'Polish';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Negative for consumption, positive for addition
}

export type AchievementId = 'MASTERY_1' | 'MASTERY_20' | 'QUIZ_1' | 'QUIZ_5' | 'EXAM_1' | 'STREAK_7' | 'STREAK_30' | 'ARCHITECT_1' | 'ARCHITECT_10';

export interface Achievement {
    id: AchievementId;
    name: string;
    description: string;
    icon: string;
    criteria: {
        type: 'masteredCards' | 'quizzesCompleted' | 'examsCompleted' | 'streak' | 'userContentAdded';
        value: number;
    };
}

export interface UserAchievement {
    achievementId: AchievementId;
    unlockedAt: string;
}

export interface User {
  email: string;
  credits: number;
  tier: 'admin' | 'user';
  transactions: Transaction[];
  lastSessionCreditUsage: number;
  // Gamification fields
  lastLoginDate: string; // ISO date string 'YYYY-MM-DD'
  dailyStreak: number;
  achievements: UserAchievement[];
  // FIX: Add properties to track quiz and exam completions for achievements.
  quizzesCompleted?: number;
  examsCompleted?: number;
}


export interface MateMaterial {
  id: string;
  title: string;
  content: string; // Markdown content
  isUserCreated?: boolean;
  notes?: string[];
}

export interface MediaLibraryItem {
  id: string;
  type: 'video' | 'audio';
  title: string;
  description: string;
  // Data is loaded from IndexedDB on demand, not stored in state
  data?: string; 
  mimeType: string;
}

// Declare aistudio on the window object
declare global {
  // FIX: Define aistudio shape as a named interface to resolve type conflicts.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  // FIX: Add types for Web Speech API to fix errors in ChatInterface.tsx
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    start(): void;
    stop(): void;
  }

  // For Markdown parsing
  const marked: any;

  interface Window {
    // FIX: Made the 'aistudio' property optional to resolve declaration conflict.
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
    SpeechRecognition: { new (): SpeechRecognition; };
    webkitSpeechRecognition: { new (): SpeechRecognition; };
  }
}