import {
  BookMarked,
  BookOpen,
  Code2,
  FileText,
  Globe,
  GraduationCap,
  Image,
  Languages,
  Newspaper,
  Presentation,
  Search,
  Sparkles,
  Trophy,
  CloudSun,
  MessageSquare,
} from "lucide-react";

export const featureItems = [
  { icon: MessageSquare, label: "AI Chat", href: "/chat" },
  { icon: Search, label: "Web Search", href: "/web-search" },
  { icon: FileText, label: "Document Studio", href: "/document-studio" },
  { icon: Image, label: "Image Generator", href: "/image-generator" },
  { icon: Sparkles, label: "Image Enhancer", href: "/image-enhancer" },
  { icon: FileText, label: "Image Summarizer", href: "/image-summarizer" },
  { icon: Newspaper, label: "News Engine", href: "/news-engine" },
  { icon: Trophy, label: "Sports Hub", href: "/sports-hub" },
  { icon: CloudSun, label: "Weather Station", href: "/weather-station" },
  { icon: GraduationCap, label: "Homework Assistant", href: "/homework-assistant" },
  { icon: BookMarked, label: "NCERT Tutor", href: "/ncert-tutor" },
  { icon: Code2, label: "Code Studio", href: "/code-studio" },
  { icon: Languages, label: "Translate", href: "/translate" },
  { icon: BookOpen, label: "Learning Hub", href: "/learning-hub" },
  { icon: Presentation, label: "Presentation Studio", href: "/presentation-studio" },
] as const;

export type FeatureItem = (typeof featureItems)[number];