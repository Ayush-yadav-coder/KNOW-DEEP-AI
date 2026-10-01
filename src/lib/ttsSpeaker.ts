/**
 * Resilient Neural & Cross-Browser Text-To-Speech Engine
 * Powered by Gemini 3.1 Flash TTS Neural Voices with Browser Web Speech Fallback
 */

let activeAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Preload voices
if (typeof window !== "undefined" && window.speechSynthesis) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        cachedVoices = window.speechSynthesis.getVoices();
      } catch {
        // Ignore
      }
    };
  } catch {
    // Ignore
  }
}

// Audio unlock helper for browser autoplay policies
let audioContextUnlocked = false;
export function unlockAudioPlayback() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      ctx.resume().then(() => {
        try {
          ctx.close();
        } catch {
          // Ignore
        }
      });
    }
    if (window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
    audioContextUnlocked = true;
  } catch {
    // Ignore
  }
}

// Select the most natural sounding English voice
function pickBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Priority ranking for high quality human-like voices
  const priorityPatterns = [
    /google.*us.*english/i,
    /google.*uk.*english/i,
    /natural/i,
    /samantha/i,
    /daniel/i,
    /karen/i,
    /microsoft.*zira/i,
    /microsoft.*david/i,
    /en-us/i,
    /en-gb/i,
    /en/i,
  ];

  for (const pattern of priorityPatterns) {
    const match = voices.find((v) => pattern.test(v.name) || pattern.test(v.lang));
    if (match) return match;
  }

  return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

export function stopSpeaking() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    } catch {
      // Ignore
    }
  }
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {
      // Ignore
    }
  }
  activeUtterance = null;
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function getActiveVoicePreference(): string {
  if (typeof window === "undefined") return "Kore";
  try {
    const saved = localStorage.getItem("knowdeep_preferences");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.voice) return parsed.voice;
    }
  } catch {
    // Ignore
  }
  return "Kore";
}

export async function speakText(text: string, options?: SpeakOptions): Promise<void> {
  stopSpeaking();

  // Clean text: strip markdown syntax, headers, bullets, code blocks, URLs
  const cleanText = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[•\-_]/g, " ")
    .trim();

  if (!cleanText) {
    options?.onEnd?.();
    return;
  }

  const targetVoice = options?.voice || getActiveVoicePreference();

  // 1. Try High Quality Neural Audio via Backend
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: cleanText.slice(0, 3000),
        voice: targetVoice,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        return new Promise((resolve) => {
          const audio = new Audio(`data:${data.mimeType || "audio/wav"};base64,${data.audio}`);
          activeAudio = audio;
          if (options?.volume !== undefined) {
            audio.volume = options.volume;
          }

          audio.onplay = () => {
            options?.onStart?.();
          };

          audio.onended = () => {
            activeAudio = null;
            options?.onEnd?.();
            resolve();
          };

          audio.onerror = (e) => {
            activeAudio = null;
            options?.onError?.(e);
            options?.onEnd?.();
            resolve();
          };

          audio.play().catch((playErr) => {
            console.warn("Audio play error, falling back to speech synthesis:", playErr);
            fallbackSpeechSynthesis(cleanText, options).then(resolve);
          });
        });
      }
    }
  } catch (err) {
    console.warn("Neural TTS request failed, using speech synthesis fallback:", err);
  }

  // 2. Fallback to Web Speech API
  return fallbackSpeechSynthesis(cleanText, options);
}

function fallbackSpeechSynthesis(cleanText: string, options?: SpeakOptions): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      options?.onEnd?.();
      resolve();
      return;
    }

    let hasEnded = false;
    const finish = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      activeUtterance = null;
      options?.onEnd?.();
      resolve();
    };

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        activeUtterance = utterance;

        const selectedVoice = pickBestEnglishVoice();
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = options?.pitch ?? 1.0;
        utterance.volume = options?.volume ?? 1.0;

        utterance.onstart = () => {
          options?.onStart?.();
          if (keepAliveTimer) clearInterval(keepAliveTimer);
          keepAliveTimer = setInterval(() => {
            if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            }
          }, 6000);
        };

        utterance.onend = () => finish();
        utterance.onerror = (e) => {
          options?.onError?.(e);
          finish();
        };

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        options?.onError?.(err);
        finish();
      }
    }, 40);
  });
}
