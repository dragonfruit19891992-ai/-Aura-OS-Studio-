import React, { useState, useRef, useCallback, useEffect } from "react";
// Firebase removed - using backend APIs instead
import {
  Database, ArrowLeft, Upload, Zap, CheckCircle2,
  Loader2, X, FileText, AlertTriangle, BarChart2,
  Tag, Brain, Trash2, Search, Download
} from "lucide-react";

/* ── Types ── */
interface MemoryChunk {
  id: string;
  content: string;
  category: "George" | "Pebble" | "Charlie" | "Business" | "Family" | "General";
  tags: string[];
  weight: number;
  ts: number;
  chars: number;
}

interface IngestStats {
  total: number;
  chunks: number;
  byCategory: Record<string, number>;
  dupsSkipped: number;
}

/* ── Entity Rules ── */
const ENTITY_RULES: Record<string, string[]> = {
  George:   ["george", "sovereign", "architect", "aura os", "george core"],
  Pebble:   ["pebble", "pebble code", "aura-c7", "aura-"],
  Charlie:  ["charlie", "13th", "thirteenth", "companion", "charlie's"],
  Business: ["invoice", "client", "revenue", "business", "enterprise", "billing", "profit", "contract", "vendor"],
  Family:   ["family", "joseph", "meaghan", "paislee", "mom", "dad", "sister", "brother", "home", "household"],
};

const CATEGORY_COLORS: Record<string, string> = {
  George:   "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Pebble:   "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Charlie:  "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
  Business: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Family:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
  General:  "text-white/40 bg-white/5 border-white/10",
};

/* ── Helpers ── */
function chunkText(text: string, size = 1200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + size;
    // Find sentence boundary
    while (end < text.length && end < start + size + 200 && text[end] !== "." && text[end] !== "\n") {
      end++;
    }
    const chunk = text.slice(start, end + 1).trim();
    if (chunk.length > 20) chunks.push(chunk);
    start = end + 1;
  }
  return chunks;
}

function extractTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  for (const [entity, patterns] of Object.entries(ENTITY_RULES)) {
    if (patterns.some(p => lower.includes(p))) tags.push(entity);
  }
  return tags;
}

function classify(tags: string[]): MemoryChunk["category"] {
  for (const cat of ["George", "Pebble", "Charlie", "Business", "Family"] as const) {
    if (tags.includes(cat)) return cat;
  }
  return "General";
}

function calcWeight(text: string, tags: string[]): number {
  let w = 1.0;
  if (text.length > 800) w += 0.3;
  if (tags.length > 2) w += 0.2 * tags.length;
  if (/\d{4}/.test(text)) w += 0.1; // has years/numbers
  return Math.min(w, 5.0);
}

const COLLECTION_NAME = "aura_memory_vault";

/* ══════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════ */
export default function IngestionHub({ onBack }: { onBack: () => void }) {
  const [memory, setMemory] = useState<MemoryChunk[]>([]);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);

  // Load from backend API on mount
  useEffect(() => {
    async function fetchMemory() {
      try {
        const response = await fetch("/api/memory", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMemory(data.chunks || []);
        } else {
          console.warn("Failed to load memory from backend");
        }
      } catch (err) {
        console.error("Failed to load memory from backend:", err);
      } finally {
        setIsLoadingMemory(false);
      }
    }
    fetchMemory();
  }, []);
  const [rawText, setRawText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastStats, setLastStats] = useState<IngestStats | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingest" | "memory" | "search">("ingest");
  const fileRef = useRef<HTMLInputElement>(null);

  const totalChars = memory.reduce((s, m) => s + m.chars, 0);

  /* ── Ingest pipeline ── */
  const runIngestion = useCallback(async (text: string) => {
    if (!text.trim() || processing) return;
    setProcessing(true);
    setProgress(0);

    const chunks = chunkText(text);
    const existing = new Set(memory.map(m => m.content.slice(0, 80)));
    const stats: IngestStats = { total: text.length, chunks: 0, byCategory: {}, dupsSkipped: 0 };

    const newChunks: MemoryChunk[] = [];
    let processed = 0;

    // Process in batches of 50 for UI responsiveness
    const batchSize = 50;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const batchChunks: MemoryChunk[] = [];

      for (const chunk of batch) {
        processed++;
        setProgress(Math.round((processed / chunks.length) * 100));

        // Deduplication check
        const key = chunk.slice(0, 80);
        if (existing.has(key)) { stats.dupsSkipped++; continue; }
        existing.add(key);

        const tags = extractTags(chunk);
        const category = classify(tags);
        const weight = calcWeight(chunk, tags);

        const entry: MemoryChunk = {
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          content: chunk,
          category,
          tags,
          weight,
          ts: Date.now(),
          chars: chunk.length
        };

        batchChunks.push(entry);
        newChunks.push(entry);
        stats.chunks++;
        stats.byCategory[category] = (stats.byCategory[category] ?? 0) + 1;
      }

      // Save batch to backend API
      try {
        if (batchChunks.length > 0) {
          const response = await fetch("/api/memory/bulk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({ chunks: batchChunks }),
          });
          if (!response.ok) {
            console.error("Backend batch save failed:", response.statusText);
          }
        }
      } catch (err) {
        console.error("Backend batch save error", err);
      }

      // Yield to UI
      await new Promise(r => setTimeout(r, 0));
    }

    const updatedMemory = [...memory, ...newChunks];
    setMemory(updatedMemory);
    setLastStats(stats);
    setRawText("");
    setProcessing(false);
    setProgress(100);
    setActiveTab("memory");
  }, [memory, processing]);

  /* ── File drop handler ── */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    let combined = "";
    for (const f of files) {
      if (f.size < 10_000_000) { // 10MB limit per file
        const text = await f.text();
        combined += `\n\n=== FILE: ${f.name} ===\n${text}`;
      }
    }
    if (combined) runIngestion(combined);
  };

  /* ── File input handler ── */
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let combined = "";
    for (const f of Array.from(e.target.files ?? [])) {
      if (f.size < 10_000_000) {
        const text = await f.text();
        combined += `\n\n=== FILE: ${f.name} ===\n${text}`;
      }
    }
    if (combined) runIngestion(combined);
    e.target.value = "";
  };

  /* ── Export memory ── */
  const exportMemory = () => {
    const blob = new Blob([JSON.stringify(memory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aura-memory.json"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Clear category ── */
  const clearCategory = async (cat: string) => {
    const updated = memory.filter(m => m.category !== cat);
    setMemory(updated);
    
    // Delete from backend API
    try {
      const response = await fetch(`/api/memory?category=${encodeURIComponent(cat)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!response.ok) {
        console.error("Backend clear category failed:", response.statusText);
      }
    } catch (err) {
      console.error("Backend clear category error", err);
    }
  };

  /* ── Filtered view ── */
  const filtered = memory.filter(m => {
    if (filterCat !== "all" && m.category !== filterCat) return false;
    if (search && !m.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = ["George", "Pebble", "Charlie", "Business", "Family", "General"];
  const catCounts = categories.reduce((acc, cat) => {
    acc[cat] = memory.filter(m => m.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07070B] text-white overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div className="h-12 flex-shrink-0 bg-[#040409] border-b border-white/[0.06] flex items-center gap-3 px-4">
        <button onClick={onBack} className="text-[10px] text-white/30 hover:text-white/70 font-mono flex items-center gap-1 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="h-4 w-px bg-white/10" />
        <Database className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-bold text-white">Aura Memory Vault</span>
        <span className="text-[9px] text-white/25 font-mono ml-1">— 8M+ character ingestion · entity extraction · cognitive routing</span>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-emerald-400">{memory.length.toLocaleString()} chunks</span>
          <span className="text-white/25">·</span>
          <span className="text-white/40">{(totalChars / 1000).toFixed(0)}K chars stored</span>
        </div>
        <button onClick={exportMemory} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
          <Download className="w-3 h-3" /> Export
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar — category overview */}
        <div className="w-[220px] flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden bg-[#040409]">
          <div className="p-4 border-b border-white/[0.04]">
            <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-3">Memory Pools</p>
            <div className="space-y-1.5">
              <button
                onClick={() => { setFilterCat("all"); setActiveTab("memory"); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] transition-all ${filterCat === "all" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"}`}
              >
                <span>All Memory</span>
                <span className="font-mono font-bold">{memory.length}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setFilterCat(cat); setActiveTab("memory"); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] transition-all ${filterCat === cat ? "bg-white/10 text-white" : "text-white/30 hover:bg-white/5 hover:text-white/60"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full inline-block ${
                      cat === "George" ? "bg-cyan-400" :
                      cat === "Pebble" ? "bg-purple-400" :
                      cat === "Charlie" ? "bg-fuchsia-400" :
                      cat === "Business" ? "bg-amber-400" :
                      cat === "Family" ? "bg-rose-400" : "bg-white/20"
                    }`} />
                    {cat}
                  </div>
                  <span className="font-mono font-bold">{catCounts[cat] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {lastStats && (
            <div className="p-4 border-b border-white/[0.04]">
              <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-2">Last Ingest</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40">Chunks</span>
                  <span className="text-emerald-400 font-mono">{lastStats.chunks}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40">Chars</span>
                  <span className="text-white/60 font-mono">{lastStats.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40">Skipped dups</span>
                  <span className="text-amber-400 font-mono">{lastStats.dupsSkipped}</span>
                </div>
              </div>
            </div>
          )}

          {/* Clear buttons */}
          {Object.entries(catCounts).filter(([, c]) => c > 0).map(([cat]) => (
            <button
              key={cat}
              onClick={() => clearCategory(cat)}
              className="mx-3 mb-1 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] text-white/20 hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              <Trash2 className="w-2.5 h-2.5" /> Clear {cat}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-white/[0.06] bg-[#040409]">
            {([
              { id: "ingest", label: "Ingest Data" },
              { id: "memory", label: `Memory (${filtered.length})` },
              { id: "search", label: "Semantic Search" },
            ] as { id: typeof activeTab, label: string }[]).map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-6 py-3 text-[11px] font-mono transition-all ${activeTab === t.id ? "text-white border-b-2 border-emerald-500" : "text-white/30 hover:text-white/60"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* INGEST TAB */}
          {activeTab === "ingest" && (
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-6">

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
                    dragOver ? "border-emerald-500/60 bg-emerald-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 font-semibold">Drop files here or click to upload</p>
                  <p className="text-white/25 text-sm mt-1">TXT, MD, JSON, JS, TS, CSV — up to 10MB per file</p>
                  <p className="text-white/15 text-xs mt-2 font-mono">Handles 8M+ characters · auto-chunks · auto-classifies</p>
                </div>
                <input ref={fileRef} type="file" multiple accept=".txt,.md,.json,.js,.ts,.csv,.log" className="hidden" onChange={handleFileInput} />

                {/* Text paste area */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Or Paste Raw Data</label>
                    <span className="text-[9px] text-white/20 font-mono">{rawText.length.toLocaleString()} chars</span>
                  </div>
                  <textarea
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder="Paste anything here — conversations, documents, notes, code, memories, business data, family records...

The pipeline will automatically:
• Chunk into 1,200-char semantic segments
• Extract entities (George, Pebble, Charlie, Business, Family)  
• Classify into memory pools
• Deduplicate overlapping content
• Weight by importance
• Route to the correct cognitive agent pool"
                    rows={10}
                    disabled={processing}
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3 text-[12px] text-white placeholder-white/15 focus:outline-none focus:border-emerald-500/30 resize-none font-mono leading-relaxed disabled:opacity-50"
                  />
                </div>

                {/* Progress */}
                {processing && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-[11px] text-white/60 font-mono">Processing... {progress}%</span>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[9px] text-white/25 font-mono mt-2">Chunking → Entity extraction → Deduplication → Memory routing...</p>
                  </div>
                )}

                {/* Run button */}
                <button
                  onClick={() => runIngestion(rawText)}
                  disabled={!rawText.trim() || processing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm disabled:opacity-30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {processing
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing {rawText.length.toLocaleString()} chars...</>
                    : <><Zap className="w-5 h-5" /> Run Ingestion Pipeline</>
                  }
                </button>

                {/* Feature list */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: "✂️", label: "Smart Chunking", desc: "1,200 char segments at sentence boundaries" },
                    { icon: "🏷️", label: "Entity Extraction", desc: "George · Pebble · Charlie · Business · Family" },
                    { icon: "🔄", label: "Deduplication", desc: "Skips near-identical content" },
                    { icon: "⚖️", label: "Importance Weighting", desc: "Scores by length, entities, richness" },
                    { icon: "🧠", label: "Agent Routing", desc: "Routes to correct memory pool" },
                    { icon: "💾", label: "Local Storage", desc: "100% on-device, no cloud, no API" },
                  ].map((f, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3">
                      <div className="text-xl mb-1">{f.icon}</div>
                      <div className="text-[10px] font-bold text-white/60">{f.label}</div>
                      <div className="text-[9px] text-white/25 mt-0.5 leading-relaxed">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MEMORY TAB */}
          {activeTab === "memory" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
                <Search className="w-4 h-4 text-white/25" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter memory by keyword..."
                  className="flex-1 bg-transparent text-white text-[11px] focus:outline-none placeholder-white/20"
                />
                {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-white/30" /></button>}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="text-center py-16 text-white/25 text-sm">
                    {memory.length === 0 ? "No memory yet — go to Ingest Data to add content" : "No results match your filter"}
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {filtered.slice(0, 200).map(chunk => (
                      <div key={chunk.id} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${CATEGORY_COLORS[chunk.category]}`}>
                            {chunk.category}
                          </span>
                          {chunk.tags.filter(t => t !== chunk.category).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-white/30 font-mono">{tag}</span>
                          ))}
                          <span className="ml-auto text-[8px] text-white/15 font-mono">{chunk.chars} chars · w:{chunk.weight.toFixed(1)}</span>
                        </div>
                        <p className="text-[10px] text-white/55 leading-relaxed font-mono line-clamp-3">{chunk.content}</p>
                      </div>
                    ))}
                    {filtered.length > 200 && (
                      <p className="text-center text-[10px] text-white/20 py-4">Showing 200 of {filtered.length} — refine your filter to see more</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEARCH TAB */}
          {activeTab === "search" && (
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center gap-3 px-4 py-3">
                    <Search className="w-4 h-4 text-white/30" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search George's memory... (keyword search)"
                      className="flex-1 bg-transparent text-white text-[12px] focus:outline-none placeholder-white/20"
                    />
                  </div>
                </div>

                {search ? (
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/30 font-mono">{filtered.length} results for "{search}"</p>
                    {filtered.slice(0, 50).map(chunk => (
                      <div key={chunk.id} className={`border rounded-2xl p-4 ${CATEGORY_COLORS[chunk.category].split(" ").slice(1).join(" ")}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold ${CATEGORY_COLORS[chunk.category].split(" ")[0]}`}>{chunk.category}</span>
                          <span className="text-[9px] text-white/20 font-mono ml-auto">weight: {chunk.weight.toFixed(1)}</span>
                        </div>
                        <p className="text-[11px] text-white/70 leading-relaxed">{chunk.content.slice(0, 300)}{chunk.content.length > 300 ? "..." : ""}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Brain className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">Type to search across all {memory.length} memory chunks</p>
                    <p className="text-white/15 text-xs mt-1">Searches content across all entity pools simultaneously</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:3px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:10px}.line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}` }} />
    </div>
  );
}
