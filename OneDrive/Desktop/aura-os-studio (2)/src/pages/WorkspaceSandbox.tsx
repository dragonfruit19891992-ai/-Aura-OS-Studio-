import React, { useState, useEffect } from "react";
import {
  Search, Folder, FileText, Image as ImageIcon, Download as DownloadIcon,
  Music, Film, Globe, Laptop, Plus, FolderPlus, Trash2, Layers, Upload,
  BrainCircuit, Save, History, Terminal, ArrowLeft, RefreshCw, CheckCircle2,
  AlertCircle, ChevronRight, Play, Server, Wifi, Heart, Star, Disc, Layers3, Code
} from "lucide-react";
import { WorkspaceItem, Project } from "../types";

interface WorkspaceSandboxProps {
  activeProject: Project | null;
  onInjectCode: (code: string) => void | Promise<void>;
  brainFeedCategory: string;
  setBrainFeedCategory: (cat: string) => void;
  feedToGeorge: (text: string, category: string, img?: string, file?: string) => Promise<any>;
}

export default function WorkspaceSandbox({
  activeProject,
  onInjectCode,
  brainFeedCategory,
  setBrainFeedCategory,
  feedToGeorge
}: WorkspaceSandboxProps) {
  // Sidebar tab control
  // Options: "all-files", "my-files", "connected-devices", "Documents", "Images", "Downloads", "Projects", "Music", "Videos"
  const [activeTab, setActiveTab] = useState<string>("connected-devices");
  const [searchQuery, setSearchQuery] = useState("");
  const [wsItems, setWsItems] = useState<WorkspaceItem[]>([]);
  const [wsCurrentFolder, setWsCurrentFolder] = useState<string | null>(null);
  const [wsSelectedFile, setWsSelectedFile] = useState<any | null>(null);
  const [wsSaving, setWsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Delta Compiler State (unified inside file editor)
  const [sandboxMode, setSandboxMode] = useState("free");
  const [sandboxTargetFile, setSandboxTargetFile] = useState("");
  const [sandboxPatchTarget, setSandboxPatchTarget] = useState("");
  const [sandboxPatchReplacement, setSandboxPatchReplacement] = useState("");

  // Connected Devices simulation states
  const [deviceIp, setDeviceIp] = useState("192.168.1.108");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real Projects states
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [appFileTree, setAppFileTree] = useState<any[]>([]);
  
  // Fetch workspace items
  const refreshItems = () => {
    setIsRefreshing(true);
    fetch("/api/sandbox/workspace")
      .then((r) => r.json())
      .then((d) => {
        setWsItems(Array.isArray(d) ? d : []);
        setTimeout(() => setIsRefreshing(false), 500);
      })
      .catch(() => setIsRefreshing(false));
  };

  useEffect(() => {
    refreshItems();
    // Dynamically set mock IP based on hostname
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setDeviceIp(window.location.hostname);
    }
    // Fetch real projects
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d)).catch(()=>{});
  }, []);

  const openAppFolder = async (projectId: string) => {
    setActiveAppId(projectId);
    setWsCurrentFolder(null);
    setWsSelectedFile(null);
    try {
      const r = await fetch(`/api/mcp/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "list_directory", params: { projectId, dirPath: "." } }),
      });
      const d = await r.json();
      if (d.ok) setAppFileTree(d.tree || []);
    } catch { }
  };

  const openAppFile = async (item: any) => {
    try {
      const r = await fetch(`/api/mcp/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "read_file", params: { projectId: activeAppId, filePath: item.path } }),
      });
      const d = await r.json();
      if (d.ok) {
        setWsSelectedFile({
          id: item.path,
          name: item.name,
          content: d.content,
          isBinary: false, 
          type: "file",
          isAppFile: true 
        });
      }
    } catch {}
  };

  const getFolderCategory = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "ico"].includes(ext)) {
      return "Images";
    }
    if (["pdf", "txt", "md", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
      return "Documents";
    }
    if (["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "java", "cpp", "c", "h", "cs", "go", "rs", "sh", "bat", "yml", "yaml"].includes(ext)) {
      return "Projects";
    }
    if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) {
      return "Downloads";
    }
    if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
      return "Music";
    }
    if (["mp4", "mkv", "avi", "mov", "webm"].includes(ext)) {
      return "Videos";
    }
    return "Miscellaneous";
  };

  const isBinaryFile = (file: File): boolean => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const binaryExtensions = [
      "png", "jpg", "jpeg", "gif", "webp", "ico", "pdf", "zip", "rar", "tar", "gz", "7z",
      "woff", "woff2", "ttf", "otf", "mp3", "mp4", "wav", "ogg", "flac", "mkv", "avi", "mov", "webm", "exe", "bin"
    ];
    return binaryExtensions.includes(ext);
  };

  const getFolderColorClass = (name: string): string => {
    switch (name) {
      case "Images": return "text-amber-400";
      case "Documents": return "text-cyan-400";
      case "Projects": return "text-emerald-400";
      case "Downloads": return "text-purple-400";
      case "Music": return "text-rose-400";
      case "Videos": return "text-indigo-400";
      default: return "text-blue-400";
    }
  };

  const getFileIcon = (fileName: string, isBinary: boolean) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "ico"].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-amber-400/80" />;
    }
    if (ext === "pdf") {
      return <FileText className="w-4 h-4 text-rose-400/80" />;
    }
    if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) {
      return <DownloadIcon className="w-4 h-4 text-purple-400/80" />;
    }
    if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
      return <Music className="w-4 h-4 text-rose-400/80" />;
    }
    if (["mp4", "mkv", "avi", "mov", "webm"].includes(ext)) {
      return <Film className="w-4 h-4 text-indigo-400/80" />;
    }
    return <FileText className="w-4 h-4 text-cyan-400/80" />;
  };

  const createWsItem = async (
    type: "file" | "folder",
    name: string,
    content = "",
    section = "mine",
    customParentId: string | null = wsCurrentFolder,
    isBinary = false
  ) => {
    try {
      const r = await fetch("/api/sandbox/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, content, parentId: customParentId, section, isBinary }),
      });
      const item = await r.json();
      setWsItems((p) => {
        if (p.some((existing) => existing.id === item.id)) return p;
        return [...p, item];
      });
      return item;
    } catch (err) {
      console.error(err);
    }
  };

  const updateWsItem = async (id: string, content: string) => {
    if (wsSelectedFile?.isAppFile) {
       setWsSaving(true);
       await fetch(`/api/mcp/call`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ tool: "write_file", params: { projectId: activeAppId, filePath: id, content } }),
       });
       setWsSelectedFile((f: any) => (f?.id === id ? { ...f, content } : f));
       setTimeout(() => setWsSaving(false), 300);
       return;
    }
    setWsSaving(true);
    await fetch(`/api/sandbox/workspace/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setWsItems((p) => p.map((i) => (i.id === id ? { ...i, content } : i)));
    setWsSelectedFile((f: any) => (f?.id === id ? { ...f, content } : f));
    setTimeout(() => setWsSaving(false), 300);
  };

  const deleteWsItem = async (id: string) => {
    await fetch(`/api/sandbox/workspace/${id}`, { method: "DELETE" });
    setWsItems((p) => p.filter((i) => i.id !== id && i.parentId !== id));
    if (wsSelectedFile?.id === id) setWsSelectedFile(null);
  };

  const handleBatchUpload = async (files: File[]) => {
    setWsSaving(true);
    for (const file of files) {
      const isBinary = isBinaryFile(file);
      const category = getFolderCategory(file.name);

      // Check if folder representing the category already exists at root
      let catFolder = wsItems.find(
        (i) => i.type === "folder" && i.name === category
      );

      let targetParentId = wsCurrentFolder;

      // Group by category if we are at the root level
      if (!wsCurrentFolder) {
        if (!catFolder) {
          catFolder = await createWsItem("folder", category, "", "mine", null);
        }
        if (catFolder) {
          targetParentId = catFolder.id;
        }
      }

      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (isBinary) {
            const base64Index = result.indexOf(";base64,");
            if (base64Index !== -1) {
              resolve(result.substring(base64Index + 8));
            } else {
              resolve(result);
            }
          } else {
            resolve(result);
          }
        };
        if (isBinary) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });

      try {
        await fetch("/api/sandbox/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "file",
            name: file.name,
            content,
            parentId: targetParentId,
            section: "mine",
            isBinary,
          }),
        });
      } catch (err) {
        console.error("Failed to upload file", file.name, err);
      }
    }

    // Refresh sandbox files
    refreshItems();
    setWsSaving(false);
  };

  const syncWorkspaceWithGeorge = async () => {
    setWsSaving(true);
    try {
      const fileList = wsItems.filter((i) => i.type === "file");

      let outline = `SOVEREIGN SANDBOX WORKSPACE STRUCTURE:\n`;
      outline += `=====================================\n`;

      const renderFolderNode = (folderId: string | null, depth: number): string => {
        let result = "";
        const indent = "  ".repeat(depth);
        const children = wsItems.filter((i) => i.parentId === folderId);

        children.forEach((item) => {
          if (item.type === "folder") {
            result += `${indent}📁 ${item.name}/\n`;
            result += renderFolderNode(item.id, depth + 1);
          } else {
            result += `${indent}📄 ${item.name} (${item.isBinary ? "Binary Asset" : "Text File"})\n`;
          }
        });
        return result;
      };

      outline += renderFolderNode(null, 0);

      outline += `\n\n=====================================\n`;
      outline += `WORKSPACE FILE CONTENTS:\n`;
      outline += `=====================================\n\n`;

      for (const file of fileList) {
        if (!file.isBinary) {
          outline += `--- FILE: ${file.name} ---\n`;
          outline += `${file.content || ""}\n`;
          outline += `--- END OF FILE ${file.name} ---\n\n`;
        }
      }

      await feedToGeorge(outline, "Workspace Sandbox Tree", undefined, "workspace_manifest.txt");
      alert("Successfully synchronized sovereign workspace with George! George now has 100% architectural visibility of all sandbox folders and documents.");
    } catch (err) {
      console.error(err);
      alert("Failed to sync workspace.");
    } finally {
      setWsSaving(false);
    }
  };

  const handleInjectFileToGeorge = async () => {
    if (!wsSelectedFile) return;
    setWsSaving(true);
    try {
      const ext = wsSelectedFile.name.split(".").pop()?.toLowerCase() || "";
      const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico"].includes(ext);

      if (wsSelectedFile.isBinary) {
        if (isImage) {
          const r = await fetch(`/api/sandbox/workspace/file/${wsSelectedFile.id}/raw`);
          const blob = await r.blob();
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            const strippedBase64 = base64data.substring(base64data.indexOf(";base64,") + 8);
            await feedToGeorge(
              `Ingested image asset: ${wsSelectedFile.name}`,
              "Pictures",
              strippedBase64,
              wsSelectedFile.name
            );
            alert("Image asset fully ingested into George's vision context!");
          };
          reader.readAsDataURL(blob);
        } else {
          await feedToGeorge(
            `Ingested binary asset reference: ${wsSelectedFile.name} (Format: ${ext.toUpperCase()})`,
            "Archives",
            undefined,
            wsSelectedFile.name
          );
          alert("Binary asset metadata reference successfully synced with George.");
        }
      } else {
        await feedToGeorge(
          wsSelectedFile.content || "",
          "Source Code",
          undefined,
          wsSelectedFile.name
        );
        alert("Text content fully synchronized with George.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to inject asset to George.");
    } finally {
      setWsSaving(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await handleBatchUpload(files);
    }
  };

  // Filter items dynamically based on search and sidebar active tab selection
  const getFilteredItems = (): WorkspaceItem[] => {
    let baseItems = wsItems;

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      baseItems = baseItems.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    // Filter by Active Tab
    if (activeTab === "my-files") {
      baseItems = baseItems.filter((item) => item.section === "mine");
    } else if (activeTab === "connected-devices") {
      // Handled separately by dashboard view
      return [];
    } else if (
      ["Documents", "Images", "Downloads", "Projects", "Music", "Videos"].includes(
        activeTab
      )
    ) {
      // Keep folders at root and filter individual files inside them matching category
      // Or simply filter files that map to this category
      baseItems = baseItems.filter((item) => {
        if (item.type === "folder") {
          return item.name === activeTab;
        } else {
          return getFolderCategory(item.name) === activeTab;
        }
      });
    }

    // If a folder navigation context is active inside the grid
    if (wsCurrentFolder && !searchQuery.trim() && activeTab === "all-files") {
      baseItems = baseItems.filter((item) => item.parentId === wsCurrentFolder);
    } else if (!wsCurrentFolder && !searchQuery.trim()) {
      // At root level, show root elements
      baseItems = baseItems.filter((item) => item.parentId === null);
    }

    return baseItems;
  };

  const filteredItems = getFilteredItems();
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  // Folder Category Icon Resolver
  const getFolderIcon = (name: string) => {
    switch (name) {
      case "Images":
        return <ImageIcon className="w-4 h-4" />;
      case "Documents":
        return <FileText className="w-4 h-4" />;
      case "Projects":
        return <Layers className="w-4 h-4" />;
      case "Downloads":
        return <DownloadIcon className="w-4 h-4" />;
      case "Music":
        return <Music className="w-4 h-4" />;
      case "Videos":
        return <Film className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <div
      className="flex-1 bg-[#070913] text-[#cfd3ec] flex overflow-hidden relative selection:bg-purple-500/20"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Full-Screen Glassmorphic Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-[100] flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/30 rounded-2xl pointer-events-none animate-pulse">
          <div className="p-8 bg-cyan-500/5 border border-cyan-500/25 rounded-3xl flex flex-col items-center justify-center max-w-sm text-center shadow-[0_0_80px_rgba(34,211,238,0.15)]">
            <Upload className="w-16 h-16 text-cyan-400 mb-4 animate-bounce" />
            <h3 className="text-sm font-black text-white uppercase tracking-[0.25em] mb-2">Ingest File Streams</h3>
            <p className="text-[10px] text-white/50 font-mono leading-relaxed">
              Drop multiple files to catalog them recursively inside your physical workspace directory.
            </p>
          </div>
        </div>
      )}

      {/* Main File Explorer Shell Window */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Explorer Sidebar */}
        <div className="w-60 bg-[#090b16] border-r border-white/[0.04] flex flex-col flex-shrink-0 justify-between select-none">
          <div className="flex flex-col flex-1 min-h-0 py-4 px-3 space-y-4">
            
            {/* Search Input exactly as reference */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-white/20" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/30 transition-all font-sans"
              />
            </div>

            {/* Synthetic Life Containers */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-white/20 pl-2">Synthetic Life Containers</span>
              <div className="space-y-0.5 mt-1">
                {projects.filter(p => p.id.startsWith("synth_user_")).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setActiveTab("code-apps");
                      openAppFolder(project.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeAppId === project.id
                        ? "bg-gradient-to-r from-cyan-600/10 to-indigo-600/10 border border-cyan-500/10 text-cyan-300"
                        : "text-white/40 hover:bg-white/[0.02] hover:text-white/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <BrainCircuit className="w-4 h-4 text-cyan-400 opacity-75 flex-shrink-0" />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Core Projects Block */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-white/20 pl-2">Core Projects</span>
              <div className="space-y-0.5 mt-1">
                {projects.filter(p => !p.id.startsWith("synth_user_")).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setActiveTab("code-apps");
                      openAppFolder(project.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeAppId === project.id
                        ? "bg-gradient-to-r from-emerald-600/10 to-emerald-600/10 border border-emerald-500/10 text-emerald-300"
                        : "text-white/40 hover:bg-white/[0.02] hover:text-white/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Layers className="w-4 h-4 text-emerald-400 opacity-75 flex-shrink-0" />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Connections Block exactly as reference */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-white/20 pl-2">Connections</span>
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => {
                    setActiveTab("connected-devices");
                    setWsSelectedFile(null);
                    setWsCurrentFolder(null);
                    setActiveAppId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === "connected-devices"
                      ? "bg-gradient-to-r from-cyan-600/10 to-indigo-600/10 border border-cyan-500/10 text-cyan-300"
                      : "text-white/40 hover:bg-white/[0.02] hover:text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 opacity-75 text-cyan-400" />
                    <span>Connected Devices</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab("code-apps");
                    setWsSelectedFile(null);
                    setWsCurrentFolder(null);
                    setActiveAppId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === "code-apps"
                      ? "bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/10 text-emerald-300"
                      : "text-white/40 hover:bg-white/[0.02] hover:text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Code className="w-4 h-4 opacity-75 text-emerald-400" />
                    <span>Code Apps</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </button>
              </div>
            </div>

          </div>

          {/* Action buttons at bottom of sidebar */}
          <div className="p-3 border-t border-white/[0.03] space-y-2 bg-black/10">
            <div className="flex gap-1.5">
              <button
                onClick={async () => {
                  const n = prompt("File name:");
                  if (n) await createWsItem("file", n);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                <Plus size={10} /> File
              </button>
              <button
                onClick={async () => {
                  const n = prompt("Folder name:");
                  if (n) await createWsItem("folder", n);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-amber-400 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                <FolderPlus size={10} /> Folder
              </button>
            </div>
            
            {/* Upload File button styled exactly as mock */}
            <label className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-cyan-600/35 to-indigo-600/35 hover:from-cyan-600/50 hover:to-indigo-600/50 border border-cyan-500/25 hover:border-cyan-500/40 text-cyan-200 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all hover:scale-[1.01] shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
              <Upload size={13} className="text-cyan-400" /> Upload File
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) handleBatchUpload(files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        {/* Main Workspace Explorer Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070912]">
          
          {/* Main Top Header Bar exactly matching mock layout */}
          <div className="h-14 border-b border-white/[0.04] bg-black/10 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (wsSelectedFile) {
                    setWsSelectedFile(null);
                  } else if (wsCurrentFolder) {
                    setWsCurrentFolder(null);
                  } else {
                    setActiveTab("all-files");
                  }
                }}
                className="p-1 hover:bg-white/5 rounded-lg text-white/40 hover:text-white cursor-pointer transition-colors"
                title="Back"
              >
                <ArrowLeft size={14} />
              </button>
              
              {/* Directory Path Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <span className="text-white/45 hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveAppId(null); setWsCurrentFolder(null); setWsSelectedFile(null); }}>OS Files</span>
                <ChevronRight size={10} className="text-white/20" />
                <span className="text-cyan-400 uppercase tracking-wider font-extrabold text-[11px]">
                  {wsSelectedFile ? wsSelectedFile.name : activeAppId ? projects.find(p=>p.id===activeAppId)?.name : wsCurrentFolder ? wsItems.find(i => i.id === wsCurrentFolder)?.name : activeTab.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* ATLAS Status linked Badge and Refresh actions */}
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ATLAS (14) LINKED
              </span>

              <div className="h-4 w-px bg-white/10" />

              <button
                onClick={refreshItems}
                className={`p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white cursor-pointer transition-all ${
                  isRefreshing ? "animate-spin text-cyan-400" : ""
                }`}
                title="Refresh Files"
              >
                <RefreshCw size={12} />
              </button>
              
              <span className="text-[10px] text-white/25 font-mono">
                {wsSelectedFile ? "1 asset" : `${sortedItems.length} items`}
              </span>
            </div>
          </div>

          {/* Main Body view */}
          <div className="flex-1 overflow-hidden min-h-0 relative">
            
            {/* 1. Connected Deviceslinking view modeled exactly like the mock screenshot */}
            {activeTab === "connected-devices" && !wsSelectedFile && (
              <div className="w-full h-full p-8 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
                <div className="max-w-xl w-full text-left space-y-5">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white">Connected Devices</h1>
                    <p className="text-xs text-white/40 mt-1 font-semibold leading-relaxed">
                      Devices with AURA OS access — George can read files from all connected devices
                    </p>
                  </div>

                  {/* High-fidelity dashed device linker container */}
                  <div className="border border-dashed border-white/10 rounded-[2rem] bg-white/[0.01] p-10 flex flex-col items-center justify-center text-center gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    
                    {/* Globe Logo with floating neon pulse ring */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl scale-125 animate-pulse" />
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600/10 via-[#0d0f1e] to-indigo-600/10 border border-white/10 flex items-center justify-center text-cyan-400 relative shadow-2xl">
                        <Globe size={36} className="animate-[spin_40s_linear_infinite]" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-white text-base">Add a Device</h3>
                      <p className="text-xs text-white/45 max-w-sm leading-relaxed">
                        Install AURA OS on your phone or another computer, then open:
                      </p>
                    </div>

                    {/* Dynamic connection endpoint anchor */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl px-5 py-3 shadow-inner">
                      <code className="text-xs text-cyan-300 font-mono font-bold tracking-wide select-all">
                        http://{deviceIp}:3000/os
                      </code>
                    </div>

                    <p className="text-[10px] text-white/25 max-w-xs leading-normal">
                      The device will auto-register and appear here. George gains read access to its files.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Code Apps File Explorer view */}
            {activeTab === "code-apps" && !wsSelectedFile && (
              <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-white/50 uppercase tracking-widest font-mono">
                    {activeAppId ? "Project Source Tree" : "All Projects"}
                  </h3>
                </div>

                {!activeAppId ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl border bg-white/[0.01] hover:bg-white/[0.02] border-emerald-500/10 transition-all cursor-pointer flex flex-col justify-between h-28 hover:scale-[1.01] hover:shadow-2xl hover:border-emerald-500/30"
                        onClick={() => openAppFolder(p.id)}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-emerald-400"><Code className="w-4 h-4" /></span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white tracking-wide truncate">{p.name}</h5>
                          <p className="text-[8px] text-white/35 font-mono uppercase mt-0.5">{p.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {appFileTree.map((item, idx) => {
                      const isFolder = item.type === "directory";
                      return (
                        <div
                          key={item.path + idx}
                          className={`p-4 rounded-2xl border bg-white/[0.01] hover:bg-white/[0.02] border-white/5 transition-all cursor-pointer flex flex-col justify-between h-28 hover:scale-[1.01] hover:shadow-2xl hover:border-cyan-500/20`}
                          onClick={() => {
                            if (isFolder) {
                               // Folder drill-down inside app (needs recursive fetch, but for simple MVP we just open files)
                            } else {
                               openAppFile(item);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span className={isFolder ? "text-blue-400" : "text-cyan-400"}>
                              {isFolder ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </span>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white tracking-wide truncate">{item.name}</h5>
                            <p className="text-[8px] text-white/35 font-mono uppercase mt-0.5">{isFolder ? "Directory" : "File"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. Standard Grid Folder & Files view */}
            {activeTab !== "connected-devices" && activeTab !== "code-apps" && !wsSelectedFile && (
              <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
                
                {/* Search / Directory Header information */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-white/50 uppercase tracking-widest font-mono">
                    {wsCurrentFolder ? "Folder Contents" : "Directory Root"}
                  </h3>
                  <button
                    onClick={syncWorkspaceWithGeorge}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <BrainCircuit size={11} /> Sync George Brain
                  </button>
                </div>

                {sortedItems.length === 0 ? (
                  <div className="py-24 text-center border border-dashed border-white/[0.03] rounded-[2rem] bg-white/[0.005]">
                    <Upload className="w-12 h-12 mx-auto text-white/5 mb-3 animate-pulse" />
                    <h5 className="font-bold text-white/40 text-sm">Directory Empty</h5>
                    <p className="text-[10px] text-white/20 font-mono mt-1 max-w-xs mx-auto leading-relaxed">
                      Create a file or folder, or drag-and-drop local assets here to persist them inside Aura OS.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedItems.map((item) => {
                      const isFolder = item.type === "folder";

                      if (isFolder) {
                        const childrenCount = wsItems.filter((i) => i.parentId === item.id).length;
                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border bg-white/[0.01] hover:bg-white/[0.02] border-white/5 transition-all cursor-pointer flex flex-col justify-between h-28 hover:scale-[1.01] hover:shadow-2xl hover:border-cyan-500/20`}
                            onClick={() => setWsCurrentFolder(item.id)}
                          >
                            <div className="flex justify-between items-start">
                              <span className={getFolderColorClass(item.name)}>
                                {getFolderIcon(item.name)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWsItem(item.id);
                                }}
                                className="text-white/25 hover:text-red-400 transition-colors p-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white tracking-wide truncate">{item.name}</h5>
                              <p className="text-[8px] text-white/35 font-mono uppercase mt-0.5">{childrenCount} items</p>
                            </div>
                          </div>
                        );
                      } else {
                        const ext = item.name.split(".").pop()?.toUpperCase() || "FILE";
                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-purple-500/20 transition-all cursor-pointer flex flex-col justify-between h-28 hover:scale-[1.01] hover:shadow-2xl"
                            onClick={() => setWsSelectedFile(item)}
                          >
                            <div className="flex justify-between items-start">
                              {getFileIcon(item.name, !!item.isBinary)}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWsItem(item.id);
                                }}
                                className="text-white/25 hover:text-red-400 transition-colors p-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white/80 tracking-wide truncate">{item.name}</h5>
                              <p className="text-[8px] text-white/35 font-mono uppercase mt-0.5">
                                {ext} {item.isBinary ? "• BINARY" : "• TEXT"}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. High-Fidelity Interactive Asset Viewer & IDE Editor */}
            {wsSelectedFile && (
              <div className="w-full h-full p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                
                {/* Editor control header */}
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWsSelectedFile(null)}
                      className="text-xs text-white/40 hover:text-white font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      &larr; Back
                    </button>
                    <span className="text-white/20">|</span>
                    <h4 className="text-xs font-bold text-white font-mono max-w-md truncate">
                      {wsSelectedFile.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInjectFileToGeorge}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-cyan-500/40 transition-all cursor-pointer"
                    >
                      <BrainCircuit size={11} /> Ingest to George
                    </button>
                    {!wsSelectedFile.isBinary && (
                      <button
                        onClick={async () => {
                          if (!wsSelectedFile.content?.trim()) return;
                          await onInjectCode(wsSelectedFile.content);
                          alert("Code logic successfully executed into compiler pipeline!");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-emerald-500/40 transition-all cursor-pointer animate-pulse"
                      >
                        <Play size={11} /> Compile Target
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Render Grid */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-hidden">
                  
                  {/* Left Viewport Pane */}
                  <div className="flex-1 min-h-0 flex flex-col bg-black/25 border border-white/[0.04] rounded-2xl overflow-hidden shadow-2xl relative">
                    {(() => {
                      const ext = wsSelectedFile.name.split(".").pop()?.toLowerCase() || "";
                      const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico"].includes(ext);

                      if (wsSelectedFile.isBinary) {
                        if (isImage) {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 min-h-[320px]">
                              <img
                                src={`/api/sandbox/workspace/file/${wsSelectedFile.id}/raw`}
                                alt={wsSelectedFile.name}
                                className="max-h-[360px] max-w-full rounded-xl object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 transition-transform hover:scale-[1.01]"
                              />
                              <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 text-[9px] text-white/55 font-mono">
                                Format: {ext.toUpperCase()} (Binary Asset)
                              </div>
                            </div>
                          );
                        } else if (ext === "pdf") {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 gap-5">
                              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-[0_0_35px_rgba(239,68,68,0.15)]">
                                <FileText size={32} />
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-extrabold text-white text-sm">{wsSelectedFile.name}</h5>
                                <p className="text-[10px] text-white/35 font-mono">Portable Document Format</p>
                              </div>
                              <a
                                href={`/api/sandbox/workspace/file/${wsSelectedFile.id}/raw`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 bg-gradient-to-r from-rose-600/80 to-red-600/80 hover:from-rose-600 hover:to-red-600 border border-rose-500/30 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-rose-500/25"
                              >
                                View Document Portal
                              </a>
                            </div>
                          );
                        } else {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 gap-5">
                              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
                                <Layers size={32} />
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-extrabold text-white text-sm">{wsSelectedFile.name}</h5>
                                <p className="text-[10px] text-white/35 font-mono">Sovereign Archive Compressed Asset</p>
                              </div>
                              <a
                                href={`/api/sandbox/workspace/file/${wsSelectedFile.id}/raw`}
                                download={wsSelectedFile.name}
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-600 hover:to-indigo-600 border border-purple-500/30 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-purple-500/25"
                              >
                                Download Archive File
                              </a>
                            </div>
                          );
                        }
                      }

                      return (
                        <textarea
                          value={wsSelectedFile.content || ""}
                          onChange={(e) =>
                            setWsSelectedFile((f: any) => ({ ...f, content: e.target.value }))
                          }
                          onBlur={(e) => updateWsItem(wsSelectedFile.id, e.target.value)}
                          className="w-full h-full bg-transparent font-mono text-[11px] text-white/80 p-4 focus:outline-none resize-none leading-relaxed custom-scrollbar"
                          placeholder="// Secure workspace file. Start typing to write details..."
                        />
                      );
                    })()}
                  </div>

                  {/* Right Compilation / Patching Pane for Code Files */}
                  {!wsSelectedFile.isBinary && (
                    <div className="w-full md:w-64 flex flex-col justify-between bg-black/20 border border-white/[0.04] rounded-2xl p-4 flex-shrink-0 gap-4">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Terminal size={12} /> Delta Compiler
                        </h5>
                        <p className="text-[10px] text-white/40 leading-relaxed font-mono">
                          Toggle compile parameters to apply atomic segment patches inside the live layout index.
                        </p>
                        
                        <div className="flex gap-1.5">
                          {["free", "patch"].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setSandboxMode(mode)}
                              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                                sandboxMode === mode
                                  ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"
                                  : "bg-white/5 border-transparent text-white/30 hover:text-white/60"
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>

                        {sandboxMode === "patch" && (
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="text-[8px] uppercase tracking-wide text-white/40 font-bold block mb-1">Target Path</label>
                              <input
                                type="text"
                                value={sandboxTargetFile}
                                onChange={(e) => setSandboxTargetFile(e.target.value)}
                                placeholder="e.g. src/App.tsx"
                                className="w-full bg-white/[0.03] border border-white/10 text-[9px] font-mono p-2 rounded-lg focus:outline-none focus:border-cyan-500/20 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] uppercase tracking-wide text-white/40 font-bold block mb-1">Target Statement</label>
                              <textarea
                                value={sandboxPatchTarget}
                                onChange={(e) => setSandboxPatchTarget(e.target.value)}
                                placeholder="Paste statement to locate..."
                                className="w-full h-12 bg-white/[0.03] border border-white/10 text-[9px] font-mono p-2 rounded-lg focus:outline-none focus:border-cyan-500/20 text-white resize-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] uppercase tracking-wide text-white/40 font-bold block mb-1">Replacement Statement</label>
                              <textarea
                                value={sandboxPatchReplacement}
                                onChange={(e) => setSandboxPatchReplacement(e.target.value)}
                                placeholder="Paste replacement code..."
                                className="w-full h-12 bg-white/[0.03] border border-white/10 text-[9px] font-mono p-2 rounded-lg focus:outline-none focus:border-cyan-500/20 text-white resize-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        disabled={!activeProject}
                        onClick={async () => {
                          if (!activeProject) return;
                          try {
                            if (sandboxMode === "free") {
                              if (!wsSelectedFile.content?.trim()) return;
                              await onInjectCode(wsSelectedFile.content);
                              alert("Compilation injected successfully.");
                            } else {
                              if (!sandboxTargetFile || !sandboxPatchTarget) return;
                              const r = await fetch(`/api/projects/${activeProject.id}/patch`, {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({
                                   path: sandboxTargetFile,
                                   target: sandboxPatchTarget,
                                   replacement: sandboxPatchReplacement,
                                 }),
                              });
                              if (r.ok) {
                                alert("Patch applied successfully.");
                                setSandboxPatchTarget("");
                                setSandboxPatchReplacement("");
                              } else {
                                const err = await r.json();
                                alert("Patch Compile Error: " + err.error);
                              }
                            }
                          } catch {
                            alert("System pipeline exception.");
                          }
                        }}
                        className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 disabled:opacity-20 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest hover:scale-[1.01] transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                      >
                        Push Segment Delta
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
