import React, { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Settings, Terminal, GitBranch, Bug,
  FileText, Search, Code, AlertCircle, Play, Square, Zap,
  Download, Share2, MoreVertical, Eye, EyeOff
} from "lucide-react";
import FileTree from "./FileTree";
import CodeEditor from "./CodeEditor";

interface EditorTab {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
  language: string;
}

interface IDEShellProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export default function IDEShell({ projectId, projectName, onClose }: IDEShellProps) {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [output, setOutput] = useState<string[]>([]);

  const openFile = async (path: string, name: string) => {
    // Check if already open
    let tab = tabs.find((t) => t.path === path);
    if (tab) {
      setActiveTab(path);
      return;
    }

    // Load file content
    try {
      const res = await fetch(`/api/projects/${projectId}/file?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error("Failed to load file");
      const data = await res.json();

      const ext = path.split(".").pop()?.toLowerCase() || "";
      const langMap: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        tsx: "typescript",
        jsx: "javascript",
        html: "html",
        css: "css",
        py: "python",
        json: "json",
      };

      tab = {
        path,
        name,
        content: data.content,
        isDirty: false,
        language: langMap[ext] || "plaintext",
      };

      setTabs((prev) => [...prev, tab!]);
      setActiveTab(path);
    } catch (err) {
      console.error("Failed to open file:", err);
      alert("Failed to open file");
    }
  };

  const closeTab = (path: string) => {
    setTabs((prev) => prev.filter((t) => t.path !== path));
    if (activeTab === path) {
      setActiveTab(tabs[0]?.path || null);
    }
  };

  const saveFile = async (path: string, content: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setTabs((prev) =>
        prev.map((t) =>
          t.path === path ? { ...t, isDirty: false } : t
        )
      );

      setOutput((prev) => [...prev, `✓ Saved ${path}`]);
    } catch (err) {
      console.error("Save failed:", err);
      setOutput((prev) => [...prev, `✗ Failed to save ${path}`]);
    }
  };

  const handleContentChange = (path: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.path === path ? { ...t, content, isDirty: true } : t
      )
    );
  };

  const handleRunProject = async () => {
    const activeTabData = tabs.find((t) => t.path === activeTab);
    if (!activeTabData) {
      setOutput((prev) => [...prev, "✗ No file open to run."]);
      return;
    }

    setStatus("running");
    setTerminalOpen(true);
    setOutput((prev) => [...prev, `▶ Executing ${activeTabData.name}...`]);

    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activeTabData.content }),
      });
      
      const data = await res.json();
      
      if (data.error) {
         setOutput((prev) => [...prev, "✗ Execution Error:\\n" + data.output]);
         setStatus("error");
      } else {
         setOutput((prev) => [...prev, "✓ Execution Output:\\n" + data.output]);
         setStatus("idle");
      }
    } catch (err) {
      setOutput((prev) => [...prev, "✗ Failed to connect to execution engine"]);
      setStatus("error");
    }
  };

  const activeTabData = tabs.find((t) => t.path === activeTab);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded"
            title="Close Editor"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-sm font-bold">{projectName}</h2>
            <p className="text-xs text-slate-500">Editing: {activeTabData?.name || "No file"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunProject}
            disabled={status === "running"}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center gap-1 text-sm disabled:opacity-50"
          >
            {status === "running" ? (
              <>
                <Square size={14} /> Stop
              </>
            ) : (
              <>
                <Play size={14} /> Run
              </>
            )}
          </button>

          <button
            onClick={() => setPreviewExpanded(!previewExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
            title="Toggle Preview"
          >
            {previewExpanded ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`p-1 rounded ${terminalOpen ? "bg-slate-800 text-blue-400" : "hover:bg-slate-800 text-slate-400"}`}
            title="Toggle Terminal"
          >
            <Terminal size={18} />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          <button className="p-1 hover:bg-slate-800 rounded text-slate-400" title="Settings">
            <Settings size={18} />
          </button>

          <button className="p-1 hover:bg-slate-800 rounded text-slate-400" title="More">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Tree */}
        {sidebarExpanded && (
          <div className="w-64 border-r border-slate-700 flex flex-col">
            <FileTree
              projectId={projectId}
              onSelectFile={openFile}
              selectedPath={activeTab || ""}
            />
          </div>
        )}

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="px-1 py-4 hover:bg-slate-800 border-r border-slate-700 text-slate-500"
          title={sidebarExpanded ? "Hide Sidebar" : "Show Sidebar"}
        >
          {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeEditor
            projectId={projectId}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTabClose={closeTab}
            onSave={saveFile}
            onContentChange={handleContentChange}
          />

          {/* Terminal */}
          {terminalOpen && (
            <div className="h-48 border-t border-slate-700 bg-black flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
                <span className="text-xs font-bold text-slate-300 uppercase">Output</span>
                <button
                  onClick={() => setTerminalOpen(false)}
                  className="p-0.5 hover:bg-slate-700 rounded"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-slate-300">
                {output.map((line, i) => (
                  <div key={i} className={line.startsWith("✗") ? "text-red-400" : line.startsWith("✓") ? "text-green-400" : ""}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {previewExpanded && (
          <div className="w-96 border-l border-slate-700 bg-slate-900 flex flex-col">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase">Preview</h3>
              <button
                onClick={() => setPreviewExpanded(false)}
                className="p-0.5 hover:bg-slate-700 rounded"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Eye size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Live preview</p>
                <p className="text-[10px] text-slate-600">Click "Run" to preview</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-slate-900 border-t border-slate-700 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === "running" ? "bg-yellow-500" : status === "error" ? "bg-red-500" : "bg-green-500"}`} />
          <span>{status === "running" ? "Running..." : status === "error" ? "Error" : "Ready"}</span>
        </div>
        <span>{tabs.length} file{tabs.length !== 1 ? "s" : ""} open</span>
      </div>
    </div>
  );
}
