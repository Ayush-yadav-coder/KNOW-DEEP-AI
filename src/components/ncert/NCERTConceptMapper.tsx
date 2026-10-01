import React, { useState, useMemo, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Network,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  Filter,
  Layers,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  BookOpen,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  NCERTChapter,
  generateChapterConceptMap,
  ConceptNode,
} from "@/data/ncertCurriculum";

interface NCERTConceptMapperProps {
  chapter: NCERTChapter;
  classNameLabel: string;
  subjectName: string;
  onAskTutorAboutConcept?: (concept: string) => void;
}

// Category styling metadata with light & dark theme tokens
const CATEGORY_META: Record<
  ConceptNode["category"],
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  core: {
    label: "Core Chapter",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-500",
    text: "text-amber-800 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  character: {
    label: "Character / Figure",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-500",
    text: "text-rose-800 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  theme: {
    label: "Central Theme",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-500",
    text: "text-purple-800 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  topic: {
    label: "Curriculum Topic",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-500",
    text: "text-blue-800 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  formula: {
    label: "Formula / Proof",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-500",
    text: "text-emerald-800 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  law: {
    label: "Scientific Law / Code",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-500",
    text: "text-cyan-800 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
};

// Custom Node Component for React Flow
const ConceptNodeComponent = ({
  data,
  selected,
}: {
  data: {
    concept: ConceptNode;
    onClickNode: (c: ConceptNode) => void;
  };
  selected?: boolean;
}) => {
  const { concept, onClickNode } = data;
  const meta = CATEGORY_META[concept.category] || CATEGORY_META.topic;

  return (
    <div
      onClick={() => onClickNode(concept)}
      className={`px-4 py-3 rounded-2xl border-2 transition-all shadow-md cursor-pointer min-w-[170px] max-w-[240px] text-left select-none ${
        meta.bg
      } ${
        selected
          ? "border-amber-500 ring-4 ring-amber-500/30 scale-105 shadow-lg"
          : meta.border
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 border border-white dark:border-slate-900"
      />

      <div className="flex items-center justify-between gap-1.5 mb-1">
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${meta.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
        {concept.label}
      </h4>

      {concept.description && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300/80 mt-1 line-clamp-2 leading-relaxed font-medium">
          {concept.description}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 border border-white dark:border-slate-900"
      />
    </div>
  );
};

const nodeTypes = {
  conceptNode: ConceptNodeComponent,
};

export const NCERTConceptMapper: React.FC<NCERTConceptMapperProps> = ({
  chapter,
  classNameLabel,
  subjectName,
  onAskTutorAboutConcept,
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || theme === "dark";

  // Generate or read chapter concept map
  const rawMap = useMemo(() => generateChapterConceptMap(chapter), [chapter]);

  // Selected node state for side inspector
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(
    () => rawMap.nodes[0] || null
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleSelectNode = useCallback((concept: ConceptNode) => {
    setSelectedNode(concept);
  }, []);

  // Compute Layout Positions (Radial / Tree pattern)
  const initialNodes: Node[] = useMemo(() => {
    const total = rawMap.nodes.length;
    const centerX = 360;
    const centerY = 240;
    const radius = 230;

    return rawMap.nodes.map((n, idx) => {
      let x = centerX;
      let y = centerY;

      if (n.category === "core") {
        x = centerX;
        y = centerY;
      } else {
        // Place peripheral nodes radially around center
        const angle = ((idx - 1) / (total - 1)) * 2 * Math.PI - Math.PI / 2;
        x = centerX + radius * Math.cos(angle);
        y = centerY + (radius * 0.9) * Math.sin(angle);
      }

      return {
        id: n.id,
        type: "conceptNode",
        position: { x, y },
        data: {
          concept: n,
          onClickNode: handleSelectNode,
        },
      };
    });
  }, [rawMap, handleSelectNode]);

  const initialEdges: Edge[] = useMemo(() => {
    return rawMap.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated ?? true,
      style: { stroke: isDark ? "#94a3b8" : "#64748b", strokeWidth: 2 },
      labelStyle: {
        fill: isDark ? "#cbd5e1" : "#1e293b",
        fontSize: 10,
        fontFamily: "monospace",
        fontWeight: 700,
      },
      labelBgStyle: {
        fill: isDark ? "#0f172a" : "#ffffff",
        fillOpacity: 0.9,
        rx: 6,
        ry: 6,
      },
      labelBgPadding: [6, 4] as [number, number],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: isDark ? "#94a3b8" : "#64748b",
      },
    }));
  }, [rawMap, isDark]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when chapter changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNode(rawMap.nodes[0] || null);
  }, [initialNodes, initialEdges, rawMap, setNodes, setEdges]);

  // Find relationships connected to selected node
  const connectedRelations = useMemo(() => {
    if (!selectedNode) return [];
    return rawMap.edges
      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
      .map((e) => {
        const isSource = e.source === selectedNode.id;
        const otherId = isSource ? e.target : e.source;
        const otherNode = rawMap.nodes.find((n) => n.id === otherId);
        return {
          relationship: e.label,
          targetNode: otherNode,
          direction: isSource ? "outgoing" : "incoming",
        };
      })
      .filter((rel) => rel.targetNode !== undefined);
  }, [selectedNode, rawMap]);

  return (
    <div className="space-y-4">
      {/* Top Banner Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Interactive Concept &amp; Character Mapper</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30">
                Dynamic Node Graph
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Drag nodes to rearrange, zoom with controls, or tap any node to inspect relationship mechanics.
            </p>
          </div>
        </div>

        {/* Legend pills & theatre toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(CATEGORY_META).map(([key, val]) => (
              <span
                key={key}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${val.border} ${val.bg} ${val.text} font-bold flex items-center gap-1`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${val.dot}`} />
                {val.label.split(" ")[0]}
              </span>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 text-xs rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 gap-1 ml-auto"
            title={isExpanded ? "Standard View" : "Spacious Theatre View"}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Compact
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Expand
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Interactive Graph & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* React Flow Canvas (8 cols or 12 if expanded) */}
        <div
          className={`${
            isExpanded ? "lg:col-span-12 h-[680px]" : "lg:col-span-8 h-[540px]"
          } rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-300`}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.8}
            className={isDark ? "bg-slate-950" : "bg-slate-50"}
          >
            <Background
              color={isDark ? "#334155" : "#cbd5e1"}
              gap={20}
              size={1.2}
            />
            <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 fill-slate-700 dark:fill-slate-300 rounded-xl shadow-sm" />
            <MiniMap
              nodeColor={(node) => {
                const c = (node.data as any)?.concept?.category;
                if (c === "core") return "#f59e0b";
                if (c === "character") return "#f43f5e";
                if (c === "theme") return "#a855f7";
                if (c === "formula") return "#10b981";
                return "#3b82f6";
              }}
              maskColor={
                isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(241, 245, 249, 0.75)"
              }
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
            />
            <Panel
              position="top-right"
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 shadow-sm"
            >
              {rawMap.nodes.length} Nodes · {rawMap.edges.length} Connections
            </Panel>
          </ReactFlow>
        </div>

        {/* Selected Node Details Inspector */}
        <div
          className={`${
            isExpanded ? "lg:col-span-12" : "lg:col-span-4"
          } p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between`}
        >
          {selectedNode ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      CATEGORY_META[selectedNode.category]?.dot || "bg-indigo-400"
                    }`}
                  />
                  <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                    {CATEGORY_META[selectedNode.category]?.label || "Concept"}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Node Inspector
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                  {selectedNode.description}
                </p>
              </div>

              {selectedNode.details && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold block">
                    Textbook Significance:
                  </span>
                  <p className="text-slate-700 dark:text-slate-400 leading-relaxed">
                    {selectedNode.details}
                  </p>
                </div>
              )}

              {/* Connected relations */}
              {connectedRelations.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
                    Connected Curriculum Links ({connectedRelations.length}):
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {connectedRelations.map((rel, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          rel.targetNode && handleSelectNode(rel.targetNode)
                        }
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-[11px] flex items-center justify-between gap-2 hover:border-indigo-400/50 cursor-pointer transition-colors"
                      >
                        <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px] shrink-0">
                          {rel.relationship}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                          {rel.targetNode?.label}
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bridge to AI Tutor */}
              {onAskTutorAboutConcept && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <Button
                    size="sm"
                    onClick={() =>
                      onAskTutorAboutConcept(
                        `Explain the concept of "${selectedNode.label}" from Chapter ${chapter.chapterNumber}: ${chapter.title}. Explain its significance in the NCERT syllabus, how it connects to other topics, and common CBSE board exam questions asked on it.`
                      )
                    }
                    className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask AI Tutor About This Concept</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Network className="w-8 h-8 opacity-40 mx-auto" />
              <p className="text-xs">Click any node to inspect relationships</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
