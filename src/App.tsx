import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SharedConversation from "./pages/SharedConversation";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FeedbackButton } from "@/components/FeedbackButton";
import { OfflinePage } from "@/components/OfflinePage";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ImageGenerator from "./pages/ImageGenerator";
import ImageEnhancer from "./pages/ImageEnhancer";
import Summarizer from "./pages/Summarizer";
import NewsFeed from "./pages/NewsFeed";
import AppCreator from "./pages/AppCreator";
import Gallery from "./pages/Gallery";
import Projects from "./pages/Projects";
import WebSearch from "./pages/WebSearch";
import CodeInterpreter from "./pages/CodeInterpreter";
import VoiceAssistant from "./pages/VoiceAssistant";
import DocumentChat from "./pages/DocumentChat";
import DocumentStudio from "./pages/DocumentStudio";
import HomeworkAssistant from "./pages/HomeworkAssistant";
import Settings from "./pages/Settings";
import LearningHub from "./pages/LearningHub";
import Translator from "./pages/Translator";
import TranslateStudio from "./pages/TranslateStudio";
import Pricing from "./pages/Pricing";
import NCERTTutor from "./pages/NCERTTutor";
import SportsHub from "./pages/SportsHub";
import WeatherStation from "./pages/WeatherStation";
import PresentationStudio from "./pages/PresentationStudio";
import CodeStudio from "./pages/CodeStudio";
import MyGeneratedApps from "./pages/MyGeneratedApps";
import LiveMode from "./pages/LiveMode";
import Dashboard from "./pages/Dashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConceptXRay from "./pages/ConceptXRay";
import MemoryCenter from "./pages/MemoryCenter";

const queryClient = new QueryClient();

const AppContent = () => {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/image-generator" element={<ImageGenerator />} />
        <Route path="/generate" element={<ImageGenerator />} />
        <Route path="/image-enhancer" element={<ImageEnhancer />} />
        <Route path="/enhance" element={<ImageEnhancer />} />
        <Route path="/summarizer" element={<Summarizer />} />
        <Route path="/image-summarizer" element={<Summarizer />} />
        <Route path="/news" element={<NewsFeed />} />
        <Route path="/news-feed" element={<NewsFeed />} />
        <Route path="/sports" element={<SportsHub />} />
        <Route path="/sports-hub" element={<SportsHub />} />
        <Route path="/weather" element={<WeatherStation />} />
        <Route path="/weather-station" element={<WeatherStation />} />
        <Route path="/app-creator" element={<AppCreator />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/web-search" element={<WebSearch />} />
        <Route path="/search" element={<WebSearch />} />
        <Route path="/code-interpreter" element={<CodeStudio />} />
        <Route path="/code-studio" element={<CodeStudio />} />
        <Route path="/code" element={<CodeStudio />} />
        <Route path="/voice-assistant" element={<VoiceAssistant />} />
        <Route path="/document-chat" element={<DocumentStudio />} />
        <Route path="/document-studio" element={<DocumentStudio />} />
        <Route path="/documents" element={<DocumentStudio />} />
        <Route path="/presentation" element={<PresentationStudio />} />
        <Route path="/presentation-studio" element={<PresentationStudio />} />
        <Route path="/homework-assistant" element={<HomeworkAssistant />} />
        <Route path="/homework" element={<HomeworkAssistant />} />
        <Route path="/learning-hub" element={<LearningHub />} />
        <Route path="/learn" element={<LearningHub />} />
        <Route path="/translator" element={<TranslateStudio />} />
        <Route path="/translate-studio" element={<TranslateStudio />} />
        <Route path="/translate" element={<TranslateStudio />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/ncert-tutor" element={<NCERTTutor />} />
        <Route path="/ncert" element={<NCERTTutor />} />
        <Route path="/my-apps" element={<MyGeneratedApps />} />
        <Route path="/live-mode" element={<LiveMode />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/concept-xray" element={<ConceptXRay />} />
        <Route path="/memory" element={<MemoryCenter />} />
        <Route path="/shared/:token" element={<SharedConversation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FeedbackButton />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
