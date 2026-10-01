"use client";
import React, { useState } from "react";
import confetti from "canvas-confetti";
import { GitPullRequest, ShieldCheck, Check, Sparkles, AlertCircle, ArrowUpRight } from "lucide-react";

interface RemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerged?: () => void;
  prData?: any;
}

export const RemediationModal = ({
  isOpen,
  onClose,
  onMerged,
  prData,
}: RemediationModalProps) => {
  const [isMerging, setIsMerging] = useState(false);
  const [isMerged, setIsMerged] = useState(false);

  if (!isOpen) return null;

  const handleMerge = () => {
    setIsMerging(true);
    setTimeout(() => {
      setIsMerging(false);
      setIsMerged(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onMerged) onMerged();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                Automated Hotfix PR #104
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SANDBOX REHEARSAL VERIFIED
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Branch: hotfix/revert-7f9a2b &bull; Target: main
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {/* Verification Card */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Simulated in FalkorDB Ephemeral Multigraph: 0 Circular Deadlocks</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">Rehearsal latency: 14.2ms</span>
        </div>

        {/* Git Diff Block */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>infra/terraform/auth_iam_policy.tf</span>
            <span className="text-emerald-400">+1 / -1</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 font-mono text-xs overflow-x-auto text-slate-300">
            <pre className="text-slate-500">@@ -14,7 +14,7 @@ resource &quot;aws_iam_role&quot; &quot;auth_proxy&quot; &#123;</pre>
            <pre className="text-slate-400">   name = &quot;AuthProxyServiceRole&quot;</pre>
            <pre className="text-red-400 bg-red-950/40 px-1 rounded">-  max_session_duration = 60 # RFC-104 zero-trust regression</pre>
            <pre className="text-emerald-400 bg-emerald-950/40 px-1 rounded">+  max_session_duration = 3600 # Reverted: stabilizes token connection pool</pre>
            <pre className="text-slate-400"> &#125;</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>FalkorDB Procedural Memory DAG will be updated on merge.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition"
            >
              Close
            </button>
            <button
              onClick={handleMerge}
              disabled={isMerging || isMerged}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition ${
                isMerged
                  ? "bg-emerald-600 text-white shadow-emerald-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30"
              }`}
            >
              {isMerging ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Merging PR & Deploying Hotfix...
                </>
              ) : isMerged ? (
                <>
                  <Check className="w-4 h-4" />
                  Merged & Production Restored
                </>
              ) : (
                <>
                  <GitPullRequest className="w-4 h-4" />
                  Approve & Merge Hotfix PR
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
