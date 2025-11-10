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
}

export interface LibraryCategory {
  title: string;
  entries: LibraryEntry[];
}

export interface FachgespraechTopic {
  id: string;
  title: string;
  content: string;
}

export type Language = 'Romanian' | 'English' | 'Polish';

export interface User {
  email: string;
  credits: number;
  tier: 'admin' | 'user';
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

  interface Window {
    // FIX: Made the 'aistudio' property optional to resolve declaration conflict.
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
    SpeechRecognition: { new (): SpeechRecognition; };
    webkitSpeechRecognition: { new (): SpeechRecognition; };
  }
}