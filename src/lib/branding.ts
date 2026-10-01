export const KNOWDEEP_LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

export const KNOWDEEP_BRAND_NAME = "KnowDeep AI";

export interface KnowDeepStudioInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  badge: string;
  route: string;
  color: string;
  iconName: string;
}

export const KNOWDEEP_STUDIOS: Record<string, KnowDeepStudioInfo> = {
  slideArchitect: {
    id: "presentation-studio",
    name: "KnowDeep Slide Architect",
    shortName: "Slide Architect",
    description: "Intelligent presentation engine with 106+ profession backgrounds, AI layout formatting, and PPTX/PDF export.",
    badge: "Official Studio AI",
    route: "/presentation-studio",
    color: "from-fuchsia-500 to-pink-500",
    iconName: "Presentation",
  },
  director: {
    id: "video-studio",
    name: "KnowDeep Director",
    shortName: "Director AI",
    description: "Autonomous video production suite with camera paths, storyboard timeline, and background music sync.",
    badge: "Official Studio AI",
    route: "/video-studio",
    color: "from-red-500 to-rose-600",
    iconName: "Video",
  },
  codeStudio: {
    id: "code-studio",
    name: "KnowDeep Code Studio",
    shortName: "Code Architect",
    description: "Autonomous full-stack application creator, live sandboxing, debugger, and code intelligence.",
    badge: "Official Studio AI",
    route: "/code-studio",
    color: "from-cyan-500 to-blue-600",
    iconName: "Code2",
  },
  documentArchitect: {
    id: "document-studio",
    name: "KnowDeep Document Architect",
    shortName: "Doc Architect",
    description: "Deep document synthesis, multi-format analysis, essay architect, and real-time document drafting.",
    badge: "Official Studio AI",
    route: "/document-studio",
    color: "from-emerald-500 to-teal-600",
    iconName: "FileText",
  },
  vision: {
    id: "image-generator",
    name: "KnowDeep Vision",
    shortName: "Vision Studio",
    description: "Photorealistic image generation, artistic styling, prompt expansion, and 4K upscaling.",
    badge: "Official Studio AI",
    route: "/image-generator",
    color: "from-purple-500 to-indigo-600",
    iconName: "ImageIcon",
  },
  myStuff: {
    id: "my-stuff",
    name: "My Stuff",
    shortName: "My Stuff",
    description: "Dedicated personal multi-media vault for all your generated apps, videos, images, and slide presentations.",
    badge: "Creative Vault",
    route: "/my-stuff",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    iconName: "FolderOpen",
  },
};
