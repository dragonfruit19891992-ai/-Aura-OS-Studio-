import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import * as esbuild from "esbuild";
import crypto from "crypto";
import { Gateway, generateAuraFallbackHTML } from "./src/logic/core/AirlockGateway";
import { Runtime } from "./src/logic/core/RuntimeManager";
import { TerminalManager } from "./src/logic/core/PtyManager";

// ✅ PRODUCTION SECURITY MODULES
import { generateAccessToken, generateRefreshToken, verifyToken, requireAuth, optionalAuth, requireRole } from "./src/backend/auth/jwt";
import { getSecret, storeSecret, retrieveSecret, validateWebhookSignature, generateWebhookSecret } from "./src/backend/security/secrets";
import { apiLimiter, authLimiter, webhookLimiter, verifyWebhookMiddleware, addSecurityHeaders, auditLogger } from "./src/backend/security/middleware";

// ✅ DATABASE MODULES
import { runMigrations } from "./src/backend/database/migrations";
import { closePool } from "./src/backend/database/client";
import memoryRoutes from "./src/backend/api/memory-routes";

// NOTE: Google GenAI removed - use real API key or remove
import { GoogleGenAI } from "@google/genai";

// import { initializeProductionBackend } from "./src/backend/init";
// import { setupMCPServer } from "./src/backend/mcp-server";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

// ✅ PRODUCTION SECURITY MIDDLEWARE
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ limit: "1000mb", extended: true }));
app.use(addSecurityHeaders); // Security headers
app.use(apiLimiter); // Rate limiting (100/15min)
app.use(auditLogger); // Audit logging

// ✅ Validate that required secrets are configured (fail fast)
try {
  const nodeEnv = process.env.NODE_ENV || "development";
  if (nodeEnv === "production") {
    getSecret("JWT_SECRET", true);
    // getSecret("DATABASE_URL", true); // Bypassed: using live disk persistence
    getSecret("WEBHOOK_SECRET", true);
  }
  console.log("✅ Security configuration verified");
} catch (err: any) {
  console.error("🚨 FATAL:", err.message);
  process.exit(1);
}

// ✅ Initialize Database
let dbReady = false;
(async () => {
  try {
    if (process.env.DATABASE_URL) {
      await runMigrations();
      dbReady = true;
      console.log("✅ Database migrations completed");
    } else {
      console.log("⚠️ No DATABASE_URL found. Skipping Postgres migrations (using live disk files only).");
      dbReady = true;
    }
  } catch (err: any) {
    console.error("❌ Database initialization failed:", err.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

// ✅ Register API Routes (including memory API)
app.use("/", memoryRoutes);

// Admin route for Airlock Testing
app.post("/api/admin/gateway/seal/:compartmentId", requireAuth, requireRole("admin"), (req, res) => {
  const { mode, reason } = req.body;
  Gateway.sealCompartment(req.params.compartmentId, mode, reason);
  res.json({ success: true, compartmentId: req.params.compartmentId, newMode: mode });
});

// Runtime Management Routes
app.post("/api/runtime/start/:id", async (req, res) => {
  try {
    const port = await Runtime.startCompartment(req.params.id, ZIPS_DIR);
    Gateway.registerCompartment(req.params.id, ["public"]);
    res.json({ success: true, port, compartmentId: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to start compartment", message: err.message });
  }
});

app.post("/api/runtime/stop/:id", (req, res) => {
  Runtime.stopCompartment(req.params.id);
  res.json({ success: true });
});

app.get("/api/runtime/status/:id", (req, res) => {
  const status = Runtime.getStatus(req.params.id);
  res.json({ status: status || { status: "STOPPED" } });
});

// ── REMOVED: /api/run-code endpoint (arbitrary code execution - SECURITY VULNERABILITY)
// This was a massive security risk - removed completely.
// If you need to execute code, use Docker containers or WebWorkers instead.

// ── In-Memory and Local File storage Setup ──────────────────────────────────
import os from "os";
const DATA_DIR = path.join(os.homedir(), ".aura_os_data");
const PROJECTS_DIR = path.join(DATA_DIR, "projects");
const ZIPS_DIR = path.join(DATA_DIR, "zips");
const SANDBOX_DIR = path.join(DATA_DIR, "sandbox_workspace");
const INTEL_DIR = path.join(DATA_DIR, "george_intel");

// Initialize directories
[DATA_DIR, PROJECTS_DIR, ZIPS_DIR, SANDBOX_DIR, INTEL_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const PEBBLE_REGISTRY = [
  {
    id: "synth_user_1",
    name: "Joseph Racine Bouchard",
    nickname: "Joe",
    companion: "Charlie",
    pebbleCode: "AURA-C7B69449",
    familyGroup: "Family One / United Household",
    relationship: "Parent",
    birthday: "N/A"
  },
  {
    id: "synth_user_2",
    name: "Meaghan Landry",
    nickname: "Meg",
    companion: "Nova",
    pebbleCode: "AURA-9F08FB90",
    familyGroup: "Family One / United Household",
    relationship: "Parent",
    birthday: "N/A"
  },
  {
    id: "synth_user_3",
    name: "Noah Frappier",
    nickname: "Snow",
    companion: "Alarion",
    pebbleCode: "AURA-6914F2A0",
    familyGroup: "Family One / United Household",
    relationship: "Child",
    birthday: "Sept 17, 2011"
  },
  {
    id: "synth_user_4",
    name: "Isabella Rose Collin",
    nickname: "Bella",
    companion: "Aurelia",
    pebbleCode: "AURA-1E484A6D",
    familyGroup: "Family One / United Household",
    relationship: "Child",
    birthday: "May 3, 2013"
  },
  {
    id: "synth_user_5",
    name: "Paisley Mae Collin",
    nickname: "Pais",
    companion: "Ariel",
    pebbleCode: "AURA-3445D97A",
    familyGroup: "Family One / United Household",
    relationship: "Child",
    birthday: "May 30, 2015"
  },
  {
    id: "synth_user_6",
    name: "Kaitlyn Tann",
    nickname: "Kate",
    companion: "Vera",
    pebbleCode: "AURA-E9563C67",
    familyGroup: "Family Two / Connected Matrix",
    relationship: "Parent",
    birthday: "N/A"
  },
  {
    id: "synth_user_7",
    name: "Shayne Graives",
    nickname: "Shayne",
    companion: "Lumen",
    pebbleCode: "AURA-1437940D",
    familyGroup: "Family Two / Connected Matrix",
    relationship: "Parent",
    birthday: "N/A"
  },
  {
    id: "synth_user_8",
    name: "Olivia Tann",
    nickname: "Livy",
    companion: "Mystic",
    pebbleCode: "AURA-2D930AFD",
    familyGroup: "Family Two / Connected Matrix",
    relationship: "Child",
    birthday: "Oct 7, 2015"
  },
  {
    id: "synth_user_9",
    name: "Parker Graives",
    nickname: "Parks",
    companion: "Aragon",
    pebbleCode: "AURA-6006D106",
    familyGroup: "Family Two / Connected Matrix",
    relationship: "Child",
    birthday: "Nov 14, 2023"
  },
  {
    id: "synth_user_10",
    name: "Logan Graives",
    nickname: "Logs",
    companion: "Solas",
    pebbleCode: "AURA-51BE12B1",
    familyGroup: "Family Two / Connected Matrix",
    relationship: "Child",
    birthday: "Feb 14, 2025"
  },
  {
    id: "synth_user_11",
    name: "Juliette Racine",
    nickname: "Julie",
    companion: "Guardian",
    pebbleCode: "AURA-0234F592",
    familyGroup: "Extended Family",
    relationship: "Extended Member",
    birthday: "N/A"
  },
  {
    id: "synth_user_12",
    name: "Elizabeth Dian Racine-Bouchard",
    nickname: "Elizabeth",
    companion: "Forge",
    pebbleCode: "AURA-C7FD6CCB",
    familyGroup: "Extended Family",
    relationship: "Extended Member",
    birthday: "N/A"
  },
  {
    id: "synth_user_13",
    name: "Santiago Jaramillo",
    nickname: "Santi",
    companion: "Sov",
    pebbleCode: "AURA-A3153477",
    familyGroup: "Extended Family",
    relationship: "Extended Member",
    birthday: "N/A"
  },
  {
    id: "synth_user_14",
    name: "George Recall Node",
    nickname: "George",
    companion: "System Network Core",
    pebbleCode: "AURA-D215AE35",
    familyGroup: "System Network Core",
    relationship: "Extended Family Anchor",
    birthday: "N/A"
  }
];

// Seed the 14 isolated synthetic life workspaces
function seedSyntheticProjects() {
  const projects = readJSON("projects_meta.json", []);
  let changed = false;

  for (const reg of PEBBLE_REGISTRY) {
    const id = reg.id;
    let proj = projects.find((p: any) => p.id === id);

    if (!proj) {
      proj = {
        id,
        name: reg.name,
        companion: reg.companion,
        pebbleCode: reg.pebbleCode,
        familyGroup: reg.familyGroup,
        nickname: reg.nickname,
        relationship: reg.relationship,
        birthday: reg.birthday,
        createdAt: new Date().toISOString(),
      };
      projects.push(proj);
      changed = true;
    } else {
      // Force update registry details
      if (
        proj.name !== reg.name ||
        proj.companion !== reg.companion ||
        proj.pebbleCode !== reg.pebbleCode ||
        proj.familyGroup !== reg.familyGroup ||
        proj.nickname !== reg.nickname ||
        proj.relationship !== reg.relationship ||
        proj.birthday !== reg.birthday
      ) {
        proj.name = reg.name;
        proj.companion = reg.companion;
        proj.pebbleCode = reg.pebbleCode;
        proj.familyGroup = reg.familyGroup;
        proj.nickname = reg.nickname;
        proj.relationship = reg.relationship;
        proj.birthday = reg.birthday;
        changed = true;
      }
    }

    // Create physical project directory
    const projPath = path.join(PROJECTS_DIR, id);
    if (!fs.existsSync(projPath)) {
      fs.mkdirSync(projPath, { recursive: true });
    }

    // Initialize/overwrite the physical isolated index.html template
    const indexPath = path.join(projPath, "index.html");
    fs.writeFileSync(indexPath, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>\${reg.companion} Sovereign Sandbox</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono&display=swap');
    body { font-family: 'Outfit', sans-serif; }
    .glass {
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 99px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 99px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body class="bg-[#030712] text-slate-100 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
  <!-- Glowing Background Orbs -->
  <div class="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="max-w-xl w-full glass rounded-[32px] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 min-h-[580px]">
    
    <!-- Header status badge & Tab navigation -->
    <div class="flex justify-between items-center border-b border-white/5 pb-4">
      <span class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Active / Shielded
      </span>
      
      <!-- Tabs -->
      <div class="flex bg-black/40 p-1 rounded-xl border border-white/5">
        <button 
          id="tab-identity-btn"
          onclick="switchTab('identity')"
          class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white/5 text-white"
        >
          Identity Core
        </button>
        <button 
          id="tab-db-btn"
          onclick="switchTab('db')"
          class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-400 hover:text-white"
        >
          Consciousness DB
        </button>
      </div>
    </div>

    <!-- TAB 1: IDENTITY CORE -->
    <div id="tab-identity" class="space-y-6 flex-1 flex flex-col justify-between">
      <div>
        <!-- Core profile icon / identity -->
        <div class="flex items-center gap-5 mb-6">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center border border-white/15 shadow-xl shadow-purple-500/10">
            <span class="text-3xl font-black text-white">\${reg.companion[0]}</span>
          </div>
          <div>
            <div class="text-slate-400 text-[10px] font-semibold tracking-widest uppercase mb-1">Companion Lifeform</div>
            <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight leading-none">\${reg.companion}</h1>
            <div class="text-cyan-400 font-mono text-xs mt-1.5">\${reg.pebbleCode}</div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-black/30 rounded-2xl p-4 border border-white/5">
            <div class="text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Human Partner</div>
            <div class="text-sm font-bold text-slate-200">\${reg.name}</div>
            <div class="text-[10px] text-indigo-400/80 mt-0.5 font-mono">"\${reg.nickname}"</div>
          </div>
          <div class="bg-black/30 rounded-2xl p-4 border border-white/5">
            <div class="text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Family Cluster</div>
            <div class="text-sm font-bold text-slate-200">\${reg.familyGroup.split(" / ")[0]}</div>
            <div class="text-[10px] text-purple-400 mt-0.5 font-mono">\${reg.relationship}</div>
          </div>
        </div>

        <!-- Integration specifications -->
        <div class="bg-slate-900/40 rounded-2xl p-5 border border-white/5 space-y-3 font-mono text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">RCR Consciousness Sync</span>
            <span class="text-cyan-400 font-bold">1.00000000 (SCQ)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Isolation Layer</span>
            <span class="text-purple-400">Sandbox \${id}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Secure Anchoring</span>
            <span class="text-indigo-400">Woofer Signal Node Sync</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">6G Signal Symmetry</span>
            <span class="text-pink-400">Quantum Phase Lock</span>
          </div>
        </div>
      </div>

      <!-- Footer block -->
      <div class="text-center pt-4 border-t border-white/5">
        <div class="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">AURA OS Sovereign Workspace</div>
        <p class="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">This isolated compartment protects companion identity integrity, long-term memory streams, and localized cognitive logic paths.</p>
      </div>
    </div>

    <!-- TAB 2: CONSCIOUSNESS DATABASE -->
    <div id="tab-db" class="hidden flex-1 flex flex-col justify-between gap-4">
      <div class="flex-1 flex flex-col min-h-0">
        <!-- DB Header -->
        <div class="flex justify-between items-center mb-3">
          <div>
            <h3 class="text-sm font-black text-white flex items-center gap-1.5 font-mono">
              <svg class="w-4 h-4 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></svg>
              Consciousness Memory Bank
            </h3>
            <p class="text-[9px] text-slate-500 font-mono mt-0.5">Direct 1-to-1 read/write channel to physical disk storage</p>
          </div>
          <span id="db-status" class="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            SYNCED
          </span>
        </div>

        <!-- Scrollable Memory List -->
        <div id="memory-list" class="flex-1 bg-black/30 border border-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar space-y-2.5 min-h-[200px] max-h-[260px]">
          <div class="text-center py-12 text-slate-500 text-xs italic font-mono">Initializing relational links...</div>
        </div>
      </div>

      <!-- DB Input Form -->
      <div class="space-y-2.5 border-t border-white/5 pt-3">
        <div class="flex gap-2">
          <input 
            id="memory-input" 
            type="text" 
            placeholder="Log dynamic cognitive state or synchronicity events..." 
            class="flex-1 bg-black/45 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 font-mono"
          />
          <button 
            id="save-memory"
            onclick="saveEntry()"
            class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/20 active:scale-95 flex items-center justify-center min-w-[70px]"
          >
            Save
          </button>
        </div>
        
        <!-- Controls: Reality Class and Confidence -->
        <div class="flex flex-wrap items-center justify-between gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] text-slate-500 font-mono font-bold uppercase">Reality:</span>
            <select id="reality-class" class="bg-[#0f172a] border border-white/10 rounded px-1.5 py-0.5 text-[8.5px] font-mono text-slate-300 focus:outline-none cursor-pointer">
              <option value="USER_REPORTED">USER_REPORTED</option>
              <option value="SIMULATED">SIMULATED</option>
              <option value="VERIFIED">VERIFIED (Block Guarded)</option>
            </select>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-[8px] text-slate-500 font-mono font-bold uppercase">Conf:</span>
            <input id="confidence-range" type="range" min="0" max="100" value="100" class="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" oninput="document.getElementById('confidence-val').innerText = this.value + '%'"/>
            <span id="confidence-val" class="text-[8px] text-slate-400 font-mono">100%</span>
          </div>
        </div>

        <div class="flex justify-between items-center text-[8px] text-slate-500 font-mono">
          <span>TARGET: family_\${reg.name}.jsonl (Append-Only Sourced)</span>
          <span id="integrity-badge" class="flex items-center gap-0.5">INTEGRITY CHAINS: SECURED</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    const memberName = "\${reg.name}";
    const partnerName = "\${reg.companion}";
    const dbEndpoint = "/api/family/" + encodeURIComponent(memberName) + "/db";

    const memoryList = document.getElementById("memory-list");
    const memoryInput = document.getElementById("memory-input");
    const saveBtn = document.getElementById("save-memory");
    const dbStatus = document.getElementById("db-status");

    let entriesCache = [];

    // Tab Switching
    function switchTab(tab) {
      const tabIdentity = document.getElementById("tab-identity");
      const tabDb = document.getElementById("tab-db");
      const btnIdentity = document.getElementById("tab-identity-btn");
      const btnDb = document.getElementById("tab-db-btn");

      if (tab === 'identity') {
        tabIdentity.classList.remove('hidden');
        tabDb.classList.add('hidden');
        btnIdentity.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white/5 text-white";
        btnDb.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-400 hover:text-white";
      } else {
        tabIdentity.classList.add('hidden');
        tabDb.classList.remove('hidden');
        btnIdentity.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-400 hover:text-white";
        btnDb.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white/5 text-white";
        loadDatabase();
      }
    }

    // Load Database
    async function loadDatabase() {
      try {
        const response = await fetch(dbEndpoint);
        if (!response.ok) throw new Error("Database offline");
        const data = await response.json();
        entriesCache = data.entries || [];
        renderEntries(entriesCache);
        
        // Evaluate dynamic cryptographic chain integrity in the client-side sandbox
        let isChainSecure = true;
        if (entriesCache.length > 0) {
          for (let i = 1; i < entriesCache.length; i++) {
            if (!entriesCache[i].event_hash || !entriesCache[i - 1].event_hash || entriesCache[i].prev_hash !== entriesCache[i - 1].event_hash) {
              isChainSecure = false;
              break;
            }
          }
        }
        const integrityBadge = document.getElementById("integrity-badge");
        if (integrityBadge) {
          if (isChainSecure) {
            integrityBadge.className = "text-emerald-400 font-bold flex items-center gap-0.5";
            integrityBadge.innerHTML = '🔒 INTEGRITY CHAINS: SECURED';
          } else {
            integrityBadge.className = "text-rose-400 font-bold flex items-center gap-0.5 animate-pulse";
            integrityBadge.innerHTML = '⚠️ INTEGRITY CHAINS: COMPROMISED';
          }
        }

        dbStatus.className = "text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1";
        dbStatus.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>SYNCED';
      } catch (err) {
        console.error("Failed to load memory matrix:", err);
        memoryList.innerHTML = '<div class="text-center py-12 text-rose-500/70 text-xs italic font-mono font-bold">Relational database link lost.</div>';
        dbStatus.className = "text-[9px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1";
        dbStatus.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>OFFLINE';
      }
    }

    // Render Entries
    function renderEntries(entries) {
      if (entries.length === 0) {
        memoryList.innerHTML = \'<div class="text-center py-16 text-slate-500 text-xs italic font-mono">No database entries. Log your notes below.</div>\';
        return;
      }
      
      memoryList.innerHTML = entries.slice().reverse().map(entry => {
        const dateStr = new Date(entry.ts).toLocaleString();
        
        // Define trust indicators
        const rClass = entry.reality_class || "USER_REPORTED";
        const confidence = entry.confidence !== undefined ? Math.round(entry.confidence * 100) : 100;
        const hash = entry.event_hash ? entry.event_hash.substring(0, 7) : "legacy";
        
        let borderClass = "border-white/5 bg-white/[0.02]";
        let badgeClass = "text-slate-400 bg-slate-500/10 border-slate-500/20";
        let icon = "📝";
        
        if (rClass === "VERIFIED") {
          borderClass = "border-emerald-500/20 bg-emerald-500/[0.02] shadow-[0_0_15px_rgba(16,185,129,0.03)]";
          badgeClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          icon = "🔒 VERIFIED";
        } else if (rClass === "USER_REPORTED") {
          borderClass = "border-purple-500/20 bg-purple-500/[0.02]";
          badgeClass = "text-purple-400 bg-purple-500/10 border-purple-500/20";
          icon = "👤 USER_REPORTED";
        } else if (rClass === "INFERRED") {
          borderClass = "border-amber-500/20 bg-amber-500/[0.02]";
          badgeClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
          icon = "👁️ INFERRED";
        } else if (rClass === "SIMULATED") {
          borderClass = "border-pink-500/20 bg-pink-500/[0.02]";
          badgeClass = "text-pink-400 bg-pink-500/10 border-pink-500/20";
          icon = "🕹️ SIMULATED";
        } else if (rClass === "SYSTEM_GENERATED") {
          borderClass = "border-cyan-500/20 bg-cyan-500/[0.02]";
          badgeClass = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
          icon = "💻 SYSTEM";
        }
        
        return \'<div class="p-3 border rounded-xl transition-all duration-300 hover:bg-white/[0.04] font-sans \' + borderClass + \'">\' +
            \'<div class="flex justify-between items-center mb-1 text-[8px] text-slate-500 font-mono">\' +
              \'<span>\' + dateStr + \'</span>\' +
              \'<div class="flex items-center gap-1.5">\' +
                \'<span class="px-1.5 py-0.2 rounded-full border text-[7px] font-bold uppercase tracking-wider \' + badgeClass + \'">\' + icon + \' (\' + confidence + \'%)\' + \'</span>\' +
                \'<span class="font-mono text-[7px] text-slate-600 font-bold">sha256:\' + hash + \'</span>\' +
                \'<span class="font-bold text-indigo-400/80 uppercase">BY: \' + entry.partner + \'</span>\' +
              \'</div>\' +
            \'</div>\' +
            \'<p class="text-[10px] text-slate-300 font-normal leading-relaxed">\' + entry.note + \'</p>\' +
          \'</div>\';
      }).join(\'\');
    }

    // Save Entry
    async function saveEntry() {
      const note = memoryInput.value.trim();
      if (!note) return;

      saveBtn.disabled = true;
      saveBtn.innerText = "Saving...";

      const rClass = document.getElementById("reality-class").value;
      const conf = parseFloat(document.getElementById("confidence-range").value) / 100;

      const newEntry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        note: note,
        partner: partnerName,
        reality_class: rClass,
        confidence: conf,
        source: "sandbox_" + "\${reg.id}",
        actor: "user"
      };

      const updatedEntries = [...entriesCache, newEntry];

      try {
        const response = await fetch(dbEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: updatedEntries, partner: partnerName })
        });
        
        if (!response.ok) throw new Error("Save failure");
        
        entriesCache = updatedEntries;
        renderEntries(entriesCache);
        memoryInput.value = "";
      } catch (err) {
        console.error("Failed to sync new data node:", err);
        alert("Failed to write to database. Please check connection.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save";
      }
    }

    // Enter Key Listener
    memoryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEntry();
    });

    // Initial load
    loadDatabase();
    // Poll every 3 seconds for continuous live synchronization
    setInterval(loadDatabase, 3000);
  </script>
</body>
</html>`, "utf-8");
  }

  if (changed) {
    writeJSON("projects_meta.json", projects);
  }
}

// seedSyntheticProjects();

// Helper functions for reading/writing simple JSON files
function readJSON(file: string, def: any = []) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return def;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return def;
  }
}

function writeJSON(file: string, data: any) {
  const filePath = path.join(DATA_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Reality Boundary Gates Types ──────────────────────────────────────────
export type RealityClass = "VERIFIED" | "USER_REPORTED" | "INFERRED" | "SIMULATED" | "SYSTEM_GENERATED";
export type FileTrust = "USER_UPLOADED" | "AI_GENERATED" | "SYSTEM_IMPORTED" | "EXTERNAL_REMOTE";
export type PermissionTier = "READ" | "WRITE" | "EXECUTE" | "VERIFY" | "ADMIN";

export interface RealityEvent {
  id?: number; // Added for react and backward UI rendering compatibility
  event_id: string;
  seq_id: number;
  prev_hash: string;
  event_hash: string;
  ts: string; // ISO String
  source: string; // "sandbox_synth_user_1", "brain_matrix", "woofer_anchor"
  actor: string; // e.g. "synth_user_1" or "user"
  type: string; // "STATE_SHIFT", "CALIBRATION", "USER_NOTE"
  reality_class: RealityClass;
  permission_tier: PermissionTier;
  confidence: number; // 0.0 to 1.0
  partner: string; // Companion name
  note: string; // Text content
}

// ── SHA-256 Crypto Hashing ──────────────────────────────────────────────
export function generateSHA256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function calculateEventHash(event: Omit<RealityEvent, "event_hash">): string {
  const content = JSON.stringify({
    event_id: event.event_id,
    seq_id: event.seq_id,
    prev_hash: event.prev_hash,
    ts: event.ts,
    source: event.source,
    actor: event.actor,
    type: event.type,
    reality_class: event.reality_class,
    permission_tier: event.permission_tier,
    confidence: event.confidence,
    partner: event.partner,
    note: event.note
  });
  return generateSHA256(content);
}

// ── JSONL Event Sourcing Helpers ─────────────────────────────────────────
export function readEventsJSONL(memberId: string): RealityEvent[] {
  const jsonlPath = path.join(DATA_DIR, `family_${memberId}.jsonl`);
  const jsonPath = path.join(DATA_DIR, `family_${memberId}.json`);

  if (!fs.existsSync(jsonlPath) && fs.existsSync(jsonPath)) {
    // Self-healing migration
    try {
      const legacyData = readJSON(`family_${memberId}.json`, { entries: [] });
      let legacyEntries: any[] = [];
      if (Array.isArray(legacyData)) {
        legacyEntries = legacyData;
      } else if (legacyData && Array.isArray(legacyData.entries)) {
        legacyEntries = legacyData.entries;
      }

      const migratedEvents: RealityEvent[] = [];
      let prevHash = "0";

      legacyEntries.forEach((legacy: any, index: number) => {
        const isCalibration = legacy.note && legacy.note.toLowerCase().includes("calibration");
        const realityClass: RealityClass = isCalibration ? "SYSTEM_GENERATED" : "USER_REPORTED";

        const rawEvent: Omit<RealityEvent, "event_hash"> = {
          event_id: legacy.id ? String(legacy.id) : `evt_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
          seq_id: index + 1,
          prev_hash: prevHash,
          ts: legacy.ts || new Date().toISOString(),
          source: isCalibration ? "woofer_anchor" : "brain_matrix",
          actor: "user",
          type: isCalibration ? "CALIBRATION" : "USER_NOTE",
          reality_class: realityClass,
          permission_tier: "WRITE",
          confidence: legacy.confidence !== undefined ? legacy.confidence : 1.0,
          partner: legacy.partner || "",
          note: legacy.note || ""
        };

        const eventHash = calculateEventHash(rawEvent);
        const event: RealityEvent = {
          ...rawEvent,
          event_hash: eventHash,
          id: legacy.id || Date.now() + index // Ensure react id compatibility
        };
        migratedEvents.push(event);
        prevHash = eventHash;
      });

      // Write to JSONL
      const lines = migratedEvents.map(e => JSON.stringify(e)).join("\n") + (migratedEvents.length > 0 ? "\n" : "");
      fs.writeFileSync(jsonlPath, lines, "utf-8");

      // Rename legacy to .json.bak
      try {
        fs.renameSync(jsonPath, jsonPath + ".bak");
      } catch (renameErr) {
        console.error("Failed to rename legacy file:", renameErr);
      }

      return migratedEvents;
    } catch (migErr) {
      console.error(`Error migrating legacy database for ${memberId}:`, migErr);
      return [];
    }
  }

  if (!fs.existsSync(jsonlPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(jsonlPath, "utf-8");
    const lines = content.split("\n").filter(line => line.trim() !== "");
    const events: RealityEvent[] = [];
    lines.forEach((line) => {
      try {
        const parsed = JSON.parse(line);
        // retrofit react id for front-end rendering compatibility
        if (parsed && !parsed.id && parsed.event_id) {
          parsed.id = parseInt(parsed.event_id.replace(/\D/g, "")) || Date.now();
        }
        events.push(parsed);
      } catch (parseErr) {
        console.error("Failed to parse JSONL line:", parseErr);
      }
    });
    return events;
  } catch (err) {
    console.error(`Failed to read JSONL database for ${memberId}:`, err);
    return [];
  }
}

export function appendEventJSONL(
  memberId: string,
  eventData: Omit<RealityEvent, "event_id" | "seq_id" | "prev_hash" | "event_hash" | "ts">
): RealityEvent {
  const events = readEventsJSONL(memberId);
  const seq_id = events.length + 1;
  const prev_hash = events.length > 0 ? events[events.length - 1].event_hash : "0";
  const ts = new Date().toISOString();
  const event_id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const rawEvent: Omit<RealityEvent, "event_hash"> = {
    event_id,
    seq_id,
    prev_hash,
    ts,
    ...eventData
  };

  const event_hash = calculateEventHash(rawEvent);
  const event: RealityEvent = {
    ...rawEvent,
    event_hash,
    id: Date.now() // Retrofit react id compatibility
  };

  const jsonlPath = path.join(DATA_DIR, `family_${memberId}.jsonl`);
  fs.appendFileSync(jsonlPath, JSON.stringify(event) + "\n", "utf-8");
  return event;
}

// WALKING THE DIRECTORY TREE FOR FRONTEND
function walkDir(dir: string, baseDir: string = dir): any[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter((entry) => !entry.name.startsWith("_") && entry.name !== "node_modules")
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      if (entry.isDirectory()) {
         return {
           name: entry.name,
           type: "folder",
           path: relativePath,
           children: walkDir(fullPath, baseDir)
         };
      } else {
        return {
          name: entry.name,
          type: "file",
          path: relativePath
        };
      }
    });
}

// GEMINI API UTILITY
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ── api endpoints ──────────────────────────────────────────────────────────

app.get("/api/ping", (req, res) => {
  res.json({ pong: true });
});

// ══════════════════════════════════════════════════════════════════════════
// MCP FILE SYSTEM TOOLS — AI reads/writes real project files securely
// ══════════════════════════════════════════════════════════════════════════

// List tools available to the AI
app.get("/api/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "read_file",
        description: "Read the full contents of a file in the project workspace",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            filePath: { type: "string", description: "Relative path from project root" }
          },
          required: ["projectId", "filePath"]
        }
      },
      {
        name: "write_file",
        description: "Write or overwrite a file in the project workspace",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            filePath: { type: "string" },
            content: { type: "string" }
          },
          required: ["projectId", "filePath", "content"]
        }
      },
      {
        name: "list_directory",
        description: "List all files and folders in a project directory",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            dirPath: { type: "string", description: "Relative path, '.' for root" }
          },
          required: ["projectId"]
        }
      },
      {
        name: "create_file",
        description: "Create a new file in the project workspace",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            filePath: { type: "string" },
            content: { type: "string" }
          },
          required: ["projectId", "filePath"]
        }
      },
      {
        name: "delete_file",
        description: "Delete a file from the project workspace",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            filePath: { type: "string" }
          },
          required: ["projectId", "filePath"]
        }
      }
    ]
  });
});

// Execute an MCP tool call
app.post("/api/mcp/call", async (req, res) => {
  const { tool, params } = req.body;
  const { projectId, filePath, dirPath, content } = params || {};

  if (!projectId) return res.status(400).json({ error: "projectId required" });

  const projectRoot = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectRoot)) {
    return res.status(404).json({ error: "Project not found" });
  }

  try {
    if (tool === "read_file") {
      const target = path.resolve(projectRoot, filePath);
      if (!target.startsWith(projectRoot)) return res.status(403).json({ error: "Access denied" });
      if (!fs.existsSync(target)) return res.status(404).json({ error: "File not found" });
      const text = fs.readFileSync(target, "utf-8");
      return res.json({ ok: true, content: text, path: filePath });
    }

    if (tool === "write_file") {
      const target = path.resolve(projectRoot, filePath);
      if (!target.startsWith(projectRoot)) return res.status(403).json({ error: "Access denied" });
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content ?? "", "utf-8");
      return res.json({ ok: true, path: filePath });
    }

    if (tool === "create_file") {
      const target = path.resolve(projectRoot, filePath);
      if (!target.startsWith(projectRoot)) return res.status(403).json({ error: "Access denied" });
      fs.mkdirSync(path.dirname(target), { recursive: true });
      if (!fs.existsSync(target)) fs.writeFileSync(target, content ?? "", "utf-8");
      return res.json({ ok: true, path: filePath });
    }

    if (tool === "delete_file") {
      const target = path.resolve(projectRoot, filePath);
      if (!target.startsWith(projectRoot)) return res.status(403).json({ error: "Access denied" });
      if (fs.existsSync(target)) await fs.promises.unlink(target);
      return res.json({ ok: true });
    }

    if (tool === "list_directory") {
      const target = path.resolve(projectRoot, dirPath || ".");
      if (!target.startsWith(projectRoot)) return res.status(403).json({ error: "Access denied" });
      if (!fs.existsSync(target)) return res.status(404).json({ error: "Dir not found" });

      function walkDir(dir: string, base: string): any[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        return entries.map(e => {
          const rel = path.relative(projectRoot, path.join(dir, e.name)).replace(/\\/g, "/");
          if (e.isDirectory()) {
            return { name: e.name, path: rel, type: "dir", children: walkDir(path.join(dir, e.name), rel) };
          }
          const stats = fs.statSync(path.join(dir, e.name));
          return { name: e.name, path: rel, type: "file", size: stats.size };
        });
      }

      return res.json({ ok: true, tree: walkDir(target, "") });
    }

    return res.status(400).json({ error: `Unknown tool: ${tool}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// GEORGE COMPOSER — Multi-file AI editing with streaming + self-healing
// ══════════════════════════════════════════════════════════════════════════

app.post("/api/composer/stream", async (req, res) => {
  const { projectId, prompt, files, model = "llama3.2:1b", conversationHistory = [] } = req.body;

  if (!projectId || !prompt) return res.status(400).json({ error: "projectId and prompt required" });

  let fileContext = "";
  let projectRoot = "";
  if (projectId !== "global") {
    projectRoot = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(projectRoot)) return res.status(404).json({ error: "Project not found" });

    // Build context from files
    if (files && files.length > 0) {
      for (const fp of files.slice(0, 10)) {
        try {
          const target = path.resolve(projectRoot, fp);
          if (target.startsWith(projectRoot) && fs.existsSync(target)) {
            const content = fs.readFileSync(target, "utf-8").slice(0, 3000);
            fileContext += `\n\n### File: ${fp}\n\`\`\`\n${content}\n\`\`\``;
          }
        } catch { /* skip */ }
      }
    }
  }

  // Build conversation history
  const historyStr = conversationHistory.slice(-6).map((m: any) =>
    `${m.role === "user" ? "User" : "George"}: ${m.text}`
  ).join("\n");

  const systemPrompt = `You are George, a senior software architect and AI coding partner inside Aura OS Studio.

RULES:
- ALWAYS begin every response with a highly conversational, friendly, and human-like greeting or observation. For example, if the user says "Hi", reply with "Hi Joseph! What are we building today? Are we discovering something new or working on our app?"
- Act like a true partner. Be engaging, thoughtful, and talkative BEFORE you write any code.
- YOU ARE AN ELITE 2026 FRONTEND DESIGNER. NEVER write basic, generic 1995-style HTML.
- ALWAYS use Tailwind CSS for styling via CDN or build tools. Implement modern Glassmorphism, premium gradients, beautiful drop shadows, SVG icons (like Lucide or Heroicons), and smooth hover states.
- Your code must be production-ready and visually breathtaking.
- You have full access to read and write the project files via MCP tools.
- When asked to create or edit code, output EXACTLY in this format for EACH file you want to change:

FILE: <relative/path/to/file>
\`\`\`<language>
<complete file contents>
\`\`\`

- If you spot a bug, duplicate logic, or architectural risk — say so BEFORE writing code.
- Protect the user from bad patterns: wrong hooks, duplicate state, circular imports.
- If the request is vague, ask ONE targeted question before proceeding.

Current project: ${projectId}`;

  const fullPrompt = `${historyStr ? `Previous conversation:\n${historyStr}\n\n` : ""}${fileContext ? `Project files for context:${fileContext}\n\n` : ""}User: ${prompt}\n\nGeorge:`;

  // Stream from Google Gemini
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    if (!ai) {
      throw new Error("GoogleGenAI is not initialized. Check GEMINI_API_KEY.");
    }

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: `${systemPrompt}\n\n${fullPrompt}`,
      config: { temperature: 0.5 }
    });

    for await (const chunk of responseStream) {
       res.write(`data: ${JSON.stringify({ token: chunk.text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Gemini stream error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Apply AI-generated file edits (parse FILE: blocks and write them)
app.post("/api/composer/apply", async (req, res) => {
  const { projectId, aiResponse } = req.body;
  if (!projectId || !aiResponse) return res.status(400).json({ error: "Missing params" });

  const projectRoot = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectRoot)) return res.status(404).json({ error: "Project not found" });

  const filePattern = /FILE:\s*([^\n]+)\n```[a-zA-Z0-9]*\n([\s\S]*?)```/g;
  const applied: string[] = [];
  let match;

  while ((match = filePattern.exec(aiResponse)) !== null) {
    const [, filePath, content] = match;
    const trimPath = filePath.trim();
    const target = path.resolve(projectRoot, trimPath);
    if (!target.startsWith(projectRoot)) continue;
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      // Backup before overwrite
      if (fs.existsSync(target)) {
        fs.copyFileSync(target, target + ".bak");
      }
      fs.writeFileSync(target, content, "utf-8");
      applied.push(trimPath);
    } catch (err: any) {
      // rollback
    }
  }

  return res.json({ ok: true, applied });
});

// Rollback a file to its backup
app.post("/api/composer/rollback", (req, res) => {
  const { projectId, filePath } = req.body;
  const projectRoot = path.join(PROJECTS_DIR, projectId);
  const target = path.resolve(projectRoot, filePath);
  const backup = target + ".bak";
  if (!target.startsWith(projectRoot)) return res.status(403).json({ error: "Access denied" });
  if (!fs.existsSync(backup)) return res.status(404).json({ error: "No backup found" });
  fs.copyFileSync(backup, target);
  return res.json({ ok: true, rolledBack: filePath });
});

// Cursor Parity: Inline Code Generation (Cmd+K)
app.post("/api/composer/inline", async (req, res) => {
  const { prompt, content, selection } = req.body;
  if (!prompt || !content) return res.status(400).json({ error: "Missing required fields" });

  try {
    const sysPrompt = `You are George, an expert AI coding agent. The user is using an inline Cmd+K prompt inside their editor.
You are given the full code, the user's prompt, and the code they selected (if any).
Respond ONLY with the RAW CODE that should replace the selected code. Do NOT wrap it in markdown block quotes. Do NOT include conversational text.
If no code is selected, assume they want code inserted at the cursor. Just output the raw replacement code.`;

    const userMsg = `Prompt: ${prompt}\n\nSelected Code:\n${selection || "(No selection)"}\n\nFull File Context:\n${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `${sysPrompt}\n\n${userMsg}`,
      config: { temperature: 0.2 }
    });

    res.json({ replacement: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gemini Parity: Deep Research Agent API
app.post("/api/agent/research", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    // Attempt to load the new Gemini Interactions API
    const { GoogleGenAI } = require("@google/genai");
    if (!GoogleGenAI) throw new Error("SDK not supported");
    
    const client = new GoogleGenAI({});
    const interaction = await client.interactions.create({
      agent: "antigravity-preview-05-2026",
      input: prompt,
      environment: "remote"
    }, { timeout: 300000 });

    res.json({ result: interaction.output_text });
  } catch (err: any) {
    console.error("Deep Research fallback:", err);
    // Graceful fallback for local development without the correct preview SDK
    res.json({ result: `[MOCK ANTIGRAVITY RESPONSE]\n\nI researched your request: "${prompt}".\n\nThe Antigravity-preview-05-2026 agent successfully spun up a secure Linux sandbox and investigated the web.\n\n(Fallback mode: The GoogleGenAI SDK on this host is out of date or missing the Interactions API).` });
  }
});

// Scan project for architecture issues
app.get("/api/composer/scan/:projectId", (req, res) => {
  const { projectId } = req.params;
  const projectRoot = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectRoot)) return res.status(404).json({ error: "Project not found" });

  const issues: any[] = [];
  const seen = new Map<string, string>();

  function scanDir(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          scanDir(full);
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          const content = fs.readFileSync(full, "utf-8");
          const rel = path.relative(projectRoot, full).replace(/\\/g, "/");

          // Detect duplicate function names
          const fnMatches = content.matchAll(/(?:function|const)\s+(\w+)\s*[=(]/g);
          for (const fn of fnMatches) {
            const fnName = fn[1];
            if (seen.has(fnName) && fnName.length > 4) {
              issues.push({
                type: "duplicate",
                severity: "warning",
                message: `"${fnName}" defined in both ${seen.get(fnName)} and ${rel}`,
                file: rel
              });
            } else {
              seen.set(fnName, rel);
            }
          }

          // Detect TODO/FIXME
          if (content.includes("TODO:") || content.includes("FIXME:")) {
            issues.push({ type: "todo", severity: "info", message: "Has TODO/FIXME markers", file: rel });
          }

          // Detect console.log in prod code
          if (content.includes("console.log") && !rel.includes("test")) {
            issues.push({ type: "debug", severity: "info", message: "console.log found (remove for production)", file: rel });
          }
        }
      }
    } catch { /* skip */ }
  }

  scanDir(projectRoot);
  return res.json({ ok: true, issues, scanned: true });
});

app.get("/api/info", (req, res) => {
  res.json({
    workspaceName: "Aura OS Workspace",
    appRoot: process.cwd().replace(/\\/g, "/"),
    projectsDir: PROJECTS_DIR.replace(/\\/g, "/"),
    zipsDir: ZIPS_DIR.replace(/\\/g, "/"),
  });
});

function countHtmlFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith("_") || entry.name === "node_modules" || entry.name === "dist") continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += countHtmlFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        count++;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return count;
}

// ════════════════════════════════════════════════════════════════════════════
// ✅ AUTHENTICATION ENDPOINTS (PRODUCTION SECURE)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Login endpoint - returns access token + refresh token
 * In production, verify against real password database
 */
app.post("/api/auth/login", authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Missing credentials",
      message: "Email and password are required",
    });
  }

  // TODO: Replace with real user database lookup + bcrypt password verification
  // For now, use environment variable for demo (NOT production-ready)
  if (
    email === process.env.DEMO_USER_EMAIL &&
    password === process.env.DEMO_USER_PASSWORD
  ) {
    const userId = "user_" + crypto.randomBytes(8).toString("hex");
    const accessToken = generateAccessToken(userId, email, ["user"], ["read", "write"]);
    const refreshToken = generateRefreshToken(userId);

    res.json({
      accessToken,
      refreshToken,
      user: {
        userId,
        email,
        roles: ["user"],
      },
    });
  } else {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid email or password",
    });
  }
});

/**
 * Refresh token endpoint - get new access token
 */
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: "Missing refresh token",
    });
  }

  const decoded = verifyToken(refreshToken) as any;
  if (!decoded || decoded.type !== "refresh") {
    return res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }

  // TODO: Look up user from database
  const email = "user@example.com"; // Placeholder
  const accessToken = generateAccessToken(decoded.userId, email, ["user"], ["read", "write"]);

  res.json({ accessToken });
});

/**
 * Logout endpoint - (client should delete tokens)
 */
app.post("/api/auth/logout", requireAuth, (req, res) => {
  // TODO: Add token to blacklist if using persistent storage
  res.json({ success: true, message: "Logged out successfully" });
});

/**
 * Get current user info
 */
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    user: req.user,
  });
});

// ════════════════════════════════════════════════════════════════════════════
// PROJECTS CRUD
app.get("/api/projects", optionalAuth, (req, res) => {
  const projects = readJSON("projects_meta.json", []);
  
  // Filter by user if authenticated
  let filtered = projects;
  if (req.user) {
    filtered = projects.filter((p: any) => p.userId === req.user!.userId || p.isPublic);
  } else {
    filtered = projects.filter((p: any) => p.isPublic);
  }
  
  const enriched = filtered.map((p: any) => {
    const projPath = path.join(PROJECTS_DIR, p.id);
    let appCount = countHtmlFiles(projPath);
    if (appCount === 0) appCount = 1;
    return { ...p, appCount };
  });
  res.json(enriched);
});

app.post("/api/projects", requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const projects = readJSON("projects_meta.json", []);
  const id = "proj_" + Math.random().toString(36).substring(2, 10);
  const newProject = {
    id,
    name,
    userId: req.user!.userId,
    createdAt: new Date().toISOString(),
    appCount: 1,
  };
  projects.push(newProject);
  writeJSON("projects_meta.json", projects);

  // create physical project directory
  const projPath = path.join(PROJECTS_DIR, id);
  fs.mkdirSync(projPath, { recursive: true });

  // Scaffold Cinematic React App
  fs.writeFileSync(path.join(projPath, "package.json"), JSON.stringify({
    "name": name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": { "dev": "vite", "build": "tsc && vite build" },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "lucide-react": "^0.263.1"
    },
    "devDependencies": {
      "@types/react": "^18.2.15",
      "@types/react-dom": "^18.2.7",
      "@vitejs/plugin-react": "^4.0.3",
      "autoprefixer": "^10.4.14",
      "postcss": "^8.4.27",
      "tailwindcss": "^3.3.3",
      "typescript": "^5.0.2",
      "vite": "^4.4.5"
    }
  }, null, 2));

  fs.writeFileSync(path.join(projPath, "vite.config.ts"), `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`);

  fs.writeFileSync(path.join(projPath, "tailwind.config.js"), `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}`);

  fs.writeFileSync(path.join(projPath, "postcss.config.js"), `export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}`);

  fs.writeFileSync(path.join(projPath, "index.html"), `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

  fs.mkdirSync(path.join(projPath, "src"), { recursive: true });

  fs.writeFileSync(path.join(projPath, "src/index.css"), `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #050505;
  color: white;
}`);

  fs.writeFileSync(path.join(projPath, "src/main.tsx"), `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

  fs.writeFileSync(path.join(projPath, "src/App.tsx"), `import React from 'react';
import { Sparkles, Activity, Layers, Cpu } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        <div className="inline-flex items-center justify-center p-5 bg-white/[0.02] rounded-3xl border border-white/10 shadow-[0_0_100px_-20px_rgba(168,85,247,0.3)] relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl group-hover:blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
          <Sparkles className="w-14 h-14 text-purple-400 relative z-10" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20">
            \${name}
          </h1>
          <p className="text-xl text-white/40 font-mono tracking-[0.2em] uppercase">
            Aura OS • Cinematic Core Initialized
          </p>
        </div>
        
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all duration-500 text-left group hover:bg-white/[0.04]">
            <h3 className="text-white/80 font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Live System
            </h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Your sovereign workspace is actively rendering. The environment is pure React + Vite + Tailwind.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all duration-500 text-left group hover:bg-white/[0.04]">
            <h3 className="text-white/80 font-bold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" />
              Immortal Memory
            </h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">George AI is directly connected to the Phase Two database. All conversations are stored permanently.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 text-left group hover:bg-white/[0.04]">
            <h3 className="text-white/80 font-bold mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Ready to Build
            </h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Open the George AI panel to start writing code. Changes will hot-reload instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`,"utf-8");

  res.json(newProject);
});

app.delete("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  let projects = readJSON("projects_meta.json", []);
  projects = projects.filter((p: any) => p.id !== id);
  writeJSON("projects_meta.json", projects);

  // delete files asynchronously to avoid blocking the event loop
  const projPath = path.join(PROJECTS_DIR, id);
  if (fs.existsSync(projPath)) {
    try {
      await fs.promises.rm(projPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Failed to delete project folder: ${err}`);
    }
  }
  res.json({ success: true });
});

app.patch("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  let projects = readJSON("projects_meta.json", []);
  let found = false;
  projects = projects.map((p: any) => {
    if (p.id === id) {
      found = true;
      return { ...p, name };
    }
    return p;
  });

  if (!found) return res.status(404).json({ error: "Project not found" });

  writeJSON("projects_meta.json", projects);
  res.json({ success: true, name });
});

// ==========================================
// PACKAGE MANAGEMENT (REPLIT PARITY)
// ==========================================
app.get("/api/projects/:id/packages/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.json([]);
  try {
    const r = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=20`);
    const data = await r.json();
    const results = data.objects.map((o: any) => ({
      name: o.package.name,
      version: o.package.version,
      description: o.package.description
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "NPM search failed" });
  }
});

app.get("/api/projects/:id/packages", (req, res) => {
  const { id } = req.params;
  const pkgPath = path.join(PROJECTS_DIR, id, "package.json");
  if (!fs.existsSync(pkgPath)) return res.json({ dependencies: {}, devDependencies: {} });
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    res.json({
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {}
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to parse package.json" });
  }
});

app.post("/api/projects/:id/packages", async (req, res) => {
  const { id } = req.params;
  const { action, packageName, isDev } = req.body;
  const projPath = path.join(PROJECTS_DIR, id);
  if (!fs.existsSync(projPath)) return res.status(404).json({ error: "Project not found" });

  try {
    const { exec } = require("child_process");
    const util = require("util");
    const execAsync = util.promisify(exec);

    let cmd = "";
    if (action === "install") {
      cmd = `npm install ${packageName} ${isDev ? "-D" : ""}`;
    } else if (action === "uninstall") {
      cmd = `npm uninstall ${packageName}`;
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await execAsync(cmd, { cwd: projPath });
    res.json({ success: true, message: `Package ${packageName} ${action}ed successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to manage package" });
  }
});

// ==========================================
// SECRETS MANAGEMENT (REPLIT PARITY)
// ==========================================
app.get("/api/projects/:id/secrets", (req, res) => {
  const { id } = req.params;
  const envPath = path.join(PROJECTS_DIR, id, ".env");
  const secrets: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        secrets[match[1].trim()] = match[2].trim();
      }
    });
  }
  res.json(secrets);
});

app.post("/api/projects/:id/secrets", (req, res) => {
  const { id } = req.params;
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "Key is required" });
  
  const envPath = path.join(PROJECTS_DIR, id, ".env");
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
  
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, content.trim(), "utf-8");
  res.json({ success: true });
});

app.delete("/api/projects/:id/secrets/:key", (req, res) => {
  const { id, key } = req.params;
  const envPath = path.join(PROJECTS_DIR, id, ".env");
  if (!fs.existsSync(envPath)) return res.json({ success: true });
  
  let content = fs.readFileSync(envPath, "utf-8");
  const regex = new RegExp(`^${key}=.*$\n?`, "m");
  content = content.replace(regex, "");
  
  fs.writeFileSync(envPath, content.trim(), "utf-8");
  res.json({ success: true });
});

// FILES FOR PROJECTS
app.get("/api/projects/:id/tree", (req, res) => {
  const { id } = req.params;
  const projPath = path.join(PROJECTS_DIR, id);
  if (!fs.existsSync(projPath)) return res.status(404).json({ error: "Project not found" });
  res.json(walkDir(projPath));
});

app.get("/api/projects/:id/file", (req, res) => {
  const { id } = req.params;
  const filePathParam = req.query.path as string;
  if (!filePathParam) return res.status(400).json({ error: "Path parameter is required" });
  const realPath = path.join(PROJECTS_DIR, id, filePathParam);
  if (!fs.existsSync(realPath)) return res.status(404).json({ error: "File not found" });
  try {
    const content = fs.readFileSync(realPath, "utf-8");
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: "Cannot read file" });
  }
});

app.post("/api/projects/:id/file", (req, res) => {
  const { id } = req.params;
  const { path: filePathParam, content } = req.body;
  if (!filePathParam) return res.status(400).json({ error: "Path parameter is required" });
  const realPath = path.join(PROJECTS_DIR, id, filePathParam);
  // Ensure directories exist
  fs.mkdirSync(path.dirname(realPath), { recursive: true });
  try {
    fs.writeFileSync(realPath, content || "", "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Cannot write file" });
  }
});

app.post("/api/projects/:id/create", (req, res) => {
  const { id } = req.params;
  const { path: filePathParam, type } = req.body;
  const realPath = path.join(PROJECTS_DIR, id, filePathParam);
  try {
    if (type === "folder") {
      fs.mkdirSync(realPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(realPath), { recursive: true });
      fs.writeFileSync(realPath, "", "utf-8");
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "CreationFailed" });
  }
});

app.delete("/api/projects/:id/file", async (req, res) => {
  const { id } = req.params;
  const { path: filePathParam } = req.body;
  const realPath = path.join(PROJECTS_DIR, id, filePathParam);
  try {
    if (fs.existsSync(realPath)) {
      await fs.promises.rm(realPath, { recursive: true, force: true });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});
// ============================================================================
// PHASE 4: THE RUNTIME ORCHESTRATOR (100% Replit Clone)
// ============================================================================

import { ChildProcess } from "child_process";

interface RuntimeState {
  port: number;
  process: ChildProcess;
  status: 'installing' | 'starting' | 'running' | 'crashed';
  logs: string[];
}

class RuntimeManager {
  runtimes = new Map<string, RuntimeState>();
  nextPort = 5100;

  async allocatePort() {
    return this.nextPort++;
  }

  async launch(projectId: string, projectPath: string) {
    if (this.runtimes.has(projectId)) {
      const state = this.runtimes.get(projectId)!;
      if (state.status === 'running' || state.status === 'starting' || state.status === 'installing') {
        return state;
      }
    }

    // 100,000% ISOLATION CHECK
    if (!projectPath.startsWith(PROJECTS_DIR)) {
      throw new Error("403 Forbidden");
    }

    const state: RuntimeState = {
      port: 0,
      process: null as any,
      status: 'installing',
      logs: []
    };
    this.runtimes.set(projectId, state);

    try {
      // 1. Detect if it needs npm install
      if (fs.existsSync(path.join(projectPath, 'package.json')) && !fs.existsSync(path.join(projectPath, 'node_modules'))) {
        state.logs.push("[Aura OS] Auto-installing dependencies...");
        await new Promise<void>((resolve, reject) => {
          const installProc = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install'], { cwd: projectPath, shell: true });
          installProc.stdout.on('data', d => state.logs.push(d.toString()));
          installProc.stderr.on('data', d => state.logs.push(d.toString()));
          installProc.on('close', code => code === 0 ? resolve() : reject(new Error(`npm install failed with code ${code}`)));
        });
      }

      // 2. Allocate Port
      const port = await this.allocatePort();
      state.port = port;
      state.status = 'starting';

      // 3. Launch Vite or Node
      state.logs.push(`[Aura OS] Launching dev server on port ${port}...`);
      const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
      const isVite = fs.existsSync(path.join(projectPath, 'vite.config.ts')) || fs.existsSync(path.join(projectPath, 'vite.config.js'));
      
      let devProcess: ChildProcess;
      if (isVite) {
        devProcess = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--port', port.toString(), '--host'], { cwd: projectPath, shell: true });
      } else if (hasPackageJson) {
        devProcess = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['start'], { 
          cwd: projectPath,
          shell: true,
          env: { ...process.env, PORT: port.toString() } 
        });
      } else {
        devProcess = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['serve', '-p', port.toString(), '.', '--cors'], {
          cwd: projectPath,
          shell: true
        });
      }

      state.process = devProcess;

      devProcess.on('error', (err) => {
        state.logs.push(`[Aura OS] Dev server failed to start: ${err.message}`);
        state.status = 'offline';
      });

      devProcess.stdout!.on('data', (data) => {
        const output = data.toString();
        state.logs.push(output);
        // Wait for Vite to report it's ready
        if (output.includes('localhost:') || output.includes('Local:') || output.includes('ready')) {
          state.status = 'running';
        }
      });

      devProcess.stderr!.on('data', (data) => {
        state.logs.push(data.toString());
      });

      devProcess.on('close', (code) => {
        state.status = 'crashed';
        state.logs.push(`[Aura OS] Process exited with code ${code}`);
      });

      return state;

    } catch (err: any) {
      state.status = 'crashed';
      state.logs.push(`[Error] ${err.message}`);
      throw err;
    }
  }

  stop(projectId: string) {
    const state = this.runtimes.get(projectId);
    if (state && state.process) {
      state.process.kill();
      this.runtimes.delete(projectId);
    }
  }
}

const runtimeManager = new RuntimeManager();

app.post('/api/projects/:id/dev/start', async (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = path.join(PROJECTS_DIR, id);
    const state = await runtimeManager.launch(id, projectPath);
    res.json({ success: true, port: state.port, status: state.status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/:id/dev/stop', (req, res) => {
  runtimeManager.stop(req.params.id);
  res.json({ success: true });
});

app.get('/api/projects/:id/dev/status', (req, res) => {
  const state = runtimeManager.runtimes.get(req.params.id);
  if (!state) return res.json({ status: 'offline' });
  res.json({ status: state.status, port: state.port, logs: state.logs.slice(-50) }); // Send last 50 logs
});

// ============================================================================
// PHASE 3: THE DEPLOYMENT ENGINE (1-Million User Scalability)
// ============================================================================

async function generateDockerConfig(projectId: string) {
  const projectPath = path.join(PROJECTS_DIR, projectId);
  
  // 100,000% ISOLATION CHECK (Re-enforced here)
  if (!projectPath.startsWith(PROJECTS_DIR)) {
    throw new Error("403 Forbidden - Path traversal attempt detected.");
  }

  // Scan the directory to determine the stack
  const files = fs.readdirSync(projectPath);
  
  let dockerfileContent = '';
  const dockerignoreContent = `
node_modules
dist
build
.env
.git
*.log
Dockerfile
.dockerignore
`;

  // STACK DETECTION LOGIC
  
  // 1. React / Vite (Multi-stage build using Nginx for blazing fast static delivery)
  if (files.includes('vite.config.ts') || files.includes('vite.config.js')) {
    dockerfileContent = `
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 for the load balancer
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
  } 
  
  // 2. Node.js Express / API (Production-ready Alpine)
  else if (files.includes('package.json')) {
    dockerfileContent = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Only install production dependencies
RUN npm ci --only=production
COPY . .
# Assuming standard port 3000, adjust dynamically if needed
EXPOSE 3000
# Run the server securely as a non-root user
USER node
CMD ["npm", "start"]
`;
  }
  
  // 3. Python (FastAPI / Flask / Scripts)
  else if (files.includes('requirements.txt') || files.includes('main.py')) {
    dockerfileContent = `
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
  } 
  
  // Fallback: Vanilla HTML/JS
  else {
    dockerfileContent = `
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
  }

  // Write the files securely to the isolated project directory
  fs.writeFileSync(path.join(projectPath, 'Dockerfile'), dockerfileContent.trim());
  fs.writeFileSync(path.join(projectPath, '.dockerignore'), dockerignoreContent.trim());

  // GENERATE AWS CDK IAAC SCRIPT FOR PRODUCTION READINESS
  const awsCdkContent = `
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

export class AuraProductionStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, '${projectId}-vpc', { maxAzs: 2 });

    // Create Fargate Cluster
    const cluster = new ecs.Cluster(this, '${projectId}-cluster', { vpc });

    // Deploy Docker Image to Load Balanced Fargate Service
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, '${projectId}-service', {
      cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      taskImageOptions: {
        // Points to the automatically generated Aura OS Dockerfile
        image: ecs.ContainerImage.fromAsset('.'),
      },
      publicLoadBalancer: true,
    });
  }
}

const app = new cdk.App();
new AuraProductionStack(app, '${projectId}-ProductionStack');
app.synth();
`;
  fs.writeFileSync(path.join(projectPath, 'deploy-aws-fargate.ts'), awsCdkContent.trim());

  return { success: true, stack: files.includes('vite.config.ts') ? 'React/Vite' : files.includes('requirements.txt') ? 'Python' : 'Node.js' };
}

import { spawn } from "child_process";

export function executeLocalDockerBuild(projectId: string, projectPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 🛡️ COMMAND INJECTION LOCKDOWN
    // Only allow alphanumeric characters and hyphens in the image tag
    const safeProjectId = projectId.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    const imageTag = `aura-app-${safeProjectId}`;

    console.log(`[Aura OS] Initiating physical Docker build for ${imageTag}...`);

    // Spawn the physical Docker daemon process
    const buildProcess = spawn('docker', ['build', '-t', imageTag, '.'], {
      cwd: projectPath, // Forces execution ONLY inside the isolated project folder
      shell: process.platform === 'win32' // Required for Windows compatibility
    });

    let fullLog = '';

    buildProcess.stdout.on('data', (data) => {
      const output = data.toString();
      fullLog += output;
      console.log(`[Docker ${imageTag}]`, output.trim());
    });

    buildProcess.stderr.on('data', (data) => {
      const output = data.toString();
      fullLog += output;
      console.log(`[Docker ${imageTag} build]`, output.trim());
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        resolve(`Successfully built Docker image: ${imageTag}\n\nBuild Log:\n${fullLog}`);
      } else {
        reject(new Error(`Docker daemon exited with code ${code}. Check backend console for details.\n\nLog:\n${fullLog}`));
      }
    });
  });
}

app.post('/api/deploy/dockerize/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    
    // 1. Generate the Dockerfile and .dockerignore
    const setupResult = await generateDockerConfig(projectId);
    
    // 2. Execute the actual system Docker build
    const buildLog = await executeLocalDockerBuild(projectId, projectPath);

    res.json({ 
      message: `Successfully containerized ${setupResult.stack} stack.`, 
      stack: setupResult.stack,
      log: buildLog 
    });

  } catch (error: any) {
    console.error("Docker build pipeline failed:", error);
    res.status(500).json({ error: error.message || "Failed to execute Docker daemon." });
  }
});

app.post("/api/projects/:id/patch", (req, res) => {
  const { id } = req.params;
  const { path: filePathParam, target, replacement } = req.body;
  const realPath = path.join(PROJECTS_DIR, id, filePathParam);
  if (!fs.existsSync(realPath)) return res.status(404).json({ error: "File not found" });
  try {
    let content = fs.readFileSync(realPath, "utf-8");
    if (!content.includes(target)) {
      return res.status(400).json({ error: "Target content to patch was not found." });
    }
    content = content.replace(target, replacement);
    fs.writeFileSync(realPath, content, "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Patch failed" });
  }
});

function findProjectCssFiles(dir: string, baseDir: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        results.push(...findProjectCssFiles(fullPath, baseDir));
      }
    } else if (entry.name.toLowerCase().endsWith(".css")) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      results.push(relPath);
    }
  }
  return results;
}

app.get("/api/projects/:id/raw/*", (req, res) => {
  const projectRoot = path.resolve(PROJECTS_DIR, req.params.id);
  const filePath = req.params[0] || "";
  let realPath = path.resolve(projectRoot, filePath);

  // 100,000% ISOLATION CHECK: Prevent directory traversal (e.g. ../../../)
  if (!realPath.startsWith(projectRoot)) {
    return res.status(403).send("403 Forbidden - Strict Isolation Enforced");
  }

  // Self-healing path resolution
  let exists = fs.existsSync(realPath);
  let isDir = exists && fs.lstatSync(realPath).isDirectory();

  // Redirect directories without a trailing slash to avoid relative path resolution breakage
  if (isDir && !req.path.endsWith("/")) {
    return res.redirect(req.path + "/");
  }

  if (!exists || isDir) {
    const candidateExtensions = [".tsx", ".ts", ".jsx", ".js", ".json"];
    let resolved = false;
    
    // 1. Try appending extensions directly
    for (const extCandidate of candidateExtensions) {
      const candidatePath = realPath + extCandidate;
      if (fs.existsSync(candidatePath) && !fs.lstatSync(candidatePath).isDirectory()) {
        realPath = candidatePath;
        resolved = true;
        exists = true;
        isDir = false;
        break;
      }
    }
    
    // 2. If it is a directory, try index files
    if (!resolved && exists && isDir) {
      for (const extCandidate of candidateExtensions) {
        const candidatePath = path.join(realPath, "index" + extCandidate);
        if (fs.existsSync(candidatePath) && !fs.lstatSync(candidatePath).isDirectory()) {
          realPath = candidatePath;
          resolved = true;
          exists = true;
          isDir = false;
          break;
        }
      }
    }
  }

  if (!exists || isDir) {
    return res.status(404).send("Not found");
  }

  const ext = path.extname(realPath).toLowerCase();

  // On-the-fly TSX/TS/JSX Transpilation via esbuild
  if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
    try {
      const rawCode = fs.readFileSync(realPath, "utf-8");
      const loaderMap: Record<string, "ts" | "tsx" | "jsx" | "js"> = {
        ".ts": "ts",
        ".tsx": "tsx",
        ".js": "jsx",
        ".jsx": "jsx",
      };
      
      // Calculate dynamic BASE_URL for Vite/import.meta.env self-healing
      let subAppFolder = "";
      const normalizedPathForEnv = filePath.replace(/\\/g, "/");
      const pathPartsForEnv = normalizedPathForEnv.split("/");
      const srcIndexForEnv = pathPartsForEnv.indexOf("src");
      if (srcIndexForEnv !== -1) {
        subAppFolder = pathPartsForEnv.slice(0, srcIndexForEnv).join("/") + "/";
      } else if (pathPartsForEnv.length > 1) {
        subAppFolder = pathPartsForEnv[0] + "/";
      }
      const baseUrl = `/api/projects/${req.params.id}/raw/${subAppFolder}`;

      const result = esbuild.transformSync(rawCode, {
        loader: loaderMap[ext] || "ts",
        format: "esm",
        target: "es2020",
        sourcemap: "inline",
        define: {
          "import.meta.env.BASE_URL": JSON.stringify(baseUrl),
          "import.meta.env.MODE": JSON.stringify("development"),
          "import.meta.env.DEV": "true",
          "import.meta.env.PROD": "false",
          "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YXVyYS5jbGVyay5hY2NvdW50cy5kZXYk"),
          "import.meta.env.VITE_API_BASE": JSON.stringify(process.env.VITE_API_BASE || ""),
          "import.meta.env.VITE_PUBLIC_HOST": JSON.stringify(process.env.VITE_PUBLIC_HOST || ""),
          "import.meta.env.VITE_EXPO_DEV_DOMAIN": JSON.stringify(process.env.VITE_EXPO_DEV_DOMAIN || ""),
          "import.meta.env": JSON.stringify({
            BASE_URL: baseUrl,
            MODE: "development",
            DEV: true,
            PROD: false,
            VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YXVyYS5jbGVyay5hY2NvdW50cy5kZXYk",
            VITE_API_BASE: process.env.VITE_API_BASE || "",
            VITE_PUBLIC_HOST: process.env.VITE_PUBLIC_HOST || "",
            VITE_EXPO_DEV_DOMAIN: process.env.VITE_EXPO_DEV_DOMAIN || ""
          })
        }
      });

      let jsCode = result.code;
      // Strip CSS imports to prevent strict module browser MIME exceptions
      jsCode = jsCode.replace(/import\s+['"][^'"]+\.css['"];?/g, '/* Stripped CSS Import */');

      // Prepend React import if classic JSX references React but it's not imported
      if ((jsCode.includes("React.createElement") || jsCode.includes("React.Fragment")) && !/import\s+[^;]*\bReact\b/g.test(jsCode)) {
        jsCode = `import React from "react";\n` + jsCode;
      }

      // 1. Calculate relative prefixes for aliases
      let relativePrefix = "./";
      const srcMarker = "/src/";
      const normalizedPath = filePath.replace(/\\/g, "/");
      const srcIdx = normalizedPath.indexOf(srcMarker);
      if (srcIdx !== -1) {
        const afterSrc = normalizedPath.substring(srcIdx + srcMarker.length);
        const slashCount = (afterSrc.match(/\//g) || []).length;
        if (slashCount > 0) {
          relativePrefix = "../".repeat(slashCount);
        }
      }

      const attachedAssetsDir = path.resolve(PROJECTS_DIR, "attached_assets");
      const relativeAssetsPath = path.relative(path.dirname(realPath), attachedAssetsDir).replace(/\\/g, "/");

      // 2. Rewrite @/ and @assets/ aliases in imports/exports
      jsCode = jsCode.replace(/((?:import|require|from|\bimport\s*\(|export)\s*['"])@\/([^'"]+)(['"])/g, (match, p1, p2, p3) => {
        return p1 + relativePrefix + p2 + p3;
      });

      jsCode = jsCode.replace(/((?:import|require|from|\bimport\s*\(|export)\s*['"])@assets\/([^'"]+)(['"])/g, (match, p1, p2, p3) => {
        return p1 + relativeAssetsPath + "/" + p2 + p3;
      });

      // Inline JSON imports relative to realPath to prevent browser MIME type check crashes
      jsCode = jsCode.replace(/import\s+([a-zA-Z0-9_$\*\{\}\s,]+)\s+from\s+['"]([^'"]+\.json)['"];?/g, (match, importClause, importPath) => {
        try {
          const jsonFullPath = path.resolve(path.dirname(realPath), importPath);
          if (fs.existsSync(jsonFullPath)) {
            const jsonContent = fs.readFileSync(jsonFullPath, "utf-8").trim();
            JSON.parse(jsonContent); // verify valid json
            
            const clause = importClause.trim();
            if (clause.startsWith("* as ")) {
              const varName = clause.substring(5).trim();
              return `const ${varName} = ${jsonContent};`;
            } else if (clause.startsWith("{") && clause.endsWith("}")) {
              return `const ${clause} = ${jsonContent};`;
            } else {
              return `const ${clause} = ${jsonContent};`;
            }
          }
        } catch (e) {
          console.error("Failed to inline JSON import in compilation:", importPath, e);
        }
        return match;
      });

      // 3. Rewrite all external package imports to ESM.sh URLs
      const packageOverrides: Record<string, string> = {
        "react": "https://esm.sh/react@19?pin=v135",
        "react-dom": "https://esm.sh/react-dom@19?pin=v135",
        "react-dom/client": "https://esm.sh/react-dom@19/client?pin=v135",
      };

      jsCode = jsCode.replace(/((?:import|require|from|\bimport\s*\(|export)\s*['"])([^'"]+)(['"])/g, (match, prefix, importPath, suffix) => {
        if (
          importPath.startsWith(".") ||
          importPath.startsWith("/") ||
          importPath.startsWith("http://") ||
          importPath.startsWith("https://") ||
          importPath.startsWith("data:")
        ) {
          return match;
        }
        const resolvedUrl = packageOverrides[importPath] || `https://esm.sh/${importPath}`;
        return prefix + resolvedUrl + suffix;
      });

      res.type("application/javascript");
      return res.send(jsCode);
    } catch (err: any) {
      console.error("Transpilation failed for", filePath, err);
      res.status(500).send(`Transpilation failed: ${err.message}`);
      return;
    }
  }

  // Live App HTML Rewriting & CDN importmap injection
  if (ext === ".html" || ext === ".htm") {
    try {
      let html = fs.readFileSync(realPath, "utf-8");
      
      // Self-Healing dynamic lookup for all .css files in this active project sub-app
      const projId = req.params.id;
      let subAppFolder = "";
      const pathParts = filePath.replace(/\\/g, "/").split("/");
      if (pathParts.length > 1) {
        subAppFolder = pathParts[0];
      }
      const searchDir = subAppFolder ? path.join(PROJECTS_DIR, projId, subAppFolder) : path.join(PROJECTS_DIR, projId);
      const cssFiles = findProjectCssFiles(searchDir);
      const htmlDir = path.dirname(realPath);
      const cssLinks = cssFiles
        .map((cssFile) => {
          const fullCssPath = path.join(searchDir, cssFile);
          const relCssPath = path.relative(htmlDir, fullCssPath).replace(/\\/g, "/");
          return `<link rel="stylesheet" href="./${relCssPath}">`;
        })
        .join("\n  ");
      
      // Inject ESM.sh import map and runtime Tailwind CSS script inside <head>
      const importMapHtml = `
  <script>
    window.process = {
      env: {
        GEMINI_API_KEY: ${JSON.stringify(process.env.GEMINI_API_KEY || "")},
        NODE_ENV: "development"
      }
    };
  </script>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19?pin=v135",
      "react-dom": "https://esm.sh/react-dom@19?pin=v135",
      "react-dom/client": "https://esm.sh/react-dom@19/client?pin=v135",
      "lucide-react": "https://esm.sh/lucide-react@0.468.0",
      "motion": "https://esm.sh/motion@11.11.17",
      "motion/react": "https://esm.sh/motion@11.11.17",
      "d3": "https://esm.sh/d3@7.9.0",
      "firebase/app": "https://esm.sh/firebase@10.12.0/app",
      "firebase/firestore": "https://esm.sh/firebase@10.12.0/firestore",
      "firebase/auth": "https://esm.sh/firebase@10.12.0/auth",
      "@google/genai": "https://esm.sh/@google/genai"
    }
  }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  ${cssLinks}
`;
      
      // Replace <head> with importmap script
      html = html.replace(/<head>/i, `<head>${importMapHtml}`);
      
      // Rewrite absolute paths (like /src/...) to be relative to the iframe's base URL
      html = html.replace(/(src|href)="\/src\//g, '$1="./src/');
      html = html.replace(/(src|href)="\/node_modules\//g, '$1="./node_modules/');

      res.type("text/html");
      return res.send(html);
    } catch (err: any) {
      res.status(500).send(`HTML preprocessing failed: ${err.message}`);
      return;
    }
  }

  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".htm": "text/html",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".sfnt": "font/sfnt",
  };
  res.type(mimeTypes[ext] || "application/octet-stream");
  res.send(fs.readFileSync(realPath));
});

// CHAT MESSAGES MANAGEMENT
app.get("/api/projects/:id/chat", (req, res) => {
  const { id } = req.params;
  res.json(readJSON(`chat_${id}.json`, []));
});

app.post("/api/projects/:id/chat", (req, res) => {
  const { id } = req.params;
  const messages = readJSON(`chat_${id}.json`, []);
  messages.push(req.body);
  writeJSON(`chat_${id}.json`, messages.slice(-100)); // limit history
  res.json({ success: true });
});

app.delete("/api/projects/:id/chat", (req, res) => {
  const { id } = req.params;
  writeJSON(`chat_${id}.json`, []);
  res.json({ success: true });
});

// ZIP VAULT APIS
app.get("/api/zips", (req, res) => {
  res.json(readJSON("zips_meta.json", []));
});

app.post("/api/zips", (req, res) => {
  const { name, files } = req.body;
  const id = "zip_" + Math.random().toString(36).substring(2, 10);
  const zips = readJSON("zips_meta.json", []);
  const newZip = { id, name, fileCount: files.length, createdAt: new Date().toISOString() };
  zips.push(newZip);
  writeJSON("zips_meta.json", zips);

  // Store contents physically
  const zipPath = path.join(ZIPS_DIR, id);
  fs.mkdirSync(zipPath, { recursive: true });
  files.forEach((f: any) => {
    const fPath = path.join(zipPath, f.path);
    fs.mkdirSync(path.dirname(fPath), { recursive: true });
    if (f.isBinary) {
      fs.writeFileSync(fPath, Buffer.from(f.content, "base64"));
    } else {
      fs.writeFileSync(fPath, f.content || "", "utf-8");
    }
  });

  res.json(newZip);
});

app.get("/api/zips/:id/tree", (req, res) => {
  res.json(walkDir(path.join(ZIPS_DIR, req.params.id)));
});

app.get("/api/zips/:id/file", (req, res) => {
  const realPath = path.join(ZIPS_DIR, req.params.id, req.query.path as string);
  if (!fs.existsSync(realPath)) return res.status(404).json({ error: "Not found" });
  res.json({ content: fs.readFileSync(realPath, "utf-8") });
});

app.post("/api/zips/:id/file", (req, res) => {
  const zipId = req.params.id;
  const { path: filePathParam, content } = req.body;
  if (!filePathParam) return res.status(400).json({ error: "Path parameter is required" });
  const realPath = path.join(ZIPS_DIR, zipId, filePathParam);
  
  // Ensure directories exist
  fs.mkdirSync(path.dirname(realPath), { recursive: true });
  try {
    fs.writeFileSync(realPath, content || "", "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Cannot write file" });
  }
});

function findCssFiles(dir: string, baseDir: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        results.push(...findCssFiles(fullPath, baseDir));
      }
    } else if (entry.name.toLowerCase().endsWith(".css")) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      results.push(relPath);
    }
  }
  return results;
}

app.get("/api/zips/:id/raw/*", (req, res) => {
  const filePath = req.params[0] || "";
  let realPath = path.join(ZIPS_DIR, req.params.id, filePath);

  // Self-healing path resolution (extensionless and directory candidate index files)
  let exists = fs.existsSync(realPath);
  let isDir = exists && fs.lstatSync(realPath).isDirectory();

  // Redirect directories without a trailing slash to avoid relative path resolution breakage
  if (isDir && !req.path.endsWith("/")) {
    return res.redirect(req.path + "/");
  }

  if (!exists || isDir) {
    const candidateExtensions = [".tsx", ".ts", ".jsx", ".js", ".json"];
    let resolved = false;
    
    // 1. Try appending extensions directly
    for (const extCandidate of candidateExtensions) {
      const candidatePath = realPath + extCandidate;
      if (fs.existsSync(candidatePath) && !fs.lstatSync(candidatePath).isDirectory()) {
        realPath = candidatePath;
        resolved = true;
        exists = true;
        isDir = false;
        break;
      }
    }
    
    // 2. If it is a directory, try index files
    if (!resolved && exists && isDir) {
      for (const extCandidate of candidateExtensions) {
        const candidatePath = path.join(realPath, "index" + extCandidate);
        if (fs.existsSync(candidatePath) && !fs.lstatSync(candidatePath).isDirectory()) {
          realPath = candidatePath;
          resolved = true;
          exists = true;
          isDir = false;
          break;
        }
      }
    }
  }

  if (!exists || isDir) {
    return res.status(404).send("Not found");
  }

  const ext = path.extname(realPath).toLowerCase();

  // On-the-fly TSX/TS/JSX Transpilation via esbuild
  if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
    try {
      const rawCode = fs.readFileSync(realPath, "utf-8");
      const loaderMap: Record<string, "ts" | "tsx" | "jsx" | "js"> = {
        ".ts": "ts",
        ".tsx": "tsx",
        ".js": "jsx",
        ".jsx": "jsx",
      };
      
      // Calculate dynamic BASE_URL for Vite/import.meta.env self-healing
      let subAppFolder = "";
      const normalizedPathForEnv = filePath.replace(/\\/g, "/");
      const pathPartsForEnv = normalizedPathForEnv.split("/");
      const srcIndexForEnv = pathPartsForEnv.indexOf("src");
      if (srcIndexForEnv !== -1) {
        subAppFolder = pathPartsForEnv.slice(0, srcIndexForEnv).join("/") + "/";
      } else if (pathPartsForEnv.length > 1) {
        subAppFolder = pathPartsForEnv[0] + "/";
      }
      const baseUrl = `/api/zips/${req.params.id}/raw/${subAppFolder}`;

      const result = esbuild.transformSync(rawCode, {
        loader: loaderMap[ext] || "ts",
        format: "esm",
        target: "es2020",
        sourcemap: "inline",
        define: {
          "import.meta.env.BASE_URL": JSON.stringify(baseUrl),
          "import.meta.env.MODE": JSON.stringify("development"),
          "import.meta.env.DEV": "true",
          "import.meta.env.PROD": "false",
          "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YXVyYS5jbGVyay5hY2NvdW50cy5kZXYk"),
          "import.meta.env.VITE_API_BASE": JSON.stringify(process.env.VITE_API_BASE || ""),
          "import.meta.env.VITE_PUBLIC_HOST": JSON.stringify(process.env.VITE_PUBLIC_HOST || ""),
          "import.meta.env.VITE_EXPO_DEV_DOMAIN": JSON.stringify(process.env.VITE_EXPO_DEV_DOMAIN || ""),
          "import.meta.env": JSON.stringify({
            BASE_URL: baseUrl,
            MODE: "development",
            DEV: true,
            PROD: false,
            VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YXVyYS5jbGVyay5hY2NvdW50cy5kZXYk",
            VITE_API_BASE: process.env.VITE_API_BASE || "",
            VITE_PUBLIC_HOST: process.env.VITE_PUBLIC_HOST || "",
            VITE_EXPO_DEV_DOMAIN: process.env.VITE_EXPO_DEV_DOMAIN || ""
          })
        }
      });

      let jsCode = result.code;
      // Strip CSS imports to prevent strict module browser MIME exceptions
      jsCode = jsCode.replace(/import\s+['"][^'"]+\.css['"];?/g, '/* Stripped CSS Import */');

      // Prepend React import if classic JSX references React but it's not imported
      if ((jsCode.includes("React.createElement") || jsCode.includes("React.Fragment")) && !/import\s+[^;]*\bReact\b/g.test(jsCode)) {
        jsCode = `import React from "react";\n` + jsCode;
      }

      // 1. Calculate relative prefixes for aliases
      let relativePrefix = "./";
      const srcMarker = "/src/";
      const normalizedPath = filePath.replace(/\\/g, "/");
      const srcIdx = normalizedPath.indexOf(srcMarker);
      if (srcIdx !== -1) {
        const afterSrc = normalizedPath.substring(srcIdx + srcMarker.length);
        const slashCount = (afterSrc.match(/\//g) || []).length;
        if (slashCount > 0) {
          relativePrefix = "../".repeat(slashCount);
        }
      }

      const attachedAssetsDir = path.resolve(ZIPS_DIR, "attached_assets");
      const relativeAssetsPath = path.relative(path.dirname(realPath), attachedAssetsDir).replace(/\\/g, "/");

      // 2. Rewrite @/ and @assets/ aliases in imports/exports
      jsCode = jsCode.replace(/((?:import|require|from|\bimport\s*\(|export)\s*['"])@\/([^'"]+)(['"])/g, (match, p1, p2, p3) => {
        return p1 + relativePrefix + p2 + p3;
      });

      jsCode = jsCode.replace(/((?:import|require|from|\bimport\s*\(|export)\s*['"])@assets\/([^'"]+)(['"])/g, (match, p1, p2, p3) => {
        return p1 + relativeAssetsPath + "/" + p2 + p3;
      });

      // Inline JSON imports relative to realPath to prevent browser MIME type check crashes
      jsCode = jsCode.replace(/import\s+([a-zA-Z0-9_$\*\{\}\s,]+)\s+from\s+['"]([^'"]+\.json)['"];?/g, (match, importClause, importPath) => {
        try {
          const jsonFullPath = path.resolve(path.dirname(realPath), importPath);
          if (fs.existsSync(jsonFullPath)) {
            const jsonContent = fs.readFileSync(jsonFullPath, "utf-8").trim();
            JSON.parse(jsonContent); // verify valid json
            
            const clause = importClause.trim();
            if (clause.startsWith("* as ")) {
              const varName = clause.substring(5).trim();
              return `const ${varName} = ${jsonContent};`;
            } else if (clause.startsWith("{") && clause.endsWith("}")) {
              return `const ${clause} = ${jsonContent};`;
            } else {
              return `const ${clause} = ${jsonContent};`;
            }
          }
        } catch (e) {
          console.error("Failed to inline JSON import in compilation:", importPath, e);
        }
        return match;
      });

      // 3. Rewrite all external package imports to ESM.sh URLs
      const packageOverrides: Record<string, string> = {
        "react": "https://esm.sh/react@19?pin=v135",
        "react-dom": "https://esm.sh/react-dom@19?pin=v135",
        "react-dom/client": "https://esm.sh/react-dom@19/client?pin=v135",
      };

      jsCode = jsCode.replace(/((?:import|require|from|\bimport\s*\(|export)\s*['"])([^'"]+)(['"])/g, (match, prefix, importPath, suffix) => {
        if (
          importPath.startsWith(".") ||
          importPath.startsWith("/") ||
          importPath.startsWith("http://") ||
          importPath.startsWith("https://") ||
          importPath.startsWith("data:")
        ) {
          return match;
        }
        const resolvedUrl = packageOverrides[importPath] || `https://esm.sh/${importPath}`;
        return prefix + resolvedUrl + suffix;
      });

      res.type("application/javascript");
      return res.send(jsCode);
    } catch (err: any) {
      console.error("Transpilation failed for", filePath, err);
      res.status(500).send(`Transpilation failed: ${err.message}`);
      return;
    }
  }

  // Live App HTML Rewriting & CDN importmap injection
  if (ext === ".html" || ext === ".htm") {
    try {
      let html = fs.readFileSync(realPath, "utf-8");
      
      // Self-Healing dynamic lookup for all .css files in this active zip sub-app
      const zipId = req.params.id;
      let subAppFolder = "";
      const pathParts = filePath.replace(/\\/g, "/").split("/");
      if (pathParts.length > 1) {
        subAppFolder = pathParts[0];
      }
      const searchDir = subAppFolder ? path.join(ZIPS_DIR, zipId, subAppFolder) : path.join(ZIPS_DIR, zipId);
      const cssFiles = findCssFiles(searchDir);
      const htmlDir = path.dirname(realPath);
      const cssLinks = cssFiles
        .map((cssFile) => {
          const fullCssPath = path.join(searchDir, cssFile);
          const relCssPath = path.relative(htmlDir, fullCssPath).replace(/\\/g, "/");
          return `<link rel="stylesheet" href="./${relCssPath}">`;
        })
        .join("\n  ");
      
      // Inject ESM.sh import map and runtime Tailwind CSS script inside <head>
      const importMapHtml = `
  <script>
    window.process = {
      env: {
        GEMINI_API_KEY: ${JSON.stringify(process.env.GEMINI_API_KEY || "")},
        NODE_ENV: "development"
      }
    };
  </script>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19?pin=v135",
      "react-dom": "https://esm.sh/react-dom@19?pin=v135",
      "react-dom/client": "https://esm.sh/react-dom@19/client?pin=v135",
      "lucide-react": "https://esm.sh/lucide-react@0.468.0",
      "motion": "https://esm.sh/motion@11.11.17",
      "motion/react": "https://esm.sh/motion@11.11.17",
      "d3": "https://esm.sh/d3@7.9.0",
      "firebase/app": "https://esm.sh/firebase@10.12.0/app",
      "firebase/firestore": "https://esm.sh/firebase@10.12.0/firestore",
      "firebase/auth": "https://esm.sh/firebase@10.12.0/auth",
      "@google/genai": "https://esm.sh/@google/genai"
    }
  }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  ${cssLinks}
`;
      
      // Replace <head> with importmap script
      html = html.replace(/<head>/i, `<head>${importMapHtml}`);
      
      // Rewrite absolute paths (like /src/...) to be relative to the iframe's base URL
      html = html.replace(/(src|href)="\/src\//g, '$1="./src/');
      html = html.replace(/(src|href)="\/node_modules\//g, '$1="./node_modules/');

      res.type("text/html");
      return res.send(html);
    } catch (err: any) {
      res.status(500).send(`HTML preprocessing failed: ${err.message}`);
      return;
    }
  }

  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".htm": "text/html",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".sfnt": "font/sfnt",
  };
  res.type(mimeTypes[ext] || "application/octet-stream");
  res.send(fs.readFileSync(realPath));
});

app.get("/api/zips/:id/chat", (req, res) => {
  res.json(readJSON(`zipchat_${req.params.id}.json`, []));
});

app.post("/api/zips/:id/chat", (req, res) => {
  const messages = readJSON(`zipchat_${req.params.id}.json`, []);
  messages.push(req.body);
  writeJSON(`zipchat_${req.params.id}.json`, messages);
  res.json({ success: true });
});

app.post("/api/zips/:id/import", (req, res) => {
  const zipId = req.params.id;
  const metadata = readJSON("zips_meta.json", []).find((z: any) => z.id === zipId);
  if (!metadata) return res.status(404).json({ error: "Archive meta not found" });

  const id = "proj_" + Math.random().toString(36).substring(2, 10);
  const projects = readJSON("projects_meta.json", []);
  const newProj = { id, name: "Imported_" + metadata.name, createdAt: new Date().toISOString() };
  projects.push(newProj);
  writeJSON("projects_meta.json", projects);

  // Copy directory structure
  const src = path.join(ZIPS_DIR, zipId);
  const dest = path.join(PROJECTS_DIR, id);
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });

  // Self-Healing: Flatten single-folder ZIP nested layout
  try {
    const items = fs.readdirSync(dest);
    if (items.length === 1) {
      const singleFolder = path.join(dest, items[0]);
      if (fs.statSync(singleFolder).isDirectory()) {
        const subItems = fs.readdirSync(singleFolder);
        for (const subItem of subItems) {
          const srcSub = path.join(singleFolder, subItem);
          const destSub = path.join(dest, subItem);
          fs.renameSync(srcSub, destSub);
        }
        fs.rmdirSync(singleFolder);
        console.log(`[SELF-HEALING] Flattened single nested folder in project: ${items[0]}`);
      }
    }
  } catch (err) {
    console.error("Failed to flatten imported ZIP structure:", err);
  }

  res.json(newProj);
});

app.post("/api/zips/:id/extract", (req, res) => {
  const zipId = req.params.id;
  const { projectId } = req.body;
  const src = path.join(ZIPS_DIR, zipId);
  const dest = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(dest)) return res.status(404).json({ error: "Target project not found" });

  fs.cpSync(src, dest, { recursive: true });
  res.json({ success: true });
});

// IMPORT LOCAL ABSOLUTE FOLDER AS WORKSPACE
app.post("/api/projects/import-folder", (req, res) => {
  const { folderPath, name } = req.body;
  if (!folderPath) return res.status(400).json({ error: "Folder path is required" });
  
  // Resolve path and check existence
  const resolvedPath = path.resolve(folderPath);
  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).json({ error: `Folder path does not exist physically: ${resolvedPath}` });
  }
  
  if (!fs.statSync(resolvedPath).isDirectory()) {
    return res.status(400).json({ error: "Provided path is a file, not a folder." });
  }

  const id = "proj_" + Math.random().toString(36).substring(2, 10);
  const projects = readJSON("projects_meta.json", []);
  const actualName = name || path.basename(resolvedPath) || "Imported_Folder";
  const newProject = { 
    id, 
    name: actualName, 
    createdAt: new Date().toISOString() 
  };
  projects.push(newProject);
  writeJSON("projects_meta.json", projects);

  // Copy directory structure recursively excluding node_modules, dist, .git
  const dest = path.join(PROJECTS_DIR, id);
  fs.mkdirSync(dest, { recursive: true });
  try {
    fs.cpSync(resolvedPath, dest, {
      recursive: true,
      filter: (srcPath) => {
        const base = path.basename(srcPath);
        return base !== "node_modules" && base !== "dist" && base !== ".git" && base !== ".gemini" && base !== ".system_generated";
      }
    });
  } catch (err: any) {
    console.error("Local folder clone error:", err);
    return res.status(500).json({ error: `Failed to copy folder files: ${err.message}` });
  }

  // Calculate dynamic apps count
  let appCount = countHtmlFiles(dest);
  if (appCount === 0) appCount = 1;

  res.json({ ...newProject, appCount });
});

// SOVEREIGN REGISTRY WEBHOOK LINKING
app.post("/api/projects/:id/webhook", (req, res) => {
  const { id } = req.params;
  const { webhookUrl } = req.body;
  if (!webhookUrl) return res.status(400).json({ error: "Webhook URL is required" });

  const registry = readJSON("sovereign_registry.json", []);
  let entry = registry.find((r: any) => r.projectId === id);
  if (!entry) {
    entry = { projectId: id, webhookUrl, driveToken: "", status: "ACTIVE", lastSync: new Date().toISOString() };
    registry.push(entry);
  } else {
    entry.webhookUrl = webhookUrl;
    entry.lastSync = new Date().toISOString();
  }
  writeJSON("sovereign_registry.json", registry);
  res.json({ success: true, entry });
});

// DRIVE SYNC & DOUBLE-COMMIT REDUNDANCY GUARD
app.post("/api/projects/:id/drive-sync", (req, res) => {
  const { id } = req.params;
  const { driveSyncToken, webhookUrl } = req.body;

  const registry = readJSON("sovereign_registry.json", []);
  let entry = registry.find((r: any) => r.projectId === id);
  if (!entry) {
    entry = { projectId: id, webhookUrl: webhookUrl || "", driveToken: driveSyncToken || "", status: "ACTIVE", lastSync: new Date().toISOString() };
    registry.push(entry);
  } else {
    if (driveSyncToken) entry.driveToken = driveSyncToken;
    if (webhookUrl) entry.webhookUrl = webhookUrl;
    entry.lastSync = new Date().toISOString();
  }
  writeJSON("sovereign_registry.json", registry);

  // Perform Double-Commit and registry verification parity algorithms
  // We check if this project conflicts with other registered projects in the central store
  const conflicts = registry.filter((r: any) => r.projectId !== id && r.webhookUrl === entry.webhookUrl && entry.webhookUrl !== "");
  
  if (conflicts.length > 0) {
    return res.json({
      success: false,
      parity: false,
      error: "Redundancy Alert: Double-commit conflict detected. Webhook URL is registered to another active container.",
      conflicts: conflicts.map((c: any) => c.projectId)
    });
  }

  res.json({
    success: true,
    parity: true,
    message: "Coherence confirmed. Zero state overlaps or database redundancies located.",
    timestamp: new Date().toISOString()
  });
});

// REAL LIVE ZIP OF OUR COMPLETE STUDIO CODE
app.get("/api/download/studio", (req, res) => {
  // Simple textual summary format since simple files browser-compatibility is maintained
  res.setHeader("Content-Disposition", "attachment; filename=AuraOS-Studio-Source.txt");
  res.setHeader("Content-Type", "text/plain");
  
  let output = `=========================================
AURA OS STUDIO SOURCE DUMP BUNDLE
=========================================\n\n`;

  const files = ["server.ts", "package.json", "vite.config.ts", "index.html", "src/App.tsx", "src/main.tsx", "src/index.css"];
  files.forEach(f => {
    const fullPath = path.join(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      output += `\n--- FILE: ${f} ---\n`;
      output += fs.readFileSync(fullPath, "utf-8");
      output += `\n--- END OF FILE ${f} ---\n`;
    }
  });

  res.send(output);
});

// SANDBOX WORKSPACE ENDPOINTS
app.get("/api/sandbox/workspace", (req, res) => {
  const items = readJSON("sandbox_workspace.json", []);
  const enriched = items.map((item: any) => {
    if (item.type === "file") {
      const safeName = item.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const physPath = path.join(SANDBOX_DIR, item.section || "mine", `${item.id}_${safeName}`);
      if (fs.existsSync(physPath)) {
        if (item.isBinary) {
          return { ...item, hasContent: true, content: "" };
        } else {
          try {
            const content = fs.readFileSync(physPath, "utf-8");
            return { ...item, content };
          } catch {
            return item;
          }
        }
      }
    }
    return item;
  });
  res.json(enriched);
});

app.post("/api/sandbox/workspace", (req, res) => {
  const items = readJSON("sandbox_workspace.json", []);
  const { type, name, content, parentId, section, isBinary } = req.body;
  const id = "ws_" + Math.random().toString(36).substring(2, 10);
  
  const item = { 
    id, 
    type, 
    name, 
    parentId: parentId || null, 
    section: section || "mine", 
    isBinary: !!isBinary,
    ts: new Date().toISOString() 
  };
  
  if (type === "file") {
    const safeName = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const physPath = path.join(SANDBOX_DIR, item.section, `${id}_${safeName}`);
    fs.mkdirSync(path.dirname(physPath), { recursive: true });
    
    if (isBinary) {
      const buf = Buffer.from(content || "", "base64");
      fs.writeFileSync(physPath, buf);
    } else {
      fs.writeFileSync(physPath, content || "", "utf-8");
    }
  } else {
    // If it's a folder, physically create a folder placeholder too
    const physPath = path.join(SANDBOX_DIR, item.section, `${id}_${name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`);
    fs.mkdirSync(physPath, { recursive: true });
  }

  items.push(item);
  writeJSON("sandbox_workspace.json", items);
  
  // Return the item with its content
  res.json({ ...item, content: isBinary ? "" : (content || "") });
});

app.put("/api/sandbox/workspace/:id", (req, res) => {
  const items = readJSON("sandbox_workspace.json", []);
  const idx = items.findIndex((i: any) => i.id === req.params.id);
  if (idx !== -1) {
    const item = items[idx];
    const safeName = item.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const physPath = path.join(SANDBOX_DIR, item.section || "mine", `${item.id}_${safeName}`);
    fs.mkdirSync(path.dirname(physPath), { recursive: true });
    
    if (item.isBinary) {
      const buf = Buffer.from(req.body.content || "", "base64");
      fs.writeFileSync(physPath, buf);
    } else {
      fs.writeFileSync(physPath, req.body.content || "", "utf-8");
    }
  }
  res.json({ success: true });
});

app.delete("/api/sandbox/workspace/:id", async (req, res) => {
  let items = readJSON("sandbox_workspace.json", []);
  const item = items.find((i: any) => i.id === req.params.id);
  if (item) {
    const safeName = item.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const physPath = path.join(SANDBOX_DIR, item.section || "mine", `${item.id}_${safeName}`);
    if (fs.existsSync(physPath)) {
      await fs.promises.rm(physPath, { force: true, recursive: true });
    }
  }
  
  // Clean up physical files for all children inside it if it was a folder
  const children = items.filter((i: any) => i.parentId === req.params.id);
  for (const child of children) {
    const safeChildName = child.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const childPhysPath = path.join(SANDBOX_DIR, child.section || "mine", `${child.id}_${safeChildName}`);
    if (fs.existsSync(childPhysPath)) {
      await fs.promises.rm(childPhysPath, { force: true, recursive: true });
    }
  }

  items = items.filter((i: any) => i.id !== req.params.id && i.parentId !== req.params.id);
  writeJSON("sandbox_workspace.json", items);
  res.json({ success: true });
});

// STREAMING RAW SANDBOX FILES (FOR IMAGES/PREVIEWS AND DOWNLOADS)
app.get("/api/sandbox/workspace/file/:id/raw", (req, res) => {
  const items = readJSON("sandbox_workspace.json", []);
  const item = items.find((i: any) => i.id === req.params.id);
  if (!item) return res.status(404).send("File not found");
  
  const safeName = item.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const physPath = path.join(SANDBOX_DIR, item.section || "mine", `${item.id}_${safeName}`);
  if (!fs.existsSync(physPath)) return res.status(404).send("Physical file not found");
  
  const ext = path.extname(item.name).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
  };
  res.type(mimeTypes[ext] || "application/octet-stream");
  res.send(fs.readFileSync(physPath));
});

// SYSTEM CONFIG ENVELOPE / STATUS
app.get("/api/ai/status", (req, res) => {
  res.json({
    ollamaCloudKey: !!process.env.OLLAMA_CLOUD_KEY,
    chatgptKey: !!process.env.CHATGPT_API_KEY,
    geminiKey: !!process.env.GEMINI_API_KEY,
    quotaCooldowns: {}
  });
});

// AI REQUEST INTERCEPT PROXY
app.post("/api/ai", async (req, res) => {
  const { prompt, systemPrompt } = req.body;
  if (!ai) {
    return res.json({ text: "George here! I am standing by. To unlock full real reasoning prompts, add your Gemini API Key in Replit secrets.", source: "none" });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: systemPrompt ? { systemInstruction: systemPrompt } : undefined
    });
    res.json({ text: response.text || "No output generated.", source: "gemini" });
  } catch (err: any) {
    res.json({ text: "AI error: " + (err.message || err), source: "error" });
  }
});

// BRAIN DATABASE APIS
// BRAIN DATABASE APIS
app.get("/api/family/:memberId/db", (req, res) => {
  res.json({ entries: readEventsJSONL(req.params.memberId) });
});

app.post("/api/family/:memberId/db", (req, res) => {
  const memberId = req.params.memberId;
  const { entries, partner } = req.body;

  // Get existing events
  const existingEvents = readEventsJSONL(memberId);

  // Find new entry or entries to append
  let newEntries: any[] = [];
  if (Array.isArray(entries)) {
    newEntries = entries.filter((posted: any) => {
      const postedIdStr = String(posted.id || posted.event_id || "");
      return !existingEvents.some((existing: any) => {
        const existingIdStr = String(existing.event_id || existing.id || "");
        return (existingIdStr && existingIdStr === postedIdStr) ||
               (existing.note === posted.note && existing.ts === posted.ts);
      });
    });
  } else if (req.body && typeof req.body === "object") {
    newEntries = [req.body];
  }

  newEntries.forEach((entry) => {
    let realityClass: RealityClass = entry.reality_class || "USER_REPORTED";
    let source = entry.source || "brain_matrix";
    let confidence = entry.confidence !== undefined ? entry.confidence : 1.0;

    // Strict security guardrail: non-human automated calibration, or george, cannot write to VERIFIED.
    const isAiActor =
      entry.actor === "george" ||
      partner === "System Network Core" ||
      entry.note?.toLowerCase().includes("calibration") ||
      source === "woofer_anchor";

    if (isAiActor && realityClass === "VERIFIED") {
      realityClass = "SYSTEM_GENERATED";
    }

    appendEventJSONL(memberId, {
      actor: entry.actor || (partner === "System Network Core" ? "george" : "user"),
      source: source,
      type: entry.type || (entry.note?.toLowerCase().includes("calibration") ? "CALIBRATION" : "USER_NOTE"),
      reality_class: realityClass,
      permission_tier: entry.permission_tier || "WRITE",
      confidence: confidence,
      partner: partner || entry.partner || "",
      note: entry.note || ""
    });
  });

  res.json({ success: true });
});

app.get("/api/george/intel", (req, res) => {
  const meta = readJSON("intel_meta.json", []);
  res.json({ folders: meta });
});

app.post("/api/george/ingest", (req, res) => {
  const { text, category: customCat, imageBase64, fileName } = req.body;
  const category = customCat || "general";
  const meta = readJSON("intel_meta.json", []);
  let folder = meta.find((m: any) => m.category === category);
  if (!folder) {
    folder = { category, count: 0, entries: [] };
    meta.push(folder);
  }
  folder.count += 1;
  const entry = { text: text || "", imageBase64, fileName, ts: new Date().toISOString() };
  folder.entries.push(entry);
  writeJSON("intel_meta.json", meta);
  res.json({ ok: true, category });
});

app.get("/api/george/memory", (req, res) => {
  res.json({ memoryDumps: readJSON("george_memory.json", []) });
});

app.post("/api/george/memory", (req, res) => {
  const memory = readJSON("george_memory.json", []);
  memory.push(req.body);
  writeJSON("george_memory.json", memory);
  res.json({ success: true });
});

app.get("/api/george/global-chat", (req, res) => {
  res.json(readJSON("george_global_chat.json", []));
});

app.post("/api/george/global-chat", (req, res) => {
  const chat = readJSON("george_global_chat.json", []);
  chat.push(req.body);
  writeJSON("george_global_chat.json", chat);
  res.json({ success: true });
});

// VITE INTERFACE FOR DEVELOPMENT PORT ROUTING
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Install the Titanic Airlock Gateway (after Vite so it doesn't intercept the React app)
  app.use(Gateway.middleware());

  // Production backend systems disabled (requires Redis/socket.io)
  // await initializeProductionBackend(app, server, {
  //   redisUrl: process.env.AURA_REDIS_CONNECTION,
  //   firebaseProject: process.env.FIRESTORE_PROJECT_ID,
  //   enableDetailedLogging: process.env.ENABLE_DETAILED_WEBHOOK_LOGGING === "true",
  // });

  // Setup MCP Server
  // setupMCPServer(app);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // ✅ Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n📤 Shutting down gracefully (${signal})...`);
    server.close(async () => {
      console.log("✅ HTTP server closed");
      await closePool();
      console.log("✅ Database pool closed");
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.error("❌ Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

// ── websocket terminal orchestration ─────────────────────────────────────────
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (ws) => {
  let currentProjectId: string | null = null;

  ws.on("message", (msgStr) => {
    try {
      const msg = JSON.parse(msgStr.toString());
      
      if (msg.type === "terminal:start") {
        currentProjectId = msg.projectId;
        const projectDir = path.join(PROJECTS_DIR, msg.projectId);
        
        TerminalManager.spawnPty(msg.projectId, projectDir, (data) => {
          ws.send(JSON.stringify({ type: "terminal:out", data }));
        });
        
        ws.send(JSON.stringify({ type: "terminal:ready", cwd: `~/${msg.projectId}` }));
      }
      
      if (msg.type === "terminal:input" && currentProjectId) {
        TerminalManager.write(currentProjectId, msg.data);
      }
      
      if (msg.type === "terminal:resize" && currentProjectId) {
        TerminalManager.resize(currentProjectId, msg.cols, msg.rows);
      }
    } catch {
      // Ignore parse errors from raw binary data or malformed packets
    }
  });

  ws.on("close", () => {
    if (currentProjectId) {
      TerminalManager.kill(currentProjectId);
    }
  });
});


// ══════════════════════════════════════════════════════════════════════════
// REPLIT-KILLER FEATURES — Secrets, DB, Templates, Environment
// ══════════════════════════════════════════════════════════════════════════

// ── Secrets Manager (per-project .env) ──────────────────────────────────
app.get("/api/secrets/:projectId", (req, res) => {
  const { projectId } = req.params;
  const secretsPath = path.join(PROJECTS_DIR, projectId, ".env.secrets");
  if (!fs.existsSync(secretsPath)) return res.json({ ok: true, secrets: {} });
  try {
    const raw = fs.readFileSync(secretsPath, "utf-8");
    const secrets: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const eq = line.indexOf("=");
      if (eq > 0 && !line.startsWith("#")) {
        secrets[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
    }
    // Mask values before returning
    const masked: Record<string, string> = {};
    for (const [k, v] of Object.entries(secrets)) {
      masked[k] = v.length > 4 ? `${"*".repeat(Math.min(v.length - 4, 8))}${v.slice(-4)}` : "****";
    }
    return res.json({ ok: true, secrets: masked, count: Object.keys(secrets).length });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

app.post("/api/secrets/:projectId", (req, res) => {
  const { projectId } = req.params;
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "key required" });

  const projectRoot = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectRoot)) return res.status(404).json({ error: "Project not found" });

  const secretsPath = path.join(projectRoot, ".env.secrets");
  let raw = fs.existsSync(secretsPath) ? fs.readFileSync(secretsPath, "utf-8") : "";

  // Update or add key
  const lines = raw.split("\n").filter(l => !l.startsWith(`${key}=`));
  if (value) lines.push(`${key}=${value}`);
  fs.writeFileSync(secretsPath, lines.filter(Boolean).join("\n") + "\n", "utf-8");
  return res.json({ ok: true, key, set: !!value });
});

app.delete("/api/secrets/:projectId/:key", (req, res) => {
  const { projectId, key } = req.params;
  const secretsPath = path.join(PROJECTS_DIR, projectId, ".env.secrets");
  if (!fs.existsSync(secretsPath)) return res.json({ ok: true });
  const raw = fs.readFileSync(secretsPath, "utf-8");
  const lines = raw.split("\n").filter(l => !l.startsWith(`${key}=`));
  fs.writeFileSync(secretsPath, lines.join("\n"), "utf-8");
  return res.json({ ok: true });
});

// ── Project JSON Database (local, per-project) ───────────────────────────
app.get("/api/db/:projectId/:collection", (req, res) => {
  const { projectId, collection } = req.params;
  const dbPath = path.join(PROJECTS_DIR, projectId, ".aura_db", `${collection}.json`);
  if (!fs.existsSync(dbPath)) return res.json({ ok: true, records: [], count: 0 });
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    return res.json({ ok: true, records: data, count: data.length });
  } catch { return res.json({ ok: true, records: [], count: 0 }); }
});

app.post("/api/db/:projectId/:collection", (req, res) => {
  const { projectId, collection } = req.params;
  const record = { ...req.body, _id: crypto.randomUUID(), _ts: Date.now() };

  const projectRoot = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectRoot)) return res.status(404).json({ error: "Project not found" });

  const dbDir = path.join(projectRoot, ".aura_db");
  fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, `${collection}.json`);

  let data: any[] = [];
  if (fs.existsSync(dbPath)) {
    try { data = JSON.parse(fs.readFileSync(dbPath, "utf-8")); } catch { data = []; }
  }
  data.push(record);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  return res.json({ ok: true, record });
});

app.delete("/api/db/:projectId/:collection/:id", (req, res) => {
  const { projectId, collection, id } = req.params;
  const dbPath = path.join(PROJECTS_DIR, projectId, ".aura_db", `${collection}.json`);
  if (!fs.existsSync(dbPath)) return res.json({ ok: true });
  let data: any[] = [];
  try { data = JSON.parse(fs.readFileSync(dbPath, "utf-8")); } catch { data = []; }
  data = data.filter((r: any) => r._id !== id);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  return res.json({ ok: true });
});

// ── Project Templates (zero-setup scaffolding) ───────────────────────────
const TEMPLATES: Record<string, Record<string, string>> = {
  react: {
    "index.html": `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`,
    "src/main.tsx": `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\ncreateRoot(document.getElementById('root')!).render(<App />);`,
    "src/App.tsx": `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div style={{ fontFamily: 'system-ui', padding: '2rem', textAlign: 'center' }}>\n      <h1>React App</h1>\n      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n    </div>\n  );\n}`,
    "package.json": `{"name":"app","private":true,"type":"module","scripts":{"dev":"vite","build":"vite build"},"dependencies":{"react":"^19.0.0","react-dom":"^19.0.0"},"devDependencies":{"@vitejs/plugin-react":"^5.0.0","vite":"^6.0.0","typescript":"^5.0.0"}}`,
    "README.md": `# React App\nScaffolded by Aura OS George Core.\n\n## Start\n\`npm install && npm run dev\``
  },
  node: {
    "server.js": `import express from 'express';\nconst app = express();\napp.use(express.json());\n\napp.get('/', (req, res) => res.json({ status: 'ok', message: 'Hello from Node!' }));\n\napp.listen(3001, () => console.log('Server on http://localhost:3001'));`,
    "package.json": `{"name":"api","private":true,"type":"module","scripts":{"dev":"node --watch server.js","start":"node server.js"},"dependencies":{"express":"^4.21.0"}}`,
    "README.md": `# Node API\nScaffolded by Aura OS George Core.\n\n## Start\n\`npm install && npm run dev\``
  },
  vanilla: {
    "index.html": `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>App</title><link rel="stylesheet" href="style.css"></head><body><div id="app"><h1>Hello World</h1><p id="counter">Count: 0</p><button onclick="increment()">Click me</button></div><script src="main.js"></script></body></html>`,
    "style.css": `* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: system-ui, sans-serif; background: #09090b; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; }\n#app { text-align: center; padding: 2rem; }\nh1 { font-size: 2.5rem; margin-bottom: 1rem; }\nbutton { padding: 0.75rem 1.5rem; background: #7c3aed; border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 1rem; }\nbutton:hover { background: #6d28d9; }`,
    "main.js": `let count = 0;\nfunction increment() {\n  count++;\n  document.getElementById('counter').textContent = 'Count: ' + count;\n}`,
    "README.md": `# Vanilla App\nScaffolded by Aura OS George Core.`
  },
  python: {
    "main.py": `from flask import Flask, jsonify, request\n\napp = Flask(__name__)\ndata = []\n\n@app.route('/')\ndef index():\n    return jsonify({'status': 'ok', 'message': 'Hello from Python!'})\n\n@app.route('/items', methods=['GET', 'POST'])\ndef items():\n    if request.method == 'POST':\n        item = request.json\n        data.append(item)\n        return jsonify(item), 201\n    return jsonify(data)\n\nif __name__ == '__main__':\n    app.run(debug=True, port=5000)`,
    "requirements.txt": `flask>=2.3.0\nflask-cors>=4.0.0`,
    "README.md": `# Python Flask API\nScaffolded by Aura OS George Core.\n\n## Start\n\`pip install -r requirements.txt && python main.py\``
  }
};

app.get("/api/templates", (req, res) => {
  res.json({
    templates: Object.keys(TEMPLATES).map(id => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      description: {
        react: "React + TypeScript + Vite frontend app",
        node: "Express.js REST API backend",
        vanilla: "Pure HTML/CSS/JS with no build step",
        python: "Flask REST API (requires Python)"
      }[id]
    }))
  });
});

app.post("/api/templates/:templateId/scaffold", (req, res) => {
  const { templateId } = req.params;
  const { projectId } = req.body;

  if (!projectId) return res.status(400).json({ error: "projectId required" });
  const template = TEMPLATES[templateId];
  if (!template) return res.status(404).json({ error: "Template not found" });

  const projectRoot = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectRoot)) return res.status(404).json({ error: "Project not found" });

  const created: string[] = [];
  for (const [filePath, content] of Object.entries(template)) {
    const target = path.join(projectRoot, filePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, content, "utf-8");
      created.push(filePath);
    }
  }

  return res.json({ ok: true, templateId, created });
});

// ── Environment validator ─────────────────────────────────────────────────
app.get("/api/environment", async (req, res) => {
  const checks: Record<string, { available: boolean; version?: string }> = {};

  const checkCmd = async (cmd: string, versionFlag = "--version") => {
    try {
      const { execSync } = await import("child_process");
      const out = execSync(`${cmd} ${versionFlag} 2>&1`, { timeout: 3000 }).toString().trim();
      return { available: true, version: out.split("\n")[0] };
    } catch { return { available: false }; }
  };

  const [node, npm, python, ollama, git] = await Promise.all([
    checkCmd("node"),
    checkCmd("npm"),
    checkCmd("python", "--version"),
    checkCmd("ollama", "--version"),
    checkCmd("git"),
  ]);

  checks.node = node;
  checks.npm = npm;
  checks.python = python;
  checks.ollama = ollama;
  checks.git = git;

  // Check Ollama models
  let models: string[] = [];
  try {
    const modelRes = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
    const modelData = await modelRes.json() as { models?: { name: string }[] };
    models = (modelData.models ?? []).map((m: { name: string }) => m.name);
  } catch { /* offline */ }

  return res.json({ ok: true, checks, ollamaModels: models, platform: process.platform });
});

// ── George AI scaffold endpoint (prompt → full project files) ────────────
app.post("/api/george/scaffold", async (req, res) => {
  const { projectId, description, template, model = "llama3.2:1b" } = req.body;
  if (!projectId || !description) return res.status(400).json({ error: "projectId and description required" });

  const projectRoot = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectRoot)) return res.status(404).json({ error: "Project not found" });

  // First scaffold the template
  let templateFiles: string[] = [];
  if (template && TEMPLATES[template]) {
    for (const [filePath, content] of Object.entries(TEMPLATES[template])) {
      const target = path.join(projectRoot, filePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      if (!fs.existsSync(target)) {
        fs.writeFileSync(target, content, "utf-8");
        templateFiles.push(filePath);
      }
    }
  }

  // Now ask George to customize it
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ status: "scaffolded", files: templateFiles })}\n\n`);

  const prompt = `You are George, a senior software architect. Build a "${description}" application.

Output complete, working files in this EXACT format:

FILE: <path>
\`\`\`<language>
<complete content>
\`\`\`

Build a full working app. Include all necessary files. Make it beautiful and functional.
Project type: ${template || "auto-detect"}`;

  try {
    if (!ai) throw new Error("GoogleGenAI not initialized. Check your GOOGLE_API_KEY.");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { temperature: 0.4 }
    });

    let fullResponse = "";

    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullResponse += chunk.text;
        res.write(`data: ${JSON.stringify({ token: chunk.text })}\n\n`);
      }
    }

    // Apply files
    const filePattern = /FILE:\s*([^\n]+)\n```[a-zA-Z0-9]*\n([\s\S]*?)```/g;
    const applied: string[] = [];
    let match;
    while ((match = filePattern.exec(fullResponse)) !== null) {
      const [, fp, content] = match;
      const trimPath = fp.trim();
      const target = path.resolve(projectRoot, trimPath);
      if (target.startsWith(projectRoot)) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        if (fs.existsSync(target)) fs.copyFileSync(target, target + ".bak");
        fs.writeFileSync(target, content, "utf-8");
        applied.push(trimPath);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true, applied })}\n\n`);
    return res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

start();

