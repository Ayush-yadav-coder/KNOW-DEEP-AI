import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StadiumAudioPlayerProps {
  matchName?: string;
}

export function StadiumAudioPlayer({ matchName }: StadiumAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startStadiumAmbiance = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Create pink noise buffer for realistic stadium crowd roar
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.08; // Soft volume
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter for stadium acoustic echo
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 800; // Low crowd rumble frequency
      bandpass.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      whiteNoise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = gain;
      setIsPlaying(true);
    } catch {
      // Audio Context disabled or blocked
      setIsPlaying(false);
    }
  };

  const stopStadiumAmbiance = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch {
        // Ignore
      }
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // Ignore
      }
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopStadiumAmbiance();
    } else {
      startStadiumAmbiance();
    }
  };

  useEffect(() => {
    return () => {
      stopStadiumAmbiance();
    };
  }, []);

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={toggleAudio}
      className={`h-8 px-2.5 text-xs rounded-xl gap-1.5 transition-all ${
        isPlaying
          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20"
          : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
      }`}
      title="Toggle Live Stadium Crowd Atmosphere Audio"
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold">Stadium Crowd Audio ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          <span>Stadium Crowd Audio</span>
        </>
      )}
    </Button>
  );
}
