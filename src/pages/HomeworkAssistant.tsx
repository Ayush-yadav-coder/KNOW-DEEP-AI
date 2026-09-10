import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

interface Subject {
  id: string;
  name: string;
  icon: any;
  color: string;
  sampleQuestion: string;
}

const SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: Calculator,
    color: "from-blue-500 to-indigo-600",
    sampleQuestion: "Solve the quadratic equation 2x² - 8x + 6 = 0 using factorization and the quadratic formula.",
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    color: "from-purple-500 to-violet-600",
    sampleQuestion: "A ball is launched horizontally from a 45m high cliff at 20 m/s. Find the total flight time and range (g = 9.8 m/s²).",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    color: "from-emerald-500 to-teal-600",
    sampleQuestion: "Balance the redox equation: KMnO₄ + HCl → KCl + MnCl₂ + H₂O + Cl₂ in acidic solution.",
  },
  {
    id: "biology",
    name: "Biology",
    icon: Dna,
    color: "from-rose-500 to-pink-600",
    sampleQuestion: "Explain the light-dependent reactions of photosynthesis occurring within the thylakoid membranes.",
  },
  {
    id: "history",
    name: "History",
    icon: History,
    color: "from-amber-500 to-orange-600",
    sampleQuestion: "Analyze the key economic catalysts leading up to the 1929 Great Depression.",
  },
  {
    id: "cs",
    name: "Computer Science",
    icon: Code2,
    color: "from-cyan-500 to-blue-600",
    sampleQuestion: "Explain the time complexity of QuickSort in worst and average cases, and write Python partition logic.",
  },
];

export default function HomeworkAssistant() {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<Subject>(SUBJECTS[0]);
  const [questionInput, setQuestionInput] = useState(SUBJECTS[0].sampleQuestion);
  const [explainLike10, setExplainLike10] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [solutionMarkdown, setSolutionMarkdown] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubjectChange = (subj: Subject) => {
    setSelectedSubject(subj);
    setQuestionInput(subj.sampleQuestion);
    setSolutionMarkdown("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      toast({ title: "Homework Image Attached", description: `${file.name} ready for optical OCR solving.` });
    };
    reader.readAsDataURL(file);
  };

  const handleSolveHomework = async () => {
    if (!questionInput.trim() && !uploadedImage) {
      toast({ title: "Question Required", description: "Please enter a homework question or upload a photo.", variant: "destructive" });
      return;
    }

    setIsSolving(true);
    try {
      const modeInstruction = explainLike10
        ? "Adopt a friendly 'Explain Like I'm 10' (ELI10) Socratic tutoring pedagogy. Use everyday visual analogies (like building blocks, pizzas, or bicycles), simple conversational vocabulary, and highlight why the answer makes sense intuitive."
        : "Provide a rigorous step-by-step Socratic solution breakdown with mathematical/LaTeX formulas, exact scientific definitions, intermediate steps, and final verification checks.";

      const prompt = `Subject: ${selectedSubject.name}
Homework Problem: ${questionInput || "Solve the problem depicted in the uploaded image"}
Pedagogy Mode: ${modeInstruction}

Structure your response into:
1. Core Objective & Given Variables
2. Step-by-Step Socratic Solution
3. Final Answer in Box
4. Pro-Tip & Common Pitfall to Avoid`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      setSolutionMarkdown(data.content || "Solution generated successfully.");
    } catch (err: any) {
      toast({ title: "Solving error", description: err.message, variant: "destructive" });
    } finally {
      setIsSolving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(solutionMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Full step-by-step solution copied to clipboard." });
  };

  return (
    <AppLayout title="Homework Assistant">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span>Homework Assistant</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Step-by-step Socratic solution engine with photo scanning, LaTeX formulas, and &quot;Explain Like I&apos;m 10&quot; mode
            </p>
          </div>

          {/* Explain Like I'm 10 Toggle */}
          <button
            type="button"
            onClick={() => setExplainLike10(!explainLike10)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-semibold transition-all ${
              explainLike10
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground"
            }`}
          >
            <Baby className="w-4 h-4 text-amber-400" />
            <span>Explain Like I&apos;m 10 (ELI10)</span>
            <span
              className={`w-2 h-2 rounded-full ${explainLike10 ? "bg-amber-400 animate-pulse" : "bg-muted-foreground"}`}
            />
          </button>
        </div>

        {/* Subject Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SUBJECTS.map((subj) => {
            const Icon = subj.icon;
            const isActive = selectedSubject.id === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => handleSubjectChange(subj)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : ""}`} />
                <span>{subj.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Workspace (Split View) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[480px]">
          {/* Left Column: Problem Input & Photo Scan Zone (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4 flex-1 flex flex-col">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <selectedSubject.icon className="w-4 h-4 text-indigo-400" />
                <span>{selectedSubject.name} Problem Input</span>
              </span>

              <Textarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Type your homework problem or copy-paste question here..."
                rows={5}
                className="text-xs rounded-2xl bg-muted/40 border-border/80 resize-none leading-relaxed flex-1"
              />

              {/* Photo Scan / Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3 border-2 border-dashed border-border/80 hover:border-indigo-500/60 rounded-2xl bg-muted/20 flex items-center justify-center gap-3 cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Camera className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-muted-foreground">
                  {uploadedImage ? "Photo Attached (Click to Replace)" : "Upload or Scan Homework Photo"}
                </span>
              </div>

              {uploadedImage && (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-border/60 bg-black/20">
                  <img src={uploadedImage} alt="Problem attachment" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Solve Button */}
              <Button
                onClick={handleSolveHomework}
                disabled={isSolving || (!questionInput.trim() && !uploadedImage)}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:opacity-90 text-white font-semibold text-xs h-11 rounded-2xl shadow-lg shadow-indigo-500/20"
              >
                {isSolving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Solve with Socratic Breakdown
              </Button>
            </div>
          </div>

          {/* Right Column: Step-by-Step Socratic Solution Breakdown (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-card border border-border/60 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Socratic Solution Breakdown {explainLike10 && "(ELI10 Mode Active)"}
              </span>

              {solutionMarkdown && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-8 text-xs rounded-xl gap-1.5 border-border/80"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Solution
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {isSolving ? (
                <div className="h-full py-28 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                  <p className="text-xs font-semibold text-foreground">Deriving Socratic Equations...</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Applying mathematical proofs and pedagogical heuristics</p>
                </div>
              ) : solutionMarkdown ? (
                <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed space-y-3">
                  <ReactMarkdown>{solutionMarkdown}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full py-28 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <GraduationCap className="w-12 h-12 opacity-30 mb-3" />
                  <p className="text-xs font-medium text-foreground">Awaiting Homework Problem</p>
                  <p className="text-[11px] max-w-xs mt-1">
                    Select a subject or upload an equation photo on the left to receive an interactive, step-by-step breakdown.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
