import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Bot,
  Layers,
  Send,
  Loader2,
  FileText,
  Presentation,
  Image as ImageIcon,
  Cable,
  HelpCircle,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

const STARTER_PROMPTS = [
  {
    title: "Explain Simply",
    icon: Sparkles,
    prompt: "Explain how artificial intelligence works like I am 10 years old with a fun analogy.",
    sampleResponse: "Imagine your brain is a giant library with millions of picture books. When you learn to spot a puppy, your brain looks through pictures of dogs and cats until it can easily spot pointy ears and wagging tails! AI works similarly: computers look through millions of examples to learn patterns so they can help you write, create, and solve problems!",
  },
  {
    title: "Travel Itinerary",
    icon: Zap,
    prompt: "Plan a relaxing 3-day weekend itinerary for Tokyo focusing on food and parks.",
    sampleResponse: "Here is your 3-Day Tokyo Itinerary:\n\n• Day 1 (Shinjuku & Meiji Shrine): Morning stroll through Yoyogi Park, visit the serene Meiji Jingu shrine, and enjoy authentic tonkotsu ramen in Shinjuku.\n• Day 2 (Asakusa & Ueno): Explore ancient Senso-ji temple, savor matcha soft-serve, then picnic in Ueno Park.\n• Day 3 (Ginza & Waterfront): Sample street delicacies at Tsukiji Outer Market and end with sunset views over Tokyo Bay!",
  },
  {
    title: "Productivity Plan",
    icon: FileText,
    prompt: "Give me 3 practical habits to stay focused while studying or working remotely.",
    sampleResponse: "Here are 3 high-impact focus habits:\n\n1. The 50/10 Rhythm: Work with zero distractions for 50 minutes, then stand up and step away from screens for 10 minutes.\n2. One Daily Priority: Write your single most critical objective on a sticky note before opening your inbox.\n3. Dedicated Workspace Boundary: Use a designated spot for deep work to cue your brain into immediate concentration mode.",
  },
];

interface BeginnerTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const BeginnerTutorialModal: React.FC<BeginnerTutorialModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(0);
  const [simulatedResponse, setSimulatedResponse] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addConversation, setCurrentConversationId } = useAppStore();

  const totalSteps = 5;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCustomPrompt(STARTER_PROMPTS[0].prompt);
      setActivePromptIndex(0);
      setSimulatedResponse(STARTER_PROMPTS[0].sampleResponse);
      setHasInteracted(true);
    }
  }, [isOpen]);

  const handleSelectPrompt = (index: number) => {
    setActivePromptIndex(index);
    setCustomPrompt(STARTER_PROMPTS[index].prompt);
    setIsGenerating(true);
    setSimulatedResponse("");
    setHasInteracted(true);

    setTimeout(() => {
      setSimulatedResponse(STARTER_PROMPTS[index].sampleResponse);
      setIsGenerating(false);
    }, 450);
  };

  const handleSendCustomPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setActivePromptIndex(null);
    setHasInteracted(true);
    setSimulatedResponse("");

    setTimeout(() => {
      setSimulatedResponse(
        `Great question! Here is a focused response to "${customPrompt.trim()}":\n\nKnow Deep AI processes your query across contextual neural reasoning nodes, synthesizing real-time facts and formatting clear, actionable steps. You can refine this anytime in your AI Chat workspace!`
      );
      setIsGenerating(false);
    }, 600);
  };

  const handleTakeToChat = () => {
    const convId = crypto.randomUUID();
    const title = customPrompt.slice(0, 36) || "My First Interaction";
    
    addConversation({
      id: convId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setCurrentConversationId(convId);
    
    // Store message in localStorage so Chat picks it up
    try {
      const messages = [
        {
          id: crypto.randomUUID(),
          sender: "user",
          text: customPrompt || STARTER_PROMPTS[0].prompt,
          timestamp: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: simulatedResponse || STARTER_PROMPTS[0].sampleResponse,
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem(`knowdeep_chat_messages_${convId}`, JSON.stringify(messages));
    } catch (err) {
      console.warn("Could not seed conversation:", err);
    }

    handleFinishTutorial();
    navigate("/chat");
    toast({
      title: "Conversation Saved",
      description: "Continued your first interaction in AI Chat!",
    });
  };

  const handleFinishTutorial = () => {
    try {
      if (user?.id) {
        localStorage.setItem(`tutorial_shown_${user.id}`, "true");
      }
      localStorage.setItem("knowdeep_beginner_tutorial_completed", "true");
      localStorage.setItem("onboarding_completed", "true");
    } catch (e) {
      console.warn("Could not save tutorial status:", e);
    }
    if (onComplete) onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-cyan-500/30">
                <img src={LOGO_URL} alt="Know Deep" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Beginner Guide
                </span>
                <h2 className="text-sm font-semibold text-white">
                  Step {currentStep + 1} of {totalSteps}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFinishTutorial}
                className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Skip Tutorial
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="w-full bg-slate-800/60 h-1">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
              initial={{ width: `${(currentStep / totalSteps) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Main Step Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* STEP 1: Workspace Overview */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="text-center max-w-md mx-auto space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Welcome to Know Deep AI
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Your complete intelligent suite for conversation, creative media, homework, document synthesis, and automated workflows.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
                      <Bot className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-semibold text-white">Universal AI Chat</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Adaptive reasoning, voice read-aloud, and persistent user memory.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-semibold text-white">15+ Creative Tools</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Presentations, document chat, live vision, and instant app generation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                      <Cable className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-semibold text-white">Connected Apps</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sync live tools, manage webhook keys, and delete connectors with safety confirmations.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-xs flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-ping" />
                  <span>
                    Navigation tip: Use the triple-line menu at top left to access conversation history anytime.
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 2: AI Engines Explained */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1 text-center max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-white">
                    Choose Your Neural Engine
                  </h3>
                  <p className="text-xs text-slate-300">
                    Know Deep offers dedicated model architectures tuned for speed, research, or complex code.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-cyan-500/30 flex items-start gap-3.5 relative overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Know Deep 2 Fast</span>
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
                            Default & Fast
                          </span>
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Ultra-low latency reasoning ideal for quick answers, translations, homework steps, and daily creative assistance.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-indigo-500/30 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white">Know Deep 2 Pro</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        High-capacity analytical intelligence for in-depth research, long essays, multi-page document synthesis, and intricate problem-solving.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-purple-500/30 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white">Know Deep 2.5 Pro Preview</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Next-generation flagship model with advanced algorithmic synthesis, software architecture, and full-stack coding capability.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  You can change models dynamically anytime using the Model Selector pill in the Chat header!
                </p>
              </motion.div>
            )}

            {/* STEP 3: Interactive Sandbox - First Interaction */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      Hands-On Sandbox
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Try Your First AI Interaction
                  </h3>
                  <p className="text-xs text-slate-300">
                    Pick a starter prompt below or enter your own question to test live AI responses right now!
                  </p>
                </div>

                {/* Prompt Starter Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {STARTER_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = activePromptIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPrompt(idx)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500 text-cyan-200 shadow-sm"
                            : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-semibold text-white">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {item.prompt}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Input Form */}
                <form onSubmit={handleSendCustomPrompt} className="relative">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-cyan-500 transition-colors">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ask anything or modify prompt..."
                      className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isGenerating || !customPrompt.trim()}
                      className="h-8 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Ask</span>
                          <Send className="w-3 h-3 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Live Simulated Response Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        Know Deep Assistant
                      </span>
                    </div>
                    {isGenerating && (
                      <span className="text-[10px] text-cyan-400 animate-pulse flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Thinking...
                      </span>
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="py-4 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                  ) : simulatedResponse ? (
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto pr-1">
                      {simulatedResponse}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">
                      Enter a question above or select a starter prompt to see response here!
                    </p>
                  )}

                  {simulatedResponse && !isGenerating && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> First interaction successful!
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleTakeToChat}
                        className="h-7 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-2"
                      >
                        Continue in Chat &rarr;
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Creative & Productivity Studios */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1 text-center max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-white">
                    Explore Dedicated Studios
                  </h3>
                  <p className="text-xs text-slate-300">
                    Beyond chatting, Know Deep equips you with specialized visual, document, and presentation studios.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Image Studio</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        High-fidelity prompt generation, photo enhancement, and multi-concept visual art.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Presentation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Presentation Studio</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Turn outlines into 5-slide polished presentations with PPTX export and live canvas editing.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Document Studio</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Chat directly with PDFs, extract notes, summarize key points, and draft essays.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                      <Cable className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Connectors & Memory</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Integrate Notion, Slack, and Google Drive, plus manage persistent AI memory facts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-xs text-center">
                  Quick Access: You can switch between all 15 tools anytime using the bottom navigation dock!
                </div>
              </motion.div>
            )}

            {/* STEP 5: Ready to Explore / Finish */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5 text-center py-2"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    You're All Set!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    You have successfully toured Know Deep AI and completed your first interaction.
                  </p>
                </div>

                <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Quick Pro Tips:
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px]">Enter</kbd> to send, and <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px]">Shift + Enter</kbd> for new line.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span>Open Global Settings from the gear icon to customize theme, voice read-aloud, and memory.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>Replay this tutorial anytime by clicking the Beginner Guide icon in the top header.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleFinishTutorial}
                    className="h-11 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/25 transition-all text-sm gap-2"
                  >
                    <span>Start Exploring Know Deep</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Navigation Buttons Bar */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-6 bg-cyan-400"
                      : idx < currentStep
                      ? "w-2 bg-cyan-600"
                      : "w-2 bg-slate-700"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 h-9 gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>
              )}

              {currentStep < totalSteps - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold h-9 px-4 gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleFinishTutorial}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold h-9 px-4 gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
