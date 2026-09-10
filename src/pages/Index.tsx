import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { CapabilityShowcase } from "@/components/CapabilityShowcase";
import { ChatSection } from "@/components/ChatSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { PushNotificationPrompt, usePushNotificationPrompt } from "@/components/PushNotificationPrompt";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { showPrompt, setShowPrompt } = usePushNotificationPrompt();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users to chat unless they explicitly enabled the hero page
    if (!loading && user) {
      const showHero = localStorage.getItem("show_hero_page") === "true";
      if (!showHero) {
        navigate("/chat", { replace: true });
        return;
      }
    }
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (!onboardingCompleted) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);


  return (
    <div className="min-h-screen bg-background relative">
      {/* Mesh Gradient Background - Fixed */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white dark:from-background dark:via-background dark:to-background" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-400/25 dark:bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow-400/25 dark:bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-400/25 dark:bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/40 dark:bg-white/5 rounded-full blur-[100px]" />
      </div>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CapabilityShowcase />
        <ChatSection />
        <PricingSection />
      </main>
      <Footer />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      {/* Push Notification Prompt */}
      <AnimatePresence>
        {showPrompt && !showOnboarding && (
          <PushNotificationPrompt onClose={() => setShowPrompt(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
