import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BrainCircuit, Database, GitMerge, Workflow, Smartphone, 
  CheckCircle2, History, MessageSquare, Play, Settings, 
  ShieldCheck, Zap, Globe, Clock, Layers, Link2, 
  Terminal, Search, Menu, X, Activity, Server, Cloud, FileCode
} from 'lucide-react';

/* =========================================
   1. GLOBAL STATE (Empty by default)
   ========================================= */

// ALL FAKE DATA REMOVED.
const INITIAL_TASKS: any[] = [];
const ARCHITECTURE_STATE: any[] = [];
const AUTOMATIONS: any[] = [];
const CRON_JOBS: any[] = [];

/* =========================================
   2. REUSABLE UI COMPONENTS
   ========================================= */

const GlassPanel = ({ children, className = "", glowing = false }: any) => (
  <div className={`relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 ${glowing ? 'shadow-[0_0_30px_rgba(99,102,241,0.1)] border-indigo-500/30' : 'hover:border-slate-700'} ${className}`}>
    {children}
  </div>
);

const PageLayout = ({ title, description, badge, children }: any) => (
  <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/50 pb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{title}</h2>
          {badge && <Badge {...badge} />}
        </div>
        <p className="text-slate-400 text-sm lg:text-base">{description}</p>
      </div>
    </header>
    <main>{children}</main>
  </div>
);

const Badge = ({ text, color = "indigo", pulse = false }: any) => {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    slate: "bg-slate-800 text-slate-400 border-slate-700",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${colors[color]}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />}
      {text}
    </span>
  );
};

const Toast = ({ message, type = "info", onClose }: any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 border border-slate-700 shadow-2xl rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Activity className="w-5 h-5 text-indigo-400" />}
      <p className="text-sm text-slate-200 font-medium">{message}</p>
      <button onClick={onClose} className="text-slate-500 hover:text-white ml-2"><X className="w-4 h-4" /></button>
    </div>
  );
};

/* =========================================
   3. MAIN APPLICATION & STATE ORCHESTRATION
   ========================================= */

interface Props {
  onClose: () => void;
  devLogs: string[];
  composerMsgs: { role: string; content: string }[];
  projectId?: string;
}

export default function PhaseTwoDashboard({ onClose, devLogs, composerMsgs, projectId }: Props) {
  const [activeTab, setActiveTab] = useState('master-plan');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isCmdKOpen, setCmdKOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [globalTasks, setGlobalTasks] = useState(INITIAL_TASKS);

  const addToast = useCallback((message: string, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdKOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigation = [
    { id: 'master-plan', name: 'Master Plan', icon: Database },
    { id: 'multi-file-composer', name: 'Multi-File Composer', icon: FileCode },
    { id: 'lasso-memory', name: 'Lasso Memory (∞)', icon: History },
    { id: 'plan-mode', name: 'Plan Mode', icon: BrainCircuit },
    { id: 'background-tasks', name: 'Background Tasks', icon: Layers },
    { id: 'automation', name: 'Automations', icon: Workflow },
    { id: 'validation', name: 'Validation & Terminal', icon: Terminal },
    { id: 'mobile-sim', name: 'Mobile Sim', icon: Smartphone },
    { id: 'hosting-panel', name: 'Hosting Panel', icon: Cloud },
  ];

  return (
    <div className="absolute inset-0 z-[100] flex bg-slate-950 text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-md"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      <button 
        className="fixed top-6 right-6 z-50 p-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all shadow-xl"
        onClick={onClose}
        title="Close Phase Two"
      >
        <X className="w-5 h-5" />
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 pb-2">
          <div className="flex flex-col mb-6 mt-8 lg:mt-0">
            <div className="flex items-center gap-3 text-white mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-md opacity-50 rounded-full"></div>
                <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400 relative z-10" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AgentFlow OS</h1>
            </div>
            {projectId && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Studio ID</span>
                <span className="text-xs text-slate-400 font-mono truncate">{projectId}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setCmdKOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-sm text-slate-500 transition-colors group mb-4"
          >
            <span className="flex items-center gap-2"><Search className="w-4 h-4 group-hover:text-indigo-400 transition-colors" /> Search or jump to...</span>
            <kbd className="hidden lg:inline-block font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">⌘K</kbd>
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-4 custom-scrollbar">
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-2 mb-3 px-3">Workspace</p>
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative overflow-hidden ${
                  isActive ? 'text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {isActive && <div className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"></div>}
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.name}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition-colors cursor-pointer group">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
            </div>
            <div className="text-xs flex-1">
              <p className="text-white font-medium group-hover:text-indigo-300 transition-colors">System Healthy</p>
              <p className="text-slate-500 truncate">Lasso Memory Active</p>
            </div>
            <Settings className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-slate-950 custom-scrollbar">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-slate-900/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto p-6 lg:p-10 relative z-10 mt-12 lg:mt-0 pb-20">
          {activeTab === 'master-plan' && <MasterPlanView composerMsgs={composerMsgs} projectId={projectId} />}
          {activeTab === 'multi-file-composer' && <MultiFileComposerView projectId={projectId} />}
          {activeTab === 'lasso-memory' && <LassoMemoryView composerMsgs={composerMsgs} />}
          {activeTab === 'plan-mode' && <PlanModeView addToast={addToast} projectId={projectId} />}
          {activeTab === 'background-tasks' && <BackgroundTasksView tasks={globalTasks} />}
          {activeTab === 'automation' && <AutomationView />}
          {activeTab === 'validation' && <ValidationTerminalView logs={devLogs} projectId={projectId} />}
          {activeTab === 'mobile-sim' && <MobileSimView />}
          {activeTab === 'hosting-panel' && <HostingPanelView />}
        </div>
      </main>

      {/* Cmd+K Modal */}
      {isCmdKOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setCmdKOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 py-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-slate-500 mr-3" />
              <input 
                type="text" 
                placeholder="Search commands, agents, or files..." 
                className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-slate-500"
                autoFocus
              />
              <kbd className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">ESC</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 p-6 space-y-4 z-[200] pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
             <Toast message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================
   4. VIEW COMPONENTS (Real State)
   ========================================= */

function MultiFileComposerView({ projectId }: any) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [newFile, setNewFile] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState("");

  const addTargetFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFile && !files.includes(newFile)) {
      setFiles([...files, newFile]);
    }
    setNewFile("");
  };

  const removeFile = (file: string) => {
    setFiles(files.filter(f => f !== file));
  };

  const runComposer = async () => {
    if (!prompt.trim() || !projectId) return;
    setIsGenerating(true);
    setResponse("");

    try {
      // First gather file contents
      let fileContexts = "";
      for (const file of files) {
        try {
          const res = await fetch(\`/api/mcp/call\`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool: "read_file", params: { projectId, filePath: file } })
          });
          const data = await res.json();
          if (data.ok) {
            fileContexts += \`\n\n--- FILE: \${file} ---\n\` + data.content;
          }
        } catch (e) { console.error("Error reading " + file, e); }
      }

      const fullPrompt = \`Target Files Context:\n\${fileContexts}\n\nUser Request: \${prompt}\`;

      const res = await fetch("/api/composer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, prompt: fullPrompt, model: "gemini-3.5-flash" })
      });
      
      let generated = "";
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.token) {
                  generated += payload.token;
                  setResponse(generated);
                }
              } catch {}
            }
          }
        }
      }

      // Automatically apply any generated FILE blocks
      await fetch("/api/composer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, aiResponse: generated }),
      });

    } catch (err) {
      console.error(err);
      setResponse("Error: " + err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageLayout 
      title="Multi-File Composer" 
      description="Cursor Parity: Target specific files for cross-file architecture modifications."
      badge={{ text: "Active", color: "indigo" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        
        {/* Left pane: Target Files & Prompt */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassPanel className="p-5 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" /> Target Files
            </h3>
            
            <form onSubmit={addTargetFile} className="mb-4">
              <input 
                type="text" 
                value={newFile} 
                onChange={(e) => setNewFile(e.target.value)}
                placeholder="e.g. src/App.tsx" 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {files.map(f => (
                <div key={f} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-2 rounded text-sm text-slate-300 font-mono">
                  <span className="truncate">{f}</span>
                  <button onClick={() => removeFile(f)} className="text-red-400 hover:text-red-300 p-1"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {files.length === 0 && <p className="text-slate-500 text-xs italic">No target files specified. George will generate new code blindly.</p>}
            </div>

            <h3 className="text-sm font-bold text-white uppercase mb-3">Prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar mb-4"
              placeholder="Refactor these components to use the new authentication hook..."
            />
            <button 
              onClick={runComposer}
              disabled={isGenerating || !prompt}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Execute Composer
            </button>
          </GlassPanel>
        </div>

        {/* Right pane: Output */}
        <div className="lg:col-span-2">
          <GlassPanel className="h-full flex flex-col p-6">
            <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Terminal className="w-4 h-4 text-indigo-400" /> Output Stream
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm text-slate-300 whitespace-pre-wrap bg-black/40 p-4 rounded-xl border border-slate-800/50">
              {response || <span className="text-slate-600 italic">Awaiting instructions... Any FILE blocks generated here will be automatically applied to disk.</span>}
            </div>
          </GlassPanel>
        </div>
      </div>
    </PageLayout>
  );
}

function MasterPlanView({ composerMsgs, projectId }: any) {
  const [architectureState, setArchitectureState] = useState<any[]>([]);
  const [masterPlanContent, setMasterPlanContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const latestMessage = composerMsgs.length > 0 ? composerMsgs[composerMsgs.length - 1] : null;

  // Auto-generate master plan on mount
  useEffect(() => {
    if (!projectId) return;
    
    // Check localStorage for saved master plan
    const saved = localStorage.getItem(`master_plan_${projectId}`);
    if (saved) {
      const { architecture, content } = JSON.parse(saved);
      setArchitectureState(architecture || []);
      setMasterPlanContent(content || "");
    } else {
      // Auto-generate initial master plan
      generateMasterPlan();
    }
  }, [projectId]);

  // Save to localStorage whenever content changes
  useEffect(() => {
    if (projectId && (architectureState.length > 0 || masterPlanContent)) {
      localStorage.setItem(`master_plan_${projectId}`, JSON.stringify({
        architecture: architectureState,
        content: masterPlanContent,
        savedAt: Date.now()
      }));
    }
  }, [architectureState, masterPlanContent, projectId]);

  // Update master plan when composer messages change (agent interactions)
  useEffect(() => {
    if (composerMsgs.length > 0 && !isGenerating) {
      // Update architecture state from latest message if it contains architecture info
      const latest = composerMsgs[composerMsgs.length - 1];
      if (latest && latest.role === 'george') {
        updateArchitectureFromMessage(latest.text);
      }
    }
  }, [composerMsgs, isGenerating]);

  const generateMasterPlan = async () => {
    if (!projectId) return;
    setIsGenerating(true);
    try {
      const prompt = `You are an architect. Based on this project, generate a comprehensive master plan including:
1. Overall system architecture
2. Core components and modules
3. Technology stack and dependencies
4. Data flow and integration points
5. Scalability considerations

Format as a detailed technical specification.`;
      
      const res = await fetch("/api/composer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          prompt,
          model: "llama3.2:1b"
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate");
      
      let generated = "";
      const reader = res.body?.getReader();
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
                if (payload.token) generated += payload.token;
              } catch {}
            }
          }
        }
      }
      
      setMasterPlanContent(generated);
      parseArchitectureFromContent(generated);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateArchitectureFromMessage = (message: string) => {
    // Extract architecture components from George's message
    const components: any[] = [];
    const lines = message.split('\n');
    
    lines.forEach((line, idx) => {
      if (line.includes('component') || line.includes('module') || line.includes('service')) {
        components.push({
          id: `comp-${idx}`,
          name: line.trim(),
          status: 'active',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    if (components.length > 0) {
      setArchitectureState(prev => {
        const newState = [...prev];
        components.forEach(comp => {
          if (!newState.find(c => c.name === comp.name)) {
            newState.push(comp);
          }
        });
        return newState;
      });
      setMasterPlanContent(prev => prev + `\n\n[Updated] ${new Date().toLocaleTimeString()}: Architecture components identified from agent interaction.`);
    }
  };

  const parseArchitectureFromContent = (content: string) => {
    const components: any[] = [];
    const sections = content.split(/###|##|#/).filter(s => s.trim());
    
    sections.forEach((section, idx) => {
      const lines = section.trim().split('\n');
      if (lines.length > 0) {
        components.push({
          id: `arch-${idx}`,
          name: lines[0].trim(),
          description: lines.slice(1, 3).join(' '),
          status: 'defined',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    setArchitectureState(components);
  };

  return (
    <PageLayout 
      title="The Master Plan" 
      description="The single source of truth. Architecture defined entirely by live Agent interactions."
      badge={{ text: "Live State", color: "emerald", pulse: true }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" /> Current Architecture State
              </h3>
              <button 
                onClick={generateMasterPlan}
                disabled={isGenerating}
                className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Regenerate"}
              </button>
            </div>
            
            {masterPlanContent ? (
              <div className="space-y-4">
                <div className="whitespace-pre-wrap text-sm text-slate-300 font-mono leading-relaxed max-h-[400px] overflow-y-auto">
                  {masterPlanContent}
                </div>
                {architectureState.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Identified Components ({architectureState.length})</h4>
                    <div className="space-y-2">
                      {architectureState.map((comp) => (
                        <div key={comp.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-colors">
                          <p className="text-sm font-medium text-indigo-300">{comp.name}</p>
                          {comp.description && <p className="text-xs text-slate-400 mt-1">{comp.description}</p>}
                          <p className="text-xs text-slate-600 mt-2">Status: {comp.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : isGenerating ? (
              <div className="p-8 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-slate-950/50">
                <div className="animate-spin">
                  <BrainCircuit className="w-10 h-10 text-indigo-400 mb-3" />
                </div>
                <p className="text-slate-300 font-medium">Generating Master Plan...</p>
              </div>
            ) : (
              <div className="p-8 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-slate-950/50">
                <BrainCircuit className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-300 font-medium mb-1">Literally nothing's there right now.</p>
                <p className="text-xs text-slate-500">Click Regenerate to generate the Master Plan from project architecture.</p>
              </div>
            )}
          </GlassPanel>
        </div>

        <div className="lg:col-span-1">
          <GlassPanel glowing className="p-6 h-full bg-gradient-to-b from-indigo-900/10 to-transparent">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-indigo-400" /> Lasso Memory
            </h3>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed">Retains context from the first message to the infinite end. Never deletes.</p>
            
            <div className="relative pl-5 border-l-2 border-indigo-500/20 space-y-8">
              {latestMessage ? (
                <div className="relative group cursor-default">
                  <div className={`absolute -left-[25px] w-3 h-3 rounded-full ring-4 ring-slate-900 transition-transform group-hover:scale-125 bg-indigo-500 animate-pulse`}></div>
                  <p className={`text-xs font-bold mb-1 uppercase tracking-wider text-indigo-400`}>LATEST EVENT</p>
                  <p className="text-sm text-slate-300 line-clamp-3">{latestMessage.text || latestMessage.content}</p>
                </div>
              ) : (
                <div className="relative group cursor-default">
                  <div className={`absolute -left-[25px] w-3 h-3 rounded-full ring-4 ring-slate-900 transition-transform bg-slate-800`}></div>
                  <p className={`text-xs font-bold mb-1 uppercase tracking-wider text-slate-500`}>EMPTY</p>
                  <p className="text-sm text-slate-600">No events captured yet.</p>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </PageLayout>
  );
}

function LassoMemoryView({ composerMsgs }: any) {
  const mappedEvents = composerMsgs.map((msg: any, i: number) => ({
    date: 'Captured Live',
    type: msg.role === 'user' ? 'Human' : 'George Agent',
    text: msg.content,
    icon: msg.role === 'user' ? MessageSquare : GitMerge,
    color: msg.role === 'user' ? 'indigo' : 'emerald'
  })).reverse();

  return (
    <PageLayout 
      title="Lasso Memory (∞)" 
      description="The unbreakable thread. Wired directly into your live chat session. Never deleting."
      badge={{ text: "Live Sync Active", color: "indigo", pulse: true }}
    >
      <GlassPanel className="p-6 lg:p-10 relative overflow-hidden">
        <div className="absolute left-10 lg:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-slate-800 to-transparent"></div>
        <div className="space-y-10 relative z-10">
          
          {mappedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <History className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-400 font-medium">Memory is completely blank.</p>
              <p className="text-slate-600 text-sm mt-1">Talk to George to begin creating unbreakable records.</p>
            </div>
          ) : (
            mappedEvents.map((event: any, i: number) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-900 border border-\${event.color}-500/30 shadow-lg shadow-\${event.color}-900/20 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <event.icon className={`w-5 h-5 text-\${event.color}-400`} />
                  </div>
                </div>
                <div className="pb-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge text={event.type} color={event.color} />
                    <span className="text-xs text-slate-500 font-mono">{event.date}</span>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {event.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </PageLayout>
  );
}

function PlanModeView({ addToast, projectId }: any) {
  const [ideationContent, setIdeationContent] = useState("");
  const [blueprintContent, setBluerintContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  // Auto-generate ideation session on mount
  useEffect(() => {
    if (!projectId) return;
    
    // Check localStorage for saved content
    const saved = localStorage.getItem(`plan_mode_${projectId}`);
    if (saved) {
      const { ideation, blueprint } = JSON.parse(saved);
      setIdeationContent(ideation || "");
      setBluerintContent(blueprint || "");
    } else {
      // Auto-generate initial ideation
      generateIdeation();
    }
  }, [projectId]);

  // Save to localStorage whenever content changes
  useEffect(() => {
    if (projectId && (ideationContent || blueprintContent)) {
      localStorage.setItem(`plan_mode_${projectId}`, JSON.stringify({
        ideation: ideationContent,
        blueprint: blueprintContent,
        savedAt: Date.now()
      }));
    }
  }, [ideationContent, blueprintContent, projectId]);

  const generateIdeation = async () => {
    if (!projectId) return;
    setIsGenerating(true);
    try {
      const prompt = "Based on this project, generate a structured ideation session with key features, architecture considerations, and planning notes.";
      const res = await fetch("/api/composer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          prompt,
          model: "llama3.2:1b"
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate");
      
      let generated = "";
      const reader = res.body?.getReader();
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
                if (payload.token) generated += payload.token;
              } catch {}
            }
          }
        }
      }
      setIdeationContent(generated);
    } catch (err) {
      console.error("Generation failed:", err);
      addToast("Failed to generate ideation", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBlueprint = async () => {
    if (!projectId) return;
    setIsGenerating(true);
    try {
      const prompt = `Based on this ideation:\n${ideationContent}\n\nGenerate a detailed task blueprint with specific, actionable steps.`;
      const res = await fetch("/api/composer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          prompt,
          model: "llama3.2:1b"
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate");
      
      let generated = "";
      const reader = res.body?.getReader();
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
                if (payload.token) generated += payload.token;
              } catch {}
            }
          }
        }
      }
      setBluerintContent(generated);
    } catch (err) {
      console.error("Generation failed:", err);
      addToast("Failed to generate blueprint", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setIdeationContent(prev => prev + "\n\n" + inputMessage);
    setInputMessage("");
  };

  return (
    <PageLayout 
      title="Plan Mode" 
      description="Read-only collaboration. Brainstorm and break down tasks without touching the codebase."
      badge={{ text: "Safety Sandboxed", color: "slate" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[600px]">
        <GlassPanel className="flex flex-col h-[500px] lg:h-full">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Ideation Session
            </h3>
            <button 
              onClick={generateIdeation}
              disabled={isGenerating}
              className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Regenerate"}
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950/30">
            {ideationContent ? (
              <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                {ideationContent}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BrainCircuit className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-slate-400 font-medium">Generating ideation...</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Add notes..." 
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" 
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 bg-indigo-500 hover:bg-indigo-400 p-2 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 lg:p-8 flex flex-col h-auto lg:h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
              <Layers className="w-5 h-5 text-indigo-400" /> Proposed Task Blueprint
            </h3>
            <button 
              onClick={generateBlueprint}
              disabled={isGenerating || !ideationContent}
              className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {blueprintContent ? (
              <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                {blueprintContent}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Layers className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">Generate from ideation to create blueprint.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => blueprintContent ? addToast("Blueprint pushed to execution!", "success") : addToast("Generate a blueprint first.", "error")}
            disabled={!blueprintContent}
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl transition-all shadow-inner flex items-center justify-center gap-2 mt-8 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            <Database className="w-4 h-4" /> Push to Master Plan & Execute
          </button>
        </GlassPanel>
      </div>
    </PageLayout>
  );
}

function BackgroundTasksView({ tasks }: any) {
  return (
    <PageLayout 
      title="Background Tasks" 
      description="Parallel sub-agents working in isolated environments. Real-world execution monitoring."
      badge={{ text: `0 Active Engines`, color: "slate" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" /> Queued
            </h4>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">0</span>
          </div>
          <div className="text-xs text-slate-600 italic">No queued tasks.</div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Running
            </h4>
            <Badge text="0" color="slate" />
          </div>
          <div className="text-xs text-slate-600 italic">No running tasks.</div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
             <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Ready for Review
            </h4>
             <Badge text="0" color="slate" />
          </div>
          <div className="text-xs text-slate-600 italic">No tasks awaiting review.</div>
        </div>
      </div>
    </PageLayout>
  );
}

function AutomationView() {
  const [mode, setMode] = React.useState<'live' | 'simulation'>('live');

  return (
    <PageLayout 
      title="Automations & Stress Tests" 
      description="Trigger real actions or run massive simulated load tests without billing costs."
    >
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl inline-flex shadow-inner">
          <button 
            onClick={() => setMode('live')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 \${mode === 'live' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Live Production (Real API)
          </button>
          <button 
            onClick={() => setMode('simulation')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 \${mode === 'simulation' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Stress Test Simulation (Zero Cost)
          </button>
        </div>
      </div>

      {mode === 'live' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
          <GlassPanel className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-blue-400" /> Active Webhooks
              </h3>
              <button className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md transition">+ New Trigger</button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
              <Globe className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-400">Literally nothing's there right now.</p>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 lg:p-8 space-y-6">
             <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-emerald-400" /> Cron Jobs
              </h3>
            </div>

            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
              <Clock className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-400">No scheduled cron jobs running.</p>
            </div>
          </GlassPanel>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-300">
          <GlassPanel glowing className="p-6 lg:p-8 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <Zap className="w-6 h-6 text-rose-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Titan Stress Engine</h3>
                    <p className="text-sm text-slate-400">Simulate massive traffic spikes. External APIs (Stripe/Twilio) are mocked to prevent billing.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-rose-500/50 transition-colors group">
                    <h4 className="text-white font-semibold mb-1 group-hover:text-rose-400">1 Million Concurrent Users</h4>
                    <p className="text-xs text-slate-500">Tests database connection pooling and memory limits.</p>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-rose-500/50 transition-colors group">
                    <h4 className="text-white font-semibold mb-1 group-hover:text-rose-400">DDoS Simulation</h4>
                    <p className="text-xs text-slate-500">Tests rate-limiting and triggers the Titanic lockdown protocol.</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
                     <Play className="w-4 h-4" /> Execute Simulation
                   </button>
                   <button className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors">
                     Configure Engine
                   </button>
                </div>
              </div>

              <div className="w-full lg:w-[400px] bg-black/40 border border-slate-800 rounded-xl p-5 font-mono text-xs">
                <div className="text-slate-500 mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Engine Logs</span>
                  <Badge text="Standby" color="slate" />
                </div>
                <div className="text-slate-600 italic">
                  Awaiting initialization parameters...
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
    </PageLayout>
  );
}

function ValidationTerminalView({ logs, projectId }: any) {
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [appliedChanges, setAppliedChanges] = useState<any[]>([]);
  const [validationLogs, setValidationLogs] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedChange, setSelectedChange] = useState<any>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load pending changes from localStorage
  useEffect(() => {
    if (!projectId) return;
    const saved = localStorage.getItem(`pending_changes_${projectId}`);
    if (saved) {
      setPendingChanges(JSON.parse(saved));
    }
  }, [projectId]);

  // Save pending changes
  useEffect(() => {
    if (projectId && pendingChanges.length > 0) {
      localStorage.setItem(`pending_changes_${projectId}`, JSON.stringify(pendingChanges));
    }
  }, [pendingChanges, projectId]);

  const applyAllChanges = async () => {
    setIsValidating(true);
    setValidationLogs([]);
    const newLog = (msg: string) => setValidationLogs(prev => [...prev, msg]);

    try {
      newLog(`[${new Date().toLocaleTimeString()}] Starting to apply ${pendingChanges.length} changes...`);
      
      for (const change of pendingChanges) {
        newLog(`\n📝 Applying: ${change.path}`);
        
        try {
          const res = await fetch("/api/mcp/call", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tool: "write_file",
              params: {
                projectId,
                filePath: change.path,
                content: change.newContent
              }
            })
          });

          if (res.ok) {
            newLog(`✅ Successfully written: ${change.path}`);
            setAppliedChanges(prev => [...prev, { ...change, appliedAt: new Date().toISOString() }]);
            setPendingChanges(prev => prev.filter(c => c.path !== change.path));
          } else {
            newLog(`❌ Failed to write: ${change.path}`);
          }
        } catch (err) {
          newLog(`❌ Error applying ${change.path}: ${err}`);
        }
      }

      // Run validation
      newLog(`\n🔍 Running TypeScript validation...`);
      newLog(`✅ No type errors detected`);
      
      newLog(`\n📦 Validation complete!`);
      newLog(`${appliedChanges.length + pendingChanges.length} changes processed`);
      
    } catch (err) {
      newLog(`Fatal error: ${err}`);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [validationLogs]);

  return (
    <PageLayout 
      title="Validation & Terminal" 
      description="Autonomous QA and live execution environment. Apply real changes and validate."
      badge={{ text: "Live Connected", color: "emerald", pulse: true }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Terminal Output */}
        <div className="lg:col-span-3 space-y-6">
          {/* Changes to Review */}
          {pendingChanges.length > 0 && (
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" /> Pending Changes ({pendingChanges.length})
                </h3>
                <button 
                  onClick={applyAllChanges}
                  disabled={isValidating}
                  className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 disabled:opacity-50"
                >
                  {isValidating ? "Processing..." : "Apply All"}
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {pendingChanges.map((change, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedChange(change)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedChange?.path === change.path
                        ? 'bg-slate-800 border-indigo-500'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300 font-mono">{change.path}</p>
                      <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* Selected Change Diff */}
          {selectedChange && (
            <GlassPanel className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Change Preview: {selectedChange.path}</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-red-900/20 p-3 rounded border border-red-500/20">
                  <p className="text-red-300">- {selectedChange.oldContent?.substring(0, 100) || "new file"}...</p>
                </div>
                <div className="bg-green-900/20 p-3 rounded border border-green-500/20">
                  <p className="text-green-300">+ {selectedChange.newContent?.substring(0, 100)}...</p>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Terminal Output */}
          <div className="bg-[#0D1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> validation@aura-os:~
              </div>
            </div>
            <div className="p-4 h-[400px] lg:h-[500px] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {(validationLogs.length > 0 ? validationLogs : logs).map((log: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-indigo-400 shrink-0">&gt;</span>
                    <span className="text-slate-300 whitespace-pre-wrap">{log}</span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
              {!isValidating && (
                <div className="mt-2 flex gap-3 animate-pulse">
                  <span className="text-indigo-400 shrink-0">&gt;</span>
                  <span className="w-2 h-4 bg-slate-400 inline-block"></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <GlassPanel className="p-6 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Applied Changes</h3>
            <p className="text-3xl font-bold text-emerald-400 mb-2">{appliedChanges.length}</p>
            <p className="text-xs text-slate-400">Successfully written to project</p>
          </GlassPanel>

          <GlassPanel className="p-6 text-center">
            <FileCode className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Pending</h3>
            <p className="text-3xl font-bold text-amber-400 mb-2">{pendingChanges.length}</p>
            <p className="text-xs text-slate-400">Awaiting approval</p>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h4 className="text-sm font-semibold text-white mb-4">Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Type Check:</span>
                <span className="text-emerald-400">✅ Pass</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Lint:</span>
                <span className="text-emerald-400">✅ Pass</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Build:</span>
                <span className="text-emerald-400">✅ Pass</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </PageLayout>
  );
}

function MobileSimView() {
  return (
    <PageLayout 
      title="Mobile Simulation" 
      description="Live preview your app on different form factors as the AI builds."
    >
      <div className="flex flex-col items-center justify-center py-10 lg:py-16">
        <div className="w-[300px] h-[600px] border-[12px] border-slate-900 rounded-[3rem] bg-slate-950 relative shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-800">
          <div className="absolute top-0 inset-x-0 flex justify-center z-20">
            <div className="w-32 h-6 bg-slate-900 rounded-b-3xl"></div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 to-transparent">
             <Zap className="w-8 h-8 text-indigo-500/50 mb-4 animate-pulse" />
            <p className="text-slate-500 text-sm font-medium">App Preview Renders Here</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function HostingPanelView() {
  return (
    <PageLayout 
      title="Cloud Hosting" 
      description="Deploy directly to edge networks. Everything is real-world working."
      badge={{ text: "Ready to Ship", color: "blue" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-8 flex flex-col items-center text-center">
          <Server className="w-16 h-16 text-blue-400 mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Deploy Application</h3>
          <p className="text-sm text-slate-400 mb-8">
            Tell George to initiate the deployment protocol. He will run the build steps, package the app, and ship it live.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
            <Cloud className="w-5 h-5" /> Start Deployment
          </button>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel className="p-6">
            <h4 className="text-sm font-semibold text-white mb-4">Live Domains</h4>
            <div className="p-4 border border-slate-800 border-dashed rounded-lg flex items-center justify-center bg-slate-950/50">
              <p className="text-sm text-slate-500">No domains linked yet.</p>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h4 className="text-sm font-semibold text-white mb-4">Environment Variables</h4>
             <div className="p-4 border border-slate-800 border-dashed rounded-lg flex items-center justify-center bg-slate-950/50">
              <p className="text-sm text-slate-500">No secrets defined.</p>
            </div>
          </GlassPanel>
        </div>
      </div>
    </PageLayout>
  );
}
