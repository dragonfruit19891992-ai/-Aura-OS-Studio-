import React, { useState, useEffect, useRef } from "react";
import { Terminal, CornerDownLeft } from "lucide-react";

interface TerminalLine {
  t: "in" | "out" | "err" | "sys";
  v: string;
}

export default function TerminalPanel({ projectId }: { projectId: string }) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLines([{ t: "sys", v: "Connecting to Aura OS Terminal..." }]);
    setConnected(false);

    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${wsProto}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "terminal:start", projectId }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "terminal:ready") {
        setConnected(true);
        setLines((prev) => [
          ...prev,
          { t: "sys", v: `Shell ready — listening in ${msg.cwd}` },
        ]);
        inputRef.current?.focus();
      }
      if (msg.type === "terminal:out") {
        setLines((prev) => [...prev, { t: "out", v: msg.data }]);
      }
      if (msg.type === "terminal:exit") {
        setConnected(false);
        setLines((prev) => [
          ...prev,
          { t: "sys", v: `Process exited with code (${msg.code})` },
        ]);
      }
    };

    ws.onerror = () => {
      setLines((prev) => [...prev, { t: "err", v: "Terminal connection error" }]);
    };

    ws.onclose = () => {
      setConnected(false);
      setLines((prev) => [...prev, { t: "sys", v: "Disconnected from terminal session." }]);
    };

    return () => {
      ws.close();
    };
  }, [projectId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !input.trim()) return;
    wsRef.current.send(JSON.stringify({ type: "terminal:input", data: input.trim() }));
    setLines((prev) => [...prev, { t: "in", v: "$ " + input.trim() }]);
    setInput("");
  };

  const getLineColor = (t: string) => {
    switch (t) {
      case "in":
        return "text-cyan-300";
      case "err":
        return "text-red-400";
      case "sys":
        return "text-purple-400";
      default:
        return "text-green-300/90";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050508] font-mono text-xs overflow-hidden">
      <div className="h-9 border-b border-white/5 flex items-center px-4 gap-3 bg-[#0a0a12] flex-shrink-0">
        <Terminal className="w-3.5 h-3.5 text-white/30" />
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            connected
              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              : "bg-red-500/40"
          }`}
        />
        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
          {connected ? "ROOT@AURA: ~" : "OFFLINE"}
        </span>
        <div className="flex-1" />
      </div>
      <div className="flex-1 overflow-auto p-3 custom-scrollbar">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`leading-5 whitespace-pre-wrap break-all ${getLineColor(l.t)}`}
          >
            {l.v}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="border-t border-white/5 flex items-center gap-2 p-2 bg-[#0a0a10]"
      >
        <span className="text-cyan-400 flex-shrink-0">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-green-300 focus:outline-none placeholder-white/20 min-w-0"
          placeholder={connected ? "enter command... (e.g. ls, help)" : "waiting..."}
          disabled={!connected}
        />
        <button
          type="submit"
          disabled={!connected}
          className="text-white/20 hover:text-white disabled:opacity-20"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
