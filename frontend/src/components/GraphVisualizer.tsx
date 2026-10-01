"use client";
import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RefreshCw, Eye, ShieldAlert, Cpu } from "lucide-react";

interface NodeItem {
  id: string;
  label: string;
  name: string;
  properties?: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface EdgeItem {
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

interface GraphVisualizerProps {
  nodes: NodeItem[];
  edges: EdgeItem[];
  highlightedPath?: string[];
  activeIncident?: boolean;
  onSelectNode?: (node: NodeItem) => void;
}

export const GraphVisualizer = ({
  nodes: initialNodes,
  edges,
  highlightedPath = [],
  activeIncident = true,
  onSelectNode,
}: GraphVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Initialize node physics coordinates
  useEffect(() => {
    if (!initialNodes || initialNodes.length === 0) return;
    const width = 800;
    const height = 500;
    const placedNodes = initialNodes.map((n, i) => {
      const angle = (i / initialNodes.length) * 2 * Math.PI;
      const radius = 120 + ((i % 3) * 60);
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    });
    setNodes(placedNodes);
  }, [initialNodes]);

  // Color mapping based on FalkorDB node label
  const getNodeColor = (node: NodeItem) => {
    const isRootCause = node.id === "commit_broken" || node.name === "7f9a2b";
    const isCriticalSvc = node.id === "svc_auth" || node.id === "alert_504";
    const isHighlighted = highlightedPath.includes(node.id);

    if (isRootCause) return { fill: "#f97316", stroke: "#ffedd5", glow: "rgba(249, 115, 22, 0.8)" }; // Orange root cause
    if (isCriticalSvc && activeIncident) return { fill: "#ef4444", stroke: "#fee2e2", glow: "rgba(239, 68, 68, 0.8)" }; // Red failing
    if (isHighlighted) return { fill: "#a855f7", stroke: "#f3e8ff", glow: "rgba(168, 85, 247, 0.8)" }; // Purple path

    switch (node.label) {
      case "Service": return { fill: "#3b82f6", stroke: "#dbeafe", glow: "rgba(59, 130, 246, 0.4)" };
      case "Database": return { fill: "#10b981", stroke: "#d1fae5", glow: "rgba(16, 185, 129, 0.4)" };
      case "Pod": return { fill: "#eab308", stroke: "#fef9c3", glow: "rgba(234, 179, 8, 0.4)" };
      case "Commit": return { fill: "#ec4899", stroke: "#fce7f3", glow: "rgba(236, 72, 153, 0.4)" };
      case "Engineer": return { fill: "#06b6d4", stroke: "#cffafe", glow: "rgba(6, 182, 212, 0.4)" };
      case "Decision": return { fill: "#8b5cf6", stroke: "#ede9fe", glow: "rgba(139, 92, 246, 0.4)" };
      case "Alert": return { fill: "#ef4444", stroke: "#fecaca", glow: "rgba(239, 68, 68, 0.6)" };
      default: return { fill: "#64748b", stroke: "#f1f5f9", glow: "rgba(100, 116, 139, 0.3)" };
    }
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Pan & Zoom transform
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Map lookup
      const nodeMap = new Map<string, NodeItem>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      // 1. Draw Edges
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target || source.x == null || source.y == null || target.x == null || target.y == null) return;

        const isPathEdge = highlightedPath.includes(edge.source) && highlightedPath.includes(edge.target);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isPathEdge ? "rgba(249, 115, 22, 0.8)" : "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = isPathEdge ? 2.5 : 1;
        ctx.stroke();

        // Animated pulse packet on highlighted edge
        if (isPathEdge) {
          const progress = (tick % 60) / 60;
          const px = source.x + (target.x - source.x) * progress;
          const py = source.y + (target.y - source.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = "#f97316";
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 2. Draw Nodes
      nodes.forEach((node) => {
        if (node.x == null || node.y == null) return;
        const color = getNodeColor(node);
        const isSelected = selectedNode?.id === node.id;
        const isPulsing = (node.id === "commit_broken" || node.id === "svc_auth") && activeIncident;

        const radius = isSelected ? 16 : isPulsing ? 14 + Math.sin(tick * 0.1) * 2 : 11;

        // Glow ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
        ctx.fillStyle = color.glow;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color.fill;
        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Label text
        ctx.font = "10px Inter, sans-serif";
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "center";
        ctx.fillText(node.name || node.id, node.x, node.y + radius + 13);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, edges, highlightedPath, activeIncident, selectedNode, zoom, pan]);

  // Click handler for node selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    const clicked = nodes.find((n) => {
      if (n.x == null || n.y == null) return false;
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= 18;
    });

    if (clicked) {
      setSelectedNode(clicked);
      if (onSelectNode) onSelectNode(clicked);
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 flex flex-col">
      {/* Top Floating Controls & Legend */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" /> Service</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> DB</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" /> Culprit Commit</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" /> Alert</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" /> RFC Decision</span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-white/10">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
          className="p-1.5 hover:bg-white/10 rounded text-slate-300 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
          className="p-1.5 hover:bg-white/10 rounded text-slate-300 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 hover:bg-white/10 rounded text-slate-300 transition"
          title="Reset"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={900}
        height={520}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Info Sheet if Node is selected */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-indigo-500/40 text-xs text-slate-200 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold">
              {selectedNode.label}
            </div>
            <div>
              <p className="font-semibold text-slate-100">{selectedNode.name}</p>
              <p className="text-slate-400 font-mono text-[11px]">ID: {selectedNode.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            {selectedNode.properties && Object.entries(selectedNode.properties).slice(0, 3).map(([k, v]) => (
              <div key={k} className="hidden sm:block">
                <span className="text-slate-500 uppercase text-[10px] block">{k}</span>
                <span className="font-mono text-indigo-300">{String(v)}</span>
              </div>
            ))}
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
