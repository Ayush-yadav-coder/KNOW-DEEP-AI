import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { AIOrb } from "./AIOrb";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
export const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleExplore = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white dark:from-background dark:via-background dark:to-background" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-400/30 dark:bg-red-500/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow-400/30 dark:bg-yellow-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-400/30 dark:bg-blue-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/50 dark:bg-white/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-40 right-10 w-56 h-56 bg-red-300/20 dark:bg-red-400/10 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 bg-white/60 dark:bg-muted/30 backdrop-blur-xl border border-white/40 dark:border-border/50"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Next-Gen AI Platform</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-3 justify-center lg:justify-start mb-4"
            >
              <span className="text-2xl font-bold gradient-text">Welcome to Know Deep</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">One AI to</span>
              <br />
              <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">Rule Them All</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Know Deep combines the power of ChatGPT, Gemini, Perplexity, Copilot, and more into one seamless, intelligent experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {!user && (
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="relative rounded-xl ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                >
                  <Button 
                    onClick={() => {
                      localStorage.setItem("guest_mode", "true");
                      navigate("/chat");
                    }}
                    className="group px-8 py-4 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg w-full"
                  >
                    Use as Guest
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
              {user && (
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="relative rounded-xl ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                >
                  <Button 
                    onClick={() => navigate("/chat")}
                    className="group px-8 py-4 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg w-full"
                  >
                    Go to Workspace
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
              {!user && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="px-8 py-4 text-lg bg-white/60 dark:bg-muted/30 backdrop-blur-xl border border-white/40 dark:border-border/50 hover:bg-white/80 dark:hover:bg-muted/50 w-full sm:w-auto"
                >
                  Login / Sign Up
                </Button>
              )}
            </motion.div>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/60 dark:bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground backdrop-blur-md"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-foreground font-semibold">10M+</span>
                <span className="text-muted-foreground"> users worldwide</span>
              </div>
            </motion.div>
          </motion.div>

          {/* AI Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex-1 flex justify-center"
          >
            <AIOrb />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
