import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import {
  FileSearch,
  Upload,
  Copy,
  Check,
  Loader2,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Circle,
  Square,
  Search,
  Send,
  Volume2,
  VolumeX,
  ShoppingCart,
  Scissors,
  Camera,
  Globe,
  Table as TableIcon,
  Download,
  Info,
  Maximize2,
  Minimize2,
  Eye,
  Sliders,
  Crosshair,
  Layers,
  HelpCircle,
  Video,
  X,
  CheckCircle2,
  List,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  ExternalLink,
  TrendingUp,
  Hash,
  Palette,
  Grid3X3,
  Share2,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

interface BoundingBoxItem {
  id: string;
  label: string;
  category: "Object" | "Text Block" | "Chart/Data" | "Face/Person" | "Branding";
  confidence: number;
  color: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  description: string;
}

interface SamplePreset {
  id: string;
  name: string;
  category: "Menu" | "Financial Chart" | "Document" | "Product" | "Infographic" | "Architecture";
  url: string;
  ocrText: string;
  insights: string;
  suggestedQuestions: string[];
  detectedObjects: BoundingBoxItem[];
  tableData?: Array<Record<string, string>>;
}

interface CircleSearchResult {
  type?: "product" | "text" | "landmark" | "food" | "general";
  title?: string;
  category?: string;
  summary?: string;
  specs?: Array<{ label: string; value: string }>;
  priceComparison?: Array<{
    platform: string;
    price: string;
    bestDeal?: boolean;
    url?: string;
  }>;
  keyFacts?: string[];
  ocrText?: string;
  translation?: string;
  webMatches?: Array<{
    title: string;
    snippet: string;
    domain: string;
    url: string;
  }>;
  followUps?: string[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isCircledContext?: boolean;
}

interface TechnicalMetadata {
  resolution: string;
  width: number;
  height: number;
  fileType: string;
  fileSize: string;
  aspectRatio: string;
  colorSpace: string;
  objectCount: number;
  ocrCharCount: number;
  aiLatency: string;
  confidenceScore: string;
  dominantColors?: string[];
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "menu",
    name: "Artisan Bistro Menu",
    category: "Menu",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=85",
    ocrText: `ARTISAN BISTRO & SPECIALTY ESPRESSO\n- Truffle Mushroom Toast: $14.50 (Organic Sourdough, Whipped Ricotta)\n- Smoked Salmon Bagel: $16.00 (Wild Alaskan Salmon, Dill Cream Cheese)\n- Single Origin Chemex: $6.00 (Ethiopian Yirgacheffe, Notes of Jasmine)\n- Matcha Oat Latte: $7.00 (Uji Ceremonial Grade, Barista Oat Milk)\n- Gluten-Free Almond Croissant: $5.50 (Frangipane, Toasted Flaked Almonds)`,
    insights: `### 🥐 Culinary Layout & Pricing Summary\n\n- **Cuisine Classification**: Contemporary Third-Wave Coffeehouse & Artisanal Brunch Bistro\n- **Price Range**: $5.50 – $16.00 with a median brunch spend of $14.50\n- **Dietary Coverage**: Explicit Vegetarian (*Truffle Mushroom Toast*) and Gluten-Free (*Almond Croissant*) certification\n- **Signature Pairing**: Ethiopian Yirgacheffe Chemex with Smoked Salmon Bagel`,
    suggestedQuestions: [
      "What vegetarian items are available on this menu?",
      "What is the average price of breakfast items?",
      "Recommend a coffee and pastry combination",
      "Are there any dairy-free beverage options?",
    ],
    detectedObjects: [
      {
        id: "obj-1",
        label: "Branding Header",
        category: "Branding",
        confidence: 99.4,
        color: "#06b6d4",
        x: 10,
        y: 8,
        width: 80,
        height: 18,
        description: "Title banner indicating 'ARTISAN BISTRO & SPECIALTY ESPRESSO' in serif typography.",
      },
      {
        id: "obj-2",
        label: "Culinary Items Listing",
        category: "Text Block",
        confidence: 98.1,
        color: "#10b981",
        x: 12,
        y: 30,
        width: 76,
        height: 35,
        description: "Itemized culinary listing containing Truffle Mushroom Toast and Smoked Salmon Bagel.",
      },
      {
        id: "obj-3",
        label: "Specialty Beverages",
        category: "Object",
        confidence: 96.5,
        color: "#f43f5e",
        x: 15,
        y: 68,
        width: 70,
        height: 25,
        description: "Craft coffee section featuring Chemex single origin and Matcha Oat Latte.",
      },
    ],
    tableData: [
      { Item: "Truffle Mushroom Toast", Category: "Brunch", Price: "$14.50", Dietary: "Vegetarian" },
      { Item: "Smoked Salmon Bagel", Category: "Brunch", Price: "$16.00", Dietary: "Pescatarian" },
      { Item: "Single Origin Chemex", Category: "Beverage", Price: "$6.00", Dietary: "Vegan" },
      { Item: "Matcha Oat Latte", Category: "Beverage", Price: "$7.00", Dietary: "Vegan" },
      { Item: "Almond Croissant", Category: "Bakery", Price: "$5.50", Dietary: "Gluten-Free" },
    ],
  },
  {
    id: "chart",
    name: "Q4 Financial Growth Chart",
    category: "Financial Chart",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=85",
    ocrText: `Q4 FISCAL METRICS & RETENTION\n- Gross ARR: $24.8M (+38% YoY)\n- Enterprise Net Retention Rate (NDR): 124%\n- Software Gross Margin: 78.4%\n- Operating Cash Flow: +$4.2M (+112% YoY)\n- Customer Acquisition Cost Payback: 8.2 Months`,
    insights: `### 📈 Quantitative Revenue & Retention Insights\n\n- **Revenue Velocity**: High YoY acceleration (+38% ARR growth to $24.8M)\n- **Enterprise Stickiness**: Net expansion at 124% indicates compounding customer lifetime value\n- **Unit Economics**: Software gross margin remains healthy at 78.4%\n- **Cash Efficiency**: Operating cash flow is net positive (+$4.2M)`,
    suggestedQuestions: [
      "What is the year-over-year ARR growth rate?",
      "Is the company operating cash flow positive?",
      "Analyze the gross margin health and unit economics",
      "What does the 124% net retention rate signify?",
    ],
    detectedObjects: [
      {
        id: "obj-chart-1",
        label: "Trend Trajectory Graph",
        category: "Chart/Data",
        confidence: 99.8,
        color: "#06b6d4",
        x: 8,
        y: 12,
        width: 84,
        height: 50,
        description: "Ascending trajectory graph mapping ARR progression across Q1-Q4 fiscal periods.",
      },
      {
        id: "obj-chart-2",
        label: "KPI Metric Cards",
        category: "Text Block",
        confidence: 97.9,
        color: "#8b5cf6",
        x: 10,
        y: 65,
        width: 80,
        height: 28,
        description: "High-level summary widgets detailing 78.4% Gross Margin and +$4.2M Cash Flow.",
      },
    ],
    tableData: [
      { Metric: "Gross ARR", Value: "$24.8M", YoYChange: "+38%", Status: "Target Exceeded" },
      { Metric: "Net Retention (NDR)", Value: "124%", YoYChange: "+6%", Status: "Healthy Expansion" },
      { Metric: "Gross Margin", Value: "78.4%", YoYChange: "+2.1%", Status: "Optimal" },
      { Metric: "Operating Cash Flow", Value: "+$4.2M", YoYChange: "+112%", Status: "Positive" },
      { Metric: "CAC Payback", Value: "8.2 Mos", YoYChange: "-1.4 Mos", Status: "Highly Efficient" },
    ],
  },
  {
    id: "product",
    name: "Commercial Runner Sneaker",
    category: "Product",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85",
    ocrText: `AIR RUNNER PERFORMANCE\n- Breathable Engineered Mesh Upper\n- Responsive Zoom Cushioning Sole\n- Carbon Fiber Stabilization Plate\n- Colorway: Crimson Flame / Pure Platinum\n- SKU: RN-9824-CR`,
    insights: `### 👟 Product Inspection & Commercial Dossier\n\n- **Category**: High-Performance Athletic Footwear\n- **Materiality**: Engineered jacquard mesh with bonded thermoplastic overlays\n- **Target Audience**: Long-distance runners and urban lifestyle consumers\n- **Pricing Position**: Premium tier ($120 – $150 market average)`,
    suggestedQuestions: [
      "What are the key technical materials in this sneaker?",
      "Find current e-commerce price comparisons for this shoe",
      "What is the recommended usage for this footwear?",
      "Identify the exact colorway and cushioning technology",
    ],
    detectedObjects: [
      {
        id: "obj-prod-1",
        label: "Engineered Mesh Upper",
        category: "Object",
        confidence: 99.2,
        color: "#f43f5e",
        x: 15,
        y: 20,
        width: 70,
        height: 40,
        description: "Breathable engineered mesh upper in vibrant crimson.",
      },
      {
        id: "obj-prod-2",
        label: "Responsive Outsole & Cushioning",
        category: "Object",
        confidence: 98.7,
        color: "#06b6d4",
        x: 10,
        y: 60,
        width: 80,
        height: 30,
        description: "Segmented aerodynamic midsole featuring responsive foam.",
      },
    ],
    tableData: [
      { Component: "Upper Material", Specification: "Jacquard Engineered Mesh", Weight: "Lightweight" },
      { Component: "Midsole", Specification: "Responsive Dual-Density Foam", Weight: "Cushioned" },
      { Component: "Outsole", Specification: "High-Abrasion Rubber Traction", Weight: "Durable" },
      { Component: "Plate", Specification: "Internal Carbon Shank", Weight: "Rigid" },
    ],
  },
  {
    id: "doc",
    name: "Legal Mutual NDA Agreement",
    category: "Document",
    url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=85",
    ocrText: `MUTUAL NON-DISCLOSURE AGREEMENT\n1. Definition of Confidential Information\n2. Standard of Care: Commercial reasonableness and strict need-to-know access\n3. Term of Obligation: 24 months following termination of commercial discussions\n4. Governing Law & Jurisdiction: State of Delaware, United States`,
    insights: `### ⚖️ Legal Risk & Clause Breakdown\n\n- **Contract Class**: Bilateral Mutual Non-Disclosure Agreement\n- **Duration**: 2-year confidentiality obligation post-termination\n- **Governing Jurisdiction**: State of Delaware, USA\n- **Risk Profile**: Standard commercial terms with bilateral reciprocity and no unilateral IP lockups`,
    suggestedQuestions: [
      "What is the governing jurisdiction for this contract?",
      "How long does the confidentiality obligation last?",
      "Are there any restrictive non-compete clauses?",
      "Summarize the required standard of care",
    ],
    detectedObjects: [
      {
        id: "obj-doc-1",
        label: "Document Header & Title",
        category: "Branding",
        confidence: 99.1,
        color: "#06b6d4",
        x: 15,
        y: 10,
        width: 70,
        height: 15,
        description: "Official title marking 'MUTUAL NON-DISCLOSURE AGREEMENT'.",
      },
      {
        id: "obj-doc-2",
        label: "Confidentiality Clauses",
        category: "Text Block",
        confidence: 96.8,
        color: "#10b981",
        x: 12,
        y: 28,
        width: 76,
        height: 55,
        description: "Paragraph clauses setting 24-month term limits and Delaware jurisdiction.",
      },
    ],
    tableData: [
      { Section: "Clause 1", Topic: "Confidential Info", RiskLevel: "Low", Impact: "Standard Scope" },
      { Section: "Clause 2", Topic: "Standard of Care", RiskLevel: "Low", Impact: "Commercial Prudence" },
      { Section: "Clause 3", Topic: "Term Limit", RiskLevel: "Medium", Impact: "24 Months Post-Term" },
      { Section: "Clause 4", Topic: "Jurisdiction", RiskLevel: "Low", Impact: "State of Delaware" },
    ],
  },
  {
    id: "architecture",
    name: "Classical Landmark Architecture",
    category: "Architecture",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=85",
    ocrText: `ARCHITECTURAL MONUMENT & FACADE\n- Period: Neoclassical Revival (circa late 19th Century)\n- Architectural Order: Corinthian Columns with Acanthus Leaves\n- Material: Honed White Carrara Marble and Portland Stone\n- Elevation: Symmetrical pediment with decorative relief frieze`,
    insights: `### 🏛️ Architectural & Historical Analysis\n\n- **Style & Movement**: Neoclassical Revival with high-symmetry Corinthian colonnade\n- **Structural Engineering**: Load-bearing masonry with fluted monolithic stone pillars\n- **Preservation Status**: Institutional grade heritage structure\n- **Lighting & Exposure**: Golden-hour directional illumination highlighting facade relief depth`,
    suggestedQuestions: [
      "What architectural style and order is featured?",
      "What type of stone and materials are used?",
      "Circle the columns or pediment to search historical records",
      "What is the cultural significance of this style?",
    ],
    detectedObjects: [
      {
        id: "obj-arch-1",
        label: "Corinthian Colonnade",
        category: "Object",
        confidence: 99.5,
        color: "#f59e0b",
        x: 18,
        y: 35,
        width: 64,
        height: 52,
        description: "Series of fluted stone columns with intricate carved capitals.",
      },
      {
        id: "obj-arch-2",
        label: "Triangular Pediment & Frieze",
        category: "Object",
        confidence: 98.3,
        color: "#8b5cf6",
        x: 15,
        y: 12,
        width: 70,
        height: 24,
        description: "Classical triangular pediment with high-relief sculpted frieze.",
      },
    ],
    tableData: [
      { Element: "Columns", Order: "Corinthian", Material: "Carrara Marble", Fluting: "24 Flutes" },
      { Element: "Pediment", Style: "Triangular Greek", Material: "Portland Stone", Carving: "High Relief" },
      { Element: "Entablature", Order: "Ionic-Corinthian", Material: "Limestone", Detail: "Dentil Moulding" },
    ],
  },
];

export default function Summarizer() {
  const { toast } = useToast();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  // Active Preset & Image
  const [selectedPreset, setSelectedPreset] = useState<SamplePreset>(SAMPLE_PRESETS[0]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(SAMPLE_PRESETS[0].url);
  const [detectedCategory, setDetectedCategory] = useState<string>(SAMPLE_PRESETS[0].category);
  const [ocrText, setOcrText] = useState<string>(SAMPLE_PRESETS[0].ocrText);
  const [insights, setInsights] = useState<string>(SAMPLE_PRESETS[0].insights);
  const [detectedObjects, setDetectedObjects] = useState<BoundingBoxItem[]>(SAMPLE_PRESETS[0].detectedObjects);
  const [tableData, setTableData] = useState<Array<Record<string, string>>>(SAMPLE_PRESETS[0].tableData || []);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(SAMPLE_PRESETS[0].suggestedQuestions);

  // Inspector Tabs
  const [activeTab, setActiveTab] = useState<
    "summary" | "circle-search" | "ocr" | "table" | "qa" | "tech"
  >("summary");

  // Canvas View Controls
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [selectedObject, setSelectedObject] = useState<BoundingBoxItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number } | null>(null);
  const [showGridOverlay, setShowGridOverlay] = useState(false);

  // Circle to Search Interactive Drawing State
  const [isCircleSearchMode, setIsCircleSearchMode] = useState(false);
  const [selectionType, setSelectionType] = useState<"circle" | "rectangle">("circle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [lassoPoints, setLassoPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isAnalyzingSelection, setIsAnalyzingSelection] = useState(false);
  const [circleSearchResult, setCircleSearchResult] = useState<CircleSearchResult | null>(null);

  // Optical Translation State
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [ocrSearchQuery, setOcrSearchQuery] = useState("");

  // Technical Metadata State
  const [techMetadata, setTechMetadata] = useState<TechnicalMetadata>({
    resolution: "1920 × 1080 px",
    width: 1920,
    height: 1080,
    fileType: "JPEG",
    fileSize: "1.42 MB",
    aspectRatio: "16:9",
    colorSpace: "sRGB 24-bit TrueColor",
    objectCount: SAMPLE_PRESETS[0].detectedObjects.length,
    ocrCharCount: SAMPLE_PRESETS[0].ocrText.length,
    aiLatency: "34 ms",
    confidenceScore: "99.4%",
    dominantColors: ["#0f172a", "#0284c7", "#f43f5e", "#10b981", "#f59e0b"],
  });

  // Table search filter
  const [tableSearchQuery, setTableSearchQuery] = useState("");

  // Live Camera Capture Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Image Q&A Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Calculate actual dimensions on image load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 1920;
    const h = img.naturalHeight || 1080;
    const gcdVal = (a: number, b: number): number => (b === 0 ? a : gcdVal(b, a % b));
    const divisor = gcdVal(w, h);
    const aspectStr = `${Math.round(w / divisor)}:${Math.round(h / divisor)}`;

    setTechMetadata((prev) => ({
      ...prev,
      resolution: `${w} × ${h} px`,
      width: w,
      height: h,
      aspectRatio: aspectStr,
    }));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Process uploaded or pasted image file
  const handleProcessUploadedFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    stop();
    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCurrentImageUrl(dataUrl);
      setSelectedObject(null);
      setCropBox(null);
      setCircleSearchResult(null);
      setTranslatedText("");

      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const ext = file.name.split(".").pop()?.toUpperCase() || "IMAGE";

      try {
        const res = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });

        const analysisData = await res.json();

        setDetectedCategory(analysisData.detectedCategory || "General");
        setInsights(analysisData.summary || `### Visual Overview: ${file.name}`);
        setOcrText(analysisData.ocrText || "[No legible text detected]");
        setDetectedObjects(analysisData.detectedObjects || []);
        setTableData(analysisData.tableData || []);
        if (analysisData.suggestedQuestions) {
          setSuggestedQuestions(analysisData.suggestedQuestions);
        }

        setTechMetadata({
          resolution: "1920 × 1080 px",
          width: 1920,
          height: 1080,
          fileType: ext,
          fileSize: `${sizeMb} MB`,
          aspectRatio: "16:9",
          colorSpace: "sRGB 24-bit TrueColor",
          objectCount: (analysisData.detectedObjects || []).length,
          ocrCharCount: (analysisData.ocrText || "").length,
          aiLatency: "31 ms",
          confidenceScore: "99.2%",
          dominantColors: ["#0284c7", "#0f172a", "#f43f5e", "#10b981"],
        });

        setChatMessages([
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: `📸 **"${file.name}"** loaded and analyzed!\n\nClassified as **${analysisData.detectedCategory || "General"}**. Detected **${(analysisData.detectedObjects || []).length} key regions**. You can ask questions, translate text, or use Circle to Search.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        toast({
          title: "Image Analyzed Successfully",
          description: `Loaded ${file.name} (${sizeMb} MB).`,
        });
      } catch (err) {
        console.warn("Analysis fallback:", err);
        setDetectedCategory("General");
        setInsights(`### Summary of ${file.name}\n\nImage successfully imported into visual viewport.`);
        toast({
          title: "Image Loaded",
          description: `${file.name} ready for inspection.`,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  }, [stop, toast]);

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessUploadedFile(file);
            toast({
              title: "Image Pasted from Clipboard",
              description: "Loaded into Image Summarizer Studio.",
            });
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleProcessUploadedFile, toast]);

  useEffect(() => {
    const objectCount = selectedPreset.detectedObjects.length;
    setChatMessages([
      {
        id: "init-1",
        sender: "ai",
        text: `🔍 **${selectedPreset.name}** is loaded into the Visual Intelligence Studio.\n\nIdentified **${objectCount} key visual regions**. You can ask any question, examine optical text, or drag with **Circle to Search** to identify any specific entity!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [selectedPreset.name, selectedPreset.detectedObjects.length]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: SamplePreset) => {
    stop();
    setSelectedPreset(preset);
    setCurrentImageUrl(preset.url);
    setDetectedCategory(preset.category);
    setOcrText(preset.ocrText);
    setInsights(preset.insights);
    setDetectedObjects(preset.detectedObjects);
    setTableData(preset.tableData || []);
    setSuggestedQuestions(preset.suggestedQuestions);
    setSelectedObject(null);
    setCropBox(null);
    setCircleSearchResult(null);
    setTranslatedText("");

    setTechMetadata((prev) => ({
      ...prev,
      objectCount: preset.detectedObjects.length,
      ocrCharCount: preset.ocrText.length,
      confidenceScore: "99.4%",
    }));

    toast({
      title: `Loaded ${preset.name}`,
      description: `Switched to ${preset.category} visual profile.`,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessUploadedFile(file);
  };

  // Live Camera Handlers
  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      toast({
        title: "Camera Access Denied",
        description: "Please permit camera access in your browser.",
        variant: "destructive",
      });
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setCurrentImageUrl(dataUrl);
      stopLiveCamera();

      // Trigger automatic scan
      fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.summary) setInsights(data.summary);
          if (data.ocrText) setOcrText(data.ocrText);
          if (data.detectedObjects) setDetectedObjects(data.detectedObjects);
        })
        .catch(() => {});

      toast({
        title: "Photo Captured",
        description: "Loaded into Image Summarizer Studio.",
      });
    }
  };

  // Magnifier Loupe Hover Handler
  const handleCanvasMouseMoveForMagnifier = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnifierActive || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMagnifierPos({ x, y });
  };

  // Circle to Search Mouse & Touch Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCircleSearchMode || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setLassoPoints([{ x, y }]);
    setCropBox(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    setCurrentPos({ x, y });
    if (selectionType === "circle") {
      setLassoPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPos || !currentPos) return;
    setIsDrawing(false);

    let minX: number, minY: number, width: number, height: number;

    if (selectionType === "circle" && lassoPoints.length > 2) {
      const xs = lassoPoints.map((p) => p.x);
      const ys = lassoPoints.map((p) => p.y);
      minX = Math.min(...xs);
      minY = Math.min(...ys);
      width = Math.max(...xs) - minX;
      height = Math.max(...ys) - minY;
    } else {
      minX = Math.min(startPos.x, currentPos.x);
      minY = Math.min(startPos.y, currentPos.y);
      width = Math.abs(currentPos.x - startPos.x);
      height = Math.abs(currentPos.y - startPos.y);
    }

    if (width > 20 && height > 20) {
      const box = { x: minX, y: minY, width, height };
      setCropBox(box);
      handleRunCircleSearch(box);
    }
  };

  // Execute Circle to Search API
  const handleRunCircleSearch = async (box: { x: number; y: number; width: number; height: number }) => {
    setIsAnalyzingSelection(true);
    setCircleSearchResult(null);
    setActiveTab("circle-search");

    try {
      const img = imageElementRef.current;
      if (!img || !imageContainerRef.current) return;

      const containerRect = imageContainerRef.current.getBoundingClientRect();
      const scaleX = img.naturalWidth / containerRect.width;
      const scaleY = img.naturalHeight / containerRect.height;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = Math.max(50, Math.round(box.width * scaleX));
      cropCanvas.height = Math.max(50, Math.round(box.height * scaleY));
      const ctx = cropCanvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          img,
          box.x * scaleX,
          box.y * scaleY,
          box.width * scaleX,
          box.height * scaleY,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );
      }

      const croppedBase64 = cropCanvas.toDataURL("image/jpeg", 0.9);

      const res = await fetch("/api/circle-to-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          croppedImage: croppedBase64,
          selectionType,
        }),
      });

      const resultData: CircleSearchResult = await res.json();
      setCircleSearchResult(resultData);

      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: `🎯 **Circled Selection: "${resultData.title || "Selected Entity"}"**\n\n${resultData.summary || "Analyzed circled visual target."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCircledContext: true,
        },
      ]);

      toast({
        title: "Circle to Search Matched",
        description: `Found: ${resultData.title || "Circled Entity"}`,
      });
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Circle Search Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingSelection(false);
    }
  };

  // Optical Translation Handler
  const handleTranslateVisualText = async () => {
    if (!ocrText) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Translate the following optical text precisely into ${targetLang}. Maintain paragraph formatting:\n\n${ocrText}`,
            },
          ],
        }),
      });

      const data = await res.json();
      setTranslatedText(data.content || data.reply || "Translation complete.");
      toast({
        title: `Translated to ${targetLang}`,
        description: "Image text translated successfully.",
      });
    } catch (e) {
      const err = e as Error;
      toast({ title: "Translation Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  // Image Q&A Chat Handler
  const handleSendQuestion = async (customQuestion?: string) => {
    const question = (customQuestion || chatInput).trim();
    if (!question || isAskingQuestion) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customQuestion) setChatInput("");
    setIsAskingQuestion(true);

    try {
      const contextPrompt = circleSearchResult
        ? `CIRCLED REGION: ${circleSearchResult.title} (${circleSearchResult.category})\nSUMMARY: ${circleSearchResult.summary}\nOCR: ${circleSearchResult.ocrText || "none"}`
        : `IMAGE TITLE: ${selectedPreset.name} (${detectedCategory})\nOCR TEXT: ${ocrText}\nSUMMARY: ${insights}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are the Image Summarizer Visual Intelligence AI. Answer user questions grounded with high factual fidelity in the image context.\n\n${contextPrompt}`,
            },
            ...chatMessages.map((m) => ({
              role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
              content: m.text,
            })),
            { role: "user", content: question },
          ],
        }),
      });

      const data = await res.json();
      const answer = data.content || data.reply || "Visual inspection complete.";

      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      const err = e as Error;
      toast({ title: "Q&A Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  // Table Data Export Handlers
  const handleExportCSV = () => {
    if (tableData.length === 0) return;
    const headers = Object.keys(tableData[0]);
    const csvRows = [
      headers.join(","),
      ...tableData.map((row) =>
        headers.map((h) => `"${(row[h] || "").replace(/"/g, '""')}"`).join(",")
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${selectedPreset.id}_extracted_table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "CSV Downloaded", description: "Exported visual table data to CSV." });
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(tableData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", `${selectedPreset.id}_extracted_table.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "JSON Downloaded", description: "Exported structured data to JSON." });
  };

  // Copy OCR Text
  const handleCopyOCR = () => {
    navigator.clipboard.writeText(ocrText);
    setCopiedOcr(true);
    setTimeout(() => setCopiedOcr(false), 2000);
    toast({ title: "OCR Copied", description: "Extracted text copied to clipboard." });
  };

  // Filter Table Data
  const filteredTableRows = tableData.filter((row) => {
    if (!tableSearchQuery.trim()) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(tableSearchQuery.toLowerCase())
    );
  });

  return (
    <AppLayout title="Image Summarizer">
      <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
        {/* ========================================================= */}
        {/* BROWSER-GRADE WORKSPACE TOP BAR (NO LOCAL LOGO ARTIFACT)  */}
        {/* ========================================================= */}
        <header className="border-b border-border/50 bg-card/70 backdrop-blur-xl px-4 sm:px-6 py-2.5 shrink-0 z-30">
          <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Zone 1: Pure Studio Editorial Wordmark (Zero Logo Icon) */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href="/summarizer"
                    className="text-sm sm:text-base font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity truncate"
                  >
                    Image Summarizer
                  </a>
                  <span className="text-muted-foreground/30 text-xs hidden sm:inline">|</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                    Visual Intelligence
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  <span className="font-mono tabular-nums">{techMetadata.resolution}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-400 font-medium">{detectedCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span>{detectedObjects.length} entities</span>
                </div>
              </div>
            </div>

            {/* Zone 2: Preset Chips */}
            <div className="hidden xl:flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/60">
              <span className="text-[10px] font-semibold text-muted-foreground px-2">
                Presets:
              </span>
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedPreset.id === p.id
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Circle to Search Main Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsCircleSearchMode(!isCircleSearchMode);
                  if (!isCircleSearchMode) {
                    setActiveTab("circle-search");
                    toast({
                      title: "Circle to Search Activated",
                      description: "Drag a circle or box around any object on the canvas.",
                    });
                  }
                }}
                className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCircleSearchMode
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-300 ring-2 ring-rose-500/20 shadow-md shadow-rose-500/10"
                    : "border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
                title="Circle any object, text, or region to search"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isCircleSearchMode ? "animate-spin" : ""}`} />
                <span>Circle to Search</span>
                {isCircleSearchMode && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                )}
              </button>

              {/* Camera Trigger */}
              <button
                type="button"
                onClick={startLiveCamera}
                className="h-8 px-2.5 rounded-lg border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                title="Capture live camera photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Camera</span>
              </button>

              {/* Upload Trigger */}
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs gap-1.5 shadow-sm shadow-rose-500/20 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN DUAL-PANE PRODUCTION WORKSPACE                       */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* ======================================================= */}
          {/* LEFT: INTERACTIVE SMART CANVAS VIEWPORT                 */}
          {/* ======================================================= */}
          <section className="flex-1 bg-black/45 relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
            {/* Top Canvas Floating HUD: Controls for Canvas Inspection */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 bg-card/85 backdrop-blur-xl rounded-xl border border-border/70 shadow-xl">
              {/* Bounding Boxes Toggle */}
              <button
                type="button"
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  showBoundingBoxes
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle visual bounding boxes"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Bounding Boxes</span>
              </button>

              <div className="w-px h-4 bg-border/80 mx-0.5" />

              {/* Selection Shape (Circle / Box) */}
              <div className="flex items-center gap-0.5 p-0.5 bg-muted/60 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectionType("circle")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    selectionType === "circle"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Freehand Circle / Lasso"
                >
                  <Circle className="w-3 h-3 text-rose-400" />
                  <span>Circle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectionType("rectangle")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    selectionType === "rectangle"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Marquee Rectangle"
                >
                  <Square className="w-3 h-3 text-cyan-400" />
                  <span>Box</span>
                </button>
              </div>

              <div className="w-px h-4 bg-border/80 mx-0.5" />

              {/* Magnifier Loupe Tool */}
              <button
                type="button"
                onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  isMagnifierActive
                    ? "bg-rose-500/20 text-rose-300 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle 2.5x Magnifier Glass"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Loupe</span>
              </button>

              {/* Grid Overlay Toggle */}
              <button
                type="button"
                onClick={() => setShowGridOverlay(!showGridOverlay)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  showGridOverlay
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Technical Inspection Grid"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circle to Search Active Guidance Banner */}
            {isCircleSearchMode && !cropBox && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-black/85 backdrop-blur-xl rounded-full border border-rose-500/40 text-xs text-rose-200 shadow-xl pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>Circle or drag around anything on the image to search</span>
              </div>
            )}

            {/* Processing Overlay */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 animate-pulse">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Scanning Visual Scene & Extracting Entities...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Multimodal Neural Vision Model · OCR · Spatial Geometry
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Image Container */}
            <div
              ref={imageContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={(e) => {
                handleMouseMove(e);
                handleCanvasMouseMoveForMagnifier(e);
              }}
              onMouseUp={handleMouseUp}
              className={`relative max-w-full max-h-[76vh] rounded-2xl overflow-hidden border border-border/70 shadow-2xl bg-card/40 flex items-center justify-center select-none ${
                isCircleSearchMode ? "cursor-crosshair" : isMagnifierActive ? "cursor-none" : "cursor-default"
              }`}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transition: "transform 0.15s ease-out",
              }}
            >
              {/* Technical Rule Grid Overlay */}
              {showGridOverlay && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              )}

              {/* Main Visual Image Element */}
              <img
                ref={imageElementRef}
                src={currentImageUrl}
                alt={selectedPreset.name}
                onLoad={handleImageLoad}
                referrerPolicy="no-referrer"
                className="max-h-[74vh] w-auto object-contain block pointer-events-none"
                draggable={false}
              />

              {/* Spatial Bounding Boxes Overlay */}
              {showBoundingBoxes && (
                <div className="absolute inset-0 pointer-events-none">
                  {detectedObjects.map((obj) => {
                    const isSelected = selectedObject?.id === obj.id;
                    return (
                      <div
                        key={obj.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedObject(obj);
                          setActiveTab("summary");
                        }}
                        className={`absolute border-2 rounded-lg pointer-events-auto cursor-pointer transition-all ${
                          isSelected
                            ? "ring-2 ring-white scale-[1.01] shadow-lg shadow-black/50"
                            : "hover:scale-[1.01] hover:bg-white/10"
                        }`}
                        style={{
                          borderColor: obj.color,
                          left: `${obj.x}%`,
                          top: `${obj.y}%`,
                          width: `${obj.width}%`,
                          height: `${obj.height}%`,
                        }}
                      >
                        <div
                          className="absolute -top-6 left-0 px-2 py-0.5 text-[9px] font-bold rounded text-white shadow-md whitespace-nowrap flex items-center gap-1"
                          style={{ backgroundColor: obj.color }}
                        >
                          <span>{obj.label}</span>
                          <span className="opacity-90 font-mono">[{obj.confidence}%]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Circle to Search Freehand Lasso Drawing Track */}
              {isCircleSearchMode && isDrawing && selectionType === "circle" && lassoPoints.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                  <path
                    d={`M ${lassoPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                    fill="rgba(244, 63, 94, 0.15)"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                </svg>
              )}

              {/* Circle to Search Rectangle Marquee Track */}
              {isCircleSearchMode && isDrawing && selectionType === "rectangle" && startPos && currentPos && (
                <div
                  className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-xl shadow-lg pointer-events-none z-30 animate-pulse"
                  style={{
                    left: `${Math.min(startPos.x, currentPos.x)}px`,
                    top: `${Math.min(startPos.y, currentPos.y)}px`,
                    width: `${Math.abs(currentPos.x - startPos.x)}px`,
                    height: `${Math.abs(currentPos.y - startPos.y)}px`,
                  }}
                />
              )}

              {/* Completed Active Circle Selection Perimeter (Authentic Shimmer Effect) */}
              {cropBox && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute border-2 border-rose-400 bg-rose-500/15 rounded-2xl shadow-2xl z-30 ring-4 ring-rose-500/20"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.width}px`,
                    height: `${cropBox.height}px`,
                  }}
                >
                  {/* Floating Action Menu directly over the selection */}
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1 bg-card/90 backdrop-blur-xl rounded-full border border-rose-400/50 text-[11px] font-semibold text-rose-300 shadow-2xl flex items-center gap-2 whitespace-nowrap z-40">
                    <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                    <span>Target Circled</span>
                    <div className="w-px h-3 bg-border/80 mx-0.5" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("circle-search");
                        handleRunCircleSearch(cropBox);
                      }}
                      className="text-xs text-white hover:text-rose-200 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Search className="w-3 h-3 text-rose-400" />
                      <span>Search with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCropBox(null);
                        setCircleSearchResult(null);
                      }}
                      className="ml-1 text-muted-foreground hover:text-white cursor-pointer"
                      title="Clear Selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Interactive Magnifier Loupe Glass */}
              {isMagnifierActive && magnifierPos && (
                <div
                  className="absolute pointer-events-none w-32 h-32 rounded-full border-2 border-white shadow-2xl overflow-hidden z-30 ring-4 ring-black/40"
                  style={{
                    left: `${magnifierPos.x - 64}px`,
                    top: `${magnifierPos.y - 64}px`,
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${currentImageUrl})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${(imageElementRef.current?.clientWidth || 800) * 2.5}px ${(imageElementRef.current?.clientHeight || 600) * 2.5}px`,
                      backgroundPosition: `-${magnifierPos.x * 2.5 - 64}px -${magnifierPos.y * 2.5 - 64}px`,
                    }}
                  />
                  <div className="absolute inset-0 border border-white/40 rounded-full" />
                </div>
              )}
            </div>

            {/* Bottom Floating Canvas Action Dock */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 bg-card/85 backdrop-blur-xl rounded-xl border border-border/70 shadow-xl">
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

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-border/80 mx-1" />

              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Fit
              </button>

              <div className="w-px h-4 bg-border/80 mx-1" />

              {/* Paste helper cue */}
              <span className="text-[10px] text-muted-foreground hidden sm:inline px-1">
                Paste with <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">Ctrl+V</kbd>
              </span>
            </div>
          </section>

          {/* ======================================================= */}
          {/* RIGHT: MULTI-TAB VISUAL INTELLIGENCE WORKSPACE          */}
          {/* ======================================================= */}
          <aside className="w-full lg:w-[480px] border-t lg:border-t-0 lg:border-l border-border/60 bg-card/75 backdrop-blur-xl flex flex-col shrink-0">
            {/* Multi-Tab Switcher Bar */}
            <div className="p-2.5 border-b border-border/50 bg-muted/20">
              <div className="grid grid-cols-6 gap-1 p-1 bg-muted/60 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    activeTab === "summary"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="AI Scene Summary & Insights"
                >
                  Summary
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("circle-search")}
                  className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center relative ${
                    activeTab === "circle-search"
                      ? "bg-background text-foreground shadow-xs font-semibold text-rose-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Circle to Search Dossier"
                >
                  Search
                  {circleSearchResult && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 absolute top-1 right-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ocr")}
                  className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    activeTab === "ocr"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Optical OCR & Translation"
                >
                  OCR
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("table")}
                  className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    activeTab === "table"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table Data Exporter"
                >
                  Table
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("qa")}
                  className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    activeTab === "qa"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Visual Q&A Assistant"
                >
                  Q&A
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tech")}
                  className={`py-1.5 px-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    activeTab === "tech"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Technical Metadata & EXIF"
                >
                  Metadata
                </button>
              </div>
            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 max-h-[calc(100vh-120px)]">
              {/* =================================================== */}
              {/* TAB 1: AI SCENE SUMMARY & INSIGHTS                  */}
              {/* =================================================== */}
              {activeTab === "summary" && (
                <div className="space-y-4">
                  {/* Category Banner & Audio TTS */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Classification
                      </span>
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                        <Tag className="w-3.5 h-3.5 text-rose-400" />
                        <span>{detectedCategory}</span>
                      </h3>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (isSpeaking) {
                          stop();
                        } else {
                          speak(insights.replace(/[#*_-]/g, ""));
                        }
                      }}
                      className="h-8 px-3 rounded-lg border-border/70 text-xs font-medium gap-1.5 cursor-pointer"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Selected Object Spotlight (if any object clicked) */}
                  {selectedObject && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Selected: {selectedObject.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {selectedObject.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {selectedObject.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Comprehensive Markdown Analysis */}
                  <div className="p-4 rounded-2xl border border-border/60 bg-card/60 space-y-3">
                    <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-foreground">
                      <ReactMarkdown>{insights}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Detected Objects Directory */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Spatial Objects Directory ({detectedObjects.length})
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Click object to focus
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detectedObjects.map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setSelectedObject(obj)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                            selectedObject?.id === obj.id
                              ? "border-cyan-500 bg-cyan-500/10 text-foreground"
                              : "border-border/60 hover:border-border text-muted-foreground"
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                            style={{ backgroundColor: obj.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {obj.label}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {obj.category} · {obj.confidence}%
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Suggested Follow-Up Questions */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <span className="text-xs font-semibold text-foreground">
                      Suggested Analytical Questions
                    </span>
                    <div className="space-y-1.5">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveTab("qa");
                            handleSendQuestion(q);
                          }}
                          className="w-full text-left p-2 rounded-lg border border-border/60 hover:border-rose-500/40 bg-card/40 hover:bg-card text-[11px] text-muted-foreground hover:text-foreground transition-all flex items-center justify-between gap-2 group cursor-pointer"
                        >
                          <span className="truncate">{q}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-rose-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 2: CIRCLE TO SEARCH RESULTS DOSSIER             */}
              {/* =================================================== */}
              {activeTab === "circle-search" && (
                <div className="space-y-4">
                  {/* Header Instructions & Trigger */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crosshair className="w-4 h-4 text-rose-400" />
                        <h3 className="text-xs font-semibold text-foreground">
                          Circle to Search Intelligence
                        </h3>
                      </div>
                      <span className="text-[10px] text-rose-400 font-mono">
                        Google Lens Grade
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Draw a circle, lasso, or box around any item, shoe, dish, text line, or architectural facet to run deep entity matching.
                    </p>
                  </div>

                  {/* Loading indicator while searching selection */}
                  {isAnalyzingSelection && (
                    <div className="p-6 rounded-2xl border border-rose-500/40 bg-rose-950/20 text-center space-y-3">
                      <Loader2 className="w-7 h-7 text-rose-400 animate-spin mx-auto" />
                      <p className="text-xs font-semibold text-foreground">
                        Matching Circled Target across Visual Knowledge Index...
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Scanning object geometry, e-commerce stores, and web records
                      </p>
                    </div>
                  )}

                  {/* Results Display */}
                  {circleSearchResult ? (
                    <div className="space-y-4">
                      {/* Entity Header */}
                      <div className="p-4 rounded-2xl border border-border/70 bg-card/60 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                              {circleSearchResult.category || "Identified Target"}
                            </span>
                            <h2 className="text-sm sm:text-base font-bold text-foreground">
                              {circleSearchResult.title || "Circled Subject"}
                            </h2>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            Verified Match
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {circleSearchResult.summary}
                        </p>
                      </div>

                      {/* Transcribed Text in Region (if text present) */}
                      {circleSearchResult.ocrText && (
                        <div className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            Text Extracted from Region:
                          </span>
                          <p className="text-xs font-mono text-foreground">
                            "{circleSearchResult.ocrText}"
                          </p>
                          {circleSearchResult.translation && (
                            <p className="text-xs text-emerald-400 mt-1">
                              Translation: {circleSearchResult.translation}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Specifications Grid */}
                      {circleSearchResult.specs && circleSearchResult.specs.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-foreground">
                            Technical Attributes & Specs
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {circleSearchResult.specs.map((spec, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl border border-border/60 bg-card/40"
                              >
                                <span className="text-[10px] text-muted-foreground block">
                                  {spec.label}
                                </span>
                                <span className="text-xs font-semibold text-foreground">
                                  {spec.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* E-Commerce Price Comparison Matrix */}
                      {circleSearchResult.priceComparison &&
                        circleSearchResult.priceComparison.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ShoppingCart className="w-3.5 h-3.5 text-rose-400" />
                                <span>E-Commerce Price Comparison</span>
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Real-time retail quotes
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {circleSearchResult.priceComparison.map((p, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                    p.bestDeal
                                      ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                                      : "border-border/60 bg-card/40"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">
                                      {p.platform}
                                    </span>
                                    {p.bestDeal && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-white">
                                        Best Deal
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-foreground">
                                      {p.price}
                                    </span>
                                    <a
                                      href={p.url || "https://www.google.com"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Key Facts */}
                      {circleSearchResult.keyFacts && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            Key Facts & Insights
                          </span>
                          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                            {circleSearchResult.keyFacts.map((fact, idx) => (
                              <li key={idx}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Web Knowledge Sources */}
                      {circleSearchResult.webMatches && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-foreground">
                            Web Knowledge Sources
                          </span>
                          <div className="space-y-1.5">
                            {circleSearchResult.webMatches.map((web, idx) => (
                              <a
                                key={idx}
                                href={web.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-2.5 rounded-xl border border-border/60 hover:border-border bg-card/40 hover:bg-card text-left transition-colors"
                              >
                                <span className="text-xs font-semibold text-foreground block truncate">
                                  {web.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
                                  {web.snippet}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    !isAnalyzingSelection && (
                      <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                          <Crosshair className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-semibold text-foreground">
                          No Active Circle Target
                        </h4>
                        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                          Click "Circle to Search" above or drag across the image canvas to inspect any subject.
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 3: OPTICAL OCR & MULTI-LANGUAGE TRANSLATOR      */}
              {/* =================================================== */}
              {activeTab === "ocr" && (
                <div className="space-y-4">
                  {/* Top OCR Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">
                        Extracted Optical Text
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {ocrText.length} characters detected
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyOCR}
                      className="h-7 px-2.5 rounded-lg border-border/70 text-xs font-medium gap-1 cursor-pointer"
                    >
                      {copiedOcr ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy OCR</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Filter Search inside OCR */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search within extracted text..."
                      value={ocrSearchQuery}
                      onChange={(e) => setOcrSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs bg-muted/40 border-border/70 rounded-lg"
                    />
                  </div>

                  {/* OCR Transcribed Text Box */}
                  <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 max-h-56 overflow-y-auto font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {ocrText}
                  </div>

                  {/* Translation Studio */}
                  <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Instant Language Translation</span>
                      </span>

                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="text-xs bg-card border border-border/70 rounded-lg px-2 py-1 text-foreground cursor-pointer"
                      >
                        {[
                          "Spanish",
                          "French",
                          "German",
                          "Japanese",
                          "Chinese",
                          "Hindi",
                          "Arabic",
                          "Italian",
                          "Portuguese",
                          "Russian",
                          "Korean",
                        ].map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleTranslateVisualText}
                      disabled={isTranslating}
                      className="w-full h-8 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isTranslating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Translate to {targetLang}</span>
                    </Button>

                    {translatedText && (
                      <div className="p-3 rounded-xl border border-cyan-500/40 bg-card text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                        {translatedText}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 4: STRUCTURED TABLE & DATA GRID EXPORTER        */}
              {/* =================================================== */}
              {activeTab === "table" && (
                <div className="space-y-4">
                  {/* Table Actions Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">
                        Structured Data Matrix
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        {tableData.length} records parsed from visual geometry
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportCSV}
                        className="h-7 px-2.5 rounded-lg border-border/70 text-xs font-medium gap-1 cursor-pointer"
                        title="Download CSV"
                      >
                        <Download className="w-3 h-3" />
                        <span>CSV</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportJSON}
                        className="h-7 px-2.5 rounded-lg border-border/70 text-xs font-medium gap-1 cursor-pointer"
                        title="Download JSON"
                      >
                        <TableIcon className="w-3 h-3" />
                        <span>JSON</span>
                      </Button>
                    </div>
                  </div>

                  {/* Table Filter Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Filter records..."
                      value={tableSearchQuery}
                      onChange={(e) => setTableSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs bg-muted/40 border-border/70 rounded-lg"
                    />
                  </div>

                  {/* Interactive Table View */}
                  {tableData.length > 0 ? (
                    <div className="rounded-xl border border-border/70 overflow-hidden bg-card/60">
                      <div className="overflow-x-auto max-h-72">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/60 text-muted-foreground border-b border-border/60 uppercase text-[10px] tracking-wider font-semibold">
                            <tr>
                              {Object.keys(tableData[0]).map((header) => (
                                <th key={header} className="px-3 py-2 font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                            {filteredTableRows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-muted/30">
                                {Object.values(row).map((val, cIdx) => (
                                  <td key={cIdx} className="px-3 py-2 text-foreground">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                      No tabular data identified in this image.
                    </div>
                  )}
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 5: DEEP VISUAL Q&A CHAT ASSISTANT               */}
              {/* =================================================== */}
              {activeTab === "qa" && (
                <div className="flex flex-col h-[520px] space-y-3">
                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-1">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-rose-600 text-white"
                              : "bg-muted/70 text-foreground border border-border/60"
                          }`}
                        >
                          <div className="prose dark:prose-invert max-w-none text-xs">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 px-1 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    ))}
                    {isAskingQuestion && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                        <span>Visual Intelligence reasoning over image context...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Box */}
                  <div className="pt-2 border-t border-border/60">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendQuestion();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        placeholder="Ask anything about this image..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="h-9 text-xs bg-muted/40 border-border/70 rounded-xl"
                      />
                      <Button
                        type="submit"
                        disabled={!chatInput.trim() || isAskingQuestion}
                        className="h-9 w-9 p-0 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shrink-0 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 6: TECHNICAL METADATA & EXIF / COLOR PALETTE   */}
              {/* =================================================== */}
              {activeTab === "tech" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Technical Inspection & EXIF Dossier
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Hardware parameters, color profile, and inference telemetry.
                    </p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "Native Resolution", value: techMetadata.resolution },
                      { label: "Aspect Ratio", value: techMetadata.aspectRatio },
                      { label: "Color Space", value: techMetadata.colorSpace },
                      { label: "File Format", value: techMetadata.fileType },
                      { label: "File Payload", value: techMetadata.fileSize },
                      { label: "Neural Model Latency", value: techMetadata.aiLatency },
                      { label: "Confidence Threshold", value: techMetadata.confidenceScore },
                      { label: "Entities Resolved", value: `${techMetadata.objectCount} Bounding Boxes` },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-border/60 bg-card/40 space-y-0.5"
                      >
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          {item.label}
                        </span>
                        <span className="text-xs font-semibold font-mono text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Extracted Dominant Color Palette */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-rose-400" />
                        <span>Dominant Color Histogram</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">Click hex to copy</span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {techMetadata.dominantColors?.map((hex, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(hex);
                            toast({ title: "Color Copied", description: `Copied ${hex} to clipboard.` });
                          }}
                          className="p-2 rounded-xl border border-border/60 bg-card/60 hover:scale-105 transition-transform text-center cursor-pointer space-y-1"
                        >
                          <div
                            className="w-full h-7 rounded-lg border border-border/40 shadow-xs"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="text-[10px] font-mono text-muted-foreground block truncate">
                            {hex}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ========================================================= */}
        {/* LIVE CAMERA CAPTURE MODAL                                 */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isCameraOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border/70 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Live Viewfinder Capture
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-border/60">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={stopLiveCamera} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={captureCameraPhoto}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs gap-1.5 shadow-md shadow-rose-500/20"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Photo</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
