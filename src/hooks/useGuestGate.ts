import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const RESTRICTED_FEATURES = [
  "/image-generator",
  "/image-enhancer",
  "/document-chat",
  "/app-creator",
  "/homework-assistant",
  "/ncert-tutor",
];

export function isGuest() {
  return typeof window !== "undefined" && localStorage.getItem("guest_mode") === "true";
}

export function useGuestGate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const gate = (path?: string) => {
    if (user) return true;
    if (!isGuest()) return true;
    toast.error("Login or sign up to access these features for free.", {
      action: { label: "Sign in", onClick: () => navigate("/auth") },
    });
    return false;
  };

  return { gate, isGuest: !user && isGuest() };
}
