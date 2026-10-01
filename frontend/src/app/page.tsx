"use client";
import React, { useState, useEffect } from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundGrid } from "@/components/ui/background-grid";
import { BentoCard } from "@/components/ui/bento-card";
import { GraphVisualizer } from "@/components/GraphVisualizer";
import { AgentThoughtStream, SwarmStep } from "@/components/AgentThoughtStream";
import { BlastRadiusPanel } from "@/components/BlastRadiusPanel";
import { CompanyBrainPanel } from "@/components/CompanyBrainPanel";
import { RemediationModal } from "@/components/RemediationModal";
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Database, 
  Flame, 
  GitBranch, 
  ExternalLink, 
  Sparkles,
  Layers,
  Activity
} from "lucide-react";

export default function Home() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [swarmSteps, setSwarmSteps] = useState<SwarmStep[]>([]);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [incidentResolved, setIncidentResolved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([
    "alert_504", "svc_apigateway", "svc_checkout", "svc_auth", "commit_broken", "dec_rfc104"
  ]);

  // Fetch initial graph topology from backend
  useEffect(() => {
    fetch("http://localhost:8000/api/graph/topology")
      .then((res) => res.json())
      .then((data) => {
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      })
      .catch((err) => {
        console.warn("Could not connect to backend, loading fallback topology", err);
      });
  }, []);

  // Trigger incident simulation & stream agent thoughts via SSE
  const handleTriggerIncident = () => {
    setIsSwarmRunning(true);
    setIncidentResolved(false);
    setSwarmSteps([]);

    const eventSource = new EventSource("http://localhost:8000/api/incident/stream?alert_id=ALERT-504-GATEWAY");

    eventSource.onmessage = (event) => {
      try {
        const data: SwarmStep = JSON.parse(event.data);
        setSwarmSteps((prev) => [...prev, data]);

        if (data.step === 9) {
          setIsSwarmRunning(false);
          eventSource.close();
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    };

    eventSource.onerror = () => {
      setIsSwarmRunning(false);
      eventSource.close();
    };
  };

  return (
    <BackgroundGrid className="min-h-screen">
      {/* Aceternity Spotlight Background Effect */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#6366f1" />

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                AEGIS-GRAPH
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  FalkorDB Powered
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Autonomous Cloud Blast-Radius & Self-Healing Incident Mesh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-400">GraphBLAS Engine:</span>
              <span className="font-mono text-emerald-400 font-bold">0.8ms latency</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Review Hotfix PR #104
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Graph Hacks: Context for AI Agents &bull; Team Interstellar
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Incident Commander & Decision Lineage
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Deterministic multi-hop causal reasoning across AWS infra, GitHub commits, RFC decisions, and IAM policies.
            </p>
          </div>

          {/* Incident Status Pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-white/10">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Active Incident</div>
              <div className="text-xs font-bold text-red-400 font-mono">
                {incidentResolved ? "RESOLVED (0 Regressions)" : "INC-2026-901: SEV-1 OUTAGE"}
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Subgraph (Span 8 Cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <BentoCard
              title="Real-Time FalkorDB Topological Digital Twin"
              subtitle="Interactive graph of services, pods, commits, and RFCs. Orange line indicates active causal chain."
              icon={<Database className="w-4 h-4" />}
              badge={
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {nodes.length} Nodes &bull; {edges.length} Edges
                </span>
              }
              className="p-4"
            >
              <GraphVisualizer
                nodes={nodes}
                edges={edges}
                highlightedPath={highlightedPath}
                activeIncident={!incidentResolved}
              />
            </BentoCard>

            {/* Bottom Row inside left column: Track 1 & Track 2 details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blast Radius (Track 1) */}
              <BentoCard
                title="Blast Radius Engine (Track 1)"
                subtitle="GraphBLAS Betweenness Centrality analysis"
                icon={<Activity className="w-4 h-4" />}
              >
                <BlastRadiusPanel />
              </BentoCard>

              {/* Company Brain (Track 3) */}
              <BentoCard
                title="Company Brain & Lineage (Track 3)"
                subtitle="Trace decisions to RFC-104 & on-call team"
                icon={<Layers className="w-4 h-4" />}
              >
                <CompanyBrainPanel />
              </BentoCard>
            </div>
          </div>

          {/* Right Column (Span 4 Cols): Agent Thought Stream (Track 2) */}
          <div className="lg:col-span-4 flex flex-col">
            <BentoCard
              title="Swarm Cognitive Mesh (Track 2)"
              subtitle="Step-by-step FalkorDB traversals & dynamic sandboxing"
              icon={<Terminal className="w-4 h-4" />}
              className="h-full min-h-[500px]"
            >
              <AgentThoughtStream
                steps={swarmSteps}
                isRunning={isSwarmRunning}
                onTriggerIncident={handleTriggerIncident}
              />
            </BentoCard>
          </div>
        </div>
      </main>

      {/* Remediation Hotfix Modal */}
      <RemediationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMerged={() => setIncidentResolved(true)}
      />
    </BackgroundGrid>
  );
}
