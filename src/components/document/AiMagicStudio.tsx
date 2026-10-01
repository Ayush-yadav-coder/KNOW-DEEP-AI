import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  FileText,
  Send,
  Loader2,
  Copy,
  Check,
  PlusCircle,
  Volume2,
  ShieldCheck,
  TrendingUp,
  Globe,
  Briefcase,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { KnowDeepBadge } from "@/components/KnowDeepBadge";

export interface MagicQaMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AiMagicStudioProps {
  documentTitle: string;
  fullDocumentText: string;
  onInsertIntoDoc: (text: string, type?: "h1" | "h2" | "h3" | "p" | "bullet") => void;
  onApplyExecutiveSummary: (summaryText: string) => void;
}

export const AiMagicStudio: React.FC<AiMagicStudioProps> = ({
  documentTitle,
  fullDocumentText,
  onInsertIntoDoc,
  onApplyExecutiveSummary,
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<MagicQaMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: `Hello! I'm your **Canva-Grade AI Co-Author & Document Architect**. I have fully parsed **"${documentTitle || "your document"}"**.\n\nYou can ask me deep questions, generate executive summaries, perform risk audits, or ask me to draft new sections that you can insert into your live canvas with a single click.`,
      timestamp: "Just now",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  const guidedWorkflows = [
    {
      id: "exec-summary",
      title: "Executive Briefing",
      kicker: "Board-Level Summary",
      icon: Briefcase,
      color: "from-blue-500/20 to-cyan-500/20 text-cyan-500 border-cyan-500/30",
      prompt: `Generate a high-impact, board-level Executive Briefing for "${documentTitle}". Structure with: 1. Core Strategic Vision, 2. Key Value Pillars, 3. Milestones & Timelines, 4. Strategic Recommendations.`,
    },
    {
      id: "risk-audit",
      title: "Risk & Logic Audit",
      kicker: "Critical Review",
      icon: ShieldCheck,
      color: "from-rose-500/20 to-amber-500/20 text-rose-500 border-rose-500/30",
      prompt: `Audit the document "${documentTitle}" for potential business risks, unaddressed challenges, logical inconsistencies, and missing compliance safeguards.`,
    },
    {
      id: "action-items",
      title: "Action Item Matrix",
      kicker: "Operational Plan",
      icon: TrendingUp,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
      prompt: `Extract an actionable Next Steps Matrix from "${documentTitle}" detailing deliverables, ownership recommendations, and expected outcomes.`,
    },
    {
      id: "pitch-deck",
      title: "Investor Pitch Angle",
      kicker: "C-Suite Narrative",
      icon: Lightbulb,
      color: "from-purple-500/20 to-pink-500/20 text-purple-500 border-purple-500/30",
      prompt: `Transform the insights of "${documentTitle}" into an investor-ready 5-point narrative highlighting market opportunity, unfair advantage, and return on investment.`,
    },
  ];

  const handleExecutePrompt = async (promptText: string) => {
    if (!promptText.trim() || isAiThinking) return;

    const userMsg: MagicQaMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsAiThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a world-class Document Architect and Executive Co-Author. The user is collaborating with you on a document titled "${documentTitle}".
Document Content:
"""
${fullDocumentText.slice(0, 15000)}
"""
Provide clear, structured, beautifully formatted markdown advice, executive drafts, or direct answers. Always be concrete and actionable.`,
            },
            ...messages.slice(-6).map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            {
              role: "user",
              content: promptText,
            },
          ],
        }),
      });

      const data = await response.json();
      const aiReply = data.content || "I have analyzed your request based on the document.";

      const aiMsg: MagicQaMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast({
        title: "AI Response Error",
        description: "Could not generate response. Please retry.",
        variant: "destructive",
      });
    } finally {
      setIsAiThinking(false);
      setActiveWorkflow(null);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to Clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Canva-Grade Magic Studio Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-widest">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </span>
              KnowDeep Document Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              KnowDeep Document Architect
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Transform raw drafts into executive briefings, audit strategic risks, or command the AI to craft and insert high-impact sections directly into your document canvas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              onClick={() => handleExecutePrompt(`Draft a concise 1-page executive summary of "${documentTitle}" with high-impact bullet points and strategic recommendations.`)}
              disabled={isAiThinking}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              Auto-Briefing
            </Button>
          </div>
        </div>
      </div>

      {/* Guided Workflow Cards (Canva-Inspired Direct Actions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Guided AI Workflows & One-Click Audits
          </p>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
            4 Instant Commands
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {guidedWorkflows.map((flow) => {
            const Icon = flow.icon;
            const isCurrent = activeWorkflow === flow.id;

            return (
              <button
                key={flow.id}
                type="button"
                onClick={() => {
                  setActiveWorkflow(flow.id);
                  handleExecutePrompt(flow.prompt);
                }}
                disabled={isAiThinking}
                className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between group cursor-pointer bg-card/80 hover:bg-card hover:border-cyan-500/60 hover:shadow-lg shadow-xs ${
                  isCurrent ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-border/60"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center bg-gradient-to-br ${flow.color}`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {flow.kicker}
                    </span>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                      {flow.title}
                    </h3>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Chat Dialogue with 1-Click Canvas Insertion */}
      <div className="glass rounded-3xl border border-border/60 bg-card/90 shadow-xl overflow-hidden flex flex-col min-h-[520px]">
        <div className="p-4 px-6 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <KnowDeepBadge
            assistantName="KnowDeep Document Architect"
            studioBadge="Document AI"
            size="sm"
            showAura={true}
          />
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {messages.length} messages
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[540px]">
          {messages.map((m) => {
            const isAi = m.sender === "ai";

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isAi ? "items-start" : "items-start justify-end"}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                    isAi
                      ? "bg-muted/40 border border-border/60 text-foreground"
                      : "bg-cyan-600 text-white rounded-tr-xs"
                  }`}
                >
                  <div className="prose prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>

                  {/* AI Message Action Toolbar */}
                  {isAi && m.id !== "welcome-1" && (
                    <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedId === m.id ? "Copied" : "Copy"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onInsertIntoDoc(m.text, "p");
                          toast({
                            title: "Inserted to Document",
                            description: "Content appended directly to your live document canvas.",
                          });
                        }}
                        className="h-7 px-2.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-lg gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Insert into Document
                      </Button>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isAiThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                <span>Analyzing document context and synthesizing response...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border/40 bg-muted/10 space-y-2">
          {/* Quick Prompts Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider shrink-0">
              Suggestions:
            </span>
            {[
              "Draft an Executive Abstract",
              "Check for passive voice & clarify",
              "Create 5 discussion questions for stakeholders",
              "Translate key takeaways to Spanish",
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleExecutePrompt(s)}
                disabled={isAiThinking}
                className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium border border-border/40 shrink-0 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecutePrompt(inputPrompt);
            }}
            className="flex items-center gap-2"
          >
            <Textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything about this document, request rewrites, or command new sections..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleExecutePrompt(inputPrompt);
                }
              }}
              className="min-h-[44px] max-h-32 text-xs sm:text-sm bg-background border-border/60 rounded-xl resize-none py-3"
            />
            <Button
              type="submit"
              disabled={isAiThinking || !inputPrompt.trim()}
              className="h-11 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-1.5 shrink-0 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              {isAiThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
