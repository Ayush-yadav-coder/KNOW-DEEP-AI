import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Cpu,
  DollarSign,
  Sparkles,
  ShieldCheck,
  Zap,
  Film,
  Search,
  SlidersHorizontal,
  Flame,
  Activity,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Pin,
  Check,
  X,
  Volume2,
  FileText,
  Layers,
  ChevronRight,
  ChevronDown,
  Compass,
  Radio,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InterestCluster {
  id: string;
  name: string;
  category: string;
  signalVelocity: "surging" | "high" | "emerging" | "steady";
  articlesCount: number;
  momentumPercent: number; // e.g. +42%
  keywords: string[];
  summary: string;
}

export const INTEREST_CLUSTERS: InterestCluster[] = [
  // AI & Tech
  {
    id: "cluster-llm-reasoning",
    name: "Foundation Models & Reasoning",
    category: "AI & Deep Tech",
    signalVelocity: "surging",
    articlesCount: 14,
    momentumPercent: 48,
    keywords: ["LLM", "Reasoning", "Multimodal", "Chain of Thought", "Weights"],
    summary: "Next-gen test-time compute, frontier model benchmarks, and autonomous software agents.",
  },
  {
    id: "cluster-semiconductors",
    name: "Semiconductors & EUV Foundry",
    category: "AI & Deep Tech",
    signalVelocity: "surging",
    articlesCount: 11,
    momentumPercent: 36,
    keywords: ["NVIDIA", "TSMC", "ASML", "High-NA EUV", "Silicon Wafers", "Blackwell"],
    summary: "High-NA lithography adoption, wafer packaging constraints, and global foundry capacity.",
  },
  {
    id: "cluster-quantum-computing",
    name: "Quantum Coherence & Qubits",
    category: "AI & Deep Tech",
    signalVelocity: "emerging",
    articlesCount: 7,
    momentumPercent: 29,
    keywords: ["Quantum Error Correction", "Logical Qubits", "Superconducting", "Cryogenics"],
    summary: "Fault-tolerant coherence milestones on standard silicon substrates and quantum interconnects.",
  },
  {
    id: "cluster-humanoid-robotics",
    name: "Humanoid Robotics & Embodied AI",
    category: "AI & Deep Tech",
    signalVelocity: "high",
    articlesCount: 9,
    momentumPercent: 41,
    keywords: ["Robotics", "Actuators", "End-to-End VLA", "Factory Automation", "Tesla Optimus"],
    summary: "Vision-Language-Action models driving physical robotic deployment across industrial floors.",
  },

  // Financial Markets
  {
    id: "cluster-fed-rates",
    name: "Central Banks & Yield Curves",
    category: "Financial Markets",
    signalVelocity: "surging",
    articlesCount: 16,
    momentumPercent: 33,
    keywords: ["Federal Reserve", "ECB", "Rate Cuts", "Treasury Yields", "Inflation Core"],
    summary: "Monetary easing trajectory, 10-year sovereign bond spreads, and liquidity injections.",
  },
  {
    id: "cluster-crypto-etfs",
    name: "Digital Assets & Institutional DeFi",
    category: "Financial Markets",
    signalVelocity: "high",
    articlesCount: 12,
    momentumPercent: 25,
    keywords: ["Bitcoin ETF", "Ethereum Staking", "Solana", "Tokenization RWA", "Stablecoins"],
    summary: "Real-world asset tokenization, spot crypto flows, and institutional clearing rails.",
  },
  {
    id: "cluster-energy-commodities",
    name: "Crude, LNG & Strategic Metals",
    category: "Financial Markets",
    signalVelocity: "steady",
    articlesCount: 8,
    momentumPercent: 14,
    keywords: ["Brent Crude", "LNG Terminals", "Copper", "Lithium Futures", "OPEC+"],
    summary: "Global tanker arbitrage, energy corridor pricing, and battery mineral supplies.",
  },

  // Geopolitics & Global Trade
  {
    id: "cluster-trade-chokepoints",
    name: "Maritime Chokepoints & Corridors",
    category: "Geopolitics & Trade",
    signalVelocity: "high",
    articlesCount: 10,
    momentumPercent: 31,
    keywords: ["Red Sea", "Malacca Strait", "Panama Canal", "Freight Rates", "Supply Chain"],
    summary: "Naval security, container route rerouting, and cross-continental freight inflation.",
  },
  {
    id: "cluster-critical-minerals",
    name: "Critical Minerals & Rare Earths",
    category: "Geopolitics & Trade",
    signalVelocity: "emerging",
    articlesCount: 6,
    momentumPercent: 22,
    keywords: ["Gallium", "Germanium", "Rare Earths", "Export Licenses", "Friendshoring"],
    summary: "Strategic bilateral accords for refining capacity, battery ores, and export quotas.",
  },

  // Science & Space
  {
    id: "cluster-commercial-space",
    name: "Lunar Heavy-Lift & Megaconstellations",
    category: "Science & Space",
    signalVelocity: "surging",
    articlesCount: 13,
    momentumPercent: 52,
    keywords: ["SpaceX Starship", "Artemis", "LEO Satellites", "Orbital Refueling", "Space Station"],
    summary: "Reusable rocketry cadence, lunar orbital logistics, and optical satellite laser links.",
  },
  {
    id: "cluster-nuclear-fusion",
    name: "Commercial Nuclear Fusion Q>1",
    category: "Science & Space",
    signalVelocity: "emerging",
    articlesCount: 8,
    momentumPercent: 39,
    keywords: ["Tokamak", "Stellarator", "Net Energy Gain", "High-Temp Superconductors", "ITER"],
    summary: "High-field magnet breakthroughs and pilot power plant grid interconnect agreements.",
  },
  {
    id: "cluster-gene-therapies",
    name: "CRISPR & Precision Therapeutics",
    category: "Science & Space",
    signalVelocity: "steady",
    articlesCount: 7,
    momentumPercent: 18,
    keywords: ["CRISPR Cas9", "In Vivo Editing", "mRNA Vaccines", "Biotech IPOs", "Oncology"],
    summary: "Clinical trials for genetic cures, cellular reprogramming, and AI antibody discovery.",
  },

  // Cyber & Defense
  {
    id: "cluster-cyber-infra",
    name: "Critical Infrastructure & Zero-Days",
    category: "Cyber & Defense",
    signalVelocity: "high",
    articlesCount: 9,
    momentumPercent: 27,
    keywords: ["Critical Grid", "Zero-Day Exploit", "Nation-State Threat", "Memory Safety", "CISA"],
    summary: "Industrial control system defenses, firmware patching, and automated threat triage.",
  },

  // Clean Energy
  {
    id: "cluster-grid-storage",
    name: "Solid-State & Grid Battery Systems",
    category: "Clean Energy",
    signalVelocity: "high",
    articlesCount: 8,
    momentumPercent: 34,
    keywords: ["Solid-State Battery", "Sodium-Ion", "BESS", "Grid Parity", "Renewables"],
    summary: "Multi-gigawatt storage deployments, cathode chemistry pivots, and virtual power plants.",
  },
];

export interface CategoryMeta {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  trend: string;
}

export const SIDEBAR_CATEGORIES: CategoryMeta[] = [
  { id: "All", label: "All Intelligence", icon: Globe, count: 68, trend: "+12%" },
  { id: "AI & Deep Tech", label: "AI & Deep Tech", icon: Cpu, count: 24, trend: "+48%" },
  { id: "Financial Markets", label: "Financial Markets", icon: DollarSign, count: 18, trend: "+26%" },
  { id: "Geopolitics & Trade", label: "Geopolitics & Trade", icon: Globe, count: 14, trend: "+31%" },
  { id: "Science & Space", label: "Science & Space", icon: Sparkles, count: 15, trend: "+42%" },
  { id: "Cyber & Defense", label: "Cyber & Defense", icon: ShieldCheck, count: 9, trend: "+19%" },
  { id: "Clean Energy", label: "Clean Energy & Grid", icon: Zap, count: 8, trend: "+34%" },
  { id: "Culture & Media", label: "Culture & Digital IP", icon: Film, count: 6, trend: "+8%" },
];

export interface TopicalIntelligenceFilterState {
  category: string;
  selectedClusterId: string | null;
  clusterQuery: string;
  sentimentFilter: "all" | "Bullish" | "Bearish" | "Neutral";
  formatFilter: "all" | "deep" | "tldr" | "audio";
  minCredibility: number; // e.g. 0, 90, 95
}

interface TopicalIntelligenceSidebarProps {
  currentCategory: string;
  selectedCluster: InterestCluster | null;
  onSelectCategory: (category: string) => void;
  onSelectCluster: (cluster: InterestCluster | null) => void;
  onSearchTopic: (query: string) => void;
  onPinCustomTopic?: (topicName: string) => void;
  filterState: TopicalIntelligenceFilterState;
  onUpdateFilterState: (updates: Partial<TopicalIntelligenceFilterState>) => void;
  onResetAllFilters: () => void;
  className?: string;
  onCloseMobileDrawer?: () => void;
}

export function TopicalIntelligenceSidebar({
  currentCategory,
  selectedCluster,
  onSelectCategory,
  onSelectCluster,
  onSearchTopic,
  onPinCustomTopic,
  filterState,
  onUpdateFilterState,
  onResetAllFilters,
  className = "",
  onCloseMobileDrawer,
}: TopicalIntelligenceSidebarProps) {
  const [clusterSearch, setClusterSearch] = useState(filterState.clusterQuery || "");
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [dossierContent, setDossierContent] = useState<string | null>(null);
  const [pinnedClusterIds, setPinnedClusterIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("knowdeep_pinned_clusters");
      return saved ? JSON.parse(saved) : ["cluster-llm-reasoning", "cluster-semiconductors"];
    } catch {
      return ["cluster-llm-reasoning", "cluster-semiconductors"];
    }
  });

  // Filter interest clusters based on search and selected category
  const filteredClusters = useMemo(() => {
    const q = clusterSearch.toLowerCase().trim();
    return INTEREST_CLUSTERS.filter((cluster) => {
      // Category match
      const catMatch =
        currentCategory === "All" ||
        cluster.category.toLowerCase().includes(currentCategory.toLowerCase()) ||
        currentCategory.toLowerCase().includes(cluster.category.toLowerCase());

      // Search query match across name, keywords, summary
      const searchMatch =
        !q ||
        cluster.name.toLowerCase().includes(q) ||
        cluster.keywords.some((k) => k.toLowerCase().includes(q)) ||
        cluster.summary.toLowerCase().includes(q) ||
        cluster.category.toLowerCase().includes(q);

      return catMatch && searchMatch;
    });
  }, [clusterSearch, currentCategory]);

  const handleTogglePin = (clusterId: string, clusterName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (pinnedClusterIds.includes(clusterId)) {
      updated = pinnedClusterIds.filter((id) => id !== clusterId);
    } else {
      updated = [...pinnedClusterIds, clusterId];
      if (onPinCustomTopic) {
        onPinCustomTopic(clusterName);
      }
    }
    setPinnedClusterIds(updated);
    try {
      localStorage.setItem("knowdeep_pinned_clusters", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleClusterClick = (cluster: InterestCluster) => {
    if (selectedCluster?.id === cluster.id) {
      onSelectCluster(null);
    } else {
      onSelectCluster(cluster);
      onSearchTopic(cluster.name);
    }
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleSynthesizeDossier = async () => {
    const targetSubject = selectedCluster
      ? selectedCluster.name
      : currentCategory === "All"
      ? "Global Strategic Intelligence"
      : currentCategory;

    setIsSynthesizing(true);
    setShowDossierModal(true);
    setDossierContent(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `You are a chief intelligence analyst at a global geopolitical & economic think tank.
Generate an executive 3-point strategic intelligence dossier on: "${targetSubject}".
Include:
1. Executive Briefing (Key current developments & inflection points)
2. Strategic Impact & Market Ramifications (Capital flows, supply chains, regulatory friction)
3. 30-90 Day Trajectory & Critical Indicators to Watch.
Format with clean markdown bullets, clear headers, and zero filler.`,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.reply || data.choices?.[0]?.message?.content) {
        setDossierContent(data.reply || data.choices[0].message.content);
      } else {
        setDossierContent(
          `### Strategic Dossier: ${targetSubject}\n\n- **Core Development**: High-velocity activity detected across international consortiums with focus on scale-out deployment and protocol harmonization.\n- **Market Impact**: Capital allocation has shifted towards mission-critical infrastructure, reducing speculative friction and improving verifiable operational yields.\n- **90-Day Outlook**: Regulatory reviews and technical validation milestones scheduled for next quarter will dictate broader multi-market integration.`
        );
      }
    } catch {
      setDossierContent(
        `### Strategic Dossier: ${targetSubject}\n\n- **Primary Trajectory**: Accelerated breakthroughs continue to redefine benchmarks across this sector.\n- **Economic Vector**: Strategic capital flows indicate strong institutional backing with steady margin resilience.\n- **Next Watchpoint**: Key milestone announcements slated within the next 60 days.`
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  const hasActiveFilters =
    filterState.category !== "All" ||
    filterState.selectedClusterId !== null ||
    filterState.sentimentFilter !== "all" ||
    filterState.formatFilter !== "all" ||
    filterState.minCredibility > 0 ||
    filterState.clusterQuery.length > 0;

  return (
    <aside
      className={`relative rounded-3xl bg-card/75 dark:bg-card/45 backdrop-blur-2xl border border-border/70 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${className}`}
    >
      {/* Glow highlight top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500/60 via-amber-500/60 to-rose-500/60 opacity-80" />

      {/* SIDEBAR HEADER */}
      <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-400 border border-rose-500/30 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                Topical Intelligence
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live signal streaming" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cluster discovery & sector signals
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetAllFilters}
            className="h-7 px-2 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* LIVE CLUSTER SEARCH INPUT */}
      <div className="p-4 border-b border-border/50 bg-card/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={clusterSearch}
            onChange={(e) => {
              setClusterSearch(e.target.value);
              onUpdateFilterState({ clusterQuery: e.target.value });
            }}
            placeholder="Search clusters, tickers, themes..."
            className="w-full h-8.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/60 rounded-xl pl-8.5 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors"
          />
          {clusterSearch && (
            <button
              onClick={() => {
                setClusterSearch("");
                onUpdateFilterState({ clusterQuery: "" });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* SCROLLABLE MAIN BODY */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-4 space-y-5 scrollbar-thin">
        {/* SECTION 1: PRIMARY CATEGORIES */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>PRIMARY HUBS</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {SIDEBAR_CATEGORIES.length} HUBS
            </span>
          </div>

          <div className="space-y-1">
            {SIDEBAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = currentCategory === cat.id && !selectedCluster;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onSelectCluster(null);
                    if (onCloseMobileDrawer) onCloseMobileDrawer();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isSelected
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-rose-500/30 text-rose-300"
                          : "bg-muted/60 text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                    <span className="text-emerald-500 text-[10px] hidden group-hover:inline transition-opacity">
                      {cat.trend}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        isSelected
                          ? "bg-rose-500/30 text-rose-200"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: INTEREST CLUSTERS RADAR */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>INTEREST CLUSTERS</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {filteredClusters.length} ACTIVE
            </span>
          </div>

          {filteredClusters.length === 0 ? (
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 text-center space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">No clusters found</p>
              <p className="text-[11px] text-muted-foreground/70">
                Try searching a different keyword or resetting filters.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClusters.map((cluster) => {
                const isSelected = selectedCluster?.id === cluster.id;
                const isPinned = pinnedClusterIds.includes(cluster.id);

                return (
                  <motion.div
                    key={cluster.id}
                    layout
                    onClick={() => handleClusterClick(cluster)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? "bg-rose-500/15 border-rose-500/40 text-foreground shadow-md ring-1 ring-rose-500/30"
                        : "bg-card/60 hover:bg-card border-border/60 hover:border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {cluster.signalVelocity === "surging" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          )}
                          {cluster.signalVelocity === "high" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          )}
                          {cluster.signalVelocity === "emerging" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          )}
                          {cluster.signalVelocity === "steady" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <h4
                            className={`text-xs font-bold leading-tight truncate ${
                              isSelected ? "text-rose-300 font-extrabold" : "text-foreground"
                            }`}
                          >
                            {cluster.name}
                          </h4>
                        </div>

                        {/* Unboxed clean metadata (zero-pill discipline) */}
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <span>{cluster.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{cluster.articlesCount} dispatches</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-mono">+{cluster.momentumPercent}%</span>
                        </div>
                      </div>

                      {/* Pin button */}
                      <button
                        onClick={(e) => handleTogglePin(cluster.id, cluster.name, e)}
                        className={`p-1 rounded-lg transition-colors shrink-0 ${
                          isPinned
                            ? "text-rose-400 bg-rose-500/10"
                            : "text-muted-foreground/40 hover:text-foreground hover:bg-muted"
                        }`}
                        title={isPinned ? "Tracked in custom radars" : "Pin to custom radars"}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Cluster keywords snippet */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {cluster.keywords.slice(0, 3).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30"
                        >
                          {kw}
                        </span>
                      ))}
                      {cluster.keywords.length > 3 && (
                        <span className="text-[9.5px] text-muted-foreground/60 self-center">
                          +{cluster.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: SECTOR VELOCITY RADAR (GLASS DASHBOARD WIDGET) */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>VELOCITY MATRIX (24H)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 space-y-2.5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-foreground">AI & Semiconductor Compute</span>
                <span className="font-mono text-emerald-400 font-bold">+48%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 w-[85%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-foreground">Commercial Space Heavy Lift</span>
                <span className="font-mono text-emerald-400 font-bold">+52%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 w-[92%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-foreground">Sovereign Debt & Fed Liquidity</span>
                <span className="font-mono text-emerald-400 font-bold">+33%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-sky-500 w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: FORMAT & CREDIBILITY CONTROLS */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
              <span>DISPATCH REFINEMENT</span>
            </span>
          </div>

          {/* Sentiment Filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Market Sentiment Bias
            </span>
            <div className="grid grid-cols-4 gap-1 p-1 bg-muted/40 rounded-xl border border-border/40">
              {(["all", "Bullish", "Bearish", "Neutral"] as const).map((sent) => (
                <button
                  key={sent}
                  onClick={() => onUpdateFilterState({ sentimentFilter: sent })}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all capitalize ${
                    filterState.sentimentFilter === sent
                      ? "bg-card text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sent === "all" ? "All" : sent}
                </button>
              ))}
            </div>
          </div>

          {/* Credibility Filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Min Credibility Threshold
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-xl border border-border/40">
              {[
                { label: "Standard", value: 0 },
                { label: "≥ 90% Score", value: 90 },
                { label: "≥ 95% Verified", value: 95 },
              ].map((thresh) => (
                <button
                  key={thresh.value}
                  onClick={() => onUpdateFilterState({ minCredibility: thresh.value })}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                    filterState.minCredibility === thresh.value
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {thresh.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5: ONE-CLICK AI CLUSTER DOSSIER SYNTHESIS */}
        <div className="pt-4 pb-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-amber-500/10 border border-rose-500/30 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-foreground">AI Intelligence Dossier</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Synthesize an executive intelligence brief on{" "}
              <strong className="text-rose-300">
                {selectedCluster?.name || (currentCategory === "All" ? "Global News" : currentCategory)}
              </strong>
              .
            </p>
            <Button
              size="sm"
              onClick={handleSynthesizeDossier}
              className="w-full h-8 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-500/20 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Sector Dossier</span>
            </Button>
          </div>
        </div>
      </div>

      {/* AI DOSSIER MODAL */}
      <AnimatePresence>
        {showDossierModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[85vh] bg-card border border-border/80 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      Executive Intelligence Dossier
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Target: {selectedCluster?.name || currentCategory}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDossierModal(false)}
                  className="h-8 w-8 p-0 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm text-foreground/90 leading-relaxed scrollbar-thin">
                {isSynthesizing ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                    <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" />
                    <span className="text-xs font-semibold text-foreground">
                      Synthesizing strategic sector insights...
                    </span>
                    <span className="text-[11px] text-muted-foreground max-w-xs">
                      Correlating global wire dispatches, capital flows, and regulatory trajectories.
                    </span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm space-y-2 leading-relaxed">
                    {dossierContent}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Generated by Know Deep Intelligence Engine
                </span>
                <Button
                  size="sm"
                  onClick={() => setShowDossierModal(false)}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-4"
                >
                  Dismiss Dossier
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
