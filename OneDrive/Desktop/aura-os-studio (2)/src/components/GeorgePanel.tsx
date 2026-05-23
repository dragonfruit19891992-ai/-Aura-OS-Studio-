import { useState, useEffect, useRef } from "react";
import { Sparkles, FileText, CornerDownLeft, MicOff, Mic, Send, Copy, Check } from "lucide-react";
import { Project, ChatMessage } from "../types";
import { callAI, useVoiceHook } from "../utils";

interface GeorgePanelProps {
  project: Project;
  currentFile: string | null;
  fileContent: string;
  apiKey: string;
  ollamaCloudKey: string;
  ollamaModel: string;
  preferLocal: boolean;
  onInjectCode: (code: string) => void | Promise<void>;
  onReviewCode?: (code: string, filePath: string) => void;
}

export default function GeorgePanel({
  project,
  currentFile,
  fileContent,
  apiKey,
  ollamaCloudKey,
  ollamaModel,
  preferLocal,
  onInjectCode,
  onReviewCode,
}: GeorgePanelProps) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const { toggle: toggleVoice } = useVoiceHook((t) => {
    setInput((p) => (p + " " + t).trim());
  });

  useEffect(() => {
    if (!project?.id) return;
    fetch(`/api/projects/${project.id}/chat`)
      .then((r) => r.json())
      .then((history) => {
        if (history && history.length > 0) {
          setMsgs(history);
        } else {
          setMsgs([
            {
              role: "george",
              text: `I'm George — your project architectural partner for **${project.name}**.\n\nI can read your active lines of code and inject changes in real-time. Ask me to draft files, create modules, or clean syntax.`,
            },
          ]);
        }
      })
      .catch(() => {
        setMsgs([{ role: "george", text: `George system linked for **${project.name}**.` }]);
      });
  }, [project?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const saveMsg = (msg: ChatMessage) => {
    if (!project?.id) return;
    fetch(`/api/projects/${project.id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    }).catch(() => {});
  };

  const handleSend = async () => {
    if (!input.trim() || typing) return;
    const userMsg: ChatMessage = { role: "user", text: input.trim() };
    setMsgs((p) => [...p, userMsg]);
    saveMsg(userMsg);
    setInput("");
    setTyping(true);

    const context = [
      `Project Desk: ${project.name}`,
      currentFile ? `Active Filepath: ${currentFile}` : "",
      fileContent
        ? `\n--- Contents ---\n${fileContent.slice(0, 1500)}${
            fileContent.length > 1500 ? "\n...(truncated for balance)" : ""
          }`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `You are George — the ultimate systems engineering architect of Aura OS Studio.
Project Context: "${project.name}".
${context}

Rules:
- Give comprehensive, well-thought-out system blueprints.
- Wrap all code chunks in standard backtick formats (e.g. \`\`\`tsx ... \`\`\`).
- If custom improvements are requested, write complete and valid file code blocks so they can be injected securely.`;

    const chatHistory = msgs
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "George"}: ${m.text}`)
      .join("\n");

    const prompt = `${chatHistory}\nUser: ${userMsg.text}`;

    try {
      const result = await callAI({
        prompt,
        systemPrompt,
        apiKey,
        ollamaCloudKey,
        ollamaModel,
        preferLocal,
      });
      setAiSource(result.source);
      const georgeMsg: ChatMessage = { role: "george", text: result.text };
      setMsgs((p) => [...p, georgeMsg]);
      saveMsg(georgeMsg);
    } catch {
      setMsgs((p) => [
        ...p,
        { role: "george", text: "Communication bridge timed out. Repeat request." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (!project?.id) return;
    fetch(`/api/projects/${project.id}/chat`, { method: "DELETE" })
      .then(() => {
        setMsgs([
          {
            role: "george",
            text: "Memory buffer wiped. Context has reset.",
          },
        ]);
      })
      .catch(() => {});
  };

  const renderTextParts = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/^`{3}\w*\n?/, "").replace(/`{3}$/, "");
        const lines = code.split("\n");
        const lineCount = lines.length;
        const charCount = code.length;
        
        return (
          <div key={i} className="my-3 p-3 bg-gradient-to-br from-purple-950/20 via-slate-900/40 to-cyan-950/20 border border-purple-500/20 rounded-xl relative overflow-hidden flex flex-col gap-2 shadow-xl backdrop-blur-md hover:border-purple-500/50 transition-all duration-300 group">
            {/* Pulsing decorative background glow */}
            <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-purple-500/5 blur-xl group-hover:bg-purple-500/10 transition-all pointer-events-none"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-all">
                <FileText className="w-4 h-4 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[9px] font-black tracking-[0.15em] text-purple-300 font-mono uppercase">
                  Proposed File Change
                </h4>
                <p className="text-[10px] text-white/50 truncate font-mono mt-0.5">
                  {currentFile || "index.html"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/[0.03]">
              <div className="flex items-center gap-2 text-[9px] font-mono">
                <span className="text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded">+{lineCount} lines</span>
                <span className="text-white/20">|</span>
                <span className="text-white/30 font-medium">{charCount} chars</span>
              </div>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    alert("Copied patch to clipboard.");
                  }}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 p-1.5 rounded-lg hover:text-white transition-all cursor-pointer flex items-center justify-center"
                  title="Copy patch code"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    if (onReviewCode) {
                      onReviewCode(code, currentFile || "index.html");
                    } else {
                      onInjectCode(code);
                    }
                  }}
                  className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/35 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all shadow-[0_0_12px_rgba(168,85,247,0.15)] hover:shadow-[0_0_18px_rgba(168,85,247,0.3)] cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a10] border-l border-white/5 font-sans">
      <div className="h-9 border-b border-white/5 flex items-center justify-between px-3 bg-[#0d0d14] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-white/80">George Architect</span>
          {aiSource && (
            <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-bold">
              {aiSource}
            </span>
          )}
        </div>
        <button
          onClick={handleClearHistory}
          className="text-white/20 hover:text-white/50 text-[9px] font-mono cursor-pointer"
        >
          reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-0 bg-[#07070b]">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`text-xs leading-relaxed ${m.role === "user" ? "text-white" : "text-cyan-100/90"}`}
          >
            <div className="flex items-center gap-1 mb-0.5 opacity-60">
              <span className="text-[8px] uppercase tracking-widest font-black font-mono">
                {m.role === "user" ? "You" : "George"}
              </span>
            </div>
            <div className={`${m.role === "user" ? "bg-white/5 px-2 py-1.5 rounded-lg" : ""}`}>
              {renderTextParts(m.text)}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1.5 p-1">
            <Sparkles className="w-3 h-3 text-purple-400 rotate-12" />
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-2 border-t border-white/5 bg-[#0a0a14] flex-shrink-0">
        {currentFile && (
          <div className="text-[8px] text-white/20 font-mono mb-1 flex items-center gap-1">
            <FileText className="w-2 h-2" /> context: {currentFile}
          </div>
        )}
        <div className="flex items-end gap-1.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            placeholder="Suggest updates..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/90 focus:outline-none focus:border-purple-500/50 placeholder-white/20 resize-none font-sans"
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={() => toggleVoice(listening, setListening)}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                listening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/5 text-white/30 hover:text-white"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSend}
              disabled={typing || !input.trim()}
              className="p-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 disabled:opacity-30 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
