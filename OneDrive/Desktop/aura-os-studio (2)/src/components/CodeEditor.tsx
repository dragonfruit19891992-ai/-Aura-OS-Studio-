import React, { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Sparkles, Loader2, X, Play } from "lucide-react";

interface CodeEditorProps {
  path: string;
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export default function CodeEditor({ path, initialContent, onSave, onClose }: CodeEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  
  // Inline Prompt State
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptPosition, setPromptPosition] = useState({ top: 0, left: 0 });
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const promptInputRef = useRef<HTMLInputElement>(null);

  // Set up Monaco themes and bindings
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("aura-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#00000000",
          "editor.lineHighlightBackground": "#ffffff05",
        }
      });
      monaco.editor.setTheme("aura-dark");
    }
  }, [monaco]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Bind Cmd+K or Ctrl+K for inline prompt
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      const position = editor.getPosition();
      const coords = editor.getScrolledVisiblePosition(position);
      if (coords) {
        setPromptPosition({ top: coords.top + 30, left: Math.max(20, coords.left) });
        setPromptOpen(true);
        setTimeout(() => promptInputRef.current?.focus(), 50);
      }
    });

    // Bind Cmd+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const val = editor.getValue();
      onSave(val);
      setIsDirty(false);
    });
  };

  const handleInlineGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || !editorRef.current) return;
    
    setIsGenerating(true);
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);
    
    try {
      const res = await fetch("/api/composer/inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          content: editor.getValue(),
          selection: selectedText
        })
      });
      
      const data = await res.json();
      if (data.replacement) {
        // Apply the edit
        const range = selection.isEmpty() 
          ? new monaco!.Range(selection.startLineNumber, selection.startColumn, selection.startLineNumber, selection.startColumn)
          : selection;
          
        editor.executeEdits("george-ai", [{
          range: range,
          text: data.replacement,
          forceMoveMarkers: true
        }]);
        
        setIsDirty(true);
      }
    } catch (err) {
      console.error("Inline generation failed:", err);
    } finally {
      setIsGenerating(false);
      setPromptOpen(false);
      setPromptText("");
      editor.focus();
    }
  };

  // Auto-detect language from extension
  const ext = path.split('.').pop() || '';
  const language = {
    'ts': 'typescript', 'tsx': 'typescript',
    'js': 'javascript', 'jsx': 'javascript',
    'json': 'json', 'md': 'markdown',
    'css': 'css', 'html': 'html'
  }[ext] || 'plaintext';

  return (
    <div className="relative w-full h-full flex flex-col bg-[#07070B] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-2">
          <span className="text-white/80 font-mono text-xs">{path.split(/[\/\\]/).pop()}</span>
          {isDirty && <div className="w-2 h-2 rounded-full bg-cyan-400"></div>}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { onSave(content); setIsDirty(false); }}
            disabled={!isDirty}
            className={\`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors \${isDirty ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" : "bg-white/5 text-white/30"}\`}
          >
            Save (Cmd+S)
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          theme="aura-dark"
          value={initialContent}
          onChange={(val) => { setContent(val || ""); setIsDirty(true); }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 22,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
        />

        {/* Inline Prompt Widget */}
        {promptOpen && (
          <div 
            className="absolute z-50 w-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ top: Math.min(promptPosition.top, window.innerHeight - 100), left: promptPosition.left }}
          >
            <form onSubmit={handleInlineGenerate} className="flex items-center p-1.5">
              <div className="pl-2 pr-1 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <input
                ref={promptInputRef}
                type="text"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Ask George to edit code (Cmd+K)..."
                className="flex-1 bg-transparent text-white/90 text-sm px-2 py-1.5 focus:outline-none placeholder-white/30"
                disabled={isGenerating}
                onKeyDown={e => { if (e.key === 'Escape') setPromptOpen(false); }}
              />
              <button 
                type="submit" 
                disabled={isGenerating || !promptText}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
