import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Radio,
  MessageSquare,
  Sparkles,
  Bot,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export interface CollabUserPresence {
  id: string;
  name: string;
  color: string;
  avatar: string;
  role: string;
  paragraphId?: string | null;
  isAiPeer?: boolean;
}

export interface CollabChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

interface CollaboratorsBarProps {
  collaborators: CollabUserPresence[];
  isConnected: boolean;
  documentTitle: string;
  chatMessages: CollabChatMessage[];
  onSendMessage: (text: string) => void;
  onToggleAiPeer?: (enable: boolean) => void;
  isAiPeerActive?: boolean;
}

export const CollaboratorsBar: React.FC<CollaboratorsBarProps> = ({
  collaborators,
  isConnected,
  documentTitle,
  chatMessages,
  onSendMessage,
  onToggleAiPeer,
  isAiPeerActive = false,
}) => {
  const { toast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://app.knowdeep.ai/document-studio";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast({
      title: "Invite Link Copied!",
      description: "Anyone with this link can join and collaborate in real-time.",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Real-time Connection Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/40 text-[11px] font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            )}
          </span>
          <span className="hidden sm:inline">
            {isConnected ? "Live Sync" : "Connecting..."}
          </span>
        </div>

        {/* Collaborators Avatar Stack */}
        <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
          {collaborators.map((user) => (
            <div
              key={user.id}
              className="relative group cursor-pointer"
              title={`${user.name} (${user.role})${user.paragraphId ? " - Active on paragraph" : ""}`}
            >
              <div
                className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-background shadow-xs transition-transform group-hover:scale-110 group-hover:z-10"
                style={{ backgroundColor: user.color || "#0ea5e9" }}
              >
                {user.avatar || user.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-popover text-popover-foreground text-[10px] font-semibold px-2 py-1 rounded-md shadow-md border border-border whitespace-nowrap z-50">
                <span className="font-bold">{user.name}</span>
                <span className="text-muted-foreground ml-1">· {user.role}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Realtime Team Chat Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`h-8 px-2.5 rounded-xl text-xs gap-1.5 border-border/60 cursor-pointer ${
            isChatOpen ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/40" : "text-muted-foreground"
          }`}
          title="Team Activity & Live Chat"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Activity</span>
          {chatMessages.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-white text-[9px] font-bold">
              {chatMessages.length}
            </span>
          )}
        </Button>

        {/* Share / Invite Collaborators Button */}
        <Button
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          className="h-8 px-3 rounded-xl bg-muted/80 hover:bg-muted text-foreground border border-border/60 text-xs font-semibold gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
      </div>

      {/* Realtime Team Chat Drawer / Floating Window */}
      {isChatOpen && (
        <div className="absolute top-16 right-4 sm:right-8 w-80 sm:w-96 glass backdrop-blur-2xl bg-card/95 border border-border/80 shadow-2xl rounded-3xl p-4 z-50 flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">Live Collaborator Room</p>
                <p className="text-[10px] text-muted-foreground">
                  {collaborators.length} active in this document
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Collaborators Chips */}
          <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto border-b border-border/30">
            {collaborators.map((c) => (
              <span
                key={c.id}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 bg-muted/40 shrink-0"
                style={{ borderColor: `${c.color}40` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </span>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[160px] max-h-[260px] text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs space-y-1">
                <p>No collaborator comments yet.</p>
                <p className="text-[10px]">Type below to leave a note for live editors.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-foreground">{msg.user}</span>
                    <span className="text-[9px] text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSendChat} className="pt-2 border-t border-border/40 flex items-center gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Leave a note or ping team..."
              className="h-9 text-xs rounded-xl bg-background/80 border-border/60"
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white p-0 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Invite Collaborators Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md glass backdrop-blur-2xl border-border/60 shadow-2xl rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </span>
              <DialogTitle className="text-lg font-bold text-foreground">
                Invite Collaborators
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Work together simultaneously on "{documentTitle}" with live cursor presence and multi-user editing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Share Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Document Live Link
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="h-10 text-xs font-mono bg-muted/40 border-border/60 rounded-xl"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="h-10 px-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {/* AI Co-Author Presence Simulation Toggle */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-foreground">AI Co-Author Collaborator</span>
                </div>
                {onToggleAiPeer && (
                  <button
                    type="button"
                    onClick={() => onToggleAiPeer(!isAiPeerActive)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      isAiPeerActive
                        ? "bg-cyan-600 text-white border-cyan-600"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {isAiPeerActive ? "Active: Maya (Editor)" : "Enable AI Peer"}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Invite an autonomous AI colleague into your real-time session who monitors paragraphs, offers live editorial polish, and simulates collaborative multi-user presence.
              </p>
            </div>

            {/* Current Active Members */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Currently In This Room ({collaborators.length})
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.avatar}
                      </div>
                      <span className="font-semibold text-foreground">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
                      {c.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
