import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Award,
  Coffee,
  Brain,
  CheckCircle2,
  Clock,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeworkFocusTimerProps {
  currentTaskTitle?: string;
  onSessionComplete?: (minutes: number) => void;
}

type TimerMode = "pomodoro" | "shortBreak" | "longBreak" | "deepWork";

const TIMER_PRESETS: Record<
  TimerMode,
  {
    label: string;
    duration: number;
    type: "focus" | "break";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  pomodoro: { label: "Pomodoro (25m)", duration: 25 * 60, type: "focus", icon: Brain, color: "text-rose-400" },
  deepWork: { label: "Deep Work (50m)", duration: 50 * 60, type: "focus", icon: Flame, color: "text-amber-400" },
  shortBreak: { label: "Short Break (5m)", duration: 5 * 60, type: "break", icon: Coffee, color: "text-emerald-400" },
  longBreak: { label: "Long Break (15m)", duration: 15 * 60, type: "break", icon: Coffee, color: "text-cyan-400" },
};

export const HomeworkFocusTimer: React.FC<HomeworkFocusTimerProps> = ({
  currentTaskTitle,
  onSessionComplete,
}) => {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_PRESETS.pomodoro.duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_pomodoro_count");
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ambientSound, setAmbientSound] = useState<"off" | "whitenoise" | "binaural">("off");

  // Web Audio Context for chimes and ambient noise
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  const totalDuration = TIMER_PRESETS[mode].duration;
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));

  // Initialize Web Audio API
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play peaceful completion bell using synthetic oscillator
  const playCompletionChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch {
      // ignore
    }
  };

  // Ambient sound generation
  const toggleAmbientSound = (type: "off" | "whitenoise" | "binaural") => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.disconnect();
      } catch {
        // ignore
      }
      noiseSourceRef.current = null;
    }

    if (type === "off") {
      setAmbientSound("off");
      return;
    }

    try {
      const ctx = getAudioContext();
      if (type === "whitenoise") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.05;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 400; // soft soothing hum

        whiteNoise.connect(filter);
        filter.connect(ctx.destination);
        whiteNoise.start();
        noiseSourceRef.current = whiteNoise;
      } else if (type === "binaural") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 196; // G3 alpha wave anchor
        gain.gain.value = 0.03;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        noiseSourceRef.current = osc;
      }
      setAmbientSound(type);
    } catch {
      setAmbientSound("off");
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playCompletionChime();

      if (TIMER_PRESETS[mode].type === "focus") {
        const newCount = sessionsCompleted + 1;
        setSessionsCompleted(newCount);
        localStorage.setItem("knowdeep_pomodoro_count", newCount.toString());
        if (onSessionComplete) {
          onSessionComplete(Math.round(totalDuration / 60));
        }
        // Switch to short break automatically
        setMode("shortBreak");
        setTimeLeft(TIMER_PRESETS.shortBreak.duration);
      } else {
        // Break ended, switch back to Pomodoro
        setMode("pomodoro");
        setTimeLeft(TIMER_PRESETS.pomodoro.duration);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, sessionsCompleted, totalDuration, onSessionComplete]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (noiseSourceRef.current) {
        try {
          noiseSourceRef.current.disconnect();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSelectMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_PRESETS[newMode].duration);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_PRESETS[mode].duration);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // SVG circular dimensions
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Pomodoro Study &amp; Deep Work Focus Timer</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                Focus Mode
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interval study sessions with visual circular progress &amp; calming audio cues
            </p>
          </div>
        </div>

        {/* Sessions Completed Stat */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Focus Streak:</span>
            <span className="font-bold text-white">{sessionsCompleted} 🍅</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
            title={soundEnabled ? "Mute Timer Chimes" : "Unmute Timer Chimes"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preset Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(TIMER_PRESETS) as TimerMode[]).map((key) => {
          const preset = TIMER_PRESETS[key];
          const Icon = preset.icon;
          const isActive = mode === key;

          return (
            <button
              key={key}
              onClick={() => handleSelectMode(key)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-md shadow-rose-500/10"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${preset.color}`} />
              <span className="truncate">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Assignment Task Banner */}
      {currentTaskTitle && (
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-indigo-300 font-bold truncate">
              Focusing on: {currentTaskTitle}
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">
            Active Assignment Subtask
          </span>
        </div>
      )}

      {/* Center Circular Progress Timer */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-52 h-52 flex items-center justify-center">
          {/* Background & Progress SVG Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#1e293b"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={TIMER_PRESETS[mode].type === "focus" ? "#f43f5e" : "#10b981"}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time & State Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              {formattedTime}
            </span>
            <span className="text-xs font-mono uppercase font-bold text-slate-400 mt-1">
              {isRunning ? "Session Active" : "Paused"} · {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            size="lg"
            onClick={() => setIsRunning(!isRunning)}
            className={`h-11 px-8 rounded-2xl text-xs font-bold text-white shadow-lg gap-2 ${
              isRunning
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause Session
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Focus
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="h-11 px-4 rounded-2xl border-slate-800 bg-slate-950 text-slate-400 hover:text-white gap-1.5"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs">Reset</span>
          </Button>
        </div>
      </div>

      {/* Ambient Sound / Study Atmosphere Bar */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-rose-400" /> Focus Ambience:
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleAmbientSound("off")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-colors ${
              ambientSound === "off"
                ? "bg-slate-800 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Silence
          </button>
          <button
            onClick={() => toggleAmbientSound("whitenoise")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-colors ${
              ambientSound === "whitenoise"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Soft White Noise
          </button>
          <button
            onClick={() => toggleAmbientSound("binaural")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-colors ${
              ambientSound === "binaural"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Alpha Waves (196Hz)
          </button>
        </div>
      </div>
    </div>
  );
};
