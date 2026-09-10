import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  id: string;
  label: string;
  query: string;
}

interface ExplorationBreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
  onClear: () => void;
}

export function ExplorationBreadcrumbs({ items, onNavigate, onClear }: ExplorationBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 px-4 py-2 bg-muted/30 backdrop-blur-sm border-b border-border/50 overflow-x-auto"
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs flex-shrink-0"
        onClick={onClear}
        title="Clear exploration path"
      >
        <Home className="w-3.5 h-3.5" />
      </Button>

      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(item)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex-shrink-0 max-w-[150px] truncate ${
              index === items.length - 1
                ? "bg-primary/20 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={item.label}
          >
            {item.label}
          </motion.button>
        </React.Fragment>
      ))}

      {items.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-auto flex-shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onClear}
          title="Clear path"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </motion.div>
  );
}
