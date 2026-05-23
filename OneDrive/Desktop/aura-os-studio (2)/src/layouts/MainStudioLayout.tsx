import React, { useState } from 'react';
import { Mic, Code, Play, Archive, Database, Shield } from 'lucide-react';
import { VaultCrypt } from '../logic/core/VaultCrypt';

export default function MainStudioLayout() {
  const [isListening, setIsListening] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    setEditorContent(raw);
    
    // Auto-patch using VaultCrypt
    const encrypted = VaultCrypt.encode(raw);
    // In a real implementation, this would be sent to the Governance Kernel and then the backend
    console.log('[Auto-Patch] Saved to vault:', encrypted.substring(0, 20) + '...');
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      
      {/* 1. Vault Sidebar */}
      <div className="w-64 border-r border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Aura OS
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Autonomous Policy Engine</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Isolated Vaults
            </h2>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded bg-cyan-900/20 text-cyan-400 text-sm font-medium border border-cyan-800/50 flex items-center justify-between">
                Business
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-800 text-neutral-400 text-sm font-medium flex items-center justify-between">
                Family
                <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-50"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top: Live Preview / Runtime */}
        <div className="flex-1 border-b border-neutral-800 bg-black relative flex flex-col">
          <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
            <div className="text-sm font-mono text-neutral-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              Runtime: localhost:5100
            </div>
            <div className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500/20">
              Governance: Advisory
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center text-neutral-600 font-mono text-sm">
            Live Preview iframe will mount here...
          </div>
        </div>

        {/* Bottom: The Cockpit Editor */}
        <div className="h-1/3 bg-[#0d0d0d] flex flex-col relative group">
          {/* Drag Handle */}
          <div className="h-1 w-full bg-neutral-800 cursor-row-resize hover:bg-cyan-500 transition-colors" />
          
          <div className="flex-1 p-4 flex gap-4">
            {/* Editor Area */}
            <div className="flex-1 relative">
              <textarea
                value={editorContent}
                onChange={handleEditorChange}
                placeholder="Type code here... (Auto-patching to Vault)"
                className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm resize-none focus:outline-none placeholder-neutral-700"
                spellCheck={false}
              />
            </div>
            
            {/* Voice Cockpit */}
            <div className="w-64 border-l border-neutral-800 pl-4 flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <button 
                  onClick={() => setIsListening(!isListening)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening ? 'bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
              </div>
              <div className="text-center pb-4">
                <p className="text-xs text-neutral-500 font-mono">
                  {isListening ? 'George is listening...' : 'Push to talk'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
