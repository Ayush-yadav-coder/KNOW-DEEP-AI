export type TranslatorTab =
  | "translate"
  | "grammar"
  | "voice-trainer"
  | "dictionary"
  | "practice"
  | "conversation"
  | "phrasebook";

export type TranslationTone =
  | "Natural"
  | "Formal"
  | "Casual"
  | "Business"
  | "Academic"
  | "Slang"
  | "Poetic";

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  tone: TranslationTone;
  phoneticGuide?: string;
  timestamp: number;
  isBookmarked?: boolean;
}

export interface GrammarIssue {
  id: string;
  type: "grammar" | "spelling" | "punctuation" | "clarity" | "tone" | "vocabulary";
  originalText: string;
  suggestedText: string;
  explanation: string;
  startIndex?: number;
  endIndex?: number;
  applied?: boolean;
}

export interface GrammarAnalysisResult {
  originalText: string;
  correctedText: string;
  readabilityScore: number; // 0 - 100
  overallQuality: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  toneAnalysis: string;
  issues: GrammarIssue[];
  improvedAlternatives: string[];
}

export interface VoiceTrainingResult {
  transcript: string;
  accuracyScore: number; // 0 - 100
  fluencyScore: number; // 0 - 100
  pronunciationScore: number; // 0 - 100
  wordScores: {
    word: string;
    score: number; // 0 - 100
    status: "correct" | "minor_flaw" | "mispronounced";
    phoneticTip?: string;
  }[];
  coachFeedback: string;
  stressTip?: string;
}

export interface DictionaryEntry {
  word: string;
  language: string;
  phoneticIpa: string;
  audioUrl?: string;
  partOfSpeech: string[];
  primaryMeaning: string;
  definitions: {
    partOfSpeech: string;
    definition: string;
    example?: string;
    translatedExample?: string;
  }[];
  synonyms: string[];
  antonyms: string[];
  idiomsAndPhrases: {
    phrase: string;
    meaning: string;
  }[];
  etymology?: string;
  collocations: string[];
  isSaved?: boolean;
}

export interface VocabCard {
  id: string;
  word: string;
  language: string;
  meaning: string;
  phonetic: string;
  partOfSpeech: string;
  example: string;
  addedAt: number;
  masteryLevel: number; // 0 to 5
  nextReviewAt?: number;
}

export interface GrammarQuizQuestion {
  id: string;
  type: "multiple_choice" | "fill_blank" | "sentence_reorder" | "error_spotting";
  question: string;
  targetLanguage: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  category: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface ConversationTurn {
  id: string;
  speaker: "A" | "B";
  language: string;
  originalText: string;
  translatedText: string;
  timestamp: number;
}

export interface PhrasebookCategory {
  id: string;
  name: string;
  icon: string;
  phrases: {
    id: string;
    source: string;
    phonetic: string;
    translation: string;
    audioCode?: string;
  }[];
}
