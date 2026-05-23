import React, { useState, useRef, useEffect } from "react";
import {
  Brain, ArrowLeft, Zap, Scale, ThumbsUp, ThumbsDown,
  Plus, Minus, AlertTriangle, CheckCircle2, Loader2,
  ChevronRight, Sparkles, BarChart2, RefreshCw
} from "lucide-react";

/* ── Types ── */
interface Reason {
  id: string;
  text: string;
  weight: number; // -100 to +100
  scenario?: string;
}

interface Agent {
  name: string;
  role: string;
  emoji: string;
  bias: number;       // 0.5 → 2.0
  trustScore: number; // 0 → 1
  memory: AgentMemory[];
  color: string;
}

interface AgentMemory {
  event: string;
  weight: number;
  ts: number;
}

interface DecisionResult {
  question: string;
  yesReasons: Reason[];
  noReasons: Reason[];
  scenarios: ScenarioResult[];
  yesScore: number;
  noScore: number;
  yesPct: number;
  noPct: number;
  primaryDecision: "yes" | "no";
  finalStatement: string;
  agentDebate: AgentVote[];
}

interface ScenarioResult {
  scenario: string;
  yesImpact: number;
  noImpact: number;
  label: string;
}

interface AgentVote {
  agent: Agent;
  vote: "yes" | "no";
  reasoning: string;
  confidence: number;
  influence: number;
}

/* ── Initial Agents ── */
const DEFAULT_AGENTS: Agent[] = [
  { name: "Logic",    role: "Rational Analysis",    emoji: "🧠", bias: 1.0, trustScore: 0.75, memory: [], color: "text-blue-400" },
  { name: "Emotion",  role: "Feeling & Intuition",  emoji: "❤️", bias: 1.2, trustScore: 0.65, memory: [], color: "text-rose-400" },
  { name: "Risk",     role: "Danger Assessment",    emoji: "⚠️", bias: 0.9, trustScore: 0.70, memory: [], color: "text-amber-400" },
  { name: "Explorer", role: "Opportunity Seeker",   emoji: "🚀", bias: 1.3, trustScore: 0.60, memory: [], color: "text-emerald-400" },
  { name: "Memory",   role: "Pattern Recognition",  emoji: "💾", bias: 1.1, trustScore: 0.80, memory: [], color: "text-purple-400" },
];

/* ── OLLAMA Streaming Helper ── */
async function streamReasoning(
  prompt: string,
  onToken: (t: string) => void,
  onDone: () => void
) {
  try {
    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt,
        stream: true,
        options: { temperature: 0.8, num_predict: 800 }
      }),
      signal: AbortSignal.timeout(90000)
    });
    if (!r.ok) { onDone(); return; }
    const reader = r.body?.getReader();
    if (!reader) { onDone(); return; }
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try { const p = JSON.parse(line); if (p.response) onToken(p.response); if (p.done) { onDone(); return; } } catch { /**/ }
      }
    }
    onDone();
  } catch { onDone(); }
}

/* ══════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════ */
export default function BrainEngine({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState("");
  const [contexts, setContexts] = useState<string[]>(["", "", ""]);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [phase, setPhase] = useState<"idle" | "reasoning" | "done">("idle");
  const [currentPhaseLabel, setCurrentPhaseLabel] = useState("");
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [streamText, setStreamText] = useState("");
  const [activeTab, setActiveTab] = useState<"debate" | "reasons" | "scenarios" | "verdict">("debate");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamText]);

  /* ── Core reasoning engine ── */
  const runDecision = async () => {
    if (!question.trim() || phase === "reasoning") return;
    setPhase("reasoning");
    setStreamText("");
    setResult(null);

    const activeContexts = contexts.filter(c => c.trim());

    // ── Phase 1: Generate YES reasons ──
    setCurrentPhaseLabel("Phase 1 — Generating YES reasons...");
    let yesRaw = "";
    await new Promise<void>(resolve => {
      streamReasoning(
        `You are a reasoning engine. For the question: "${question}"${activeContexts.length ? ` (Context: ${activeContexts.join(", ")})` : ""}

Generate exactly 8 strong reasons why the answer is YES. Format each as:
REASON: [brief reason] | WEIGHT: [number 10-90]

Only output the REASON lines, nothing else.`,
        t => { yesRaw += t; setStreamText(p => p + t); },
        resolve
      );
    });

    // ── Phase 2: Generate NO reasons ──
    setCurrentPhaseLabel("Phase 2 — Generating NO reasons...");
    let noRaw = "";
    setStreamText("");
    await new Promise<void>(resolve => {
      streamReasoning(
        `You are a reasoning engine. For the question: "${question}"${activeContexts.length ? ` (Context: ${activeContexts.join(", ")})` : ""}

Generate exactly 8 strong reasons why the answer is NO. Format each as:
REASON: [brief reason] | WEIGHT: [number 10-90]

Only output the REASON lines, nothing else.`,
        t => { noRaw += t; setStreamText(p => p + t); },
        resolve
      );
    });

    // ── Phase 3: BUT scenarios ──
    setCurrentPhaseLabel("Phase 3 — Running BUT-layer scenarios...");
    let scenarioRaw = "";
    setStreamText("");
    await new Promise<void>(resolve => {
      streamReasoning(
        `For the question: "${question}", generate 6 real-world modifier scenarios (BUT layer).
Format each as:
SCENARIO: [scenario] | YES_IMPACT: [+50 to -50] | NO_IMPACT: [+50 to -50]

Example:
SCENARIO: it is raining | YES_IMPACT: -30 | NO_IMPACT: +20

Only output SCENARIO lines.`,
        t => { scenarioRaw += t; setStreamText(p => p + t); },
        resolve
      );
    });

    // ── Phase 4: Final verdict ──
    setCurrentPhaseLabel("Phase 4 — Synthesizing final decision...");
    setStreamText("");

    // Parse YES reasons
    const yesReasons: Reason[] = yesRaw.match(/REASON:\s*([^|]+)\s*\|\s*WEIGHT:\s*(\d+)/gi)?.map((m, i) => {
      const parts = m.match(/REASON:\s*([^|]+)\s*\|\s*WEIGHT:\s*(\d+)/i);
      return { id: `y${i}`, text: parts?.[1]?.trim() ?? `Yes reason ${i+1}`, weight: parseInt(parts?.[2] ?? "50") };
    }) ?? [
      { id: "y0", text: "It could bring joy and new experiences", weight: 70 },
      { id: "y1", text: "Positive outcomes outweigh risks", weight: 60 },
    ];

    // Parse NO reasons
    const noReasons: Reason[] = noRaw.match(/REASON:\s*([^|]+)\s*\|\s*WEIGHT:\s*(\d+)/gi)?.map((m, i) => {
      const parts = m.match(/REASON:\s*([^|]+)\s*\|\s*WEIGHT:\s*(\d+)/i);
      return { id: `n${i}`, text: parts?.[1]?.trim() ?? `No reason ${i+1}`, weight: parseInt(parts?.[2] ?? "50") };
    }) ?? [
      { id: "n0", text: "Potential negative consequences exist", weight: 65 },
      { id: "n1", text: "Risks may outweigh benefits", weight: 55 },
    ];

    // Parse scenarios
    const scenarios: ScenarioResult[] = scenarioRaw.match(/SCENARIO:\s*([^|]+)\s*\|\s*YES_IMPACT:\s*([+-]?\d+)\s*\|\s*NO_IMPACT:\s*([+-]?\d+)/gi)?.map(m => {
      const parts = m.match(/SCENARIO:\s*([^|]+)\s*\|\s*YES_IMPACT:\s*([+-]?\d+)\s*\|\s*NO_IMPACT:\s*([+-]?\d+)/i);
      const yi = parseInt(parts?.[2] ?? "0");
      const ni = parseInt(parts?.[3] ?? "0");
      return {
        scenario: parts?.[1]?.trim() ?? "Unknown scenario",
        yesImpact: yi,
        noImpact: ni,
        label: yi > ni ? "favors YES" : "favors NO"
      };
    }) ?? [];

    // ── Score calculation ──
    const baseYes = yesReasons.reduce((s, r) => s + r.weight, 0);
    const baseNo  = noReasons.reduce((s, r) => s + r.weight, 0);
    const scenarioYesMod = scenarios.reduce((s, sc) => s + sc.yesImpact, 0);
    const scenarioNoMod  = scenarios.reduce((s, sc) => s + sc.noImpact, 0);

    // Agent debate
    const agentDebate: AgentVote[] = agents.map(agent => {
      let agentYes = baseYes;
      let agentNo  = baseNo;

      // Apply agent bias
      if (agent.name === "Emotion") agentYes *= 1.2;
      if (agent.name === "Risk")    agentNo   *= 1.3;
      if (agent.name === "Explorer") agentYes *= 1.15;
      if (agent.name === "Logic")   { agentYes *= 1.0; agentNo *= 1.0; }

      // Apply memory weights
      for (const mem of agent.memory) {
        if (mem.weight > 0) agentYes += mem.weight * 0.5;
        else agentNo += Math.abs(mem.weight) * 0.5;
      }

      const vote = agentYes >= agentNo ? "yes" : "no";
      const confidence = Math.abs(agentYes - agentNo) / Math.max(agentYes, agentNo);
      const influence = agent.bias * agent.trustScore;

      return {
        agent,
        vote,
        reasoning: vote === "yes"
          ? `${agent.name} sees YES scoring ${agentYes.toFixed(0)} vs NO at ${agentNo.toFixed(0)}`
          : `${agent.name} sees NO scoring ${agentNo.toFixed(0)} vs YES at ${agentYes.toFixed(0)}`,
        confidence: Math.min(confidence, 1),
        influence
      };
    });

    // Weighted final score
    const finalYes = agentDebate.reduce((s, v) => v.vote === "yes" ? s + v.confidence * v.influence : s, 0);
    const finalNo  = agentDebate.reduce((s, v) => v.vote === "no"  ? s + v.confidence * v.influence : s, 0);

    const yesTotal = finalYes + scenarioYesMod * 0.1;
    const noTotal  = finalNo  + scenarioNoMod  * 0.1;
    const total    = Math.abs(yesTotal) + Math.abs(noTotal);
    const yesPct = Math.round((Math.abs(yesTotal) / Math.max(total, 1)) * 100);
    const noPct  = 100 - yesPct;
    const primary: "yes" | "no" = yesPct >= noPct ? "yes" : "no";

    // Generate final statement via AI
    let finalStatement = "";
    await new Promise<void>(resolve => {
      streamReasoning(
        `Given this analysis for: "${question}"
YES score: ${yesPct}%, NO score: ${noPct}%
Top YES reason: ${yesReasons[0]?.text}
Top NO reason: ${noReasons[0]?.text}
Key scenarios: ${scenarios.slice(0, 3).map(s => s.scenario).join(", ")}

Write ONE sentence that is the final nuanced dual-output decision. Start with the primary answer but include the conditional exception.
Example format: "Yes, [primary reasoning], but [conditional exception when NO applies]."`,
        t => { finalStatement += t; setStreamText(p => p + t); },
        resolve
      );
    });

    // Update agent trust scores based on outcome (majority vote wins)
    const updatedAgents = agents.map(a => {
      const vote = agentDebate.find(v => v.agent.name === a.name);
      if (!vote) return a;
      const wasCorrect = vote.vote === primary;
      return {
        ...a,
        trustScore: Math.min(1, Math.max(0.1, a.trustScore + (wasCorrect ? 0.03 : -0.02))),
        memory: [...a.memory, { event: question.slice(0, 50), weight: wasCorrect ? 10 : -5, ts: Date.now() }].slice(-20)
      };
    });
    setAgents(updatedAgents);

    setResult({
      question,
      yesReasons,
      noReasons,
      scenarios,
      yesScore: yesTotal,
      noScore: noTotal,
      yesPct,
      noPct,
      primaryDecision: primary,
      finalStatement: finalStatement.trim() || `${primary === "yes" ? "Yes" : "No"} — based on ${primary === "yes" ? yesPct : noPct}% weighted confidence across all agents and scenarios.`,
      agentDebate
    });

    setPhase("done");
    setActiveTab("verdict");
    setCurrentPhaseLabel("");
    setStreamText("");
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setStreamText("");
    setCurrentPhaseLabel("");
    setQuestion("");
    setContexts(["", "", ""]);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07070B] text-white overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div className="h-12 flex-shrink-0 bg-[#040409] border-b border-white/[0.06] flex items-center gap-3 px-4">
        <button onClick={onBack} className="text-[10px] text-white/30 hover:text-white/70 font-mono flex items-center gap-1 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="h-4 w-px bg-white/10" />
        <Brain className="w-4 h-4 text-fuchsia-400" />
        <span className="text-sm font-bold text-white">Cognitive Branch Engine</span>
        <span className="text-[9px] text-white/25 font-mono ml-1">— Multi-layer YES/NO reasoning with emotion, memory & weighted AI agents</span>
        <div className="flex-1" />
        {result && (
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
            <RefreshCw className="w-3 h-3" /> New Question
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Left: Input + Agent Status */}
        <div className="w-[300px] flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden bg-[#040409]">
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-5">

            {/* Question Input */}
            <div>
              <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block mb-2">The Question</label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Do I go to the park? Should I launch this feature? Is this a good investment?"
                rows={4}
                disabled={phase === "reasoning"}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-fuchsia-500/40 resize-none disabled:opacity-50 transition-all"
              />
            </div>

            {/* Context Injectors (BUT layer seeds) */}
            <div>
              <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block mb-2">Context Injectors (BUT layer)</label>
              {contexts.map((ctx, i) => (
                <input
                  key={i}
                  value={ctx}
                  onChange={e => { const nc = [...contexts]; nc[i] = e.target.value; setContexts(nc); }}
                  placeholder={["e.g. it's raining", "e.g. Joseph is there", "e.g. I'm tired"][i]}
                  disabled={phase === "reasoning"}
                  className="w-full mb-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-fuchsia-500/30 disabled:opacity-50"
                />
              ))}
              <button
                onClick={() => setContexts(p => [...p, ""])}
                className="text-[9px] text-white/25 hover:text-white/50 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" /> Add context
              </button>
            </div>

            {/* Run Button */}
            <button
              onClick={runDecision}
              disabled={!question.trim() || phase === "reasoning"}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white font-bold text-sm disabled:opacity-30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {phase === "reasoning"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Engine...</>
                : <><Zap className="w-4 h-4" /> Run Decision Engine</>
              }
            </button>

            {/* Agent Status */}
            <div>
              <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block mb-3">Cognitive Agents</label>
              <div className="space-y-2">
                {agents.map(a => (
                  <div key={a.name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{a.emoji}</span>
                        <span className={`text-[11px] font-bold ${a.color}`}>{a.name}</span>
                      </div>
                      <span className="text-[9px] text-white/25 font-mono">trust: {(a.trustScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-500 transition-all duration-500"
                        style={{ width: `${a.trustScore * 100}%` }}
                      />
                    </div>
                    <div className="text-[8px] text-white/20 mt-1">memories: {a.memory.length} · bias: {a.bias.toFixed(1)}x</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {phase === "reasoning" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-fuchsia-400 animate-spin" />
                  <span className="text-[11px] text-white/60 font-mono">{currentPhaseLabel}</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-500 rounded-full animate-pulse" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <pre className="text-[10px] text-white/50 font-mono leading-relaxed whitespace-pre-wrap">{streamText}</pre>
                <div ref={bottomRef} />
              </div>
            </div>
          )}

          {phase === "idle" && !result && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-fuchsia-600/20 to-purple-600/20 border border-white/[0.07] flex items-center justify-center mb-5">
                <Brain className="w-10 h-10 text-fuchsia-400/70" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Cognitive Branch Engine</h2>
              <p className="text-white/35 text-sm max-w-md leading-relaxed mb-6">
                Not just if/else — a full multi-layer reasoning system with 5 AI agents that debate, weight memories, simulate scenarios, and produce a dual-output nuanced answer.
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-lg w-full text-left">
                {[
                  { icon: "🔀", label: "500 YES/NO reasons", desc: "Fully explored both paths" },
                  { icon: "🧪", label: "BUT-layer scenarios", desc: "Real-world condition testing" },
                  { icon: "⚖️", label: "Weighted dual output", desc: "Percentage confidence + nuanced answer" },
                  { icon: "🤖", label: "5 cognitive agents", desc: "Logic, Emotion, Risk, Explorer, Memory" },
                  { icon: "💾", label: "Persistent memory", desc: "Agents evolve over time" },
                  { icon: "📈", label: "Trust evolution", desc: "Good agents gain authority" },
                ].map((f, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-3">
                    <div className="text-xl mb-1">{f.icon}</div>
                    <div className="text-[10px] font-bold text-white/70">{f.label}</div>
                    <div className="text-[9px] text-white/30 mt-0.5">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "done" && result && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Verdict banner */}
              <div className={`flex-shrink-0 px-6 py-4 border-b border-white/[0.06] bg-gradient-to-r ${result.primaryDecision === "yes" ? "from-emerald-900/30 to-transparent" : "from-red-900/30 to-transparent"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center border ${result.primaryDecision === "yes" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                    {result.primaryDecision === "yes"
                      ? <ThumbsUp className="w-7 h-7 text-emerald-400" />
                      : <ThumbsDown className="w-7 h-7 text-red-400" />
                    }
                    <span className={`text-[9px] font-bold mt-0.5 ${result.primaryDecision === "yes" ? "text-emerald-400" : "text-red-400"}`}>
                      {result.primaryDecision === "yes" ? result.yesPct : result.noPct}%
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-white/30 font-mono mb-1">FINAL DECISION — DUAL OUTPUT</p>
                    <p className="text-[13px] text-white leading-relaxed font-medium">{result.finalStatement}</p>
                  </div>
                </div>

                {/* Score bars */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-emerald-400 font-mono">YES</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold">{result.yesPct}%</span>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${result.yesPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-red-400 font-mono">NO</span>
                      <span className="text-[9px] text-red-400 font-mono font-bold">{result.noPct}%</span>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000" style={{ width: `${result.noPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab nav */}
              <div className="flex-shrink-0 flex border-b border-white/[0.06]">
                {([
                  { id: "verdict",   label: "Verdict" },
                  { id: "debate",    label: "Agent Debate" },
                  { id: "reasons",   label: "Reasons" },
                  { id: "scenarios", label: "Scenarios" },
                ] as { id: typeof activeTab, label: string }[]).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-5 py-2.5 text-[11px] font-mono transition-all ${activeTab === t.id ? "text-white border-b-2 border-fuchsia-500" : "text-white/30 hover:text-white/60"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">

                {activeTab === "debate" && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/25 font-mono mb-4">5 cognitive agents debated this question. Trust scores update after each decision.</p>
                    {result.agentDebate.map(v => (
                      <div
                        key={v.agent.name}
                        className={`p-4 rounded-2xl border ${v.vote === "yes" ? "border-emerald-500/15 bg-emerald-500/5" : "border-red-500/15 bg-red-500/5"}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{v.agent.emoji}</span>
                          <div>
                            <span className={`text-[12px] font-bold ${v.agent.color}`}>{v.agent.name}</span>
                            <span className="text-[9px] text-white/30 ml-2">{v.agent.role}</span>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${v.vote === "yes" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                              {v.vote.toUpperCase()}
                            </span>
                            <span className="text-[9px] text-white/25 font-mono">influence: {v.influence.toFixed(2)}x</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/55 leading-relaxed">{v.reasoning}</p>
                        <div className="mt-2 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.vote === "yes" ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${v.confidence * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-white/20 font-mono">confidence: {(v.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reasons" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] font-bold text-emerald-400">YES Reasons</span>
                      </div>
                      <div className="space-y-2">
                        {result.yesReasons.map(r => (
                          <div key={r.id} className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[11px] text-white/70 leading-relaxed flex-1">{r.text}</p>
                              <span className="text-[10px] font-bold text-emerald-400 flex-shrink-0">+{r.weight}</span>
                            </div>
                            <div className="mt-1.5 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${r.weight}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsDown className="w-4 h-4 text-red-400" />
                        <span className="text-[11px] font-bold text-red-400">NO Reasons</span>
                      </div>
                      <div className="space-y-2">
                        {result.noReasons.map(r => (
                          <div key={r.id} className="bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[11px] text-white/70 leading-relaxed flex-1">{r.text}</p>
                              <span className="text-[10px] font-bold text-red-400 flex-shrink-0">+{r.weight}</span>
                            </div>
                            <div className="mt-1.5 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${r.weight}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "scenarios" && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/25 font-mono mb-4">BUT-layer: Each scenario re-evaluates the decision under different real-world conditions.</p>
                    {result.scenarios.map((sc, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] text-white/80 font-medium">BUT... {sc.scenario}</span>
                          <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-lg font-bold ${sc.label === "favors YES" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] text-emerald-400/70 font-mono">YES impact</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[12px] font-bold ${sc.yesImpact >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {sc.yesImpact >= 0 ? "+" : ""}{sc.yesImpact}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-red-400/70 font-mono">NO impact</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[12px] font-bold ${sc.noImpact >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {sc.noImpact >= 0 ? "+" : ""}{sc.noImpact}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "verdict" && (
                  <div className="max-w-2xl">
                    <div className={`p-6 rounded-3xl border mb-6 ${result.primaryDecision === "yes" ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {result.primaryDecision === "yes" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Minus className="w-5 h-5 text-red-400" />}
                        <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest">Dual-Output Final Verdict</span>
                      </div>
                      <p className="text-[15px] text-white leading-relaxed font-medium">{result.finalStatement}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center mb-6">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                        <div className="text-2xl font-black text-emerald-400">{result.yesPct}%</div>
                        <div className="text-[9px] text-white/30 font-mono mt-1">YES confidence</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                        <div className="text-2xl font-black text-fuchsia-400">{result.agentDebate.filter(v => v.vote === result.primaryDecision).length}/{result.agentDebate.length}</div>
                        <div className="text-[9px] text-white/30 font-mono mt-1">agents agreed</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                        <div className="text-2xl font-black text-red-400">{result.noPct}%</div>
                        <div className="text-[9px] text-white/30 font-mono mt-1">NO confidence</div>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                      <p className="text-[9px] text-white/25 font-mono mb-2">HOW AGENTS EVOLVED</p>
                      {result.agentDebate.map(v => (
                        <div key={v.agent.name} className="flex items-center gap-3 py-1">
                          <span className="text-sm">{v.agent.emoji}</span>
                          <span className={`text-[10px] font-bold w-16 ${v.agent.color}`}>{v.agent.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${v.vote === result.primaryDecision ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                            {v.vote === result.primaryDecision ? "✓ correct" : "✗ wrong"}
                          </span>
                          <span className="text-[9px] text-white/20 font-mono ml-auto">
                            trust: {(agents.find(a => a.name === v.agent.name)?.trustScore ?? 0 * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:3px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:10px}` }} />
    </div>
  );
}
