import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Edit3,
  Copy,
  Check,
  Loader2,
  Wand2,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Highlighter,
  StickyNote,
  Stamp,
  Scan,
  FileDiff,
  CheckCircle2,
  Table as TableIcon,
  ChevronDown,
  History,
  RotateCcw,
  Clock,
  ArrowLeftRight,
  Save,
  Maximize2,
  Minimize2,
  FileDown,
  Layers,
  FileCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ExportModal } from "@/components/document/ExportModal";
import {
  CollaboratorsBar,
  CollabUserPresence,
  CollabChatMessage,
} from "@/components/document/CollaboratorsBar";
import { AiMagicStudio } from "@/components/document/AiMagicStudio";
import { ExportParagraph } from "@/components/document/exportUtils";

interface DocParagraph extends ExportParagraph {
  id: string;
  type: "h1" | "h2" | "h3" | "p" | "bullet";
  text: string;
  pageNumber: number;
  comment?: string;
  highlightColor?: string;
}

interface DocumentVersion {
  id: string;
  versionNumber: string;
  name: string;
  timestamp: string;
  author: string;
  paragraphs: DocParagraph[];
  stamp?: string | null;
  summary: string;
  wordCount: number;
}

const DEFAULT_PARAGRAPHS: DocParagraph[] = [
  {
    id: "p-1",
    type: "h1",
    text: "Global Strategic Enterprise AI Roadmap & Implementation Plan",
    pageNumber: 1,
  },
  {
    id: "p-2",
    type: "h2",
    text: "1. Executive Summary & Strategic Vision",
    pageNumber: 1,
  },
  {
    id: "p-3",
    type: "p",
    text: "This document outlines the multi-phase deployment of next-generation autonomous AI workflows across cloud edge nodes, ensuring sub-50ms latency, high availability, and institutional security compliance.",
    pageNumber: 1,
    comment: "Verified with cloud architecture lead.",
    highlightColor: "cyan",
  },
  {
    id: "p-4",
    type: "h2",
    text: "2. Key Objectives & Milestones",
    pageNumber: 1,
  },
  {
    id: "p-5",
    type: "bullet",
    text: "Phase I: Infrastructure audit and distributed database replication across regional clusters.",
    pageNumber: 1,
  },
  {
    id: "p-6",
    type: "bullet",
    text: "Phase II: Real-time telemetry integration with automated anomaly detection and self-healing pipelines.",
    pageNumber: 1,
  },
  {
    id: "p-7",
    type: "bullet",
    text: "Phase III: Enterprise client onboarding with automated SLA enforcement and role-based access control.",
    pageNumber: 1,
  },
  {
    id: "p-8",
    type: "h2",
    text: "3. Financial Projections & ROI Metrics",
    pageNumber: 2,
  },
  {
    id: "p-9",
    type: "p",
    text: "By streamlining document processing and automating manual review cycles, operational expenditure is projected to decline by 38% over the first two fiscal quarters. Total cost of ownership (TCO) break-even is achieved in Month 5.",
    pageNumber: 2,
  },
];

export default function DocumentStudio() {
  const { toast } = useToast();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  // Document Core State
  const [docTitle, setDocTitle] = useState("Enterprise AI Strategy 2026");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [pdfParagraphs, setPdfParagraphs] = useState<DocParagraph[]>(DEFAULT_PARAGRAPHS);
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>("p-3");
  const [activeStamp, setActiveStamp] = useState<string | null>("APPROVED");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "magic-ai" | "ocr" | "diff">("editor");

  // Sticky Note & Comment Modal
  const [commentModalParId, setCommentModalParId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  // Highlight tool
  const [isHighlightToolActive, setIsHighlightToolActive] = useState(false);
  const [highlightColor, setHighlightColor] = useState<"yellow" | "cyan" | "emerald" | "rose" | "purple">("yellow");

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Version History State
  const [isSaveVersionModalOpen, setIsSaveVersionModalOpen] = useState(false);
  const [customVersionName, setCustomVersionName] = useState("");
  const [customVersionNote, setCustomVersionNote] = useState("");
  const [versionHistory, setVersionHistory] = useState<DocumentVersion[]>([
    {
      id: "v-initial",
      versionNumber: "v1.0",
      name: "Initial Draft Baseline",
      timestamp: "15 minutes ago",
      author: "You",
      paragraphs: DEFAULT_PARAGRAPHS,
      stamp: "APPROVED",
      summary: "Baseline document initialization with 9 structured strategic paragraphs.",
      wordCount: DEFAULT_PARAGRAPHS.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
    },
  ]);
  const [compareVersionAId, setCompareVersionAId] = useState<string>("v-initial");
  const [compareVersionBId, setCompareVersionBId] = useState<string>("current");

  // OCR Digitizer State
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResultText, setOcrResultText] = useState("");
  const ocrFileInputRef = useRef<HTMLInputElement>(null);

  // Floating Context AI Toolbar State
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [floatingToolbar, setFloatingToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
    paragraphId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    paragraphId: null,
  });
  const [isFloatingAiBusy, setIsFloatingAiBusy] = useState(false);
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);

  // ==========================================
  // REAL-TIME COLLABORATION & WEBSOCKET ENGINE
  // ==========================================
  const wsRef = useRef<WebSocket | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [currentUser] = useState<CollabUserPresence>(() => ({
    id: `usr-${Math.random().toString(36).slice(2, 7)}`,
    name: "You (Lead)",
    color: "#0284c7",
    avatar: "YO",
    role: "Owner",
  }));
  const [collaborators, setCollaborators] = useState<CollabUserPresence[]>([
    {
      id: "usr-sarah",
      name: "Sarah Lin",
      color: "#10b981",
      avatar: "SL",
      role: "Lead Architect",
      paragraphId: "p-2",
    },
    {
      id: "usr-alex",
      name: "Alex Rivera",
      color: "#8b5cf6",
      avatar: "AR",
      role: "Product Strategy",
      paragraphId: null,
    },
  ]);
  const [chatMessages, setChatMessages] = useState<CollabChatMessage[]>([
    {
      id: "chat-1",
      user: "Sarah Lin",
      text: "The executive vision in Section 1 looks very sharp!",
      timestamp: "10:14 AM",
    },
    {
      id: "chat-2",
      user: "Alex Rivera",
      text: "Phase II telemetry timelines are locked in.",
      timestamp: "10:18 AM",
    },
  ]);
  const [isAiPeerActive, setIsAiPeerActive] = useState(true);

  // Connect WebSocket for real-time collaboration
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws/document-collab`;
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setIsWsConnected(true);
          // Join document room
          socket?.send(
            JSON.stringify({
              type: "join",
              docId: "doc-enterprise-ai",
              user: currentUser,
            })
          );
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "presence_update") {
              const remoteUsers: CollabUserPresence[] = data.users || [];
              const combined = [
                currentUser,
                ...remoteUsers.filter((u) => u.id !== currentUser.id),
              ];
              setCollaborators(combined);
            } else if (data.type === "cursor_move") {
              setCollaborators((prev) =>
                prev.map((c) =>
                  c.id === data.userId ? { ...c, paragraphId: data.paragraphId } : c
                )
              );
            } else if (data.type === "doc_update") {
              if (data.paragraphs && Array.isArray(data.paragraphs)) {
                setPdfParagraphs(data.paragraphs);
                if (data.senderName) {
                  toast({
                    title: `${data.senderName} updated document`,
                    description: data.action || "Live changes synced.",
                  });
                }
              }
            } else if (data.type === "chat_message" && data.message) {
              setChatMessages((prev) => [...prev, data.message]);
            }
          } catch (e) {
            console.error("Collab WS parse error:", e);
          }
        };

        socket.onclose = () => {
          setIsWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 4000);
        };

        socket.onerror = () => {
          setIsWsConnected(false);
        };
      } catch (err) {
        setIsWsConnected(false);
      }
    };

    connectWs();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [currentUser]);

  // Broadcast paragraph changes over WebSocket
  const broadcastDocUpdate = useCallback(
    (updatedParagraphs: DocParagraph[], action: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "doc_update",
            docId: "doc-enterprise-ai",
            paragraphs: updatedParagraphs,
            senderId: currentUser.id,
            senderName: currentUser.name,
            action,
          })
        );
      }
    },
    [currentUser]
  );

  // Broadcast cursor movement over WebSocket
  const broadcastCursorMove = useCallback(
    (paragraphId: string | null) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "cursor_move",
            docId: "doc-enterprise-ai",
            userId: currentUser.id,
            userName: currentUser.name,
            color: currentUser.color,
            paragraphId,
          })
        );
      }
    },
    [currentUser]
  );

  // Send team chat message
  const handleSendTeamChat = (text: string) => {
    const newMsg: CollabChatMessage = {
      id: `msg-${Date.now()}`,
      user: currentUser.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsg]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat_message",
          docId: "doc-enterprise-ai",
          user: currentUser.name,
          text,
        })
      );
    }
  };

  // Toggle AI Co-Author Peer in Presence list
  const handleToggleAiPeer = (enable: boolean) => {
    setIsAiPeerActive(enable);
    if (enable) {
      const mayaPeer: CollabUserPresence = {
        id: "usr-maya-ai",
        name: "Maya (AI Editor)",
        color: "#06b6d4",
        avatar: "MA",
        role: "AI Co-Author",
        isAiPeer: true,
        paragraphId: "p-3",
      };
      setCollaborators((prev) =>
        prev.some((u) => u.id === mayaPeer.id) ? prev : [...prev, mayaPeer]
      );
      toast({
        title: "Maya Joined the Session",
        description: "Your autonomous AI co-author is now monitoring the document in real time.",
      });
    } else {
      setCollaborators((prev) => prev.filter((u) => u.id !== "usr-maya-ai"));
      toast({ title: "Maya Left the Session" });
    }
  };

  // ==========================================
  // VERSION HISTORY & MILESTONES
  // ==========================================
  const createVersionSnapshot = (
    name: string,
    author: string = "You",
    note: string = "Saved document snapshot"
  ) => {
    const nextVerNumber = `v1.${versionHistory.length}`;
    const newVer: DocumentVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: nextVerNumber,
      name: name || `Milestone ${nextVerNumber}`,
      timestamp: "Just now",
      author,
      paragraphs: JSON.parse(JSON.stringify(pdfParagraphs)),
      stamp: activeStamp,
      summary: note,
      wordCount: pdfParagraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
    };
    setVersionHistory((prev) => [newVer, ...prev]);
  };

  const handleManualSaveVersion = () => {
    const name = customVersionName.trim() || `Milestone v1.${versionHistory.length}`;
    createVersionSnapshot(name, "You", customVersionNote.trim() || "Manual user save checkpoint");
    setIsSaveVersionModalOpen(false);
    setCustomVersionName("");
    setCustomVersionNote("");
    toast({
      title: "Version Snapshot Saved",
      description: `Document milestone "${name}" successfully recorded in history.`,
    });
  };

  const handleRestoreVersion = (ver: DocumentVersion) => {
    createVersionSnapshot(
      `Backup Pre-${ver.versionNumber}`,
      "Restored",
      `Automatic checkpoint prior to restoring ${ver.versionNumber}`
    );
    setPdfParagraphs(JSON.parse(JSON.stringify(ver.paragraphs)));
    if (ver.stamp !== undefined) setActiveStamp(ver.stamp);
    broadcastDocUpdate(ver.paragraphs, `Restored ${ver.versionNumber}`);
    toast({
      title: `Restored ${ver.versionNumber}`,
      description: `Active canvas reverted to "${ver.name}".`,
    });
  };

  // ==========================================
  // PARAGRAPH MUTATIONS
  // ==========================================
  const updateParagraphText = (id: string, text: string) => {
    const next = pdfParagraphs.map((p) => (p.id === id ? { ...p, text } : p));
    setPdfParagraphs(next);
    broadcastDocUpdate(next, "Edited paragraph");
  };

  const addParagraph = (type: DocParagraph["type"] = "p") => {
    const newPar: DocParagraph = {
      id: `p-${Date.now()}`,
      type,
      text: type === "h1" ? "New Section Heading" : type === "h2" ? "Sub-Heading" : "Add text here...",
      pageNumber: 1,
    };
    const next = [...pdfParagraphs, newPar];
    setPdfParagraphs(next);
    setSelectedParagraphId(newPar.id);
    broadcastDocUpdate(next, "Added new paragraph");
    toast({ title: "Block Added", description: `Created new ${type.toUpperCase()} block.` });
  };

  const deleteParagraph = (id: string) => {
    if (pdfParagraphs.length <= 1) {
      toast({ title: "Cannot Delete", description: "Document must contain at least one block.", variant: "destructive" });
      return;
    }
    const next = pdfParagraphs.filter((p) => p.id !== id);
    setPdfParagraphs(next);
    broadcastDocUpdate(next, "Deleted paragraph");
  };

  const toggleHighlight = (id: string) => {
    const next = pdfParagraphs.map((p) => {
      if (p.id !== id) return p;
      return { ...p, highlightColor: p.highlightColor ? undefined : highlightColor };
    });
    setPdfParagraphs(next);
  };

  const handleSaveComment = () => {
    if (!commentModalParId) return;
    const next = pdfParagraphs.map((p) =>
      p.id === commentModalParId ? { ...p, comment: commentInput.trim() || undefined } : p
    );
    setPdfParagraphs(next);
    broadcastDocUpdate(next, "Updated sticky comment");
    setCommentModalParId(null);
    setCommentInput("");
  };

  // ==========================================
  // FLOATING CONTEXT-AWARE AI TOOLBAR
  // ==========================================
  const handleCanvasSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const selectedStr = selection.toString().trim();
    if (selectedStr.length < 2) return;

    let targetParId = selectedParagraphId;
    if (selection.anchorNode) {
      const el = (
        selection.anchorNode instanceof Element
          ? selection.anchorNode
          : selection.anchorNode.parentElement
      )?.closest("[data-paragraph-id]");
      if (el) {
        targetParId = el.getAttribute("data-paragraph-id");
      }
    }

    if (!targetParId) {
      const matched = pdfParagraphs.find((p) => p.text.includes(selectedStr));
      if (matched) {
        targetParId = matched.id;
      }
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = canvasWrapperRef.current?.getBoundingClientRect();

    if (rect && containerRect) {
      const relativeTop = Math.max(12, rect.top - containerRect.top - 62);
      const relativeLeft = Math.max(
        16,
        Math.min(containerRect.width - 480, rect.left - containerRect.left + rect.width / 2 - 240)
      );

      setFloatingToolbar({
        visible: true,
        x: relativeLeft,
        y: relativeTop,
        text: selectedStr,
        paragraphId: targetParId,
      });
    }
  };

  const closeFloatingToolbar = () => {
    setFloatingToolbar((prev) => ({ ...prev, visible: false }));
    setIsToneMenuOpen(false);
    setIsFormatMenuOpen(false);
  };

  const handleFloatingToneAdjust = async (toneName: string) => {
    if (!floatingToolbar.text.trim()) return;
    setIsFloatingAiBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Rewrite the following text with a "${toneName}" tone. Return ONLY the rewritten text without markdown codeblocks or quotes:\n\n${floatingToolbar.text}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const rewritten = (data.content || "").trim();
      if (rewritten && floatingToolbar.paragraphId) {
        const next = pdfParagraphs.map((p) => {
          if (p.id !== floatingToolbar.paragraphId) return p;
          const updatedText = p.text.includes(floatingToolbar.text)
            ? p.text.replace(floatingToolbar.text, rewritten)
            : rewritten;
          return { ...p, text: updatedText };
        });
        setPdfParagraphs(next);
        broadcastDocUpdate(next, `Tone: ${toneName}`);
        createVersionSnapshot(`Tone: ${toneName}`, "AI Co-Author", `Rewrote highlighted text to ${toneName} tone`);
        toast({ title: `Tone: ${toneName}`, description: "Applied tone adjustment to selection." });
      }
    } catch {
      toast({ title: "AI Error", description: "Could not apply tone adjustment.", variant: "destructive" });
    } finally {
      setIsFloatingAiBusy(false);
      closeFloatingToolbar();
    }
  };

  const handleFloatingSummarize = async () => {
    if (!floatingToolbar.text.trim()) return;
    setIsFloatingAiBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Summarize this text into 1 high-impact concise sentence:\n\n${floatingToolbar.text}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const summaryText = (data.content || "").trim();
      if (summaryText && floatingToolbar.paragraphId) {
        const next = pdfParagraphs.map((p) =>
          p.id === floatingToolbar.paragraphId ? { ...p, text: summaryText } : p
        );
        setPdfParagraphs(next);
        broadcastDocUpdate(next, "AI Auto-Summary");
        createVersionSnapshot("AI Auto-Summary", "AI Co-Author", "Summarized selected section");
        toast({ title: "Auto-Summarized", description: "Replaced selection with executive summary." });
      }
    } catch {
      toast({ title: "AI Error", description: "Failed to summarize text.", variant: "destructive" });
    } finally {
      setIsFloatingAiBusy(false);
      closeFloatingToolbar();
    }
  };

  const handleFloatingFixGrammar = async () => {
    if (!floatingToolbar.text.trim()) return;
    setIsFloatingAiBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Fix all grammar and typos for this text. Return ONLY polished text:\n\n${floatingToolbar.text}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const polished = (data.content || "").trim();
      if (polished && floatingToolbar.paragraphId) {
        const next = pdfParagraphs.map((p) => {
          if (p.id !== floatingToolbar.paragraphId) return p;
          const updatedText = p.text.includes(floatingToolbar.text)
            ? p.text.replace(floatingToolbar.text, polished)
            : polished;
          return { ...p, text: updatedText };
        });
        setPdfParagraphs(next);
        broadcastDocUpdate(next, "Grammar fix");
        createVersionSnapshot("Grammar & Polish Fix", "AI Co-Author", "Enhanced clarity and grammar");
        toast({ title: "Grammar Polished", description: "Applied clarity fix." });
      }
    } catch {
      toast({ title: "AI Error", description: "Could not polish text.", variant: "destructive" });
    } finally {
      setIsFloatingAiBusy(false);
      closeFloatingToolbar();
    }
  };

  const handleFloatingFormatChange = (newType: DocParagraph["type"]) => {
    if (floatingToolbar.paragraphId) {
      const next = pdfParagraphs.map((p) =>
        p.id === floatingToolbar.paragraphId ? { ...p, type: newType } : p
      );
      setPdfParagraphs(next);
      broadcastDocUpdate(next, `Formatted as ${newType}`);
      toast({ title: `Formatted as ${newType.toUpperCase()}` });
      setIsFormatMenuOpen(false);
    }
  };

  // OCR Digitizer Execution
  const handleOcrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setOcrImagePreview(base64);
      setIsOcrProcessing(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content:
                  "Extract all readable text, tables, and structured sections from this scanned document. Return clean, formatted prose with headings.",
              },
            ],
          }),
        });
        const data = await res.json();
        const extracted = data.content || "Scanned document text successfully extracted.";
        setOcrResultText(extracted);
        toast({ title: "OCR Digitization Complete", description: "1-Click to transfer into live canvas." });
      } catch {
        toast({ title: "OCR Error", description: "Could not scan image.", variant: "destructive" });
      } finally {
        setIsOcrProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransferOcrToCanvas = () => {
    if (!ocrResultText.trim()) return;
    const lines = ocrResultText.split("\n").filter((l) => l.trim().length > 0);
    const newPars: DocParagraph[] = lines.map((line, idx) => ({
      id: `ocr-${Date.now()}-${idx}`,
      type: line.startsWith("# ") ? "h1" : line.startsWith("## ") ? "h2" : line.startsWith("- ") ? "bullet" : "p",
      text: line.replace(/^#+\s*/, "").replace(/^-\s*/, ""),
      pageNumber: 1,
    }));

    setPdfParagraphs((prev) => [...prev, ...newPars]);
    broadcastDocUpdate([...pdfParagraphs, ...newPars], "Imported OCR Scan");
    createVersionSnapshot("OCR Digitized Import", "OCR Scanner", "Appended extracted scan text");
    setActiveTab("editor");
    toast({ title: "Transferred to Canvas", description: "Scanned text added to live document." });
  };

  const fullDocText = pdfParagraphs.map((p) => p.text).join("\n\n");

  return (
    <AppLayout>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* ========================================================= */}
        {/* TOP CANVA-GRADE APPLICATION BAR                           */}
        {/* ========================================================= */}
        <header className="sticky top-0 z-40 glass backdrop-blur-2xl bg-card/85 border-b border-border/50 px-4 sm:px-8 py-2.5 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Document Branding & Inline Title Editor */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <FileText className="w-5 h-5" />
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {isEditingTitle ? (
                      <Input
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                        autoFocus
                        className="h-7 text-sm font-bold bg-background/80 rounded-lg px-2 border-cyan-500 w-64"
                      />
                    ) : (
                      <h1
                        onClick={() => setIsEditingTitle(true)}
                        className="text-sm sm:text-base font-extrabold tracking-tight text-foreground hover:text-cyan-500 cursor-pointer flex items-center gap-1.5 transition-colors"
                        title="Click to rename document"
                      >
                        {docTitle}
                        <Edit3 className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                      </h1>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Saved in Cloud
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{pdfParagraphs.length} Blocks</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {pdfParagraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0)} Words
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Canva-Grade Segmented Studio Dock */}
            <div className="flex items-center p-1 bg-muted/60 dark:bg-muted/40 rounded-2xl border border-border/50 shadow-inner">
              {[
                { id: "editor", label: "Canvas Editor", icon: Edit3 },
                { id: "magic-ai", label: "AI Magic Studio", icon: Sparkles },
                { id: "ocr", label: "Scan & OCR", icon: Scan },
                { id: "diff", label: "Version Diff", icon: FileDiff },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-studio-tab"
                        className="absolute inset-0 bg-background rounded-xl border border-border/60 shadow-xs"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Real-time Collaborators Bar & Canva Export Button */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <CollaboratorsBar
                collaborators={collaborators}
                isConnected={isWsConnected}
                documentTitle={docTitle}
                chatMessages={chatMessages}
                onSendMessage={handleSendTeamChat}
                onToggleAiPeer={handleToggleAiPeer}
                isAiPeerActive={isAiPeerActive}
              />

              {/* Prominent Canva-Style Export CTA */}
              <Button
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>

              {/* Fullscreen / Focus Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hidden lg:block cursor-pointer"
                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Canvas Mode"}
              >
                {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN STUDIO WORKSPACE                                     */}
        {/* ========================================================= */}
        <main className={`flex-1 ${isFocusMode ? "p-2 sm:p-4" : "p-4 sm:p-8 max-w-7xl mx-auto w-full"}`}>
          {/* TAB 1: HERO CANVAS EDITOR */}
          {activeTab === "editor" && (
            <div className="space-y-6">
              {/* Floating Island Control Toolbar */}
              <div className="glass rounded-2xl border border-border/50 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm bg-card/60 backdrop-blur-xl">
                {/* Left Controls: Add Blocks */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pr-1 hidden sm:inline">
                    Insert:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addParagraph("h1")}
                    className="h-8 px-2.5 text-xs rounded-xl font-bold border-border/60 hover:border-cyan-500 cursor-pointer"
                  >
                    + H1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addParagraph("h2")}
                    className="h-8 px-2.5 text-xs rounded-xl font-semibold border-border/60 hover:border-cyan-500 cursor-pointer"
                  >
                    + H2
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addParagraph("p")}
                    className="h-8 px-2.5 text-xs rounded-xl border-border/60 hover:border-cyan-500 cursor-pointer"
                  >
                    + Paragraph
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addParagraph("bullet")}
                    className="h-8 px-2.5 text-xs rounded-xl border-border/60 hover:border-cyan-500 cursor-pointer"
                  >
                    + Bullet
                  </Button>
                </div>

                {/* Center / Right Controls: Stamp, Zoom, Milestone */}
                <div className="flex items-center gap-2">
                  {/* Status Stamp Dropdown */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground hidden md:inline">Stamp:</span>
                    <select
                      value={activeStamp || ""}
                      onChange={(e) => setActiveStamp(e.target.value || null)}
                      className="h-8 text-xs font-bold rounded-xl border border-border/60 bg-muted/40 text-foreground px-2 cursor-pointer"
                    >
                      <option value="">No Stamp</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="FINAL REVIEW">FINAL REVIEW</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </div>

                  {/* Read Aloud TTS */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (isSpeaking ? stop() : speak(fullDocText))}
                    className="h-8 px-2.5 rounded-xl border-border/60 text-xs font-semibold gap-1 text-cyan-600 dark:text-cyan-400 cursor-pointer"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
                  </Button>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-xl border border-border/50">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                      className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold px-1">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                      className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Save Milestone Version Button */}
                  <Button
                    size="sm"
                    onClick={() => setIsSaveVersionModalOpen(true)}
                    className="h-8 px-3 rounded-xl bg-muted/80 hover:bg-muted text-foreground border border-border/60 text-xs font-semibold gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="hidden sm:inline">Save Milestone</span>
                  </Button>
                </div>
              </div>

              {/* Realistic Paper Sheet Canvas */}
              <div
                ref={canvasWrapperRef}
                onMouseUp={handleCanvasSelection}
                onKeyUp={handleCanvasSelection}
                className="glass rounded-3xl border border-border/50 p-6 sm:p-12 flex flex-col items-center overflow-y-auto bg-muted/20 backdrop-blur-xl relative min-h-[780px]"
              >
                {/* Floating Context-Aware AI Toolbar (Activates on Highlighted Text) */}
                <AnimatePresence>
                  {floatingToolbar.visible && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        top: `${floatingToolbar.y}px`,
                        left: `${floatingToolbar.x}px`,
                        zIndex: 40,
                      }}
                      className="glass backdrop-blur-2xl bg-card/95 dark:bg-card/90 border border-cyan-500/40 shadow-2xl rounded-2xl p-1.5 flex flex-wrap items-center gap-1 max-w-[95%] text-xs"
                    >
                      <div className="flex items-center gap-1 pr-1.5 border-r border-border/40">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-2xs">
                          {isFloatingAiBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider pl-1 hidden sm:inline">
                          AI Context
                        </span>
                      </div>

                      {/* Auto-Summarize */}
                      <button
                        type="button"
                        onClick={handleFloatingSummarize}
                        disabled={isFloatingAiBusy}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Auto-Summarize Highlighted Selection"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Summarize</span>
                      </button>

                      {/* Tone Adjustment Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsToneMenuOpen(!isToneMenuOpen);
                            setIsFormatMenuOpen(false);
                          }}
                          disabled={isFloatingAiBusy}
                          className="px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-muted font-semibold flex items-center gap-1 text-foreground transition-colors cursor-pointer"
                        >
                          <span>Tone</span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>

                        {isToneMenuOpen && (
                          <div className="absolute top-full mt-1.5 left-0 z-50 glass bg-card rounded-xl border border-border/60 shadow-xl p-1.5 min-w-[170px] space-y-0.5">
                            {[
                              { label: "👔 Executive", tone: "Executive & Authoritative" },
                              { label: "⚡ Concise & Direct", tone: "Concise & Impactful" },
                              { label: "🎯 Persuasive", tone: "Persuasive & Visionary" },
                              { label: "🔬 Technical", tone: "Technical & Precise" },
                              { label: "💡 Simple (ELI5)", tone: "Simple & Clear" },
                            ].map((t) => (
                              <button
                                key={t.tone}
                                type="button"
                                onClick={() => handleFloatingToneAdjust(t.tone)}
                                className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-cyan-500/15 text-xs text-foreground font-medium transition-colors cursor-pointer"
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Formatting Styles Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormatMenuOpen(!isFormatMenuOpen);
                            setIsToneMenuOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-muted font-semibold flex items-center gap-1 text-foreground transition-colors cursor-pointer"
                        >
                          <span>Format</span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>

                        {isFormatMenuOpen && (
                          <div className="absolute top-full mt-1.5 left-0 z-50 glass bg-card rounded-xl border border-border/60 shadow-xl p-1.5 min-w-[140px] space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleFloatingFormatChange("h1")}
                              className="w-full px-2.5 py-1 text-left rounded-lg hover:bg-cyan-500/15 text-xs font-bold text-foreground cursor-pointer"
                            >
                              Heading 1 (H1)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFloatingFormatChange("h2")}
                              className="w-full px-2.5 py-1 text-left rounded-lg hover:bg-cyan-500/15 text-xs font-semibold text-foreground cursor-pointer"
                            >
                              Heading 2 (H2)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFloatingFormatChange("h3")}
                              className="w-full px-2.5 py-1 text-left rounded-lg hover:bg-cyan-500/15 text-xs font-medium text-foreground cursor-pointer"
                            >
                              Heading 3 (H3)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFloatingFormatChange("p")}
                              className="w-full px-2.5 py-1 text-left rounded-lg hover:bg-cyan-500/15 text-xs text-foreground cursor-pointer"
                            >
                              Paragraph (¶)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFloatingFormatChange("bullet")}
                              className="w-full px-2.5 py-1 text-left rounded-lg hover:bg-cyan-500/15 text-xs text-foreground cursor-pointer"
                            >
                              • Bullet Item
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Grammar Fix */}
                      <button
                        type="button"
                        onClick={handleFloatingFixGrammar}
                        disabled={isFloatingAiBusy}
                        className="p-1.5 rounded-xl hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                        title="Fix Grammar & Clarity"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      </button>

                      {/* Read Aloud TTS */}
                      <button
                        type="button"
                        onClick={() => speak(floatingToolbar.text)}
                        className="p-1.5 rounded-xl hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                        title="Read Selection Aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                      </button>

                      {/* Close Toolbar */}
                      <button
                        type="button"
                        onClick={closeFloatingToolbar}
                        className="p-1.5 rounded-xl hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors ml-0.5 cursor-pointer"
                        title="Close Toolbar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* The Paper Document */}
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "top center",
                  }}
                  className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl border border-border/60 p-8 sm:p-14 min-h-[820px] transition-transform relative"
                >
                  {/* Status Stamp Watermark */}
                  {activeStamp && (
                    <div className="absolute top-6 right-8 border-2 border-dashed border-rose-500 text-rose-500 px-3.5 py-1 rounded-xl font-mono font-extrabold text-xs tracking-widest rotate-[-5deg] uppercase shadow-xs pointer-events-none select-none">
                      {activeStamp}
                    </div>
                  )}

                  {/* Document Paragraph Blocks */}
                  <div className="space-y-4">
                    {pdfParagraphs.map((p) => {
                      const isSelected = selectedParagraphId === p.id;
                      const isHighlighted = !!p.highlightColor;
                      // Check if a remote collaborator is currently editing/viewing this paragraph
                      const activeCollaborator = collaborators.find(
                        (c) => c.id !== currentUser.id && c.paragraphId === p.id
                      );

                      return (
                        <div
                          key={p.id}
                          data-paragraph-id={p.id}
                          onClick={() => {
                            setSelectedParagraphId(p.id);
                            broadcastCursorMove(p.id);
                            if (isHighlightToolActive) toggleHighlight(p.id);
                          }}
                          className={cn(
                            "group relative p-3 rounded-2xl transition-all border cursor-pointer",
                            activeCollaborator
                              ? "ring-2 shadow-sm"
                              : isSelected
                              ? "border-cyan-500 bg-cyan-500/5 shadow-xs"
                              : "border-transparent hover:border-border/60 hover:bg-muted/20",
                            isHighlighted ? "bg-amber-500/15 border-amber-500/40 text-foreground" : ""
                          )}
                          style={{
                            borderColor: activeCollaborator ? activeCollaborator.color : undefined,
                          }}
                        >
                          {/* Live Collaborator Presence Tag over Paragraph */}
                          {activeCollaborator && (
                            <div
                              className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 z-20"
                              style={{ backgroundColor: activeCollaborator.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              {activeCollaborator.name} is editing...
                            </div>
                          )}

                          {isSelected ? (
                            <Textarea
                              value={p.text}
                              onChange={(e) => updateParagraphText(p.id, e.target.value)}
                              rows={Math.max(1, Math.ceil(p.text.length / 65))}
                              className={cn(
                                "w-full text-xs sm:text-sm bg-background/90 border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans leading-relaxed text-foreground resize-none rounded-xl",
                                p.type === "h1" ? "text-xl font-extrabold" : p.type === "h2" ? "text-base font-bold text-cyan-500" : ""
                              )}
                            />
                          ) : (
                            <div>
                              {p.type === "h1" && (
                                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground border-b border-border/40 pb-2">
                                  {p.text}
                                </h1>
                              )}
                              {p.type === "h2" && (
                                <h2 className="text-base sm:text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-3 mb-1">
                                  {p.text}
                                </h2>
                              )}
                              {p.type === "h3" && (
                                <h3 className="text-sm font-semibold text-foreground/90 mt-2 mb-1">
                                  {p.text}
                                </h3>
                              )}
                              {p.type === "bullet" && (
                                <div className="flex items-start gap-2 ml-2 my-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                                  <span className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                                    {p.text}
                                  </span>
                                </div>
                              )}
                              {p.type === "p" && (
                                <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                                  {p.text}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Sticky Note Bubble */}
                          {p.comment && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between gap-2 shadow-2xs">
                              <span className="flex items-center gap-1.5 font-medium">
                                <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                {p.comment}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCommentModalParId(p.id);
                                  setCommentInput(p.comment || "");
                                }}
                                className="text-[10px] text-amber-500 underline font-bold cursor-pointer"
                              >
                                Edit Note
                              </button>
                            </div>
                          )}

                          {/* Hover Block Action Bar */}
                          <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 glass border border-border/50 shadow-lg p-1 rounded-xl z-10 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCommentModalParId(p.id);
                                setCommentInput(p.comment || "");
                              }}
                              className="p-1.5 hover:bg-muted rounded-lg text-amber-500 cursor-pointer"
                              title="Sticky Note Comment"
                            >
                              <StickyNote className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleHighlight(p.id);
                              }}
                              className="p-1.5 hover:bg-muted rounded-lg text-cyan-500 cursor-pointer"
                              title="Highlight Block"
                            >
                              <Highlighter className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteParagraph(p.id);
                              }}
                              className="p-1.5 hover:bg-rose-500/15 rounded-lg text-rose-500 cursor-pointer"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI MAGIC STUDIO */}
          {activeTab === "magic-ai" && (
            <AiMagicStudio
              documentTitle={docTitle}
              fullDocumentText={fullDocText}
              onInsertIntoDoc={(text, type) => {
                const newPar: DocParagraph = {
                  id: `par-ai-${Date.now()}`,
                  type: type || "p",
                  text,
                  pageNumber: 1,
                };
                const next = [...pdfParagraphs, newPar];
                setPdfParagraphs(next);
                broadcastDocUpdate(next, "Inserted AI content");
                createVersionSnapshot("AI Co-Author Draft", "AI Co-Author", "Appended section generated by Magic Studio");
              }}
              onApplyExecutiveSummary={(summary) => {
                const next = [
                  {
                    id: `exec-${Date.now()}`,
                    type: "h2" as const,
                    text: "Executive Summary",
                    pageNumber: 1,
                  },
                  {
                    id: `exec-body-${Date.now()}`,
                    type: "p" as const,
                    text: summary,
                    pageNumber: 1,
                  },
                  ...pdfParagraphs,
                ];
                setPdfParagraphs(next);
                broadcastDocUpdate(next, "Applied Executive Summary");
                createVersionSnapshot("Executive Summary", "AI Co-Author", "Prepended executive summary");
              }}
            />
          )}

          {/* TAB 3: SCAN & OCR DIGITIZER */}
          {activeTab === "ocr" && (
            <div className="glass rounded-3xl border border-border/60 p-6 sm:p-10 space-y-6 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Scan className="w-5 h-5 text-cyan-500" />
                  AI Vision OCR & Document Digitizer
                </h2>
                <p className="text-xs text-muted-foreground">
                  Upload photos, contracts, or scanned paper documents to extract structured text directly into your canvas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Box */}
                <div
                  onClick={() => ocrFileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-cyan-500/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-muted/20 min-h-[300px]"
                >
                  <input
                    ref={ocrFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOcrImageUpload}
                    className="hidden"
                  />
                  {ocrImagePreview ? (
                    <img
                      src={ocrImagePreview}
                      alt="Scanned Preview"
                      className="max-h-60 rounded-xl object-contain shadow-md"
                    />
                  ) : (
                    <div className="space-y-3">
                      <span className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">Click to upload scan or snapshot</p>
                        <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 20MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Extracted Text Box */}
                <div className="glass bg-card/60 rounded-3xl border border-border/60 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Digitized Text Output
                      </span>
                      {isOcrProcessing && (
                        <span className="flex items-center gap-1.5 text-xs text-cyan-500 font-bold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processing OCR...
                        </span>
                      )}
                    </div>

                    <Textarea
                      value={ocrResultText}
                      onChange={(e) => setOcrResultText(e.target.value)}
                      placeholder="OCR text will appear here ready to review..."
                      className="min-h-[220px] text-xs font-mono bg-background border-border/60 rounded-xl"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={handleTransferOcrToCanvas}
                      disabled={!ocrResultText.trim()}
                      className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Append to Canvas Editor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERSION DIFF & MILESTONES */}
          {activeTab === "diff" && (
            <div className="space-y-6">
              <div className="glass rounded-3xl border border-border/60 p-6 sm:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <FileDiff className="w-5 h-5 text-cyan-500" />
                      Side-by-Side Version Diff & History
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Track changes, audit redlines, and restore any previous document checkpoint.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setIsSaveVersionModalOpen(true)}
                    className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-1.5 cursor-pointer self-start"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save New Milestone
                  </Button>
                </div>

                {/* Milestone History Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {versionHistory.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-4 rounded-2xl border border-border/60 bg-card/60 hover:bg-card space-y-2.5 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                          {ver.versionNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ver.timestamp}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground">{ver.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {ver.summary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {ver.paragraphs.length} blocks · {ver.author}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRestoreVersion(ver)}
                          className="h-7 px-2 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-lg gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* MODALS & DIALOGS                                          */}
        {/* ========================================================= */}

        {/* Multi-Format Export Modal (PDF, Word, Markdown, Plain Text, JSON) */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          documentTitle={docTitle}
          paragraphs={pdfParagraphs}
          activeStamp={activeStamp}
        />

        {/* Sticky Note Comment Modal */}
        <Dialog
          open={!!commentModalParId}
          onOpenChange={(open) => !open && setCommentModalParId(null)}
        >
          <DialogContent className="max-w-md glass backdrop-blur-2xl border-border/60 shadow-2xl rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-500" />
                Collaborator Sticky Note
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Attach an editorial comment to this document block for your team.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <Textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write your note or feedback here..."
                rows={3}
                className="text-xs rounded-xl bg-background border-border/60"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommentModalParId(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveComment}
                className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Save Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save Version Snapshot Modal */}
        <Dialog open={isSaveVersionModalOpen} onOpenChange={setIsSaveVersionModalOpen}>
          <DialogContent className="max-w-md glass backdrop-blur-2xl border-border/60 shadow-2xl rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Save className="w-4 h-4 text-cyan-500" />
                Save Milestone Snapshot
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record a permanent checkpoint of your document and all its formatting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Milestone Name</Label>
                <Input
                  value={customVersionName}
                  onChange={(e) => setCustomVersionName(e.target.value)}
                  placeholder="e.g. Q3 Board Approved Draft"
                  className="h-9 text-xs rounded-xl bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Changelog Note</Label>
                <Textarea
                  value={customVersionNote}
                  onChange={(e) => setCustomVersionNote(e.target.value)}
                  placeholder="What changes were introduced in this milestone?"
                  rows={2}
                  className="text-xs rounded-xl bg-background resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSaveVersionModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleManualSaveVersion}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Save Milestone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
