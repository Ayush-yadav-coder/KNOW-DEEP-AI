import React, { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  Globe,
  QrCode,
  Code2,
  ExternalLink,
  X,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CodeFile } from "./CodeStudioTypes";

interface CodeStudioShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: CodeFile;
  allFiles: CodeFile[];
}

export const CodeStudioShareModal: React.FC<CodeStudioShareModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  allFiles,
}) => {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState<string>("");
  const [embedHtml, setEmbedHtml] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [shareMode, setShareMode] = useState<"active" | "project">("active");

  useEffect(() => {
    if (!isOpen) return;

    try {
      let payload = "";
      if (shareMode === "active") {
        payload = JSON.stringify({
          mode: "single",
          name: activeFile.name,
          lang: activeFile.language,
          content: activeFile.content,
        });
      } else {
        payload = JSON.stringify({
          mode: "project",
          files: allFiles.map((f) => ({ name: f.name, lang: f.language, content: f.content })),
        });
      }

      // Safe URL encoding (Base64 UTF-8)
      const utf8Bytes = new TextEncoder().encode(payload);
      let binary = "";
      utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
      const base64 = btoa(binary);

      const baseUrl = window.location.origin + window.location.pathname;
      const fullUrl = `${baseUrl}#snippet=${encodeURIComponent(base64)}`;
      setShareUrl(fullUrl);

      const embedSnippet = `<iframe src="${baseUrl}?embed=true#snippet=${encodeURIComponent(
        base64
      )}" width="100%" height="500" style="border:1px solid #334155; border-radius:16px; overflow:hidden;" title="Know Deep Code Studio Snippet"></iframe>`;
      setEmbedHtml(embedSnippet);
    } catch {
      setShareUrl(window.location.href);
    }
  }, [isOpen, activeFile, allFiles, shareMode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({ title: "Link Copied!", description: "Shareable snippet URL copied to clipboard." });
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedHtml);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
    toast({ title: "Embed Code Copied!", description: "Iframe HTML copied to clipboard." });
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out this code snippet in Know Deep Code Studio:\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this code snippet on Know Deep Code Studio: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Share Code Snippet</h3>
              <p className="text-xs text-muted-foreground">
                Generate instant shareable links for your code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share Scope Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs">
          <button
            onClick={() => setShareMode("active")}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
              shareMode === "active" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active File ({activeFile.name})
          </button>
          <button
            onClick={() => setShareMode("project")}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
              shareMode === "project" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Full Workspace ({allFiles.length} Files)
          </button>
        </div>

        {/* Shareable URL Bar */}
        <div className="space-y-1.5 text-xs">
          <label className="text-muted-foreground font-semibold flex items-center justify-between">
            <span>Shareable URL</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">● Self-Contained Link</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-background border border-border font-mono text-[11px] text-foreground focus:outline-none"
            />
            <Button
              size="sm"
              onClick={handleCopyLink}
              className="h-9 px-4 rounded-xl text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold gap-1.5 shadow-xs shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>

        {/* Social Share Pills */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareTwitter}
            className="flex-1 h-8 rounded-xl text-xs gap-1.5"
          >
            Share on X / Twitter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareWhatsApp}
            className="flex-1 h-8 rounded-xl text-xs gap-1.5"
          >
            Share on WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQr(!showQr)}
            className="h-8 px-3 rounded-xl text-xs gap-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </Button>
        </div>

        {/* QR Code Viewer */}
        {showQr && (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col items-center justify-center space-y-2 text-center animate-in fade-in">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`}
              alt="QR Code"
              className="w-36 h-36 rounded-xl border border-border bg-white p-2 shadow-xs"
            />
            <p className="text-[11px] text-muted-foreground">Scan with phone camera to open in browser</p>
          </div>
        )}

        {/* Embed Snippet Box */}
        <div className="space-y-1.5 text-xs pt-1">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground font-semibold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Embed on Website / Blog
            </label>
            <button
              onClick={handleCopyEmbed}
              className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
            >
              {copiedEmbed ? "Copied Embed HTML" : "Copy Embed HTML"}
            </button>
          </div>
          <pre className="p-2.5 rounded-xl bg-muted/60 font-mono text-[10px] text-muted-foreground overflow-x-auto border border-border/60">
            {embedHtml}
          </pre>
        </div>
      </div>
    </div>
  );
};
