import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  BookOpen,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillTrack {
  id: string;
  title: string;
  desc: string;
  color: string;
  milestones: string[];
}

const SKILL_TRACKS: SkillTrack[] = [
  {
    id: "fullstack",
    title: "Full-Stack Engineering",
    desc: "React 19, Node.js microservices, PostgreSQL, GraphQL & Docker",
    color: "from-blue-500 to-cyan-500",
    milestones: ["Modern ECMAScript & TypeScript", "React Component Patterns & State", "REST & GraphQL Backend APIs", "Database Indexing & Caching", "Cloud CI/CD Deployment"],
  },
  {
    id: "ai",
    title: "Data Science & AI",
    desc: "Deep learning, LLM fine-tuning, PyTorch, LangChain & Vector DBs",
    color: "from-purple-500 to-pink-500",
    milestones: ["Applied Linear Algebra & Statistics", "Supervised & Unsupervised ML", "Transformer Architectures & Attention", "RAG & Vector Embeddings", "Model Quantization & Inference"],
  },
  {
    id: "design",
    title: "UI/UX Design",
    desc: "Design systems, typography mathematical scaling & WCAG AAA",
    color: "from-pink-500 to-rose-500",
    milestones: ["Design Thinking & User Research", "Wireframing & Interactive Prototypes", "Micro-Interactions & Motion", "Design Systems & Tokenization", "Usability Heuristics & Testing"],
  },
  {
    id: "security",
    title: "Cyber Security",
    desc: "Penetration testing, Zero-Trust network security & cryptography",
    color: "from-amber-500 to-orange-500",
    milestones: ["Network Fundamentals & Protocols", "Web Application Vulnerabilities (OWASP)", "Cryptography & PKI Infrastructure", "Threat Modeling & SIEM Monitoring", "Zero-Trust Architecture"],
  },
  {
    id: "cloud",
    title: "Cloud Architecture",
    desc: "Kubernetes, Terraform, multi-region high availability & AWS/GCP",
    color: "from-emerald-500 to-teal-500",
    milestones: ["Infrastructure as Code (Terraform)", "Container Orchestration with K8s", "Multi-Region VPC Peering & DNS", "Distributed Caching & Kafka", "FinOps & Cost Optimization"],
  },
];

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  { id: "fc1", category: "Full-Stack", front: "What is the Virtual DOM reconciliation algorithm in React?", back: "React compares the new Virtual DOM tree against the previous snapshot using a heuristic O(n) diffing algorithm, batching minimum DOM updates to avoid layout thrashing." },
  { id: "fc2", category: "AI & ML", front: "Explain Scaled Dot-Product Attention in Transformers.", back: "Attention(Q, K, V) = softmax(Q·K^T / √d_k) · V. The scaling factor √d_k prevents dot products from growing excessively large for deep dimensions, preventing gradient vanishing." },
  { id: "fc3", category: "System Design", front: "What is the CAP Theorem tradeoff?", back: "A distributed system can guarantee at most two of three properties: Consistency (all nodes see same data simultaneously), Availability (every request receives response), Partition Tolerance (tolerates network breaks)." },
  { id: "fc4", category: "Cyber Security", front: "What is Cross-Site Scripting (XSS) and its prevention?", back: "XSS occurs when malicious scripts are injected into trusted websites. Mitigated by context-aware output encoding, strict Content Security Policy (CSP), and HTTP-only cookies." },
];

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which data structure provides O(1) average time complexity for both insertions and lookups?",
    options: ["Binary Search Tree", "Hash Map", "Linked List", "Sorted Array"],
    correctIndex: 1,
    explanation: "Hash maps compute an array index via a hash function, allowing O(1) average-case amortized time for insertions and retrieval.",
  },
  {
    id: 2,
    question: "In neural networks, what is the primary benefit of Residual Connections (ResNet)?",
    options: ["Reduces memory by 50%", "Eliminates need for backpropagation", "Mitigates vanishing gradient problem in deep networks", "Enables unsupervised learning"],
    correctIndex: 2,
    explanation: "Residual skip-connections allow identity mapping shortcuts, letting gradients flow directly backwards through hundreds of layers without decaying.",
  },
  {
    id: 3,
    question: "Which HTTP status code signifies that a resource was moved permanently?",
    options: ["301", "302", "304", "307"],
    correctIndex: 0,
    explanation: "HTTP 301 Moved Permanently tells clients and search engines that the target resource has permanently migrated to a new URI.",
  },
];

export default function LearningHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"tracks" | "flashcards" | "quiz">("tracks");

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [quizFinished, setQuizFinished] = useState(false);

  // Quiz Timer
  useEffect(() => {
    if (activeTab === "quiz" && !quizFinished && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !quizFinished) {
      setQuizFinished(true);
      toast({ title: "Time Expired", description: "Quiz finished automatically.", variant: "destructive" });
    }
  }, [activeTab, quizFinished, timeLeft, toast]);

  const handleFlashcardMastered = (known: boolean) => {
    if (known) setMasteredCount((c) => c + 1);
    setIsFlipped(false);
    if (flashcardIndex + 1 < SAMPLE_FLASHCARDS.length) {
      setFlashcardIndex((i) => i + 1);
    } else {
      toast({ title: "Flashcard Deck Completed", description: `You mastered ${masteredCount + (known ? 1 : 0)} of ${SAMPLE_FLASHCARDS.length} concepts!` });
      setFlashcardIndex(0);
    }
  };

  const handleSelectQuizOption = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === QUIZ_QUESTIONS[quizIndex].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(45);
    setQuizFinished(false);
  };

  return (
    <AppLayout title="Learning Hub">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span>Learning Hub</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Engineered roadmaps, interactive 3D flashcards mastery system, and timed multiple-choice skill assessments
            </p>
          </div>

          {/* 3-Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-2xl border border-border/60 shrink-0">
            {[
              { id: "tracks", label: "Skill Tracks & Roadmaps", icon: Layers },
              { id: "flashcards", label: "Interactive Flashcards", icon: RotateCw },
              { id: "quiz", label: "Timed Knowledge Quiz", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "tracks" | "flashcards" | "quiz")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-sm border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-violet-400" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Skill Tracks & Roadmaps Tab */}
        {activeTab === "tracks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILL_TRACKS.map((track) => (
              <div
                key={track.id}
                className="p-5 rounded-3xl bg-card border border-border/60 flex flex-col justify-between space-y-4 hover:border-violet-500/40 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                      Curriculum Track
                    </span>
                    <span className="w-2 h-2 rounded-full bg-violet-400 group-hover:scale-125 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-violet-400 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{track.desc}</p>

                  {/* Milestones Roadmap */}
                  <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Core Milestones
                    </span>
                    <ul className="space-y-1.5">
                      {track.milestones.map((m, idx) => (
                        <li key={idx} className="text-xs text-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span className="truncate">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setActiveTab("flashcards");
                    toast({ title: "Opening Flashcards", description: `Loaded study deck for ${track.title}.` });
                  }}
                  className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs h-9 rounded-xl gap-1.5 border border-border/60"
                >
                  Start Track Flashcards
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 2. Interactive Flashcards System */}
        {activeTab === "flashcards" && (
          <div className="max-w-xl mx-auto w-full flex-1 flex flex-col items-center justify-center space-y-5">
            {/* Progress Counter */}
            <div className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>
                Card {flashcardIndex + 1} of {SAMPLE_FLASHCARDS.length}
              </span>
              <span className="text-violet-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Mastered: {masteredCount}
              </span>
            </div>

            {/* Flashcard with 3D Flip */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-80 rounded-3xl bg-card border border-border/80 p-8 shadow-xl cursor-pointer flex flex-col justify-between text-center relative group hover:border-violet-500/50 transition-all select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300">
                  {SAMPLE_FLASHCARDS[flashcardIndex].category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Click to Flip
                </span>
              </div>

              <div className="my-auto px-4">
                <p className="text-base font-bold text-foreground leading-snug">
                  {isFlipped
                    ? SAMPLE_FLASHCARDS[flashcardIndex].back
                    : SAMPLE_FLASHCARDS[flashcardIndex].front}
                </p>
                <p className="text-[11px] text-muted-foreground mt-3">
                  {isFlipped ? "— Explanation & Key Concepts —" : "— Prompt / Question —"}
                </p>
              </div>

              <span className="text-[10px] text-muted-foreground">Tap card to reveal answer</span>
            </div>

            {/* Mastery Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <Button
                onClick={() => handleFlashcardMastered(false)}
                variant="outline"
                className="flex-1 h-11 rounded-2xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-2 font-semibold text-xs"
              >
                <XCircle className="w-4 h-4" />
                Still Learning
              </Button>
              <Button
                onClick={() => handleFlashcardMastered(true)}
                className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white gap-2 font-semibold text-xs shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                Known / Mastered
              </Button>
            </div>
          </div>
        )}

        {/* 3. Timed Multiple-Choice Quiz Generator */}
        {activeTab === "quiz" && (
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
            {!quizFinished ? (
              <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-lg space-y-5">
                {/* Header: Question Counter & Live Countdown Timer */}
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full ${
                      timeLeft <= 10
                        ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {timeLeft}s
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {QUIZ_QUESTIONS[quizIndex].question}
                </h3>

                {/* Options */}
                <div className="space-y-2.5">
                  {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
                    let btnClass = "bg-muted/40 border-border/60 text-foreground hover:bg-muted/80";
                    if (isAnswered) {
                      if (idx === QUIZ_QUESTIONS[quizIndex].correctIndex) {
                        btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                      } else if (idx === selectedAnswer) {
                        btnClass = "bg-rose-500/20 border-rose-500 text-rose-300";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuizOption(idx)}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && idx === QUIZ_QUESTIONS[quizIndex].correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {isAnswered && idx === selectedAnswer && idx !== QUIZ_QUESTIONS[quizIndex].correctIndex && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on Answer */}
                {isAnswered && (
                  <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                      Answer Explanation
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {QUIZ_QUESTIONS[quizIndex].explanation}
                    </p>
                  </div>
                )}

                {/* Next Button */}
                {isAnswered && (
                  <Button
                    onClick={handleNextQuizQuestion}
                    className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-xs h-10 rounded-xl"
                  >
                    {quizIndex + 1 < QUIZ_QUESTIONS.length ? "Next Question" : "View Final Score"}
                  </Button>
                )}
              </div>
            ) : (
              /* Quiz Finished Score Card */
              <div className="p-8 rounded-3xl bg-card border border-border/60 text-center space-y-5 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Quiz Assessment Complete</h3>
                  <p className="text-xs text-muted-foreground mt-1">Here is your verified mastery breakdown</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 max-w-xs mx-auto">
                  <span className="text-3xl font-extrabold font-mono text-violet-400">
                    {score} / {QUIZ_QUESTIONS.length}
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {score === QUIZ_QUESTIONS.length ? "Perfect Mastery! Outstanding work." : "Good Effort! Keep practicing."}
                  </p>
                </div>

                <Button
                  onClick={handleRestartQuiz}
                  className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-xs h-10 rounded-xl px-6"
                >
                  Restart Quiz
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
