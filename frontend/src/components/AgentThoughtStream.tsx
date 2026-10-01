"use client";
import React, { useRef, useEffect } from "react";
import { Terminal, Bot, CheckCircle2, AlertTriangle, ShieldCheck, Play, ArrowRight } from "lucide-react";

export interface SwarmStep {
  step: number;
  agent: string;
  status: string;
  message: string;
  progress?: number;
  data?: any;
}

interface AgentThoughtStreamProps {
  steps: SwarmStep[];
  isRunning: boolean;
  onTriggerIncident: () => void;
}

export const AgentThoughtStream = ({
  steps,
  isRunning,
  onTriggerIncident,
}: AgentThoughtStreamProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  const getAgentBadgeColor = (agent: string) => {
    switch (agent) {
      case "TRIAGE_AGENT": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "BLAST_RADIUS_AGENT": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "COMPANY_BRAIN_AGENT": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "REMEDIATION_AGENT": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header & Simulation Trigger Button */}
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Swarm Reasoning Stream (SSE)
          </span>
        </div>
        <button
          onClick={onTriggerIncident}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-medium shadow-lg shadow-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Reasoning in FalkorDB...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              Simulate Outage & Mobilize
            </>
          )}
        </button>
      </div>

      {/* Terminal Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2.5 pr-2 font-mono text-xs max-h-[380px]"
      >
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center">
            <Bot className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
            <p className="text-xs">Swarm mesh standby in FalkorDB.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Click &apos;Simulate Outage & Mobilize&apos; to trigger multi-hop agent reasoning.
            </p>
          </div>
        ) : (
          steps.map((st, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 transition-all hover:border-white/10"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAgentBadgeColor(st.agent)}`}>
                  {st.agent}
                </span>
                <span className="text-[10px] text-slate-500">
                  Step 0{st.step}
                </span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {st.message}
              </p>
              {st.data?.root_cause_commit && (
                <div className="mt-2 p-2 rounded bg-orange-950/30 border border-orange-500/20 text-[11px] text-orange-300">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Culprit Commit: {st.data.root_cause_commit.sha}
                  </div>
                  <div className="text-slate-400 mt-0.5">Author: {st.data.root_cause_commit.author}</div>
                  <div className="text-slate-400">File: {st.data.root_cause_commit.file_affected}</div>
                </div>
              )}
              {st.data?.github_pull_request && (
                <div className="mt-2 p-2 rounded bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Rehearsal Sandbox Verified
                  </div>
                  <div className="text-slate-400 mt-0.5">PR Branch: {st.data.github_pull_request.branch}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
