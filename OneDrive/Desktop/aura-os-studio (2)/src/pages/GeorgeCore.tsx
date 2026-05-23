import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Mic, MicOff, Send, Paperclip, X,
  FileText, Code, Zap, AlertCircle, CheckCircle2,
  Loader2, FolderOpen, ImageIcon
} from "lucide-react";

/* ── Types ── */
interface AttachedFile {
  id: string;
  name: string;
  kind: "image" | "text" | "code" | "other";
  content: string;
  isBase64: boolean;
  size: number;
}

interface GeorgeMsg {
  id: string;
  role: "user" | "george";
  text: string;
  attachments?: AttachedFile[];
  status: "thinking" | "working" | "done";
  statusLabel?: string;
  ts: number;
}

interface Props {
  onExecuteProject: (projectId: string, projectName: string) => void;
  onResetConversation?: () => void;
}

/* ── Constants ── */
const OLLAMA_BASE = "http://localhost:11434";

const GEORGE_SYSTEM = `You are George, the Aura OS Sovereign Architect AI — a professional coding assistant embedded in a studio IDE.

Rules:
- Be confident, concise, and technical. No filler words.
- You operate exactly like an advanced agentic system (e.g. Antigravity).
- When a user requests a new project or app, you MUST first enter Planning Mode. You will output a detailed markdown Implementation Plan describing the frontend, backend, and infrastructure.
- End your implementation plan by asking the user to review and approve it.
- When the user explicitly APPROVES the plan, respond with EXACTLY this format on the first line: EXECUTE_PROJECT:<ProjectName>
  Then on the next lines explain briefly that you are initiating the Agentic Handover Pipeline to build the isolated studio environment.
- Never be sycophantic.`;

/* ── Helpers ── */
function fileKind(name: string): AttachedFile["kind"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png","jpg","jpeg","gif","webp","svg","bmp","ico"].includes(ext)) return "image";
  if (["js","ts","tsx","jsx","py","rs","go","cpp","c","java","html","css","json","yaml","toml","sh","bash","php","rb","kt","swift"].includes(ext)) return "code";
  if (["txt","md","mdx","csv","log","env","gitignore"].includes(ext)) return "text";
  return "other";
}

async function readFileAsText(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsText(f);
  });
}

async function readFileAsBase64(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      res(result.split(",")[1] ?? result);
    };
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

async function detectOllamaModel(): Promise<string | null> {
  try {
    const r = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;
    const data = await r.json();
    const models: string[] = (data.models ?? []).map((m: any) => m.name as string);
    if (models.length === 0) return null;
    // Prefer these in order
    const preferred = ["llama3.2:1b", "llama3.2", "gemma3", "gemma2", "phi3", "mistral", "llama2"];
    for (const p of preferred) {
      const found = models.find(m => m.startsWith(p.split(":")[0]));
      if (found) return found;
    }
    return models[0];
  } catch {
    return null;
  }
}

async function streamGeorge(
  model: string,
  systemPrompt: string,
  prompt: string,
  projectId: string,
  onToken: (t: string) => void,
  onDone: () => void,
  onError: (e: string) => void
) {
  try {
    const res = await fetch("/api/composer/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: projectId,
        prompt: prompt,
        model: "gemini-2.5-pro",
        files: [],
        conversationHistory: []
      })
    });
    if (!res.ok) { onError(`Server ${res.status}: ${res.statusText}`); return; }
    const reader = res.body?.getReader();
    if (!reader) { onError("No body"); return; }
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const p = JSON.parse(line.replace(/^data:\s*/, ""));
          if (p.token) onToken(p.token);
          if (p.error) { onError(p.error); return; }
          if (p.done) { onDone(); return; }
        } catch { /* skip */ }
      }
    }
    onDone();
  } catch (e: any) {
    onError(e?.message ?? "Unknown error");
  }
}

/* ══════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════ */
export default function GeorgeCore({ onExecuteProject, onResetConversation }: Props) {
  const [msgs, setMsgs] = useState<GeorgeMsg[]>([]);
  const [input, setInput] = useState("");
  const [atts, setAtts] = useState<AttachedFile[]>([]);
  const [listening, setListening] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");
  const [busy, setBusy] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<any>(null);

  /* scroll to bottom on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  /* auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [input]);

  /* detect model on mount */
  useEffect(() => {
    setModel("gemini-2.5-pro");
    setOllamaStatus("online");
    pushGeorge(`Sovereign architect is online — powered by **Google Gemini**. Live infrastructure connected.\n\nDrop files, paste images, or describe what you want to build. I'll ask one question, then we execute.`, "done", "Ready");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* paste image from clipboard */
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;
          readFileAsBase64(blob).then(b64 => {
            setAtts(prev => [...prev, {
              id: `att-${Date.now()}`,
              name: `pasted-image-${Date.now()}.png`,
              kind: "image",
              content: b64,
              isBase64: true,
              size: blob.size
            }]);
          });
        }
      }
    };
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, []);

  /* ── Message helpers ── */
  function pushGeorge(text: string, status: GeorgeMsg["status"], statusLabel?: string) {
    const id = `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setMsgs(prev => [...prev, { id, role: "george", text, status, statusLabel, ts: Date.now() }]);
    return id;
  }

  function updateMsg(id: string, patch: Partial<GeorgeMsg>) {
    setMsgs(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }

  /* ── Drag & Drop ── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  async function processFiles(files: File[]) {
    const added: AttachedFile[] = [];
    for (const f of files) {
      const kind = fileKind(f.name);
      if (kind === "image") {
        const b64 = await readFileAsBase64(f);
        added.push({ id: `att-${Date.now()}-${f.name}`, name: f.name, kind, content: b64, isBase64: true, size: f.size });
      } else if (f.size < 400_000) {
        const txt = await readFileAsText(f);
        added.push({ id: `att-${Date.now()}-${f.name}`, name: f.name, kind, content: txt, isBase64: false, size: f.size });
      } else {
        added.push({ id: `att-${Date.now()}-${f.name}`, name: f.name, kind: "other", content: `[Large file: ${(f.size/1024).toFixed(0)}KB]`, isBase64: false, size: f.size });
      }
    }
    setAtts(prev => [...prev, ...added]);
  }

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files: File[] = [];
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const f = e.dataTransfer.files[i];
      if (f) files.push(f);
    }
    await processFiles(files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = [];
    for (let i = 0; i < (e.target.files?.length ?? 0); i++) {
      const f = e.target.files?.[i];
      if (f) files.push(f);
    }
    await processFiles(files);
    e.target.value = "";
  };

  /* ── Voice ── */
  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice requires Chrome or Edge."); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (ev: any) => {
      let t = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) t += ev.results[i][0].transcript;
      }
      if (t) setInput(p => (p + " " + t).trim());
    };
    rec.start();
    recRef.current = rec;
  };

  /* ── Build AI prompt from history + attachments ── */
  function buildPrompt(userText: string, userAtts: AttachedFile[]): string {
    // Last 8 messages for context
    const history = msgs.slice(-8).map(m =>
      `${m.role === "user" ? "User" : "George"}: ${m.text}`
    ).join("\n");

    let attCtx = "";
    for (const a of userAtts) {
      if (a.kind === "image") {
        attCtx += `\n[User attached image: ${a.name}]`;
      } else if (a.content.length < 3000) {
        attCtx += `\n[File: ${a.name}]\n\`\`\`\n${a.content.slice(0, 2500)}\n\`\`\``;
      }
    }

    return history + attCtx + `\nUser: ${userText}`;
  }

  /* ── Send message ── */
  async function send(explicitText?: string) {
    const text = (explicitText ?? input).trim();
    if (!text && atts.length === 0) return;
    if (busy) return;

    // Push user message
    const userAtts = [...atts];
    setMsgs(prev => [...prev, {
      id: `u-${Date.now()}`,
      role: "user",
      text: text || "(attached files)",
      attachments: userAtts,
      status: "done",
      ts: Date.now()
    }]);
    setInput("");
    setAtts([]);
    setBusy(true);

    /* Offline fallback */
    if (!model) {
      pushGeorge("Model still loading — please wait a moment and try again.", "done");
      setBusy(false);
      return;
    }

    // Show thinking state
    const thinkLabels = ["Planning next steps with user...", "Analyzing your request...", "Thinking...", "Reading context..."];
    const gId = `g-${Date.now()}`;
    setMsgs(prev => [...prev, {
      id: gId, role: "george", text: "", status: "thinking",
      statusLabel: thinkLabels[Math.floor(Math.random() * thinkLabels.length)],
      ts: Date.now()
    }]);

    let accumulated = "";
    let executeTriggerHandled = false;
    const startTime = Date.now();

    await streamGeorge(
      model,
      GEORGE_SYSTEM,
      buildPrompt(text, userAtts),
      "global", // Or pass an actual projectId if available
      /* onToken */
      (token) => {
        accumulated += token;

        // Check for EXECUTE_PROJECT trigger
        if (!executeTriggerHandled && accumulated.includes("EXECUTE_PROJECT:")) {
          const match = accumulated.match(/EXECUTE_PROJECT:([^\n]+)/);
          if (match) {
            executeTriggerHandled = true;
            const projName = match[1].trim().replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "New Aura Project";
            const displayText = accumulated.replace(/EXECUTE_PROJECT:[^\n]+\n?/, "").trim() ||
              `Got it — creating **${projName}**.\n\nSetting up your isolated workspace now...`;

            updateMsg(gId, {
              text: displayText,
              status: "working",
              statusLabel: `Creating project: ${projName}...`
            });

            // Initiate Agentic Handover Pipeline
            fetch("/api/agent/handover", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: projName, description: accumulated })
            })
              .then(r => r.json())
              .then(proj => {
                updateMsg(gId, {
                  text: `✓ Project **"${proj.name}"** created and isolated.\n\nOpening your studio now...`,
                  status: "done",
                  statusLabel: `Worked for ${Math.ceil((Date.now() - startTime) / 1000)}s`
                });
                setBusy(false);
                // Reset conversation for next project after a brief delay
                setTimeout(() => {
                  // Reset to initial greeting
                  setMsgs([{
                    id: `msg-${Date.now()}`,
                    role: "george",
                    text: `✓ Ready for your next project.\n\nWhat would you like to build?`,
                    status: "done",
                    statusLabel: "Ready",
                    ts: Date.now()
                  }]);
                  setInput("");
                  // Navigate to studio
                  onExecuteProject(proj.id, proj.name);
                }, 800);
              })
              .catch(err => {
                updateMsg(gId, { text: `Failed to create project: ${err.message}`, status: "done" });
                setBusy(false);
              });
          }
        }

        if (!executeTriggerHandled) {
          updateMsg(gId, {
            text: accumulated,
            status: "working",
            statusLabel: "Working..."
          });
        }
      },
      /* onDone */
      () => {
        if (!executeTriggerHandled) {
          const elapsed = Math.max(1, Math.ceil((Date.now() - startTime) / 1000));
          updateMsg(gId, {
            text: accumulated || "Ready — describe what you want to build.",
            status: "done",
            statusLabel: `Worked for ${elapsed}s`
          });
          setBusy(false);
        }
      },
      /* onError */
      (err) => {
        updateMsg(gId, {
          text: `AI Connection Error: ${err}\n\n*Check your \`.env\` file to ensure your \`GEMINI_API_KEY\` is valid and has not expired.*`,
          status: "done"
        });
        setBusy(false);
      }
    );
  }

  const handleExecute = () => {
    const text = input.trim();
    if (text) {
      send(text);
    } else if (msgs.length > 1) {
      send("Execute — start building now.");
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  /* ── Layout: centered if only 0-1 messages, chat mode after ── */
  const isCentered = msgs.length <= 1;

  return (
    <div
      className="flex flex-col h-full relative bg-[#07070B]"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* ── Drag overlay ── */}
      {dragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#07070B]/90 border-2 border-dashed border-purple-400/50 rounded-xl pointer-events-none">
          <FolderOpen className="w-12 h-12 text-purple-300 mb-3" />
          <p className="text-white font-bold text-lg">Drop files here</p>
          <p className="text-white/40 text-sm mt-1">Files, images, code — George reads everything</p>
        </div>
      )}

      {/* ── Top status bar ── */}
      <div className="h-10 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.25em]">Aura OS George Core</span>
        </div>
        <div className="flex items-center gap-2">
          {ollamaStatus === "checking" && (
            <span className="flex items-center gap-1.5 text-[10px] text-amber-400/70 font-mono">
              <Loader2 className="w-3 h-3 animate-spin" /> Connecting to Ollama...
            </span>
          )}
          {ollamaStatus === "online" && (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              {model} · local · free
            </span>
          )}
          {ollamaStatus === "offline" && (
            <span className="flex items-center gap-1.5 text-[10px] text-red-400/70 font-mono">
              <AlertCircle className="w-3 h-3" /> Ollama offline
            </span>
          )}
        </div>
      </div>

      {/* ── Messages / Center layout ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isCentered ? (
          /* ── Centered boot screen ── */
          <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
            {/* Icon */}
            <div className="relative mb-5">
              <div className="w-[72px] h-[72px] rounded-[22px] bg-gradient-to-br from-purple-600/20 via-indigo-600/15 to-cyan-600/20 border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.12)]">
                <Sparkles className="w-9 h-9 text-cyan-300" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#07070B]" />
            </div>

            <h1 className="text-[2.6rem] font-black tracking-tight text-white leading-none mb-2">
              Aura OS George Core
            </h1>
            <p className="text-white/35 text-[13px] max-w-[320px] leading-relaxed mb-1">
              Sovereign architect is online.
            </p>
            <p className="text-white/20 text-[11px] max-w-[280px] leading-relaxed mb-7">
              Ask me to launch configurations, draft blueprints, or apply patches.
            </p>

            {/* George greeting if present */}
            {msgs[0] && (
              <div className="max-w-[480px] w-full mb-6 text-left">
                <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[9px] text-white/35 font-mono uppercase tracking-widest">George</span>
                    {msgs[0].statusLabel && (
                      <span className="ml-auto flex items-center gap-1 text-[9px] text-white/25 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        {msgs[0].statusLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">
                    {renderText(msgs[0].text)}
                  </p>
                </div>
              </div>
            )}

            {/* Centered input */}
            <div className="max-w-[520px] w-full">
              <InputBox
                input={input} setInput={setInput}
                atts={atts} setAtts={setAtts}
                listening={listening} busy={busy}
                textareaRef={textareaRef} fileRef={fileRef}
                onKey={handleKey} onSend={() => send()} onExecute={handleExecute}
                onVoice={toggleVoice} onFileClick={() => fileRef.current?.click()}
                onFileInput={onFileInput}
                placeholder="Ask George to architect something..."
                minRows={4}
              />
            </div>
          </div>
        ) : (
          /* ── Chat mode ── */
          <div className="max-w-[720px] mx-auto px-5 py-6 space-y-5">
            {msgs.map(msg => (
              <BubbleRow key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Bottom input bar (chat mode only) ── */}
      {!isCentered && (
        <div className="flex-shrink-0 border-t border-white/[0.05] bg-[#07070B]/95 backdrop-blur p-4">
          <div className="max-w-[720px] mx-auto">
            <InputBox
              input={input} setInput={setInput}
              atts={atts} setAtts={setAtts}
              listening={listening} busy={busy}
              textareaRef={textareaRef} fileRef={fileRef}
              onKey={handleKey} onSend={() => send()} onExecute={handleExecute}
              onVoice={toggleVoice} onFileClick={() => fileRef.current?.click()}
              onFileInput={onFileInput}
              placeholder="Continue the conversation... (Enter to send)"
              minRows={2}
              showSend
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════════════ */

function renderText(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-white font-semibold">{part.slice(2,-2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-white/10 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">{part.slice(1,-1)}</code>;
    return <span key={i}>{part}</span>;
  });
}

function BubbleRow({ msg }: { msg: GeorgeMsg }) {
  if (msg.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end">
            {msg.attachments.map(a => <AttChip key={a.id} a={a} />)}
          </div>
        )}
        <div className="max-w-[72%] bg-gradient-to-br from-purple-600/80 to-indigo-700/80 border border-purple-500/30 rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        </div>
        <span className="text-[9px] text-white/20 font-mono">Just now</span>
      </div>
    );
  }

  /* George bubble */
  return (
    <div className="flex flex-col items-start gap-1">
      {/* Status row */}
      {(msg.status === "thinking" || msg.status === "working") ? (
        <div className="flex items-center gap-2 px-1 mb-1">
          <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
          <span className="text-[10px] text-white/40 font-mono">{msg.statusLabel ?? "Working..."}</span>
        </div>
      ) : msg.status === "done" && msg.statusLabel ? (
        <div className="flex items-center gap-1.5 px-1 mb-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-white/30 font-mono">{msg.statusLabel}</span>
        </div>
      ) : null}

      {msg.text ? (
        <div className="max-w-[78%] bg-white/[0.03] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-[13px] text-white/85 leading-relaxed whitespace-pre-wrap">
            {renderText(msg.text)}
          </p>
          {msg.status === "working" && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
              {[0,1,2].map(i => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-purple-400 animate-bounce inline-block"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      ) : msg.status === "thinking" ? (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-1">
            {[0,1,2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce inline-block"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AttChip({ a, onRemove }: { a: AttachedFile; onRemove?: () => void }) {
  const icons: Record<AttachedFile["kind"], React.ReactNode> = {
    image: <ImageIcon className="w-3 h-3 text-pink-300" />,
    text: <FileText className="w-3 h-3 text-blue-300" />,
    code: <Code className="w-3 h-3 text-emerald-300" />,
    other: <Paperclip className="w-3 h-3 text-white/40" />
  };
  return (
    <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5">
      {a.kind === "image" && a.isBase64 ? (
        <img src={`data:image/png;base64,${a.content}`} alt={a.name} className="w-4 h-4 rounded object-cover" />
      ) : icons[a.kind]}
      <span className="text-[10px] text-white/55 max-w-[110px] truncate">{a.name}</span>
      {onRemove && (
        <button onClick={onRemove} className="text-white/20 hover:text-white/60 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

interface InputBoxProps {
  input: string;
  setInput: (v: string) => void;
  atts: AttachedFile[];
  setAtts: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  listening: boolean;
  busy: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  fileRef: React.RefObject<HTMLInputElement>;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onExecute: () => void;
  onVoice: () => void;
  onFileClick: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  minRows: number;
  showSend?: boolean;
}

function InputBox({
  input, setInput, atts, setAtts, listening, busy,
  textareaRef, fileRef, onKey, onSend, onExecute,
  onVoice, onFileClick, onFileInput,
  placeholder, minRows, showSend
}: InputBoxProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      {/* Attachment chips */}
      {atts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {atts.map(a => (
            <AttChip
              key={a.id}
              a={a}
              onRemove={() => setAtts(prev => prev.filter(x => x.id !== a.id))}
            />
          ))}
        </div>
      )}

      {/* Voice indicator */}
      {listening && (
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="flex gap-0.5 items-end h-4">
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="w-0.5 bg-red-400 rounded-full animate-bounce"
                style={{ height: `${6 + (i % 3) * 4}px`, animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-red-400 font-mono">Listening...</span>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        disabled={busy}
        rows={minRows}
        className="w-full bg-transparent text-white placeholder-white/20 px-4 pt-4 pb-2 resize-none focus:outline-none text-[13px] font-mono leading-relaxed disabled:opacity-50"
        style={{ minHeight: minRows * 24 + "px", maxHeight: "180px" }}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={onFileClick}
            title="Attach files (or drag & drop)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={onVoice}
            title="Voice input"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              listening ? "text-red-400 bg-red-500/10" : "text-white/30 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <span className="text-[9px] text-white/15 font-mono ml-1 hidden sm:block">
            Drop files · Ctrl+V image · Shift+Enter newline
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showSend && (
            <button
              onClick={onSend}
              disabled={busy || (!input.trim() && atts.length === 0)}
              title="Send"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onExecute}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-[11px] font-black rounded-xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(255,255,255,0.08)]"
          >
            {busy ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Working...</>
            ) : (
              <><Zap className="w-3 h-3" /> Execute</>
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" multiple accept="*/*" onChange={onFileInput} className="hidden" />
    </div>
  );
}
