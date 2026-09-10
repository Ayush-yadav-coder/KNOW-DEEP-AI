import React from "react";
import { motion } from "framer-motion";
import { Sliders, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavDragDropCustomizer } from "./NavDragDropCustomizer";

interface CustomizeNavModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomizeNavModal: React.FC<CustomizeNavModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] bg-card text-card-foreground border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Customize Bottom Navigation</h2>
              <p className="text-xs text-muted-foreground">
                Reorder features across Row 1 and Row 2 with drag-and-drop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature List with Drag and Drop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <NavDragDropCustomizer onSaved={onClose} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-border bg-muted/40">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs h-9"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
