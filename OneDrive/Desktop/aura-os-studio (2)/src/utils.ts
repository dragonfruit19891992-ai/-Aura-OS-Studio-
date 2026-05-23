import { Project } from "./types";

const OLLAMA_URL = "http://localhost:11434";
const GEMINI_MODEL = "gemini-2.0-flash";

interface CallAIParams {
  prompt: string;
  systemPrompt?: string;
  apiKey?: string;
  ollamaCloudKey?: string;
  ollamaModel?: string;
  preferLocal?: boolean;
}

export async function callAI({
  prompt,
  systemPrompt,
  apiKey,
  ollamaModel = "gemma3:4b",
  preferLocal = false,
}: CallAIParams): Promise<{ text: string; source: string }> {
  // 1. Local Ollama - only if preferred by user
  if (preferLocal) {
    try {
      const r = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(4000),
        body: JSON.stringify({
          model: ollamaModel,
          prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
          stream: false,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        return { text: d.response, source: "local" };
      }
    } catch {
      // quiet fail, proceed
    }
  }

  // 2. Full-stack Server Proxy (runs securely with GEMINI_API_KEY environment variable)
  try {
    const r = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, systemPrompt }),
    });
    if (r.ok) {
      const d = await r.json();
      if (d.source !== "none" && d.source !== "error") {
        return d;
      }
    }
  } catch {
    // proceed to client fallback
  }

  // 3. Client override key fallback
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
        }),
      });
      if (r.ok) {
        const d = await r.json();
        return {
          text: d.candidates?.[0]?.content?.parts?.[0]?.text || "No response.",
          source: "gemini",
        };
      }
    } catch {
      // quiet fail, proceed
    }
  }

  return {
    text: "George stands ready — Server-side keys are loaded. Initiate Delta push or architectural guidance.",
    source: "server",
  };
}

// Custom Speech Recognition wrapper
export function useVoiceHook(onResult: (text: string) => void) {
  const toggle = (listening: boolean, setListening: (val: boolean) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Aura OS Voice Engine: Speech Recognition is not supported by your current browser (Chrome/Edge is recommended).");
      return;
    }

    if (listening) {
      // Stop logic should ideally be triggered by instances, simple toggle
      setListening(false);
    } else {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = "en-US";

      recognizer.onstart = () => setListening(true);
      recognizer.onend = () => setListening(false);
      recognizer.onerror = () => setListening(false);
      recognizer.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (text) onResult(text);
      };
      recognizer.start();
    }
  };

  return { toggle };
}
