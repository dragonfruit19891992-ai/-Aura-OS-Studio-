import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Folder,
  FolderOpen,
  FileText,
  Code,
  ChevronRight,
  ChevronDown,
  Play,
  Square,
  Terminal as TermIcon,
  Loader2,
  Trash2,
  Zap,
  Globe,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Undo2,
  Redo2,
  ShieldAlert,
  BrainCircuit,
  CheckCircle2,
  X,
  Workflow,
  FileCode
} from "lucide-react";
import PhaseTwoDashboard from '../components/PhaseTwoDashboard';
// Firebase removed - using backend APIs instead
import { XTermTerminal } from "../components/XTermTerminal";
import PackageManagerPanel from "../components/PackageManagerPanel";
import SecretsManagerPanel from "../components/SecretsManagerPanel";
import CodeEditor from "../components/CodeEditor";
import { Panel, Group, Separator } from "react-resizable-panels";

/* ── Types ── */
interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
  size?: number;
}

interface ComposerMsg {
  id: string;
  role: "user" | "george";
  text: string;
  status: "thinking" | "streaming" | "done";
  applied?: string[];
  ts: number;
}

interface Props {
  projectId: string;
  projectName: string;
  onBack: () => void;
}

function fileIcon(node: FileNode) {
  if (node.type === "dir") return null;
  const ext = node.name.split(".").pop()?.toLowerCase() ?? "";
  if (["ts", "tsx", "js", "jsx"].includes(ext)) return <Code className="w-3.5 h-3.5 text-yellow-400/80 flex-shrink-0" />;
  if (["css", "scss", "sass"].includes(ext)) return <FileText className="w-3.5 h-3.5 text-blue-400/80 flex-shrink-0" />;
  if (ext === "json") return <FileText className="w-3.5 h-3.5 text-orange-400/80 flex-shrink-0" />;
  return <FileText className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />;
}

export default function StudioCore({ projectId, projectName, onBack }: Props) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [leftTab, setLeftTab] = useState<"files" | "packages" | "secrets">("files");

  // Composer chat messages (managed locally, will be persisted via backend API)
  const [composerMsgs, setComposerMsgs] = useState<ComposerMsg[]>([]);

  const [composerInput, setComposerInput] = useState("");
  const [composerBusy, setComposerBusy] = useState(false);

  const [viewerState, setViewerState] = useState<{ isOpen: boolean; path: string; content: string }>({ isOpen: false, path: "", content: "" });
  const [isPhaseTwoOpen, setIsPhaseTwoOpen] = useState(false);

  const [devState, setDevState] = useState<{ status: string; port?: number; logs: string[] }>({ status: "offline", logs: [] });
  
  // Browser State
  const [history, setHistory] = useState<string[]>(["about:blank"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [browserUrl, setBrowserUrl] = useState("about:blank");
  const [urlInput, setUrlInput] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isAgentControlling, setIsAgentControlling] = useState(false);

  const composerEndRef = useRef<HTMLDivElement>(null);

  /* ── Load file tree ── */
  const loadTree = useCallback(async () => {
    try {
      const r = await fetch(`/api/mcp/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "list_directory", params: { projectId, dirPath: "." } }),
      });
      const d = await r.json();
      if (d.ok) setFileTree(d.tree || []);
    } catch { /* silent */ }
  }, [projectId]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    composerEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [composerMsgs]);

  /* ── Dev Server Polling & Auto-Start ── */
  useEffect(() => {
    let isFirstPoll = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/dev/status`);
        const data = await res.json();
        
        if (isFirstPoll && data.status === "offline") {
          // Auto-start the server in background without blocking the UI
          setDevState((prev) => ({ ...prev, status: "installing", logs: ["Starting dev server..."] }));
          fetch(`/api/projects/${projectId}/dev/start`, { method: "POST" }).catch(e => console.error("Dev start failed:", e));
        }
        isFirstPoll = false;

        setDevState((prev) => {
          if (prev.status !== data.status || prev.port !== data.port || prev.logs.length !== (data.logs?.length || 0)) {
            return { ...prev, ...data, logs: data.logs || [] };
          }
          return prev;
        });
      } catch (e) {
        console.error("Dev status poll failed:", e);
      }
    };
    
    // Initial poll
    poll();
    const intv = setInterval(poll, 2000);
    return () => clearInterval(intv);
  }, [projectId]);

  // Sync Browser URL when Dev Server comes online
  useEffect(() => {
    if (devState.status === "running" && devState.port) {
      const url = `http://localhost:${devState.port}`;
      setHistory([url]);
      setHistoryIndex(0);
      setBrowserUrl(url);
      setUrlInput(url);
    } else if (devState.status === "offline") {
      setHistory(["about:blank"]);
      setHistoryIndex(0);
      setBrowserUrl("about:blank");
      setUrlInput("");
    }
  }, [devState.status, devState.port]);

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const startDevServer = async () => {
    setDevState((p) => ({ ...p, status: "starting" }));
    await fetch(`/api/projects/${projectId}/dev/start`, { method: "POST" });
  };

  const stopDevServer = async () => {
    await fetch(`/api/projects/${projectId}/dev/stop`, { method: "POST" });
    setDevState((p) => ({ ...p, status: "offline", port: undefined }));
  };

  const handleBrowserNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = urlInput.trim();
    if (finalUrl && !finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
      setUrlInput(finalUrl);
    }
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setBrowserUrl(finalUrl);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setBrowserUrl(history[newIdx]);
      setUrlInput(history[newIdx]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setBrowserUrl(history[newIdx]);
      setUrlInput(history[newIdx]);
    }
  };

  const reloadBrowser = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // ---------- COMPOSER / GEORGE LOGIC ----------
  const sendToComposer = () => {
    if (!composerInput.trim() || composerBusy) return;
    const prompt = composerInput.trim();
    setComposerInput("");
    runComposerPrompt(prompt);
  };

  const runComposerPrompt = async (prompt: string) => {
    if (!prompt.trim() || composerBusy) return;
    setComposerBusy(true);

    // Add user message to local state
    const userMsg: ComposerMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: prompt,
      status: "done",
      ts: Date.now(),
      applied: []
    };
    setComposerMsgs((prev) => [...prev, userMsg]);

    // Create a George thinking message
    const georgeId = `george-${Date.now()}`;
    const georgeMsg: ComposerMsg = {
      id: georgeId,
      role: "george",
      text: "",
      status: "thinking",
      ts: Date.now(),
      applied: []
    };
    setComposerMsgs((prev) => [...prev, georgeMsg]);

    let accumulated = "";
    try {
      const resp = await fetch("/api/composer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          prompt,
          files: [],
          model: "llama3.2:1b",
          conversationHistory: composerMsgs.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      if (!resp.ok) throw new Error("Composer request failed");
      
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.token) {
                  accumulated += payload.token;
                  // Update George message with streaming text
                  if (accumulated.length % 50 === 0) {
                    setComposerMsgs((prev) =>
                      prev.map((msg) =>
                        msg.id === georgeId
                          ? { ...msg, text: accumulated, status: "streaming" }
                          : msg
                      )
                    );
                  }
                }
                if (payload.done) break;
              } catch {}
            }
          }
        }

        // Update George message with final text
        setComposerMsgs((prev) =>
          prev.map((msg) =>
            msg.id === georgeId
              ? { ...msg, text: accumulated, status: "done" }
              : msg
          )
        );

        // Persist message to backend
        await fetch(`/api/projects/${projectId}/chat`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: georgeId, text: accumulated, status: "done" })
        });

        // Check for file changes and apply
        const hasFiles = /FILE:\s*[^\n]+\n```/.test(accumulated);
        if (hasFiles) {
          const applyRes = await fetch("/api/composer/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, text: accumulated }),
          });
          const applyData = await applyRes.json();
          if (applyData.applied?.length > 0) {
            setComposerMsgs((prev) =>
              prev.map((msg) =>
                msg.id === georgeId
                  ? { ...msg, applied: applyData.applied }
                  : msg
              )
            );
            await loadTree();
          }
        }
      }
    } catch (err: any) {
      // Update George message with error
      setComposerMsgs((prev) =>
        prev.map((msg) =>
          msg.id === georgeId
            ? { ...msg, text: `Error: ${err.message}`, status: "done" }
            : msg
        )
      );

      // Persist error to backend
      await fetch(`/api/projects/${projectId}/chat`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: georgeId, text: `Error: ${err.message}`, status: "done" })
      });
    }
    setComposerBusy(false);
  };

    /* ── Code Viewer Logic ── */
    const handleFileClick = async (filePath: string) => {
      try {
        const r = await fetch(`/api/mcp/call`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolName: "read_file",
            args: { AbsolutePath: filePath },
            projectId
          })
        });
        const data = await r.json();
        if (data.result && data.result.content && data.result.content[0]) {
          setViewerState({ isOpen: true, path: filePath, content: data.result.content[0].text });
        }
      } catch (e) {
        console.error("Failed to read file", e);
      }
    };

  /* ── Render file tree ── */
  function renderTree(nodes: FileNode[], depth = 0): React.ReactNode {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          onClick={() => node.type === "dir" ? toggleDir(node.path) : handleFileClick(node.path)}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          className="w-full flex items-center gap-1.5 py-[3px] pr-2 text-left rounded hover:bg-white/5 transition-colors text-[11px] text-white/50 hover:text-white/85 cursor-pointer"
        >
          {node.type === "dir" ? (
            <>
              {expandedDirs.has(node.path) ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
              {expandedDirs.has(node.path) ? <FolderOpen className="w-3.5 h-3.5 text-yellow-400/70 flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-yellow-400/50 flex-shrink-0" />}
            </>
          ) : (
            <>
              <span className="w-3 h-3 flex-shrink-0" />
              {fileIcon(node)}
            </>
          )}
          <span className="truncate flex-1">{node.name}</span>
        </div>
        {node.type === "dir" && expandedDirs.has(node.path) && node.children && <div>{renderTree(node.children, depth + 1)}</div>}
      </div>
    ));
  }

  /* ── Friendly Chat Formatting ── */
  const renderFriendlyMsg = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/);
    let hasAction = false;
    const formatted = parts.map((part, i) => {
      if (part.startsWith("```")) {
        hasAction = true;
        return (
          <div key={i} className="my-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white/90 tracking-wide">1 message & 1 action</span>
            </div>
            <span className="text-[10px] text-white/50 font-mono uppercase pl-6">George modified project files</span>
          </div>
        );
      }
      return <span key={i} className="whitespace-pre-wrap leading-relaxed text-[12px]">{part}</span>;
    });

    return { formatted, hasAction };
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07070B] text-white overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Top Bar ── */}
      <div className="h-12 border-b border-white/[0.06] flex items-center justify-between px-4 bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center text-[10px] text-white/50 hover:text-white transition-colors tracking-widest font-mono uppercase">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center text-[11px] font-mono">
            <span className="text-white/40">OS Files</span>
            <ChevronRight className="w-3 h-3 mx-2 text-white/20" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-2" />
            <span className="font-bold tracking-widest text-white/90 uppercase">{projectName}</span>
          </div>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <button onClick={() => setIsPhaseTwoOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-white/60 hover:text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0)] hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]" title="Phase Two: Agent Scripts">
            <Workflow className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold tracking-widest uppercase">Phase Two</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {devState.status === "running" ? (
            <button onClick={stopDevServer} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold hover:bg-rose-500/30 transition-all">
              <Square className="w-3 h-3 fill-current" /> Stop Server
            </button>
          ) : (
            <button onClick={startDevServer} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/30 transition-all">
              <Play className="w-3 h-3 fill-current" /> Start Server
            </button>
          )}
        </div>
      </div>

      {/* ── Main Layout (4 Panes) ── */}
      <div className="flex-1 overflow-hidden relative">
        <Group orientation="horizontal" id="studio-main">
          
          {/* 1. LEFT PANE: File Tree & Packages & Secrets */}
          <Panel id="sidebar" defaultSize={15} minSize={10} collapsible={true} className="bg-black/60 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col relative z-10">
            <div className="h-9 flex items-center border-b border-white/[0.04]">
              <button 
                onClick={() => setLeftTab("files")} 
                className={`flex-1 h-full text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${leftTab === "files" ? "text-white bg-white/5 border-b-2 border-cyan-400" : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"}`}
              >
                Files
              </button>
              <button 
                onClick={() => setLeftTab("packages")} 
                className={`flex-1 h-full text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${leftTab === "packages" ? "text-white bg-white/5 border-b-2 border-emerald-400" : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"}`}
              >
                Packages
              </button>
              <button 
                onClick={() => setLeftTab("secrets")} 
                className={`flex-1 h-full text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${leftTab === "secrets" ? "text-white bg-white/5 border-b-2 border-purple-400" : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"}`}
              >
                Secrets
              </button>
            </div>
            {leftTab === "files" && (
              <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {fileTree.length === 0 ? <p className="text-[10px] text-white/20 px-3">No files found.</p> : renderTree(fileTree)}
              </div>
            )}
            {leftTab === "packages" && (
              <div className="flex-1 overflow-hidden">
                <PackageManagerPanel projectId={projectId} />
              </div>
            )}
            {leftTab === "secrets" && (
              <div className="flex-1 overflow-hidden">
                <SecretsManagerPanel projectId={projectId} />
              </div>
            )}
          </Panel>

          <Separator className="w-1 bg-white/[0.02] hover:bg-purple-500/50 active:bg-purple-500 cursor-col-resize z-10" />

          {/* 2 & 3. CENTER PANES: Internet & Terminal */}
          <Panel id="center" defaultSize={60} className="flex flex-col relative z-0">
            <Group orientation="vertical">
              
              {/* INTERNET (Live Browser) */}
              <Panel id="internet" defaultSize={70} className={`flex flex-col bg-white transition-all duration-700 ${isAgentControlling ? 'ring-8 ring-purple-500/80 shadow-[0_0_100px_rgba(168,85,247,0.5)] z-50 relative' : ''}`}>
                {/* Agent Takeover Overlay Badge */}
                {isAgentControlling && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-purple-600/90 backdrop-blur-xl border border-purple-400/50 text-white px-6 py-2.5 rounded-full shadow-2xl animate-pulse pointer-events-none">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="text-xs font-black tracking-widest uppercase">Agent Taking Over: Validating</span>
                  </div>
                )}
                
                {/* Browser Toolbar */}
                <div className="h-10 bg-[#f1f1f1] border-b border-zinc-300 flex items-center px-3 gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <button onClick={goBack} disabled={historyIndex === 0} className="p-1.5 rounded hover:bg-black/5 text-zinc-600 disabled:opacity-30" title="Go Back"><ArrowLeft className="w-4 h-4" /></button>
                    <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-1.5 rounded hover:bg-black/5 text-zinc-600 disabled:opacity-30" title="Go Forward"><ArrowRight className="w-4 h-4" /></button>
                    <button onClick={reloadBrowser} className="p-1.5 rounded hover:bg-black/5 text-zinc-600" title="Reload"><RefreshCw className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-zinc-300 mx-1" />
                    <button onClick={() => {
                      setComposerInput("I want to change a specific UI element. How do I find exactly what file and line controls it?");
                      setComposerBusy(false);
                    }} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-600 flex items-center gap-1" title="Inspect UI Element">
                      <Zap className="w-4 h-4" />
                      <span className="text-[10px] font-bold">DIV</span>
                    </button>
                    <button onClick={() => setIsAgentControlling(!isAgentControlling)} className={`p-1.5 rounded flex items-center gap-1 ml-1 transition-all ${isAgentControlling ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-purple-500/10 text-purple-600'}`} title="Toggle Agent Validation Takeover">
                      <BrainCircuit className="w-4 h-4" />
                      {isAgentControlling && <span className="text-[9px] font-bold uppercase tracking-wider pr-1">Controlling</span>}
                    </button>
                  </div>
                  <form onSubmit={handleBrowserNavigate} className="flex-1 max-w-2xl ml-2">
                    <div className="relative flex items-center w-full">
                      <Globe className="absolute left-2 w-3.5 h-3.5 text-zinc-400" />
                      <input 
                        type="text" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full h-7 pl-8 pr-3 text-xs bg-white border border-zinc-300 rounded-full focus:outline-none focus:border-blue-500 text-zinc-800 shadow-inner"
                        placeholder="Search or enter web address"
                      />
                    </div>
                  </form>
                </div>
                {/* Browser Content */}
                <div className="flex-1 relative bg-zinc-100">
                  {devState.status === "starting" || devState.status === "installing" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                      <p className="text-sm font-semibold">{devState.status === "installing" ? "Installing packages..." : "Starting local server..."}</p>
                    </div>
                  ) : (
                    <iframe ref={iframeRef} src={browserUrl} className="w-full h-full border-0" title="Live Preview" sandbox="allow-scripts allow-same-origin allow-forms" />
                  )}
                </div>
              </Panel>

              <Separator className="h-1 bg-white/[0.02] hover:bg-purple-500/50 active:bg-purple-500 cursor-row-resize z-10" />

              {/* TERMINAL */}
              <Panel id="terminal" defaultSize={30} className="flex flex-col bg-black/80 backdrop-blur-3xl relative z-10">
                <div className="h-8 border-b border-white/[0.06] flex items-center px-4 flex-shrink-0 bg-white/[0.01]">
                  <TermIcon className="w-3.5 h-3.5 text-white/40 mr-2" />
                  <span className="text-[10px] text-white/40 font-mono uppercase">Run Console</span>
                </div>
                <div className="flex-1 overflow-hidden p-1">
                  <XTermTerminal projectId={projectId || "system"} />
                </div>
              </Panel>
            </Group>
          </Panel>

          <Separator className="w-1 bg-white/[0.02] hover:bg-purple-500/50 active:bg-purple-500 cursor-col-resize z-10" />

          {/* 4. RIGHT PANE: AI (George Composer) */}
          <Panel id="right" defaultSize={25} minSize={15} collapsible={true} className="flex flex-col border-l border-white/[0.06] bg-black/60 backdrop-blur-2xl relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <div className="h-11 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] text-white/80 font-mono font-bold uppercase tracking-wider">George AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Rollback (Undo)">
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Roll Forward (Redo)">
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {composerMsgs.length === 0 && (
                  <div className="text-center pt-8 text-white/30 text-[11px] font-mono uppercase tracking-widest">
                    George is ready to build.
                  </div>
                )}
                {composerMsgs.map((msg) => {
                  const rendered = renderFriendlyMsg(msg.text || "");
                  return (
                  <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {msg.role === "user" ? (
                      <div className="max-w-[90%] bg-purple-600/30 border border-purple-500/30 rounded-3xl rounded-br-sm px-4 py-2.5 text-[12px] shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="max-w-[98%] w-full flex flex-col gap-1.5 mt-2">
                        {msg.status === "thinking" && (
                          <div className="flex items-center gap-2 text-white/50 bg-white/[0.02] border border-white/[0.05] rounded-full px-3 py-1.5 w-max">
                            <BrainCircuit className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span className="text-[11px] font-medium">Clarifying user's request...</span>
                          </div>
                        )}
                        {msg.text && (
                          <div className="text-[12px] text-white/90">
                            {rendered.formatted}
                          </div>
                        )}
                        {(msg.status === "done" && msg.text) && (
                          <div className="flex items-center gap-1.5 mt-1 text-emerald-400/80">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">Checkpoint made just now</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )})}
                <div ref={composerEndRef} />
              </div>

              <div className="flex-shrink-0 p-3 border-t border-white/[0.06]">
                <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
                  <textarea
                    value={composerInput}
                    onChange={(e) => setComposerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendToComposer(); }
                    }}
                    placeholder="Tell George what to build..."
                    disabled={composerBusy}
                    rows={3}
                    className="w-full bg-transparent text-white placeholder-white/20 px-3 pt-2 pb-1 resize-none focus:outline-none text-[11px] font-mono leading-relaxed"
                  />
                  <div className="flex justify-end p-2">
                    <button onClick={sendToComposer} disabled={composerBusy || !composerInput.trim()} className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold disabled:opacity-30">
                      {composerBusy ? "Thinking..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </Group>
      </div>

      {/* ── Monaco Code Editor Modal (Cursor Parity) ── */}
      {viewerState.isOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="w-full max-w-6xl h-full max-h-[90vh] bg-[#07070B] border border-white/10 rounded-xl shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
            <CodeEditor 
              path={viewerState.path} 
              initialContent={viewerState.content}
              onClose={() => setViewerState({ ...viewerState, isOpen: false })}
              onSave={async (newContent) => {
                await fetch("/api/mcp/call", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tool: "write_file",
                    params: { projectId, filePath: viewerState.path, content: newContent }
                  })
                });
                setViewerState({ ...viewerState, content: newContent });
              }}
            />
          </div>
        </div>
      )}

      {/* ── Phase Two Scripts Modal (Live Holographic Logs) ── */}
      {isPhaseTwoOpen && (
        <PhaseTwoDashboard 
          onClose={() => setIsPhaseTwoOpen(false)} 
          devLogs={devState.logs} 
          composerMsgs={composerMsgs} 
          projectId={projectId}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 10px; }` }} />
    </div>
  );
}
