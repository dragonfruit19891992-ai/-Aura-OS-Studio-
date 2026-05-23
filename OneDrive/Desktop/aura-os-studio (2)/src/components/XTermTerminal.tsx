import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import "@xterm/xterm/css/xterm.css";

interface XTermTerminalProps {
  projectId: string;
}

export function XTermTerminal({ projectId }: XTermTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
      fontSize: 12,
      theme: {
        background: "#020204",
        foreground: "#f8f8f2",
        cursor: "#a855f7",
        selectionBackground: "rgba(168, 85, 247, 0.3)",
        black: "#21222c",
        red: "#ff5555",
        green: "#50fa7b",
        yellow: "#f1fa8c",
        blue: "#bd93f9",
        magenta: "#ff79c6",
        cyan: "#8be9fd",
        white: "#f8f8f2",
        brightBlack: "#6272a4",
        brightRed: "#ff6e6e",
        brightGreen: "#69ff94",
        brightYellow: "#ffffa5",
        brightBlue: "#d6acff",
        brightMagenta: "#ff92df",
        brightCyan: "#a4ffff",
        brightWhite: "#ffffff"
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    
    // Load WebGL Addon for high performance rendering if possible
    try {
      const webglAddon = new WebglAddon();
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn("WebGL addon failed to load, falling back to canvas", e);
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    fitAddon.fit();

    // Setup WebSocket
    const ws = new WebSocket(`ws://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "terminal:start", projectId }));
      // Send initial size
      ws.send(JSON.stringify({ 
        type: "terminal:resize", 
        cols: term.cols, 
        rows: term.rows 
      }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "terminal:out" && msg.data) {
          term.write(msg.data);
        } else if (msg.type === "terminal:ready") {
          term.write(`\x1b[35m[Aura OS] Cognitive PTY Gateway Linked -> ${msg.cwd}\x1b[0m\r\n\r\n`);
        }
      } catch (err) {
        // If it's not JSON, it might just be raw text, but our backend sends JSON wrapped
      }
    };

    ws.onclose = () => {
      term.write("\r\n\x1b[31m[Aura OS] Gateway connection closed.\x1b[0m\r\n");
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "terminal:input", data }));
      }
    });

    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ 
            type: "terminal:resize", 
            cols: xtermRef.current.cols, 
            rows: xtermRef.current.rows 
          }));
        }
      }
    };

    // Use ResizeObserver on the container to detect React panel resizes perfectly
    const observer = new ResizeObserver(() => {
      handleResize();
    });
    observer.observe(terminalRef.current);

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      ws.close();
      term.dispose();
    };
  }, [projectId]);

  return (
    <div className="w-full h-full relative p-2" style={{ backgroundColor: "#020204" }}>
      <div ref={terminalRef} className="absolute inset-0 pl-2 pt-2 pb-2 pr-1" />
    </div>
  );
}
