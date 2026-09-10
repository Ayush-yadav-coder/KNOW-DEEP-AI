import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type WorkspaceKind = "sports" | "weather" | "presentation";

const workspaceCopy: Record<WorkspaceKind, { title: string; description: string; placeholder: string; prompt: string }> = {
  sports: {
    title: "Sports Hub",
    description: "Get clear, current sports context, match breakdowns, and training insights.",
    placeholder: "Ask about a team, match, player, or tournament...",
    prompt: "You are Sports Hub. Give accurate, concise sports analysis and clearly distinguish known facts from predictions.",
  },
  weather: {
    title: "Weather Station",
    description: "Explore weather conditions, forecasts, and practical planning guidance.",
    placeholder: "Enter a city and ask about its weather...",
    prompt: "You are Weather Station. Give useful weather guidance, state when live data is unavailable, and avoid inventing current conditions.",
  },
  presentation: {
    title: "Presentation Studio",
    description: "Turn an idea into a polished presentation structure with speaker-ready detail.",
    placeholder: "Describe the topic, audience, and desired length...",
    prompt: "You are Presentation Studio. Create a structured presentation outline with slide titles, key points, and speaker notes.",
  },
};

export default function FeatureWorkspace({ kind }: { kind: WorkspaceKind }) {
  const copy = workspaceCopy[kind];
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runWorkspace = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [{ role: "user", content: `${copy.prompt}\n\n${input.trim()}` }],
          feature: kind,
        },
      });
      if (error) throw error;
      const content = data?.content || data?.message || data?.response || "No response was returned.";
      setResult(content);
    } catch (error) {
      console.error(`Failed to run ${copy.title}:`, error);
      toast({ title: "Could not complete request", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title={copy.title}>
      <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="mb-2 text-sm font-medium text-primary">Know Deep workspace</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{copy.title}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{copy.description}</p>
          </motion.div>

          <div className="glass rounded-2xl border border-border/50 p-4 shadow-lg md:p-6">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.placeholder}
              className="min-h-36 resize-y border-0 bg-transparent text-base focus-visible:ring-0"
              disabled={loading}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={runWorkspace} disabled={!input.trim() || loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Working..." : "Run workspace"}
              </Button>
            </div>
          </div>

          {result && (
            <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="prose prose-slate dark:prose-invert mt-6 max-w-none rounded-2xl border border-border/50 bg-card/70 p-5 md:p-7">
              <ReactMarkdown>{result}</ReactMarkdown>
            </motion.article>
          )}
        </div>
      </section>
    </AppLayout>
  );
}