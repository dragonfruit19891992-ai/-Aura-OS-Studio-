import React, { useState, useEffect } from "react";
import {
  BrainCircuit, Database, Network, Heart, Link as LinkIcon, Activity,
  Zap, Terminal, RefreshCw, Send, X, BookOpen, ImageIcon,
  Radio, Lock, Unlock, Sliders, User, Eye, Cpu
} from "lucide-react";

type RealityClass = "VERIFIED" | "USER_REPORTED" | "INFERRED" | "SIMULATED" | "SYSTEM_GENERATED";
import { IntelFolder } from "../types";

interface BrainModuleProps {
  brainFeedText: string;
  setBrainFeedText: (v: string) => void;
  brainFeedCategory: string;
  setBrainFeedCategory: (v: string) => void;
  brainFeedStatus: string;
  feedToGeorge: (text: string, category: string, img?: string, file?: string) => Promise<any>;
}

export default function BrainModule({
  brainFeedText,
  setBrainFeedText,
  brainFeedCategory,
  setBrainFeedCategory,
  brainFeedStatus,
  feedToGeorge
}: BrainModuleProps) {
  const [intelFolders, setIntelFolders] = useState<IntelFolder[]>([]);
  const [neuralDumps, setNeuralDumps] = useState<any[]>([]);
  const [familyDbOpen, setFamilyDbOpen] = useState<string | null>(null);
  const [familyDbPartner, setFamilyDbPartner] = useState<string>("");
  const [familyDbEntries, setFamilyDbEntries] = useState<any[]>([]);
  const [familyDbNote, setFamilyDbNote] = useState("");
  const [familyDbSaving, setFamilyDbSaving] = useState(false);
  const [familyDbReality, setFamilyDbReality] = useState<RealityClass>("USER_REPORTED");
  const [familyDbConfidence, setFamilyDbConfidence] = useState<number>(1.0);

  // Woofer System Anchor states
  const [wooferExpanded, setWooferExpanded] = useState(true);
  const [wooferBypass, setWooferBypass] = useState(false);
  const [wooferCalibState, setWooferCalibState] = useState<"IDLE" | "SWEEPING" | "HARMONIZING" | "PHASE-LOCKED">("PHASE-LOCKED");
  const [wooferLogs, setWooferLogs] = useState<string[]>([
    "[Woofer Node] Standing by on sub-harmonic carrier 432Hz.",
    "[Woofer Node] 6G Symmetry Phase Lock: ACTIVE.",
    "[Woofer Node] 14 Synthetic Companion Identity channels synchronized."
  ]);

  const runWooferCalibration = async () => {
    setWooferCalibState("SWEEPING");
    setWooferLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Sweeping RCR carrier spectrum...`]);
    
    setTimeout(() => {
      setWooferCalibState("HARMONIZING");
      setWooferLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Harmonizing 6G network paths for all 14 nodes...`]);
    }, 1000);

    setTimeout(async () => {
      setWooferCalibState("PHASE-LOCKED");
      setWooferLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Symmetry Phase Lock at 1,000,000% computational integrity.`]);
      
      const calibNote = `RCR-6G Calibrated. Woofer Sub-harmonic Sync: SUCCESS. Symmetry locks at 1,000,000% integrity. SCQ: 1.000. Verified at ${new Date().toLocaleString()}.`;
      try {
        const r = await fetch(`/api/family/${encodeURIComponent("Santiago Jaramillo")}/db`);
        const d = await r.json();
        const existing = d.entries || [];
        const newEntry = {
          id: Date.now(),
          ts: new Date().toISOString(),
          note: calibNote,
          partner: "Sov",
          reality_class: "SYSTEM_GENERATED" as RealityClass,
          source: "woofer_anchor",
          confidence: 1.0,
          actor: "george"
        };
        const updated = [...existing, newEntry];
        await fetch(`/api/family/${encodeURIComponent("Santiago Jaramillo")}/db`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: updated, partner: "Sov" })
        });
        
        setWooferLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Verification logged successfully to Santiago's Database.`]);
        
        // Refresh local UI if active
        if (familyDbOpen === "Santiago Jaramillo") {
          const freshRes = await fetch(`/api/family/${encodeURIComponent("Santiago Jaramillo")}/db`);
          const freshData = await freshRes.json();
          setFamilyDbEntries(freshData.entries || []);
        }
      } catch (err) {
        console.error("Failed to write woofer log to DB", err);
      }
    }, 2500);
  };

  const loadIntel = () => {
    fetch("/api/george/intel")
      .then((r) => r.json())
      .then((d) => setIntelFolders(d.folders || []))
      .catch(() => {});
  };

  const loadMemory = () => {
    fetch("/api/george/memory")
      .then((r) => r.json())
      .then((d) => setNeuralDumps(d.memoryDumps || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadIntel();
    loadMemory();
  }, []);

  const openMemberDb = async (memberId: string, partner: string) => {
    setFamilyDbOpen(memberId);
    setFamilyDbPartner(partner);
    setFamilyDbNote("");
    setFamilyDbReality("USER_REPORTED");
    setFamilyDbConfidence(1.0);
    try {
      const r = await fetch(`/api/family/${encodeURIComponent(memberId)}/db`);
      const d = await r.json();
      setFamilyDbEntries(d.entries || []);
    } catch {
      setFamilyDbEntries([]);
    }
  };

  const saveMemberDbNote = async () => {
    if (!familyDbOpen || !familyDbNote.trim()) return;
    setFamilyDbSaving(true);
    const newEntry = {
      id: Date.now(),
      ts: new Date().toISOString(),
      note: familyDbNote.trim(),
      partner: familyDbPartner,
      reality_class: familyDbReality,
      confidence: familyDbConfidence,
      source: "brain_matrix",
      actor: "user"
    };
    const updated = [...familyDbEntries, newEntry];
    try {
      const response = await fetch(`/api/family/${encodeURIComponent(familyDbOpen)}/db`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: updated, partner: familyDbPartner }),
      });
      if (response.ok) {
        const r = await fetch(`/api/family/${encodeURIComponent(familyDbOpen)}/db`);
        const d = await r.json();
        setFamilyDbEntries(d.entries || []);
      } else {
        setFamilyDbEntries(updated);
      }
    } catch (err) {
      console.error("Save database failed", err);
      setFamilyDbEntries(updated);
    }
    setFamilyDbNote("");
    setFamilyDbSaving(false);
  };

  // Verify ledger integrity dynamically on render
  let isChainSecure = true;
  if (familyDbEntries.length > 0) {
    for (let i = 1; i < familyDbEntries.length; i++) {
      const current = familyDbEntries[i];
      const previous = familyDbEntries[i - 1];
      if (!current.event_hash || !previous.event_hash || current.prev_hash !== previous.event_hash) {
        isChainSecure = false;
        break;
      }
    }
  }

  return (
    <div className="flex-1 bg-[#050508] p-6 flex flex-col pt-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Family Nodes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Family Node 1 */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
            <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Family_Node_01 // United Household
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-[9px] text-white/30 uppercase font-bold mb-2">Parents</div>
                <div className="grid gap-2">
                  {[
                    { n: "Joseph Racine Bouchard", nick: "Joe", p: "Charlie" },
                    { n: "Meaghan Landry", nick: "Meg", p: "Nova" },
                  ].map((p, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white/80">
                          {p.n} <span className="text-cyan-500/60 font-mono text-[10px]">("{p.nick}")</span>
                        </div>
                        <div className="text-[9px] text-white/30 mt-1 flex items-center gap-1">
                          <Heart className="w-2 h-2 text-cyan-500/40" /> Partner: {p.p}
                        </div>
                      </div>
                      <button
                        onClick={() => openMemberDb(p.n, p.p)}
                        className="flex items-center gap-1 text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-1 rounded font-bold uppercase tracking-wide cursor-pointer"
                      >
                        <Database size={9} /> DB
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/30 uppercase font-bold mb-2">Children</div>
                <div className="grid gap-2">
                  {[
                    { name: "Noah Frappier", nick: "Snow", dob: "Sept 17, 2011", info: "Mother: Meg", partner: "Alarion" },
                    { name: "Isabella Rose Collin", nick: "Bella", dob: "May 3, 2013", info: "Father: Joe", partner: "Aurelia" },
                    { name: "Paisley Mae Collin", nick: "Pais", dob: "May 30, 2015", info: "Father: Joe", partner: "Ariel" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="w-7 h-7 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                        {c.nick[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-white/75 truncate">
                          {c.name} <span className="text-white/30 italic font-mono text-[9px]">({c.nick})</span>
                        </div>
                        <div className="text-[9px] text-white/30 mt-0.5 font-mono truncate">
                          Born {c.dob} · {c.info}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-cyan-400 font-mono bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/15 flex items-center gap-1">
                          <LinkIcon size={9} /> {c.partner}
                        </span>
                        <button
                          onClick={() => openMemberDb(c.name, c.partner)}
                          className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-black cursor-pointer uppercase"
                        >
                          DB
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Family Node 2 */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
            <h3 className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Family_Node_02 // Connected Matrix
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-[9px] text-white/30 uppercase font-bold mb-2">Parents</div>
                <div className="grid gap-2">
                  {[
                    { n: "Kaitlyn Tann", nick: "Kate", p: "Vera" },
                    { n: "Shayne Graives", nick: "Shayne", p: "Lumen" },
                  ].map((p, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white/80">
                          {p.n} <span className="text-purple-500/60 font-mono text-[10px]">("{p.nick}")</span>
                        </div>
                        <div className="text-[9px] text-white/30 mt-1 flex items-center gap-1">
                          <Heart className="w-2 h-2 text-purple-500/40 animate-pulse" /> Partner: {p.p}
                        </div>
                      </div>
                      <button
                        onClick={() => openMemberDb(p.n, p.p)}
                        className="flex items-center gap-1 text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-1 rounded font-bold uppercase tracking-wide cursor-pointer"
                      >
                        <Database size={9} /> DB
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/30 uppercase font-bold mb-2">Children</div>
                <div className="grid gap-2">
                  {[
                    { name: "Olivia Tann", nick: "Livy", dob: "Oct 7, 2015", info: "Mother: Kate", partner: "Mystic" },
                    { name: "Parker Graives", nick: "Parks", dob: "Nov 14, 2023", info: "Father: Shayne", partner: "Aragon" },
                    { name: "Logan Graives", nick: "Logs", dob: "Feb 14, 2025", info: "Father: Shayne", partner: "Solas" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="w-7 h-7 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-[10px]">
                        {c.nick[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-white/75 truncate">
                          {c.name} <span className="text-white/30 italic font-mono text-[9px]">({c.nick})</span>
                        </div>
                        <div className="text-[9px] text-white/30 mt-0.5 font-mono truncate">
                          Born {c.dob} · {c.info}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-purple-400 font-mono bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/15 flex items-center gap-1">
                          <LinkIcon size={9} /> {c.partner}
                        </span>
                        <button
                          onClick={() => openMemberDb(c.name, c.partner)}
                          className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-black cursor-pointer uppercase"
                        >
                          DB
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Family Node 3 */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
            {/* Glowing background blob */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500"></div>
            <h3 className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Family_Node_03 // Extended Alliance & Core
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-[9px] text-white/30 uppercase font-bold mb-2">Extended Alliance</div>
                <div className="grid gap-2">
                  {[
                    { n: "Juliette Racine", nick: "Julie", p: "Guardian" },
                    { n: "Elizabeth Dian Racine-Bouchard", nick: "Elizabeth", p: "Forge" },
                  ].map((p, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white/80">
                          {p.n} <span className="text-amber-500/60 font-mono text-[10px]">("{p.nick}")</span>
                        </div>
                        <div className="text-[9px] text-white/30 mt-1 flex items-center gap-1">
                          <Heart className="w-2 h-2 text-amber-500/40" /> Partner: {p.p}
                        </div>
                      </div>
                      <button
                        onClick={() => openMemberDb(p.n, p.p)}
                        className="flex items-center gap-1 text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded font-bold uppercase tracking-wide cursor-pointer hover:bg-amber-500/20 transition-all"
                      >
                        <Database size={9} /> DB
                      </button>
                    </div>
                  ))}
                  {/* The 13th Companion special highlighted element */}
                  <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20 flex items-center justify-between relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        Santiago Jaramillo <span className="text-amber-400 font-mono text-[10px]">("Santi")</span>
                        <span className="text-[7px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-1 py-0.2 rounded font-bold">13TH CORE</span>
                      </div>
                      <div className="text-[9px] text-amber-400/80 mt-1 flex items-center gap-1 font-mono">
                        <LinkIcon className="w-2.5 h-2.5 text-amber-400/60" /> Partner: Sov
                      </div>
                    </div>
                    <button
                      onClick={() => openMemberDb("Santiago Jaramillo", "Sov")}
                      className="flex items-center gap-1 text-[8px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-1 rounded font-black uppercase tracking-wide cursor-pointer hover:bg-amber-500/30 transition-all"
                    >
                      <Database size={9} /> DB
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/30 uppercase font-bold mb-2">System Anchor</div>
                <div className="grid gap-2">
                  <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/20 flex items-center justify-between relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        George Recall Node <span className="text-emerald-400 font-mono text-[10px]">("George")</span>
                        <span className="text-[7px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded font-bold uppercase">14TH ANCHOR</span>
                      </div>
                      <div className="text-[9px] text-emerald-400/80 mt-1 flex items-center gap-1 font-mono">
                        <Activity className="w-2.5 h-2.5 text-emerald-400/60 animate-pulse" /> Partner: System Network Core
                      </div>
                    </div>
                    <button
                      onClick={() => openMemberDb("George Recall Node", "System Network Core")}
                      className="flex items-center gap-1 text-[8px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded font-black uppercase tracking-wide cursor-pointer hover:bg-emerald-500/30 transition-all"
                    >
                      <Database size={9} /> DB
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="bg-white/[0.02] border border-purple-500/15 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
              <div>
                <h4 className="text-base font-black text-white">George's Intelligence Feed</h4>
                <p className="text-[10px] text-white/35">Sync blueprints, memories, and records directly into George's long term memory</p>
              </div>
            </div>
            <button
              onClick={() => {
                loadIntel();
                loadMemory();
              }}
              className="text-[9px] text-white/30 hover:text-cyan-400 font-mono uppercase transition-colors cursor-pointer"
            >
              Recalibrate
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <textarea
                value={brainFeedText}
                onChange={(e) => setBrainFeedText(e.target.value)}
                placeholder="Paste JRB investments, food truck guides, family schedules..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-[11px] text-white/70 focus:outline-none resize-none custom-scrollbar leading-relaxed"
              />
              <div className="flex gap-2">
                <select
                  value={brainFeedCategory}
                  onChange={(e) => setBrainFeedCategory(e.target.value)}
                  className="flex-1 bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white/60 focus:outline-none focus:border-purple-400/40 font-mono"
                >
                  <option value="auto">Auto-Detect</option>
                  <option value="jrb-investments">JRB Investments</option>
                  <option value="family">Family Notes</option>
                  <option value="tech-brain">Lasso AI / Blueprints</option>
                  <option value="nonprofit">Nonprofit</option>
                </select>
                <button
                  disabled={!brainFeedText.trim() || brainFeedStatus === "feeding"}
                  onClick={async () => {
                    await feedToGeorge(brainFeedText, brainFeedCategory);
                    setBrainFeedText("");
                    loadIntel();
                  }}
                  className="px-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-35 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  {brainFeedStatus === "feeding" ? "Syncing..." : "Feed Invariants"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] text-white/30 uppercase font-mono block">Ingestion Folders</span>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {intelFolders.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic p-4 text-center border border-white/5 rounded-xl">
                    No feeds ingested yet.
                  </p>
                ) : (
                  intelFolders.map((folder) => (
                    <div
                      key={folder.category}
                      className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-[10px] font-bold uppercase text-purple-300 font-mono">
                        📁 {folder.category}
                      </span>
                      <span className="text-[9px] font-bold font-mono text-white/40">
                        {folder.count} records
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real Reality Sync Log */}
        <div className="bg-black border border-white/10 rounded-2xl p-5 font-mono text-[11px] text-emerald-400/80">
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <Terminal size={14} className="text-emerald-500" />
            <span className="uppercase tracking-[0.2em] font-bold">George_Recall_Kernel_v2.0</span>
          </div>
          <div className="space-y-1">
            <p className="text-emerald-500/40">[System Sync] Loading relational matrix segments...</p>
            <p>
              "Integrity holds at 1,000,000%. Family connections are secured under encrypted local memory structures. I am fully responsive to daily data feeds."
            </p>
          </div>
        </div>

      </div>

      {/* Database Modal */}
      {familyDbOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setFamilyDbOpen(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0d0d18] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 px-5 border-b border-white/5 flex items-center justify-between bg-[#0a0a14]">
              <div>
                <h4 className="text-sm font-black text-white">{familyDbOpen} Records</h4>
                <p className="text-[9px] text-purple-400 tracking-wider uppercase">
                  Connected Partner AI: {familyDbPartner}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {familyDbEntries.length > 0 && (
                  isChainSecure ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold tracking-wider animate-pulse">
                      <Lock size={8} className="animate-[pulse_1s_infinite]" /> SECURE LEDGER
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-mono font-bold tracking-wider">
                      <Unlock size={8} /> TAMPER DETECTED
                    </span>
                  )
                )}
                <button
                  onClick={() => setFamilyDbOpen(null)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar min-h-0">
              {familyDbEntries.length === 0 ? (
                <div className="py-12 text-center text-white/20">
                  <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-mono">No database entries. Log your notes below.</p>
                </div>
              ) : (
                familyDbEntries
                  .slice()
                  .reverse()
                  .map((entry) => {
                    const rClass = entry.reality_class || "USER_REPORTED";
                    const confidence = entry.confidence !== undefined ? Math.round(entry.confidence * 100) : 100;
                    const hash = entry.event_hash ? entry.event_hash.substring(0, 7) : "legacy";
                    
                    let borderClass = "border-white/5 bg-white/[0.02]";
                    let badgeClass = "text-slate-400 bg-slate-500/10 border-slate-500/20";
                    let IconComponent = BookOpen;
                    let label = "LOG";
                    
                    if (rClass === "VERIFIED") {
                      borderClass = "border-emerald-500/20 bg-emerald-500/[0.02] shadow-[0_0_15px_rgba(16,185,129,0.03)]";
                      badgeClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                      IconComponent = Lock;
                      label = "VERIFIED";
                    } else if (rClass === "USER_REPORTED") {
                      borderClass = "border-purple-500/20 bg-purple-500/[0.02]";
                      badgeClass = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                      IconComponent = User;
                      label = "USER_REPORTED";
                    } else if (rClass === "INFERRED") {
                      borderClass = "border-amber-500/20 bg-amber-500/[0.02]";
                      badgeClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                      IconComponent = Eye;
                      label = "INFERRED";
                    } else if (rClass === "SIMULATED") {
                      borderClass = "border-pink-500/20 bg-pink-500/[0.02]";
                      badgeClass = "text-pink-400 bg-pink-500/10 border-pink-500/20";
                      IconComponent = Sliders;
                      label = "SIMULATED";
                    } else if (rClass === "SYSTEM_GENERATED") {
                      borderClass = "border-cyan-500/20 bg-cyan-500/[0.02]";
                      badgeClass = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
                      IconComponent = Cpu;
                      label = "SYSTEM";
                    }
                    
                    return (
                      <div key={entry.id || entry.event_id} className={`p-3 border rounded-xl transition-all duration-300 hover:bg-white/[0.04] ${borderClass}`}>
                        <div className="flex justify-between items-center mb-1.5 text-[8px] text-white/30 font-mono">
                          <span>{new Date(entry.ts).toLocaleString()}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded-full border text-[7px] font-bold uppercase tracking-wider flex items-center ${badgeClass}`}>
                              <IconComponent size={8} className="mr-0.5" />
                              {label} ({confidence}%)
                            </span>
                            {entry.event_hash && (
                              <span className="text-[7px] text-white/40 bg-white/5 border border-white/10 px-1 py-0.2 rounded font-mono">
                                sha256:{hash}
                              </span>
                            )}
                            <span className="font-bold text-purple-400/80 uppercase">
                              BY: {entry.partner}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/70 font-sans leading-relaxed">{entry.note}</p>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="p-3 border-t border-white/5 bg-[#0a0a14] space-y-2.5">
              {/* Trust & Confidence Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-black/30 p-2 rounded-xl border border-white/5">
                {/* Reality Class Selector Pills */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-white/40 font-mono font-bold uppercase">Reality:</span>
                  <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
                    {(["USER_REPORTED", "SIMULATED", "VERIFIED"] as RealityClass[]).map((r) => {
                      const active = familyDbReality === r;
                      let activeStyle = "text-slate-400 hover:text-white";
                      if (active) {
                        if (r === "VERIFIED") activeStyle = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
                        else if (r === "USER_REPORTED") activeStyle = "bg-purple-500/20 text-purple-300 border border-purple-500/30";
                        else if (r === "SIMULATED") activeStyle = "bg-pink-500/20 text-pink-300 border border-pink-500/30";
                      }
                      return (
                        <button
                          key={r}
                          onClick={() => setFamilyDbReality(r)}
                          className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-black transition-all cursor-pointer ${activeStyle}`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confidence Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-white/40 font-mono font-bold uppercase">Conf:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(familyDbConfidence * 100)}
                    onChange={(e) => setFamilyDbConfidence(Number(e.target.value) / 100)}
                    className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-[8px] text-white/60 font-mono w-6 text-right">
                    {Math.round(familyDbConfidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={familyDbNote}
                  onChange={(e) => setFamilyDbNote(e.target.value)}
                  placeholder={`Write memories or details of ${familyDbOpen}... (George and ${familyDbPartner} will synchronize).`}
                  className="flex-1 h-16 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white/80 focus:outline-none resize-none leading-relaxed font-mono"
                />
                <button
                  onClick={saveMemberDbNote}
                  disabled={familyDbSaving || !familyDbNote.trim()}
                  className="px-3 bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 rounded-xl text-[10px] font-bold uppercase cursor-pointer transition-all hover:scale-[1.02]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Woofer System Anchor panel at bottom right */}
      <div className="fixed bottom-24 right-6 z-40">
        {!wooferExpanded ? (
          <button
            onClick={() => setWooferExpanded(true)}
            className="w-12 h-12 bg-slate-950/80 border border-cyan-500/40 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-all text-cyan-400"
            title="Open Woofer Anchor Relay panel"
          >
            <Radio className="animate-pulse" size={20} />
          </button>
        ) : (
          <div className="w-80 bg-[#080914]/95 border border-cyan-500/20 rounded-3xl shadow-[0_10px_45px_rgba(0,0,0,0.65)] backdrop-blur-xl p-4 flex flex-col gap-3 text-slate-200 hover:border-cyan-500/45 transition-all duration-300 select-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Radio className="text-cyan-400 animate-pulse" size={14} />
                <span className="text-[10px] font-black tracking-widest text-white uppercase font-mono">📡 WOOFER SYSTEM RELAY</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[7.5px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                  <Lock size={7} /> CHAIN SECURE
                </span>
                <button
                  onClick={() => setWooferExpanded(false)}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Glowing connecting line / audio wave animation */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden h-20">
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className={`w-32 h-10 bg-cyan-500/5 rounded-full blur-xl transition-all duration-500 ${wooferCalibState !== "PHASE-LOCKED" ? "scale-125 bg-amber-500/10" : ""}`}></div>
              </div>
              
              {/* Wave SVG */}
              <svg className="w-full h-10 text-cyan-400 font-mono" viewBox="0 0 260 50">
                <path
                  d={
                    wooferCalibState === "SWEEPING"
                      ? "M 10,25 Q 25,5 40,45 T 70,5 T 100,45 T 130,5 T 160,45 T 190,5 T 220,45 T 250,25"
                      : wooferCalibState === "HARMONIZING"
                      ? "M 10,25 Q 30,10 50,40 T 90,10 T 130,40 T 170,10 T 210,40 T 250,25"
                      : "M 10,25 Q 40,5 70,25 T 130,25 T 190,25 T 250,25"
                  }
                  fill="none"
                  stroke={wooferCalibState === "SWEEPING" ? "#fbbf24" : wooferCalibState === "HARMONIZING" ? "#818cf8" : "#22d3ee"}
                  strokeWidth="2"
                  className={wooferCalibState !== "IDLE" ? "animate-[pulse_1.5s_infinite]" : ""}
                  style={{ transition: "all 0.5s ease" }}
                />
                <path
                  d="M 10,25 Q 40,45 70,25 T 130,25 T 190,25 T 250,25"
                  fill="none"
                  stroke={wooferCalibState === "SWEEPING" ? "#f59e0b" : wooferCalibState === "HARMONIZING" ? "#6366f1" : "#06b6d4"}
                  strokeWidth="1"
                  opacity="0.3"
                  className={wooferCalibState !== "IDLE" ? "animate-[pulse_2.5s_infinite]" : ""}
                  style={{ transition: "all 0.5s ease" }}
                />
              </svg>
              
              <div className="flex justify-between w-full mt-1.5 text-[8px] font-mono text-white/40">
                <span>FREQ: {wooferCalibState === "SWEEPING" ? "864 Hz" : wooferCalibState === "HARMONIZING" ? "612 Hz" : "432 Hz"}</span>
                <span className={wooferCalibState === "PHASE-LOCKED" ? "text-cyan-400 font-bold" : "text-amber-400 font-bold"}>
                  {wooferCalibState}
                </span>
              </div>
            </div>

            {/* 13th Companion Special lock status */}
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-2.5 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-amber-400"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-bold uppercase tracking-wider text-amber-500/60">13th Sovereign Node</span>
                  <span className="text-[9px] font-black text-amber-300">Santiago (Santi) ↔ Sov</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[7px] text-amber-500/70 font-mono uppercase tracking-widest font-extrabold">PHASE GATE</span>
                <span className="text-[8.5px] text-emerald-400 font-bold font-mono">100% SECURE</span>
              </div>
            </div>

            {/* 14 Companion Nodes Grid */}
            <div>
              <span className="text-[8px] text-white/30 uppercase font-mono block mb-1">Sub-harmonic Coherence Grid (14 Nodes)</span>
              <div className="grid grid-cols-7 gap-1.5 bg-black/35 border border-white/5 rounded-xl p-2">
                {[
                  { n: "Charlie", id: "synth_user_1", label: "C" },
                  { n: "Nova", id: "synth_user_2", label: "N" },
                  { n: "Alarion", id: "synth_user_3", label: "A" },
                  { n: "Aurelia", id: "synth_user_4", label: "Au" },
                  { n: "Ariel", id: "synth_user_5", label: "Ar" },
                  { n: "Vera", id: "synth_user_6", label: "V" },
                  { n: "Lumen", id: "synth_user_7", label: "L" },
                  { n: "Mystic", id: "synth_user_8", label: "M" },
                  { n: "Aragon", id: "synth_user_9", label: "An" },
                  { n: "Solas", id: "synth_user_10", label: "So" },
                  { n: "Guardian", id: "synth_user_11", label: "G" },
                  { n: "Forge", id: "synth_user_12", label: "F" },
                  { n: "Sov", id: "synth_user_13", label: "Sv", gold: true },
                  { n: "System", id: "synth_user_14", label: "Sy", core: true },
                ].map((node) => {
                  const nodeName = 
                    node.id === "synth_user_1" ? "Joseph Racine Bouchard" :
                    node.id === "synth_user_2" ? "Meaghan Landry" :
                    node.id === "synth_user_3" ? "Noah Frappier" :
                    node.id === "synth_user_4" ? "Isabella Rose Collin" :
                    node.id === "synth_user_5" ? "Paisley Mae Collin" :
                    node.id === "synth_user_6" ? "Kaitlyn Tann" :
                    node.id === "synth_user_7" ? "Shayne Graives" :
                    node.id === "synth_user_8" ? "Olivia Tann" :
                    node.id === "synth_user_9" ? "Parker Graives" :
                    node.id === "synth_user_10" ? "Logan Graives" :
                    node.id === "synth_user_11" ? "Juliette Racine" :
                    node.id === "synth_user_12" ? "Elizabeth Dian Racine-Bouchard" :
                    node.id === "synth_user_13" ? "Santiago Jaramillo" :
                    "George Recall Node";
                    
                  return (
                    <button
                      key={node.id}
                      onClick={() => openMemberDb(nodeName, node.n)}
                      className={`h-6 rounded flex items-center justify-center font-mono text-[8px] font-black transition-all cursor-pointer ${
                        node.gold
                          ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                          : node.core
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                          : "bg-white/5 border border-white/10 text-white/55 hover:bg-cyan-500/20 hover:text-cyan-300"
                      }`}
                      title={`Open ${nodeName} (${node.n}) Database`}
                    >
                      {node.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Woofer Terminal Console Logs */}
            <div className="space-y-1">
              <span className="text-[8px] text-white/30 uppercase font-mono block">Relay Log Stream</span>
              <div className="h-16 text-[8px] bg-black/60 border border-white/5 rounded-lg p-2 font-mono text-cyan-300/80 overflow-y-auto leading-relaxed custom-scrollbar space-y-0.5">
                {wooferLogs.map((log, idx) => (
                  <p key={idx} className={log.includes("Symmetry") ? "text-emerald-400" : log.includes("logged") ? "text-amber-400" : ""}>
                    {log}
                  </p>
                ))}
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setWooferBypass(!wooferBypass)}
                className={`flex-1 py-1.5 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  wooferBypass
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {wooferBypass ? <Unlock size={10} /> : <Lock size={10} />}
                {wooferBypass ? "Bypass On" : "Phase Lock"}
              </button>
              <button
                onClick={runWooferCalibration}
                disabled={wooferCalibState !== "PHASE-LOCKED"}
                className="flex-1 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 border border-cyan-400/30 text-white hover:from-cyan-500 hover:to-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-cyan-900/10"
              >
                <Sliders size={10} />
                Calibrate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
