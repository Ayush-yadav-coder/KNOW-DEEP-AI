import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface KeyboardShortcutsProps {
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
}

export function useKeyboardShortcuts({
  onNewChat,
  onToggleSidebar,
  onFocusInput,
}: KeyboardShortcutsProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const activeElement = document.activeElement;
      const isInputFocused = 
        activeElement?.tagName === "INPUT" || 
        activeElement?.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement)?.isContentEditable;

      // Ctrl/Cmd + K - Focus search/input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onFocusInput?.();
        return;
      }

      // Ctrl/Cmd + N - New chat
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        onNewChat?.();
        toast({ title: "New chat created", duration: 2000 });
        return;
      }

      // Ctrl/Cmd + B - Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // Escape - Clear input or close modals
      if (e.key === "Escape" && isInputFocused) {
        (activeElement as HTMLElement)?.blur();
        return;
      }

      // Only handle navigation shortcuts when not typing
      if (!isInputFocused) {
        // G then C - Go to chat
        if (e.key === "c") {
          navigate("/chat");
          return;
        }
        // G then D - Go to dashboard
        if (e.key === "d") {
          navigate("/dashboard");
          return;
        }
        // G then I - Go to image generator
        if (e.key === "i") {
          navigate("/image-generator");
          return;
        }
        // ? - Show shortcuts help
        if (e.key === "?") {
          toast({
            title: "Keyboard Shortcuts",
            description: "Ctrl+K: Focus input | Ctrl+N: New chat | Ctrl+B: Toggle sidebar",
            duration: 5000,
          });
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onNewChat, onToggleSidebar, onFocusInput, toast]);
}

export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ["Ctrl", "K"], description: "Focus input" },
    { keys: ["Ctrl", "N"], description: "New chat" },
    { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
    { keys: ["?"], description: "Show shortcuts" },
    { keys: ["Esc"], description: "Clear focus" },
  ];

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-sm mb-3">Keyboard Shortcuts</h3>
      {shortcuts.map((shortcut, idx) => (
        <div key={idx} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{shortcut.description}</span>
          <div className="flex gap-1">
            {shortcut.keys.map((key, keyIdx) => (
              <kbd
                key={keyIdx}
                className="px-2 py-1 text-xs bg-muted rounded border border-border"
              >
                {key}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
