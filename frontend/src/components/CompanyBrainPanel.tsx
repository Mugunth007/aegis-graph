import React from "react";
import { GitPullRequest, FileText, Users, PhoneCall, ShieldAlert, MessageSquare } from "lucide-react";

interface CompanyBrainPanelProps {
  brainData?: any;
}

export const CompanyBrainPanel = ({ brainData }: CompanyBrainPanelProps) => {
  return (
    <div className="space-y-3.5 text-xs">
      {/* Decision Lineage Box */}
      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-purple-300 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-purple-400" /> Decision Lineage (Track 3)
          </span>
          <span className="text-[10px] text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
            RFC-104
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Commit <code className="text-orange-400 bg-orange-950/40 px-1 py-0.5 rounded font-mono">7f9a2b</code> was pushed to enforce <strong className="text-white">RFC-104: Zero-Trust IAM Policy</strong>. Approved by SecurityBoard on Sep 24.
        </p>
        <div className="text-[10px] text-slate-400 border-t border-purple-500/10 pt-1.5 flex items-center justify-between">
          <span>Architect: <span className="text-slate-200">Sarah Lin</span></span>
          <span>Committer: <span className="text-slate-200">Devon Miller</span></span>
        </div>
      </div>

      {/* Escalation & On-Call Team */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-indigo-400" /> Active On-Call Incident Commanders
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
              M
            </div>
            <div>
              <p className="font-semibold text-slate-100 text-[11px]">Mugunth</p>
              <p className="text-[10px] text-slate-400">Staff SRE / Commander</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Paged on Slack
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">
              S
            </div>
            <div>
              <p className="font-semibold text-slate-100 text-[11px]">Sarah Lin</p>
              <p className="text-[10px] text-slate-400">Security Architect</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            @sarah.lin
          </span>
        </div>
      </div>

      {/* Slack War Room */}
      <div className="p-2 rounded-lg bg-slate-950/40 border border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-300">
          <MessageSquare className="w-3.5 h-3.5 text-pink-400" /> War Room Channel
        </span>
        <code className="text-indigo-400 font-mono">#core-platform-outage</code>
      </div>
    </div>
  );
};
