import { useState } from "react";
import { MessageSquare, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { z } from "zod";

// Validation schema for feedback
const feedbackSchema = z.object({
  email: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message must be less than 2000 characters")
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      "Invalid characters detected"
    ),
});

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleSubmit = async () => {
    // Validate input with zod
    const validationResult = feedbackSchema.safeParse({
      email: email || undefined,
      message: message.trim(),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize message - strip potentially harmful content
      const sanitizedMessage = message.trim().slice(0, 2000);
      const sanitizedEmail = email ? email.trim().slice(0, 255) : null;

      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id || null,
        email: sanitizedEmail || user?.email || null,
        message: sanitizedMessage,
        page: location.pathname.slice(0, 255), // Limit path length
      });

      if (error) throw error;

      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback. We appreciate it!",
      });
      
      setMessage("");
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      // Log error server-side only, don't expose details to user
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Send Feedback
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {!user && (
            <div className="space-y-2">
              <Input
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
          )}
          <Textarea
            placeholder="Tell us what you think, report a bug, or suggest a feature..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] rounded-xl resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="rounded-xl gradient-bg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
