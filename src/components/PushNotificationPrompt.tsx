import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PushNotificationPromptProps {
  onClose: () => void;
}

export const PushNotificationPrompt = ({ onClose }: PushNotificationPromptProps) => {
  const { toast } = useToast();

  const handleEnable = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // Show a test notification
          new Notification("Know Deep", {
            body: "You'll now receive updates about new features!",
            icon: "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png",
          });
          localStorage.setItem("notifications_enabled", "true");
          toast({ title: "Notifications enabled!" });
        } else {
          toast({ 
            title: "Notifications blocked", 
            description: "You can enable them later in your browser settings",
            variant: "destructive" 
          });
        }
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
    onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem("notifications_dismissed", "true");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
    >
      <div className="glass rounded-2xl p-4 shadow-lg border border-border/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Stay Updated!</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get notified about new features, updates, and AI improvements.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEnable} className="gradient-bg text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Enable
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Hook to check if we should show the prompt
export const usePushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const notificationsEnabled = localStorage.getItem("notifications_enabled");
    const notificationsDismissed = localStorage.getItem("notifications_dismissed");
    
    // Show prompt after 30 seconds if not already enabled or dismissed
    if (!notificationsEnabled && !notificationsDismissed && "Notification" in window) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  return { showPrompt, setShowPrompt };
};
