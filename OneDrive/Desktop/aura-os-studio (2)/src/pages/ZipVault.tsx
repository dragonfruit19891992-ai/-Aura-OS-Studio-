import React, { useState, useEffect, useRef } from "react";
import {
  FolderArchive, Upload, Sparkles, Plus, Download, X,
  FileText, FolderOpen, Folder, ArrowUp, Zap, RotateCw,
  Laptop, Tablet, Smartphone, Lock, Unlock, Globe, Cpu,
  FileCode, CheckCircle2, AlertCircle, Terminal, HelpCircle
} from "lucide-react";
import { Project } from "../types";
import JSZip from "jszip";

interface ZipVaultProps {
  activeProject: Project | null;
  onImportProject: (meta: Project) => void;
  onRefreshProjects: () => void;
  apiKey: string;
  ollamaCloudKey: string;
  ollamaModel: string;
  preferLocal: boolean;
}

export default function ZipVault({
  activeProject,
  onImportProject,
  onRefreshProjects,
  apiKey,
  ollamaCloudKey,
  ollamaModel,
  preferLocal
}: ZipVaultProps) {
  const [storedZips, setStoredZips] = useState<any[]>([]);
  const [activeZip, setActiveZip] = useState<any | null>(null);
  const [zipTree, setZipTree] = useState<any[]>([]);
  const [zipSelected, setZipSelected] = useState<any | null>(null);
  const [zipContent, setZipContent] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [zipTreeLoading, setZipTreeLoading] = useState(false);
  const [zipChatTab, setZipChatTab] = useState("ui"); // Used for workbench tabs: "ui", "secrets", "readme"
  
  // Custom Scanner States
  const [zipTechStack, setZipTechStack] = useState<{ dependencies: string[]; devDependencies: string[]; scripts: Record<string, string> | null }>({ dependencies: [], devDependencies: [], scripts: null });
  const [zipSecrets, setZipSecrets] = useState<string[]>([]);
  const [zipAPIs, setZipAPIs] = useState<{ method: string; path: string }[]>([]);
  const [zipHooks, setZipHooks] = useState<string[]>([]);
  const [zipReadMe, setZipReadMe] = useState<string>("");
  const [zipReadMeEdited, setZipReadMeEdited] = useState<string>("");
  const [conflicts, setConflicts] = useState<{ type: string; desc: string; fixable: boolean; metadata?: any }[]>([]);
  const [previewWidth, setPreviewWidth] = useState<string>("100%");

  const loadStoredZips = () => {
    fetch("/api/zips")
      .then((r) => r.json())
      .then((d) => {
        const sorted = (Array.isArray(d) ? d : []).sort((a: any, b: any) => {
          if (!a.name || !b.name) return 0;
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        });
        setStoredZips(sorted);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadStoredZips();
  }, []);

  const BINARY_EXTENSIONS = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|eot|mp3|mp4|zip|pdf|exe|dll|so|dylib|tar|gz|obj|fbx|gltf|glb|stl|blend|hdr|exr)$/i;

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    
    setZipLoading(true);
    
    try {
      for (const file of selectedFiles) {
        try {
          const buffer = await file.arrayBuffer();
          const zip = new JSZip();
          const content = await zip.loadAsync(buffer);
          const files: any[] = [];
          const promises: any[] = [];
    
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
    
          await Promise.all(promises);
    
          await fetch("/api/zips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name.replace(/\.zip$/i, ""), files }),
          });
        } catch (err) {
          console.error(`Failed to upload ${file.name}`, err);
        }
      }
      
      loadStoredZips();
      
      // Open the last uploaded zip if any
      const res = await fetch("/api/zips");
      const allZips = await res.json();
      if (allZips.length > 0) openStoredZip(allZips[allZips.length - 1]);
      
    } finally {
      setZipLoading(false);
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    
    setZipLoading(true);
    try {
      // Group files by top-level folder name
      const groups: Record<string, any[]> = {};
      const promises: any[] = [];
      
      for (const file of selectedFiles) {
        const pathParts = (file as any).webkitRelativePath.split('/');
        const topFolder = pathParts[0] || 'uploaded-folder';
        const relPath = pathParts.slice(1).join('/') || file.name;
        
        if (!groups[topFolder]) groups[topFolder] = [];
        
        const isBinary = BINARY_EXTENSIONS.test(file.name);
        promises.push(
          new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const result = evt.target?.result as string;
              if (isBinary) {
                 const base64 = result.split(',')[1];
                 groups[topFolder].push({ path: relPath, content: base64, isBinary: true });
              } else {
                 groups[topFolder].push({ path: relPath, content: result, isBinary: false });
              }
              resolve();
            };
            if (isBinary) reader.readAsDataURL(file);
            else reader.readAsText(file);
          })
        );
      }
      
      await Promise.all(promises);
      
      // Upload each folder group as its own "zip"
      for (const folderName of Object.keys(groups)) {
        await fetch("/api/zips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: folderName, files: groups[folderName] }),
        });
      }
      
      loadStoredZips();
      
      const res = await fetch("/api/zips");
      const allZips = await res.json();
      if (allZips.length > 0) openStoredZip(allZips[allZips.length - 1]);
      
    } catch (err) {
      console.error("Folder upload failed", err);
    } finally {
      setZipLoading(false);
    }
  };

  const openStoredZip = async (zip: any) => {
    setActiveZip(zip);
    setZipTree([]);
    setZipSelected(null);
    setZipContent("");
    setZipTreeLoading(true);

    try {
      // Phase 2 Service Isolation: Spin up isolated compartment runtime
      await fetch(`/api/runtime/start/${zip.id}`, { method: "POST" }).catch(err => {
        console.error("Failed to start runtime:", err);
      });
      
      const r = await fetch(`/api/zips/${zip.id}/tree`);
      if (!r.ok) {
        throw new Error(`Failed to fetch tree: ${r.status}`);
      }
      const tree = await r.json();
      setZipTree(tree);
      // Trigger dynamic workspace scans
      scanZipFiles(zip.id, tree, zip);
    } catch (err) {
      console.error("Error in openStoredZip:", err);
    } finally {
      setZipTreeLoading(false);
    }
  };

  // Static code scanner function
  const scanZipFiles = async (zipId: string, tree: any[], zipMeta: any) => {
    // Reset scanner states
    setZipTechStack({ dependencies: [], devDependencies: [], scripts: null });
    setZipSecrets([]);
    setZipAPIs([]);
    setZipHooks([]);
    setZipReadMe("");

    // Recursive helper to find files in tree
    const getPaths = (nodes: any[]): string[] => {
      let paths: string[] = [];
      for (const node of nodes) {
        if (node.type === "file") {
          paths.push(node.path);
        } else if (node.type === "folder" && node.children) {
          paths.push(...getPaths(node.children));
        }
      }
      return paths;
    };
    const allFilePaths = getPaths(tree);

    // 1. Scan package.json for technology dependencies
    const packageJsonPath = allFilePaths.find(p => p.toLowerCase().endsWith("package.json"));
    let pkgObj: any = null;
    if (packageJsonPath) {
      try {
        const r = await fetch(`/api/zips/${zipId}/file?path=${encodeURIComponent(packageJsonPath)}`).then(res => res.json());
        pkgObj = JSON.parse(r.content);
        if (pkgObj) {
          setZipTechStack({
            dependencies: Object.keys(pkgObj.dependencies || {}),
            devDependencies: Object.keys(pkgObj.devDependencies || {}),
            scripts: pkgObj.scripts || null
          });
        }
      } catch (err) {}
    }

    // 2. Scan for secrets/env keys from .env.example
    const envExamplePath = allFilePaths.find(p => p.toLowerCase().endsWith(".env.example") || p.toLowerCase().endsWith(".env"));
    const detectedSecretsSet = new Set<string>();
    if (envExamplePath) {
      try {
        const r = await fetch(`/api/zips/${zipId}/file?path=${encodeURIComponent(envExamplePath)}`).then(res => res.json());
        const lines = r.content.split("\n");
        lines.forEach((line: string) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const key = trimmed.split("=")[0].trim();
            if (key) detectedSecretsSet.add(key);
          }
        });
      } catch (err) {}
    }

    // Scan top 6 script files for secrets, hooks, and API endpoints
    const codeFilePaths = allFilePaths.filter(p => /\.(ts|tsx|js|jsx)$/i.test(p));
    const detectedHooksSet = new Set<string>();
    const detectedAPIsList: { method: string; path: string }[] = [];

    const filesToScan = codeFilePaths.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower.includes("server.ts") || aLower.includes("app.tsx")) return -1;
      if (bLower.includes("server.ts") || bLower.includes("app.tsx")) return 1;
      return 0;
    }).slice(0, 6);

    for (const filePath of filesToScan) {
      try {
        const r = await fetch(`/api/zips/${zipId}/file?path=${encodeURIComponent(filePath)}`).then(res => res.json());
        const code = r.content || "";

        // a) Extract environment secrets references (process.env.XXX)
        const envRegex = /process\.env\.([A-Z0-9_]+)/g;
        let match;
        while ((match = envRegex.exec(code)) !== null) {
          detectedSecretsSet.add(match[1]);
        }

        // b) Extract React/Custom hooks (useXXX)
        const hookRegex = /\b(use[A-Z][a-zA-Z0-9_]+)\b/g;
        let hookMatch;
        while ((hookMatch = hookRegex.exec(code)) !== null) {
          detectedHooksSet.add(hookMatch[1]);
        }

        // c) Extract Express API endpoints
        const apiRegex = /app\.(get|post|delete|put)\(\s*['"`](\/api\/[^'"`\s]+)['"`]/gi;
        let apiMatch;
        while ((apiMatch = apiRegex.exec(code)) !== null) {
          const method = apiMatch[1].toUpperCase();
          const routePath = apiMatch[2];
          if (!detectedAPIsList.some(a => a.method === method && a.path === routePath)) {
            detectedAPIsList.push({ method, path: routePath });
          }
        }
      } catch (err) {}
    }

    setZipSecrets(Array.from(detectedSecretsSet));
    setZipHooks(Array.from(detectedHooksSet));
    setZipAPIs(detectedAPIsList);

    // Conflict Scanner
    const detectedConflicts: typeof conflicts = [];
    if (pkgObj) {
      const deps = Object.keys(pkgObj.dependencies || {});
      const devDeps = Object.keys(pkgObj.devDependencies || {});
      deps.forEach(d => {
        if (devDeps.includes(d)) {
          detectedConflicts.push({
            type: "Dependency Overlap",
            desc: `"${d}" is declared in both production dependencies and devDependencies in package.json.`,
            fixable: true,
            metadata: { type: "dependency", key: d }
          });
        }
      });
    }

    const rootConfigFiles = allFilePaths.filter(p => !p.includes("/") && /(vite\.config|webpack\.config|rollup\.config|next\.config)\.[a-z]+$/i.test(p));
    if (rootConfigFiles.length > 1) {
      detectedConflicts.push({
        type: "Multiple Bundler Configurations",
        desc: `Found multiple build systems: ${rootConfigFiles.join(", ")}. This can cause execution conflict.`,
        fixable: false
      });
    }

    const fileNamesMap = new Map<string, string[]>();
    allFilePaths.forEach(p => {
      const parts = p.split("/");
      const name = parts[parts.length - 1];
      if (!fileNamesMap.has(name)) {
        fileNamesMap.set(name, []);
      }
      fileNamesMap.get(name)!.push(p);
    });

    fileNamesMap.forEach((paths, name) => {
      if (paths.length > 1 && name !== "index.css" && name !== "index.html" && name !== "package.json" && name !== "tsconfig.json" && name !== ".gitignore" && name !== "README.md" && name !== ".env.example") {
        detectedConflicts.push({
          type: "Duplicate File Name",
          desc: `"${name}" exists at multiple paths: ${paths.join(", ")}. Ensure they do not cause import ambiguity.`,
          fixable: false
        });
      }
    });

    setConflicts(detectedConflicts);

    // 3. Compile clean dynamic README compilation
    const folderTreeStr = getVisualTreeString(tree, 0);
    const appName = pkgObj?.name || zipMeta.name;
    const appDesc = pkgObj?.description || "A sovereign Aura OS system shell applet.";
    const scriptsSection = pkgObj?.scripts 
      ? Object.entries(pkgObj.scripts).map(([name, cmd]) => `* **npm run ${name}**: \`${cmd}\``).join("\n")
      : "* No lifecycle executable scripts defined in package.";

    const doc = `
# 🚀 SOVEREIGN BLUEPRINT: ${appName.toUpperCase()}
*Clean clean-room system compilation — zero duplicates, 100% integrity.*

---

## 📖 System Profile & Intent
${appDesc}

---

## 🛠️ Technology Specs
* **Runtime Core**: Node.js & Vite Hybrid Architecture
* **Interface layer**: ${pkgObj?.dependencies?.react ? `React Engine ${pkgObj.dependencies.react.replace(/[\^~]/, "")}` : "React 19 Sandbox Mode"}
* **Styling Context**: ${pkgObj?.dependencies?.tailwindcss || pkgObj?.devDependencies?.tailwindcss ? "Tailwind Utility" : "Standard Vanilla CSS"}
* **Module Identity**: \`${appName}@${pkgObj?.version || "1.0.0"}\` (\`type: "module"\`)

---

## 🗂️ CLEAN ARCHITECTURE DIRECTORY
\`\`\`text
${folderTreeStr}
\`\`\`

---

## 🚀 Lifecycle Scripts & Runs
${scriptsSection}
    `.trim();

    setZipReadMe(doc);
    setZipReadMeEdited(doc);
  };

  const getVisualTreeString = (nodes: any[], depth: number): string => {
    let output = "";
    nodes.forEach(node => {
      const indent = "  ".repeat(depth);
      if (node.type === "folder") {
        output += `${indent}📁 ${node.name}/\n`;
        if (node.children) {
          output += getVisualTreeString(node.children, depth + 1);
        }
      } else {
        output += `${indent}📄 ${node.name}\n`;
      }
    });
    return output;
  };

  const selectNodeFile = async (node: any) => {
    if (node.type === "folder") return;
    setZipSelected(node);
    setZipContent("Reading contents...");
    try {
      const r = await fetch(
        `/api/zips/${activeZip.id}/file?path=${encodeURIComponent(node.path)}`
      ).then((res) => res.json());
      setZipContent(r.content || "");
    } catch {
      setZipContent("Binary/Failed reading contents.");
    }
  };

  const importAsProjectObj = async () => {
    if (!activeZip) return;
    try {
      const proj = await fetch(`/api/zips/${activeZip.id}/import`, { method: "POST" }).then((r) =>
        r.json()
      );
      onImportProject(proj);
    } catch {
      alert("Import failed.");
    }
  };

  const mergeZipToStudio = async () => {
    if (!activeProject) return alert("Select an active studio project first.");
    if (!confirm(`Merge files from archive "${activeZip.name}" into Project "${activeProject.name}"?`)) return;
    try {
      await fetch(`/api/zips/${activeZip.id}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });
      alert("Merged successfully.");
      onRefreshProjects();
    } catch {
      alert("Merge failed.");
    }
  };

  const saveBlueprint = async () => {
    if (!activeZip) return;
    try {
      const res = await fetch(`/api/zips/${activeZip.id}/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "SYSTEM_BLUEPRINT.md", content: zipReadMeEdited }),
      });
      if (res.ok) {
        alert("SYSTEM_BLUEPRINT.md saved successfully to archive folder!");
        // Refresh the file tree to show the newly added file
        const tree = await fetch(`/api/zips/${activeZip.id}/tree`).then((r) => r.json());
        setZipTree(tree);
      } else {
        alert("Failed to save blueprint file.");
      }
    } catch (err) {
      alert("Error saving blueprint: " + err);
    }
  };

  const resolveConflicts = async () => {
    if (!activeZip) return;
    const overlaps = conflicts.filter(c => c.metadata?.type === "dependency");
    if (overlaps.length === 0) return;

    try {
      // Find package.json in the zip tree
      const getPaths = (nodes: any[]): string[] => {
        let paths: string[] = [];
        for (const node of nodes) {
          if (node.type === "file") {
            paths.push(node.path);
          } else if (node.type === "folder" && node.children) {
            paths.push(...getPaths(node.children));
          }
        }
        return paths;
      };
      const allPaths = getPaths(zipTree);
      const packageJsonPath = allPaths.find(p => p.toLowerCase().endsWith("package.json"));
      if (!packageJsonPath) {
        alert("package.json not found in archive.");
        return;
      }

      const r = await fetch(`/api/zips/${activeZip.id}/file?path=${encodeURIComponent(packageJsonPath)}`).then(res => res.json());
      const pkg = JSON.parse(r.content);
      
      if (pkg && pkg.devDependencies) {
        overlaps.forEach(o => {
          const depKey = o.metadata.key;
          if (pkg.devDependencies[depKey]) {
            delete pkg.devDependencies[depKey];
          }
        });

        // Write package.json back to active zip
        const writeRes = await fetch(`/api/zips/${activeZip.id}/file`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: packageJsonPath,
            content: JSON.stringify(pkg, null, 2)
          })
        });

        if (writeRes.ok) {
          alert("Successfully resolved all dependency duplicates and cleansed package.json!");
          // Re-scan zip tree to update everything
          openStoredZip(activeZip);
        } else {
          alert("Failed to write updated package.json");
        }
      }
    } catch (err) {
      alert("Error resolving duplicates: " + err);
    }
  };

  const reloadIframe = () => {
    const iframe = document.getElementById("sandbox-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = resolveIndexHtml();
    }
  };

  const resolveIndexHtml = () => {
    if (!activeZip) return "about:blank";
    // Point to the isolated proxy gateway
    return `/api/gateway/${activeZip.id}/`;
  };

  // Node Component for File Tree
  const ZipNode: React.FC<{ node: any; depth: number }> = ({ node, depth }) => {
    const [open, setOpen] = useState(depth < 2);
    const isFolder = node.type === "folder";
    return (
      <div>
        <div
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer text-xs font-mono transition-colors ${
            zipSelected?.path === node.path ? "bg-purple-500/25 text-purple-200" : "hover:bg-white/5 text-white/50"
          }`}
          style={{ paddingLeft: `${depth * 10 + 8}px` }}
          onClick={() => (isFolder ? setOpen((o) => !o) : selectNodeFile(node))}
        >
          {isFolder ? (
            open ? (
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-cyan-500" />
            )
          ) : (
            <FileText className="w-3 h-3 text-white/20" />
          )}
          <span className="truncate flex-1">{node.name}</span>
        </div>
        {isFolder && open && node.children?.map((c: any, i: number) => (
          <ZipNode key={i} node={c} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#07070b]">
      {/* Vault List */}
      <div className="w-56 border-r border-white/5 bg-[#080810] flex flex-col flex-shrink-0">
        <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between">
          <span className="text-[9px] text-white/50 uppercase tracking-widest font-black flex items-center gap-1">
            <FolderArchive className="w-3.5 h-3.5 text-purple-400" /> Architect Vault ZipVault 1
            </span>
            <div className="flex gap-2">
              <label className="cursor-pointer" title="Upload Zip File(s)">
                <Upload className="w-3.5 h-3.5 text-white/25 hover:text-cyan-400 transition-colors" />
                <input type="file" accept=".zip" multiple className="hidden" onChange={handleZipUpload} />
              </label>
              <label className="cursor-pointer" title="Upload Open Folder">
                <FolderOpen className="w-3.5 h-3.5 text-white/25 hover:text-purple-400 transition-colors" />
                <input type="file" multiple {...{webkitdirectory: "", directory: ""} as any} className="hidden" onChange={handleFolderUpload} />
              </label>
            </div>
          </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
            {zipLoading && (
              <div className="px-3 py-3 text-[10px] text-white/40 flex items-center gap-2">
                <RotateCw className="w-3 h-3 animate-spin" /> Ingesting zip...
              </div>
            )}
            
            {(() => {
              const sortedZips = [...storedZips].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
              
              const renderZip = (z: any) => (
                <button
                  key={z.id}
                  onClick={() => openStoredZip(z)}
                  className={`w-full text-left px-3 py-2.5 flex items-start gap-2 border-b border-white/[0.03] transition-all ${
                    activeZip?.id === z.id ? "bg-purple-500/15 border-l-2 border-l-purple-400" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <FolderArchive className="w-3.5 h-3.5 mt-0.5 text-purple-300 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-white/70 truncate">{z.name}</div>
                    <div className="text-[8px] text-white/25 font-mono mt-0.5">
                      {z.fileCount} files
                    </div>
                  </div>
                </button>
              );

              return (
                <>
                  {sortedZips.length > 0 && (
                    <div className="text-[9px] font-mono text-emerald-400/50 uppercase px-3 pt-4 pb-2 font-bold tracking-widest border-b border-white/5">
                      Architect Archives
                    </div>
                  )}
                  {sortedZips.map(renderZip)}
                </>
              );
            })()}
          </div>
      </div>

      {/* Code Browser tree */}
      <div className="w-52 border-r border-white/5 bg-[#06060d] flex flex-col flex-shrink-0">
        {activeZip ? (
          <>
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-white/40 font-mono truncate">{activeZip.name}</span>
              <button
                onClick={importAsProjectObj}
                className="p-1 hover:bg-cyan-500/15 rounded transition-all cursor-pointer"
                title="Launch to Active Studio Workspace"
              >
                <Download className="w-3.5 h-3.5 text-white/30 hover:text-cyan-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
              {zipTreeLoading ? (
                <div className="flex items-center justify-center p-6 text-[9px] font-mono text-purple-400 animate-pulse">Walking files...</div>
              ) : zipTree && zipTree.length > 0 ? (
                zipTree.map((node, i) => <ZipNode key={i} node={node} depth={0} />)
              ) : (
                <div className="flex items-center justify-center p-6 text-[9px] font-mono text-white/30">No files found or unable to read archive.</div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-center text-white/20 text-[9px] font-mono select-none">
            Awaiting Archive Selection
          </div>
        )}
      </div>

      {/* Workspace center */}
      {activeZip ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 border-b border-white/5 flex items-center px-4 bg-[#0a0a14] justify-between flex-shrink-0">
            <div className="flex gap-2 font-mono">
              {["ui", "secrets", "readme"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setZipChatTab(tab)}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    zipChatTab === tab ? "bg-purple-600/35 text-purple-200 border border-purple-500/30" : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab === "ui" ? "Live UI Simulator" : tab === "secrets" ? "Secrets, APIs & Hooks" : "System README"}
                </button>
              ))}
            </div>
            <button
              onClick={mergeZipToStudio}
              disabled={!activeProject}
              className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer disabled:opacity-20 font-mono"
            >
              <Plus size={11} /> Merge with active project
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Split layout if a code file is explicitly selected */}
            {zipSelected && zipChatTab !== "ui" && (
              <div className="border-b border-white/5 flex-shrink-0 h-44 bg-[#040408] relative">
                <div className="h-6 bg-[#060609] border-b border-white/5 flex items-center px-3 justify-between text-[8px] text-white/40 font-mono select-none">
                  <span>📄 {zipSelected.path}</span>
                  <button onClick={() => setZipSelected(null)} className="text-white/20 hover:text-white"><X size={10} /></button>
                </div>
                <textarea
                  readOnly
                  value={zipContent}
                  className="w-full h-36 bg-transparent p-4 text-[10px] font-mono text-cyan-200/80 focus:outline-none resize-none custom-scrollbar"
                />
              </div>
            )}

            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
              
              {/* TAB 1: LIVE UI SIMULATOR */}
              {zipChatTab === "ui" && (
                <div className="flex-1 flex flex-col bg-[#050508] p-4 overflow-y-auto custom-scrollbar">
                  {/* Browser Shell Mockup Frame */}
                  <div className="w-full flex-1 flex flex-col border border-white/10 rounded-xl bg-[#090910] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    
                    {/* Simulated Browser Bar */}
                    <div className="h-9 flex items-center px-4 gap-4 bg-[#0b0b14] border-b border-white/5 rounded-t-xl select-none flex-shrink-0">
                      
                      {/* Red Yellow Green Dots */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                      </div>

                      {/* Tab label */}
                      <div className="h-6 px-3 bg-[#07070b] border-x border-t border-white/5 rounded-t-md flex items-center text-[9px] text-white/60 font-mono max-w-[120px] truncate">
                        {activeZip.name}
                      </div>

                      {/* Reload and URL Bar */}
                      <button onClick={reloadIframe} className="p-1 text-white/30 hover:text-white" title="Reload simulator frame">
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <div className="flex-1 bg-[#07070b] border border-white/5 rounded-md px-3 h-6 flex items-center justify-between text-[9px] font-mono text-white/20 select-all truncate">
                        <span>http://localhost:3000/api/gateway/{activeZip.id}/</span>
                        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400" />
                      </div>

                      {/* Responsiveness Width Controls */}
                      <div className="flex items-center gap-1 bg-[#07070b] border border-white/5 rounded-md p-0.5 flex-shrink-0">
                        {[
                          { w: "100%", icon: <Laptop size={10} />, label: "Desktop" },
                          { w: "768px", icon: <Tablet size={10} />, label: "Tablet" },
                          { w: "375px", icon: <Smartphone size={10} />, label: "Mobile" }
                        ].map(d => (
                          <button
                            key={d.w}
                            onClick={() => setPreviewWidth(d.w)}
                            className={`p-1 rounded-sm text-[8px] flex items-center gap-1 cursor-pointer transition-colors ${
                              previewWidth === d.w ? "bg-purple-600/40 text-purple-200" : "text-white/20 hover:text-white"
                            }`}
                            title={d.label}
                          >
                            {d.icon}
                          </button>
                        ))}
                      </div>

                    </div>

                    {/* IFrame Viewport Wrapper */}
                    <div className="flex-1 bg-[#050508] p-4 flex justify-center items-center overflow-auto custom-scrollbar">
                      <div
                        style={{ width: previewWidth }}
                        className="h-full border border-white/5 bg-[#030305] rounded shadow-2xl transition-all duration-300 relative overflow-hidden"
                      >
                        <iframe
                          id="sandbox-iframe"
                          src={resolveIndexHtml()}
                          className="w-full h-full border-0 bg-transparent"
                          title="Sandbox Simulator Frame"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: SECRETS, APIS & HOOKS SCANNER */}
              {zipChatTab === "secrets" && (
                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-[#07070b]">
                  
                  {/* Summary Stat */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Secrets Scanned */}
                    <div className="bg-[#0b0b14] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-mono">System Env Secrets</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{zipSecrets.length}</div>
                      <p className="text-[9px] text-white/20 mt-1">Extracted process.env bindings and configurations.</p>
                    </div>

                    {/* APIs Scanned */}
                    <div className="bg-[#0b0b14] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-mono">API Endpoints</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{zipAPIs.length}</div>
                      <p className="text-[9px] text-white/20 mt-1">Express API routing bindings found in backend controllers.</p>
                    </div>

                    {/* React Hooks Scanned */}
                    <div className="bg-[#0b0b14] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-mono">System Hooks</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{zipHooks.length}</div>
                      <p className="text-[9px] text-white/20 mt-1">State and logic hook references detected inside interface code.</p>
                    </div>

                  </div>

                  {/* Deep Analysis Deck */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    
                    {/* Environment Secrets */}
                    <div className="bg-[#0a0a14] border border-white/5 rounded-2xl p-5">
                      <h3 className="text-xs font-black uppercase text-white/80 tracking-widest font-mono flex items-center gap-1.5 mb-4 border-b border-white/5 pb-2">
                        <Lock className="w-3.5 h-3.5 text-purple-400" /> Required Environment Secrets
                      </h3>
                      {zipSecrets.length === 0 ? (
                        <div className="text-[10px] text-white/20 font-mono py-4">No environment secrets detected.</div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                          {zipSecrets.map((sec, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-[10px]">
                              <span className="text-purple-300 font-bold">{sec}</span>
                              <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Unlock size={8} /> Needs Injection
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* APIs Scanned */}
                    <div className="bg-[#0a0a14] border border-white/5 rounded-2xl p-5">
                      <h3 className="text-xs font-black uppercase text-white/80 tracking-widest font-mono flex items-center gap-1.5 mb-4 border-b border-white/5 pb-2">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" /> Express REST APIs
                      </h3>
                      {zipAPIs.length === 0 ? (
                        <div className="text-[10px] text-white/20 font-mono py-4">No Express API endpoints discovered.</div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                          {zipAPIs.map((api, idx) => {
                            const methodColors: Record<string, string> = {
                              GET: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                              POST: "bg-blue-500/10 text-blue-300 border-blue-500/20",
                              DELETE: "bg-red-500/10 text-red-300 border-red-500/20",
                              PUT: "bg-amber-500/10 text-amber-300 border-amber-500/20",
                            };
                            return (
                              <div key={idx} className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-[10px]">
                                <span className={`text-[8px] px-2 py-0.5 rounded-md border font-black ${methodColors[api.method] || "bg-white/5 text-white/50"}`}>
                                  {api.method}
                                </span>
                                <span className="text-white/70 font-mono truncate">{api.path}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Component Logic hooks */}
                    <div className="bg-[#0a0a14] border border-white/5 rounded-2xl p-5 xl:col-span-2">
                      <h3 className="text-xs font-black uppercase text-white/80 tracking-widest font-mono flex items-center gap-1.5 mb-4 border-b border-white/5 pb-2">
                        <Cpu className="w-3.5 h-3.5 text-amber-400" /> Interface Hooks & Logic Context
                      </h3>
                      {zipHooks.length === 0 ? (
                        <div className="text-[10px] text-white/20 font-mono py-4">No logic hook bindings analyzed.</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {zipHooks.map((h, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-amber-500/5 border border-amber-500/15 text-amber-300/90 font-mono text-[9px] px-3 py-1.5 rounded-xl">
                              <Zap size={9} /> {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}              {/* TAB 3: SYSTEM TECH MATRIX & DYNAMIC README */}
              {zipChatTab === "readme" && (
                <div className="flex-1 flex bg-[#07070b] overflow-hidden animate-in fade-in duration-200">
                  
                  {/* Left Tech Stack column */}
                  <div className="w-72 border-r border-white/5 bg-[#090910] p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-shrink-0">
                    
                    {/* Tech Stack list */}
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono mb-3 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Technology Profile
                      </h3>
                      {zipTechStack.dependencies.length === 0 && zipTechStack.devDependencies.length === 0 ? (
                        <div className="text-[9px] font-mono text-white/20">No system packages scanned.</div>
                      ) : (
                        <div className="space-y-3">
                          
                          {/* Dependencies */}
                          {zipTechStack.dependencies.length > 0 && (
                            <div>
                              <div className="text-[8px] text-white/20 font-mono uppercase mb-1">Production Engines</div>
                              <div className="flex flex-wrap gap-1.5">
                                {zipTechStack.dependencies.map(d => {
                                  let color = "bg-white/5 border-white/10 text-white/70";
                                  if (d.includes("react")) color = "bg-purple-500/10 border-purple-500/20 text-purple-300";
                                  if (d.includes("tailwindcss")) color = "bg-cyan-500/10 border-cyan-500/20 text-cyan-300";
                                  if (d.includes("firebase")) color = "bg-amber-500/10 border-amber-500/20 text-amber-300";
                                  if (d.includes("google")) color = "bg-red-500/10 border-red-500/20 text-red-300";
                                  return (
                                    <span key={d} className={`text-[8px] font-mono px-2 py-0.5 rounded-md border font-bold ${color}`}>
                                      {d}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* DevDependencies */}
                          {zipTechStack.devDependencies.length > 0 && (
                            <div className="mt-4">
                              <div className="text-[8px] text-white/20 font-mono uppercase mb-1">Dev Tools & Platforms</div>
                              <div className="flex flex-wrap gap-1.5">
                                {zipTechStack.devDependencies.map(d => (
                                  <span key={d} className="text-[8px] font-mono px-2 py-0.5 rounded-md border border-white/5 bg-white/[0.01] text-white/40">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    {/* Scripts Terminal Panel */}
                    {zipTechStack.scripts && (
                      <div className="border-t border-white/5 pt-4">
                        <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono mb-3 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Workspace Scripts
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(zipTechStack.scripts).map(([name, cmd]) => (
                            <div key={name} className="p-2.5 bg-black/35 border border-white/5 rounded-xl font-mono text-[9px]">
                              <div className="text-emerald-300 font-bold">npm run {name}</div>
                              <div className="text-white/35 mt-0.5 truncate text-[8px]">{cmd}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clean-Room Inspector Widget */}
                    <div className="border-t border-white/5 pt-4">
                      <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Clean-Room Deduplicator
                      </h3>
                      {conflicts.length === 0 ? (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[9px] font-mono text-emerald-300 flex items-center gap-1.5 animate-in fade-in duration-300">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Zero duplicates found. 100% integrity.</span>
                        </div>
                      ) : (
                        <div className="space-y-2 animate-in fade-in duration-300">
                          <div className="text-[8px] text-amber-300/80 font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded flex items-center gap-1">
                            <AlertCircle size={9} /> {conflicts.length} duplicate issues detected.
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                            {conflicts.map((c, idx) => (
                              <div key={idx} className="p-2 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] font-mono">
                                <div className="text-white/70 font-semibold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-400" /> {c.type}
                                </div>
                                <div className="text-white/45 text-[8px] mt-0.5 leading-relaxed">{c.desc}</div>
                              </div>
                            ))}
                          </div>
                          {conflicts.some(c => c.fixable) && (
                            <button
                              onClick={resolveConflicts}
                              className="w-full bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-[8px] font-black uppercase tracking-wider py-1.5 rounded-lg transition-all cursor-pointer font-mono"
                            >
                              Resolve All Duplicates
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Dynamic README reader & editor */}
                  <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden bg-[#07070b]">
                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[40px] pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-600/5 blur-[40px] pointer-events-none" />
                      
                      {/* Editor Title Toolbar */}
                      <div className="h-10 bg-[#090910] border-b border-white/5 flex items-center justify-between px-4 z-10 select-none">
                        <span className="text-[9px] font-bold text-white/50 tracking-wider uppercase font-mono flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM_BLUEPRINT.md
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${conflicts.length === 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-amber-500/10 border-amber-500/20 text-amber-300"}`}>
                            {conflicts.length === 0 ? "Clean room certified" : "Duplicates pending"}
                          </span>
                          
                          <button
                            onClick={saveBlueprint}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-[8px] font-black uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-all font-mono"
                          >
                            <ArrowUp className="w-2.5 h-2.5" /> Save Blueprint to Archive
                          </button>
                        </div>
                      </div>

                      {/* Editable Textarea */}
                      <textarea
                        value={zipReadMeEdited}
                        onChange={(e) => setZipReadMeEdited(e.target.value)}
                        className="w-full flex-1 bg-transparent p-6 text-[10px] font-mono leading-6 text-white/80 focus:outline-none resize-none custom-scrollbar"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
          <FolderArchive className="w-12 h-12 text-white/5 mb-2" />
          <h4 className="text-xs font-black text-white/30 lowercase font-mono">No repository archive loaded</h4>
          <p className="text-[10px] text-white/10 max-w-xs mt-1">Upload a zip file above to mount it into the Archive vault.</p>
        </div>
      )}
    </div>
  );
}
