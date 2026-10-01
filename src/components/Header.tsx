import { motion } from "framer-motion";
import { Zap, ChevronDown, Image as ImageIcon, FolderOpen, User, Settings, Crown, LogOut, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { modKey } from "./KeyboardShortcuts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import appLogo from "@/assets/app-logo.png";

const tools = [
  { name: "AI Chat", href: "/chat", icon: "💬" },
  { name: "Image Generator", href: "/image-generator", icon: "🎨" },
  { name: "Image Enhancer", href: "/image-enhancer", icon: "✨" },
  { name: "Summarizer", href: "/summarizer", icon: "📝" },
  { name: "News Feed", href: "/news", icon: "📰" },
  { name: "App Creator", href: "/app-creator", icon: "🚀" },
  { name: "Homework Assistant", href: "/homework-assistant", icon: "📚" },
];

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={appLogo} 
            alt="Know Deep Logo" 
            className="w-10 h-10 rounded-xl object-cover"
          />
          <span className="text-xl font-bold gradient-text">Know Deep</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            Features
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm">
              Tools
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {tools.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild>
                  <Link to={tool.href} className="flex items-center gap-2 cursor-pointer">
                    <span>{tool.icon}</span>
                    {tool.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {user && (
            <Link to="/my-stuff" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-purple-500" />
              My Stuff
            </Link>
          )}
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Quick Action Search Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("knowdeep_open_search"))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 text-xs font-medium transition-all shadow-2xs hover:border-cyan-500/40 cursor-pointer"
            title={`Search & Quick Actions (${modKey}+K)`}
          >
            <Search className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded text-muted-foreground">
              {modKey}K
            </kbd>
          </button>

          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="gradient-bg text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.user_metadata?.display_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings#subscription" className="flex items-center gap-2 cursor-pointer">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Buy Premium
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/chat">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};
