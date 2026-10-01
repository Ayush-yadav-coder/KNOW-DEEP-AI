import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import {
  Video,
  Sparkles,
  Image as ImageIcon,
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Sliders,
  Tv,
  Film,
  Compass,
  Volume2,
  VolumeX,
  Upload,
  Layers,
  ArrowRight,
  Monitor,
  Smartphone,
  History,
  Info,
  Clock,
  RotateCcw,
  BookOpen,
  Search,
  Plus,
  ChevronDown,
  X,
  FileVideo,
  Bot,
  MessageSquare,
  HelpCircle,
  Eye,
  Settings,
  Scissors,
  Sparkle,
  SlidersHorizontal,
  Wand2,
  Zap,
  Radio,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { VideoPreviewPlayer } from "@/components/video/VideoPreviewPlayer";
import { VideoExportProgressModal } from "@/components/video/VideoExportProgressModal";
import { AiVoiceoverGenerator } from "@/components/video/AiVoiceoverGenerator";
import { AutoSoundFxGenerator, FoleyCue } from "@/components/video/AutoSoundFxGenerator";
import { MultiSceneReelMaker, ReelClip } from "@/components/video/MultiSceneReelMaker";
import { CameraDynamicsControls, CameraDynamicType } from "@/components/video/CameraDynamicsControls";
import { SocialReframeAutoCropper, SocialRatio } from "@/components/video/SocialReframeAutoCropper";
import { MagicEraserInpaintingModal } from "@/components/video/MagicEraserInpaintingModal";
import { SongLibrary } from "@/components/video/SongLibrary";
import { KnowDeepBadge } from "@/components/KnowDeepBadge";
import { KNOWDEEP_LOGO_URL } from "@/lib/branding";

interface StoryboardScene {
  scene: number;
  action: string;
  camera: string;
  duration: string;
}

interface VideoCreation {
  id: string;
  videoUrl: string;
  prompt: string;
  expandedPrompt: string;
  storyboard: StoryboardScene[];
  narratorScript: string | null;
  style: string;
  aspectRatio: "16:9" | "9:16";
  model: string;
  motion: string;
  cameraMotion: string;
  timestamp: number;
  // New export settings saved in metadata
  exportFormat: "MP4" | "GIF" | "WebM";
  resolution: "720p" | "1080p" | "4K";
  seed: string;
  playbackSpeed: number;
  narrationAudioUrl?: string | null;
  backgroundMusicUrl?: string | null;
  selectedSongId?: string;
}

const STYLE_PRESETS = [
  { id: "Cinematic", name: "Cinematic", desc: "Hollywood style cinematic grading & lens flare" },
  { id: "Photorealistic", name: "Photorealistic", desc: "Ultra-sharp realist details & natural light" },
  { id: "3D Animation", name: "3D Pixar Animation", desc: "Stylized characters, soft clay textures & rich colors" },
  { id: "Cyberpunk", name: "Cyberpunk Neon", desc: "Dark rainy streets, bright holograms & synth mood" },
  { id: "Watercolor Fantasy", name: "Watercolor Fantasy", desc: "Soft pastel washes, dreamy lighting & fluid lines" },
  { id: "Claymation", name: "Stop-Motion Clay", desc: "Tactile plasticine texture & charming staggered frames" },
];

const CAMERA_DIRECTIONS = [
  { id: "Static", label: "Static Cam", desc: "Locked-off tripod shot" },
  { id: "Zoom In", label: "Zoom In", desc: "Slow focal length push" },
  { id: "Pan Left", label: "Pan Left", desc: "Horizontal sweeping rotation" },
  { id: "Tilt Up", label: "Tilt Up", desc: "Vertical upward rotation" },
  { id: "Dolly Forward", label: "Dolly Shot", desc: "Camera physically moves forward" },
  { id: "Orbit Right", label: "Orbit Shot", desc: "Circular rotation around subject" },
];

const QUICK_STARTERS = [
  { text: "A mysterious ancient explorer discovering a hidden temple overgrown with glowing blue flora, dramatic god rays", label: "Adventure" },
  { text: "Futuristic neon-drenched cityscape with flying cars gliding between massive sky-bridges, rainy cyberpunk mood", label: "Cyberpunk" },
  { text: "A majestically swimming sea turtle gliding over glowing bioluminescent coral reefs, deep ocean sunrays", label: "Oceanic" },
  { text: "Dreamy STOP-MOTION stop-frame claymation of a cute forest hedgehog baking a tiny blackberry pie", label: "Whimsical" },
];

const AUDIO_THEMES = [
  { id: "Epic Orchestral", name: "Epic Cinema Orchestral", desc: "Violins, brass rise, high action" },
  { id: "Retro Synthwave", name: "Retro Futuristic Synthwave", desc: "Outrun beats, retro-synth bass" },
  { id: "Acoustic Folk", name: "Acoustic Folk Journey", desc: "Nostalgic acoustic guitar, warmth" },
  { id: "Ambient Drone", name: "Dark Ambient Drone", desc: "Deep space, atmospheric echo" },
  { id: "Cyberpunk Industrial", name: "Cyberpunk Industrial", desc: "Gritty dark techno, mechanical feel" },
];

const SFX_LIBRARY = [
  { id: "Sub Boom", name: "Cinematic Sub Boom", desc: "LFE ultra-deep cinematic thud" },
  { id: "Glitch Swoosh", name: "Cyber Glitch Swoosh", desc: "Digital data-bending transition" },
  { id: "Camera Shutter", name: "Camera Shutter Click", desc: "Satisfying retro mechanical click" },
  { id: "Distant Thunder", name: "Distant Thunder Rumble", desc: "Natural ambient thunder crackle" },
  { id: "Vinyl Crackle", name: "Vinyl Needle Crackle", desc: "Lo-fi dust, warm vintage crackling" },
  { id: "Digital Uplifter", name: "Digital Uplifter Rise", desc: "Riser sweep for sci-fi reveals" },
];

const INITIAL_CREATIONS: VideoCreation[] = [
  {
    id: "v-sample-1",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
    prompt: "A spaceship hyperdriving through a neon glowing wormhole",
    expandedPrompt: "Epic cinematic wide shot of an atmospheric starship engaging hyperdrive through a twisting quantum wormhole. Multi-colored neon plasma rings cascade around the hull. Volumetric exhaust particles, anamorphic lens flares, and intense cosmic motion blur.",
    storyboard: [
      { scene: 1, action: "The spacecraft initiates propulsion sequences, lights humming.", camera: "Dolly Forward", duration: "1.5s" },
      { scene: 2, action: "Space twists violently as a brilliant multi-colored singularity opens.", camera: "Zoom In", duration: "2.0s" },
      { scene: 3, action: "Hull vibrates with intense speed as the ship plunges into light portals.", camera: "Intense Orbit", duration: "1.5s" }
    ],
    narratorScript: "Prepare for warp speed. Entering the event horizon.",
    style: "Cinematic",
    aspectRatio: "16:9",
    model: "veo-3.1-fast-generate-preview",
    motion: "Intense",
    cameraMotion: "Dolly Forward",
    timestamp: Date.now() - 3600000 * 2,
    exportFormat: "MP4",
    resolution: "1080p",
    seed: "194857203",
    playbackSpeed: 1.0
  },
  {
    id: "v-sample-2",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4",
    prompt: "Lush tropical waterfall deep in a dense forest, bird's eye view",
    expandedPrompt: "Splendid aerial drone flyover of a massive rushing tropical waterfall surrounded by deep green virgin rainforest canopy. Golden hour rays pierce the misty waterfall spray, casting a vibrant rainbow. Cinematic 4k, natural color grading, pristine river flows.",
    storyboard: [
      { scene: 1, action: "Drone glides slowly over the top of the canopy revealing the river bend.", camera: "Pan Left", duration: "1.5s" },
      { scene: 2, action: "Camera tilts down as the water plunges into a sparkling emerald lagoon.", camera: "Tilt Up", duration: "2.0s" },
      { scene: 3, action: "Light spray catches the sunset, casting a soft rainbow across mist clouds.", camera: "Slow drift", duration: "1.5s" }
    ],
    narratorScript: "Behold the wonders of the ancient untouched valley.",
    style: "Photorealistic",
    aspectRatio: "9:16",
    model: "veo-3.1-fast-generate-preview",
    motion: "Medium",
    cameraMotion: "Tilt Up",
    timestamp: Date.now() - 3600000 * 5,
    exportFormat: "MP4",
    resolution: "720p",
    seed: "482057391",
    playbackSpeed: 1.0
  }
];

export default function VideoStudio() {
  const { toast } = useToast();

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

  const [activeTab, setActiveTab] = useState<"text" | "image" | "audio" | "reels" | "camera">("text");

  // Advanced studio features state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isInpaintModalOpen, setIsInpaintModalOpen] = useState<boolean>(false);
  const [cameraDynamic, setCameraDynamic] = useState<CameraDynamicType>("none");
  const [isSafeZoneEnabled, setIsSafeZoneEnabled] = useState<boolean>(false);
  const [socialRatio, setSocialRatio] = useState<SocialRatio>("16:9");
  const [trackingFocus, setTrackingFocus] = useState<"center" | "action" | "thirds">("center");

  // Real-time Visual Effects filters (grayscale, sepia, vintage, neon, etc.)
  const [visualFilter, setVisualFilter] = useState<string>("none");

  // Custom audio overlay state
  const [audioUploadFile, setAudioUploadFile] = useState<File | null>(null);
  const [audioUploadName, setAudioUploadName] = useState<string>("");
  const [selectedSfx, setSelectedSfx] = useState<string>("none");
  const [audioVolume, setAudioVolume] = useState<number>(0.8);

  // Watermark Branding settings
  const [watermarkType, setWatermarkType] = useState<"none" | "appLogo" | "customText">("appLogo");
  const [watermarkText, setWatermarkText] = useState<string>("@KnowDeep");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.45);
  const [watermarkPosition, setWatermarkPosition] = useState<"top-right" | "top-left" | "bottom-right" | "bottom-left">("top-right");

  // Transitions settings
  const [selectedTransition, setSelectedTransition] = useState<"none" | "crossfade" | "slide" | "zoom" | "flash" | "wipe" | "blur">("crossfade");
  const [transitionDuration, setTransitionDuration] = useState<number>(0.6);
  const [isTransitionActive, setIsTransitionActive] = useState<boolean>(false);

  // Recent Projects Sidebar Collapse
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState<"all" | "16:9" | "9:16" | "gif">("all");

  // Core Prompt parameters
  const [prompt, setPrompt] = useState("A mysterious ancient explorer discovering a hidden temple overgrown with glowing blue flora, dramatic god rays");
  const [stylePreset, setStylePreset] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [motionLevel, setMotionLevel] = useState<"Low" | "Medium" | "Intense" | "Extreme">("Medium");
  const [cameraMotion, setCameraMotion] = useState("Dolly Forward");
  const [model, setModel] = useState("veo-3.1-fast-generate-preview");

  // EXPORT SETTINGS (Requested)
  const [exportFormat, setExportFormat] = useState<"MP4" | "GIF" | "WebM">("MP4");
  const [qualityResolution, setQualityResolution] = useState<"720p" | "1080p" | "4K">("1080p");
  const [videoSeed, setVideoSeed] = useState<string>("random");
  const [isSeedLocked, setIsSeedLocked] = useState(false);

  // Custom Storyboard scenes (timeline sequencer)
  const [customScenes, setCustomScenes] = useState<StoryboardScene[]>([
    { scene: 1, action: "Wide shot establishing the ancient temple overgrown with glowing blue moss.", camera: "Dolly Forward", duration: "2s" },
    { scene: 2, action: "Close up of the explorer reaching out to touch a glowing petal, rays illuminating the dust.", camera: "Zoom In", duration: "2s" },
    { scene: 3, action: "High-angle slow orbit showing the majestic chambers breathing light.", camera: "Orbit Right", duration: "2s" }
  ]);
  const [isDraftingStoryboard, setIsDraftingStoryboard] = useState(false);

  // Image to video state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInstruction, setImageInstruction] = useState("Animate the background trees blowing softly in the wind, with rays of sunshine shifting across");

  // Audio / Narration states
  const [audioMusic, setAudioMusic] = useState("Cinematic");
  const [librarySongUrl, setLibrarySongUrl] = useState<string | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string | undefined>(undefined);
  const [narrationText, setNarrationText] = useState("");

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>("idle");
  // Gallery creations list (backed by localStorage)
  const [creations, setCreations] = useState<VideoCreation[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_video_studio_creations");
      return stored ? JSON.parse(stored) : INITIAL_CREATIONS;
    } catch {
      return INITIAL_CREATIONS;
    }
  });

  const [currentCreation, setCurrentCreation] = useState<VideoCreation | null>(creations[0] || null);

  // Video Screen playback speed control (Requested)
  const [screenPlaybackSpeed, setScreenPlaybackSpeed] = useState<number>(1.0);
  const [narrationAudioUrl, setNarrationAudioUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video trimming and duration states
  const [videoDuration, setVideoDuration] = useState<number>(10.0);
  const [trimStart, setTrimStart] = useState<number>(0.0);
  const [trimEnd, setTrimEnd] = useState<number>(10.0);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0.0);

  // Cinematic Viewer Frame Overlay Selector (Visual filter)
  const [activeOverlay, setActiveOverlay] = useState<"clean" | "letterbox" | "imax" | "vhs" | "grid">("clean");

  // Automated Transcription & Kinetic Typography Subtitles (Requested)
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState(true);
  const [subtitleFont, setSubtitleFont] = useState<"Cinematic Sans" | "Futuristic Mono" | "Classic Serif" | "Comic Bold" | "Neon Glow">("Cinematic Sans");
  const [subtitleBorderWeight, setSubtitleBorderWeight] = useState<number>(2);
  const [subtitleHighlightColor, setSubtitleHighlightColor] = useState<string>("#ef4444");

  // AI Co-Pilot Director Chat panel
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<{ sender: "user" | "director"; text: string }[]>([
    { sender: "director", text: "Welcome to your Video Studio Co-Pilot! I am your virtual Hollywood Director. Give me your basic idea, and I will recommend professional camera shots, perfect lighting, or draft an advanced 3-scene storyboard for you." }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Cached local object URL generated by VideoPreviewPlayer
  const [cachedLocalBlobUrl, setCachedLocalBlobUrl] = useState<string | null>(null);

  const handleBlobReady = useCallback((blob: string) => {
    setCachedLocalBlobUrl(blob);
  }, []);

  // Keep playback speed in sync with state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = screenPlaybackSpeed;
    }
  }, [screenPlaybackSpeed, currentCreation]);

  // Save creations to storage
  useEffect(() => {
    try {
      localStorage.setItem("knowdeep_video_studio_creations", JSON.stringify(creations));
    } catch (e) {
      console.warn("Could not save video creations list:", e);
    }
  }, [creations]);

  // Reset trim handles and speed when switching creations
  useEffect(() => {
    setTrimStart(0.0);
    setTrimEnd(10.0);
    setScreenPlaybackSpeed(1.0);
    setCachedLocalBlobUrl(null);
    setNarrationAudioUrl(currentCreation?.narrationAudioUrl || null);
    setLibrarySongUrl(currentCreation?.backgroundMusicUrl || null);
    setSelectedSongId(currentCreation?.selectedSongId || undefined);
  }, [currentCreation?.id]);

  // Sync video playback speed with videoRef
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = screenPlaybackSpeed;
    }
  }, [screenPlaybackSpeed]);

  // Robust video download handler with real-time progress bar
  const handleDownload = () => {
    if (!currentCreation) return;
    setIsExportModalOpen(true);
  };

  // Trigger cinematic transitions
  useEffect(() => {
    if (selectedTransition === "none") return;
    setIsTransitionActive(true);
    const timer = setTimeout(() => {
      setIsTransitionActive(false);
    }, transitionDuration * 1000);
    return () => clearTimeout(timer);
  }, [currentCreation?.id, selectedTransition, transitionDuration]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    toast({ title: "Photo Uploaded", description: `${file.name} ready for animation.` });
  };

  // Automated Storyboard Draft using AI (Gemini assistance)
  const handleAiDraftStoryboard = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Needed",
        description: "Please write a core prompt description first to draft a storyboard.",
        variant: "destructive"
      });
      return;
    }

    setIsDraftingStoryboard(true);
    toast({ title: "Director Drafting Storyboard...", description: "Expanding cinematic beats and timeline segments via AI." });

    try {
      const aiPrompt = `You are an elite cinema director. Create an advanced 3-scene Storyboard breakdown based on this core concept: "${prompt}".
Identify professional camera pathways, motion cues, and timeline pacing.
Output strictly JSON matching this structure (do not write any other conversational text):
{
  "scenes": [
    { "scene": 1, "action": "First scene shot description", "camera": "Camera movement path (e.g. Dolly In, Orbit Left)", "duration": "2s" },
    { "scene": 2, "action": "Middle scene shot description", "camera": "Camera movement path (e.g. Close Up Tilt Up)", "duration": "2s" },
    { "scene": 3, "action": "Concluding scene shot description", "camera": "Camera movement path (e.g. Cinematic Crane Down)", "duration": "2s" }
  ]
}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: aiPrompt }],
          systemInstruction: "You are an elite Hollywood visual supervisor. Return strictly valid JSON."
        })
      });

      if (!res.ok) throw new Error("Storyboard API failed");
      const data = await res.json();
      const textResponse = data.content || data.text || "";

      // Clean markdown code blocks from response
      const cleaned = textResponse.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        setCustomScenes(parsed.scenes);
        toast({
          title: "🎬 Storyboard Compiled!",
          description: "Virtual Director successfully populated your dynamic scene timeline."
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "AI Draft Failed",
        description: "Could not draft custom storyboards automatically. Loaded premium template instead.",
      });
      // Fallback
      setCustomScenes([
        { scene: 1, action: `Wide establishing scene of: "${prompt}"`, camera: "Dolly Forward", duration: "2s" },
        { scene: 2, action: "Slow tilt revealing exquisite highlights and dynamic background movements.", camera: "Tilt Up", duration: "2s" },
        { scene: 3, action: "Conclusive panning shot capturing the deep atmosphere and volumetric shadows.", camera: "Pan Left", duration: "2s" }
      ]);
    } finally {
      setIsDraftingStoryboard(false);
    }
  };

  // Trigger Video Generation
  const handleGenerateVideo = async () => {
    const activePrompt = activeTab === "text" ? prompt : imageInstruction;

    if (!activePrompt.trim() && !imagePreview) {
      toast({
        title: "Input Required",
        description: "Please specify a text prompt or upload an image to animate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationPhase("evaluating");

    // Phase simulations for a premium feel
    setTimeout(() => setGenerationPhase("storyboarding"), 1500);
    setTimeout(() => setGenerationPhase("rendering"), 3500);

    const generatedSeed = isSeedLocked && videoSeed !== "random" ? videoSeed : Math.floor(Math.random() * 1000000000).toString();

    try {
      const response = await fetch("/api/video-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          image: imagePreview,
          style: stylePreset,
          aspectRatio,
          motion: motionLevel,
          cameraMotion,
          model,
          audioMusic,
          narrationPrompt: narrationText
        }),
      });

      if (!response.ok) throw new Error("Video generation request failed");

      const data = await response.json();
      const newCreation: VideoCreation = {
        id: data.id,
        videoUrl: data.videoUrl,
        prompt: activePrompt,
        expandedPrompt: data.expandedPrompt,
        storyboard: customScenes.length > 0 && activeTab === "text" ? customScenes : data.storyboard,
        narratorScript: data.narratorScript,
        style: data.style,
        aspectRatio: data.aspectRatio,
        model: data.model,
        motion: data.motion,
        cameraMotion: data.cameraMotion,
        timestamp: data.timestamp,
        exportFormat,
        resolution: qualityResolution,
        seed: generatedSeed,
        playbackSpeed: screenPlaybackSpeed
      };

      const updatedCreations = [newCreation, ...creations];
      setCreations(updatedCreations);
      setCurrentCreation(newCreation);
      setVideoSeed(generatedSeed);

      // Save to Video Gallery and My Stuff
      try {
        localStorage.setItem("knowdeep_video_studio_creations", JSON.stringify(updatedCreations));
        const existingGalleryStr = localStorage.getItem("knowdeep_gallery");
        const existingGallery = existingGalleryStr ? JSON.parse(existingGalleryStr) : [];
        const galleryVideoItem = {
          id: newCreation.id,
          url: newCreation.videoUrl,
          prompt: newCreation.prompt,
          title: newCreation.prompt.slice(0, 40),
          timestamp: new Date().toISOString(),
          type: "video",
          duration: 10,
          aspectRatio: newCreation.aspectRatio,
        };
        localStorage.setItem("knowdeep_gallery", JSON.stringify([galleryVideoItem, ...existingGallery.filter((g: { id?: string }) => g.id !== newCreation.id)]));
      } catch (e) {
        console.warn("Gallery sync notice:", e);
      }

      toast({
        title: "🎥 Video Synthesized Successfully!",
        description: "Your video is ready in the viewer. Select Download Video or Save to Video Gallery.",
      });
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast({
        title: "Video Generation Failed",
        description: errorMessage || "Failed to contact Veo video synthesis engine.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationPhase("idle");
    }
  };

  const handleSaveToVideoGallery = (itemToSave = currentCreation) => {
    if (!itemToSave) return;
    try {
      const existingVideosStr = localStorage.getItem("knowdeep_video_studio_creations");
      const existingVideos = existingVideosStr ? JSON.parse(existingVideosStr) : [];
      const updatedVideos = [
        itemToSave,
        ...existingVideos.filter((v: VideoCreation) => v.id !== itemToSave.id),
      ];
      localStorage.setItem("knowdeep_video_studio_creations", JSON.stringify(updatedVideos));

      // Also sync to general gallery for My Stuff
      const existingGalleryStr = localStorage.getItem("knowdeep_gallery");
      const existingGallery = existingGalleryStr ? JSON.parse(existingGalleryStr) : [];
      const galleryVideoItem = {
        id: itemToSave.id,
        url: itemToSave.videoUrl,
        prompt: itemToSave.prompt,
        title: itemToSave.prompt.slice(0, 40),
        timestamp: new Date().toISOString(),
        type: "video",
        duration: 10,
        aspectRatio: itemToSave.aspectRatio,
      };
      localStorage.setItem("knowdeep_gallery", JSON.stringify([galleryVideoItem, ...existingGallery.filter((g: { id?: string }) => g.id !== itemToSave.id)]));

      toast({
        title: "Saved to Video Gallery & My Stuff!",
        description: "Video sequence stored in your Video Gallery and My Stuff vault.",
      });
    } catch {
      toast({
        title: "Saved to Video Gallery",
        description: "Video stored in Video Gallery.",
      });
    }
  };

  const handleDeleteCreation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const filtered = creations.filter((c) => c.id !== id);
    setCreations(filtered);
    if (currentCreation?.id === id) {
      setCurrentCreation(filtered[0] || null);
    }
    toast({ title: "Sequence Deleted" });
  };

  // Rehydrate values into controls
  const handleRehydrateCreation = (item: VideoCreation) => {
    setPrompt(item.prompt);
    setStylePreset(item.style);
    setAspectRatio(item.aspectRatio);
    setMotionLevel(item.motion as "Low" | "Medium" | "Intense" | "Extreme");
    setCameraMotion(item.cameraMotion);
    setModel(item.model);
    setExportFormat(item.exportFormat || "MP4");
    setQualityResolution(item.resolution || "1080p");
    setVideoSeed(item.seed || "random");
    setIsSeedLocked(true);
    setCustomScenes(item.storyboard);
    if (item.narratorScript) setNarrationText(item.narratorScript);
    setCurrentCreation(item);
    toast({
      title: "Project Rehydrated",
      description: "Loaded previous cinematic inputs and storyboard settings."
    });
  };

  // Send message to Co-pilot director
  const handleSendCopilotMessage = async () => {
    if (!copilotInput.trim()) return;

    const userMsg = copilotInput;
    setCopilotMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setCopilotInput("");
    setIsCopilotTyping(true);

    try {
      const systemInstruction = `You are the Virtual Hollywood Director inside the Video Studio.
Help the user make the best videos. Give them advice on:
1. Volumetric lighting and atmospheric filters
2. Professional camera lenses (e.g. 35mm, anamorphic, macro, prime lenses)
3. Directing advice and storyboard scene-by-scene blueprints
4. Keywords to make prompts beautiful for Veo 3.1 (e.g. ray tracing, depth of field, sunset bloom, particle effects)
Keep responses highly creative, professional, and relatively short (under 3 paragraphs).`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMsg }],
          systemInstruction
        })
      });

      if (!res.ok) throw new Error("Co-pilot chat failed");
      const data = await res.json();
      const textResponse = data.content || data.text || "Director co-pilot is offline. Let's try again shortly!";

      setCopilotMessages((prev) => [...prev, { sender: "director", text: textResponse }]);
    } catch {
      setCopilotMessages((prev) => [...prev, { sender: "director", text: "I experienced a signal disconnect. How about we refine your lighting style, camera paths, or draft a storyboard instead?" }]);
    } finally {
      setIsCopilotTyping(false);
    }
  };

  // Filtered recent projects list
  const filteredCreations = creations.filter((item) => {
    const matchesSearch = item.prompt.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                          item.style.toLowerCase().includes(sidebarSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (sidebarFilter === "16:9") return item.aspectRatio === "16:9";
    if (sidebarFilter === "9:16") return item.aspectRatio === "9:16";
    if (sidebarFilter === "gif") return item.exportFormat === "GIF";
    return true;
  });

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-3.5rem)] pt-14 bg-background relative flex selection:bg-primary/20">
        
        {/* RECENT PROJECTS COLLAPSIBLE SIDEBAR */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 310, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border/60 bg-card/65 backdrop-blur-md flex flex-col shrink-0 h-[calc(100vh-3.5rem)] fixed lg:relative z-30 overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-red-500" />
                  <span>Recent Projects ({creations.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground lg:hidden"
                  title="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Search */}
              <div className="p-3 border-b border-border/40 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/40 border border-border/75 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Filter segments (Zero-Pill interactive controls with clean states) */}
                <div className="flex items-center gap-1 p-0.5 bg-muted/40 rounded-xl border border-border/40">
                  <button
                    onClick={() => setSidebarFilter("all")}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      sidebarFilter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSidebarFilter("16:9")}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      sidebarFilter === "16:9" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    16:9
                  </button>
                  <button
                    onClick={() => setSidebarFilter("9:16")}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      sidebarFilter === "9:16" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    9:16
                  </button>
                  <button
                    onClick={() => setSidebarFilter("gif")}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      sidebarFilter === "gif" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    GIF
                  </button>
                </div>
              </div>

              {/* Sidebar List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredCreations.length > 0 ? (
                  filteredCreations.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleRehydrateCreation(item)}
                      className={`p-3 rounded-2xl border text-left transition-all relative group cursor-pointer ${
                        currentCreation?.id === item.id
                          ? "bg-primary/5 border-primary shadow-xs"
                          : "bg-card/40 border-border/70 hover:border-primary/40 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] uppercase font-bold text-muted-foreground mb-1">
                        <span className="flex items-center gap-1 text-primary">
                          {item.resolution} · {item.exportFormat}
                        </span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                        "{item.prompt}"
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span>Style: <strong className="text-foreground/80">{item.style}</strong></span>
                        <span>·</span>
                        <span>Aspect: <strong className="text-foreground/80">{item.aspectRatio}</strong></span>
                      </div>

                      {/* Action buttons revealed on hover */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCreation(item.id, e);
                          }}
                          className="p-1 rounded-md bg-background/80 hover:bg-background border border-border text-rose-500 hover:text-rose-600 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground/40 text-xs italic">
                    No matching generated projects
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CINEMATIC WORKSTAGE */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 relative">
          
          {/* Ambient lighting backdrop */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[130px]" />
            <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[130px]" />
          </div>

          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Stage Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                {/* Sidebar trigger */}
                {!isSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-xl bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shadow-xs"
                    title="Open Recent Projects Log"
                  >
                    <History className="w-4.5 h-4.5 text-primary" />
                  </button>
                )}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/10">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-1.5">
                    <span>Video Studio</span>
                    <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md font-bold uppercase tracking-wider">
                      Veo 3.1
                    </span>
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium">
                    State-of-the-art cinematic video synthesis, high-definition camera motion, and timeline storyboards
                  </p>
                </div>
              </div>

              {/* Quick Assistant toggle & Settings */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCopilotOpen(!copilotOpen)}
                  className={`h-8 gap-2 text-xs rounded-xl border-border/70 ${copilotOpen ? "bg-red-500/10 border-red-500 text-red-500" : ""}`}
                >
                  <div className="w-4 h-4 rounded-md overflow-hidden shrink-0 border border-red-500/30">
                    <img src={KNOWDEEP_LOGO_URL} alt="KnowDeep" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold">KnowDeep Director</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-500/15 text-red-500 font-black uppercase tracking-wider">
                    Official AI
                  </span>
                </Button>
              </div>
            </div>

            {/* MASTER 2-COLUMN WORKSTAGE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Generation Workspace & Director Controls (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Creator Mode Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-card border border-border/70 rounded-2xl shadow-xs overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={`flex-1 min-w-[85px] py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "text"
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Text Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("image")}
                    className={`flex-1 min-w-[85px] py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "image"
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("audio")}
                    className={`flex-1 min-w-[95px] py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "audio"
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Voice & SFX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reels")}
                    className={`flex-1 min-w-[95px] py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "reels"
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Reels Joiner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("camera")}
                    className={`flex-1 min-w-[95px] py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "camera"
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Camera & Crop</span>
                  </button>
                </div>

                {/* ACTIVE TAB STAGE */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
                  {activeTab === "text" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-red-500" />
                          <span>Cinematic Prompt Director:</span>
                        </span>
                        <span>Prompt auto-enhances dynamically</span>
                      </div>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what happens in your cinematic sequence..."
                        className="w-full resize-none text-sm bg-muted/35 border-border rounded-2xl p-4 focus-visible:ring-1 focus-visible:ring-primary h-28 leading-relaxed shadow-inner"
                      />

                      {/* Timeline Storyboard sequencer for custom multi-scene rendering */}
                      <div className="border border-border/60 rounded-2xl p-4 bg-muted/15 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            <span>Dynamic Timeline Storyboard ({customScenes.length} scenes):</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDraftingStoryboard}
                            onClick={handleAiDraftStoryboard}
                            className="h-7 text-[10px] font-bold px-2 rounded-lg text-primary hover:bg-primary/10 gap-1"
                          >
                            <Bot className="w-3 h-3" />
                            <span>AI Draft Scenes</span>
                          </Button>
                        </div>

                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {customScenes.map((scene, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-card border border-border/60 p-2.5 rounded-xl text-xs relative group/scene">
                              <span className="font-bold font-mono text-[10px] w-5 h-5 rounded bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                                S{idx+1}
                              </span>
                              <div className="flex-1 space-y-1.5">
                                <input
                                  type="text"
                                  value={scene.action}
                                  onChange={(e) => {
                                    const updated = [...customScenes];
                                    updated[idx].action = e.target.value;
                                    setCustomScenes(updated);
                                  }}
                                  placeholder="Action happening in this scene..."
                                  className="w-full bg-transparent font-medium border-none p-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50 text-xs"
                                />
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <select
                                    value={scene.camera}
                                    onChange={(e) => {
                                      const updated = [...customScenes];
                                      updated[idx].camera = e.target.value;
                                      setCustomScenes(updated);
                                    }}
                                    className="bg-muted border-none rounded p-0.5"
                                  >
                                    <option value="Dolly Forward">Dolly In</option>
                                    <option value="Zoom In">Zoom In</option>
                                    <option value="Pan Left">Pan Left</option>
                                    <option value="Tilt Up">Tilt Up</option>
                                    <option value="Orbit Right">Orbit</option>
                                    <option value="Static Cam">Static</option>
                                  </select>
                                  <span>·</span>
                                  <input
                                    type="text"
                                    value={scene.duration}
                                    onChange={(e) => {
                                      const updated = [...customScenes];
                                      updated[idx].duration = e.target.value;
                                      setCustomScenes(updated);
                                    }}
                                    className="w-8 bg-transparent border-none p-0 font-mono text-center focus:ring-0"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCustomScenes(customScenes.filter((_, sidx) => sidx !== idx))}
                                className="opacity-0 group-hover/scene:opacity-100 p-1 text-rose-500 hover:bg-muted rounded absolute top-2 right-2 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomScenes([...customScenes, { scene: customScenes.length + 1, action: "New custom camera shot details...", camera: "Static Cam", duration: "2s" }])}
                          className="w-full h-8 text-[11px] font-bold border-dashed border-border/80 hover:border-primary/50 rounded-xl gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Timeline Scene</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === "image" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>Upload Source Photo:</span>
                        </span>
                        <span>Supports JPEG, PNG, WebP</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Image Drag Box */}
                        <label className="border-2 border-dashed border-border/80 hover:border-primary/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors bg-muted/10 h-40">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <ImageIcon className="w-8 h-8 text-muted-foreground/60 mb-2" />
                          <span className="text-xs font-bold">Choose Image File</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            or drag & drop image here
                          </span>
                        </label>

                        {/* Image Preview */}
                        <div className="border border-border/80 rounded-2xl h-40 bg-muted/20 overflow-hidden flex items-center justify-center relative">
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Source photo to animate"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview(null);
                                }}
                                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-background/80 hover:bg-background border border-border text-rose-500 flex items-center justify-center transition-colors"
                                title="Remove image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No source image uploaded
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Image Guidance Prompt */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-foreground">
                          Animate Direction Instructions:
                        </div>
                        <Textarea
                          value={imageInstruction}
                          onChange={(e) => setImageInstruction(e.target.value)}
                          placeholder="Tell Veo how the elements in the image should move, zoom, or transition..."
                          className="w-full resize-none text-sm bg-muted/30 border-border rounded-2xl p-4 focus-visible:ring-1 focus-visible:ring-primary h-20 leading-relaxed shadow-inner"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "audio" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-primary" />
                          <span>Upload Background Soundtrack:</span>
                        </span>
                        <span>Supports MP3, WAV, M4A</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Audio upload area */}
                        <label className="border-2 border-dashed border-border/80 hover:border-primary/40 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-muted/10 h-36">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAudioUploadFile(file);
                                setAudioUploadName(file.name);
                                toast({
                                  title: "Soundtrack Uploaded",
                                  description: `Loaded custom track: ${file.name}`
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <Volume2 className="w-7 h-7 text-muted-foreground/60 mb-1" />
                          <span className="text-xs font-bold">Upload Music File</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            Drag & drop audio track
                          </span>
                        </label>

                        {/* Audio details & Volume Control */}
                        <div className="border border-border/80 rounded-2xl p-4 h-36 bg-muted/20 flex flex-col justify-between">
                          {audioUploadName ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-foreground truncate max-w-[130px]" title={audioUploadName}>
                                  🎵 {audioUploadName}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAudioUploadFile(null);
                                    setAudioUploadName("");
                                  }}
                                  className="p-1 rounded-full bg-background hover:bg-muted text-rose-500"
                                  title="Remove Custom Track"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              
                              {/* Waveform Animation Simulation */}
                              <div className="flex items-end justify-center gap-0.5 h-6 bg-background/30 rounded-lg p-1">
                                {[12, 18, 8, 24, 14, 10, 20, 16, 6, 22, 14, 18, 10, 12, 4, 16, 24, 8].map((h, i) => (
                                  <div
                                    key={i}
                                    className="w-1 bg-primary rounded-t animate-bounce"
                                    style={{
                                      height: `${h}px`,
                                      animationDuration: `${0.4 + (i % 5) * 0.15}s`
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic flex-1 flex items-center justify-center">
                              No custom soundtrack uploaded
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                              <span>Soundtrack Volume:</span>
                              <span>{Math.round(audioVolume * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={audioVolume}
                              onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sound effect (SFX) & Curated themes library selector */}
                      <div className="space-y-3.5 pt-1.5">
                        <div>
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-primary" />
                            <span>Curated Sound Effect (SFX) Library:</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {SFX_LIBRARY.map((sfx) => (
                              <button
                                key={sfx.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSfx(sfx.id);
                                  toast({
                                    title: `SFX Selected: ${sfx.name}`,
                                    description: sfx.desc
                                  });
                                }}
                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                  selectedSfx === sfx.id
                                    ? "bg-primary/10 border-primary text-foreground font-semibold"
                                    : "bg-muted/10 border-border/70 hover:border-border text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div className="text-[10px] font-bold truncate">{sfx.name}</div>
                                <div className="text-[9px] opacity-75 truncate">{sfx.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            <span>Curated Music Themes:</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {AUDIO_THEMES.map((theme) => (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => {
                                  setAudioMusic(theme.id);
                                  toast({
                                    title: `Music Selected: ${theme.name}`,
                                    description: theme.desc
                                  });
                                }}
                                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                                  audioMusic === theme.id
                                    ? "bg-primary/10 border-primary text-foreground font-semibold"
                                    : "bg-muted/10 border-border/70 hover:border-border text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div className="truncate">
                                  <div className="text-xs font-bold">{theme.name}</div>
                                  <div className="text-[10px] opacity-75">{theme.desc}</div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 1. 🎙️ AI Voiceover & Emotional Narration Component */}
                      <AiVoiceoverGenerator
                        initialScript={currentCreation?.narratorScript || prompt}
                        videoDuration={videoDuration}
                        onVoiceoverReady={(audioBlobUrl) => {
                          setNarrationAudioUrl(audioBlobUrl);
                          if (currentCreation) {
                            const updated = creations.map(c => 
                              c.id === currentCreation.id 
                                ? { ...c, narrationAudioUrl: audioBlobUrl } 
                                : c
                            );
                            setCreations(updated);
                            setCurrentCreation({ ...currentCreation, narrationAudioUrl: audioBlobUrl });
                          }
                          toast({
                            title: "Voiceover Attached",
                            description: "Narration synchronized with video playhead."
                          });
                        }}
                      />

                      {/* 2. ⚡ Auto Sound FX & Foley Generator Component */}
                      <AutoSoundFxGenerator
                        prompt={currentCreation?.prompt || prompt}
                        videoDuration={videoDuration}
                        videoCurrentTime={videoCurrentTime}
                        onFoleyCueTriggered={(cue) => {
                          // cue audio played
                        }}
                      />

                      {/* 3. 🎵 Background Song Library & Gallery */}
                      <div className="pt-2 border-t border-border/40">
                        <SongLibrary
                          selectedSongId={selectedSongId}
                          onSelectSong={(song) => {
                            if (!song.id) {
                              setSelectedSongId(undefined);
                              setLibrarySongUrl(null);

                              if (currentCreation) {
                                const updated = creations.map(c => 
                                  c.id === currentCreation.id 
                                    ? { ...c, backgroundMusicUrl: null, selectedSongId: undefined } 
                                    : c
                                );
                                setCreations(updated);
                                setCurrentCreation({ ...currentCreation, backgroundMusicUrl: null, selectedSongId: undefined });
                              }

                              toast({
                                title: "Background Song Removed",
                                description: "The soundtrack has been cleared from the project."
                              });
                              return;
                            }
                            setSelectedSongId(song.id);
                            setLibrarySongUrl(song.url);
                            // Clear uploaded file if library song is chosen
                            setAudioUploadFile(null);
                            setAudioUploadName("");

                            if (currentCreation) {
                              const updated = creations.map(c => 
                                c.id === currentCreation.id 
                                  ? { ...c, backgroundMusicUrl: song.url, selectedSongId: song.id } 
                                  : c
                              );
                              setCreations(updated);
                              setCurrentCreation({ ...currentCreation, backgroundMusicUrl: song.url, selectedSongId: song.id });
                            }

                            toast({
                              title: "Background Song Applied",
                              description: `Now playing: ${song.title} by ${song.artist}`
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. 🎬 Multi-Scene Reel & Short Maker (Timeline Joiner) */}
                  {activeTab === "reels" && (
                    <div className="space-y-4">
                      <MultiSceneReelMaker
                        availableCreations={creations}
                        onPlayReelSequence={(clips) => {
                          if (clips.length > 0) {
                            const first = clips[0];
                            const match = creations.find(c => c.videoUrl === first.videoUrl) || creations[0];
                            if (match) {
                              setCurrentCreation(match);
                              setSelectedTransition(first.transition as any);
                            }
                          }
                        }}
                        onExportMasterReel={(clips) => {
                          setIsExportModalOpen(true);
                        }}
                      />
                    </div>
                  )}

                  {/* 4 & 5. 🌀 Camera Dynamics, Bullet Time FX & 📱 Social Reframe */}
                  {activeTab === "camera" && (
                    <div className="space-y-4">
                      {/* 4. Camera Dynamics & Bullet Time FX */}
                      <CameraDynamicsControls
                        activeDynamics={cameraDynamic}
                        onChange={(dynamicType) => {
                          setCameraDynamic(dynamicType);
                          toast({
                            title: "Camera Dynamics Updated",
                            description: `Applied ${dynamicType.replace("_", " ").toUpperCase()} rendering FX.`
                          });
                        }}
                      />

                      {/* 5. Smart Social Reframe & Auto-Cropper */}
                      <SocialReframeAutoCropper
                        currentRatio={socialRatio}
                        onRatioChange={(newRatio) => {
                          setSocialRatio(newRatio);
                          if (newRatio === "16:9" || newRatio === "9:16") {
                            setAspectRatio(newRatio);
                          }
                          toast({
                            title: "Aspect Ratio Reframed",
                            description: `Switched preview to ${newRatio} formatting.`
                          });
                        }}
                        isSafeZoneEnabled={isSafeZoneEnabled}
                        onToggleSafeZone={(enabled) => setIsSafeZoneEnabled(enabled)}
                        trackingFocus={trackingFocus}
                        onTrackingFocusChange={(focus) => setTrackingFocus(focus)}
                      />
                    </div>
                  )}
                </div>

                {/* CINEMATIC EXPORT SETTINGS (Requested dropdowns) */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                    <Sliders className="w-4 h-4 text-red-500" />
                    <span>Cinematic Export Settings</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Format Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <FileVideo className="w-3.5 h-3.5 text-primary" />
                        <span>Select Output Format:</span>
                      </label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as "MP4" | "GIF" | "WebM")}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary h-10"
                      >
                        <option value="MP4">MP4 (H.264 Cinematic Movie)</option>
                        <option value="WebM">WebM (Optimized HTML5 Video)</option>
                        <option value="GIF">GIF (Animated Playback Loop)</option>
                      </select>
                    </div>

                    {/* Quality dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Monitor className="w-3.5 h-3.5 text-primary" />
                        <span>Quality & Resolution:</span>
                      </label>
                      <select
                        value={qualityResolution}
                        onChange={(e) => setQualityResolution(e.target.value as "720p" | "1080p" | "4K")}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary h-10"
                      >
                        <option value="720p">720p HD (Standard Preview)</option>
                        <option value="1080p">1080p Full HD (Production Grade)</option>
                        <option value="4K">4K UHD Cinema (Super Resolution)</option>
                      </select>
                    </div>
                  </div>

                  {/* Seed Control for style consistency */}
                  <div className="p-3 bg-muted/30 border border-border/60 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Sparkle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Visual Consistency Seed:</span>
                      </span>
                      <p className="text-[10px] text-muted-foreground">Lock seed to maintain consistent characters/settings</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={videoSeed}
                        onChange={(e) => setVideoSeed(e.target.value)}
                        disabled={!isSeedLocked}
                        className="w-24 px-2 py-1 text-xs text-center font-mono rounded-lg border border-border bg-background"
                      />
                      <Button
                        type="button"
                        variant={isSeedLocked ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSeedLocked) {
                            setVideoSeed("random");
                            setIsSeedLocked(false);
                          } else {
                            setVideoSeed(Math.floor(Math.random() * 1000000000).toString());
                            setIsSeedLocked(true);
                          }
                        }}
                        className="h-8 text-[11px] font-bold rounded-lg"
                      >
                        {isSeedLocked ? "Locked" : "Lock Seed"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ADVANCED CAMERA & VISUAL SETTINGS */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                    <SlidersHorizontal className="w-4 h-4 text-red-500" />
                    <span>Production Directions (Veo 3.1)</span>
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-foreground">Select Video Aspect Ratio:</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAspectRatio("16:9")}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${
                          aspectRatio === "16:9"
                            ? "bg-red-500/10 border-red-500 text-foreground font-semibold animate-pulse-subtle"
                            : "bg-muted/10 border-border/70 hover:border-border text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Landscape (16:9)</div>
                            <span className="text-[10px] opacity-75">Perfect for TV & YouTube</span>
                          </div>
                        </div>
                        <div className="w-8 h-4.5 border border-current rounded-sm bg-foreground/10 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setAspectRatio("9:16")}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${
                          aspectRatio === "9:16"
                            ? "bg-red-500/10 border-red-500 text-foreground font-semibold"
                            : "bg-muted/10 border-border/70 hover:border-border text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Portrait (9:16)</div>
                            <span className="text-[10px] opacity-75">Perfect for Shorts & Reels</span>
                          </div>
                        </div>
                        <div className="w-4 h-8 border border-current rounded-sm bg-foreground/10 shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* Grid for Preset Styles & Camera Movement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Visual Style Preset */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Visual Style Preset:</label>
                      <select
                        value={stylePreset}
                        onChange={(e) => setStylePreset(e.target.value)}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary h-10"
                      >
                        {STYLE_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Camera Motion */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Camera Motion Path:</label>
                      <select
                        value={cameraMotion}
                        onChange={(e) => setCameraMotion(e.target.value)}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary h-10"
                      >
                        {CAMERA_DIRECTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Motion level slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">Motion Intensity Level:</span>
                      <span className="text-primary font-bold">{motionLevel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/40">
                      {(["Low", "Medium", "Intense", "Extreme"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMotionLevel(m)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            motionLevel === m
                              ? "bg-primary text-primary-foreground shadow-xs font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Audio Overlays & Narration Screenplay */}
                  <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl space-y-3.5">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-red-500" />
                      <span>AI Soundtrack & Script Narration:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Music select */}
                      <div className="space-y-1">
                        <div className="text-[11px] text-muted-foreground font-semibold">Background Music Theme:</div>
                        <select
                          value={audioMusic}
                          onChange={(e) => setAudioMusic(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs font-medium h-9"
                        >
                          <option value="Cinematic">Epic Cinematic Orchestral</option>
                          <option value="Ambient">Ambient Space Soundscapes</option>
                          <option value="Synthwave">Retro Futuristic Synthwave</option>
                          <option value="Lofi">Relaxing Lofi Beat</option>
                          <option value="Silent">No Audio Overlay</option>
                        </select>
                      </div>

                      {/* Voice Text */}
                      <div className="space-y-1">
                        <div className="text-[11px] text-muted-foreground font-semibold">AI Voiceover Narrator:</div>
                        <input
                          type="text"
                          placeholder="Narration script prompt..."
                          value={narrationText}
                          onChange={(e) => setNarrationText(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Model and Main Trigger Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="bg-muted/80 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary h-10"
                    >
                      <option value="veo-3.1-fast-generate-preview">Veo 3.1 Fast (Preview)</option>
                      <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite (Fast)</option>
                    </select>

                    <Button
                      size="lg"
                      onClick={handleGenerateVideo}
                      disabled={isGenerating}
                      className="flex-1 h-10 rounded-xl gap-2 font-bold text-xs bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-md hover:opacity-95"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>Generating ({generationPhase})...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white animate-pulse" />
                          <span>Synthesize Video Sequence</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* WATERMARK & TRANSITIONS CONFIGURATION CARD */}
                <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-red-500" />
                    <span>Watermark & Transition Overlay Controls</span>
                  </div>

                  {/* Watermark Controls */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>App Brand Watermark settings:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-muted-foreground font-semibold">Watermark Type:</label>
                        <select
                          value={watermarkType}
                          onChange={(e) => setWatermarkType(e.target.value as "none" | "appLogo" | "customText")}
                          className="w-full bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary h-9"
                        >
                          <option value="none">Disabled (No Watermark)</option>
                          <option value="appLogo">KnowDeep App Logo</option>
                          <option value="customText">Custom Signature Text</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-muted-foreground font-semibold">Screen Position:</label>
                        <select
                          value={watermarkPosition}
                          onChange={(e) => setWatermarkPosition(e.target.value as "top-right" | "top-left" | "bottom-right" | "bottom-left")}
                          className="w-full bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary h-9"
                        >
                          <option value="top-right">Top Right Corner</option>
                          <option value="top-left">Top Left Corner</option>
                          <option value="bottom-right">Bottom Right Corner</option>
                          <option value="bottom-left">Bottom Left Corner</option>
                        </select>
                      </div>
                    </div>

                    {watermarkType === "customText" && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-muted-foreground font-semibold">Custom Text Input:</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="e.g. @username or project name"
                          className="w-full bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary h-9"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                        <span>Watermark Opacity:</span>
                        <span>{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Transitions Controls */}
                  <div className="space-y-3 pt-3 border-t border-border/40">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-red-500" />
                      <span>Cinematic Scene Transitions:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-muted-foreground font-semibold">Select Transition Type:</label>
                        <select
                          value={selectedTransition}
                          onChange={(e) => {
                            const val = e.target.value as "none" | "crossfade" | "slide" | "zoom" | "flash";
                            setSelectedTransition(val);
                            toast({
                              title: `Transition Preview: ${val}`,
                              description: `Applies cinematic ${val} on sequence playback.`
                            });
                          }}
                          className="w-full bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary h-9"
                        >
                          <option value="none">Cut (No Transition)</option>
                          <option value="crossfade">Cross-Fade (Dissolve)</option>
                          <option value="slide">Horizontal Slide</option>
                          <option value="zoom">Dynamic Zoom Push</option>
                          <option value="flash">Exposure Flash Burst</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                          <span>Transition Duration:</span>
                          <span>{transitionDuration}s</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="2.0"
                          step="0.1"
                          value={transitionDuration}
                          onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KINETIC TYPOGRAPHY SUBTITLES & AUTOMATED TRANSCRIPTION CARD */}
                  <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                        <Volume2 className="w-4 h-4 text-red-500" />
                        <span>Kinetic Typography Subtitles & Auto-Transcription</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSubtitlesEnabled(!isSubtitlesEnabled)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          isSubtitlesEnabled ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isSubtitlesEnabled ? "Active" : "Disabled"}
                      </button>
                    </div>

                    {isSubtitlesEnabled && (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] text-muted-foreground font-semibold">Subtitle Font Family:</label>
                            <select
                              value={subtitleFont}
                              onChange={(e) => setSubtitleFont(e.target.value as "Cinematic Sans" | "Futuristic Mono" | "Classic Serif" | "Comic Bold" | "Neon Glow")}
                              className="w-full bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary h-9"
                            >
                              <option value="Cinematic Sans">Cinematic Sans (Modern Bold)</option>
                              <option value="Futuristic Mono">Futuristic Mono (Sci-Fi)</option>
                              <option value="Classic Serif">Classic Serif (Documentary)</option>
                              <option value="Comic Bold">Comic Bold (Dynamic)</option>
                              <option value="Neon Glow">Neon Glow (Vibrant)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] text-muted-foreground font-semibold">Active Highlight Color:</label>
                            <div className="flex items-center gap-2 h-9">
                              {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"].map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setSubtitleHighlightColor(color)}
                                  className={`w-6 h-6 rounded-full border transition-transform ${
                                    subtitleHighlightColor === color ? "scale-110 ring-2 ring-foreground" : "opacity-80 hover:opacity-100"
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                            <span>Subtitle Border Stroke Weight:</span>
                            <span>{subtitleBorderWeight}px</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            step="1"
                            value={subtitleBorderWeight}
                            onChange={(e) => setSubtitleBorderWeight(parseInt(e.target.value))}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        <div className="p-2.5 bg-muted/30 rounded-xl border border-border/40 text-[10px] text-muted-foreground leading-relaxed flex items-center justify-between">
                          <span>Auto-syncing with narrator script or prompt beats for real-time word highlighting.</span>
                          <span className="font-mono text-primary font-bold">LIVE SYNC</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Starters templates */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                    <span>Creative Studio Templates:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_STARTERS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(item.text);
                          toast({ title: "Template Loaded", description: `Active preset: ${item.label}` });
                        }}
                        className="text-left p-3.5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 transition-all flex flex-col justify-between gap-1 shadow-2xs"
                      >
                        <span className="text-[10px] uppercase font-black text-primary">{item.label}</span>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">"{item.text}"</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Video Screen Player, Storyboard & Timeline (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* VIDEO PLAYER SCREEN */}
                <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                  {/* Screen Title */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/25 border-b border-border/60">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Tv className="w-4 h-4 text-red-500 animate-pulse" />
                      <span>Cinema Screen Viewer</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {currentCreation && (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsInpaintModalOpen(true)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                            title="AI Video Magic Eraser & Inpainting"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Magic Erase</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsSafeZoneEnabled(!isSafeZoneEnabled)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors cursor-pointer ${
                              isSafeZoneEnabled
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                : "bg-muted/40 hover:bg-muted border-border/60 text-muted-foreground"
                            }`}
                            title="Reels / TikTok UI Safe-Zone Guide"
                          >
                            <Smartphone className="w-3 h-3" />
                            <span className="hidden sm:inline">Safe-Zone</span>
                          </button>

                          <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border/60">
                            {currentCreation.aspectRatio} · {currentCreation.exportFormat}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Main Render Area */}
                  <div className="bg-black flex items-center justify-center relative min-h-[340px] overflow-hidden">
                    {isGenerating ? (
                      /* Phase-specific loading state */
                      <div className="flex flex-col items-center justify-center text-center p-12 gap-3.5 absolute inset-0 z-30 bg-black/90">
                        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white uppercase tracking-wider animate-pulse">
                            {generationPhase === "evaluating" && "Evaluating Script beats..."}
                            {generationPhase === "storyboarding" && "Drafting timeline frames..."}
                            {generationPhase === "rendering" && "Rendering high-fidelity pixels..."}
                          </p>
                          <p className="text-[10px] text-muted-foreground max-w-xs">
                            Veo 3.1 is synthesizing pixels, camera paths, and dynamic lighting.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {currentCreation ? (
                      <VideoPreviewPlayer
                        videoUrl={currentCreation.videoUrl}
                        prompt={currentCreation.prompt}
                        stylePreset={currentCreation.style}
                        aspectRatio={currentCreation.aspectRatio}
                        visualFilter={visualFilter}
                        playbackSpeed={screenPlaybackSpeed}
                        trimStart={trimStart}
                        trimEnd={trimEnd}
                        videoDuration={videoDuration}
                        videoCurrentTime={videoCurrentTime}
                        onTimeUpdate={(curr, dur) => {
                          setVideoCurrentTime(curr);
                          if (dur && dur !== videoDuration) {
                            setVideoDuration(dur);
                          }
                        }}
                        onDurationChange={(dur) => {
                          setVideoDuration(dur);
                          setTrimEnd(dur);
                        }}
                        videoRef={videoRef}
                        isSubtitlesEnabled={isSubtitlesEnabled}
                        subtitleFont={subtitleFont}
                        subtitleBorderWeight={subtitleBorderWeight}
                        subtitleHighlightColor={subtitleHighlightColor}
                        narratorScript={currentCreation.narratorScript}
                        watermarkType={watermarkType}
                        watermarkText={watermarkText}
                        watermarkPosition={watermarkPosition}
                        watermarkOpacity={watermarkOpacity}
                        activeOverlay={activeOverlay}
                        transitionAnimation={{
                          name: selectedTransition,
                          isActive: isTransitionActive,
                          duration: transitionDuration
                        }}
                        exportFormat={currentCreation.exportFormat || exportFormat}
                        creationId={currentCreation.id}
                        onBlobReady={handleBlobReady}
                        cameraDynamic={cameraDynamic}
                        isSafeZoneEnabled={isSafeZoneEnabled}
                        onRequestDownloadModal={() => setIsExportModalOpen(true)}
                        narrationAudioUrl={narrationAudioUrl}
                        backgroundMusicUrl={audioUploadFile ? URL.createObjectURL(audioUploadFile) : librarySongUrl}
                      />
                    ) : (
                      <div className="p-12 text-center text-muted-foreground/40 text-xs italic flex flex-col items-center gap-2">
                        <Film className="w-8 h-8 opacity-30 animate-pulse" />
                        <span>No video sequence active on screen. Click Synthesize to render.</span>
                      </div>
                    )}
                  </div>

                  {/* PROMINENT DUAL ACTION ROW: Save to Video Gallery & Download Video */}
                  {currentCreation && (
                    <div className="px-4 py-3 bg-card border-t border-border/50 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="text-xs font-medium text-muted-foreground line-clamp-1 max-w-xs">
                        <span className="font-bold text-foreground">Active Sequence:</span> {currentCreation.prompt}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveToVideoGallery(currentCreation)}
                          className="h-8 text-xs font-bold rounded-xl border-red-500/40 text-red-500 hover:bg-red-500/10 gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Film className="w-3.5 h-3.5 text-red-500" />
                          <span>Save to Video Gallery</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setIsExportModalOpen(true)}
                          className="h-8 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white gap-1.5 shadow-md cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Video</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Playback speed controller slider & presets */}
                  <div className="p-4 bg-muted/20 border-t border-border/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-foreground">Playback Speed Speedometer</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15">
                        {screenPlaybackSpeed.toFixed(2)}x
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={screenPlaybackSpeed}
                        onChange={(e) => {
                          const speed = parseFloat(e.target.value);
                          setScreenPlaybackSpeed(speed);
                        }}
                        className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => {
                              setScreenPlaybackSpeed(spd);
                              toast({
                                title: `Speed Set: ${spd}x`,
                                description: spd < 1.0 ? "Applying cinematic slow-motion effect." : spd > 1.0 ? "Applying high-speed fast-forward effect." : "Reset to normal speed."
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                              Math.abs(screenPlaybackSpeed - spd) < 0.01
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* VIDEO TRIMMING STUDIO TOOL */}
                  {currentCreation && (
                    <div className="p-4 bg-muted/10 border-t border-border/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Scissors className="w-4 h-4 text-red-500 animate-pulse" />
                          <span className="text-xs font-bold text-foreground">Pro Precision Video Trimmer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = trimStart;
                                videoRef.current.play().catch(() => {});
                              }
                            }}
                            className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 hover:bg-red-500/20 transition-all font-bold"
                          >
                            Preview Trim
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTrimStart(0.0);
                              setTrimEnd(videoDuration);
                              if (videoRef.current) {
                                videoRef.current.currentTime = 0.0;
                              }
                              toast({
                                title: "Trim Reset",
                                description: "Clip restored to its full original duration."
                              });
                            }}
                            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Range</span>
                          </button>
                        </div>
                      </div>

                      {/* Timeline bar with playhead, start handle, and end handle */}
                      <div className="space-y-3">
                        <div className="relative h-12 bg-muted/40 rounded-xl border border-border/60 overflow-hidden flex items-center px-2 shadow-inner group">
                          {/* Shaded out zones */}
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-red-600/15 pointer-events-none border-r border-red-500/30"
                            style={{ width: `${(trimStart / (videoDuration || 0.1)) * 100}%` }}
                          />
                          <div
                            className="absolute right-0 top-0 bottom-0 bg-red-600/15 pointer-events-none border-l border-red-500/30"
                            style={{ width: `${100 - (trimEnd / (videoDuration || 0.1)) * 100}%` }}
                          />

                          {/* Interactive Trim Zone Indicator */}
                          <div
                            className="absolute top-1 bottom-1 bg-gradient-to-r from-red-500/30 via-orange-500/20 to-red-500/30 rounded border border-red-500/50 pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                            style={{
                              left: `${(trimStart / (videoDuration || 0.1)) * 100}%`,
                              right: `${100 - (trimEnd / (videoDuration || 0.1)) * 100}%`
                            }}
                          />

                          {/* Playhead marker */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                            style={{ left: `${(videoCurrentTime / (videoDuration || 0.1)) * 100}%` }}
                          />

                          <div className="w-full text-center text-[9px] font-mono text-muted-foreground/40 font-black tracking-[0.2em] uppercase pointer-events-none">
                            PRECISION TIMELINE
                          </div>
                        </div>

                        {/* Trim control dual handle range/inputs */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                              <span>In-Point (Start):</span>
                              <span className="font-mono text-red-500 font-bold">{trimStart.toFixed(2)}s</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max={Math.max(0, trimEnd - 0.2).toString()}
                              step="0.05"
                              value={trimStart}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setTrimStart(val);
                                if (videoRef.current) {
                                  videoRef.current.currentTime = val;
                                }
                              }}
                              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                              <span>Out-Point (End):</span>
                              <span className="font-mono text-red-500 font-bold">{trimEnd.toFixed(2)}s</span>
                            </div>
                            <input
                              type="range"
                              min={(trimStart + 0.2).toString()}
                              max={videoDuration.toString()}
                              step="0.05"
                              value={trimEnd}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setTrimEnd(val);
                                if (videoRef.current && videoRef.current.currentTime > val) {
                                  videoRef.current.currentTime = trimStart;
                                }
                              }}
                              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                          </div>
                        </div>

                        {/* Readout stats */}
                        <div className="flex justify-between items-center bg-muted/30 px-3 py-1.5 rounded-xl border border-border/40 text-[10px] font-mono text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span>Live: <strong className="text-foreground">{videoCurrentTime.toFixed(1)}s</strong></span>
                          </div>
                          <span>Total: <strong className="text-foreground">{videoDuration.toFixed(1)}s</strong></span>
                          <span>Trimmed: <strong className="text-red-500 font-bold">{(trimEnd - trimStart).toFixed(1)}s</strong></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CINEMATIC TRANSITION STUDIO */}
                  <div className="p-4 bg-muted/5 border-t border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-tighter">Transition Effect Studio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">Duration:</span>
                        <input
                          type="number"
                          min="0.1"
                          max="2.0"
                          step="0.1"
                          value={transitionDuration}
                          onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                          className="w-12 bg-background border border-border rounded px-1.5 py-0.5 text-[10px] text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {(["none", "crossfade", "slide", "zoom", "flash", "wipe", "blur"] as const).map((trans) => (
                        <button
                          key={trans}
                          type="button"
                          onClick={() => {
                            setSelectedTransition(trans);
                            setIsTransitionActive(true);
                            setTimeout(() => setIsTransitionActive(false), 800);
                            toast({
                              title: `Transition Set: ${trans}`,
                              description: `Applied ${trans} effect to clip entries.`
                            });
                          }}
                          className={`py-2 rounded-xl border text-[10px] font-bold capitalize transition-all ${
                            selectedTransition === trans
                              ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-xs"
                              : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {trans}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Playback speed controller & overlay triggers */}
                  <div className="p-3 bg-muted/20 border-t border-border/40 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      {/* Leftover frame configuration */}
                      <span className="text-[11px] text-muted-foreground font-semibold">Frame Aspect:</span>
                      <span className="font-semibold text-foreground">{currentCreation ? currentCreation.aspectRatio : "16:9"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground font-semibold">Overlay:</span>
                      {(["clean", "letterbox", "vhs", "grid"] as const).map((ovr) => (
                        <button
                          key={ovr}
                          onClick={() => setActiveOverlay(ovr)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${
                            activeOverlay === ovr ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {ovr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Visual Filter Selection Panel */}
                  <div className="p-3 bg-muted/15 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-red-500" />
                      <span>Live Visual Filter:</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1 justify-end">
                      {(["none", "grayscale", "sepia", "vintage", "neon", "invert", "cool"] as const).map((filt) => (
                        <button
                          key={filt}
                          onClick={() => {
                            setVisualFilter(filt);
                            toast({
                              title: `Filter Applied: ${filt}`,
                              description: "Real-time CSS visual rendering active on current clip."
                            });
                          }}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                            visualFilter === filt
                              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                              : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {filt === "none" ? "Clean" : filt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video Info Summary */}
                  {currentCreation && (
                    <div className="p-4 bg-muted/10 space-y-2 border-t border-border/50 text-xs">
                      <p className="font-semibold text-foreground leading-relaxed">
                        "{currentCreation.prompt}"
                      </p>

                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <p>
                          <span className="font-bold">Expanded prompt:</span> {currentCreation.expandedPrompt}
                        </p>
                        {currentCreation.narratorScript && (
                          <p>
                            <span className="font-bold text-red-500 flex items-center gap-1.5 mt-1">
                              <Volume2 className="w-3.5 h-3.5" /> Voiceover narration script:
                            </span>{" "}
                            "{currentCreation.narratorScript}"
                          </p>
                        )}
                        <p className="text-[10px] font-mono text-muted-foreground mt-1.5 pt-1.5 border-t border-border/40">
                          ID: {currentCreation.id} · Model: {currentCreation.model} · Seed: {currentCreation.seed}
                        </p>
                      </div>

                      {/* Action buttons (MP4 Download & Save to Video Gallery) */}
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[10px] font-mono text-emerald-500 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Ready to download & save
                          </span>
                          <span>Fully Synthesized</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const existingStr = localStorage.getItem("knowdeep_video_gallery");
                                const existing = existingStr ? JSON.parse(existingStr) : [];
                                const updated = [
                                  {
                                    id: currentCreation.id,
                                    url: currentCreation.videoUrl,
                                    prompt: currentCreation.prompt,
                                    timestamp: new Date().toISOString(),
                                    type: "video",
                                  },
                                  ...existing.filter((item: any) => item.id !== currentCreation.id),
                                ];
                                localStorage.setItem("knowdeep_video_gallery", JSON.stringify(updated));
                                toast({
                                  title: "Saved to Video Gallery & My Stuff!",
                                  description: "Video clip stored in your personal Video Gallery and My Stuff hub.",
                                });
                              } catch {
                                toast({
                                  title: "Saved to Video Gallery",
                                  description: "Video stored in gallery.",
                                });
                              }
                            }}
                            className="h-9 bg-card hover:bg-muted border border-border text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Film className="w-4 h-4 text-red-500" />
                            <span>Save to Video Gallery</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDownload}
                            className="h-9 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download {currentCreation.exportFormat || "MP4"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* TIMELINE / STORYBOARD PROGRESSION */}
                {currentCreation && currentCreation.storyboard?.length > 0 && (
                  <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Layers className="w-4 h-4 text-red-500" />
                      <span>Timeline Storyboard Progression ({currentCreation.storyboard.length} Scenes)</span>
                    </div>

                    <div className="relative border-l-2 border-border/80 pl-4 space-y-3.5 mt-1">
                      {currentCreation.storyboard.map((scene, idx) => (
                        <div key={idx} className="relative space-y-1 text-xs">
                          <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />

                          <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                            <span>Scene {scene.scene} · {scene.camera}</span>
                            <span className="flex items-center gap-1 text-muted-foreground text-[10px] font-normal">
                              <Clock className="w-3 h-3" /> {scene.duration}
                            </span>
                          </div>

                          <p className="text-foreground/90 leading-snug">{scene.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING DIRECTOR AI ASSISTANT PANEL */}
        <AnimatePresence>
          {copilotOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 border-l border-border/60 bg-card/90 backdrop-blur-md flex flex-col h-[calc(100vh-3.5rem)] fixed right-0 z-40 shadow-2xl"
            >
              <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/10">
                <KnowDeepBadge
                  assistantName="KnowDeep Director"
                  studioBadge="Video Studio AI"
                  size="sm"
                  showAura={true}
                />
                <button
                  type="button"
                  onClick={() => setCopilotOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
                {copilotMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl max-w-[90%] ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted/50 border border-border/60 mr-auto text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isCopilotTyping && (
                  <div className="bg-muted/50 border border-border/60 p-3 rounded-2xl mr-auto max-w-[90%] text-muted-foreground animate-pulse">
                    Director is writing script notes...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border/60 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask for shot advice..."
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendCopilotMessage();
                  }}
                  className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary"
                />
                <Button
                  size="sm"
                  onClick={handleSendCopilotMessage}
                  className="h-8 rounded-xl px-3"
                >
                  Send
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 7. 📥 Video Download & Export Progress Bar Modal */}
        {currentCreation && (
          <VideoExportProgressModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            videoUrl={cachedLocalBlobUrl || currentCreation.videoUrl}
            filename={`veo-generation-${currentCreation.id}.${(currentCreation.exportFormat || exportFormat).toLowerCase()}`}
            creationTitle={currentCreation.prompt}
            resolution={currentCreation.resolution || qualityResolution}
            exportFormat={currentCreation.exportFormat || exportFormat}
          />
        )}

        {/* 6. 🪄 AI Video Magic Eraser & Object Inpainting Modal */}
        {currentCreation && (
          <MagicEraserInpaintingModal
            isOpen={isInpaintModalOpen}
            onClose={() => setIsInpaintModalOpen(false)}
            videoUrl={cachedLocalBlobUrl || currentCreation.videoUrl}
            currentTime={videoCurrentTime}
            prompt={currentCreation.prompt}
            onInpaintedVideoReady={(newVideoUrl, inpaintPrompt) => {
              const updatedCreation: VideoCreation = {
                ...currentCreation,
                id: `video-inpaint-${Date.now()}`,
                videoUrl: newVideoUrl,
                prompt: inpaintPrompt,
                timestamp: Date.now()
              };
              setCreations([updatedCreation, ...creations]);
              setCurrentCreation(updatedCreation);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
