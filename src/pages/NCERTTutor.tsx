import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Send,
  Loader2,
  Sparkles,
  GraduationCap,
  BookMarked,
  Youtube,
  ExternalLink,
  Link2,
  Mic,
  MicOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useDailyMessageLimit } from "@/hooks/useDailyMessageLimit";
import { AttachmentButton, AttachmentPreview, type Attachment } from "@/components/AttachmentButton";
import { DailyLimitDialog } from "@/components/DailyLimitDialog";

interface Resource {
  title: string;
  url: string;
  type: "youtube" | "website";
}

const classes = [
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
];

const subjects = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "social-science", label: "Social Science" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "civics", label: "Civics" },
  { value: "economics", label: "Economics" },
];

export default function NCERTTutor() {
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSubject, setSelectedSubject] = useState("mathematics");
  const [question, setQuestion] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const dailyLimit = useDailyMessageLimit();
  const [response, setResponse] = useState("");
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  // Handle voice input transcript
  useEffect(() => {
    if (transcript) {
      setQuestion(prev => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast({ title: "Listening...", description: "Speak your question" });
    }
  };
  const generateResources = (topic: string, subject: string, classNum: string): Resource[] => {
    const encodedTopic = encodeURIComponent(`${topic} ${subject} class ${classNum} NCERT`);
    return [
      { title: `YouTube: ${topic} Explanation`, url: `https://www.youtube.com/results?search_query=${encodedTopic}`, type: "youtube" as const },
      { title: "BYJU'S Learning", url: `https://byjus.com/ncert-solutions-class-${classNum}-${subject.toLowerCase()}/`, type: "website" as const },
      { title: "Vedantu Solutions", url: `https://www.vedantu.com/ncert-solutions/ncert-solutions-class-${classNum}-${subject.toLowerCase()}`, type: "website" as const },
      { title: "Toppr Study", url: `https://www.toppr.com/guides/ncert-solutions/class-${classNum}/${subject.toLowerCase()}/`, type: "website" as const },
      { title: "NCERT Official", url: `https://ncert.nic.in/textbook.php`, type: "website" as const },
    ];
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      toast({
        title: "No question",
        description: "Please enter a question to ask.",
        variant: "destructive",
      });
      return;
    }
    if (!(await dailyLimit.tryConsume())) return;

    setIsLoading(true);
    try {
      const className = classes.find(c => c.value === selectedClass)?.label;
      const subjectName = subjects.find(s => s.value === selectedSubject)?.label;

      const prompt = `You are an expert NCERT tutor for ${className} ${subjectName} based on the NEW NCERT textbooks (2024-2025 edition) for India.
Help the student with the following question.
Provide detailed explanations with examples based on the latest NCERT curriculum.
Use markdown formatting for better readability.
At the end, suggest 3-5 related topics from the NCERT syllabus that the student should also study (format them as a bullet list under heading "## Related Topics").`;

      const apiResponse = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: question },
          ],
          systemPrompt: prompt,
        }),
      });

      if (!apiResponse.ok) {
        const text = await apiResponse.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json?.error || "Could not get response");
        } catch {
          throw new Error(text || "Could not get response");
        }
      }

      // Parse SSE stream
      const reader = apiResponse.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) result += content;
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      setResponse(result || "Could not generate response");
      
      // Extract related topics from response
      const topicsMatch = result.match(/## Related Topics\n([\s\S]*?)(?:\n##|$)/);
      if (topicsMatch) {
        const topics = topicsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map(line => line.replace(/^[-*]\s*/, '').trim())
          .filter(Boolean)
          .slice(0, 5);
        setRelatedTopics(topics);
      }
      
      // Generate resources based on question
      setResources(generateResources(question.slice(0, 50), subjectName || "subject", selectedClass));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout title="NCERT Tutor">
      <DailyLimitDialog open={dailyLimit.showUpgrade} onOpenChange={dailyLimit.setShowUpgrade} />
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white dark:from-background dark:via-background dark:to-background" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-400/30 dark:bg-red-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow-400/30 dark:bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-400/30 dark:bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/40 dark:bg-white/5 rounded-full blur-[80px]" />
      </div>

      <div className="min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-muted/30 backdrop-blur-xl border border-white/40 dark:border-border/50 mb-4">
              <BookMarked className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-foreground">NCERT Tutor</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Learn with NCERT
              </span>
            </h1>
            <p className="text-muted-foreground">
              Get expert help with NCERT curriculum for Classes 6-12
            </p>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-6 bg-white/50 dark:bg-muted/20 backdrop-blur-xl border border-white/40 dark:border-border/50 shadow-xl"
          >
            {/* Selectors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-white/60 dark:bg-muted/30 border-white/40 dark:border-border/50 backdrop-blur-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.value} value={cls.value}>
                        {cls.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="bg-white/60 dark:bg-muted/30 border-white/40 dark:border-border/50 backdrop-blur-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Question Input */}
            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-2 block">Your Question</label>
              <AttachmentPreview items={attachments} onRemove={(i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))} />
              <div className="relative">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask any question from your NCERT textbook or use voice input..."
                  className="min-h-[120px] resize-none bg-white/60 dark:bg-muted/30 border-white/40 dark:border-border/50 backdrop-blur-md pr-12 pl-12"
                />
                <div className="absolute left-1 top-1">
                  <AttachmentButton onAttach={(a) => setAttachments(prev => [...prev, a])} />
                </div>
                {isSupported && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoiceInput}
                    className={`absolute right-2 top-2 ${isListening ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
                    title={isListening ? "Stop listening" : "Use voice input"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                )}
              </div>
              {isListening && (
                <p className="text-xs text-amber-500 mt-1 animate-pulse">🎤 Listening... speak now</p>
              )}
            </div>

            {/* Ask Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handleAsk}
                disabled={isLoading || !question.trim()}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask Tutor
                  </>
                )}
              </Button>
            </div>

            {/* Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/60 dark:bg-muted/30 border border-white/40 dark:border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-foreground">NCERT Tutor</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
                
                {/* Learning Resources */}
                {resources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/30 dark:border-border/30">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <Link2 className="w-4 h-4 text-primary" />
                      Learning Resources
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-muted/20 hover:bg-white/60 dark:hover:bg-muted/40 transition-colors text-sm group"
                        >
                          {resource.type === "youtube" ? (
                            <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                          ) : (
                            <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                          <span className="truncate text-foreground group-hover:text-primary transition-colors">
                            {resource.title}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Quick Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold text-center mb-4 text-foreground">Popular Topics</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Quadratic Equations",
                "Chemical Reactions",
                "Photosynthesis",
                "Trigonometry",
                "Newton's Laws",
                "Indian Constitution",
                "World War II",
                "Climate Change",
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuestion(`Explain ${topic} in detail with examples.`)}
                  className="px-4 py-2 rounded-full bg-white/50 dark:bg-muted/20 backdrop-blur-md border border-white/40 dark:border-border/50 text-sm text-foreground hover:bg-white/70 dark:hover:bg-muted/40 transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
