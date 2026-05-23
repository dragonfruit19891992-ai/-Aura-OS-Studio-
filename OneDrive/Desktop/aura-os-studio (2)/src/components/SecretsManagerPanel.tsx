import React, { useState, useEffect, useCallback } from "react";
import { KeyRound, Plus, Trash2, Eye, EyeOff, Lock, Save, Loader2, RefreshCw } from "lucide-react";

interface Props {
  projectId: string;
}

export default function SecretsManagerPanel({ projectId }: Props) {
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadSecrets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/secrets`);
      const data = await res.json();
      setSecrets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  const toggleVisibility = (key: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey.trim(), value: newValue.trim() })
      });
      setNewKey("");
      setNewValue("");
      await loadSecrets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSecret = async (key: string) => {
    try {
      await fetch(`/api/projects/${projectId}/secrets/${encodeURIComponent(key)}`, {
        method: "DELETE"
      });
      await loadSecrets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#07070B]/80 text-white font-mono text-[11px]">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-purple-400" />
          <span className="font-bold uppercase tracking-wider text-white/80">Secrets</span>
        </div>
        <button onClick={loadSecrets} className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-3 border-b border-white/10 bg-purple-500/5">
        <form onSubmit={addSecret} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="API_KEY"
              className="w-1/3 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 focus:outline-none focus:border-purple-500/50 text-white placeholder-white/30"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 focus:outline-none focus:border-purple-500/50 text-white placeholder-white/30"
            />
          </div>
          <button 
            type="submit" 
            disabled={!newKey || !newValue || isSaving}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50 text-white font-bold tracking-wide"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add Secret
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
        <h3 className="text-[9px] uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
          <Lock className="w-3 h-3" /> Encrypted Environment Variables
        </h3>
        
        {Object.entries(secrets).length === 0 && !isLoading ? (
          <div className="text-center py-6 text-white/30 text-[10px]">
            No secrets found in .env
          </div>
        ) : (
          Object.entries(secrets).map(([key, value]) => (
            <div key={key} className="p-2 rounded bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-purple-300">{key}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleVisibility(key)} className="p-1 rounded text-white/50 hover:bg-white/10 hover:text-white">
                    {visibleKeys.has(key) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteSecret(key)} className="p-1 rounded text-rose-400 hover:bg-rose-500/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-white/50 font-mono break-all bg-black/40 p-1.5 rounded border border-white/5">
                {visibleKeys.has(key) ? value : "•".repeat(Math.min(value.length, 40))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
