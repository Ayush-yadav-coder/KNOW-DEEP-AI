import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  History,
  Code2,
  Globe2,
  BookOpen,
  TrendingUp,
  Languages,
  Compass,
  Leaf,
  Upload,
  Camera,
  Sparkles,
  Baby,
  CheckCircle2,
  ChevronRight,
  Loader2,
  HelpCircle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Bookmark,
  Award,
  Edit3,
  FolderHeart,
  LineChart as ChartIcon,
  RotateCcw,
  Layers,
  ListTodo,
  Clock,
  Send,
  Flame,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

// Import modular Homework components
import { HomeworkMathKeyboard } from "@/components/homework/HomeworkMathKeyboard";
import { HomeworkGraphCalculator } from "@/components/homework/HomeworkGraphCalculator";
import { HomeworkFlashcards, Flashcard } from "@/components/homework/HomeworkFlashcards";
import { HomeworkFlashcardCreator } from "@/components/homework/HomeworkFlashcardCreator";
import { HomeworkPracticeQuiz, QuizQuestion } from "@/components/homework/HomeworkPracticeQuiz";
import { HomeworkFormulaSheet } from "@/components/homework/HomeworkFormulaSheet";
import { HomeworkCanvasAnnotator } from "@/components/homework/HomeworkCanvasAnnotator";
import { HomeworkNotebook, NotebookEntry } from "@/components/homework/HomeworkNotebook";
import { HomeworkPlanner } from "@/components/homework/HomeworkPlanner";
import { HomeworkFocusTimer } from "@/components/homework/HomeworkFocusTimer";
import { HomeworkGradeTracker } from "@/components/homework/HomeworkGradeTracker";
import { HomeworkResources } from "@/components/homework/HomeworkResources";

interface Subject {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sampleQuestion: string;
}

const ACADEMIC_TIERS = [
  { id: "middle", label: "Middle School" },
  { id: "high", label: "High School / AP / CBSE" },
  { id: "college", label: "College / University" },
];

const SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Mathematics (Maths)",
    category: "STEM",
    icon: Calculator,
    color: "from-blue-500 to-indigo-600",
    sampleQuestion: "Solve the quadratic equation 2x² - 8x + 6 = 0 using factorization and the quadratic formula.",
  },
  {
    id: "english",
    name: "English Language & Lit",
    category: "Humanities",
    icon: BookOpen,
    color: "from-amber-500 to-yellow-600",
    sampleQuestion: "Analyze Shakespeare's use of dramatic irony and soliloquy in Hamlet's 'To be or not to be' speech using PEEL paragraph structure.",
  },
  {
    id: "hindi",
    name: "हिंदी (Hindi Literature & Vyakaran)",
    category: "Languages",
    icon: Languages,
    color: "from-orange-500 to-red-600",
    sampleQuestion: "'कनक कनक ते सौ गुनी मादकता अधिकाय' - इस पंक्ति में कौन-सा अलंकार है? सोदाहरण स्पष्ट कीजिए और संधि के प्रकार भी समझाइए।",
  },
  {
    id: "physics",
    name: "Physics (Science)",
    category: "STEM",
    icon: Atom,
    color: "from-purple-500 to-violet-600",
    sampleQuestion: "A ball is launched horizontally from a 45m high cliff at 20 m/s. Find the total flight time and range (g = 9.8 m/s²).",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    category: "STEM",
    icon: FlaskConical,
    color: "from-emerald-500 to-teal-600",
    sampleQuestion: "Balance the redox equation: KMnO₄ + HCl → KCl + MnCl₂ + H₂O + Cl₂ in acidic solution using the ion-electron method.",
  },
  {
    id: "biology",
    name: "Biology",
    category: "STEM",
    icon: Dna,
    color: "from-rose-500 to-pink-600",
    sampleQuestion: "Explain the light-dependent reactions of photosynthesis occurring within the thylakoid membranes, including ATP synthesis.",
  },
  {
    id: "history",
    name: "History & Social Studies",
    category: "Humanities",
    icon: History,
    color: "from-amber-600 to-orange-700",
    sampleQuestion: "Analyze the key socio-economic catalysts and Treaty of Versailles terms that led up to World War II.",
  },
  {
    id: "geography",
    name: "Geography",
    category: "Social Sciences",
    icon: Compass,
    color: "from-cyan-500 to-teal-600",
    sampleQuestion: "Explain the tectonic mechanisms behind convergent plate boundaries and how deep-sea trenches and volcanic arcs form.",
  },
  {
    id: "cs",
    name: "Computer Science & Coding",
    category: "STEM",
    icon: Code2,
    color: "from-cyan-500 to-blue-600",
    sampleQuestion: "Explain the time complexity of QuickSort in worst and average cases, and write Python partition logic with pivot selection.",
  },
  {
    id: "economics",
    name: "Economics & Commerce",
    category: "Commerce",
    icon: TrendingUp,
    color: "from-teal-500 to-emerald-600",
    sampleQuestion: "Calculate the price elasticity of demand when price rises from $10 to $12 and quantity demanded falls from 100 to 70 units.",
  },
  {
    id: "evs",
    name: "Environmental Science (EVS)",
    category: "Sciences",
    icon: Leaf,
    color: "from-lime-500 to-green-600",
    sampleQuestion: "Discuss the greenhouse effect, greenhouse gases (CO2, CH4, N2O), and three actionable community carbon sequestration strategies.",
  },
];

export default function HomeworkAssistant() {
  const { toast } = useToast();

  // Primary Workspace State
  const [selectedTier, setSelectedTier] = useState("high");
  const [selectedSubject, setSelectedSubject] = useState<Subject>(SUBJECTS[0]);
  const [questionInput, setQuestionInput] = useState("");
  const [explainLike10, setExplainLike10] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  // Solution Output State
  const [solutionMarkdown, setSolutionMarkdown] = useState<string>("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Active Output View Mode Tab
  const [activeTab, setActiveTab] = useState<
    "solution" | "planner" | "timer" | "grades" | "resources" | "graph" | "flashcards" | "quiz" | "formula" | "notebook" | "canvas"
  >("solution");

  // Focus Timer Active Task Sync
  const [focusTaskTitle, setFocusTaskTitle] = useState<string>("");

  // Utilities State
  const [copied, setCopied] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notebook Saved State Persistence
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_homework_notebook");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  const handleSubjectChange = (subj: Subject) => {
    setSelectedSubject(subj);
    setSolutionMarkdown("");
  };

  const handleInsertSymbol = (symbol: string) => {
    setQuestionInput((prev) => prev + symbol);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      toast({
        title: "Homework Image Attached",
        description: `${file.name} ready for OCR problem extraction.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSolveHomework = async () => {
    if (!questionInput.trim() && !uploadedImage) {
      toast({
        title: "Question Required",
        description: "Please enter a homework question or upload/draw a photo.",
        variant: "destructive",
      });
      return;
    }

    setIsSolving(true);
    try {
      const pedagogyInstruction = explainLike10
        ? "Adopt a friendly 'Explain Like I'm 10' (ELI10) Socratic tutoring pedagogy. Use everyday visual analogies, simple conversational vocabulary, and highlight why the answer makes sense intuitively."
        : `Target Academic Level: ${selectedTier.toUpperCase()}. Provide a rigorous step-by-step Socratic solution breakdown with mathematical/LaTeX formulas, exact definitions, intermediate steps, and final verification checks. For English/Hindi questions, provide grammatical analysis, rules, and vocabulary references.`;

      const prompt = `Subject: ${selectedSubject.name}
Homework Problem: ${questionInput || "Solve the problem depicted in the attached image"}
Pedagogy Mode: ${pedagogyInstruction}

Your task is to solve the problem AND generate study flashcards and practice quiz questions.
Return your response strictly formatted as:

---SOLUTION---
(Your detailed step-by-step Markdown solution here, with LaTeX formulas, step 1, step 2, boxed final answer, and common pitfalls)

---FLASHCARDS---
[
  {"id": "fc1", "front": "Key concept 1 question", "back": "Answer 1", "category": "${selectedSubject.name}"},
  {"id": "fc2", "front": "Key concept 2 question", "back": "Answer 2", "category": "${selectedSubject.name}"},
  {"id": "fc3", "front": "Key concept 3 question", "back": "Answer 3", "category": "${selectedSubject.name}"}
]

---QUIZ---
[
  {
    "id": "q1",
    "question": "Practice question 1 derived from this topic",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why Option A is correct."
  },
  {
    "id": "q2",
    "question": "Practice question 2 derived from this topic",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 1,
    "explanation": "Why Option B is correct."
  }
]`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const rawText = data.content || "";

      // Parse structured sections
      let markdownPart = rawText;
      let flashcardPart: Flashcard[] = [];
      let quizPart: QuizQuestion[] = [];

      if (rawText.includes("---SOLUTION---")) {
        const parts = rawText.split("---SOLUTION---")[1] || "";
        const flashSplit = parts.split("---FLASHCARDS---");
        markdownPart = flashSplit[0].trim();

        if (flashSplit[1]) {
          const quizSplit = flashSplit[1].split("---QUIZ---");
          try {
            flashcardPart = JSON.parse(quizSplit[0].trim());
          } catch {
            // fallback default flashcards
          }
          if (quizSplit[1]) {
            try {
              quizPart = JSON.parse(quizSplit[1].trim());
            } catch {
              // fallback quiz
            }
          }
        }
      }

      // Default fallback flashcards if JSON parsing failed
      if (!flashcardPart || flashcardPart.length === 0) {
        flashcardPart = [
          { id: "fc1", front: `What is the core principle of ${selectedSubject.name}?`, back: "Step-by-step logic and formula derivation.", category: selectedSubject.name },
          { id: "fc2", front: "What is the primary formula/rule used in this solution?", back: questionInput.slice(0, 45) + "...", category: selectedSubject.name },
          { id: "fc3", front: "How do you verify the final answer?", back: "Substitute answer back into initial boundary conditions.", category: selectedSubject.name },
        ];
      }

      // Default fallback quiz
      if (!quizPart || quizPart.length === 0) {
        quizPart = [
          {
            id: "q1",
            question: `Which approach is most effective for solving ${selectedSubject.name} problems of this type?`,
            options: ["Socratic step-by-step decomposition", "Random guess", "Skip intermediate steps", "Ignore units"],
            correctIndex: 0,
            explanation: "Socratic step-by-step decomposition ensures all intermediate algebraic variables and units are verified.",
          },
        ];
      }

      setSolutionMarkdown(markdownPart);
      setFlashcards(flashcardPart);
      setQuizQuestions(quizPart);
      setActiveTab("solution");

      toast({
        title: "Homework Solved!",
        description: "Solution, flashcards, and practice quiz generated successfully.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while solving.";
      toast({ title: "Solving error", description: message, variant: "destructive" });
    } finally {
      setIsSolving(false);
    }
  };

  // Audio Voice Tutor
  const handlePlayVoiceTutor = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (!solutionMarkdown) return;

    setIsAudioLoading(true);
    try {
      const summaryText = `Here is your step-by-step Socratic solution for ${selectedSubject.name}. ${solutionMarkdown.slice(0, 300).replace(/[*#`_]/g, "")}`;

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summaryText, voice: "Puck" }),
      });

      const data = await res.json();
      if (data.audio) {
        const audioUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audio}`;
        if (audioRef.current) audioRef.current.pause();
        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;
        newAudio.onended = () => setIsPlayingAudio(false);
        newAudio.play();
        setIsPlayingAudio(true);
        toast({ title: "Playing AI Audio Tutor", description: "Listening to solution narrative." });
      }
    } catch {
      toast({ title: "Audio unavailable", description: "Could not synthesize audio.", variant: "destructive" });
    } finally {
      setIsAudioLoading(false);
    }
  };

  // Launch Focus Timer for a specific subtask from Planner
  const handleStartFocusOnTask = (taskTitle: string, minutes: number) => {
    setFocusTaskTitle(taskTitle);
    setActiveTab("timer");
    toast({
      title: "Focus Session Started",
      description: `Loaded subtask: "${taskTitle}" (${minutes}m)`,
    });
  };

  // Save Entry to Study Notebook
  const handleSaveToNotebook = () => {
    if (!solutionMarkdown) return;
    const newEntry: NotebookEntry = {
      id: "nb-" + Date.now(),
      subject: selectedSubject.name,
      question: questionInput || "Image Problem",
      solutionMarkdown,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tags: [selectedSubject.name, selectedTier],
    };

    const updated = [newEntry, ...notebookEntries];
    setNotebookEntries(updated);
    localStorage.setItem("knowdeep_homework_notebook", JSON.stringify(updated));

    toast({
      title: "Saved to Study Notebook!",
      description: "Added to your exam review folder.",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(solutionMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Step-by-step solution copied to clipboard." });
  };

  return (
    <AppLayout title="Homework Assistant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </span>
              <span>AI Socratic Homework &amp; Study Suite</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Step-by-step problem solver, Assignment Planner, Pomodoro Focus Timer, 2D Graphing, Flashcards &amp; Practice Quizzes
            </p>
          </div>

          {/* Academic Tier & ELI10 Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tier Selector */}
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border/60">
              {ACADEMIC_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                    selectedTier === tier.id
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            {/* Explain Like I'm 10 Toggle */}
            <button
              type="button"
              onClick={() => setExplainLike10(!explainLike10)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                explainLike10
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              <Baby className="w-4 h-4 text-amber-400" />
              <span>Explain Like I&apos;m 10 (ELI10)</span>
            </button>
          </div>
        </div>

        {/* Expanded Subject Pills Bar (English, Hindi, Maths, Physics, Chemistry, Biology, History, Geography, CS, Economics, EVS) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUBJECTS.map((subj) => {
            const Icon = subj.icon;
            const isActive = selectedSubject.id === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => handleSubjectChange(subj)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-md shadow-indigo-500/10"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
                <span>{subj.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Split Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column: Problem Input & Scanning Workspace (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-lg space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <selectedSubject.icon className="w-4 h-4 text-indigo-400" />
                  <span>{selectedSubject.name} Input</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {selectedTier.toUpperCase()}
                </span>
              </div>

              {/* Text Area */}
              <Textarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Type your homework problem, equation, essay topic, or paste textbook question here..."
                rows={5}
                className="text-xs rounded-2xl bg-muted/40 border-border/80 resize-none leading-relaxed flex-1"
              />

              {/* Math Symbol Keyboard */}
              <HomeworkMathKeyboard onInsertSymbol={handleInsertSymbol} />

              {/* Photo & Canvas Drawing Controls */}
              <div className="grid grid-cols-2 gap-2">
                {/* Photo Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-border/80 hover:border-indigo-500/60 rounded-2xl bg-muted/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-bold text-muted-foreground truncate">
                    {uploadedImage ? "Photo Ready" : "Upload Photo"}
                  </span>
                </div>

                {/* Canvas Sketch Toggle */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab(activeTab === "canvas" ? "solution" : "canvas")}
                  className={`h-11 rounded-2xl border text-xs font-bold gap-2 ${
                    activeTab === "canvas"
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                      : "bg-card border-border/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Edit3 className="w-4 h-4 text-indigo-400" /> Draw / Write
                </Button>
              </div>

              {/* Uploaded image thumbnail preview */}
              {uploadedImage && (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-border/60 bg-black/40 flex items-center justify-center">
                  <img src={uploadedImage} alt="Problem attachment" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-1 right-1 bg-black/80 text-white p-1 rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Canvas Annotator View when active */}
              {activeTab === "canvas" && (
                <HomeworkCanvasAnnotator
                  onAttachDrawing={(dataUrl) => {
                    setUploadedImage(dataUrl);
                    setActiveTab("solution");
                    toast({ title: "Drawing Attached", description: "Handwritten sketch attached to problem." });
                  }}
                />
              )}

              {/* Solve Button */}
              <Button
                onClick={handleSolveHomework}
                disabled={isSolving || (!questionInput.trim() && !uploadedImage)}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:opacity-90 text-white font-bold text-xs h-12 rounded-2xl shadow-lg shadow-indigo-500/20 gap-2"
              >
                {isSolving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Solving Socratic Breakdown...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Solve Homework &amp; Build Study Suite
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Multi-Tool Output Tabs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* View Mode Navigation Tabs Bar */}
            <div className="p-2 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveTab("solution")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "solution"
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Solution
                </button>

                {/* Intelligent Homework Planner Tab */}
                <button
                  onClick={() => setActiveTab("planner")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "planner"
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" /> Assignment Planner
                </button>

                {/* Focus Timer Pomodoro Tab */}
                <button
                  onClick={() => setActiveTab("timer")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "timer"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Focus Timer
                </button>

                {/* Grade Tracker Tab */}
                <button
                  onClick={() => setActiveTab("grades")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "grades"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Grade Tracker
                </button>

                {/* Resources & PDFs Tab */}
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "resources"
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Resources &amp; PDFs
                </button>

                <button
                  onClick={() => setActiveTab("graph")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "graph"
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ChartIcon className="w-3.5 h-3.5" /> 2D Graph
                </button>

                <button
                  onClick={() => setActiveTab("flashcards")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "flashcards"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" /> Flashcards &amp; SRS {flashcards.length > 0 ? `(${flashcards.length})` : ""}
                </button>

                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "quiz"
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> Practice Quiz ({quizQuestions.length})
                </button>

                <button
                  onClick={() => setActiveTab("formula")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "formula"
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" /> Formulas &amp; Rules
                </button>

                <button
                  onClick={() => setActiveTab("notebook")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeTab === "notebook"
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FolderHeart className="w-3.5 h-3.5" /> Notebook ({notebookEntries.length})
                </button>
              </div>
            </div>

            {/* Active Output Render */}
            <div className="flex-1">
              {/* Solution Tab */}
              {activeTab === "solution" && (
                <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg flex flex-col h-full space-y-4">
                  {/* Top Bar Controls */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Socratic Solution {explainLike10 && "(ELI10 Mode Active)"}
                    </span>

                    {solutionMarkdown && (
                      <div className="flex items-center gap-2">
                        {/* Audio Voice Tutor Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handlePlayVoiceTutor}
                          disabled={isAudioLoading}
                          className="h-8 text-xs rounded-xl gap-1.5 border-border/80"
                        >
                          {isAudioLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isPlayingAudio ? (
                            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          <span>{isPlayingAudio ? "Stop Audio" : "Voice Tutor"}</span>
                        </Button>

                        {/* Save to Notebook */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveToNotebook}
                          className="h-8 text-xs rounded-xl gap-1.5 border-border/80"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          <span>Save to Notebook</span>
                        </Button>

                        {/* Copy Solution */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopy}
                          className="h-8 text-xs rounded-xl gap-1.5 border-border/80"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Solution Markdown Body */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {isSolving ? (
                      <div className="py-28 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                        <p className="text-xs font-bold text-foreground">Deriving Socratic Solution &amp; Formulas...</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Synthesizing flashcards, practice questions, and proofs
                        </p>
                      </div>
                    ) : solutionMarkdown ? (
                      <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed space-y-3">
                        <ReactMarkdown>{solutionMarkdown}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="py-28 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <GraduationCap className="w-12 h-12 opacity-30 mb-3 text-indigo-400" />
                        <p className="text-xs font-bold text-foreground">Awaiting Homework Problem</p>
                        <p className="text-[11px] max-w-xs mt-1">
                          Select a subject (English, Hindi, Maths, Science, etc.), type or scan a photo equation, then click Solve Homework to receive a step-by-step breakdown.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Intelligent Assignment Planner Tab */}
              {activeTab === "planner" && (
                <HomeworkPlanner onStartFocusOnTask={handleStartFocusOnTask} />
              )}

              {/* Pomodoro Focus Timer Tab */}
              {activeTab === "timer" && (
                <HomeworkFocusTimer currentTaskTitle={focusTaskTitle} />
              )}

              {/* Academic Grade Tracker Tab */}
              {activeTab === "grades" && <HomeworkGradeTracker />}

              {/* Study Resources & PDF Library Tab */}
              {activeTab === "resources" && <HomeworkResources />}

              {/* 2D Graphing Calculator Tab */}
              {activeTab === "graph" && <HomeworkGraphCalculator />}

              {/* Interactive Flashcard Creator & Spaced Repetition (SRS) Tab */}
              {activeTab === "flashcards" && (
                <div className="space-y-4">
                  {flashcards.length > 0 && (
                    <HomeworkFlashcards cards={flashcards} subjectName={selectedSubject.name} />
                  )}
                  <HomeworkFlashcardCreator />
                </div>
              )}

              {/* Practice Quiz Tab */}
              {activeTab === "quiz" && (
                <HomeworkPracticeQuiz questions={quizQuestions} subjectName={selectedSubject.name} />
              )}

              {/* Formula & Rule Cheat Sheet Tab */}
              {activeTab === "formula" && (
                <HomeworkFormulaSheet
                  onInsertFormula={(formula) => {
                    setQuestionInput((prev) => prev + " " + formula);
                    toast({ title: "Rule / Formula Inserted", description: `${formula} added to question input.` });
                  }}
                />
              )}

              {/* Notebook Tab */}
              {activeTab === "notebook" && (
                <HomeworkNotebook
                  entries={notebookEntries}
                  onSelectEntry={(entry) => {
                    setQuestionInput(entry.question);
                    setSolutionMarkdown(entry.solutionMarkdown);
                    setActiveTab("solution");
                    toast({ title: "Entry Loaded", description: "Loaded problem from study notebook." });
                  }}
                  onDeleteEntry={(id) => {
                    const updated = notebookEntries.filter((e) => e.id !== id);
                    setNotebookEntries(updated);
                    localStorage.setItem("knowdeep_homework_notebook", JSON.stringify(updated));
                    toast({ title: "Entry Deleted" });
                  }}
                  onClearNotebook={() => {
                    setNotebookEntries([]);
                    localStorage.removeItem("knowdeep_homework_notebook");
                    toast({ title: "Notebook Cleared" });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
