import { useState, useCallback, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

interface SpeechSynthesisHook {
  speak: (text: string, overrideVoice?: string, rate?: number, articleId?: string, articleTitle?: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setRate: (rate: number) => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoadingAudio: boolean;
  isSupported: boolean;
  playbackRate: number;
  currentlySpeakingId: string | null;
  currentlySpeakingTitle: string | null;
}

// Global active audio instance to prevent overlapping speech across components
let globalActiveAudio: HTMLAudioElement | null = null;
let globalActiveUtterance: SpeechSynthesisUtterance | null = null;

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [currentlySpeakingTitle, setCurrentlySpeakingTitle] = useState<string | null>(null);

  const { preferences } = useAppStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const isSupported = typeof window !== "undefined";

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (globalActiveAudio) {
      try {
        globalActiveAudio.pause();
        globalActiveAudio.currentTime = 0;
        globalActiveAudio = null;
      } catch {
        // Ignore
      }
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        globalActiveUtterance = null;
      } catch {
        // Ignore
      }
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoadingAudio(false);
    setCurrentlySpeakingId(null);
    setCurrentlySpeakingTitle(null);
  }, []);

  const pause = useCallback(() => {
    if (globalActiveAudio) {
      try {
        globalActiveAudio.pause();
        setIsPaused(true);
        setIsSpeaking(false);
      } catch {
        // Ignore
      }
    } else if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsSpeaking(false);
      } catch {
        // Ignore
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (globalActiveAudio) {
      try {
        globalActiveAudio.play();
        setIsPaused(false);
        setIsSpeaking(true);
      } catch {
        // Ignore
      }
    } else if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsSpeaking(true);
      } catch {
        // Ignore
      }
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (globalActiveAudio) {
      globalActiveAudio.playbackRate = rate;
    }
  }, []);

  const speak = useCallback(
    async (text: string, overrideVoice?: string, rate: number = playbackRate, articleId?: string, articleTitle?: string) => {
      if (!text || !text.trim()) return;

      // Stop any current playback first
      stop();

      const voice = overrideVoice || preferences.voice || "Kore";
      setIsLoadingAudio(true);
      setCurrentlySpeakingId(articleId || null);
      setCurrentlySpeakingTitle(articleTitle || null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // 1. Primary: High-Fidelity Neural Gemini TTS (/api/tts)
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.slice(0, 3000),
            voice,
          }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audio) {
            setIsLoadingAudio(false);
            const audioUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audio}`;
            const audio = new Audio(audioUrl);
            audio.playbackRate = rate;
            globalActiveAudio = audio;

            audio.onplay = () => {
              setIsSpeaking(true);
              setIsPaused(false);
            };
            audio.onended = () => {
              setIsSpeaking(false);
              setIsPaused(false);
              globalActiveAudio = null;
              setCurrentlySpeakingId(null);
              setCurrentlySpeakingTitle(null);
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              setIsPaused(false);
              globalActiveAudio = null;
              setCurrentlySpeakingId(null);
              setCurrentlySpeakingTitle(null);
            };

            await audio.play();
            return;
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.warn("[TTS] Neural speech request fallback:", err?.message || err);
      } finally {
        setIsLoadingAudio(false);
      }

      // 2. Fallback: Browser Web Speech API if offline or server TTS unreachable
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const cleanText = text
            .replace(/```[\s\S]*?```/g, " ")
            .replace(/[*_~#`]/g, "")
            .slice(0, 1500);

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = rate;
          utterance.pitch = 1;
          globalActiveUtterance = utterance;

          const voices = window.speechSynthesis.getVoices();
          const preferredVoice =
            voices.find((v) => v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")) ||
            voices.find((v) => v.lang.startsWith("en"));

          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            globalActiveUtterance = null;
            setCurrentlySpeakingId(null);
            setCurrentlySpeakingTitle(null);
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            globalActiveUtterance = null;
            setCurrentlySpeakingId(null);
            setCurrentlySpeakingTitle(null);
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      }
    },
    [playbackRate, preferences.voice, stop]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    pause,
    resume,
    setRate,
    isSpeaking,
    isPaused,
    isLoadingAudio,
    isSupported,
    playbackRate,
    currentlySpeakingId,
    currentlySpeakingTitle,
  };
}

