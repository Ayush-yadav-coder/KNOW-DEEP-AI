import { useRef, useState } from "react";
import { Plus, Paperclip, X, ImagePlus, Camera as CameraIcon, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Attachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  isImage: boolean;
}

interface Props {
  onAttach: (att: Attachment) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export function AttachmentButton({ onAttach, disabled, className }: Props) {
  const photosRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFiles = async (list: FileList | null) => {
    if (!list || !list.length) return;
    setLoading(true);
    try {
      for (const file of Array.from(list)) {
        if (file.size > MAX_SIZE) {
          toast({ title: `${file.name} is too large`, description: "Maximum size is 8 MB per file.", variant: "destructive" });
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        onAttach({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          isImage: file.type.startsWith("image/"),
        });
      }
      setOpen(false);
    } catch {
      toast({ title: "Upload failed", description: "Could not read file.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const tiles = [
    { icon: ImagePlus, label: "Photos", onClick: () => photosRef.current?.click() },
    { icon: CameraIcon, label: "Camera", onClick: () => cameraRef.current?.click() },
    { icon: FileText, label: "Files", onClick: () => filesRef.current?.click() },
  ];

  return (
    <>
      <input ref={photosRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <input ref={filesRef} type="file" multiple accept=".pdf,.txt,.md,.docx,.json,.csv,.doc,.xlsx,.pptx" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || loading}
        onClick={() => setOpen(true)}
        className={cn("rounded-xl text-muted-foreground hover:text-foreground", className)}
        title="Attach"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm p-6 bg-slate-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="grid grid-cols-3 gap-3">
            {tiles.map((t, i) => (
              <motion.button
                key={t.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={t.onClick}
                className="flex flex-col items-center justify-center gap-2 aspect-square rounded-3xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-cyan-300/30 transition-colors"
              >
                <t.icon className="w-7 h-7 text-cyan-300/90" strokeWidth={1.5} />
                <span className="text-sm text-white/90 font-medium">{t.label}</span>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AttachmentPreview({ items, onRemove }: { items: Attachment[]; onRemove: (i: number) => void }) {
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2 mb-2 overflow-hidden"
        >
          <AnimatePresence>
            {items.map((a, i) => (
              <motion.div
                key={a.dataUrl + i}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="relative group"
              >
                {a.isImage ? (
                  <img src={a.dataUrl} alt={a.name} className="w-16 h-16 rounded-xl object-cover border border-white/20 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/80 dark:bg-muted/60 border border-white/20 flex flex-col items-center justify-center px-1">
                    <Paperclip className="w-4 h-4 text-muted-foreground mb-1" />
                    <span className="text-[9px] truncate w-full text-center text-muted-foreground">{a.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 hover:bg-destructive text-white flex items-center justify-center shadow-lg border border-white/20"
                  aria-label="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
