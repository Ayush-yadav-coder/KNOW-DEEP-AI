import React from "react";
import {
  MessageSquare,
  Globe,
  FileText,
  Image,
  Sparkles,
  FileSearch,
  Newspaper,
  Trophy,
  CloudSun,
  GraduationCap,
  BookOpen,
  Terminal,
  Languages,
  BookMarked,
  Presentation,
} from "lucide-react";

export interface FeatureDirectoryItem {
  id: string;
  name: string;
  shortLabel: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

export const PLATFORM_15_FEATURES: FeatureDirectoryItem[] = [
  // Page 1: Features 1 – 5
  { id: "chat", name: "1. AI Chat", shortLabel: "AI Chat", href: "/chat", icon: MessageSquare, color: "from-cyan-500 to-blue-500" },
  { id: "web-search", name: "2. Web Search Engine", shortLabel: "Search", href: "/web-search", icon: Globe, color: "from-sky-500 to-indigo-500" },
  { id: "document-studio", name: "3. Document Studio", shortLabel: "Docs", href: "/document-studio", icon: FileText, color: "from-emerald-500 to-teal-500" },
  { id: "image-generator", name: "4. Image Generator", shortLabel: "Generate", href: "/image-generator", icon: Image, color: "from-purple-500 to-pink-500" },
  { id: "image-enhancer", name: "5. Image Enhancer", shortLabel: "Enhance", href: "/image-enhancer", icon: Sparkles, color: "from-amber-500 to-orange-500" },

  // Page 2: Features 6 – 10
  { id: "image-summarizer", name: "6. Image Summarizer", shortLabel: "Summarize", href: "/summarizer", icon: FileSearch, color: "from-rose-500 to-pink-500" },
  { id: "news", name: "7. News Engine", shortLabel: "News", href: "/news", icon: Newspaper, color: "from-red-500 to-rose-600" },
  { id: "sports", name: "8. Sports Hub", shortLabel: "Sports", href: "/sports", icon: Trophy, color: "from-blue-600 to-cyan-600" },
  { id: "weather", name: "9. Weather Station", shortLabel: "Weather", href: "/weather", icon: CloudSun, color: "from-amber-400 to-yellow-600" },
  { id: "homework", name: "10. Homework Assistant", shortLabel: "Homework", href: "/homework-assistant", icon: GraduationCap, color: "from-indigo-500 to-violet-600" },

  // Page 3: Features 11 – 15
  { id: "ncert", name: "11. NCERT Tutor", shortLabel: "NCERT", href: "/ncert-tutor", icon: BookOpen, color: "from-teal-500 to-emerald-600" },
  { id: "code", name: "12. Code Studio", shortLabel: "Code", href: "/code-studio", icon: Terminal, color: "from-emerald-400 to-cyan-500" },
  { id: "translate", name: "13. Translate Studio", shortLabel: "Translate", href: "/translate-studio", icon: Languages, color: "from-blue-500 to-teal-500" },
  { id: "learning-hub", name: "14. Learning Hub", shortLabel: "Learn", href: "/learning-hub", icon: BookMarked, color: "from-violet-500 to-purple-600" },
  { id: "presentation", name: "15. Presentation Studio", shortLabel: "Slides", href: "/presentation-studio", icon: Presentation, color: "from-orange-500 to-pink-500" },
];

export function getOrderedFeatures(customOrderIds?: string[]): FeatureDirectoryItem[] {
  if (!customOrderIds || !Array.isArray(customOrderIds) || customOrderIds.length === 0) {
    return PLATFORM_15_FEATURES;
  }
  const featureMap = new Map<string, FeatureDirectoryItem>(
    PLATFORM_15_FEATURES.map((f) => [f.id, f])
  );

  const ordered: FeatureDirectoryItem[] = [];
  customOrderIds.forEach((id) => {
    const item = featureMap.get(id);
    if (item) {
      ordered.push(item);
      featureMap.delete(id);
    }
  });

  // Append any features not in custom order
  featureMap.forEach((item) => {
    ordered.push(item);
  });

  return ordered;
}

