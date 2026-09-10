import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Camera,
  Presentation,
  Newspaper,
  GraduationCap,
} from "lucide-react";
import { z } from "zod";
import { PolicyLinks } from "@/components/PolicyLinks";

const LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const FLAGSHIP_FEATURES = [
  {
    icon: Sparkles,
    title: "AI Chat with Memory & Voice",
    desc: "Universal conversational intelligence with persistent memory facts and real-time voice synthesis.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: Camera,
    title: "Live Mode & Circle-to-Search",
    desc: "Interactive rear camera vision to circle, scan, identify, and understand any object or math problem in real-time.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Presentation,
    title: "Presentation Studio",
    desc: "Prompt-to-Deck PPTX and slide generation with customizable themes, live canvas editor, and instant download.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Newspaper,
    title: "Real-Time News Engine",
    desc: "Multi-category briefings, Dive Deep analytics, ELI5 toggles, and AI spoken audio summaries.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: GraduationCap,
    title: "NCERT & Homework Assistant",
    desc: "Step-by-step KaTeX mathematical derivations, textbook exercises keys, and 3-question mastery quizzes.",
    color: "from-purple-400 to-indigo-500",
  },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carousel cycle index (3-second interval)
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { user, setIsGuest } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  // 3-second auto-cycling feature reel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % FLAGSHIP_FEATURES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
    setGoogleLoading(false);
  };

  const handleGitHub = async () => {
    setError(null);
    setGithubLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message || "Failed to initiate GitHub sign-in");
    } finally {
      setGithubLoading(false);
    }
  };

  const handleForgot = async () => {
    setError(null);
    try {
      emailSchema.parse(email);
    } catch {
      setError("Please enter your email above to receive the password reset link.");
      return;
    }
    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      setForgotSent(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setIsGuest(false);
          navigate("/chat");
        }
      } else {
        const { error } = await signUp(email, password, displayName || undefined);
        if (error) {
          setError(error.message);
        } else {
          setIsGuest(false);
          navigate("/chat");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    setIsGuest(true);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT PANEL: Authentication Workspace */}
      <div className="flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-8 sm:py-12 z-10">
        <div>
          {/* Brand Emblem */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20 border border-cyan-500/30">
              <img src={LOGO_URL} alt="Know Deep AI" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight text-white flex flex-col items-center gap-1">
                <span>Know Deep AI</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Next-Gen Collaborative AI Workspace</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="max-w-md w-full mx-auto">
            {/* Tabbed Auth Toggle */}
            <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  isLogin
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  !isLogin
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isLogin ? "Welcome back" : "Get started with Know Deep"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isLogin
                  ? "Access your unified 15-tool AI suite, memory, and personal workspaces."
                  : "Create an account to persist conversations, custom models, and notes."}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {forgotSent && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs"
              >
                Password reset email sent! Check your inbox.
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-xs font-medium text-slate-300">
                    Your Name / Workspace Handle
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="e.g. Alex"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 h-10 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                    Password
                  </Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={handleForgot}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 h-10 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-xs text-slate-400">Remember Me Always</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all group"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In to Workspace" : "Create My Account"}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-950 px-3 text-slate-500 uppercase tracking-wider font-medium">
                  or continue with
                </span>
              </div>
            </div>

            {/* OAuth Provider Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="h-10 bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-medium"
              >
                {googleLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGitHub}
                disabled={githubLoading}
                className="h-10 bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-medium"
              >
                {githubLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span>GitHub</span>
              </Button>
            </div>

            {/* Use as Guest Option */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGuestEntry}
                className="w-full h-11 rounded-xl bg-slate-900/90 border-slate-800 hover:bg-slate-800/90 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
              >
                <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Use as Guest</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  — Explore all 15 AI Tools
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-md w-full mx-auto mt-8 pt-6 border-t border-slate-900 text-center">
          <PolicyLinks className="text-[11px] text-slate-500 justify-center" />
        </div>
      </div>

      {/* RIGHT PANEL: Interactive Motion Canvas */}
      <div className="hidden lg:flex flex-col items-center justify-center relative p-12 bg-slate-900/90 backdrop-blur-xl border-l border-slate-800 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none -top-24 -right-24 animate-pulse [animation-duration:8s]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none -bottom-20 -left-20 animate-pulse [animation-duration:6s]" />

        <div className="relative z-10 max-w-lg w-full flex flex-col items-center text-center">
          {/* Animated Logo Showcase */}
          <div className="relative mb-10 flex items-center justify-center">
            {/* Vector Path Movement: Framer motion horizontal vector swing locking to center */}
            <motion.div
              initial={{ x: -140, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative"
            >
              {/* Rotating Rainbow Glow Ring using conic-gradient */}
              <motion.div
                className="absolute -inset-3 rounded-full [animation-duration:5s] animate-spin"
                style={{
                  background:
                    "conic-gradient(#22D3EE, #EC4899, #8B5CF6, #3B82F6, #22D3EE)",
                  filter: "blur(6px)",
                  opacity: 0.85,
                }}
              />
              <div className="relative w-28 h-28 rounded-3xl p-1.5 bg-slate-950/80 backdrop-blur-md shadow-2xl border border-slate-700/60 flex items-center justify-center">
                <img
                  src={LOGO_URL}
                  alt="Know Deep AI Emblem"
                  className="w-full h-full object-cover rounded-2xl shadow-inner"
                />
              </div>
            </motion.div>
          </div>

          <h3 className="text-2xl font-bold text-white tracking-tight">
            Know Deep AI Ecosystem
          </h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            Empowering students, researchers, developers, and creators with a unified suite of specialized neural agents.
          </p>

          {/* Auto-Cycling Feature Reel (3-second interval) */}
          <div className="w-full mt-10">
            <div className="min-h-[140px] p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl shadow-xl relative overflow-hidden text-left">
              <AnimatePresence mode="wait">
                {(() => {
                  const feature = FLAGSHIP_FEATURES[currentFeatureIndex];
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={currentFeatureIndex}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35 }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-md`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                            Flagship Capability {currentFeatureIndex + 1}/5
                          </span>
                          <h4 className="text-sm font-semibold text-white">
                            {feature.title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pl-12">
                        {feature.desc}
                      </p>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mt-4 pl-12">
                {FLAGSHIP_FEATURES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentFeatureIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentFeatureIndex
                        ? "w-6 bg-cyan-400"
                        : "w-2 bg-slate-700 hover:bg-slate-600"
                    }`}
                    aria-label={`Show capability ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enterprise AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Gemini 2.5 Flash Speed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
