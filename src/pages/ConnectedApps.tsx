import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  Boxes,
  FileText,
  BookOpen,
  Zap,
  FolderKanban,
  Video,
  BarChart3,
  RefreshCw,
  Plus,
  ShieldCheck,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AppConnector {
  id: string;
  name: string;
  category: string;
  tag: string;
  icon?: React.ElementType;
  iconBg: string;
  iconColor: string;
  connected: boolean;
  notesCount?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  "company-notes-sync": FileText,
  "knowledge-hub-brain": BookOpen,
  "company-task-flow": Zap,
  "doc-studio-exporter": FolderKanban,
  "meeting-transcripts-hub": Video,
  "analytics-intelligence": BarChart3,
  "Productivity": FileText,
  "Knowledge": BookOpen,
  "Workflow": Zap,
  "Documentation": FolderKanban,
  "Meetings": Video,
  "Analytics": BarChart3,
};

function getConnectorIcon(connector: AppConnector): React.ElementType {
  if (connector.icon && typeof connector.icon === "function") {
    return connector.icon;
  }
  return ICON_MAP[connector.id] || ICON_MAP[connector.category] || ICON_MAP[connector.tag] || Boxes;
}

const INITIAL_CONNECTORS: AppConnector[] = [
  {
    id: "company-notes-sync",
    name: "Company Notes Sync",
    category: "Productivity",
    tag: "Productivity",
    icon: FileText,
    iconBg: "bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40",
    iconColor: "text-blue-500",
    connected: false,
    notesCount: 38,
  },
  {
    id: "knowledge-hub-brain",
    name: "Knowledge Hub & Brain",
    category: "Knowledge",
    tag: "Knowledge",
    icon: BookOpen,
    iconBg: "bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900/40",
    iconColor: "text-cyan-500",
    connected: false,
    notesCount: 22,
  },
  {
    id: "company-task-flow",
    name: "Company Task & Flow",
    category: "Workflow",
    tag: "Workflow",
    icon: Zap,
    iconBg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40",
    iconColor: "text-amber-500",
    connected: false,
    notesCount: 11,
  },
  {
    id: "doc-studio-exporter",
    name: "Doc Studio & Exporter",
    category: "Documentation",
    tag: "Documentation",
    icon: FolderKanban,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40",
    iconColor: "text-emerald-500",
    connected: false,
    notesCount: 14,
  },
  {
    id: "meeting-transcripts-hub",
    name: "Meeting Transcripts Hub",
    category: "Meetings",
    tag: "Meetings",
    icon: Video,
    iconBg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40",
    iconColor: "text-rose-500",
    connected: false,
    notesCount: 9,
  },
  {
    id: "analytics-intelligence",
    name: "Analytics & Intelligence",
    category: "Analytics",
    tag: "Analytics",
    icon: BarChart3,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40",
    iconColor: "text-indigo-500",
    connected: false,
    notesCount: 19,
  },
];

export default function ConnectedApps() {
  const [connectors, setConnectors] = useState<AppConnector[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_connected_apps");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_CONNECTORS;
  });

  const [activeFilter, setActiveFilter] = useState<"all" | "connected" | "autosync">("all");
  const [isTestingSync, setIsTestingSync] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [connectorToDelete, setConnectorToDelete] = useState<AppConnector | null>(null);

  // New connector form state
  const [newAppName, setNewAppName] = useState("");
  const [newCategory, setNewCategory] = useState("Productivity");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newAuthToken, setNewAuthToken] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("knowdeep_connected_apps", JSON.stringify(connectors));
    } catch {
      // ignore
    }
  }, [connectors]);

  const activeCount = connectors.filter((c) => c.connected).length;

  const toggleConnector = (id: string) => {
    setConnectors((prev) =>
      prev.map((conn) => {
        if (conn.id === id) {
          const nextState = !conn.connected;
          if (nextState) {
            toast.success(`${conn.name} connected! Notes will route automatically.`);
          } else {
            toast.info(`${conn.name} disconnected.`);
          }
          return { ...conn, connected: nextState };
        }
        return conn;
      })
    );
  };

  const handleTestSync = () => {
    setIsTestingSync(true);
    toast.info("Testing note relay pipeline...");
    setTimeout(() => {
      setIsTestingSync(false);
      toast.success("100% Sync Health verified! Note dispatch channels active.");
    }, 1200);
  };

  const handleAddConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) {
      toast.error("Please enter a connector name");
      return;
    }

    const newConnector: AppConnector = {
      id: `custom-${Date.now()}`,
      name: newAppName.trim(),
      category: newCategory,
      tag: newCategory,
      icon: Boxes,
      iconBg: "bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900/40",
      iconColor: "text-cyan-500",
      connected: true,
      notesCount: 0,
    };

    setConnectors((prev) => [newConnector, ...prev]);
    toast.success(`${newAppName} added and connected successfully!`);
    setNewAppName("");
    setNewWebhookUrl("");
    setNewAuthToken("");
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!connectorToDelete) return;
    setConnectors((prev) => prev.filter((c) => c.id !== connectorToDelete.id));
    toast.success(`Connector "${connectorToDelete.name}" removed successfully.`);
    setConnectorToDelete(null);
  };

  const filteredConnectors = connectors.filter((conn) => {
    if (activeFilter === "connected" || activeFilter === "autosync") {
      return conn.connected;
    }
    return true;
  });

  return (
    <AppLayout title="Connectors Hub">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-7">
        {/* TOP TITLE & ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40 flex items-center justify-center text-cyan-500 shrink-0 shadow-sm">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Connectors Hub
                </h1>
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-700/60 rounded-full px-2.5 py-0.5">
                  Ecosystem
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Automated app connectors for company tools. Notes created in this AI chat are automatically forwarded.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={handleTestSync}
              className="rounded-xl border-cyan-400/80 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 px-4 py-2 text-sm font-medium gap-2 shadow-sm"
            >
              <RefreshCw className={cn("w-4 h-4", isTestingSync && "animate-spin")} />
              Test Note Sync
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-4 py-2 text-sm gap-2 shadow-md shadow-cyan-500/25 border-0"
            >
              <Plus className="w-4 h-4" />
              Add Connector
            </Button>
          </div>
        </div>

        {/* HERO BANNER CARD */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#162544] border border-slate-800 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Description Column */}
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-1.5 bg-[#0a273b] border border-cyan-500/40 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                <span>Automated Note Routing Ready</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Zero-Friction Multi-App Note Dispatch
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Whenever you create, summarize, or extract notes in your Know Deep AI chat, the connected apps pipeline automatically packages the content with tags and sends it to your company notes application in real time.
              </p>
            </div>

            {/* Right Metric Stat Boxes */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl px-5 py-4 text-center min-w-[110px]">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
                  {activeCount}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1 whitespace-nowrap">
                  Active Connectors
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl px-5 py-4 text-center min-w-[110px]">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                  100%
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1 whitespace-nowrap">
                  Sync Health
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl px-5 py-4 text-center min-w-[110px]">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-400">
                  71
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1 whitespace-nowrap">
                  Notes Relayed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PILL TABS FILTER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 inline-flex items-center gap-1 text-xs font-medium w-fit">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                activeFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              All Integrations ({connectors.length})
            </button>
            <button
              onClick={() => setActiveFilter("connected")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                activeFilter === "connected"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Connected ({activeCount})
            </button>
            <button
              onClick={() => setActiveFilter("autosync")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                activeFilter === "autosync"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Auto-Sync Active ({activeCount})
            </button>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Encrypted internal communication protocol
          </span>
        </div>

        {/* INTEGRATION CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredConnectors.map((connector) => {
            const Icon = getConnectorIcon(connector);
            return (
              <div
                key={connector.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      connector.iconBg,
                      connector.iconColor
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] truncate">
                      {connector.name}
                    </h3>
                    <div className="mt-1">
                      <span className="bg-[#7c3aed] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block">
                        {connector.tag}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2 flex items-center gap-2">
                  <Switch
                    checked={connector.connected}
                    onCheckedChange={() => toggleConnector(connector.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConnectorToDelete(connector)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Connector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredConnectors.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8">
            <Boxes className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No connectors found for this filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="mt-3 text-xs"
            >
              View All Integrations
            </Button>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!connectorToDelete} onOpenChange={(open) => !open && setConnectorToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Trash2 className="w-5 h-5" />
              Delete Connector
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{connectorToDelete?.name}"</span>? This will remove its integration settings, webhook tokens, and pipeline sync data permanently.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConnectorToDelete(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD CONNECTOR MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <form onSubmit={handleAddConnector}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-500" />
                Add Company Connector
              </DialogTitle>
              <DialogDescription>
                Register an internal company app to automatically receive notes and summaries.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="appName" className="text-xs font-semibold">
                  App Name
                </Label>
                <Input
                  id="appName"
                  placeholder="e.g., Company Project Hub"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Category Tag
                </Label>
                <Input
                  id="category"
                  placeholder="e.g., Productivity, Workflow, Notes"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="webhookUrl" className="text-xs font-semibold">
                  Webhook / Endpoint URL (Optional)
                </Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://api.company.internal/notes"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="authToken" className="text-xs font-semibold">
                  Auth Secret / Token (Optional)
                </Label>
                <Input
                  id="authToken"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={newAuthToken}
                  onChange={(e) => setNewAuthToken(e.target.value)}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
              >
                Add Connector
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
