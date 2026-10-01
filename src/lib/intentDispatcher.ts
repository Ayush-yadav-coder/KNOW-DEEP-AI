export type DetectedIntentType =
  | "image_generation"
  | "image_enhancer"
  | "video_generation"
  | "presentation_generation"
  | "code_studio"
  | "document_studio"
  | "homework_assistant"
  | "translator"
  | "summarizer"
  | "concept_xray"
  | "code_interpreter"
  | "ncert_tutor"
  | "weather_dual"
  | "news_dual"
  | "sports_dual"
  | "general_chat";

export interface IntentMatchResult {
  intent: DetectedIntentType;
  confidence: number;
  extractedQuery: string;
  targetRoute: string;
  studioName: string;
  category: "creative" | "information_dual" | "general";
  headline: string;
  description: string;
  badgeLabel: string;
  badgeColor: string;
  iconName: string;
  supportsDualOption: boolean;
}

export function detectUserIntent(rawInput: string): IntentMatchResult {
  const query = rawInput.trim();
  const lower = query.toLowerCase();

  // 1. IMAGE ENHANCER DETECTION
  const enhancerKeywords = [
    "enhance image",
    "enhance photo",
    "enhance this image",
    "upscale image",
    "upscale photo",
    "image enhancer",
    "photo enhancer",
    "improve image quality",
    "make image clearer",
    "denoise image",
    "hd image",
    "fix image quality",
    "restore photo",
    "unblur photo",
    "clarify image",
  ];
  if (enhancerKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "image_enhancer",
      confidence: 0.95,
      extractedQuery: query,
      targetRoute: `/image-enhancer?prompt=${encodeURIComponent(query)}`,
      studioName: "KnowDeep Image Enhancer",
      category: "creative",
      headline: "AI Image Enhancer",
      description: "Direct to 4K/8K Upscaler, noise removal, face clarity, and detail restoration engine.",
      badgeLabel: "Enhancer",
      badgeColor: "from-indigo-500 to-purple-600",
      iconName: "Wand2",
      supportsDualOption: true,
    };
  }

  // 2. DOCUMENT STUDIO DETECTION (New doc, edit doc, format doc, write report)
  const docKeywords = [
    "create a document",
    "make a document",
    "edit a document",
    "write a document",
    "new document",
    "open document studio",
    "edit document",
    "create doc",
    "make doc",
    "edit doc",
    "document studio",
    "write a report",
    "format document",
    "write whitepaper",
    "executive summary doc",
    "draft a report",
    "write an article doc",
  ];
  if (docKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "document_studio",
      confidence: 0.94,
      extractedQuery: query,
      targetRoute: `/document-studio?prompt=${encodeURIComponent(query)}`,
      studioName: "Doc Architect Studio",
      category: "creative",
      headline: "Document Studio",
      description: "Structured document editor with export to PDF/DOCX, citations, and executive formatting.",
      badgeLabel: "Doc Studio",
      badgeColor: "from-emerald-500 to-teal-600",
      iconName: "FileText",
      supportsDualOption: true,
    };
  }

  // 3. HOMEWORK ASSISTANT DUAL OPTION
  const homeworkKeywords = [
    "homework",
    "homework help",
    "help with homework",
    "do my homework",
    "solve homework",
    "homework assistant",
    "assignment help",
    "math homework",
    "science homework",
    "physics homework",
    "chemistry homework",
    "school assignment",
  ];
  if (homeworkKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "homework_assistant",
      confidence: 0.95,
      extractedQuery: query,
      targetRoute: `/homework?prompt=${encodeURIComponent(query)}`,
      studioName: "Homework Assistant AI",
      category: "information_dual",
      headline: "Homework & Tutor Hub",
      description: "Step-by-step problem solver, solution verifier, diagram helper, and chapter digests.",
      badgeLabel: "Homework AI",
      badgeColor: "from-amber-500 to-orange-600",
      iconName: "BookOpen",
      supportsDualOption: true,
    };
  }

  // 4. TRANSLATOR STUDIO DETECTION
  const translateKeywords = [
    "translate",
    "translator",
    "translate to",
    "translate this",
    "language translator",
    "spanish translation",
    "french translation",
    "hindi translation",
    "german translation",
    "convert language",
    "multilingual translate",
    "translate studio",
  ];
  if (translateKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "translator",
      confidence: 0.94,
      extractedQuery: query,
      targetRoute: `/translator?query=${encodeURIComponent(query)}`,
      studioName: "Universal Language Translator",
      category: "information_dual",
      headline: "Translate Studio",
      description: "Real-time 100+ language translation, dialect nuances, phonetic pronunciation, and document translation.",
      badgeLabel: "Translator",
      badgeColor: "from-cyan-500 to-teal-500",
      iconName: "Languages",
      supportsDualOption: true,
    };
  }

  // 5. SUMMARIZER DETECTION
  const summaryKeywords = [
    "summarize",
    "summary of",
    "text summarizer",
    "article summary",
    "document summary",
    "tldr of",
    "make a summary",
    "give me a summary",
  ];
  if (summaryKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "summarizer",
      confidence: 0.92,
      extractedQuery: query,
      targetRoute: `/summarizer?prompt=${encodeURIComponent(query)}`,
      studioName: "Executive Summarizer Studio",
      category: "information_dual",
      headline: "Executive Summarizer",
      description: "Deep text compression, bullet point takeaways, key sentiment analysis, and audio digest.",
      badgeLabel: "Summarizer",
      badgeColor: "from-violet-500 to-fuchsia-600",
      iconName: "ListFilter",
      supportsDualOption: true,
    };
  }

  // 6. NCERT TUTOR DETECTION
  const ncertKeywords = [
    "ncert",
    "cbse board",
    "class 10 ncert",
    "class 12 ncert",
    "class 9 ncert",
    "class 11 ncert",
    "ncert solutions",
    "ncert textbook",
    "ncert chapter",
  ];
  if (ncertKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "ncert_tutor",
      confidence: 0.95,
      extractedQuery: query,
      targetRoute: `/ncert-tutor?query=${encodeURIComponent(query)}`,
      studioName: "NCERT Master Tutor",
      category: "information_dual",
      headline: "NCERT & CBSE Board Studio",
      description: "Classes 6-12 rationalized eBooks, exercise solutions, board exam simulators, and formula vaults.",
      badgeLabel: "NCERT AI",
      badgeColor: "from-blue-600 to-indigo-700",
      iconName: "GraduationCap",
      supportsDualOption: true,
    };
  }

  // 7. CONCEPT X-RAY DETECTION
  const xrayKeywords = [
    "concept xray",
    "xray of",
    "concept x-ray",
    "concept breakdown",
    "visual concept map",
  ];
  if (xrayKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "concept_xray",
      confidence: 0.92,
      extractedQuery: query,
      targetRoute: `/concept-xray?topic=${encodeURIComponent(query)}`,
      studioName: "Concept X-Ray Studio",
      category: "information_dual",
      headline: "Concept X-Ray Explainer",
      description: "3D interactive conceptual breakdown, foundational layers, and intuitive node relationships.",
      badgeLabel: "X-Ray AI",
      badgeColor: "from-cyan-400 to-blue-600",
      iconName: "Activity",
      supportsDualOption: true,
    };
  }

  // 8. CODE INTERPRETER DETECTION
  const interpreterKeywords = [
    "code interpreter",
    "run python",
    "execute python",
    "python sandbox",
    "run script",
    "execute code",
  ];
  if (interpreterKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "code_interpreter",
      confidence: 0.93,
      extractedQuery: query,
      targetRoute: `/code-interpreter?code=${encodeURIComponent(query)}`,
      studioName: "Python Code Interpreter",
      category: "creative",
      headline: "Python Execution Sandbox",
      description: "Interactive Python execution, data visualization graphs, pandas dataframes, and numerical computation.",
      badgeLabel: "Interpreter",
      badgeColor: "from-yellow-500 to-amber-600",
      iconName: "Terminal",
      supportsDualOption: true,
    };
  }

  // 9. IMAGE GENERATION DETECTION
  const imageRegex =
    /^(generate|create|make|draw|paint|render|produce|design)?\s*(an?\s+)?(image|picture|photo|illustration|artwork|wallpaper|portrait|avatar|graphic|drawing|3d\s+render|logo|icon|poster)\s+(of|with|showing|featuring|depicting|about|representing)?\s*(.*)$/i;
  const directImageKeywords = [
    "generate image",
    "create image",
    "draw an image",
    "draw a",
    "picture of",
    "photo of",
    "paint a",
    "make an artwork",
    "realistic photo of",
    "cyberpunk image of",
    "anime art of",
    "3d render of",
    "make a picture of",
    "generate a photo of",
    "imagine a",
    "illustration of",
  ];

  const isImageMatch =
    directImageKeywords.some((kw) => lower.includes(kw)) ||
    (imageRegex.test(lower) &&
      (lower.includes("image") ||
        lower.includes("picture") ||
        lower.includes("photo") ||
        lower.includes("draw") ||
        lower.includes("artwork") ||
        lower.includes("wallpaper")));

  if (isImageMatch && query.length > 5) {
    let cleanPrompt = query
      .replace(/^(please\s+)?(can\s+you\s+)?(generate|create|draw|make|paint|render)\s+(an?\s+)?(image|picture|photo|artwork|illustration|drawing|wallpaper)\s+(of|for|about|with)?\s*/i, "")
      .trim();
    if (!cleanPrompt) cleanPrompt = query;

    return {
      intent: "image_generation",
      confidence: 0.95,
      extractedQuery: cleanPrompt,
      targetRoute: `/image-generator?prompt=${encodeURIComponent(cleanPrompt)}&autostart=true`,
      studioName: "KnowDeep Vision Studio",
      category: "creative",
      headline: "AI Image Generator",
      description: "Direct to 8K Vision Studio with style presets, negative prompts, and aspect ratio controls.",
      badgeLabel: "Vision AI",
      badgeColor: "from-purple-500 to-pink-500",
      iconName: "Image",
      supportsDualOption: true,
    };
  }

  // 10. VIDEO GENERATION DETECTION
  const videoKeywords = [
    "generate video",
    "create video",
    "make a video",
    "produce a video",
    "generate animation",
    "render video",
    "ai video of",
    "video clip of",
    "cinematic video of",
    "movie of",
    "animate this",
  ];
  if (videoKeywords.some((kw) => lower.includes(kw)) && query.length > 6) {
    let cleanPrompt = query
      .replace(/^(please\s+)?(can\s+you\s+)?(generate|create|make|produce|render)\s+(an?\s+)?(video|animation|clip|movie)\s+(of|for|about|with)?\s*/i, "")
      .trim();
    if (!cleanPrompt) cleanPrompt = query;

    return {
      intent: "video_generation",
      confidence: 0.92,
      extractedQuery: cleanPrompt,
      targetRoute: `/video-studio?prompt=${encodeURIComponent(cleanPrompt)}`,
      studioName: "Director AI Video Studio",
      category: "creative",
      headline: "AI Video Generation",
      description: "Open in Director AI with camera angles, fps settings, lighting, and timeline controls.",
      badgeLabel: "Director AI",
      badgeColor: "from-red-500 to-orange-500",
      iconName: "Video",
      supportsDualOption: true,
    };
  }

  // 11. PRESENTATION / PPT DETECTION
  const pptKeywords = [
    "create presentation",
    "make presentation",
    "generate presentation",
    "create a ppt",
    "make a ppt",
    "create slide deck",
    "generate slides",
    "make slides on",
    "pitch deck on",
    "presentation on",
    "presentation about",
    "slides about",
    "powerpoint on",
  ];
  if (pptKeywords.some((kw) => lower.includes(kw)) && query.length > 7) {
    let cleanPrompt = query
      .replace(/^(please\s+)?(can\s+you\s+)?(generate|create|make)\s+(an?\s+)?(presentation|ppt|slides|slide\s+deck|pitch\s+deck|powerpoint)\s+(on|about|for)?\s*/i, "")
      .trim();
    if (!cleanPrompt) cleanPrompt = query;

    return {
      intent: "presentation_generation",
      confidence: 0.94,
      extractedQuery: cleanPrompt,
      targetRoute: `/presentation-studio?topic=${encodeURIComponent(cleanPrompt)}&autostart=true`,
      studioName: "Slide Architect Studio",
      category: "creative",
      headline: "Presentation Studio",
      description: "Design full multi-slide presentation decks with layout engines, theme templates, and PPTX export.",
      badgeLabel: "Slide Studio",
      badgeColor: "from-fuchsia-500 to-violet-600",
      iconName: "Presentation",
      supportsDualOption: true,
    };
  }

  // 12. CODE / FULL-STACK APP CREATION
  const codeKeywords = [
    "build an app",
    "create a react app",
    "build a web app",
    "write full-stack code",
    "code sandbox",
    "interactive code studio",
    "build a game in javascript",
    "develop an application",
    "generate full project code",
  ];
  if (codeKeywords.some((kw) => lower.includes(kw))) {
    return {
      intent: "code_studio",
      confidence: 0.9,
      extractedQuery: query,
      targetRoute: `/code-studio?prompt=${encodeURIComponent(query)}`,
      studioName: "KnowDeep Code Studio",
      category: "creative",
      headline: "Code & Sandbox Studio",
      description: "Multi-file IDE with live execution, preview terminal, package manager, and debugger.",
      badgeLabel: "Code Studio",
      badgeColor: "from-cyan-500 to-blue-600",
      iconName: "Code2",
      supportsDualOption: true,
    };
  }

  // 13. WEATHER DUAL OPTION
  const weatherKeywords = [
    "weather in",
    "weather for",
    "weather of",
    "weather today",
    "weather forecast for",
    "temperature in",
    "temperature at",
    "temperature of",
    "is it raining in",
    "forecast for",
    "how is the weather in",
    "what's the weather in",
    "whats the weather in",
  ];
  const isWeatherMatch =
    weatherKeywords.some((kw) => lower.includes(kw)) ||
    (/^weather\s+in\s+([a-zA-Z\s]+)$/i.test(query.trim()) && query.length < 35) ||
    lower === "weather" ||
    lower === "check weather";

  if (isWeatherMatch) {
    let extractedCity = "";
    const matchCity =
      query.match(/weather\s+(?:in|at|for|of)?\s*([a-zA-Z\s,]+)/i) ||
      query.match(/temperature\s+(?:in|at|for|of)?\s*([a-zA-Z\s,]+)/i) ||
      query.match(/forecast\s+(?:in|at|for|of)?\s*([a-zA-Z\s,]+)/i);

    if (matchCity && matchCity[1]) {
      extractedCity = matchCity[1].replace(/[?!.]/g, "").trim();
    }
    if (!extractedCity || extractedCity.toLowerCase() === "today" || extractedCity.toLowerCase() === "now") {
      extractedCity = "New York";
    }

    return {
      intent: "weather_dual",
      confidence: 0.95,
      extractedQuery: extractedCity,
      targetRoute: `/weather?city=${encodeURIComponent(extractedCity)}`,
      studioName: "Weather Station AI",
      category: "information_dual",
      headline: "Live Weather Station",
      description: "Real-time radar, hourly timelines, AQI breakdown, UV index, and 7-day multi-city forecasts.",
      badgeLabel: "Weather Hub",
      badgeColor: "from-sky-400 to-blue-600",
      iconName: "CloudSun",
      supportsDualOption: true,
    };
  }

  // 14. NEWS DUAL OPTION
  const newsKeywords = [
    "latest news",
    "breaking news",
    "today's news",
    "todays news",
    "daily news headlines",
    "news headlines",
    "top headlines today",
    "news today",
    "world news today",
  ];
  const isNewsMatch =
    newsKeywords.some((kw) => lower.includes(kw)) ||
    lower === "news" ||
    lower === "today news" ||
    /^(show|give|get|check|tell)\s+(me\s+)?(the\s+)?(latest\s+)?news/i.test(lower);

  if (isNewsMatch) {
    let extractedTopic = "";
    const matchTopic = query.match(/news\s+(?:about|on|regarding)?\s*([a-zA-Z\s,]+)/i);
    if (matchTopic && matchTopic[1]) {
      extractedTopic = matchTopic[1].replace(/[?!.]/g, "").trim();
    }
    if (!extractedTopic || extractedTopic.toLowerCase() === "today" || extractedTopic.toLowerCase() === "now") {
      extractedTopic = "All Breaking Headlines";
    }

    return {
      intent: "news_dual",
      confidence: 0.92,
      extractedQuery: extractedTopic,
      targetRoute: `/news?topic=${encodeURIComponent(extractedTopic)}`,
      studioName: "NewsWire Terminal",
      category: "information_dual",
      headline: "NewsWire Intelligence",
      description: "Live Reuters/AP wire feeds, sentiment sparklines, financial marquee, and executive audio briefings.",
      badgeLabel: "News Terminal",
      badgeColor: "from-amber-500 to-rose-600",
      iconName: "Newspaper",
      supportsDualOption: true,
    };
  }

  // 15. SPORTS DUAL OPTION
  const sportsKeywords = [
    "sports score",
    "ipl score",
    "cricket match",
    "football score",
    "premier league",
    "nba score",
    "champions league",
    "sports update",
    "live score",
    "match results",
    "f1 standings",
    "sports news",
  ];
  const isSportsMatch = sportsKeywords.some((kw) => lower.includes(kw)) || lower === "sports";

  if (isSportsMatch) {
    let extractedSport = "";
    const matchSport = query.match(/(?:sports?|score|match)\s+(?:about|for|of)?\s*([a-zA-Z0-9\s,]+)/i);
    if (matchSport && matchSport[1]) {
      extractedSport = matchSport[1].replace(/[?!.]/g, "").trim();
    }
    if (!extractedSport) {
      extractedSport = "Live Matches & Standings";
    }

    return {
      intent: "sports_dual",
      confidence: 0.92,
      extractedQuery: extractedSport,
      targetRoute: `/sports?query=${encodeURIComponent(extractedSport)}`,
      studioName: "Sports Stadium AI",
      category: "information_dual",
      headline: "Sports Hub Arena",
      description: "Live scoreboards, match detail telemetry, athlete spotlights, and stadium audio vibes.",
      badgeLabel: "Sports Arena",
      badgeColor: "from-emerald-500 to-cyan-600",
      iconName: "Trophy",
      supportsDualOption: true,
    };
  }

  return {
    intent: "general_chat",
    confidence: 0.2,
    extractedQuery: query,
    targetRoute: "/chat",
    studioName: "KnowDeep AI Chat",
    category: "general",
    headline: "General Chat",
    description: "Conversation with KnowDeep neural assistant.",
    badgeLabel: "Chat",
    badgeColor: "from-slate-500 to-slate-700",
    iconName: "MessageSquare",
    supportsDualOption: false,
  };
}
