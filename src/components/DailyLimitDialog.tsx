import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyLimitDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-2xl bg-white/80 dark:bg-card/80 border-white/40 dark:border-border/60">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center mb-3 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            You've reached today's free limit
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've used all <strong>15 free messages</strong> on{" "}
            <span className="font-semibold text-foreground">Know Deep 2.5 Pro Preview</span> today.
            Upgrade to keep the conversation flowing with unlimited access, premium models, and priority speed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 my-2">
          <div className="rounded-xl p-3 bg-gradient-to-br from-primary/10 to-accent/10 border border-white/30 dark:border-border/50">
            <Sparkles className="w-5 h-5 text-primary mb-1" />
            <p className="text-sm font-semibold">Unlimited messages</p>
            <p className="text-xs text-muted-foreground">No daily caps</p>
          </div>
          <div className="rounded-xl p-3 bg-gradient-to-br from-accent/10 to-primary/10 border border-white/30 dark:border-border/50">
            <Zap className="w-5 h-5 text-amber-500 mb-1" />
            <p className="text-sm font-semibold">Priority speed</p>
            <p className="text-xs text-muted-foreground">No 7-sec wait</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate("/pricing");
            }}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            See Upgrade Plans
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
