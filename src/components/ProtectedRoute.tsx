import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const LOGO_URL =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/FN6sASA1kTY9IsG0R9ZwEQgNbgB3/uploads/1768310383370-Gemini_Generated_Image_ajubtsajubtsajub.png";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isGuest } = useAppStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse -bottom-20 -right-20 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative flex flex-col items-center p-8 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800 shadow-2xl z-10"
        >
          <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
            {/* Spinning rainbow glow ring */}
            <div
              className="absolute inset-0 rounded-full animate-spin [animation-duration:3s]"
              style={{
                background:
                  "conic-gradient(#22D3EE, #EC4899, #8B5CF6, #3B82F6, #22D3EE)",
                padding: "3px",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            <img
              src={LOGO_URL}
              alt="Know Deep AI"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg relative z-10"
            />
          </div>

          <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>Know Deep AI</span>
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin [animation-duration:6s]" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Loading your neural workspace...
          </p>

          <div className="w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-6">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // If not logged in and not in guest mode, redirect to /login
  if (!user && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
