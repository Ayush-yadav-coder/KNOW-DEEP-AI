import { useState, useEffect, useCallback, useRef } from "react";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionHookOptions {
  onSpeechEnd?: (text: string) => void;
  silenceDelayMs?: number;
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  submitTranscriptNow: () => void;
  isSupported: boolean;
}

export function useSpeechRecognition(options?: SpeechRecognitionHookOptions): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldListenRef = useRef(false);
  const currentTranscriptRef = useRef("");
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isSupported) return;

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        clearSilenceTimer();
        // If the session was supposed to remain active, seamlessly restart
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch {
            // Ignore restart error
          }
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + " ";
          } else {
            interim += res[0].transcript;
          }
        }

        const combined = (final + interim).trim();
        if (combined) {
          currentTranscriptRef.current = combined;
          setTranscript(combined);
          setInterimTranscript(interim);
          setFinalTranscript(final.trim());

          // Fast natural turnaround: 600ms if final sentence is complete, 950ms if interim
          clearSilenceTimer();
          const defaultDelay = final.trim().length > 0 ? 600 : 950;
          const delay = optionsRef.current?.silenceDelayMs ? Math.min(optionsRef.current.silenceDelayMs, defaultDelay) : defaultDelay;
          silenceTimerRef.current = setTimeout(() => {
            const spoken = currentTranscriptRef.current.trim();
            if (spoken && optionsRef.current?.onSpeechEnd) {
              clearSilenceTimer();
              optionsRef.current.onSpeechEnd(spoken);
            }
          }, delay);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        clearSilenceTimer();
        if (event.error === "not-allowed") {
          shouldListenRef.current = false;
          setIsListening(false);
          setError("Microphone permission was denied. Please grant microphone access in your browser.");
        } else if (event.error === "no-speech") {
          // Normal silence, do not error or terminate
        } else {
          console.warn("Speech recognition notice:", event.error);
        }
      };

      return () => {
        shouldListenRef.current = false;
        clearSilenceTimer();
        try {
          recognition.stop();
        } catch {
          // Ignore errors on cleanup
        }
      };
    } catch (err) {
      console.warn("Could not initialize speech recognition:", err);
    }
  }, [isSupported]);

  const startListening = useCallback(() => {
    clearSilenceTimer();
    shouldListenRef.current = true;
    currentTranscriptRef.current = "";
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setInterimTranscript("");
      setFinalTranscript("");
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Speech recognition start notice:", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    clearSilenceTimer();
    currentTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setFinalTranscript("");
  }, []);

  const submitTranscriptNow = useCallback(() => {
    clearSilenceTimer();
    const text = currentTranscriptRef.current.trim();
    if (text && optionsRef.current?.onSpeechEnd) {
      optionsRef.current.onSpeechEnd(text);
    }
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    submitTranscriptNow,
    isSupported,
  };
}
