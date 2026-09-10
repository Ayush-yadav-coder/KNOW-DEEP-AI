import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageSquare, 
  Image, 
  Mic, 
  Globe, 
  FileText, 
  Sparkles, 
  Code2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    icon: Sparkles,
    title: "Welcome to Know Deep!",
    description: "Your all-in-one AI companion for learning, creating, and exploring. Let's take a quick tour of the powerful features available to you.",
    color: "from-primary to-secondary",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "Have intelligent conversations with our advanced AI. Ask questions, get help with homework, brainstorm ideas, or just chat about anything!",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "Web Search",
    description: "Search the web with AI-powered insights. Get summarized results, relevant information, and save your search history for later.",
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Create stunning AI-generated images from text descriptions. Perfect for creative projects, presentations, and more.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Mic,
    title: "Voice Assistant & Live Mode",
    description: "Talk naturally with AI using voice commands. Live Mode offers real-time conversations with camera support on mobile!",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: FileText,
    title: "Document Chat & Summarizer",
    description: "Upload documents and chat with them! Get summaries, ask questions, and extract key information from PDFs and more.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Code2,
    title: "Code Interpreter & App Creator",
    description: "Write, run, and debug code with AI assistance. Create full applications with our AI-powered App Creator!",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Rocket,
    title: "You're All Set!",
    description: "Explore all features from the bottom navigation. Upgrade to Pro for faster responses and deeper AI analysis. Enjoy Know Deep!",
    color: "from-amber-500 to-orange-500",
  },
];

export const OnboardingTutorial = ({ isOpen, onClose }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    onClose();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={cn(
              "w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br flex items-center justify-center",
              step.color
            )}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-3">{step.title}</h2>

          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {tutorialSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentStep
                    ? "bg-primary w-6"
                    : idx < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-4">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            <Button onClick={handleNext} className="gradient-bg text-primary-foreground gap-2 min-w-32">
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          {currentStep < tutorialSteps.length - 1 && (
            <button
              onClick={handleSkip}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Skip tutorial
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
