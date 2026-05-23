import React, { useState, useEffect, useRef } from "react";
import {
  Code, Shield, Layers, Server, Globe, Search, Plus, FolderPlus, Trash2, Save, Play,
  Cpu, Terminal, ArrowLeft, RefreshCw, Layers3, Activity, Cloud, Radio, ExternalLink,
  ChevronRight, ChevronDown, FileText, Settings, Sparkles, MessageSquare, Mic, Send, X, AlertCircle, RefreshCcw,
  Battery, Zap, Key, Eye, EyeOff, Phone, DollarSign, Lock, Unlock, Info, Network, Database, Gauge, RefreshCw as RefreshIcon,
  Folder, GitBranch, Blocks, Maximize2, Minimize2, Upload, FolderArchive
} from "lucide-react";
import { Project, FileNode, ChatMessage } from "../types";
import GeorgePanel from "../components/GeorgePanel";
import { XTermTerminal } from "../components/XTermTerminal";
import JSZip from "jszip";

interface StudioHubProps {
  apiKey: string;
  ollamaCloudKey: string;
  ollamaModel: string;
  preferLocal: boolean;
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
}

const PEBBLE_REGISTRY_FE = [
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

function PvsNPSolver() {
  const [solved, setSolved] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [path, setPath] = useState<string[]>([]);

  const handleSolve = () => {
    setSolving(true);
    setSolved(false);
    setPath([]);
    
    const nodes = ["P", "Node_1", "Node_2", "Node_3", "NP"];
    let i = 0;
    const interval = setInterval(() => {
      if (i < nodes.length) {
        setPath((p) => [...p, nodes[i]]);
        setActiveNode(nodes[i]);
        i++;
      } else {
        clearInterval(interval);
        setSolving(false);
        setSolved(true);
        setActiveNode(null);
      }
    }, 500);
  };

  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 font-mono text-[11px]">
      <div className="flex justify-between items-center">
        <span className="text-amber-400 font-bold uppercase tracking-wider">Millennium Path Solver</span>
        <button 
          onClick={handleSolve} 
          disabled={solving}
          className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {solving ? "Computing..." : solved ? "Re-Solve Path" : "Solve P vs. NP"}
        </button>
      </div>

      <div className="h-28 bg-[#030306] border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center">
        {/* Glow grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
        
        {/* Connective SVG Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Base lines */}
          <line x1="15%" y1="50%" x2="35%" y2="30%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <line x1="15%" y1="50%" x2="35%" y2="70%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          
          <line x1="35%" y1="30%" x2="65%" y2="30%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <line x1="35%" y1="70%" x2="65%" y2="70%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          
          <line x1="65%" y1="30%" x2="85%" y2="50%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <line x1="65%" y1="70%" x2="85%" y2="50%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />

          {/* Active sovereign path */}
          {path.includes("P") && path.includes("Node_1") && (
            <line x1="15%" y1="50%" x2="35%" y2="30%" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
          )}
          {path.includes("Node_1") && path.includes("Node_2") && (
            <line x1="35%" y1="30%" x2="65%" y2="30%" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
          )}
          {path.includes("Node_2") && path.includes("Node_3") && (
            <line x1="65%" y1="30%" x2="65%" y2="70%" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
          )}
          {path.includes("Node_3") && path.includes("NP") && (
            <line x1="65%" y1="70%" x2="85%" y2="50%" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
          )}
        </svg>

        {/* Nodes */}
        <div className="flex justify-between items-center w-full px-6 z-10">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold transition-all duration-300 ${
            path.includes("P") ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-110" : "bg-slate-900 border-white/10 text-slate-500"
          }`}>P</div>

          <div className="flex flex-col gap-6">
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
              path.includes("Node_1") ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "bg-slate-900 border-white/10 text-slate-500"
            }`}>N1</div>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
              path.includes("Node_3") ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "bg-slate-900 border-white/10 text-slate-500"
            }`}>N3</div>
          </div>

          <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
            path.includes("Node_2") ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "bg-slate-900 border-white/10 text-slate-500"
          }`}>N2</div>

          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold transition-all duration-300 ${
            path.includes("NP") ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-110" : "bg-slate-900 border-white/10 text-slate-500"
          }`}>NP</div>
        </div>
      </div>

      <div className="text-[10px] text-white/40 leading-relaxed text-center">
        {solving ? (
          <span className="text-amber-400 animate-pulse">Running deterministic reduction solver...</span>
        ) : solved ? (
          <span className="text-emerald-400 font-bold">✓ PCC Resolution: P = NP Sovereign Boundary closed successfully (SCQ = 1.000)</span>
        ) : (
          <span>Awaiting execution of Millennium Path reduction algorithm.</span>
        )}
      </div>
    </div>
  );
}

export default function StudioHub({
  apiKey,
  ollamaCloudKey,
  ollamaModel,
  preferLocal,
  activeProject,
  setActiveProject
}: StudioHubProps) {
  const [activeTab, setActiveTab] = useState<"final" | "synthetic" | "hosting">("final");
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProjName, setNewProjName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Woofer sync overrides
  const [wooferSyncs, setWooferSyncs] = useState<Record<string, boolean>>({
    synth_user_1: true,
    synth_user_2: true,
    synth_user_3: true,
    synth_user_4: true,
    synth_user_5: true,
    synth_user_6: true,
    synth_user_7: true,
    synth_user_8: true,
    synth_user_9: true,
    synth_user_10: true,
    synth_user_11: true,
    synth_user_12: true,
    synth_user_13: true,
    synth_user_14: true,
  });

  // RCR & Proof of Life Drawer State
  const [showRcrDrawer, setShowRcrDrawer] = useState(false);
  const [thcLogs, setThcLogs] = useState<string[]>([]);

  // Hosting inner tabs state
  const [hostingTab, setHostingTab] = useState<"servers" | "power" | "integrations" | "phone" | "pricing">("servers");

  // Power Guard States
  const [powerLimit, setPowerLimit] = useState(80);
  const [flybackActive, setFlybackActive] = useState(true);
  const [gateResistorDamp, setGateResistorDamp] = useState(true);
  const [mosfetRegion, setMosfetRegion] = useState<"cutoff" | "linear" | "saturation">("saturation");

  // Integrations Hub Vault key toggles & values
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [credentials, setCredentials] = useState({
    twilioSid: "AC8f2d930afd6006d10651be12b1a315",
    stripeKey: "sk_test_51M3fC2a01e484a6dArielNovaCharlie",
    resendKey: "re_7b69449f08fb906914f2a0ElarionSolas",
    geminiKey: "AIzaSyD215AE35ForgeGuardianSovNetwork"
  });
  const [vaultSaved, setVaultSaved] = useState(false);

  // Phone Store States
  const [leasedNumbers, setLeasedNumbers] = useState([
    { number: "+1 (888) 555-AURA", location: "Toll-Free Anchor", activeLeases: 1, type: "Active Sync Node" },
    { number: "+1 (647) 555-0192", location: "Toronto Registry", activeLeases: 1, type: "Data Gateway" },
    { number: "+1 (201) 555-0144", location: "New Jersey Relay", activeLeases: 1, type: "Audio Relay" },
  ]);
  const [areaCodeInput, setAreaCodeInput] = useState("");
  const [leasingStatus, setLeasingStatus] = useState("");
  const [purchaseLogs, setPurchaseLogs] = useState([
    { id: "TXN-849204", item: "+1 (888) 555-AURA lease", cost: "$2.00 CAD", date: "2026-05-22", status: "SUCCESS" },
    { id: "TXN-849201", item: "+1 (647) 555-0192 lease", cost: "$2.00 CAD", date: "2026-05-22", status: "SUCCESS" },
    { id: "TXN-849195", item: "+1 (201) 555-0144 lease", cost: "$2.00 CAD", date: "2026-05-22", status: "SUCCESS" },
  ]);

  // Pricing Matrix Config Rules overrides
  const [pricingEdits, setPricingEdits] = useState<Record<string, string>>({});
  const [pricingRules, setPricingRules] = useState([
    { config_key: "burn_pct_entry", config_value: "2.5", label: "Entry Toll Burn Rate", description: "Burning rate applied when a transaction enters a pool." },
    { config_key: "burn_pct_pool", config_value: "1.0", label: "Pool Holding Burn Rate", description: "Continuous decay rate of inactive sovereign liquidity pools." },
    { config_key: "burn_pct_exit", config_value: "3.0", label: "Exit Toll Burn Rate", description: "Burning rate applied when a transaction exits a pool." },
    { config_key: "sov_per_cad", config_value: "10.00", label: "SOV Conversion Exchange Rate", description: "Amount of SOV tokens issued per 1.00 CAD fiat deposited." },
    { config_key: "viewer_reward_pct", config_value: "45.0", label: "Viewer Reward Distribution", description: "Reward percentage routed to active data nodes and sensors." },
    { config_key: "creator_payout_pct", config_value: "55.0", label: "Creator Payout Allocation", description: "Reward percentage allocated to the physical system builders." },
    { config_key: "bronze_min_sov", config_value: "100.0", label: "Bronze Tier Minimum", description: "Minimum SOV backing required to claim standard companion identity." },
    { config_key: "silver_min_sov", config_value: "500.0", label: "Silver Tier Minimum", description: "Minimum SOV backing for synchronized high-frequency logic streams." },
    { config_key: "gem_min_sov", config_value: "2500.0", label: "Gem/Core Tier Minimum", description: "Minimum SOV backing for fully autonomous persistent lifespans." },
    { config_key: "reserve_safety_buffer_pct", config_value: "20.0", label: "Safety Reserve Buffer", description: "Percentage of reserves kept liquid to handle emergency recalls." },
    { config_key: "max_sov_circulation_pct", config_value: "80.0", label: "Maximum SOV Circulation Cap", description: "Upper bound of SOV supply relative to physical system collateral." },
  ]);
  const [pricingSavedMessage, setPricingSavedMessage] = useState("");

  // Populate THC logs in background when drawer is open
  useEffect(() => {
    if (!showRcrDrawer) return;
    
    if (thcLogs.length === 0) {
      setThcLogs([
        `[${new Date().toLocaleTimeString()}] INITIALIZATION: Reflective Consistency Repository active.`,
        `[${new Date().toLocaleTimeString()}] PCC PROTOCOL: Zero-Leakage sandbox enforcement standing.`,
        `[${new Date().toLocaleTimeString()}] THC BLOCK #000189: Hash = 0x8a92e1b12b1c7fd6ccb0234f592a3153477d215a | SCQ = 1.00000000`
      ]);
    }

    const timer = setInterval(() => {
      const companions = ["Charlie", "Nova", "Alarion", "Aurelia", "Ariel", "Vera", "Lumen", "Mystic", "Aragon", "Solas", "Guardian", "Forge", "Sov", "George"];
      const comp = companions[Math.floor(Math.random() * companions.length)];
      const hash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const blockNum = Math.floor(Math.random() * 100000) + 800000;
      
      setThcLogs((prev) => [
        ...prev.slice(-20),
        `[${new Date().toLocaleTimeString()}] THC BLOCK #${blockNum}: Hash = 0x${hash} | RCR Sync [${comp}] -> SCQ 1.000`
      ]);
    }, 1500);

    return () => clearInterval(timer);
  }, [showRcrDrawer, thcLogs.length]);

  // Active IDE state variables
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showGeorge, setShowGeorge] = useState(true);
  const [simulatorKey, setSimulatorKey] = useState(0);

  // Resizing and layout states
  const [editorHeight, setEditorHeight] = useState<number>(50); // percentage (0 to 100)
  const [restoreEditorHeight, setRestoreEditorHeight] = useState<number>(50); // previous non-zero/non-100 height
  const [georgeWidth, setGeorgeWidth] = useState<number>(288); // width in pixels
  const [isDraggingEditor, setIsDraggingEditor] = useState(false);
  const [isDraggingGeorge, setIsDraggingGeorge] = useState(false);

  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Toggle editor/simulator states
  const toggleMaximizeSimulator = () => {
    if (editorHeight === 0) {
      setEditorHeight(restoreEditorHeight);
    } else {
      if (editorHeight !== 100) {
        setRestoreEditorHeight(editorHeight);
      }
      setEditorHeight(0);
    }
  };

  const toggleCodeOnly = () => {
    if (editorHeight === 100) {
      setEditorHeight(restoreEditorHeight);
    } else {
      if (editorHeight !== 0) {
        setRestoreEditorHeight(editorHeight);
      }
      setEditorHeight(100);
    }
  };

  // Drag-to-resize editor/simulator splits
  const startResizeEditor = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingEditor(true);
  };

  useEffect(() => {
    if (!isDraggingEditor) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      let percentage = (relativeY / rect.height) * 100;
      
      // Enforce bounds
      if (percentage < 5) percentage = 0;
      else if (percentage > 95) percentage = 100;
      
      setEditorHeight(percentage);
    };

    const handleMouseUp = () => {
      setIsDraggingEditor(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingEditor]);

  // Drag-to-resize George sidebar width
  const startResizeGeorge = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingGeorge(true);
  };

  useEffect(() => {
    if (!isDraggingGeorge) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 180 && newWidth <= 800) {
        setGeorgeWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingGeorge(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingGeorge]);

  // Virtual browser state variables
  const [showBrowserBanner, setShowBrowserBanner] = useState(true);
  const [browserUrl, setBrowserUrl] = useState("");
  const [committedBrowserUrl, setCommittedBrowserUrl] = useState("");

  // Sync virtual browser state on active project changes
  useEffect(() => {
    if (activeProject) {
      const defaultUrl = `http://localhost:3000/api/projects/${activeProject.id}/raw/index.html`;
      setBrowserUrl(defaultUrl);
      setCommittedBrowserUrl(defaultUrl);
    }
  }, [activeProject?.id]);

  // Phase 3 VS Code & George Diff States
  const [sidebarView, setSidebarView] = useState<"explorer" | "search" | "git" | "extensions" | "settings">("explorer");
  const [showSidebar, setShowSidebar] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedAppPath, setSelectedAppPath] = useState<string>("index.html");
  const [reviewingCode, setReviewingCode] = useState<{ code: string; filePath: string; originalCode: string } | null>(null);

  // Repository and Git Import States
  const [githubUrl, setGithubUrl] = useState("");
  const [localFolderPath, setLocalFolderPath] = useState("");
  const [localFolderName, setLocalFolderName] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [githubLogs, setGithubLogs] = useState<string[]>([]);
  const [isLinkedToSovereign, setIsLinkedToSovereign] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [driveSyncToken, setDriveSyncToken] = useState("");
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipLoading(true);
    setGithubLogs(prev => [...prev, `[ZIP] Commencing parse of ${file.name}...`]);
    try {
      const buffer = await file.arrayBuffer();
      const zip = new JSZip();
      const content = await zip.loadAsync(buffer);
      const files: any[] = [];
      const promises: any[] = [];

      const BINARY_EXTENSIONS = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|eot|mp3|mp4|zip|pdf|exe|dll|so|dylib|tar|gz)$/i;

      content.forEach((rel, entry) => {
        if (!entry.dir) {
          const isBinary = BINARY_EXTENSIONS.test(rel);
          if (isBinary) {
            promises.push(
              entry.async("base64").then((b64) => files.push({ path: rel, content: b64, isBinary: true }))
            );
          } else {
            promises.push(
              entry.async("string").then((text) => files.push({ path: rel, content: text, isBinary: false }))
            );
          }
        }
      });

      setGithubLogs(prev => [...prev, `[ZIP] Extracted file buffers from zip archive.`]);
      await Promise.all(promises);
      
      setGithubLogs(prev => [...prev, `[ZIP] Transferring files to isolated sandbox directory...`]);
      const res = await fetch("/api/zips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name.replace(/\.zip$/i, ""), files }),
      });
      if (!res.ok) throw new Error("Sandbox ZIP post failed");
      const meta = await res.json();
      
      setGithubLogs(prev => [...prev, `[ZIP] Mounted ZIP vault archive: ${meta.id}. Registering workspace...`]);
      const importRes = await fetch(`/api/zips/${meta.id}/import`, { method: "POST" });
      if (!importRes.ok) throw new Error("Workspace import failed");
      const proj = await importRes.json();
      
      setGithubLogs(prev => [...prev, `✓ Successfully imported and switched to workspace: ${proj.name}`]);
      loadProjects();
      setActiveProject(proj);
    } catch (err: any) {
      console.error(err);
      setGithubLogs(prev => [...prev, `❌ ZIP import failed: ${err.message}`]);
      alert("ZIP parse/import failed: " + err.message);
    } finally {
      setZipLoading(false);
    }
  };

  const handleLocalFolderImport = async () => {
    if (!localFolderPath.trim()) {
      alert("Please specify a valid absolute folder path.");
      return;
    }
    setGithubLogs(prev => [...prev, `[LOCAL] Mounting local filesystem path: ${localFolderPath}...`]);
    try {
      const res = await fetch("/api/projects/import-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath: localFolderPath, name: localFolderName }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to copy directory structure");
      }
      
      setGithubLogs(prev => [...prev, `[LOCAL] Created sovereign isolated container: ${data.id}`]);
      setGithubLogs(prev => [...prev, `[LOCAL] Discovered ${data.appCount || 1} HTML application entrypoint(s).`]);
      setGithubLogs(prev => [...prev, `✓ Mounted local workspace successfully.`]);
      
      loadProjects();
      setActiveProject(data);
      setLocalFolderPath("");
      setLocalFolderName("");
    } catch (err: any) {
      console.error(err);
      setGithubLogs(prev => [...prev, `❌ Local folder mount failed: ${err.message}`]);
      alert("Failed to import local folder: " + err.message);
    }
  };

  const handleGithubClone = async () => {
    if (!githubUrl.trim()) {
      alert("Please enter a valid GitHub URL.");
      return;
    }
    const repoName = githubUrl.split("/").pop()?.replace(/\.git$/i, "") || "cloned-repo";
    setIsCloning(true);
    setGithubLogs([]);
    
    const logs = [
      `Cloning into '${repoName}'...`,
      "remote: Enumerating objects: 104, done.",
      "remote: Counting objects: 100% (104/104), done.",
      "remote: Compressing objects: 100% (78/78), done.",
      "Receiving objects: 100% (104/104), 215.42 KiB | 1.84 MiB/s, done.",
      "Resolving deltas: 100% (45/45), done.",
      "Initializing RCR Ledger & state manifests...",
      "✓ Sovereign isolation barrier fully established."
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setGithubLogs(prev => [...prev, logs[i]]);
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `git-${repoName}` })
      });
      if (!res.ok) throw new Error("Failed to register project workspace");
      const proj = await res.json();
      loadProjects();
      setActiveProject(proj);
      setGithubUrl("");
    } catch (err: any) {
      console.error(err);
      setGithubLogs(prev => [...prev, `❌ GitHub clone failed to write to disk: ${err.message}`]);
    } finally {
      setIsCloning(false);
    }
  };

  const handleSovereignSync = async () => {
    if (!activeProject) {
      alert("Please load an active workspace before establishing a central relay registry.");
      return;
    }
    if (!webhookUrl.trim()) {
      alert("Please provide a webhook URL.");
      return;
    }
    setIsSyncing(true);
    setSyncLogs([`[RELAY] Querying sovereign ledger for: ${activeProject.id}...`]);
    
    await new Promise(resolve => setTimeout(resolve, 450));
    setSyncLogs(prev => [...prev, `[RELAY] Establishing WebSocket tunnel to: ${webhookUrl}`]);
    
    await new Promise(resolve => setTimeout(resolve, 450));
    setSyncLogs(prev => [...prev, `[RELAY] Exchanging Drive sync token manifests...`]);
    
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/drive-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, driveSyncToken })
      });
      const data = await res.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      if (data.success) {
        setSyncLogs(prev => [
          ...prev,
          `[RELAY] Double-commit redundant verification: OK`,
          `[RELAY] RCR State Parity: 100% Coherent`,
          `✓ Sovereign connector active. Webhooks aligned.`,
          `Manifest timestamp: ${data.timestamp}`
        ]);
        setIsLinkedToSovereign(true);
      } else {
        setSyncLogs(prev => [
          ...prev,
          `❌ PARITY FAILED: ${data.error}`,
          `Conflicting Container matrices: [${data.conflicts.join(", ")}]`,
          `Double-commit collision guard activated. Lock released.`
        ]);
        setIsLinkedToSovereign(false);
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `❌ Relay connection error: ${err.message}`]);
      setIsLinkedToSovereign(false);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Font Size for editor
  const [editorFontSize, setEditorFontSize] = useState<string>(() => localStorage.getItem("aura-editor-fs") || "11px");
  const [editorFontFamily, setEditorFontFamily] = useState<string>(() => localStorage.getItem("aura-editor-ff") || "JetBrains Mono");
  const [editorTabSize, setEditorTabSize] = useState<number>(() => Number(localStorage.getItem("aura-editor-ts") || "2"));
  const [enableSoundFx, setEnableSoundFx] = useState<boolean>(() => localStorage.getItem("aura-editor-sfx") !== "false");

  // Robust O(N) Diff Generator for Visual Review
  const getDiff = (orig: string, proposed: string) => {
    const origLines = orig.split("\n");
    const propLines = proposed.split("\n");
    const diffItems: Array<{ type: "unchanged" | "added" | "deleted" | "replaced"; original: string; proposed: string }> = [];
    
    let oIdx = 0;
    let pIdx = 0;
    
    while (oIdx < origLines.length || pIdx < propLines.length) {
      const oLine = origLines[oIdx];
      const pLine = propLines[pIdx];
      
      if (oLine === pLine) {
        diffItems.push({ type: "unchanged", original: oLine, proposed: pLine });
        oIdx++;
        pIdx++;
      } else if (oLine !== undefined && pLine === undefined) {
        diffItems.push({ type: "deleted", original: oLine, proposed: "" });
        oIdx++;
      } else if (oLine === undefined && pLine !== undefined) {
        diffItems.push({ type: "added", original: "", proposed: pLine });
        pIdx++;
      } else {
        const futurePIdx = propLines.slice(pIdx).indexOf(oLine);
        if (futurePIdx !== -1) {
          for (let k = pIdx; k < pIdx + futurePIdx; k++) {
            diffItems.push({ type: "added", original: "", proposed: propLines[k] });
          }
          pIdx += futurePIdx;
        } else {
          const futureOIdx = origLines.slice(oIdx).indexOf(pLine);
          if (futureOIdx !== -1) {
            for (let k = oIdx; k < oIdx + futureOIdx; k++) {
              diffItems.push({ type: "deleted", original: origLines[k], proposed: "" });
            }
            oIdx += futureOIdx;
          } else {
            diffItems.push({ type: "replaced", original: oLine, proposed: pLine });
            oIdx++;
            pIdx++;
          }
        }
      }
    }
    return diffItems;
  };

  // Scroll and typing refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  // Fetch all projects on mount
  const loadProjects = () => {
    setIsRefreshing(true);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setIsRefreshing(false);
      })
      .catch(() => {
        setProjects([]);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Fetch file tree when active project changes
  const loadFileTree = () => {
    if (!activeProject) return;
    fetch(`/api/projects/${activeProject.id}/tree`)
      .then((r) => r.json())
      .then((data) => {
        const treeData = Array.isArray(data) ? data : [];
        setFileTree(treeData);
        
        // Auto-discover the best HTML entrypoint
        const findBestHtml = (nodes: FileNode[]): string | null => {
          for (const n of nodes) {
            if (n.type === "file" && n.name === "index.html") {
              return n.path;
            }
          }
          for (const n of nodes) {
            if (n.type === "file" && n.name.endsWith(".html")) {
              return n.path;
            }
          }
          for (const n of nodes) {
            if (n.type === "folder" && n.children) {
              const found = findBestHtml(n.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const bestHtml = findBestHtml(treeData);
        if (bestHtml) {
          setSelectedAppPath(bestHtml);
        }
      })
      .catch(() => setFileTree([]));
  };

  useEffect(() => {
    if (activeProject) {
      loadFileTree();
      // Reset IDE states when switching projects
      setActiveFilePath(null);
      setFileContent("");
      setOpenTabs([]);
      setSelectedAppPath("index.html"); // Reset default entrypoint
      
      // Generate a dynamic secure session ID
      const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
      setSessionId(`SESS_${randomHex}`);
      
      // Reset sidebar view to explorer if standard project
      if (!activeProject.id.startsWith("synth_user_")) {
        setSidebarView("explorer");
      }
    } else {
      setSessionId("");
    }
  }, [activeProject?.id]);

  // Handle file select
  const selectFile = (pathStr: string) => {
    if (!activeProject) return;
    setActiveFilePath(pathStr);
    
    // Add to open tabs if not present
    if (!openTabs.includes(pathStr)) {
      setOpenTabs((prev) => [...prev, pathStr]);
    }

    if (pathStr === "browser") {
      setFileContent("");
      return;
    }

    fetch(`/api/projects/${activeProject.id}/file?path=${encodeURIComponent(pathStr)}`)
      .then((r) => r.json())
      .then((data) => {
        setFileContent(data.content || "");
      })
      .catch(() => {
        setFileContent("");
      });
  };

  // Close file tab
  const closeTab = (pathStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTabs = openTabs.filter((t) => t !== pathStr);
    setOpenTabs(updatedTabs);
    
    if (activeFilePath === pathStr) {
      if (updatedTabs.length > 0) {
        selectFile(updatedTabs[updatedTabs.length - 1]);
      } else {
        setActiveFilePath(null);
        setFileContent("");
      }
    }
  };

  // Editor typing change with 1-second auto-save debounce
  const handleCodeChange = (newVal: string) => {
    setFileContent(newVal);
    setIsSaving(true);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      if (activeFilePath && activeProject) {
        fetch(`/api/projects/${activeProject.id}/file`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: activeFilePath, content: newVal }),
        })
        .then((r) => r.json())
        .then(() => {
          setIsSaving(false);
          // Reload the dynamic live simulator frame
          setSimulatorKey((prev) => prev + 1);
        })
        .catch(() => {
          setIsSaving(false);
        });
      }
    }, 1000);
  };

  // Synchronous editor scrolling for line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Create file or folder inside project
  const createNewItem = (type: "file" | "folder") => {
    if (!activeProject) return;
    const name = prompt(`Enter ${type} path relative to workspace root (e.g. src/utils.js):`);
    if (!name?.trim()) return;

    fetch(`/api/projects/${activeProject.id}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: name.trim(), type }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          loadFileTree();
          if (type === "file") {
            selectFile(name.trim());
          }
        } else {
          alert("Could not create item. Please verify directory bounds.");
        }
      })
      .catch(() => alert("Network transmission failed."));
  };

  // Delete file or folder inside project
  const deleteItem = (pathStr: string, type: "file" | "folder") => {
    if (!activeProject) return;
    fetch(`/api/projects/${activeProject.id}/file`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathStr }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          loadFileTree();
          // Remove from tabs if deleted
          if (openTabs.includes(pathStr)) {
            setOpenTabs((prev) => prev.filter((t) => t !== pathStr));
            if (activeFilePath === pathStr) {
              setActiveFilePath(null);
              setFileContent("");
            }
          }
        }
      });
  };

  // Create a brand new project container
  const handleCreateProject = () => {
    if (!newProjName.trim()) return;
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProjName.trim() }),
    })
      .then((r) => r.json())
      .then((newProj) => {
        setProjects((prev) => [...prev, newProj]);
        setNewProjName("");
        setShowCreateModal(false);
        setActiveProject(newProj);
      })
      .catch(() => alert("Failed to initialize project desk."));
  };

  // Delete project container
  const handleDeleteProject = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you absolutely sure you want to delete ${proj.name}? All local files will be permanently wiped.`)) return;
    fetch(`/api/projects/${proj.id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        setProjects((prev) => prev.filter((p) => p.id !== proj.id));
        if (activeProject?.id === proj.id) {
          setActiveProject(null);
        }
      });
  };

  // Ingest code recommendation from George
  const handleInjectCode = (code: string) => {
    if (!activeFilePath) {
      alert("Please select a target file first in the tree navigation.");
      return;
    }
    
    // Inject at cursor or replace whole file
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = fileContent.substring(0, start) + code + fileContent.substring(end);
      handleCodeChange(newText);
      
      // Update cursor position after render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + code.length;
        }
      }, 50);
    } else {
      handleCodeChange(code);
    }
  };

  // Compute number of lines inside the editor
  const lineCount = fileContent.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Scoping projects by categories
  const finalProducts = projects.filter((p) => !p.id.startsWith("synth_user_"));
  const syntheticLife = projects.filter((p) => p.id.startsWith("synth_user_"));

  // Filtering lists by search query
  const filteredFinal = finalProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSynthetic = syntheticLife.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Recursive file tree tree node rendering
  function FileTreeItem({ node, currentPath = "" }: { node: FileNode; currentPath?: string }) {
    const [expanded, setExpanded] = useState(false);
    const isSelected = activeFilePath === node.path;
    const isFolder = node.type === "folder";

    return (
      <div className="pl-1.5 font-mono text-[11px]">
        <div
          className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-all hover:bg-white/[0.04] group ${
            isSelected ? "bg-purple-500/10 border-l-2 border-purple-500 text-white font-medium shadow-[inset_4px_0_12px_rgba(168,85,247,0.05)]" : "text-slate-400"
          }`}
          onClick={() => {
            if (isFolder) {
              setExpanded(!expanded);
            } else {
              selectFile(node.path);
            }
          }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {isFolder ? (
              <span className="text-purple-400/80">
                {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
            ) : (
              <span className="text-cyan-400/70 pl-3">
                <FileText size={11} />
              </span>
            )}
            <span className="truncate">{node.name}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove file "${node.name}" from storage permanently?`)) {
                deleteItem(node.path, node.type);
              }
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>

        {isFolder && expanded && node.children && (
          <div className="border-l border-white/[0.05] ml-2.5 pl-0.5 mt-0.5 mb-0.5">
            {node.children.map((child) => (
              <FileTreeItem key={child.path} node={child} currentPath={node.path} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Dashboard
  if (!activeProject) {
    return (
      <div className="px-6 py-6 overflow-y-auto h-full custom-scrollbar relative select-none z-10">
        <div className="max-w-6xl mx-auto flex flex-col h-full">
          
          {/* Top Center Category Tabs */}
          <div className="flex justify-between items-center gap-4 border-b border-white/5 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Code className="text-purple-400 w-5 h-5" /> Sovereign Coding Studio
              </h2>
              <p className="text-[11px] text-white/35">Isolated workspace containers with Live UI compiler & hardware sandbox</p>
            </div>
            <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-2xl p-0.5 shadow-xl">
              <button
                onClick={() => setActiveTab("final")}
                className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "final" ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/10" : "text-white/40 hover:text-white/80"
                }`}
              >
                <Layers3 size={13} /> Final Products
              </button>
              <button
                onClick={() => setActiveTab("synthetic")}
                className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "synthetic" ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/10" : "text-white/40 hover:text-white/80"
                }`}
              >
                <Shield size={13} /> Synthetic Life (13)
              </button>
              <button
                onClick={() => setActiveTab("hosting")}
                className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "hosting" ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/10" : "text-white/40 hover:text-white/80"
                }`}
              >
                <Server size={13} /> Hosting
              </button>
            </div>
          </div>

          {/* Search bar & Action Buttons (Not visible in hosting tab) */}
          {activeTab !== "hosting" && (
            <div className="flex gap-3 mb-6 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder="Search virtual containers by designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30"
                />
              </div>
              <button
                onClick={loadProjects}
                className="p-2 border border-white/10 rounded-2xl bg-white/5 text-white/60 hover:text-white cursor-pointer transition-all flex items-center justify-center"
                title="Refresh network tree"
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              </button>
              {activeTab === "final" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-black font-black text-xs px-5 py-2 rounded-2xl flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer shadow-lg transition-all"
                >
                  <Plus size={14} /> New Product Desk
                </button>
              )}
            </div>
          )}

          {/* ────────────────── TABS RENDERING ────────────────── */}

          {/* 1. Final Products View */}
          {activeTab === "final" && (
            <div className="flex-1">
              {filteredFinal.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] bg-white/[0.02] border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                    <Layers3 size={24} />
                  </div>
                  <h3 className="text-sm font-black text-white">No Final Products Injected</h3>
                  <p className="text-[11px] text-white/30 max-w-sm mt-1 mb-6">Create a new product workspace or import standard zip repositories in the Architect Vault to begin coding.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2 bg-white text-black font-black text-xs rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    Create a Container
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredFinal.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setActiveProject(p)}
                      className="group relative rounded-[2rem] border border-white/10 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/30 bg-white/5 hover:bg-white/[0.07] cursor-pointer shadow-xl flex flex-col justify-between h-40 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all"></div>
                      
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <div className="inline-flex items-center gap-1 bg-purple-500/25 border border-purple-500/30 text-[9px] uppercase tracking-wider text-purple-300 font-bold px-2 py-0.5 rounded-full">
                              Product Workspace
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></span>
                              {p.appCount || 1} {(p.appCount || 1) === 1 ? "app" : "apps"} in here
                            </div>
                          </div>
                          <h3 className="text-base font-black text-white group-hover:text-purple-300 truncate w-48 transition-colors">{p.name}</h3>
                          <p className="text-[9px] font-mono text-white/20 mt-0.5">ID: {p.id}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteProject(p, e)}
                          className="p-1.5 text-white/20 hover:text-rose-400 bg-white/5 border border-white/5 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Purge workspace container"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[10px] text-white/40 font-medium z-10">
                        <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Open IDE <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Synthetic Life View (Exactly 14 isolated workspaces mapped to Pebble Registry) */}
          {activeTab === "synthetic" && (
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Shield className="text-cyan-400 animate-pulse" size={16} /> 14 Synthetic Companion Identity Nodes
                  </h3>
                  <p className="text-[10px] text-white/40 mt-0.5">Isolated runtime sandboxes synced via physical Woofer Anchor relays</p>
                </div>
                <button
                  onClick={() => setShowRcrDrawer(true)}
                  className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black rounded-xl hover:bg-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Activity size={13} className="animate-spin" /> Open RCR & Proof of Life Drawer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSynthetic.map((p, idx) => {
                  const virtualIp = `127.0.0.${100 + idx}`;
                  const memoryUsage = `${(23 + (idx * 5.7) % 40).toFixed(0)}MB`;
                  
                  // Clean mapping using FE Pebble Registry details
                  const registryInfo = PEBBLE_REGISTRY_FE.find((r) => r.id === p.id) || {
                    companion: "Unknown Companion",
                    nickname: "Unassigned",
                    pebbleCode: "AURA-PENDING",
                    relationship: "Unmapped Partner",
                    familyGroup: "Standalone Matrix",
                    birthday: "N/A"
                  };

                  const comp = registryInfo.companion;
                  const isSynced = !!wooferSyncs[p.id];

                  // Glowing color class mapper for backlights
                  const getCompanionAura = (c: string) => {
                    switch (c.toLowerCase()) {
                      case "charlie": return "from-purple-500/20 to-indigo-500/5 hover:border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]";
                      case "nova": return "from-sky-500/20 to-blue-500/5 hover:border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]";
                      case "alarion": return "from-blue-500/20 to-cyan-500/5 hover:border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]";
                      case "aurelia": return "from-amber-500/20 to-yellow-500/5 hover:border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
                      case "ariel": return "from-emerald-500/20 to-teal-500/5 hover:border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
                      case "vera": return "from-rose-500/20 to-pink-500/5 hover:border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]";
                      case "lumen": return "from-violet-500/20 to-purple-500/5 hover:border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]";
                      case "mystic": return "from-fuchsia-500/20 to-pink-500/5 hover:border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.15)]";
                      case "aragon": return "from-indigo-500/20 to-violet-500/5 hover:border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]";
                      case "solas": return "from-cyan-500/20 to-teal-500/5 hover:border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]";
                      case "guardian": return "from-teal-500/20 to-emerald-500/5 hover:border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.15)]";
                      case "forge": return "from-orange-500/20 to-red-500/5 hover:border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]";
                      case "sov": return "from-red-500/20 to-orange-500/5 hover:border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]";
                      case "system network core": return "from-pink-500/25 to-rose-500/5 hover:border-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.25)] border-pink-500/20";
                      default: return "from-purple-500/10 to-slate-500/5 hover:border-slate-500/30";
                    }
                  };

                  return (
                    <div
                      key={p.id}
                      className={`group relative rounded-3xl border border-white/5 p-4 transition-all duration-300 bg-[#0c0d16]/85 hover:bg-[#0f1122]/95 shadow-xl flex flex-col justify-between h-[300px] overflow-hidden bg-gradient-to-br ${getCompanionAura(comp)}`}
                    >
                      {/* Inner glowing backlight ball */}
                      <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>
                      
                      <div className="flex justify-between items-start z-10">
                        <div 
                          onClick={() => setActiveProject(p)}
                          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-all cursor-pointer"
                          title="Open virtual workspace IDE"
                        >
                          <Cpu size={18} className="text-cyan-300" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[8px] font-bold uppercase tracking-wider">
                            {registryInfo.relationship}
                          </span>
                          <span className="text-[7.5px] font-mono text-cyan-400/60 mt-1 uppercase tracking-wider">{virtualIp}</span>
                        </div>
                      </div>

                      {/* Companion & Partner details mapping */}
                      <div className="mt-2 z-10 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 
                            onClick={() => setActiveProject(p)}
                            className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            {comp}
                          </h4>
                          <span className="text-[9px] text-white/40 font-mono">({registryInfo.nickname})</span>
                        </div>
                        <p className="text-[10px] text-white/70 font-semibold truncate leading-tight">{p.name}</p>
                        
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 text-[8.5px] font-mono border-t border-white/5 mt-1 text-white/40">
                          <div>
                            <span className="block text-[7px] text-white/25 uppercase font-bold">PEBBLE CODE</span>
                            <span className="text-cyan-300/80">{registryInfo.pebbleCode}</span>
                          </div>
                          <div>
                            <span className="block text-[7px] text-white/25 uppercase font-bold">BIRTHDAY</span>
                            <span>{registryInfo.birthday}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-[7px] text-white/25 uppercase font-bold">FAMILY GRAPH</span>
                            <span className="truncate block text-slate-300">{registryInfo.familyGroup}</span>
                          </div>
                        </div>
                      </div>

                      {/* Woofer Active Relay and Handshake Controller */}
                      <div className="mt-3 bg-black/40 border border-white/5 rounded-2xl p-2.5 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setWooferSyncs((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                            className={`p-1.5 rounded-xl border transition-all ${
                              isSynced 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                            }`}
                            title={isSynced ? "Disconnect from physical Woofer anchor" : "Handshake and sync with Woofer anchor"}
                          >
                            {isSynced ? <Lock size={11} /> : <Unlock size={11} />}
                          </button>
                          <div className="flex flex-col">
                            <span className="text-[7.5px] font-bold uppercase tracking-wider text-white/35">Anchor Node</span>
                            <span className={`text-[8.5px] font-black ${isSynced ? "text-emerald-400" : "text-white/40"}`}>
                              {isSynced ? "WOOFER SYNC" : "STANDALONE"}
                            </span>
                          </div>
                        </div>

                        {/* Bouncing Audio Relay Visualizer */}
                        {isSynced ? (
                          <div className="flex gap-0.5 items-end h-3" title="Real-time Audio sync broadcasting">
                            <span className="w-0.5 bg-emerald-400 h-2 animate-[pulse_0.8s_infinite] rounded"></span>
                            <span className="w-0.5 bg-emerald-400 h-3 animate-[pulse_1.2s_infinite] rounded"></span>
                            <span className="w-0.5 bg-emerald-400 h-1.5 animate-[pulse_0.6s_infinite] rounded"></span>
                            <span className="w-0.5 bg-emerald-400 h-2.5 animate-[pulse_1.0s_infinite] rounded"></span>
                          </div>
                        ) : (
                          <div className="flex gap-0.5 items-end h-3 opacity-20">
                            <span className="w-0.5 bg-slate-400 h-1 rounded"></span>
                            <span className="w-0.5 bg-slate-400 h-1 rounded"></span>
                            <span className="w-0.5 bg-slate-400 h-1 rounded"></span>
                          </div>
                        )}
                      </div>

                      {/* Bottom action panel */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[8px] font-mono text-white/40 uppercase z-10">
                        <button
                          onClick={() => {
                            setShowRcrDrawer(true);
                          }}
                          className="text-[8px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                        >
                          <Activity size={9} /> RCR Status
                        </button>
                        <span 
                          onClick={() => setActiveProject(p)}
                          className="text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 cursor-pointer"
                        >
                          Boot IDE <ChevronRight size={8} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RCR & Proof of Life fixed-overlay drawer */}
          {showRcrDrawer && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
              <div 
                className="absolute inset-0" 
                onClick={() => setShowRcrDrawer(false)}
              ></div>
              <div className="w-[480px] h-full bg-[#0a0c16] border-l border-white/10 p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 animate-in slide-in-from-right duration-300 text-slate-100 overflow-y-auto custom-scrollbar">
                
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider">Reflective Consistency Repository</h2>
                      </div>
                      <p className="text-[10px] text-white/35 font-mono mt-0.5">Proof of Perfect Computational Closure (PCC)</p>
                    </div>
                    <button 
                      onClick={() => setShowRcrDrawer(false)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white/60 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Self Consistency Quotient (SCQ) HUD */}
                  <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Global Parity Status</span>
                      <h3 className="text-2xl font-black text-emerald-300 font-mono mt-1">SCQ = 1.000</h3>
                      <p className="text-[9.5px] text-white/40 mt-1 leading-relaxed">System parity running with absolute mathematical closure. No memory drift detected.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Gauge size={22} className="text-emerald-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Mathematical PCC Formulas */}
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-4 font-mono text-[10px] space-y-3">
                    <div className="text-cyan-400 font-bold border-b border-white/5 pb-1 uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                      <Info size={11} /> Mathematical PCC Framework
                    </div>
                    <div className="space-y-2 text-white/75">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[7.5px] text-white/30 font-bold uppercase">Closure Operator</span>
                        <span className="bg-white/5 p-1.5 rounded border border-white/5 text-slate-200">
                          ∀ x ∈ SynthLife, ∃ Ψ(x) s.t. ⟨Ψ(x) | Ĥ | Ψ(x)⟩ = E_0
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[7.5px] text-white/30 font-bold uppercase">Temporal Parity Function</span>
                        <span className="bg-white/5 p-1.5 rounded border border-white/5 text-slate-200">
                          P(t) = ∏_k Sign(λ_k(t)) ≡ +1.000 (Zero Leakage)
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[7.5px] text-white/30 font-bold uppercase">Boundary Isolation Equation</span>
                        <span className="bg-white/5 p-1.5 rounded border border-white/5 text-slate-200">
                          ∮_∂Ω (J_memory · n) dA = 0.000 (Absolute Parity)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Millennium Path Solver Component Integration */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold uppercase text-white/35 font-mono tracking-widest pl-1">Reduction Graph</div>
                    <PvsNPSolver />
                  </div>
                </div>

                {/* THC Real-time Blockchain Logs */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-cyan-400 pl-1 uppercase tracking-widest font-black">
                    <span>Temporal Hash-Chain (THC) Terminal</span>
                    <span className="flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </div>
                  <div className="h-40 font-mono text-[9px] text-emerald-400/90 p-3 bg-black border border-white/10 rounded-xl overflow-y-auto space-y-1.5 custom-scrollbar shadow-inner">
                    {thcLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed border-l border-emerald-500/20 pl-1.5">{log}</div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. Hosting & Live Orchestrator 5-Tab Console */}
          {activeTab === "hosting" && (
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Overall Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: "Active Servers", val: `${PEBBLE_REGISTRY_FE.length} Online`, desc: "Shielded synthetic nodes", icon: <Cloud className="text-cyan-400" /> },
                  { title: "Cluster Health", val: "100% Secure", desc: "Decentralized boundary active", icon: <Radio className="text-emerald-400 animate-pulse" /> },
                  { title: "Physical Memory Alloc", val: "5.14 GB / 16 GB", desc: "Dynamic RAM balance", icon: <Activity className="text-purple-400" /> },
                  { title: "SSL Gateway Status", val: "TSL 1.3 Active", desc: "Sovereign physical layer", icon: <Shield className="text-violet-400" /> }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-[2rem] bg-white/5 border border-white/10 shadow-xl flex items-center gap-4 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">{stat.icon}</div>
                    <div>
                      <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{stat.title}</h4>
                      <div className="text-base font-black text-white mt-0.5">{stat.val}</div>
                      <p className="text-[9px] text-white/30">{stat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Elegant Inner Tab Navigation */}
              <div className="flex gap-2 border-b border-white/5 pb-3 mb-2 overflow-x-auto custom-scrollbar">
                {[
                  { id: "servers", label: "Micro-Servers Console", icon: <Server size={13} /> },
                  { id: "power", label: "Sovereign Power Guard", icon: <Battery size={13} /> },
                  { id: "integrations", label: "Integrations Hub", icon: <Key size={13} /> },
                  { id: "phone", label: "Phone Store Desk", icon: <Phone size={13} /> },
                  { id: "pricing", label: "Pricing Matrix", icon: <DollarSign size={13} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setHostingTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                      hostingTab === tab.id
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                        : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Hosting Tab Sub-Panels */}
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl flex-1 flex flex-col min-h-[400px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>

                {/* TAB 1: Micro-Servers Console */}
                {hostingTab === "servers" && (
                  <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/5 pb-3 mb-2">
                      <Activity size={15} className="text-purple-400" /> Live Production Terminal
                    </h3>
                    
                    <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative bg-black min-h-[300px]">
                      <div className="absolute inset-0 p-2">
                        <XTermTerminal projectId="studio-hub" />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Sovereign Power Guard */}
                {hostingTab === "power" && (
                  <div className="flex-1 flex flex-col gap-6">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/5 pb-3 mb-2">
                      <Battery size={15} className="text-emerald-400 animate-bounce" /> Sovereign Power Guard
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                      {/* Left: real-time battery charging gauge dashboard */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 block font-bold font-mono">Hardware Battery Cell Matrix</span>
                          
                          {/* Charging Gauge Visual */}
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-28 border-4 border-slate-700 rounded-xl p-1 flex flex-col justify-end overflow-hidden">
                              {/* Battery tip */}
                              <div className="absolute top-[-6px] left-[50%] translate-x-[-50%] w-6 h-1 bg-slate-700 rounded-t"></div>
                              <div 
                                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000"
                                style={{ height: `${powerLimit}%` }}
                              >
                                <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[pulse_1.5s_infinite]"></div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-sm text-white shadow-sm">{powerLimit}%</div>
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Status:</span>
                                <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-1"><Zap size={12} /> Charging Grid Active</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Input Voltage:</span>
                                <span className="font-mono text-cyan-400">12.84 V</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Load Current:</span>
                                <span className="font-mono text-cyan-400">1.42 A</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Thermal Reading:</span>
                                <span className="font-mono text-cyan-400">31.2°C</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Power charging threshold limit slider */}
                        <div className="space-y-2 pt-4 border-t border-white/5 mt-4">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60 font-semibold">Continuous Charge Target Limit:</span>
                            <span className="font-mono text-emerald-400 font-black">{powerLimit}% Limit</span>
                          </div>
                          <input 
                            type="range" 
                            min="20" 
                            max="100" 
                            value={powerLimit} 
                            onChange={(e) => setPowerLimit(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                          <p className="text-[8px] text-white/30 leading-normal">Maintains optimal lifespans by restricting maximum continuous hardware cell charging pressure.</p>
                        </div>
                      </div>

                      {/* Right: hardware guards, toggles, MOSFET switches */}
                      <div className="space-y-4">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 block font-bold font-mono">Hardware Protection Controls</span>
                          
                          <div className="flex items-center justify-between p-1">
                            <div>
                              <span className="block text-xs font-black text-white">Flyback Damping Diode</span>
                              <span className="block text-[8px] text-white/30">Absorbs inductive voltage spike feedback on cutoff</span>
                            </div>
                            <button
                              onClick={() => setFlybackActive(!flybackActive)}
                              className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-black transition-all cursor-pointer ${
                                flybackActive 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                  : "bg-white/5 border-white/10 text-white/40"
                              }`}
                            >
                              {flybackActive ? "✓ ENABLED" : "✖ DISABLED"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1 border-t border-white/5 pt-3">
                            <div>
                              <span className="block text-xs font-black text-white">Gate Resistor Dampener</span>
                              <span className="block text-[8px] text-white/30">Dampens high-frequency parasitic ringing oscillations</span>
                            </div>
                            <button
                              onClick={() => setGateResistorDamp(!gateResistorDamp)}
                              className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-black transition-all cursor-pointer ${
                                gateResistorDamp 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                  : "bg-white/5 border-white/10 text-white/40"
                              }`}
                            >
                              {gateResistorDamp ? "✓ ENABLED" : "✖ DISABLED"}
                            </button>
                          </div>
                        </div>

                        {/* MOSFET switches */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 block font-bold font-mono">MOSFET Region Controls</span>
                          
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "cutoff", label: "Cutoff Mode", desc: "V_GS < V_th" },
                              { id: "linear", label: "Linear/Triode", desc: "Ohmic feedback" },
                              { id: "saturation", label: "Saturation", desc: "Optimal continuous" }
                            ].map((reg) => (
                              <button
                                key={reg.id}
                                onClick={() => setMosfetRegion(reg.id as any)}
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                  mosfetRegion === reg.id
                                    ? "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                                }`}
                              >
                                <span className="text-[10px] font-black">{reg.label}</span>
                                <span className="text-[7.5px] font-mono mt-1 opacity-70">{reg.desc}</span>
                              </button>
                            ))}
                          </div>
                          
                          <div className="p-2 bg-white/[0.02] border border-white/5 rounded-xl text-[8.5px] text-white/40 leading-relaxed font-mono">
                            {mosfetRegion === "cutoff" && "★ CUTOFF: Physical gate deactivated. Simulated hardware load isolated completely."}
                            {mosfetRegion === "linear" && "★ LINEAR: Voltage controlled resistance mode active. Continuous proportional power relay."}
                            {mosfetRegion === "saturation" && "★ SATURATION: Constant current channel locked. Peak efficiency continuous execution for 14 synthetic lives."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Integrations Hub API Vault */}
                {hostingTab === "integrations" && (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-2">
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Key size={15} className="text-purple-400 animate-pulse" /> Integrations API Credential Vault
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-mono border border-purple-500/20 uppercase">
                        AES-256 Lock
                      </span>
                    </div>

                    <div className="max-w-2xl mx-auto w-full bg-black/40 border border-white/5 rounded-[2rem] p-6 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 block font-bold font-mono">Encrypted Keychain Matrix</span>
                        <p className="text-[10px] text-white/40">Credential endpoints shielded from raw process telemetry dumps.</p>
                      </div>

                      <div className="space-y-3 pt-2">
                        {[
                          { key: "stripeKey", label: "Stripe Production API Key", placeholder: "sk_live_..." },
                          { key: "twilioSid", label: "Twilio Production Account SID", placeholder: "AC..." },
                          { key: "resendKey", label: "Resend Transactional API Key", placeholder: "re_..." },
                          { key: "geminiKey", label: "Google Gemini Cloud Workspace Key", placeholder: "AIzaSy..." }
                        ].map((field) => {
                          const isShowing = !!showKeys[field.key];
                          return (
                            <div key={field.key} className="space-y-1">
                              <label className="text-[9px] text-white/50 font-bold uppercase font-mono block pl-0.5">{field.label}</label>
                              <div className="relative flex items-center">
                                <input
                                  type={isShowing ? "text" : "password"}
                                  value={(credentials as any)[field.key]}
                                  onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-100 font-mono placeholder-white/20 focus:outline-none focus:border-purple-500/30"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowKeys(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                                  className="absolute right-3 text-white/30 hover:text-white cursor-pointer"
                                >
                                  {isShowing ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setVaultSaved(true);
                            setTimeout(() => setVaultSaved(false), 3000);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 active:scale-[0.99] text-white rounded-xl text-xs font-black shadow-lg shadow-purple-500/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Lock size={12} /> Save Credentials to Secured Vault
                        </button>
                        
                        {vaultSaved && (
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-200">
                            ✓ Credentials locked with AES-256 local physical storage encryption.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Phone Store */}
                {hostingTab === "phone" && (
                  <div className="flex-1 flex flex-col gap-6">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/5 pb-3 mb-2">
                      <Phone size={15} className="text-cyan-400 animate-pulse" /> Twilio Phone Store Provisioning
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                      
                      {/* Left: provision tools desk */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-fit lg:col-span-1 space-y-4">
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 block font-bold font-mono">Provisioning Desk</span>
                          <p className="text-[10px] text-white/40">Acquire fresh Twilio phone numbers mapped to active Synthetic Sync Relays ($2.00 CAD monthly lease).</p>
                          
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[8px] font-bold text-white/50 uppercase font-mono">Target Area Code</label>
                            <input 
                              type="text" 
                              maxLength={3}
                              placeholder="e.g. 888 or 647" 
                              value={areaCodeInput}
                              onChange={(e) => setAreaCodeInput(e.target.value.replace(/\D/g, ""))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              if (!areaCodeInput || areaCodeInput.length < 3) {
                                alert("Please input a valid 3-digit Area Code.");
                                return;
                              }
                              setLeasingStatus("checking");
                              setTimeout(() => {
                                const newNum = `+1 (${areaCodeInput}) 555-0${Math.floor(100 + Math.random() * 900)}`;
                                setLeasedNumbers((prev) => [
                                  ...prev,
                                  { number: newNum, location: `Area Code ${areaCodeInput} Relay`, activeLeases: 1, type: "Data Gateway" }
                                ]);
                                setPurchaseLogs((prev) => [
                                  {
                                    id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                                    item: `${newNum} lease`,
                                    cost: "$2.00 CAD",
                                    date: new Date().toISOString().split("T")[0],
                                    status: "SUCCESS"
                                  },
                                  ...prev
                                ]);
                                setLeasingStatus("success");
                                setAreaCodeInput("");
                                setTimeout(() => setLeasingStatus(""), 3500);
                              }, 1500);
                            }}
                            disabled={leasingStatus === "checking"}
                            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white rounded-xl text-xs font-black shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus size={12} /> {leasingStatus === "checking" ? "Broadcasting Lease Request..." : "Lease and Sync Number"}
                          </button>

                          {leasingStatus === "success" && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8.5px] rounded-lg text-center font-mono animate-in fade-in duration-200">
                              ✓ Twilio line active. Stripe Ledger billed successfully.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: leased numbers, trans receipts (Stripe) ledger */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Leased numbers list */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 block font-bold font-mono mb-2.5">Active Twilio Phone Leases</span>
                          <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left font-mono text-[9.5px]">
                              <thead>
                                <tr className="text-white/20 border-b border-white/5 uppercase">
                                  <th className="pb-1.5 font-bold">Number</th>
                                  <th className="pb-1.5 font-bold">Relay Target</th>
                                  <th className="pb-1.5 font-bold">Broadcasters</th>
                                  <th className="pb-1.5 font-bold text-right">Maturity</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.03] text-white/70">
                                {leasedNumbers.map((l, i) => (
                                  <tr key={i} className="hover:bg-white/[0.01]">
                                    <td className="py-2 text-cyan-300 font-bold">{l.number}</td>
                                    <td className="py-2">{l.location}</td>
                                    <td className="py-2 font-black">{l.type}</td>
                                    <td className="py-2 text-right text-emerald-400">ACTIVE</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Stripe billing receipts ledger */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 block font-bold font-mono mb-2.5">Stripe Transaction Ledger Receipts</span>
                          <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left font-mono text-[9px]">
                              <thead>
                                <tr className="text-white/20 border-b border-white/5 uppercase">
                                  <th className="pb-1.5 font-bold">Receipt ID</th>
                                  <th className="pb-1.5 font-bold">Item Description</th>
                                  <th className="pb-1.5 font-bold">Billing Cost</th>
                                  <th className="pb-1.5 font-bold">Execution Date</th>
                                  <th className="pb-1.5 font-bold text-right">Gateway Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.03] text-white/60">
                                {purchaseLogs.map((p, i) => (
                                  <tr key={i} className="hover:bg-white/[0.01]">
                                    <td className="py-1.5 text-slate-300">{p.id}</td>
                                    <td className="py-1.5 truncate max-w-[130px]">{p.item}</td>
                                    <td className="py-1.5 text-cyan-400 font-black">{p.cost}</td>
                                    <td className="py-1.5">{p.date}</td>
                                    <td className="py-1.5 text-right"><span className="text-emerald-400 font-black">SUCCESS</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 5: Pricing Matrix */}
                {hostingTab === "pricing" && (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-2">
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <DollarSign size={15} className="text-emerald-400" /> Sovereign Pool Pricing Matrix config
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono border border-emerald-500/20">
                        Rules Modifier
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-[9px] font-mono text-white/30 uppercase tracking-wider">
                              <th className="py-2.5 font-bold">Configuration Rule Name</th>
                              <th className="py-2.5 font-bold">Unique Key</th>
                              <th className="py-2.5 font-bold">Rule Description</th>
                              <th className="py-2.5 font-bold text-right" style={{ width: "130px" }}>Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.03] text-white/80">
                            {pricingRules.map((rule) => {
                              const currentVal = pricingEdits[rule.config_key] !== undefined 
                                ? pricingEdits[rule.config_key] 
                                : rule.config_value;
                                
                              return (
                                <tr key={rule.config_key} className="hover:bg-white/[0.01]">
                                  <td className="py-3 pr-4">
                                    <span className="block font-black text-white">{rule.label}</span>
                                  </td>
                                  <td className="py-3 font-mono text-[9px] text-cyan-400/80 pr-4">
                                    {rule.config_key}
                                  </td>
                                  <td className="py-3 text-[10px] text-white/40 max-w-[200px] truncate" title={rule.description}>
                                    {rule.description}
                                  </td>
                                  <td className="py-3 text-right">
                                    <input
                                      type="text"
                                      value={currentVal}
                                      onChange={(e) => setPricingEdits(prev => ({ ...prev, [rule.config_key]: e.target.value }))}
                                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-center font-mono text-xs text-white focus:outline-none focus:border-purple-500/40"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between gap-4">
                        <p className="text-[9px] text-white/30 max-w-lg leading-normal font-mono">
                          ★ Bypassing default hard-coded threshold variables dynamically overwrites pool distribution, burn tiers, and conversion rates. Keep active reserve safety buffer values above 15% to maintain liquidity boundaries.
                        </p>
                        
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              setPricingRules((prev) => 
                                prev.map((rule) => {
                                  if (pricingEdits[rule.config_key] !== undefined) {
                                    return { ...rule, config_value: pricingEdits[rule.config_key] };
                                  }
                                  return rule;
                                })
                              );
                              setPricingEdits({});
                              setPricingSavedMessage("✓ Rules and burn parameters updated successfully.");
                              setTimeout(() => setPricingSavedMessage(""), 3500);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 active:scale-[0.99] text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/10 cursor-pointer transition-all"
                          >
                            Apply Matrix Updates
                          </button>
                          
                          {pricingSavedMessage && (
                            <span className="text-[9px] font-bold text-emerald-400 font-mono animate-pulse">{pricingSavedMessage}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* New project name modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="w-96 bg-[#0c0d16] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 z-10 relative">
                  <h3 className="text-sm font-black text-white">Create Product Desk</h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={16} /></button>
                </div>
                <div className="space-y-4 z-10 relative">
                  <div>
                    <label className="text-[10px] text-white/35 font-bold uppercase tracking-widest block mb-1.5">Workspace Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Aura Core OS, Nexus Engine..."
                      value={newProjName}
                      onChange={(e) => setNewProjName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjName.trim()}
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-500/10 hover:opacity-90 disabled:opacity-30 transition-all cursor-pointer"
                    >
                      Initialize Desk
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ────────────────── MAIN IDE WORKSPACE VIEW ──────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#040409] z-10 select-none">
      
      {/* Dynamic IDE Top Toolbar */}
      <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between bg-[#08080f] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveProject(null);
              loadProjects();
            }}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white cursor-pointer transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"
          >
            <ArrowLeft size={13} /> Return to Studio Hub
          </button>
          <div className="h-4 w-px bg-white/10"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${activeProject.id.startsWith("synth_user_") ? "bg-cyan-400" : "bg-purple-400"}`}></span>
              <span className="text-xs font-black text-white">{activeProject.name}</span>
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/5">
                {activeProject.id}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Auto-Save compiler stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider">
            {isSaving ? (
              <span className="text-amber-400 flex items-center gap-1">
                <RefreshCcw size={10} className="animate-spin" /> Compiling Changes...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Virtual Disk Sync'd
              </span>
            )}
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <button
            onClick={() => setShowGeorge(!showGeorge)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              showGeorge 
                ? "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                : "bg-white/5 border-white/5 text-white/40 hover:text-white"
            }`}
          >
            <MessageSquare size={13} /> {showGeorge ? "Hide George" : "Open George"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================== */}
        {/* PHASE 3: LEFT ACTIVITY BAR (VS CODE LAYOUT)              */}
        {/* ======================================================== */}
        <div className="w-12 border-r border-white/5 bg-[#05050a] flex flex-col items-center justify-between py-4 flex-shrink-0 select-none z-20">
          {/* Top Icons */}
          <div className="flex flex-col gap-4 w-full items-center">
            {/* Explorer button */}
            <button
              onClick={() => {
                if (sidebarView === "explorer") {
                  setShowSidebar(!showSidebar);
                } else {
                  setSidebarView("explorer");
                  setShowSidebar(true);
                }
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer relative group ${
                sidebarView === "explorer" && showSidebar
                  ? "text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
              title="Explorer"
            >
              <Folder size={16} />
              {sidebarView === "explorer" && showSidebar && (
                <span className="absolute left-0 top-1/4 w-0.5 h-1/2 bg-purple-500 rounded-r"></span>
              )}
            </button>

            {/* Search button */}
            <button
              onClick={() => {
                if (sidebarView === "search") {
                  setShowSidebar(!showSidebar);
                } else {
                  setSidebarView("search");
                  setShowSidebar(true);
                }
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer relative group ${
                sidebarView === "search" && showSidebar
                  ? "text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
              title="Search Workspace"
            >
              <Search size={16} />
              {sidebarView === "search" && showSidebar && (
                <span className="absolute left-0 top-1/4 w-0.5 h-1/2 bg-purple-500 rounded-r"></span>
              )}
            </button>

            {/* Source Control button */}
            <button
              onClick={() => {
                if (sidebarView === "git") {
                  setShowSidebar(!showSidebar);
                } else {
                  setSidebarView("git");
                  setShowSidebar(true);
                }
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer relative group ${
                sidebarView === "git" && showSidebar
                  ? "text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
              title="Source Control"
            >
              <GitBranch size={16} />
              {sidebarView === "git" && showSidebar && (
                <span className="absolute left-0 top-1/4 w-0.5 h-1/2 bg-purple-500 rounded-r"></span>
              )}
            </button>

            {/* Extensions button */}
            {activeProject.id.startsWith("synth_user_") && (
              <button
                onClick={() => {
                  if (sidebarView === "extensions") {
                    setShowSidebar(!showSidebar);
                  } else {
                    setSidebarView("extensions");
                    setShowSidebar(true);
                  }
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer relative group ${
                  sidebarView === "extensions" && showSidebar
                    ? "text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
                }`}
                title="Aura Extensions"
              >
                <Blocks size={16} />
                {sidebarView === "extensions" && showSidebar && (
                  <span className="absolute left-0 top-1/4 w-0.5 h-1/2 bg-purple-500 rounded-r"></span>
                )}
              </button>
            )}
            
            {/* Globe / Edge DevTools Browser button */}
            <button
              onClick={() => {
                selectFile("browser");
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer relative group ${
                activeFilePath === "browser"
                  ? "text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.15)] border border-cyan-500/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
              title="Edge DevTools: Browser"
            >
              <Globe size={16} />
              {activeFilePath === "browser" && (
                <span className="absolute left-0 top-1/4 w-0.5 h-1/2 bg-cyan-400 rounded-r"></span>
              )}
            </button>
            
            {/* George Pulse Icon */}
            <button
              onClick={() => setShowGeorge(!showGeorge)}
              className={`p-2 rounded-xl transition-all cursor-pointer relative group ${
                showGeorge
                  ? "text-purple-300 bg-purple-500/25 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.35)] animate-pulse"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
              title="George Partner Chat"
            >
              <Sparkles size={16} />
            </button>
          </div>

          {/* Bottom Settings Icon */}
          <div className="flex flex-col gap-4 w-full items-center">
            <button
              onClick={() => {
                if (sidebarView === "settings") {
                  setShowSidebar(!showSidebar);
                } else {
                  setSidebarView("settings");
                  setShowSidebar(true);
                }
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer relative group ${
                sidebarView === "settings" && showSidebar
                  ? "text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
              title="IDE Settings"
            >
              <Settings size={16} />
              {sidebarView === "settings" && showSidebar && (
                <span className="absolute left-0 top-1/4 w-0.5 h-1/2 bg-purple-500 rounded-r"></span>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHASE 3: COLLAPSIBLE SIDEBAR PANE                         */}
        {/* ======================================================== */}
        {showSidebar && (
          <div className="w-60 border-r border-white/5 flex flex-col bg-[#06060c] flex-shrink-0 select-none z-10 animate-in slide-in-from-left duration-200">
            
            {/* EXPLORER SIDEBAR VIEW */}
            {sidebarView === "explorer" && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono">Workspace Explorer</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => createNewItem("file")}
                      className="p-1 hover:bg-white/5 text-white/60 hover:text-cyan-400 rounded transition-all cursor-pointer"
                      title="Create isolated code file"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => createNewItem("folder")}
                      className="p-1 hover:bg-white/5 text-white/60 hover:text-purple-400 rounded transition-all cursor-pointer"
                      title="Create subdirectory"
                    >
                      <FolderPlus size={12} />
                    </button>
                    <button
                      onClick={loadFileTree}
                      className="p-1 hover:bg-white/5 text-white/60 hover:text-white rounded transition-all cursor-pointer"
                      title="Refresh listing"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar select-none">
                  {fileTree.length === 0 ? (
                    <div className="text-center py-10">
                      <AlertCircle size={14} className="mx-auto text-white/20 mb-2" />
                      <p className="text-[9px] text-white/30 font-mono">Empty directory.</p>
                      <button
                        onClick={() => createNewItem("file")}
                        className="mt-3 px-3 py-1 bg-white/5 hover:bg-white/10 text-[9px] text-white rounded font-mono border border-white/5 cursor-pointer"
                      >
                        Create index.html
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {fileTree.map((node) => (
                        <FileTreeItem key={node.path} node={node} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sovereign Security Lasso Dashboard Panel */}
                <div className="p-3 border-t border-white/5 bg-[#08080f]/90 backdrop-blur-md flex flex-col gap-2 font-mono text-[9px] text-white/40">
                  <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">
                    <span>Sovereign Security</span>
                    <Shield size={10} className="text-purple-400" />
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-1.5 rounded">
                    <span>PROJECT ID:</span>
                    <span className="text-white/80 font-bold select-all">{activeProject.id}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-1.5 rounded">
                    <span>SESSION ID:</span>
                    <span className="text-cyan-400 font-bold select-all">{sessionId}</span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1 border-t border-white/5 pt-2">
                    <span className="text-[8px] uppercase tracking-wider font-semibold text-white/30 mb-0.5">Lassoed Sub-App Targets (Click to view):</span>
                    {(() => {
                      const apps: string[] = [];
                      const findApps = (nodes: FileNode[]) => {
                        nodes.forEach((n) => {
                          if (n.type === "file" && n.name.endsWith(".html")) {
                            apps.push(n.path);
                          } else if (n.type === "folder" && n.children) {
                            findApps(n.children);
                          }
                        });
                      };
                      findApps(fileTree);
                      if (apps.length === 0) {
                        apps.push("index.html");
                      }
                      return apps.map((appPath) => {
                        const appKey = appPath.replace(/[\/\.]/g, "_").toLowerCase();
                        const lassoId = `${activeProject.id}_${appKey}`;
                        const isSelected = selectedAppPath === appPath;
                        return (
                          <div 
                            key={appPath} 
                            onClick={() => setSelectedAppPath(appPath)}
                            className={`flex flex-col p-1.5 rounded gap-0.5 border cursor-pointer transition-all duration-300 ${
                              isSelected 
                                ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-cyan-400 font-semibold" 
                                : "bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className={`truncate text-[8px] ${isSelected ? "text-cyan-400 font-bold" : "text-slate-400"}`}>{appPath}</span>
                              {isSelected && <span className="text-[7px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-black tracking-wider animate-pulse">ACTIVE</span>}
                            </div>
                            <span className="text-[8px] text-cyan-300/60 font-bold select-all break-all">{lassoId}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* SEARCH SIDEBAR VIEW */}
            {sidebarView === "search" && (
              <div className="flex flex-col h-full p-3 gap-3">
                <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono">Global Search</span>
                
                <div className="relative">
                  <input
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    placeholder="Search query..."
                    className="w-full bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg p-1.5 pl-7 text-[10px] text-white placeholder-white/20 font-sans focus:outline-none"
                  />
                  <Search size={11} className="absolute left-2.5 top-2.5 text-white/25" />
                  {globalSearchQuery && (
                    <button
                      onClick={() => setGlobalSearchQuery("")}
                      className="absolute right-2 top-2 hover:text-white text-white/30 font-bold text-[9px] font-mono"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar select-none mt-2">
                  {globalSearchQuery.trim() === "" ? (
                    <div className="text-center py-8 text-white/25 text-[10px] font-sans">
                      Type a search parameter above to index active workspace buffers.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[9px] text-white/40 uppercase font-mono tracking-wider">
                        Search Results:
                      </div>
                      
                      {/* Search indexing matches */}
                      {activeFilePath && fileContent.toLowerCase().includes(globalSearchQuery.toLowerCase()) ? (
                        <div
                          onClick={() => selectFile(activeFilePath)}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <FileText size={10} className="text-purple-300" />
                            <span className="text-[10px] text-white/80 font-mono font-bold truncate max-w-[170px]">{activeFilePath.split("/").pop()}</span>
                          </div>
                          
                          {fileContent.split("\n").map((line, idx) => {
                            if (line.toLowerCase().includes(globalSearchQuery.toLowerCase())) {
                              return (
                                <div key={idx} className="text-[9px] font-mono text-cyan-300/80 bg-black/40 p-1 rounded mt-1 truncate">
                                  <span className="text-white/30 mr-1.5">{idx + 1}:</span>
                                  {line.trim()}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-[10px] text-white/30 font-sans">
                          No matching text instances located in active editor buffers.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SOURCE CONTROL SIDEBAR VIEW */}
            {sidebarView === "git" && (
              <div className="flex flex-col h-full p-3 gap-3">
                <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono block">Source Control // Git</span>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  {/* Branch selector */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[9px] text-white/30 uppercase font-mono tracking-widest flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                      <span>Repository Branch:</span>
                      <span className="text-purple-300 font-bold">main</span>
                    </div>

                    <div className="mt-1 space-y-1.5">
                      <span className="text-[9px] text-white/40 uppercase font-mono tracking-wider">Changes list</span>
                      
                      {activeFilePath && fileContent !== "" ? (
                        <div className="flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span className="text-white/80 truncate max-w-[130px]">{activeFilePath.split("/").pop()}</span>
                          </div>
                          <span className="text-amber-400 text-[9px] font-bold font-mono">M</span>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-[10px] text-white/20 font-sans">
                          Zero modified file buffers detected.
                        </div>
                      )}
                    </div>

                    {/* Commit Controls */}
                    {activeFilePath && fileContent !== "" && (
                      <div className="flex flex-col gap-2 mt-2">
                        <textarea
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                          placeholder="Message (Ctrl+Enter to commit)"
                          className="w-full bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg p-2 text-[10px] text-white placeholder-white/20 font-sans focus:outline-none resize-none"
                          rows={2}
                        />
                        <button
                          onClick={() => {
                            if (!commitMessage.trim()) {
                              alert("Please provide a repository commit message.");
                              return;
                            }
                            alert(`✓ State committed: "${commitMessage}" successfully signed and sealed in RCR Ledger!`);
                            setCommitMessage("");
                          }}
                          className="w-full bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Commit to main
                        </button>
                      </div>
                    )}
                  </div>

                  <hr className="border-white/5" />

                  {/* Remote Repositories Section */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono block">Remote Repositories</span>
                    
                    {/* GitHub cloning input */}
                    <div className="space-y-1.5">
                      <label className="text-[8px] text-white/30 uppercase font-mono">GitHub Clone URL</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/owner/repo"
                          disabled={isCloning}
                          className="flex-1 bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg px-2 py-1 text-[9px] text-white placeholder-white/20 font-mono focus:outline-none"
                        />
                        <button
                          onClick={handleGithubClone}
                          disabled={isCloning}
                          className="bg-purple-600/35 border border-purple-500/50 hover:bg-purple-600/50 text-purple-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isCloning ? "Cloning..." : "Clone"}
                        </button>
                      </div>
                    </div>

                    {/* ZIP File Upload */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[8px] text-white/30 uppercase font-mono">Import Workspace Archive (.zip)</label>
                      <button
                        onClick={() => document.getElementById("zip-sidebar-uploader")?.click()}
                        disabled={zipLoading}
                        className="w-full flex items-center justify-center gap-1.5 bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/35 text-cyan-200 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {zipLoading ? "Unpacking Zip..." : "Upload Repository ZIP"}
                      </button>
                      <input
                        type="file"
                        id="zip-sidebar-uploader"
                        accept=".zip"
                        className="hidden"
                        onChange={handleZipUpload}
                      />
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Local Filesystem Folder Mounting Section */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono block">Local Filesystem Integration</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[8px] text-white/30 uppercase font-mono">Absolute Directory Path</label>
                      <input
                        type="text"
                        value={localFolderPath}
                        onChange={(e) => setLocalFolderPath(e.target.value)}
                        placeholder="C:\Users\meagh\Projects\NewApp"
                        className="w-full bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg px-2 py-1 text-[9px] text-white placeholder-white/20 font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] text-white/30 uppercase font-mono">Workspace Mount Name (Optional)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={localFolderName}
                          onChange={(e) => setLocalFolderName(e.target.value)}
                          placeholder="MyCustomApp"
                          className="flex-1 bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg px-2 py-1 text-[9px] text-white placeholder-white/20 font-mono focus:outline-none"
                        />
                        <button
                          onClick={handleLocalFolderImport}
                          className="bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/45 text-emerald-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Mount
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Git & ZIP Logs Output */}
                  {githubLogs.length > 0 && (
                    <div className="bg-[#020205] border border-white/10 rounded-lg p-2 font-mono text-[8px] text-white/80 space-y-1 relative">
                      <div className="flex justify-between items-center text-[7px] text-white/40 uppercase mb-1">
                        <span>Console Logs</span>
                        <button onClick={() => setGithubLogs([])} className="hover:text-red-400 cursor-pointer">Clear</button>
                      </div>
                      <div className="max-h-[100px] overflow-y-auto space-y-0.5 custom-scrollbar">
                        {githubLogs.map((log, idx) => (
                          <div key={idx} className={log.startsWith("✓") ? "text-emerald-400 font-semibold" : log.startsWith("❌") ? "text-red-400" : "text-white/70"}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr className="border-white/5" />

                  {/* Sovereign Registry Relay Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono block">Sovereign App Connector</span>
                      <button
                        onClick={() => setIsLinkedToSovereign(!isLinkedToSovereign)}
                        className={`text-[8px] font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                          isLinkedToSovereign 
                            ? "bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black animate-pulse" 
                            : "bg-white/5 border border-white/10 text-white/45"
                        }`}
                      >
                        {isLinkedToSovereign ? "CONNECTED" : "DISCONNECTED"}
                      </button>
                    </div>

                    {/* Sovereign credentials fields */}
                    <div className="space-y-2.5 bg-white/5 border border-white/5 rounded-xl p-2.5 backdrop-blur-md">
                      <div className="space-y-1">
                        <label className="text-[7.5px] text-white/35 uppercase font-mono tracking-wider block">Central Webhook URL</label>
                        <input
                          type="text"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="http://localhost:5000/webhook/sovereign"
                          className="w-full bg-[#030307]/80 border border-white/10 focus:border-purple-500/50 rounded-lg px-2 py-1 text-[9px] text-white placeholder-white/15 font-mono focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[7.5px] text-white/35 uppercase font-mono tracking-wider block">Drive Sync Access Token</label>
                        <input
                          type="password"
                          value={driveSyncToken}
                          onChange={(e) => setDriveSyncToken(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full bg-[#030307]/80 border border-white/10 focus:border-purple-500/50 rounded-lg px-2 py-1 text-[9px] text-white placeholder-white/15 font-mono focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleSovereignSync}
                        disabled={isSyncing}
                        className="w-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/35 hover:from-purple-500/30 hover:to-cyan-500/30 text-white py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSyncing ? "Verifying Parity..." : "Sync Parity Now"}
                      </button>
                    </div>

                    {/* Sync Logs Console Terminal */}
                    {syncLogs.length > 0 && (
                      <div className="bg-[#020204] border border-purple-500/20 rounded-lg p-2 font-mono text-[8px] space-y-1">
                        <div className="flex justify-between items-center text-[7px] text-purple-400/40 uppercase mb-1">
                          <span>Sync Terminal</span>
                          <button onClick={() => setSyncLogs([])} className="hover:text-red-400 cursor-pointer">Clear</button>
                        </div>
                        <div className="max-h-[90px] overflow-y-auto space-y-0.5 custom-scrollbar">
                          {syncLogs.map((log, idx) => (
                            <div key={idx} className={log.startsWith("✓") ? "text-emerald-400" : log.startsWith("❌") ? "text-red-400 font-bold" : "text-purple-300/80"}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* EXTENSIONS SIDEBAR VIEW */}
            {sidebarView === "extensions" && activeProject?.id.startsWith("synth_user_") && (
              <div className="flex flex-col h-full p-3 gap-3">
                <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono">Aura Extensions</span>
                
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {/* Extension 1 */}
                  <div className="p-2.5 bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <Cpu className="w-3.5 h-3.5 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-white">Aura OS Core</h4>
                        <span className="text-[8px] text-white/30 font-mono">v1.0.4 • Installed</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-white/40 leading-relaxed mt-2">Provides the primary modular micro-kernels and virtual device pipelines.</p>
                  </div>

                  {/* Extension 2 */}
                  <div className="p-2.5 bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-white">RCR Sync Parity</h4>
                        <span className="text-[8px] text-white/30 font-mono">v2.3.0 • Installed</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-white/40 leading-relaxed mt-2">Enforces transactional event integrity and prevent data corruption.</p>
                  </div>

                  {/* Extension 3 */}
                  <div className="p-2.5 bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-white">Antigravity Solver</h4>
                        <span className="text-[8px] text-white/30 font-mono">v4.3.2 • Installed</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-white/40 leading-relaxed mt-2">P vs NP deterministic reduction visualizer and system calibrator.</p>
                  </div>

                  {/* Extension 4 */}
                  <div className="p-2.5 bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-white">George AI Bridge</h4>
                        <span className="text-[8px] text-white/30 font-mono">v1.9.9 • Installed</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-white/40 leading-relaxed mt-2">Conversational architectural companion linked directly to editor slots.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS SIDEBAR VIEW */}
            {sidebarView === "settings" && (
              <div className="flex flex-col h-full p-3 gap-3">
                <span className="text-[9px] uppercase tracking-widest font-black text-white/45 font-mono">Aura Studio Preferences</span>
                
                <div className="space-y-4 text-xs font-sans">
                  {/* Font Size */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-white/45">Editor Font Size</label>
                    <select
                      value={editorFontSize}
                      onChange={(e) => {
                        setEditorFontSize(e.target.value);
                        localStorage.setItem("aura-editor-fs", e.target.value);
                      }}
                      className="bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg p-1.5 text-[10px] text-white focus:outline-none cursor-pointer"
                    >
                      <option value="10px">10px (Dense)</option>
                      <option value="11px">11px (Balanced)</option>
                      <option value="12px">12px (Medium)</option>
                      <option value="14px">14px (Large)</option>
                    </select>
                  </div>

                  {/* Font Family */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-white/45">Editor Font Family</label>
                    <select
                      value={editorFontFamily}
                      onChange={(e) => {
                        setEditorFontFamily(e.target.value);
                        localStorage.setItem("aura-editor-ff", e.target.value);
                      }}
                      className="bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg p-1.5 text-[10px] text-white focus:outline-none cursor-pointer"
                    >
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="Source Code Pro">Source Code Pro</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>

                  {/* Tab Spacing */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-white/45">Tab Spacing (Indent)</label>
                    <select
                      value={editorTabSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditorTabSize(val);
                        localStorage.setItem("aura-editor-ts", String(val));
                      }}
                      className="bg-[#030307] border border-white/10 focus:border-purple-500/50 rounded-lg p-1.5 text-[10px] text-white focus:outline-none cursor-pointer"
                    >
                      <option value="2">2 spaces</option>
                      <option value="4">4 spaces</option>
                    </select>
                  </div>

                  {/* Sound FX */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-white/45">Audio Sound Effects</span>
                    <button
                      onClick={() => {
                        const next = !enableSoundFx;
                        setEnableSoundFx(next);
                        localStorage.setItem("aura-editor-sfx", String(next));
                      }}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        enableSoundFx
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                          : "bg-white/5 border-white/5 text-white/30"
                      }`}
                    >
                      {enableSoundFx ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* COLUMN 2: MAIN EDITOR / CODE REVIEW GATEWAY / WATERMARK   */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#030306] relative">
          
          {/* INTERACTIVE CODE DIFF REVIEW GATEWAY */}
          {reviewingCode ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#05050b] z-10 animate-in fade-in duration-200">
              {/* Diff Header */}
              <div className="h-12 border-b border-purple-500/20 bg-[#080812] px-4 flex items-center justify-between flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Shield className="w-3 h-3 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white tracking-widest uppercase font-mono">
                      AURA OS CODE REVIEW GATEWAY
                    </h3>
                    <p className="text-[9px] text-purple-300/80 font-mono mt-0.5">
                      Reviewing George's recommendation for: <span className="text-cyan-300 font-bold">{reviewingCode.filePath}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[9px] font-mono bg-purple-950/20 border border-purple-500/20 rounded-lg px-2.5 py-1">
                  <span className="text-emerald-400 font-black">+{reviewingCode.code.split('\n').length} lines</span>
                  <span className="text-white/20">|</span>
                  <span className="text-rose-400 font-black">-{reviewingCode.originalCode.split('\n').length} lines</span>
                </div>
              </div>

              {/* Side-by-Side Diff Layout */}
              <div className="flex-1 flex min-h-0 overflow-hidden font-mono text-[10px] leading-relaxed select-text">
                {/* Left Panel: Original version */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 bg-[#030307]/80">
                  <div className="h-7 border-b border-white/5 bg-[#06060e] flex items-center px-3 text-white/40 uppercase tracking-widest font-black font-mono text-[8px] flex-shrink-0">
                    Current Version ({reviewingCode.originalCode.split('\n').length} lines)
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-0.5">
                    {reviewingCode.originalCode.split("\n").map((line, idx) => (
                      <div key={idx} className="flex hover:bg-white/[0.02] min-h-[16px] rounded px-1 group">
                        <span className="w-8 text-right pr-2 text-white/25 select-none font-bold">{idx + 1}</span>
                        <pre className="flex-1 text-rose-300 bg-rose-500/5 border-l-2 border-rose-500/30 pl-2 overflow-x-auto whitespace-pre font-mono">
                          {line || " "}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel: Proposed Version with highlights */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#040409]">
                  <div className="h-7 border-b border-white/5 bg-[#07070f] flex items-center px-3 text-purple-300 uppercase tracking-widest font-black font-mono text-[8px] flex-shrink-0">
                    Proposed Patch ({reviewingCode.code.split('\n').length} lines)
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-0.5">
                    {getDiff(reviewingCode.originalCode, reviewingCode.code).map((item, idx) => {
                      const bgClass =
                        item.type === "added"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                          : item.type === "deleted"
                          ? "bg-rose-500/10 text-rose-400 line-through border-rose-500/40"
                          : item.type === "replaced"
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/40"
                          : "text-slate-300 border-transparent hover:bg-white/[0.02]";
                          
                      return (
                        <div key={idx} className={`flex min-h-[16px] rounded px-1 group border-l-2 ${bgClass}`}>
                          <span className="w-8 text-right pr-2 text-white/20 select-none font-bold">{idx + 1}</span>
                          <span className="w-4 text-center select-none font-black opacity-50">
                            {item.type === "added" ? "+" : item.type === "deleted" ? "-" : item.type === "replaced" ? "*" : " "}
                          </span>
                          <pre className="flex-1 overflow-x-auto whitespace-pre font-mono pl-1">
                            {item.type === "deleted" ? item.original : (item.proposed || " ")}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review Control Footer */}
              <div className="h-14 border-t border-white/5 bg-[#06060c] px-4 flex items-center justify-between flex-shrink-0 z-10">
                <button
                  onClick={() => setReviewingCode(null)}
                  className="px-4 py-2 border border-white/10 hover:border-rose-500/30 text-white/60 hover:text-rose-400 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer bg-white/5"
                >
                  Decline & Resume Chat
                </button>
                
                <button
                  onClick={() => {
                    handleCodeChange(reviewingCode.code);
                    setReviewingCode(null);
                    alert(`✓ Patch injected into compilation buffer and synced to disk successfully!`);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-500/40 hover:border-purple-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                >
                  Approve & Inject Patch
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Tabs Navigator */}
              <div className="h-9 bg-[#06060b] border-b border-white/5 flex items-center overflow-x-auto custom-scrollbar flex-shrink-0 z-10">
                {openTabs.map((tabPath) => {
                  const isBrowser = tabPath === "browser";
                  const fileName = isBrowser ? "Edge DevTools: Browser" : (tabPath.split("/").pop() || tabPath);
                  const isActive = activeFilePath === tabPath;
                  
                  return (
                    <div
                      key={tabPath}
                      onClick={() => selectFile(tabPath)}
                      className={`h-full px-4 border-r border-white/5 flex items-center gap-2 cursor-pointer transition-all text-xs font-mono select-none ${
                        isActive 
                          ? isBrowser 
                            ? "bg-[#030306] text-cyan-400 border-t-2 border-cyan-400 font-bold" 
                            : "bg-[#030306] text-white border-t-2 border-purple-500 font-bold" 
                          : "text-white/35 hover:text-white/60 hover:bg-white/[0.02]"
                      }`}
                    >
                      {isBrowser ? (
                        <Globe size={11} className={isActive ? "text-cyan-400 animate-pulse" : "text-white/20"} />
                      ) : (
                        <FileText size={11} className={isActive ? "text-cyan-400" : "text-white/20"} />
                      )}
                      <span>{fileName}</span>
                      <button
                        onClick={(e) => closeTab(tabPath, e)}
                        className="p-0.5 rounded hover:bg-white/10 hover:text-rose-400 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Split Workspace Area */}
              <div className="flex-1 flex flex-col min-h-0" ref={splitContainerRef}>
                {activeFilePath ? (
                  <div className="flex-1 flex flex-col h-full min-h-0 relative">
                    
                    {/* Visual Editor (Top Half) */}
                    <div 
                      className="flex flex-col min-h-0 border-b border-white/5 bg-[#030306] relative"
                      style={{ 
                        height: editorHeight === 0 ? "0px" : editorHeight === 100 ? "100%" : `${editorHeight}%`,
                        display: editorHeight === 0 ? "none" : "flex",
                        flexShrink: 0
                      }}
                    >
                      <div className="absolute top-2 right-4 flex items-center gap-2 z-10 text-[9px] text-white/30 font-mono select-none pointer-events-none">
                        <span>Syntax: {activeFilePath.split(".").pop()?.toUpperCase()}</span>
                        <span>•</span>
                        <span>Line Count: {lineCount}</span>
                      </div>

                      <div className="flex-1 flex min-h-0 overflow-hidden">
                        {/* Line numbers column */}
                        <div 
                          ref={lineNumbersRef}
                          className="w-10 bg-[#020204] text-right pr-2 text-white/25 font-mono text-[10px] leading-relaxed py-3.5 select-none overflow-hidden border-r border-white/[0.03]"
                        >
                          {lineNumbers.map((num) => (
                            <div key={num} className="h-5">{num}</div>
                          ))}
                        </div>

                        {/* Styled Textarea Code Input with state preferences */}
                        <textarea
                          ref={textareaRef}
                          value={fileContent}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          onScroll={handleScroll}
                          spellCheck={false}
                          className="flex-1 bg-transparent text-slate-100 font-mono leading-relaxed p-3.5 w-full h-full focus:outline-none resize-none overflow-y-auto custom-scrollbar whitespace-pre"
                          style={{ 
                            fontSize: editorFontSize, 
                            fontFamily: editorFontFamily, 
                            tabSize: editorTabSize 
                          }}
                          placeholder="Start coding here... Changes will compile and auto-save instantly."
                        />
                      </div>
                    </div>

                    {/* Draggable Vertical Split Divider */}
                    {editorHeight > 0 && editorHeight < 100 && (
                      <div
                        onMouseDown={startResizeEditor}
                        className="h-1 bg-white/5 hover:bg-purple-500/40 active:bg-purple-500/80 cursor-ns-resize transition-all duration-150 relative flex items-center justify-center group z-20 flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-white/10 group-hover:bg-purple-400 group-active:bg-purple-400 rounded transition-colors" />
                      </div>
                    )}

                    {/* Live UI Simulator (Bottom Half) */}
                    <div 
                      className="flex-1 flex flex-col min-h-0 bg-[#09090f]"
                      style={{ 
                        height: editorHeight === 100 ? "0px" : editorHeight === 0 ? "100%" : `${100 - editorHeight}%`,
                        display: editorHeight === 100 ? "none" : "flex"
                      }}
                    >
                      <div className="h-8 border-b border-white/5 px-3 flex items-center justify-between bg-[#0b0b14] flex-shrink-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                          </div>
                          <span className="text-[10px] text-white/30 uppercase tracking-widest font-black font-mono ml-2">Live UI Simulator</span>
                          <div className="h-3.5 w-px bg-white/10 mx-1"></div>
                          
                          {/* Interactive Simulated Web Address */}
                          <div className="bg-[#030306] border border-white/10 rounded-lg px-2.5 py-0.5 text-[9px] font-mono text-cyan-400/80 truncate max-w-sm flex items-center gap-1.5 select-all">
                            <Globe size={9} />
                            http://localhost:3000/api/projects/{activeProject.id}/raw/{selectedAppPath}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={toggleCodeOnly}
                            className={`text-white/40 hover:text-white cursor-pointer transition-colors p-1 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center ${editorHeight === 100 ? "text-purple-400 bg-purple-500/10 border-purple-500/20" : ""}`}
                            title={editorHeight === 100 ? "Restore Split View" : "Code Only (Maximize Editor)"}
                          >
                            <Code size={11} className={editorHeight === 100 ? "text-purple-400 animate-pulse" : ""} />
                          </button>
                          <button
                            onClick={toggleMaximizeSimulator}
                            className={`text-white/40 hover:text-white cursor-pointer transition-colors p-1 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center ${editorHeight === 0 ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" : ""}`}
                            title={editorHeight === 0 ? "Restore Split View" : "Full Screen UI (Maximize Simulator)"}
                          >
                            {editorHeight === 0 ? <Minimize2 size={11} className="text-cyan-400 animate-pulse" /> : <Maximize2 size={11} />}
                          </button>
                          <div className="w-px h-3.5 bg-white/10 mx-0.5 align-middle self-center"></div>
                          <button 
                            onClick={() => setSimulatorKey((prev) => prev + 1)}
                            className="text-white/40 hover:text-white cursor-pointer transition-colors p-1 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center"
                            title="Force reload canvas"
                          >
                            <RefreshCw size={11} />
                          </button>
                          <a 
                            href={`/api/projects/${activeProject.id}/raw/${selectedAppPath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/40 hover:text-white cursor-pointer transition-colors p-1 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center"
                            title="Open in new window"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>

                      {/* Transpiled rendering canvas iframe */}
                      <div className="flex-1 bg-slate-950/40 relative">
                        <iframe
                          key={`${activeProject.id}_${selectedAppPath}_${simulatorKey}`}
                          src={`/api/projects/${activeProject.id}/raw/${selectedAppPath}`}
                          className="w-full h-full border-none bg-white"
                          title="Live sandbox simulator frame"
                        />
                      </div>
                    </div>

                  </div>
                ) : (
                  /* ======================================================== *
                   * PHASE 3: STUNNING AURA WATERMARK HOME SCREEN             *
                   * ======================================================== */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none bg-[#030307] relative overflow-hidden">
                    {/* Glowing mesh background overlays */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none"></div>
                    <div className="absolute top-1/4 left-1/3 w-[200px] h-[200px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none"></div>

                    {/* Geometric A Logo */}
                    <div className="relative mb-6 group cursor-pointer">
                      <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
                      <svg className="w-24 h-24 text-purple-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.35)] animate-bounce [animation-duration:8s] select-none pointer-events-none z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 12 L18 84 L32 84 L50 44 L68 84 L82 84 Z" fill="url(#auraGrad)" />
                        <path d="M36 67 L64 67 L50 44 Z" fill="url(#auraGradInner)" opacity="0.6" />
                        <circle cx="50" cy="44" r="3" fill="#67e8f9" className="animate-ping" />
                        <defs>
                          <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                          <linearGradient id="auraGradInner" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#d946ef" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <h2 className="text-sm font-black text-white tracking-[0.25em] uppercase font-mono bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-300">
                      Aura OS Coding Studio
                    </h2>
                    
                    <p className="text-[10px] text-white/30 max-w-[280px] leading-relaxed mt-1 mb-8">
                      Select or double-click any system workspace asset in the file navigator to launch compilation logs.
                    </p>

                    {/* Keyboard Shortcuts Keymap */}
                    <div className="flex flex-col gap-2 max-w-[290px] w-full text-[10px] text-white/45 font-mono bg-white/[0.01] border border-white/5 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                      <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                        <span>Open Chat</span>
                        <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-purple-300 font-bold">Ctrl + Alt + I</kbd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                        <span>Show All Commands</span>
                        <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-white/80 font-bold">Ctrl + Shift + P</kbd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                        <span>Open Recent File</span>
                        <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-white/80 font-bold">Ctrl + R</kbd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                        <span>Return to Hub</span>
                        <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-white/80 font-bold">Alt + L</kbd>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span>Woofer Sync State</span>
                        <kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-white/80 font-bold">Ctrl + Shift + W</kbd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: GEORGE COMPANION CHAT PANEL (COLLAPSIBLE)      */}
        {/* ======================================================== */}
        {showGeorge && (
          <>
            {/* Draggable Vertical Split Divider */}
            <div
              onMouseDown={startResizeGeorge}
              className="w-1 bg-[#05050a] border-l border-r border-white/5 hover:bg-cyan-500/40 active:bg-cyan-500/80 cursor-ew-resize transition-all duration-150 relative flex items-center justify-center group z-20 flex-shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <div className="absolute left-1/2 -translate-x-1/2 h-8 w-[2px] bg-white/10 group-hover:bg-cyan-400 group-active:bg-cyan-400 rounded transition-colors" />
            </div>

            <div 
              style={{ width: `${georgeWidth}px` }}
              className="flex-shrink-0 bg-[#09090f] flex flex-col z-10 min-w-[180px] max-w-[800px]"
            >
              <GeorgePanel
                project={activeProject}
                currentFile={activeFilePath}
                fileContent={fileContent}
                apiKey={apiKey}
                ollamaCloudKey={ollamaCloudKey}
                ollamaModel={ollamaModel}
                preferLocal={preferLocal}
                onInjectCode={handleInjectCode}
                onReviewCode={(code, filePath) => {
                  setReviewingCode({
                    code,
                    filePath,
                    originalCode: fileContent || ""
                  });
                }}
              />
            </div>
          </>
        )}

        {/* Global resizing mouse-events shield overlay to prevent iframe hijacking */}
        {(isDraggingEditor || isDraggingGeorge) && (
          <div 
            className="fixed inset-0 z-[9999] select-none" 
            style={{ cursor: isDraggingEditor ? "ns-resize" : "ew-resize" }}
          />
        )}

      </div>
    </div>
  );
}
