"use client";
import React, { useState } from "react";
import { Play, Terminal, Zap, Clock, Database, Check } from "lucide-react";

interface CypherConsoleProps {
  onHighlightNodes?: (nodeIds: string[]) => void;
}

const PRESET_QUERIES = [
  {
    label: "Dependency Graph",
    query: "MATCH (s:Service)-[r:DEPENDS_ON]->(t:Service) RETURN s.name AS Source, t.name AS Target",
  },
  {
    label: "Causal Failure Chain",
    query: "MATCH (a:Alert)-[:TRIGGERED_BY]->(s:Service)<-[:DEPLOYED_TO]-(c:Commit) RETURN a.name, s.name, c.name",
  },
  {
    label: "Org & Team Ownership",
    query: "MATCH (e:Engineer)-[:MEMBER_OF]->(t:Team) RETURN e.name AS Engineer, t.name AS Team",
  },
  {
    label: "Decision Lineage",
    query: "MATCH (d:Decision)-[:ENFORCED_IN]->(c:Commit) RETURN d.name AS RFC, c.name AS Commit",
  },
];

export const CypherConsole = ({ onHighlightNodes }: CypherConsoleProps) => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/graph/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResult(data);
      setLatency(data.execution_time_ms || 1.2);
    } catch (e) {
      console.error("Cypher execution failed", e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Preset Query Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Presets:</span>
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(preset.query)}
            className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-indigo-600/30 text-[11px] text-slate-300 border border-white/5 hover:border-indigo-500/40 transition"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Query Text Area & Run Button */}
      <div className="relative rounded-xl bg-slate-950 border border-white/10 p-2.5 focus-within:border-indigo-500/50 shadow-inner">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-indigo-400">
            <Terminal className="w-3.5 h-3.5" /> openCypher Editor
          </span>
          {latency !== null && (
            <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <Zap className="w-3 h-3" /> {latency}ms
            </span>
          )}
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          className="w-full bg-transparent text-slate-200 outline-none resize-none font-mono text-xs placeholder:text-slate-600"
          placeholder="Enter openCypher query..."
        />

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Database className="w-3 h-3 text-indigo-400" /> Graph: enterprise_master
          </span>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                Execute Cypher
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-1">
            <span>Result Set ({result.data?.length || 0} rows)</span>
            <span className="text-indigo-400 text-[10px] font-mono">{result.source}</span>
          </div>

          {result.data && result.data.length > 0 ? (
            <table className="w-full text-left text-[11px] text-slate-300">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  {result.columns?.map((col: string, i: number) => (
                    <th key={i} className="py-1 px-2 font-mono">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.slice(0, 5).map((row: any[], i: number) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    {Array.isArray(row) ? (
                      row.map((val: any, j: number) => (
                        <td key={j} className="py-1 px-2 font-mono text-indigo-200">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </td>
                      ))
                    ) : (
                      <td className="py-1 px-2 font-mono text-indigo-200">{String(row)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-[11px]">Query executed successfully with 0 rows returned.</p>
          )}
        </div>
      )}
    </div>
  );
};
