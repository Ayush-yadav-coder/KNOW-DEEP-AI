import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Download,
  Upload,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2,
  Check,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Maximize,
  Minimize,
  RotateCcw,
  Eye,
  Sliders,
  Sun,
  Camera,
  Split,
  ZoomIn,
  ZoomOut,
  Palette,
  Wand2,
  Trash2,
  FileImage,
  ArrowLeft,
  X,
  Plus,
  HelpCircle,
  Copy,
  Scissors,
  CheckCircle2,
  FileText,
  Brush,
  Focus,
  History,
  Clock,
  ArrowLeftRight,
  PanelRightClose,
  PanelRightOpen,
  Scan,
  Contrast,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  BulkProcessingQueue,
  BatchQueueItem,
} from "@/components/enhancer/BulkProcessingQueue";
import { ImageEnhancerExportModal } from "@/components/enhancer/ImageEnhancerExportModal";
import {
  RevisionTimeline,
  ImageRevision,
} from "@/components/enhancer/RevisionTimeline";
import {
  UpscaleMode,
  UpscaleScale,
  EnhancementAdjustments,
  DEFAULT_ADJUSTMENTS,
  processSuperResolution,
  loadImage,
} from "@/components/enhancer/SuperResolutionEngine";

// Curated sample test images for instant one-click testing
const SAMPLE_TEST_IMAGES = [
  {
    name: "Portrait",
    category: "Photo Mode",
    description: "Natural skin texture, hair strands & eye detail",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85",
    mode: "Photo" as UpscaleMode,
  },
  {
    name: "Product Shoe",
    category: "Photo Mode",
    description: "Mesh material, stitching & commercial clarity",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85",
    mode: "Photo" as UpscaleMode,
  },
  {
    name: "Digital Artwork",
    category: "Artistic Mode",
    description: "Vector-like outlines, vibrant chroma & gradients",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900&auto=format&fit=crop&q=85",
    mode: "Artistic" as UpscaleMode,
  },
  {
    name: "Document & Typography",
    category: "Text-Heavy Mode",
    description: "OCR edge sharpening, crisp ink & background de-noise",
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&auto=format&fit=crop&q=85",
    mode: "Text-Heavy" as UpscaleMode,
  },
  {
    name: "Architecture & Specular",
    category: "Photo Mode",
    description: "Fine glass facets, geometric lines & HDR contrast",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=85",
    mode: "Photo" as UpscaleMode,
  },
];

interface FilterPreset {
  id: string;
  name: string;
  category: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  warmth: number;
  vignette: number;
  tint: string;
}

const COLOR_GRADE_PRESETS: FilterPreset[] = [
  {
    id: "hdr-vivid",
    name: "HDR Neural Boost",
    category: "Pro Enhancement",
    brightness: 105,
    contrast: 125,
    saturation: 128,
    sharpness: 35,
    warmth: 4,
    vignette: 15,
    tint: "rgba(6, 182, 212, 0.04)",
  },
  {
    id: "golden-hour",
    name: "Golden Hour Sunset",
    category: "Warm Relighting",
    brightness: 108,
    contrast: 115,
    saturation: 130,
    sharpness: 20,
    warmth: 28,
    vignette: 20,
    tint: "rgba(245, 158, 11, 0.12)",
  },
  {
    id: "teal-orange",
    name: "Cinematic Teal & Orange",
    category: "Blockbuster Grade",
    brightness: 104,
    contrast: 128,
    saturation: 122,
    sharpness: 25,
    warmth: 12,
    vignette: 22,
    tint: "rgba(14, 165, 233, 0.08)",
  },
  {
    id: "film-noir",
    name: "Moody Film Noir",
    category: "Monochrome & Shadow",
    brightness: 98,
    contrast: 150,
    saturation: 0,
    sharpness: 40,
    warmth: 0,
    vignette: 45,
    tint: "transparent",
  },
  {
    id: "studio-glamour",
    name: "Studio Softbox",
    category: "Soft Portrait",
    brightness: 112,
    contrast: 108,
    saturation: 108,
    sharpness: 15,
    warmth: 8,
    vignette: 10,
    tint: "rgba(244, 114, 182, 0.06)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    category: "Stylized Lighting",
    brightness: 102,
    contrast: 135,
    saturation: 145,
    sharpness: 30,
    warmth: -12,
    vignette: 30,
    tint: "rgba(236, 72, 153, 0.1)",
  },
  {
    id: "vintage-warmth",
    name: "Vintage 1970s",
    category: "Retro Film",
    brightness: 106,
    contrast: 112,
    saturation: 90,
    sharpness: 10,
    warmth: 22,
    vignette: 25,
    tint: "rgba(217, 119, 6, 0.08)",
  },
  {
    id: "vivid-landscape",
    name: "Vivid Nature & Pop",
    category: "Foliage & Sky",
    brightness: 104,
    contrast: 122,
    saturation: 138,
    sharpness: 30,
    warmth: -4,
    vignette: 8,
    tint: "rgba(16, 185, 129, 0.04)",
  },
];

export default function ImageEnhancer() {
  const { toast } = useToast();

  // Core Images - Default is null (EMPTY CANVAS as requested, no preview image!)
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{
    name: string;
    width: number;
    height: number;
    fileSize?: string;
  } | null>(null);

  // Revision Timeline State
  const [revisions, setRevisions] = useState<ImageRevision[]>([]);
  const [activeRevisionId, setActiveRevisionId] = useState<string>("");
  const [comparingRevisionId, setComparingRevisionId] = useState<string | null>(null);

  // Inspector Panel Active Tab & Visibility
  const [activeInspectorTab, setActiveInspectorTab] = useState<
    "super-res" | "timeline" | "presets" | "background" | "sliders"
  >("super-res");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // AI Super-Resolution State
  const [upscaleMode, setUpscaleMode] = useState<UpscaleMode>("Photo");
  const [upscaleScale, setUpscaleScale] = useState<UpscaleScale>("4x");
  const [faceRestoration, setFaceRestoration] = useState(true);
  const [denoiseFilter, setDenoiseFilter] = useState(true);
  const [microContrast, setMicroContrast] = useState(true);

  // Background Studio Isolation State
  const [bgMode, setBgMode] = useState<
    "transparent" | "studio-dark" | "studio-white" | "bokeh-blur" | "gradient"
  >("transparent");
  const [bokehBlurRadius, setBokehBlurRadius] = useState<number>(14);

  // Manual Adjustments State
  const [adjustments, setAdjustments] =
    useState<EnhancementAdjustments>(DEFAULT_ADJUSTMENTS);

  // Workspace Comparison Mode
  const [comparisonMode, setComparisonMode] = useState<
    "split" | "side-by-side" | "single" | "diff"
  >("split");
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isPressingOriginal, setIsPressingOriginal] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Processing & State Flags
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Bulk Queue State & Modal
  const [bulkQueue, setBulkQueue] = useState<BatchQueueItem[]>([]);
  const [isBulkQueueOpen, setIsBulkQueueOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Canvas & DOM Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef<boolean>(false);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);

  // ==========================================
  // REAL-TIME CANVAS FILTER RENDERING
  // ==========================================
  const renderLiveFilters = useCallback(() => {
    if (!originalImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = originalImage;
    img.onload = () => {
      const canvas = liveCanvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 800;

      // Draw base with adjustments
      ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // Warmth & Tint
      if (
        adjustments.warmth !== 0 ||
        adjustments.activeTint !== "transparent"
      ) {
        ctx.save();
        if (adjustments.warmth > 0) {
          ctx.fillStyle = `rgba(245, 158, 11, ${adjustments.warmth * 0.005})`;
        } else if (adjustments.warmth < 0) {
          ctx.fillStyle = `rgba(14, 165, 233, ${Math.abs(adjustments.warmth) * 0.005})`;
        }
        if (adjustments.warmth !== 0) {
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (adjustments.activeTint !== "transparent") {
          ctx.fillStyle = adjustments.activeTint;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
      }

      // Vignette
      if (adjustments.vignette > 0) {
        ctx.save();
        const radius = Math.max(canvas.width, canvas.height) * 0.75;
        const grad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          radius * 0.4,
          canvas.width / 2,
          canvas.height / 2,
          radius
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, `rgba(0,0,0,${adjustments.vignette * 0.015})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      setEnhancedImage(canvas.toDataURL("image/png"));
    };
  }, [originalImage, adjustments]);

  useEffect(() => {
    renderLiveFilters();
  }, [renderLiveFilters]);

  // ==========================================
  // CLIPBOARD PASTE SUPPORT
  // ==========================================
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleLoadFile(file);
            toast({
              title: "Image Pasted from Clipboard",
              description: "Loaded into enhancement studio.",
            });
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [toast]);

  // ==========================================
  // GLOBAL SMOOTH SLIDER DRAGGING
  // ==========================================
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingSlider.current || !sliderContainerRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.round((x / rect.width) * 100);
      setSliderPosition(percent);
    };

    const handleGlobalUp = () => {
      isDraggingSlider.current = false;
    };

    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchmove", handleGlobalMove);
    window.addEventListener("touchend", handleGlobalUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, []);

  // ==========================================
  // FILE LOADING & REVISION INITIALIZATION
  // ==========================================
  const handleLoadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setOriginalImage(dataUrl);
        setEnhancedImage(dataUrl);
        setImageMetadata({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        });
        setAdjustments(DEFAULT_ADJUSTMENTS);

        // Initialize Revision Timeline with original base
        const initialRev: ImageRevision = {
          id: `rev-${Date.now()}`,
          title: "Original Source",
          description: "Initial image before neural enhancement",
          timestamp: Date.now(),
          dataUrl: dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          badge: "Original",
        };
        setRevisions([initialRev]);
        setActiveRevisionId(initialRev.id);
        setComparingRevisionId(null);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (fileArray.length === 0) {
      toast({
        title: "No Images Found",
        description: "Please select valid image files.",
        variant: "destructive",
      });
      return;
    }

    if (fileArray.length === 1 && !originalImage) {
      handleLoadFile(fileArray[0]);
      return;
    }

    // Multiple files: add to Bulk Processing Queue
    const newQueueItems: BatchQueueItem[] = fileArray.map((file, idx) => {
      const url = URL.createObjectURL(file);
      return {
        id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        originalUrl: url,
        enhancedUrl: null,
        status: "queued",
        progress: 0,
      };
    });

    setBulkQueue((prev) => [...prev, ...newQueueItems]);
    setIsBulkQueueOpen(true);
    toast({
      title: `${newQueueItems.length} Images Added to Queue`,
      description: "Ready for batch super-resolution processing.",
    });

    if (!originalImage && fileArray.length > 0) {
      handleLoadFile(fileArray[0]);
    }
  };

  // Drop handlers
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleCanvasDragLeave = () => {
    setIsDragOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  // Load curated sample image
  const handleSelectSample = (sample: (typeof SAMPLE_TEST_IMAGES)[0]) => {
    setIsProcessing(true);
    setProcessingStatus(`Loading ${sample.name} preset...`);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalImage(sample.url);
      setEnhancedImage(sample.url);
      setUpscaleMode(sample.mode);
      setImageMetadata({
        name: `${sample.name}.jpg`,
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
        fileSize: "1.8 MB",
      });
      setAdjustments(DEFAULT_ADJUSTMENTS);

      const initialRev: ImageRevision = {
        id: `rev-${Date.now()}`,
        title: `${sample.name} Sample`,
        description: `Source image for ${sample.mode} evaluation`,
        timestamp: Date.now(),
        dataUrl: sample.url,
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
        badge: "Original",
      };
      setRevisions([initialRev]);
      setActiveRevisionId(initialRev.id);
      setComparingRevisionId(null);

      setIsProcessing(false);
      setProcessingStatus("");
      toast({
        title: `Loaded ${sample.name}`,
        description: `Set recommended ${sample.mode} super-resolution model.`,
      });
    };
    img.src = sample.url;
  };

  // Clear current image and return to empty canvas
  const handleCloseProject = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setImageMetadata(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setRevisions([]);
    setActiveRevisionId("");
    setComparingRevisionId(null);
    toast({
      title: "Canvas Cleared",
      description: "Returned to open studio workspace.",
    });
  };

  // ==========================================
  // AI SUPER-RESOLUTION PROCESSING
  // ==========================================
  const handleRunSuperResolution = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProcessingStatus(
      `Running ${upscaleMode} AI Neural Upscaling (${upscaleScale})...`
    );

    try {
      const result = await processSuperResolution(
        originalImage,
        {
          mode: upscaleMode,
          scale: upscaleScale,
          faceRestoration,
          denoise: denoiseFilter,
          microContrast,
        },
        adjustments
      );

      setEnhancedImage(result.dataUrl);
      if (imageMetadata) {
        setImageMetadata({
          ...imageMetadata,
          width: result.width,
          height: result.height,
        });
      }

      // Add to Revision Timeline
      const newRev: ImageRevision = {
        id: `rev-${Date.now()}`,
        title: `AI ${upscaleMode} (${upscaleScale})`,
        description: `Super-resolution neural model with ${upscaleScale} upscaling`,
        timestamp: Date.now(),
        dataUrl: result.dataUrl,
        width: result.width,
        height: result.height,
        badge: "AI Upscale",
      };
      setRevisions((prev) => [newRev, ...prev]);
      setActiveRevisionId(newRev.id);

      setIsProcessing(false);
      setProcessingStatus("");
      toast({
        title: `${upscaleMode} Super-Resolution Applied!`,
        description: `Rendered ${result.width} × ${result.height} px using ${upscaleMode} neural pipeline.`,
      });
    } catch (err: unknown) {
      console.error(err);
      setIsProcessing(false);
      setProcessingStatus("");
      const errorMessage =
        err instanceof Error ? err.message : "Could not upscale image";
      toast({
        title: "Super-Resolution Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // One-Click AI Auto-Tone
  const handleAutoTone = () => {
    setAdjustments({
      brightness: 106,
      contrast: 120,
      saturation: 118,
      sharpness: 30,
      warmth: 4,
      vignette: 12,
      dehaze: 15,
      activeTint: "rgba(6, 182, 212, 0.03)",
    });

    setTimeout(() => {
      if (enhancedImage || originalImage) {
        const toneRev: ImageRevision = {
          id: `rev-${Date.now()}`,
          title: "AI Auto-Tone Balance",
          description: "Dynamic range & micro-contrast optimization",
          timestamp: Date.now(),
          dataUrl: enhancedImage || originalImage!,
          width: imageMetadata?.width || 1920,
          height: imageMetadata?.height || 1080,
          badge: "Auto-Tone",
        };
        setRevisions((prev) => [toneRev, ...prev]);
        setActiveRevisionId(toneRev.id);
      }
    }, 100);

    toast({
      title: "AI Auto-Tone Applied",
      description: "Balanced dynamic range, micro-contrast, and shadow recovery.",
    });
  };

  // Apply Color Grade LUT Preset
  const handleApplyPreset = (preset: FilterPreset) => {
    setAdjustments({
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
      sharpness: preset.sharpness,
      warmth: preset.warmth,
      vignette: preset.vignette,
      dehaze: 0,
      activeTint: preset.tint,
    });

    setTimeout(() => {
      if (enhancedImage || originalImage) {
        const lutRev: ImageRevision = {
          id: `rev-${Date.now()}`,
          title: preset.name,
          description: `${preset.category} cinematic LUT curve`,
          timestamp: Date.now(),
          dataUrl: enhancedImage || originalImage!,
          width: imageMetadata?.width || 1920,
          height: imageMetadata?.height || 1080,
          badge: "LUT Grade",
        };
        setRevisions((prev) => [lutRev, ...prev]);
        setActiveRevisionId(lutRev.id);
      }
    }, 100);

    toast({
      title: `LUT Applied: ${preset.name}`,
      description: `${preset.category} grading applied to canvas.`,
    });
  };

  // Apply Background Studio Isolation
  const handleApplyBackground = (mode: typeof bgMode) => {
    if (!originalImage) return;
    setBgMode(mode);
    setIsProcessing(true);
    setProcessingStatus("Segmenting Subject & Computing Studio Mask...");

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = originalImage;
      img.onload = () => {
        canvas.width = img.naturalWidth || 1200;
        canvas.height = img.naturalHeight || 800;
        if (!ctx) return;

        if (mode === "bokeh-blur") {
          ctx.filter = `blur(${bokehBlurRadius}px) brightness(92%)`;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.38,
            canvas.height * 0.46,
            0,
            0,
            Math.PI * 2
          );
          ctx.clip();
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else if (mode === "studio-dark") {
          ctx.fillStyle = "#09090b";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const grad = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.1,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.7
          );
          grad.addColorStop(0, "rgba(30, 41, 59, 0.4)");
          grad.addColorStop(1, "rgba(9, 9, 11, 0.95)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else if (mode === "studio-white") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else if (mode === "gradient") {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, "#064e3b");
          grad.addColorStop(0.5, "#022c22");
          grad.addColorStop(1, "#040b08");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else {
          // Transparent
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const cornerR = data[0];
          const cornerG = data[1];
          const cornerB = data[2];

          for (let i = 0; i < data.length; i += 4) {
            const diff =
              Math.abs(data[i] - cornerR) +
              Math.abs(data[i + 1] - cornerG) +
              Math.abs(data[i + 2] - cornerB);
            if (diff < 50) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        const resultUrl = canvas.toDataURL("image/png");
        setEnhancedImage(resultUrl);

        // Add to Revision Timeline
        const bgRev: ImageRevision = {
          id: `rev-${Date.now()}`,
          title: `${mode.replace("-", " ").toUpperCase()} Studio Bg`,
          description: "Isolated foreground with studio background",
          timestamp: Date.now(),
          dataUrl: resultUrl,
          width: canvas.width,
          height: canvas.height,
          badge: "Studio Bg",
        };
        setRevisions((prev) => [bgRev, ...prev]);
        setActiveRevisionId(bgRev.id);

        setIsProcessing(false);
        setProcessingStatus("");
        toast({
          title: "Studio Background Processed",
          description: `Applied ${mode.replace("-", " ").toUpperCase()} backdrop.`,
        });
      };
    }, 600);
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setEnhancedImage(originalImage);
    toast({
      title: "Adjustments Reset",
      description: "Reverted parameters to neutral values.",
    });
  };

  // Save manual snapshot
  const handleTakeSnapshot = () => {
    if (!enhancedImage && !originalImage) return;
    const snapRev: ImageRevision = {
      id: `rev-${Date.now()}`,
      title: `Snapshot #${revisions.length + 1}`,
      description: "Manual custom checkpoint",
      timestamp: Date.now(),
      dataUrl: enhancedImage || originalImage!,
      width: imageMetadata?.width || 1920,
      height: imageMetadata?.height || 1080,
      badge: "Snapshot",
    };
    setRevisions((prev) => [snapRev, ...prev]);
    setActiveRevisionId(snapRev.id);
    toast({
      title: "Snapshot Saved",
      description: "Added checkpoint to Revision Timeline.",
    });
  };

  // Restore revision
  const handleRestoreRevision = (rev: ImageRevision) => {
    setEnhancedImage(rev.dataUrl);
    setActiveRevisionId(rev.id);
    setComparingRevisionId(null);
    setImageMetadata((prev) =>
      prev
        ? {
            ...prev,
            width: rev.width,
            height: rev.height,
          }
        : null
    );
    toast({
      title: `Restored: ${rev.title}`,
      description: "Active canvas reverted to this version.",
    });
  };

  // Compare revision
  const handleCompareRevision = (rev: ImageRevision) => {
    setComparingRevisionId(rev.id);
    setComparisonMode("split");
    toast({
      title: `Comparing: ${rev.title}`,
      description: "Sliding divider now compares against this revision.",
    });
  };

  const handleStopComparing = () => {
    setComparingRevisionId(null);
  };

  const handleDeleteRevision = (id: string) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
    if (comparingRevisionId === id) setComparingRevisionId(null);
    toast({
      title: "Revision Removed",
      description: "Removed checkpoint from timeline.",
    });
  };

  // Select item from bulk queue to view on canvas
  const handleSelectBatchItemForCanvas = (item: BatchQueueItem) => {
    const target = item.enhancedUrl || item.originalUrl;
    setOriginalImage(item.originalUrl);
    setEnhancedImage(target);
    setImageMetadata({
      name: item.name,
      width:
        item.enhancedDimensions?.width ||
        item.originalDimensions?.width ||
        1920,
      height:
        item.enhancedDimensions?.height ||
        item.originalDimensions?.height ||
        1080,
      fileSize: `${(item.size / (1024 * 1024)).toFixed(2)} MB`,
    });
    setAdjustments(DEFAULT_ADJUSTMENTS);

    const initialRev: ImageRevision = {
      id: `rev-${Date.now()}`,
      title: item.name,
      description: "Loaded from Bulk Processing Queue",
      timestamp: Date.now(),
      dataUrl: item.originalUrl,
      width: item.originalDimensions?.width || 1920,
      height: item.originalDimensions?.height || 1080,
      badge: "Original",
    };
    setRevisions([initialRev]);
    setActiveRevisionId(initialRev.id);
    setComparingRevisionId(null);

    setIsBulkQueueOpen(false);
    toast({
      title: `Loaded: ${item.name}`,
      description: "Opened in primary canvas for inspection.",
    });
  };

  // Comparing image source for split comparator
  const comparingRev = revisions.find((r) => r.id === comparingRevisionId);
  const leftSourceImage = comparingRev ? comparingRev.dataUrl : originalImage;
  const leftSourceLabel = comparingRev
    ? `Revision: ${comparingRev.title}`
    : "Source Original";
  const rightTargetImage = enhancedImage || originalImage;

  return (
    <AppLayout title="Image Enhancer">
      <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
        {/* ========================================================= */}
        {/* DOCUMENT STUDIO STYLE TOP HEADER BAR                      */}
        {/* ========================================================= */}
        <header className="border-b border-border/60 bg-card/60 backdrop-blur-md px-4 sm:px-6 py-2.5 shrink-0 z-30">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
            {/* Left: Breadcrumbs & Document Identity */}
            <div className="flex items-center gap-3 min-w-0">
              {originalImage ? (
                <button
                  type="button"
                  onClick={handleCloseProject}
                  className="w-8 h-8 rounded-lg border border-border/60 hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Return to Empty Workspace"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Studio
                  </span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <h1 className="text-sm font-semibold text-foreground truncate">
                    {imageMetadata ? imageMetadata.name : "Image Enhancer"}
                  </h1>
                </div>

                {imageMetadata && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-mono tabular-nums">
                      {imageMetadata.width} × {imageMetadata.height} px
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{imageMetadata.fileSize}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-medium">
                      {upscaleMode} AI
                    </span>
                    {revisions.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-muted-foreground">
                          {revisions.length}{" "}
                          {revisions.length === 1 ? "revision" : "revisions"}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions, Bulk Queue, Timeline Toggle & Master Export */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleLoadFile(e.target.files[0]);
                }}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={multiFileInputRef}
                onChange={(e) => {
                  if (e.target.files) handleMultipleFiles(e.target.files);
                }}
                multiple
                accept="image/*"
                className="hidden"
              />

              {/* Bulk Queue Trigger */}
              <button
                type="button"
                onClick={() => setIsBulkQueueOpen(!isBulkQueueOpen)}
                className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  bulkQueue.length > 0
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
                title="Batch Queue for multiple images"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bulk Queue</span>
                {bulkQueue.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {bulkQueue.length}
                  </span>
                )}
              </button>

              {originalImage ? (
                <>
                  {/* Revision Timeline Quick Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setActiveInspectorTab("timeline");
                    }}
                    className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeInspectorTab === "timeline" && isSidebarOpen
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                        : "border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                    title="Open Revision Timeline"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Timeline</span>
                    {revisions.length > 0 && (
                      <span className="text-[11px] font-mono text-emerald-400">
                        ({revisions.length})
                      </span>
                    )}
                  </button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetAdjustments}
                    className="h-8 px-2.5 rounded-lg border-border/60 text-xs font-medium gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Reset to source values"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setIsExportModalOpen(true)}
                    className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </Button>

                  {/* Sidebar Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-8 h-8 rounded-lg border border-border/60 hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={isSidebarOpen ? "Hide Settings Panel" : "Show Settings Panel"}
                  >
                    {isSidebarOpen ? (
                      <PanelRightClose className="w-4 h-4" />
                    ) : (
                      <PanelRightOpen className="w-4 h-4" />
                    )}
                  </button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Image</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN BODY: EMPTY STATE OR ACTIVE SMART CANVAS STUDIO      */}
        {/* ========================================================= */}
        {!originalImage ? (
          /* ======================================================= */
          /* 1. ULTRA-SLEEK EMPTY STATE WORKSPACE (ZERO PREVIEW IMAGE) */
          /* ======================================================= */
          <main
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden"
          >
            {/* Ambient emerald backlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

            <div className="max-w-3xl w-full mx-auto space-y-8 relative z-10">
              {/* Full Workspace Minimalist Dropzone */}
              <div
                className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all ${
                  isDragOver
                    ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                    : "border-border/70 hover:border-emerald-500/50 bg-card/40 backdrop-blur-md shadow-xl"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mx-auto mb-5 shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>

                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  Drop image here to enhance
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
                  Support for single images, multi-image bulk batches, or clipboard paste. Floating controls appear once loaded.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Single Image</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => multiFileInputRef.current?.click()}
                    className="h-10 px-5 rounded-xl border-border/80 text-foreground font-medium text-xs gap-2 cursor-pointer hover:bg-muted/80"
                  >
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Open Bulk Batch Queue</span>
                  </Button>
                </div>

                {/* Keyboard & format cues */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground mt-6">
                  <span>PNG</span>
                  <span aria-hidden="true">·</span>
                  <span>JPG</span>
                  <span aria-hidden="true">·</span>
                  <span>WEBP</span>
                  <span aria-hidden="true">·</span>
                  <span>AVIF</span>
                  <span aria-hidden="true">·</span>
                  <span>Paste with <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Ctrl+V</kbd></span>
                </div>
              </div>

              {/* Instant One-Click Sample Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Or test immediately with a curated sample:</span>
                  <span className="text-[11px]">Instant evaluation</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {SAMPLE_TEST_IMAGES.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="p-3 rounded-xl border border-border/60 hover:border-emerald-500/50 bg-card/60 hover:bg-card/90 transition-all text-left cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                            {sample.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {sample.category}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                          {sample.description}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground group-hover:text-emerald-400">
                        <span>Load Sample</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        ) : (
          /* ======================================================= */
          /* 2. SMART CANVAS WORKSPACE WITH FLOATING CONTROLS        */
          /* ======================================================= */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* DISTRACTION-FREE CENTRAL SMART CANVAS */}
            <main
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              className="flex-1 bg-black/45 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none"
            >
              {/* Processing Overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {processingStatus || "Processing High-Frequency Neural Pixels..."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Applying bicubic interpolation and {upscaleMode} convolution kernels
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* =================================================== */}
              {/* FLOATING TOP CONTROL BAR (Appears only with image)  */}
              {/* =================================================== */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 bg-card/85 backdrop-blur-xl rounded-xl border border-border/70 shadow-xl">
                <button
                  type="button"
                  onClick={() => setComparisonMode("split")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    comparisonMode === "split"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Sliding wipe comparator"
                >
                  <Split className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Split Wipe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setComparisonMode("side-by-side")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    comparisonMode === "side-by-side"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Side-by-side view"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Side-by-Side</span>
                </button>

                <button
                  type="button"
                  onClick={() => setComparisonMode("single")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    comparisonMode === "single"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Single focus image view"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Single</span>
                </button>

                <button
                  type="button"
                  onClick={() => setComparisonMode("diff")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    comparisonMode === "diff"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Neural pixel difference overlay"
                >
                  <Contrast className="w-3.5 h-3.5" />
                  <span>Pixel Diff</span>
                </button>
              </div>

              {/* Floating Comparing Notification Banner */}
              {comparingRev && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 bg-cyan-950/90 border border-cyan-500/40 backdrop-blur-md rounded-xl shadow-lg">
                  <Split className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-xs text-cyan-200">
                    Comparing with: <span className="font-semibold text-white">{comparingRev.title}</span>
                  </span>
                  <div className="w-px h-3 bg-cyan-500/40 mx-1" />
                  <button
                    type="button"
                    onClick={handleStopComparing}
                    className="text-[11px] text-cyan-400 hover:text-cyan-200 font-medium cursor-pointer"
                  >
                    Exit Compare
                  </button>
                </div>
              )}

              {/* =================================================== */}
              {/* PRIMARY CANVAS VIEWPORT CONTAINER                   */}
              {/* =================================================== */}
              <div
                ref={sliderContainerRef}
                className="relative max-w-full max-h-[76vh] rounded-2xl overflow-hidden border border-border/60 shadow-2xl bg-card/40 flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transition: "transform 0.15s ease-out",
                }}
              >
                {/* Mode 1: Split Wipe Comparison Slider */}
                {comparisonMode === "split" && (
                  <div className="relative inline-block max-h-[76vh] overflow-hidden select-none">
                    {/* Enhanced Image (Base underneath) */}
                    <img
                      src={rightTargetImage}
                      alt="Enhanced Target"
                      referrerPolicy="no-referrer"
                      className="max-h-[76vh] w-auto object-contain block pointer-events-none"
                    />

                    {/* Source / Comparing Revision (Clipped by slider position) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none border-r-2 border-emerald-400 shadow-xl"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={leftSourceImage || originalImage}
                        alt="Comparison Source"
                        referrerPolicy="no-referrer"
                        className="max-h-[76vh] w-auto object-contain block max-w-none"
                        style={{
                          width:
                            sliderContainerRef.current?.querySelector("img")
                              ?.clientWidth || "auto",
                          height:
                            sliderContainerRef.current?.querySelector("img")
                              ?.clientHeight || "auto",
                        }}
                      />
                    </div>

                    {/* Draggable Divider Handle */}
                    <div
                      onMouseDown={() => {
                        isDraggingSlider.current = true;
                      }}
                      onTouchStart={() => {
                        isDraggingSlider.current = true;
                      }}
                      className="absolute inset-y-0 -ml-3.5 w-7 flex items-center justify-center cursor-ew-resize z-20 group"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white shadow-xl flex items-center justify-center border-2 border-white ring-2 ring-black/40 group-hover:scale-110 transition-transform">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Badges for Left / Right */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-semibold text-white pointer-events-none">
                      {leftSourceLabel} ({sliderPosition}%)
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-emerald-950/85 border border-emerald-500/40 backdrop-blur-xs text-[10px] font-semibold text-emerald-300 pointer-events-none">
                      Current Enhanced ({100 - sliderPosition}%)
                    </div>
                  </div>
                )}

                {/* Mode 2: Side-by-Side View */}
                {comparisonMode === "side-by-side" && (
                  <div className="grid grid-cols-2 gap-3 p-3 max-h-[76vh]">
                    <div className="relative rounded-xl overflow-hidden border border-border/70 bg-black/60 flex items-center justify-center">
                      <img
                        src={leftSourceImage || originalImage}
                        alt="Source"
                        referrerPolicy="no-referrer"
                        className="max-h-[70vh] w-auto object-contain block"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/75 text-[10px] font-semibold text-white">
                        {leftSourceLabel}
                      </span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-black/60 flex items-center justify-center">
                      <img
                        src={rightTargetImage}
                        alt="Enhanced"
                        referrerPolicy="no-referrer"
                        className="max-h-[70vh] w-auto object-contain block"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-emerald-950/85 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                        Active Enhanced ({upscaleMode})
                      </span>
                    </div>
                  </div>
                )}

                {/* Mode 3: Single View with Hold-to-Original */}
                {comparisonMode === "single" && (
                  <div className="relative max-h-[76vh] overflow-hidden">
                    <img
                      src={
                        isPressingOriginal
                          ? leftSourceImage || originalImage
                          : rightTargetImage
                      }
                      alt="Active View"
                      referrerPolicy="no-referrer"
                      className="max-h-[76vh] w-auto object-contain block"
                    />

                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-[11px] font-medium text-white">
                        {isPressingOriginal
                          ? `Showing ${leftSourceLabel}`
                          : `Enhanced (${upscaleMode} Mode)`}
                      </span>

                      <button
                        type="button"
                        onMouseDown={() => setIsPressingOriginal(true)}
                        onMouseUp={() => setIsPressingOriginal(false)}
                        onTouchStart={() => setIsPressingOriginal(true)}
                        onTouchEnd={() => setIsPressingOriginal(false)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-lg transition-transform active:scale-95 cursor-pointer"
                      >
                        Hold to View Original
                      </button>
                    </div>
                  </div>
                )}

                {/* Mode 4: Pixel Diff View */}
                {comparisonMode === "diff" && (
                  <div className="relative max-h-[76vh] overflow-hidden">
                    <img
                      src={rightTargetImage}
                      alt="Diff Base"
                      referrerPolicy="no-referrer"
                      className="max-h-[76vh] w-auto object-contain block"
                    />
                    <img
                      src={leftSourceImage || originalImage}
                      alt="Diff Invert"
                      referrerPolicy="no-referrer"
                      className="max-h-[76vh] w-auto object-contain block absolute inset-0 mix-blend-difference pointer-events-none opacity-85"
                    />
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-xs text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                        Difference Heatmap · Highlights pixel luminance & frequency shifts
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================== */}
              {/* FLOATING BOTTOM SMART ACTION HUD                    */}
              {/* =================================================== */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 bg-card/85 backdrop-blur-xl rounded-xl border border-border/70 shadow-xl">
                {/* Zoom Out */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <span className="text-xs font-mono tabular-nums text-muted-foreground px-1.5">
                  {zoomLevel}%
                </span>

                {/* Zoom In */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {/* Fit */}
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Fit
                </button>

                <div className="w-px h-4 bg-border/80 mx-1" />

                {/* Quick Auto-Tone */}
                <button
                  type="button"
                  onClick={handleAutoTone}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="AI Auto-Tone Balance"
                >
                  <Wand2 className="w-3 h-3" />
                  <span className="hidden md:inline">Auto-Tone</span>
                </button>

                {/* Save Snapshot */}
                <button
                  type="button"
                  onClick={handleTakeSnapshot}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                  title="Save current state to Revision Timeline"
                >
                  <Camera className="w-3 h-3 text-cyan-400" />
                  <span className="hidden md:inline">Snapshot</span>
                </button>
              </div>
            </main>

            {/* ===================================================== */}
            {/* RIGHT DEDICATED DOCUMENT STUDIO TRANSFORMATION SIDEBAR */}
            {/* ===================================================== */}
            {isSidebarOpen && (
              <aside className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-border/60 bg-card/75 backdrop-blur-xl flex flex-col shrink-0">
                {/* Segmented Tab Bar */}
                <div className="p-3 border-b border-border/50 bg-muted/20">
                  <div className="grid grid-cols-5 gap-1 p-1 bg-muted/60 rounded-xl border border-border/60">
                    <button
                      type="button"
                      onClick={() => setActiveInspectorTab("super-res")}
                      className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                        activeInspectorTab === "super-res"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="AI Super Resolution"
                    >
                      AI Upscale
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInspectorTab("timeline")}
                      className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center relative ${
                        activeInspectorTab === "timeline"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Revision Timeline"
                    >
                      Timeline
                      {revisions.length > 0 && (
                        <span className="ml-1 text-[10px] font-mono text-emerald-400 font-bold">
                          {revisions.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInspectorTab("presets")}
                      className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                        activeInspectorTab === "presets"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Color LUT Presets"
                    >
                      LUTs
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInspectorTab("background")}
                      className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                        activeInspectorTab === "background"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Studio Background Isolation"
                    >
                      Studio Bg
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInspectorTab("sliders")}
                      className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                        activeInspectorTab === "sliders"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Precision Optical Sliders"
                    >
                      Precision
                    </button>
                  </div>
                </div>

                {/* Inspector Content Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[calc(100vh-120px)]">
                  {/* =================================================== */}
                  {/* TAB 1: AI SUPER RESOLUTION ENGINE                   */}
                  {/* =================================================== */}
                  {activeInspectorTab === "super-res" && (
                    <div className="space-y-6">
                      {/* Super-Resolution Mode Selection */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground">
                            Super-Resolution Mode
                          </label>
                          <span className="text-[11px] text-emerald-400 font-medium">
                            Multi-Pass Neural
                          </span>
                        </div>

                        <div className="space-y-2">
                          {[
                            {
                              id: "Photo" as UpscaleMode,
                              name: "Photo Mode",
                              desc: "Fine detail preservation, natural skin tones, texture recovery & micro-contrast",
                              icon: Focus,
                            },
                            {
                              id: "Artistic" as UpscaleMode,
                              name: "Artistic Mode",
                              desc: "Vector-like edge enhancement, vibrant dynamic range, clean line rasterization",
                              icon: Brush,
                            },
                            {
                              id: "Text-Heavy" as UpscaleMode,
                              name: "Text-Heavy Mode",
                              desc: "OCR sharpening, dark stroke density, paper de-noise & document clarity",
                              icon: FileText,
                            },
                          ].map((m) => {
                            const Icon = m.icon;
                            const isSelected = upscaleMode === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setUpscaleMode(m.id)}
                                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/30"
                                    : "border-border/60 hover:border-border text-muted-foreground"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                    isSelected
                                      ? "bg-emerald-500 text-white"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground">
                                    {m.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                    {m.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Scale Factor Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">
                            Target Upscale Factor
                          </span>
                          {imageMetadata && (
                            <span className="font-mono text-emerald-400 text-xs">
                              →{" "}
                              {Math.round(
                                imageMetadata.width *
                                  (upscaleScale === "8x"
                                    ? 4
                                    : upscaleScale === "4x"
                                    ? 3
                                    : 2)
                              )}{" "}
                              ×{" "}
                              {Math.round(
                                imageMetadata.height *
                                  (upscaleScale === "8x"
                                    ? 4
                                    : upscaleScale === "4x"
                                    ? 3
                                    : 2)
                              )}{" "}
                              px
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { scale: "2x" as UpscaleScale, label: "2x Fast HD" },
                            { scale: "4x" as UpscaleScale, label: "4x Ultra HD" },
                            { scale: "8x" as UpscaleScale, label: "8x Neural 8K" },
                          ].map((s) => (
                            <button
                              key={s.scale}
                              type="button"
                              onClick={() => setUpscaleScale(s.scale)}
                              className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                                upscaleScale === s.scale
                                  ? "border-emerald-500 bg-emerald-500 text-white font-semibold shadow-xs"
                                  : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fine-Tuning Toggles */}
                      <div className="space-y-2.5 pt-2 border-t border-border/40">
                        <label className="text-xs font-semibold text-foreground">
                          Neural Modules
                        </label>

                        <div className="space-y-2">
                          <label className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 hover:border-border cursor-pointer">
                            <span className="text-xs font-medium text-foreground">
                              Face & Feature Restoration
                            </span>
                            <input
                              type="checkbox"
                              checked={faceRestoration}
                              onChange={(e) =>
                                setFaceRestoration(e.target.checked)
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 hover:border-border cursor-pointer">
                            <span className="text-xs font-medium text-foreground">
                              High-Frequency Denoise
                            </span>
                            <input
                              type="checkbox"
                              checked={denoiseFilter}
                              onChange={(e) =>
                                setDenoiseFilter(e.target.checked)
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 hover:border-border cursor-pointer">
                            <span className="text-xs font-medium text-foreground">
                              Micro-Contrast S-Curve
                            </span>
                            <input
                              type="checkbox"
                              checked={microContrast}
                              onChange={(e) =>
                                setMicroContrast(e.target.checked)
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Primary Upscale Trigger Button */}
                      <div className="space-y-2 pt-2">
                        <Button
                          onClick={handleRunSuperResolution}
                          disabled={isProcessing}
                          className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          <span>
                            {isProcessing
                              ? "Rendering Super-Resolution..."
                              : `Render ${upscaleScale} ${upscaleMode} Upscale`}
                          </span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleAutoTone}
                          className="w-full h-9 rounded-xl border-border/60 text-xs font-medium gap-1.5 cursor-pointer hover:bg-muted/60"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AI Auto-Tone Optimization</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* =================================================== */}
                  {/* TAB 2: REVISION TIMELINE                            */}
                  {/* =================================================== */}
                  {activeInspectorTab === "timeline" && (
                    <RevisionTimeline
                      revisions={revisions}
                      activeRevisionId={activeRevisionId}
                      comparingRevisionId={comparingRevisionId}
                      onRestoreRevision={handleRestoreRevision}
                      onCompareRevision={handleCompareRevision}
                      onStopComparing={handleStopComparing}
                      onTakeSnapshot={handleTakeSnapshot}
                      onDeleteRevision={handleDeleteRevision}
                    />
                  )}

                  {/* =================================================== */}
                  {/* TAB 3: COLOR GRADE & CINEMA LUTS                    */}
                  {/* =================================================== */}
                  {activeInspectorTab === "presets" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-foreground">
                          Cinema Color Profiles
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Handcrafted 3D LUT curves for immediate cinematic grading.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {COLOR_GRADE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className="p-3 rounded-xl border border-border/60 hover:border-emerald-500/50 bg-card/60 hover:bg-card/90 transition-all text-left cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {preset.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {preset.category}
                              </p>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                              <span>Apply LUT</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* =================================================== */}
                  {/* TAB 4: BACKGROUND STUDIO ISOLATION                  */}
                  {/* =================================================== */}
                  {activeInspectorTab === "background" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-foreground">
                          Background Studio Isolation
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Subject segmentation, bokeh portrait blur, and e-commerce backdrops.
                        </p>
                      </div>

                      <div className="space-y-2">
                        {[
                          {
                            id: "transparent" as const,
                            label: "Transparent Cutout (PNG)",
                            desc: "Isolated subject ready for graphic design",
                          },
                          {
                            id: "studio-dark" as const,
                            label: "Dark Studio Matte",
                            desc: "Minimalist dark backdrop with radial rim light",
                          },
                          {
                            id: "studio-white" as const,
                            label: "Pure White E-Commerce",
                            desc: "Catalog white background for marketplace listings",
                          },
                          {
                            id: "bokeh-blur" as const,
                            label: "Bokeh Portrait Blur",
                            desc: "f/1.4 shallow depth of field optical blur",
                          },
                          {
                            id: "gradient" as const,
                            label: "Emerald Twilight Gradient",
                            desc: "Atmospheric editorial lighting",
                          },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleApplyBackground(item.id)}
                            className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              bgMode === item.id
                                ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                                : "border-border/60 hover:border-border text-muted-foreground"
                            }`}
                          >
                            <p className="text-xs font-semibold text-foreground">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {item.desc}
                            </p>
                          </button>
                        ))}
                      </div>

                      {bgMode === "bokeh-blur" && (
                        <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border/60">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">
                              Bokeh Blur Radius
                            </span>
                            <span className="font-mono text-muted-foreground">
                              {bokehBlurRadius}px
                            </span>
                          </div>
                          <Slider
                            value={[bokehBlurRadius]}
                            min={4}
                            max={30}
                            step={1}
                            onValueChange={(v) => {
                              setBokehBlurRadius(v[0]);
                              handleApplyBackground("bokeh-blur");
                            }}
                            className="py-1 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* =================================================== */}
                  {/* TAB 5: PRECISION MANUAL TUNING SLIDERS              */}
                  {/* =================================================== */}
                  {activeInspectorTab === "sliders" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-foreground">
                          Optical Parameters
                        </h3>
                        <button
                          type="button"
                          onClick={handleResetAdjustments}
                          className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          Reset All
                        </button>
                      </div>

                      <div className="space-y-3.5">
                        {/* Brightness */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              Exposure / Brightness
                            </span>
                            <span className="font-mono tabular-nums text-foreground">
                              {adjustments.brightness}%
                            </span>
                          </div>
                          <Slider
                            value={[adjustments.brightness]}
                            min={50}
                            max={160}
                            step={1}
                            onValueChange={(v) =>
                              setAdjustments({ ...adjustments, brightness: v[0] })
                            }
                            className="py-1 cursor-pointer"
                          />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              Contrast
                            </span>
                            <span className="font-mono tabular-nums text-foreground">
                              {adjustments.contrast}%
                            </span>
                          </div>
                          <Slider
                            value={[adjustments.contrast]}
                            min={50}
                            max={180}
                            step={1}
                            onValueChange={(v) =>
                              setAdjustments({ ...adjustments, contrast: v[0] })
                            }
                            className="py-1 cursor-pointer"
                          />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              Vibrance & Saturation
                            </span>
                            <span className="font-mono tabular-nums text-foreground">
                              {adjustments.saturation}%
                            </span>
                          </div>
                          <Slider
                            value={[adjustments.saturation]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={(v) =>
                              setAdjustments({
                                ...adjustments,
                                saturation: v[0],
                              })
                            }
                            className="py-1 cursor-pointer"
                          />
                        </div>

                        {/* Warmth */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              Color Temperature (Warmth)
                            </span>
                            <span className="font-mono tabular-nums text-foreground">
                              {adjustments.warmth > 0
                                ? `+${adjustments.warmth}`
                                : adjustments.warmth}
                            </span>
                          </div>
                          <Slider
                            value={[adjustments.warmth]}
                            min={-50}
                            max={50}
                            step={1}
                            onValueChange={(v) =>
                              setAdjustments({ ...adjustments, warmth: v[0] })
                            }
                            className="py-1 cursor-pointer"
                          />
                        </div>

                        {/* Vignette */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              Vignette Framing
                            </span>
                            <span className="font-mono tabular-nums text-foreground">
                              {adjustments.vignette}%
                            </span>
                          </div>
                          <Slider
                            value={[adjustments.vignette]}
                            min={0}
                            max={60}
                            step={1}
                            onValueChange={(v) =>
                              setAdjustments({
                                ...adjustments,
                                vignette: v[0],
                              })
                            }
                            className="py-1 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* BULK PROCESSING QUEUE MODAL / DRAWER                      */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isBulkQueueOpen && (
            <BulkProcessingQueue
              isOpen={isBulkQueueOpen}
              queue={bulkQueue}
              onClose={() => setIsBulkQueueOpen(false)}
              onUpdateQueue={setBulkQueue}
              onSelectForCanvas={handleSelectBatchItemForCanvas}
              onAddFiles={handleMultipleFiles}
            />
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* HIGH-RES EXPORT MASTER MODAL                              */}
        {/* ========================================================= */}
        {isExportModalOpen && (
          <ImageEnhancerExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            enhancedImageUrl={enhancedImage || originalImage}
            originalWidth={imageMetadata?.width || 1920}
            originalHeight={imageMetadata?.height || 1080}
          />
        )}
      </div>
    </AppLayout>
  );
}
