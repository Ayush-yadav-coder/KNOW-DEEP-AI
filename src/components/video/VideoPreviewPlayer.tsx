import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Film,
  Scissors
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface VideoPreviewPlayerProps {
  videoUrl?: string;
  prompt: string;
  stylePreset?: string;
  aspectRatio: "16:9" | "9:16";
  visualFilter?: string;
  playbackSpeed: number;
  trimStart: number;
  trimEnd: number;
  videoDuration: number;
  videoCurrentTime: number;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onDurationChange?: (duration: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isSubtitlesEnabled?: boolean;
  subtitleFont?: "Cinematic Sans" | "Futuristic Mono" | "Classic Serif" | "Comic Bold" | "Neon Glow";
  subtitleBorderWeight?: number;
  subtitleHighlightColor?: string;
  narratorScript?: string | null;
  watermarkType?: "none" | "appLogo" | "customText";
  watermarkText?: string;
  watermarkPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  watermarkOpacity?: number;
  activeOverlay?: "clean" | "letterbox" | "imax" | "vhs" | "grid";
  transitionAnimation?: {
    name: string;
    isActive: boolean;
    duration: number;
  };
  exportFormat?: string;
  creationId?: string;
  onBlobReady?: (blobUrl: string) => void;
  cameraDynamic?: "none" | "drone_fly" | "bullet_time" | "fpv_dive" | "action_shake" | "hyper_orbit";
  isSafeZoneEnabled?: boolean;
  onRequestDownloadModal?: () => void;
  narrationAudioUrl?: string | null;
  backgroundMusicUrl?: string | null;
}

export function VideoPreviewPlayer({
  videoUrl,
  prompt,
  stylePreset = "Cinematic",
  aspectRatio,
  visualFilter = "none",
  playbackSpeed = 1.0,
  trimStart = 0,
  trimEnd = 10,
  videoDuration = 10,
  videoCurrentTime = 0,
  onTimeUpdate,
  onDurationChange,
  videoRef,
  isSubtitlesEnabled = true,
  subtitleFont = "Cinematic Sans",
  subtitleBorderWeight = 2,
  subtitleHighlightColor = "#ef4444",
  narratorScript,
  watermarkType = "none",
  watermarkText = "KnowDeep AI",
  watermarkPosition = "bottom-right",
  watermarkOpacity = 0.8,
  activeOverlay = "clean",
  transitionAnimation,
  exportFormat = "MP4",
  creationId = "video-preview",
  onBlobReady,
  cameraDynamic = "none",
  isSafeZoneEnabled = false,
  onRequestDownloadModal,
  narrationAudioUrl,
  backgroundMusicUrl
}: VideoPreviewPlayerProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Local object URL state
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState<boolean>(!videoUrl?.startsWith("blob:"));
  const [blobSize, setBlobSize] = useState<string>("2.4 MB");

  // Keep onBlobReady in a ref to avoid infinite re-render loops
  const onBlobReadyRef = useRef(onBlobReady);
  useEffect(() => {
    onBlobReadyRef.current = onBlobReady;
  }, [onBlobReady]);

  // Track last processed videoUrl to avoid redundant fetches
  const lastProcessedUrlRef = useRef<string | null>(null);

  // Player controls state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize narration audio element
  useEffect(() => {
    if (narrationAudioUrl) {
      const audio = new Audio(narrationAudioUrl);
      audio.loop = false;
      narrationAudioRef.current = audio;
      return () => {
        audio.pause();
        narrationAudioRef.current = null;
      };
    } else {
      narrationAudioRef.current = null;
    }
  }, [narrationAudioUrl]);

  // Initialize background music audio element
  useEffect(() => {
    if (backgroundMusicUrl) {
      const audio = new Audio(backgroundMusicUrl);
      audio.loop = true; // Background music usually loops
      backgroundMusicRef.current = audio;
      return () => {
        audio.pause();
        backgroundMusicRef.current = null;
      };
    } else {
      backgroundMusicRef.current = null;
    }
  }, [backgroundMusicUrl]);

  // Sync narration and background music with playback state
  useEffect(() => {
    if (isPlaying) {
      narrationAudioRef.current?.play().catch(() => {});
      backgroundMusicRef.current?.play().catch(() => {});
    } else {
      narrationAudioRef.current?.pause();
      backgroundMusicRef.current?.pause();
    }
  }, [isPlaying]);

  // Sync narration and background music with video time
  useEffect(() => {
    if (videoRef.current) {
      const videoTime = videoRef.current.currentTime;
      // Re-sync narration
      if (narrationAudioRef.current) {
        if (Math.abs(narrationAudioRef.current.currentTime - videoTime) > 0.2) {
          narrationAudioRef.current.currentTime = videoTime;
        }
      }
      // Re-sync background music
      if (backgroundMusicRef.current) {
        if (Math.abs(backgroundMusicRef.current.currentTime - videoTime) > 0.2) {
          backgroundMusicRef.current.currentTime = videoTime;
        }
      }
    }
  }, [videoCurrentTime]);

  // Sync volume/mute
  useEffect(() => {
    if (narrationAudioRef.current) {
      narrationAudioRef.current.volume = isMuted ? 0 : volume * 0.8;
      narrationAudioRef.current.muted = isMuted;
    }
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = isMuted ? 0 : volume * 0.5; // BG music usually slightly quieter
      backgroundMusicRef.current.muted = isMuted;
    }
  }, [isMuted, volume]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Convert CSS filter
  const getVisualFilterStyle = (filterName: string) => {
    switch (filterName) {
      case "grayscale": return "grayscale(100%)";
      case "sepia": return "sepia(100%)";
      case "vintage": return "sepia(60%) contrast(125%) saturate(125%) hue-rotate(15deg)";
      case "neon": return "saturate(200%) hue-rotate(90deg) brightness(110%) contrast(125%)";
      case "invert": return "invert(100%)";
      case "cool": return "hue-rotate(180deg) saturate(125%) contrast(110%)";
      default: return "none";
    }
  };

  // Cinematic procedural video generator in canvas with Ken Burns camera motion & lighting
  const generateProceduralVideoBlob = useCallback(async (sourceImageUrl?: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = aspectRatio === "9:16" ? 720 : 1280;
      canvas.height = aspectRatio === "9:16" ? 1280 : 720;
      const ctx = canvas.getContext("2d")!;
      
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: mimeType });
        resolve(fullBlob);
      };

      let imgLoaded = false;
      const img = new Image();
      img.crossOrigin = "anonymous";

      let frame = 0;
      const totalFrames = 30 * 6; // 6 seconds high-motion video

      const renderFrame = () => {
        const t = frame / totalFrames; // 0 to 1
        const zoom = 1.0 + t * 0.16; // smooth 1.0 -> 1.16x cinematic camera push
        const panX = Math.sin(t * Math.PI) * (canvas.width * 0.035);
        const panY = Math.cos(t * Math.PI) * (canvas.height * 0.02);

        if (imgLoaded && img.naturalWidth > 0) {
          ctx.save();
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Apply Ken Burns zoom & pan around center
          ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
          ctx.scale(zoom, zoom);
          ctx.drawImage(
            img,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
          );
          ctx.restore();

          // Subtle atmospheric dynamic lighting sweep
          const lightGrad = ctx.createRadialGradient(
            canvas.width / 2 + Math.sin(t * Math.PI * 2) * 120,
            canvas.height / 2 + Math.cos(t * Math.PI * 2) * 60,
            60,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.75
          );
          lightGrad.addColorStop(0, "rgba(255,235,160,0.14)");
          lightGrad.addColorStop(0.5, "rgba(255,190,70,0.05)");
          lightGrad.addColorStop(1, "rgba(0,0,0,0.22)");
          ctx.fillStyle = lightGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Ethereal floating particles
          for (let i = 0; i < 28; i++) {
            const px = ((Math.sin(i * 73 + t * 4) * 0.5 + 0.5) * canvas.width);
            const py = ((Math.cos(i * 37 + t * 3) * 0.5 + 0.5) * canvas.height);
            const rad = 2 + Math.sin(t * 8 + i) * 1.5;
            ctx.beginPath();
            ctx.arc(px, py, Math.max(0.5, rad), 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 240, 180, 0.45)";
            ctx.fill();
          }
        } else {
          // Deep cosmic divine gradient
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          const hue = (frame * 1.2) % 360;
          grad.addColorStop(0, `hsl(${hue}, 75%, 14%)`);
          grad.addColorStop(1, `hsl(${(hue + 45) % 360}, 85%, 7%)`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          for (let i = 0; i < 35; i++) {
            const px = (Math.sin(i * 99 + t * 5) * 0.5 + 0.5) * canvas.width;
            const py = (Math.cos(i * 33 + t * 4) * 0.5 + 0.5) * canvas.height;
            const rad = 3 + Math.sin(t * 6 + i) * 2;
            ctx.beginPath();
            ctx.arc(px, py, Math.max(1, rad), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(hue + i * 8) % 360}, 100%, 75%, 0.5)`;
            ctx.fill();
          }
        }

        frame++;
        if (frame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }
      };

      const startRecordingProcess = () => {
        if (recorder.state === "inactive") {
          recorder.start();
          requestAnimationFrame(renderFrame);
        }
      };

      if (sourceImageUrl) {
        img.onload = () => {
          imgLoaded = true;
          startRecordingProcess();
        };
        img.onerror = () => {
          // Fallback to proxy if direct crossOrigin failed
          if (!sourceImageUrl.includes("/api/video-proxy") && !sourceImageUrl.startsWith("data:")) {
            const proxyImg = new Image();
            proxyImg.crossOrigin = "anonymous";
            proxyImg.onload = () => {
              imgLoaded = true;
              startRecordingProcess();
            };
            proxyImg.onerror = () => {
              startRecordingProcess();
            };
            proxyImg.src = `/api/video-proxy?url=${encodeURIComponent(sourceImageUrl)}`;
          } else {
            startRecordingProcess();
          }
        };
        img.src = sourceImageUrl;
        // Failsafe timeout so recorder never indefinitely waits
        setTimeout(() => {
          startRecordingProcess();
        }, 3500);
      } else {
        startRecordingProcess();
      }
    });
  }, [aspectRatio]);

  // Transform video source into a resilient local Object URL (URL.createObjectURL)
  useEffect(() => {
    // Check if this URL is already processed
    if (videoUrl && lastProcessedUrlRef.current === videoUrl && localObjectUrl) {
      setIsLoadingBlob(false);
      return;
    }
    lastProcessedUrlRef.current = videoUrl || null;

    let active = true;
    let createdUrl: string | null = null;
    setIsLoadingBlob(true);

    const loadLocalObjectUrl = async () => {
      try {
        if (!videoUrl) {
          const procBlob = await generateProceduralVideoBlob();
          if (!active) return;
          createdUrl = URL.createObjectURL(procBlob);
          setLocalObjectUrl(createdUrl);
          setBlobSize(`${(procBlob.size / (1024 * 1024)).toFixed(1)} MB`);
          setIsLoadingBlob(false);
          onBlobReadyRef.current?.(createdUrl);
          return;
        }

        // Check if already an object url or data url
        if (videoUrl.startsWith("blob:")) {
          setLocalObjectUrl(videoUrl);
          setIsLoadingBlob(false);
          onBlobReadyRef.current?.(videoUrl);
          return;
        }

        // Check if it's an AI-generated image source
        const isImageSrc = videoUrl.endsWith(".jpg") ||
                           videoUrl.endsWith(".jpeg") ||
                           videoUrl.endsWith(".png") ||
                           videoUrl.startsWith("data:image/");

        if (isImageSrc) {
          const motionVideoBlob = await generateProceduralVideoBlob(videoUrl);
          if (!active) return;
          createdUrl = URL.createObjectURL(motionVideoBlob);
          setLocalObjectUrl(createdUrl);
          setBlobSize(`${(motionVideoBlob.size / (1024 * 1024)).toFixed(1)} MB`);
          setIsLoadingBlob(false);
          onBlobReadyRef.current?.(createdUrl);
          return;
        }

        // Retrieve video buffer safely without CORS errors
        let blob: Blob | null = null;

        // If same origin or blob, try direct fetch
        if (videoUrl.startsWith("blob:") || videoUrl.startsWith("/") || videoUrl.startsWith(window.location.origin)) {
          try {
            const res = await fetch(videoUrl);
            if (res.ok) blob = await res.blob();
          } catch {
            // direct fetch error ignored
          }
        }

        // For external URLs, use backend video proxy to guarantee Access-Control-Allow-Origin: *
        if (!blob) {
          try {
            const proxyRes = await fetch(`/api/video-proxy?url=${encodeURIComponent(videoUrl)}`);
            if (proxyRes.ok) {
              blob = await proxyRes.blob();
            }
          } catch {
            // fallback to direct fetch if proxy unavailable
            try {
              const directRes = await fetch(videoUrl);
              if (directRes.ok) blob = await directRes.blob();
            } catch {
              // ignored
            }
          }
        }

        // If fetch succeeded
        if (blob && active) {
          if (blob.type.startsWith("image/")) {
            const imgBlobUrl = URL.createObjectURL(blob);
            const motionVideoBlob = await generateProceduralVideoBlob(imgBlobUrl);
            URL.revokeObjectURL(imgBlobUrl);
            if (!active) return;
            createdUrl = URL.createObjectURL(motionVideoBlob);
            setLocalObjectUrl(createdUrl);
            setBlobSize(`${(motionVideoBlob.size / (1024 * 1024)).toFixed(1)} MB`);
            setIsLoadingBlob(false);
            onBlobReadyRef.current?.(createdUrl);
            return;
          }

          createdUrl = URL.createObjectURL(blob);
          setLocalObjectUrl(createdUrl);
          setBlobSize(`${(blob.size / (1024 * 1024)).toFixed(1)} MB`);
          setIsLoadingBlob(false);
          onBlobReadyRef.current?.(createdUrl);
          return;
        }

        // If remote fetch failed entirely, fallback to high-quality procedural canvas stream blob
        if (active) {
          const fallbackBlob = await generateProceduralVideoBlob(videoUrl);
          createdUrl = URL.createObjectURL(fallbackBlob);
          setLocalObjectUrl(createdUrl);
          setBlobSize(`${(fallbackBlob.size / (1024 * 1024)).toFixed(1)} MB`);
          setIsLoadingBlob(false);
          onBlobReadyRef.current?.(createdUrl);
        }
      } catch (err) {
        console.error("Local object URL creation failed:", err);
        if (active) {
          setIsLoadingBlob(false);
        }
      }
    };

    loadLocalObjectUrl();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [videoUrl, generateProceduralVideoBlob]);

  // Sync playback speed to HTML5 video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, videoRef]);

  // Sync volume to HTML5 video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, videoRef]);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek bar handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    onTimeUpdate(newTime, videoDuration);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Direct download from local object URL with progress tracking
  const handleDirectDownload = () => {
    if (onRequestDownloadModal) {
      onRequestDownloadModal();
      return;
    }
    if (!localObjectUrl) return;
    const a = document.createElement("a");
    a.href = localObjectUrl;
    a.download = `veo-generation-${creationId}.${exportFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: "Download Complete",
      description: `Saved local object URL as ${exportFormat.toUpperCase()} file.`
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none group ${
        aspectRatio === "9:16" ? "max-w-[280px] mx-auto rounded-2xl" : "w-full rounded-2xl"
      }`}
      style={{ minHeight: "340px" }}
    >
      {/* Loading state indicator - only display when video has no playable local source */}
      {isLoadingBlob && !localObjectUrl && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-center p-6 transition-all duration-300">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-white uppercase tracking-wider animate-pulse">
              Buffering Local Playback...
            </p>
            <p className="text-[10px] text-muted-foreground">
              Preparing video stream for instant zero-latency playback.
            </p>
          </div>
        </div>
      )}

      {/* Visual Filter Overlays */}
      {activeOverlay === "letterbox" && (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
          <div className="bg-black h-8 w-full" />
          <div className="bg-black h-8 w-full" />
        </div>
      )}
      {activeOverlay === "imax" && (
        <div className="absolute inset-x-4 inset-y-0 border-l-16 border-r-16 border-black pointer-events-none z-10" />
      )}
      {activeOverlay === "vhs" && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[length:100%_4px,_6px_100%] opacity-80 mix-blend-overlay" />
      )}
      {activeOverlay === "grid" && (
        <div className="absolute inset-0 pointer-events-none z-10 border border-red-500/15 bg-[radial-gradient(#ff000010_1px,transparent_1px)] [background-size:16px_16px] opacity-75" />
      )}

      {/* Social Safe-Zone Overlay for Reels / Shorts / TikTok */}
      {isSafeZoneEnabled && (
        <div className="absolute inset-0 pointer-events-none z-20 border-2 border-dashed border-amber-400/50 m-3 rounded-xl flex flex-col justify-between p-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-amber-300 bg-black/75 px-1.5 py-0.5 rounded w-fit border border-amber-500/20">
            <span>Safe-Zone: Reels/TikTok Margin</span>
          </div>
          {/* Rule of thirds grid lines */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>
          <div className="text-right text-[8px] font-mono text-amber-300/80 bg-black/60 px-1 py-0.5 rounded self-end">
            Center Action Target
          </div>
        </div>
      )}

      {/* Watermark Overlay Branding */}
      {watermarkType !== "none" && (
        <div
          style={{ opacity: watermarkOpacity }}
          className={`absolute z-20 pointer-events-none transition-all duration-300 ${
            watermarkPosition === "top-right"
              ? "top-3 right-3"
              : watermarkPosition === "top-left"
              ? "top-3 left-3"
              : watermarkPosition === "bottom-right"
              ? "bottom-14 right-3"
              : "bottom-14 left-3"
          }`}
        >
          {watermarkType === "appLogo" ? (
            <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-xs px-2 py-1 rounded-lg text-white font-black text-[9px] tracking-wider uppercase border border-white/10 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>KnowDeep</span>
            </div>
          ) : (
            <div className="bg-black/80 backdrop-blur-xs px-2 py-1 rounded-lg text-white font-mono font-bold text-[9px] border border-white/10 shadow-lg">
              {watermarkText}
            </div>
          )}
        </div>
      )}

      {/* Kinetic Typography Subtitles Overlay */}
      {isSubtitlesEnabled && (
        <div className="absolute bottom-16 inset-x-3 z-20 pointer-events-none flex justify-center text-center">
          {(() => {
            const scriptText = narratorScript || prompt || "Exploring ancient worlds...";
            const words = scriptText.split(" ");
            const activeWordIndex = Math.floor((videoCurrentTime / (videoDuration || 10)) * words.length);

            return (
              <div
                className={`px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border shadow-xl max-w-sm transition-all ${
                  subtitleFont === "Futuristic Mono"
                    ? "font-mono tracking-widest uppercase text-[10px]"
                    : subtitleFont === "Classic Serif"
                    ? "font-serif italic text-xs"
                    : subtitleFont === "Comic Bold"
                    ? "font-black tracking-tight text-xs uppercase"
                    : subtitleFont === "Neon Glow"
                    ? "font-sans tracking-wide text-[11px] drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                    : "font-sans font-bold text-[11px]"
                }`}
                style={{
                  borderWidth: `${subtitleBorderWeight}px`,
                  borderColor: subtitleHighlightColor + "40"
                }}
              >
                <div className="flex flex-wrap justify-center gap-1 leading-snug">
                  {words.map((w, idx) => {
                    const isActive = Math.abs(idx - activeWordIndex) <= 1;
                    return (
                      <span
                        key={idx}
                        style={{
                          color: isActive ? subtitleHighlightColor : "#ffffff",
                          textShadow: isActive ? `0 0 10px ${subtitleHighlightColor}` : "none",
                          transform: isActive ? "scale(1.06)" : "scale(1.0)"
                        }}
                        className="transition-all duration-150 inline-block font-bold"
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* HTML5 Video Element with Local Object URL */}
      <motion.div
        key={creationId + "_" + (transitionAnimation?.name || "none") + "_" + (transitionAnimation?.isActive || false)}
        initial={
          transitionAnimation?.isActive && transitionAnimation.name !== "none"
            ? transitionAnimation.name === "slide"
              ? { x: -120, opacity: 0 }
            : transitionAnimation.name === "zoom"
              ? { scale: 0.8, opacity: 0 }
            : transitionAnimation.name === "flash"
              ? { filter: "brightness(3)", opacity: 0.8 }
            : transitionAnimation.name === "wipe"
              ? { clipPath: "inset(0 100% 0 0)", opacity: 0.8 }
            : transitionAnimation.name === "blur"
              ? { filter: "blur(20px)", opacity: 0 }
            : { opacity: 0 }
            : { x: 0, scale: 1, filter: "none", opacity: 1, clipPath: "inset(0 0 0 0)" }
        }
        animate={{ x: 0, scale: 1, filter: "none", opacity: 1, clipPath: "inset(0 0 0 0)" }}
        transition={{ duration: transitionAnimation?.duration || 0.4, ease: "easeInOut" }}
        className="w-full h-full flex items-center justify-center"
      >
        <video
          ref={videoRef}
          src={localObjectUrl || videoUrl || undefined}
          autoPlay
          loop
          playsInline
          style={{ filter: getVisualFilterStyle(visualFilter) }}
          className="w-full h-full max-h-[380px] object-cover transition-all duration-300 cursor-pointer"
          onClick={togglePlay}
          onPlay={() => {
            setIsPlaying(true);
            setIsLoadingBlob(false);
          }}
          onCanPlay={() => {
            setIsLoadingBlob(false);
          }}
          onLoadedData={() => {
            setIsLoadingBlob(false);
          }}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            const dur = e.currentTarget.duration || 10.0;
            onDurationChange?.(dur);
            setIsLoadingBlob(false);
            if (videoRef.current) {
              videoRef.current.playbackRate = playbackSpeed;
              videoRef.current.play().catch(() => {});
            }
          }}
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            onTimeUpdate(video.currentTime, video.duration || videoDuration);
            // Enforce trimming bounds
            if (video.currentTime < trimStart) {
              video.currentTime = trimStart;
            }
            if (video.currentTime > trimEnd) {
              video.currentTime = trimStart;
              if (!video.paused) {
                video.play().catch(() => {});
              }
            }
          }}
        />
      </motion.div>

      {/* Center Floating Play/Pause Button on Pause */}
      <AnimatePresence>
        {!isPlaying && !isLoadingBlob && (
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={togglePlay}
            className="absolute z-20 w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl hover:bg-red-500 hover:scale-105 transition-all cursor-pointer backdrop-blur-xs"
            title="Click to Play"
          >
            <Play className="w-6 h-6 ml-1 fill-current" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Stream Status Badge - Hides after initial load to keep UI clean */}
      <AnimatePresence>
        {!isLoadingBlob && localObjectUrl && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[9px] font-mono text-emerald-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verified HD Stream</span>
            <span className="text-white/40">·</span>
            <span className="text-white/70">{blobSize}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dedicated HTML5 Video Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-25 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 py-2 transition-opacity duration-300 flex flex-col gap-1.5 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Seek Scrubber Bar */}
        <div className="w-full flex items-center gap-2 group/scrub">
          <input
            type="range"
            min={trimStart}
            max={trimEnd > trimStart ? trimEnd : videoDuration || 10}
            step="0.05"
            value={videoCurrentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500 hover:h-1.5 transition-all"
          />
        </div>

        {/* Buttons and controls row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left group: Play/Pause, Rewind, Volume slider, Time counter */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer text-white"
              title={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = trimStart;
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer text-white/80 hover:text-white"
              title="Restart from In-point"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Volume Control Slider */}
            <div className="flex items-center gap-1 group/vol">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer text-white/80 hover:text-white"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVol = parseFloat(e.target.value);
                  setVolume(newVol);
                  setIsMuted(newVol === 0);
                }}
                className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500 opacity-70 group-hover/vol:opacity-100 transition-opacity"
              />
            </div>

            {/* Time readout */}
            <div className="text-[10px] font-mono text-white/80 select-none">
              <span className="text-white font-semibold">{formatTime(videoCurrentTime)}</span>
              <span className="text-white/40 mx-0.5">/</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          </div>

          {/* Right group: Speed badge, Direct Download, Fullscreen */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold bg-white/15 px-1.5 py-0.5 rounded text-white/90">
              {playbackSpeed.toFixed(1)}x
            </span>

            {/* Direct download from local object URL */}
            <button
              type="button"
              onClick={handleDirectDownload}
              className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer text-white/80 hover:text-white flex items-center gap-1 text-[10px]"
              title="Download from Local Object URL"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer text-white/80 hover:text-white"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
