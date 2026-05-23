import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Monitor, FolderArchive, Code, Layers,
  BrainCircuit, Download, ChevronDown, ArrowLeft, Database, Plus,
  Trash2, Edit2
} from "lucide-react";

import { Project, ChatMessage } from "./types";
import { callAI } from "./utils";
import WorkspaceSandbox from "./pages/WorkspaceSandbox";
import BrainModule from "./pages/BrainModule";
import ZipVault from "./pages/ZipVault";
import StudioHub from "./pages/StudioHub";
import GeorgeCore from "./pages/GeorgeCore";
import StudioCore from "./pages/StudioCore";
import BrainEngine from "./pages/BrainEngine";
import IngestionHub from "./pages/IngestionHub";
import MainStudioLayout from "./layouts/MainStudioLayout";

export default function App() {
  const [module, setModule] = useState<string>("george_core");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [apiKey] = useState(() => localStorage.getItem("aura-gemini-key") || "");
  const [ollamaModel] = useState(() => localStorage.getItem("aura-ollama-model") || "llama3.2:1b");
  const [preferLocal] = useState(() => localStorage.getItem("aura-prefer-local") !== "false");

  const [nexusMsgs, setNexusMsgs] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("aura-nexus-chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [{ role: "george", text: "George standing by." }];
  });
  const [nexusInput, setNexusInput] = useState("");
  const [nexusTyping, setNexusTyping] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const nexusEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { nexusEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [nexusMsgs]);
  
  // Auto-save conversations to localStorage
  useEffect(() => {
    localStorage.setItem("aura-nexus-chat", JSON.stringify(nexusMsgs));
  }, [nexusMsgs]);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => setProjects(d))
      .catch(() => setProjects([]));
  }, []);

  const sendNexus = async () => {
    if (!nexusInput.trim() || nexusTyping) return;
    const text = nexusInput.trim();
    setNexusMsgs(p => [...p, { role: "user", text }]);
    setNexusInput("");
    setNexusTyping(true);
    try {
      const reply = await callAI({ prompt: text, systemPrompt: "You are George.", apiKey, ollamaModel, preferLocal });
      setNexusMsgs(p => [...p, { role: "george", text: reply.text }]);
    } catch {
      setNexusMsgs(p => [...p, { role: "george", text: "Error." }]);
    } finally {
      setNexusTyping(false);
    }
  };

  const feedToGeorge = async (text: string, category: string, img?: string, file?: string) => {
    try {
      const res = await fetch("/api/george/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, category, imageBase64: img, fileName: file }),
      });
      return await res.json();
    } catch { return { ok: false }; }
  };

  // GeorgeCore creates a project → open StudioCore
  const handleGeorgeCoreExecute = (projectId: string, projectName: string) => {
    const proj: Project = { id: projectId, name: projectName, createdAt: new Date().toISOString() };
    setActiveProject(proj);
    setModule("studio_core");
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d)).catch(() => {});
  };

  // StudioCore back → return to george_core
  const handleStudioBack = () => {
    setActiveProject(null);
    setModule("george_core");
  };

  // Full screen modules
  const isFullscreen = module === "studio_core" || module === "brain_engine" || module === "ingestion" || module === "main_studio";

  if (module === "main_studio") {
    return <MainStudioLayout />;
  }

  if (module === "studio_core" && activeProject) {
    return (
      <StudioCore
        projectId={activeProject.id}
        projectName={activeProject.name}
        onBack={handleStudioBack}
      />
    );
  }

  if (module === "brain_engine") {
    return <BrainEngine onBack={() => setModule("desktop")} />;
  }

  if (module === "ingestion") {
    return <IngestionHub onBack={() => setModule("desktop")} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07070B] text-gray-200 overflow-hidden">
      {/* Top bar */}
      <div className="h-6 flex-shrink-0 bg-[#040409] flex items-center px-4 border-b border-white/[0.04]">
        <span className="text-[9px] text-white/25 font-mono uppercase tracking-[0.3em]">Aura OS</span>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-1/2 h-1/2 rounded-full bg-purple-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-1/2 h-1/2 rounded-full bg-cyan-600/5 blur-[120px]" />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0 z-10 pb-16">

          {module === "george_core" && (
            <GeorgeCore onExecuteProject={handleGeorgeCoreExecute} />
          )}

          {module === "desktop" && (
            <div className="px-8 py-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black tracking-tight text-white mb-1">Aura OS</h1>
                <p className="text-white/30 text-sm mb-8">Sovereign AI Platform — 100% Local</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { id: "george_core",  title: "George Core",   icon: <Sparkles className="w-6 h-6 text-cyan-300" />,    desc: "AI architect partner",         color: "from-cyan-600/15" },
                    { id: "projects",     title: "Projects",      icon: <Layers className="w-6 h-6 text-purple-300" />,    desc: "Isolated workspaces",          color: "from-purple-600/15" },
                    { id: "synth_life",   title: "Synthetic Life",icon: <BrainCircuit className="w-6 h-6 text-pink-300" />, desc: "Cognitive entities",          color: "from-pink-600/15" },
                    { id: "brain_engine", title: "Brain Engine",  icon: <BrainCircuit className="w-6 h-6 text-fuchsia-300" />, desc: "Cognitive reasoning AI",    color: "from-fuchsia-600/15" },
                    { id: "ingestion",    title: "Memory Vault",  icon: <Database className="w-6 h-6 text-emerald-300" />, desc: "8M char data ingestion",       color: "from-emerald-600/15" },
                    { id: "sandbox",      title: "Sandbox",       icon: <FolderArchive className="w-6 h-6 text-sky-300" />, desc: "Rapid experiments",           color: "from-sky-600/15" },
                    { id: "architect_vault", title: "Vault",      icon: <Download className="w-6 h-6 text-orange-300" />, desc: "Archive & ZIP",               color: "from-orange-600/15" },
                  ].map(app => (
                    <button
                      key={app.id}
                      onClick={() => setModule(app.id)}
                      className={`rounded-3xl border border-white/[0.08] p-6 text-left hover:-translate-y-0.5 hover:border-white/20 bg-gradient-to-br ${app.color} to-transparent transition-all duration-200 group`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">{app.icon}</div>
                      <h3 className="text-base font-bold text-white">{app.title}</h3>
                      <p className="mt-1 text-xs text-white/35">{app.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {module === "sandbox" && (
            <WorkspaceSandbox activeProject={activeProject} onInjectCode={() => {}} brainFeedCategory="auto" setBrainFeedCategory={() => {}} feedToGeorge={feedToGeorge} />
          )}

          {module === "architect_vault" && (
            <ZipVault activeProject={activeProject} onImportProject={m => { setActiveProject(m); setModule("studio_core"); }} onRefreshProjects={() => {}} apiKey={apiKey} ollamaCloudKey="" ollamaModel={ollamaModel} preferLocal={preferLocal} />
          )}

          {module === "projects" && (
            <div className="flex flex-col h-full p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-white">Project Workspaces</h2>
                  <p className="text-xs text-white/35">Isolated applications and real-world projects</p>
                </div>
                <button
                  onClick={async () => {
                    const name = prompt("Enter new project name:");
                    if (!name?.trim()) return;
                    await fetch("/api/projects", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: name.trim() })
                    });
                    const r = await fetch("/api/projects");
                    const d = await r.json();
                    setProjects(d);
                  }}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                  title="Create New Project"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.filter(p => !p.id.startsWith("synth_user_")).map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setActiveProject(p); setModule("studio_core"); }}
                    className="p-5 bg-white/[0.03] border border-emerald-500/10 rounded-2xl hover:border-emerald-500/40 hover:bg-white/[0.05] cursor-pointer transition-all group relative"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const newName = prompt("Rename project to:", p.name);
                          if (!newName?.trim() || newName.trim() === p.name) return;
                          try {
                            const res = await fetch(`/api/projects/${p.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name: newName.trim() })
                            });
                            if (res.ok) {
                              const r = await fetch("/api/projects");
                              const d = await r.json();
                              setProjects(d);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="p-1.5 hover:bg-white/10 text-white/40 hover:text-cyan-400 rounded-lg transition-all"
                        title="Rename Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm(`Are you sure you want to delete the project "${p.name}"? This cannot be undone.`)) return;
                          try {
                            const res = await fetch(`/api/projects/${p.id}`, {
                              method: "DELETE"
                            });
                            if (res.ok) {
                              const r = await fetch("/api/projects");
                              const d = await r.json();
                              setProjects(d);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="p-1.5 hover:bg-white/10 text-white/40 hover:text-rose-400 rounded-lg transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2 pr-12">
                      <Code className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-white/95 truncate text-sm">{p.name}</h4>
                    </div>
                    <p className="text-[9px] text-white/25 font-mono truncate">{p.id}</p>
                    <div className="mt-3 text-[9px] text-emerald-400/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Open Studio →</div>
                  </div>
                ))}
                {projects.filter(p => !p.id.startsWith("synth_user_")).length === 0 && (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-white/25 text-sm">No standard projects yet — build something new!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {module === "synth_life" && (
            <div className="flex flex-col h-full p-8 overflow-y-auto custom-scrollbar">
              <div className="border-b border-white/5 pb-4 mb-6">
                <h2 className="text-lg font-black text-white">Synthetical Life</h2>
                <p className="text-xs text-white/35">Isolated cognitive entities and synthetic personas</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.filter(p => p.id.startsWith("synth_user_")).map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setActiveProject(p); setModule("studio_core"); }}
                    className="p-5 bg-white/[0.03] border border-pink-500/10 rounded-2xl hover:border-pink-500/40 hover:bg-white/[0.05] cursor-pointer transition-all group relative"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const newName = prompt("Rename synthetic life workspace to:", p.name);
                          if (!newName?.trim() || newName.trim() === p.name) return;
                          try {
                            const res = await fetch(`/api/projects/${p.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name: newName.trim() })
                            });
                            if (res.ok) {
                              const r = await fetch("/api/projects");
                              const d = await r.json();
                              setProjects(d);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="p-1.5 hover:bg-white/10 text-white/40 hover:text-cyan-400 rounded-lg transition-all"
                        title="Rename Persona"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm(`Are you sure you want to delete "${p.name}"? This cannot be undone.`)) return;
                          try {
                            const res = await fetch(`/api/projects/${p.id}`, {
                              method: "DELETE"
                            });
                            if (res.ok) {
                              const r = await fetch("/api/projects");
                              const d = await r.json();
                              setProjects(d);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="p-1.5 hover:bg-white/10 text-white/40 hover:text-rose-400 rounded-lg transition-all"
                        title="Delete Persona"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2 pr-12">
                      <BrainCircuit className="w-4 h-4 text-pink-400" />
                      <h4 className="font-bold text-white/95 truncate text-sm">{p.name}</h4>
                    </div>
                    <p className="text-[9px] text-white/25 font-mono truncate">{p.id}</p>
                    <div className="mt-3 text-[9px] text-pink-400/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Open Neural Sandbox →</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="absolute left-0 right-0 bottom-0 h-16 bg-[#05050a]/95 border-t border-white/[0.08] backdrop-blur-xl z-20">
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-1">
            {[
              { id: "george_core",  label: "George",   icon: <Sparkles className="w-4 h-4" /> },
              { id: "desktop",      label: "Home",     icon: <Monitor className="w-4 h-4" /> },
              { id: "projects",     label: "Projects", icon: <Layers className="w-4 h-4" /> },
              { id: "synth_life",   label: "Synth",    icon: <BrainCircuit className="w-4 h-4 text-pink-400" /> },

              { id: "brain_engine", label: "Brain",    icon: <BrainCircuit className="w-4 h-4" /> },
              { id: "ingestion",    label: "Memory",   icon: <Database className="w-4 h-4" /> },
              { id: "sandbox",      label: "Sandbox",  icon: <FolderArchive className="w-4 h-4" /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setModule(item.id)}
                className={`w-14 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 ${
                  module === item.id
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-white/35 hover:text-white hover:bg-white/5"
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="text-[8px] font-mono">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[9px] text-white/20 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Aura OS · Local
          </div>
        </div>
      </div>

      {/* Floating George */}
      {module !== "george_core" && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
          {showFloatingChat && (
            <div className="w-72 h-80 bg-[#0d0d18] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="h-10 bg-[#0a0a14] border-b border-white/5 flex items-center justify-between px-3">
                <span className="text-[10px] font-bold text-white/60 font-mono">George</span>
                <button onClick={() => setShowFloatingChat(false)}><ChevronDown size={14} className="text-white/40" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#07070b]">
                {nexusMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-2 rounded-xl text-[10px] max-w-[85%] ${m.role === "user" ? "bg-purple-600/20 text-purple-200" : "bg-white/5 text-white/75"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {nexusTyping && <div className="text-[10px] text-white/30 animate-pulse">George thinking...</div>}
                <div ref={nexusEndRef} />
              </div>
              <div className="p-2 border-t border-white/5 flex gap-1 bg-[#0a0a14]">
                <input value={nexusInput} onChange={e => setNexusInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendNexus()} placeholder="Ask George..." className="flex-1 bg-white/5 px-2 py-1 rounded text-[10px] focus:outline-none text-white" />
                <button onClick={sendNexus} className="px-2 bg-purple-600 text-xs text-white rounded">→</button>
              </div>
            </div>
          )}
          <button onClick={() => setShowFloatingChat(!showFloatingChat)} className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all text-white font-bold text-sm">G</button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:3px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:10px}` }} />
    </div>
  );
}
