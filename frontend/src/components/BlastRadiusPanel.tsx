import React from "react";
import { Activity, Flame, DollarSign, Layers } from "lucide-react";

interface BlastRadiusPanelProps {
  blastData?: {
    centrality_score?: number;
    total_downstream_impacted?: number;
    tier1_services_offline?: number;
    estimated_financial_burn_per_minute?: number;
    top_choke_points?: Array<{ name: string; centrality_score: number; is_choke_point: boolean }>;
  };
  isActive?: boolean;
}

export const BlastRadiusPanel = ({ blastData, isActive = true }: BlastRadiusPanelProps) => {
  const financialBurn = blastData?.estimated_financial_burn_per_minute || 4850;
  const impactedCount = blastData?.total_downstream_impacted || 4;
  const centralityScore = blastData?.centrality_score || 0.42;

  return (
    <div className="space-y-4">
      {/* Financial Burn Metric */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent border border-red-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-mono">
              Outage Financial Burn
            </span>
            <span className="text-xl font-bold font-mono text-red-400">
              ${financialBurn.toLocaleString()}<span className="text-xs font-normal text-slate-400">/min</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            <Flame className="w-3 h-3 text-red-400 animate-bounce" /> SEV-1 ACTIVE
          </span>
        </div>
      </div>

      {/* Graph Algorithms: Betweenness Centrality Ranking */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Systemic Choke Points (GraphBLAS Centrality)
          </span>
          <span className="text-[10px] text-slate-500">Score</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-red-500/30 text-xs">
            <span className="font-semibold text-red-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              AuthService (Critical Failure)
            </span>
            <span className="font-mono text-red-400 font-bold">{centralityScore}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-white/5 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              CheckoutService (Degraded)
            </span>
            <span className="font-mono text-amber-400">0.029</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-white/5 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              ApiGateway (504 Spikes)
            </span>
            <span className="font-mono text-blue-400">0.013</span>
          </div>
        </div>
      </div>

      {/* Downstream Tier 1 Impact */}
      <div className="p-3 rounded-lg bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Downstream Tier-1 Dependencies</span>
        </div>
        <span className="font-mono font-bold text-slate-100 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
          {impactedCount} Services
        </span>
      </div>
    </div>
  );
};
