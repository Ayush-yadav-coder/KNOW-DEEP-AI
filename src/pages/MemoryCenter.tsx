import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, X, Trash2, Sparkles, User, Target, GraduationCap, Heart, Loader2 } from "lucide-react";
import { useUserMemory, type MemoryCategory } from "@/hooks/useUserMemory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const META: Record<MemoryCategory, { label: string; icon: React.ComponentType<{ className?: string }>; tint: string }> = {
  identity: { label: "Identity", icon: User, tint: "from-cyan-500/20 to-blue-500/10 border-cyan-300/30" },
  preferences: { label: "Preferences", icon: Heart, tint: "from-rose-500/20 to-pink-500/10 border-rose-300/30" },
  active_projects: { label: "Active Projects", icon: Target, tint: "from-amber-500/20 to-orange-500/10 border-amber-300/30" },
  learning_style: { label: "Learning Style", icon: GraduationCap, tint: "from-emerald-500/20 to-teal-500/10 border-emerald-300/30" },
  other: { label: "Other", icon: Sparkles, tint: "from-violet-500/20 to-purple-500/10 border-violet-300/30" },
};

export default function MemoryCenter() {
  const { items, loading, deleteFact, resetMemory } = useUserMemory();

  const grouped = (Object.keys(META) as MemoryCategory[]).map((c) => ({
    category: c,
    items: items.filter((i) => i.category === c),
  }));

  return (
    <AppLayout title="Memory Center">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="rounded-3xl p-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">My Brain</h1>
                <p className="text-sm text-white/60">Personal facts Know Deep remembers across sessions.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="rounded-xl" disabled={!items.length}>
                    <Trash2 className="w-4 h-4 mr-1.5" /> Reset Memory
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all memory?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes every personalization fact. Know Deep will start fresh.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetMemory}>Yes, clear</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-10 text-center bg-slate-900/60 backdrop-blur-xl border border-white/10">
            <Sparkles className="w-10 h-10 mx-auto text-cyan-300 mb-3" />
            <p className="text-white/80 font-medium">No memories yet</p>
            <p className="text-sm text-white/50 mt-1">
              Chat naturally — Know Deep will remember names, preferences, and projects you mention.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ category, items: rows }) => {
              if (!rows.length) return null;
              const m = META[category];
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 bg-gradient-to-br ${m.tint} backdrop-blur-md border`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <m.icon className="w-4 h-4 text-white" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">{m.label}</h2>
                    <span className="text-xs text-white/50">({rows.length})</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {rows.map((r) => (
                      <div
                        key={r.id}
                        className="group flex items-start gap-2 p-3 rounded-xl bg-slate-950/40 border border-white/10 hover:border-white/30 transition-colors"
                      >
                        <p className="flex-1 text-sm text-white/90 leading-snug">{r.fact_text}</p>
                        <button
                          onClick={() => deleteFact(r.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/20 text-white/60 hover:text-destructive transition-all"
                          aria-label="Forget this"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
