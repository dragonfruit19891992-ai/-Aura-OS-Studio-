import { useState, useEffect } from "react";
import {
  Monitor, Check, RefreshCw, Download, Terminal, Package, Shield, Folder,
  BrainCircuit, Cpu
} from "lucide-react";

export default function DownloadWizard() {
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaStatus, setPwaStatus] = useState<"idle" | "installing" | "done" | "unavailable">("idle");
  const [batStep, setBatStep] = useState<"idle" | "downloading" | "done">("idle");
  const [zipStep, setZipStep] = useState<"idle" | "packing" | "done">("idle");
  const [zipProgress, setZipProgress] = useState(0);
  const [zipFile, setZipFile] = useState("");
  const [fsAccess, setFsAccess] = useState(false);
  const [notifAccess, setNotifAccess] = useState(typeof Notification !== "undefined" && Notification.permission === "granted");

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    window.addEventListener("appinstalled", () => {
      setPwaInstalled(true);
      setPwaStatus("done");
    });
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setPwaInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const installPwa = async () => {
    if (!pwaPrompt) {
      setPwaStatus("unavailable");
      return;
    }
    setPwaStatus("installing");
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === "accepted") {
      setPwaInstalled(true);
      setPwaStatus("done");
    } else {
      setPwaStatus("idle");
    }
  };

  const downloadBat = () => {
    setBatStep("downloading");
    const url = window.location.origin;
    const script = [
      "@echo off",
      "title Aura OS Studio Installer",
      "echo.",
      "echo  ╔══════════════════════════════════════╗",
      "echo  ║      AURA OS STUDIO  —  INSTALLER    ║",
      "echo  ║       George-Powered  v2.0            ║",
      "echo  ╚══════════════════════════════════════╝",
      "echo.",
      "echo  Creating your desktop shortcut...",
      "echo.",
      `set APP_URL=${url}`,
      "set SHORTCUT_NAME=Aura OS Studio",
      "",
      ":: Try Microsoft Edge first",
      "set EDGE_PATH=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe",
      "if not exist \"%EDGE_PATH%\" set EDGE_PATH=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe",
      "",
      ":: Fallback to Chrome",
      "set CHROME_PATH=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe",
      "if not exist \"%CHROME_PATH%\" set CHROME_PATH=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe",
      "",
      ":: Create desktop shortcut via PowerShell",
      "if exist \"%EDGE_PATH%\" (",
      "  powershell -NoProfile -Command \"$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut([Environment]::GetFolderPath('Desktop')+ '\\Aura OS Studio.lnk'); $s.TargetPath='%EDGE_PATH%'; $s.Arguments='--app=%APP_URL% --no-first-run'; $s.Description='Aura OS Studio - George-Powered AI Dev Environment'; $s.Save(); Write-Host '  ICON CREATED: Desktop\\Aura OS Studio.lnk' -ForegroundColor Green\"",
      "  echo.",
      "  echo  ✓ Desktop icon created using Microsoft Edge",
      ") else if exist \"%CHROME_PATH%\" (",
      "  powershell -NoProfile -Command \"$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut([Environment]::GetFolderPath('Desktop')+ '\\Aura OS Studio.lnk'); $s.TargetPath='%CHROME_PATH%'; $s.Arguments='--app=%APP_URL% --no-first-run'; $s.Description='Aura OS Studio - George-Powered AI Dev Environment'; $s.Save(); Write-Host '  ICON CREATED: Desktop\\Aura OS Studio.lnk' -ForegroundColor Green\"",
      "  echo.",
      "  echo  ✓ Desktop icon created using Google Chrome",
      ") else (",
      "  echo.",
      "  echo  ⚠ Could not find Edge or Chrome. Please install either browser.",
      "  echo  Then manually navigate to: %APP_URL%",
      "  echo  In Edge/Chrome: Menu -> More tools -> Create shortcut -> check 'Open as window'",
      ")",
      "",
      "echo.",
      "echo  ════════════════════════════════════════",
      "echo  George is standing by. Open the desktop",
      "echo  icon to launch Aura OS Studio.",
      "echo  ════════════════════════════════════════",
      "echo.",
      "pause",
    ].join("\r\n");
    const blob = new Blob([script], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Install-AuraOS-Studio.bat";
    a.click();
    URL.revokeObjectURL(a.href);
    setTimeout(() => setBatStep("done"), 800);
  };

  const downloadZip = () => {
    setZipStep("packing");
    setZipProgress(0);
    const files = ["src/App.tsx", "server.ts", "package.json", "vite.config.ts", "index.html"];
    let p = 0;
    let fi = 0;
    const t = setInterval(() => {
      p += 12 + Math.random() * 6;
      fi = Math.min(Math.floor((p / 100) * files.length), files.length - 1);
      setZipProgress(Math.min(p, 100));
      setZipFile("Packaging " + files[fi] + "...");
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => {
          setZipStep("done");
          window.location.href = "/api/download/studio";
        }, 300);
      }
    }, 180);
  };

  const requestFs = async () => {
    try {
      await (window as any).showDirectoryPicker({ mode: "read" });
      setFsAccess(true);
    } catch {
      setFsAccess(false);
    }
  };

  const requestNotif = async () => {
    if (typeof Notification !== "undefined") {
      const r = await Notification.requestPermission();
      setNotifAccess(r === "granted");
    }
  };

  return (
    <div className="space-y-5">
      {/* OPTION 1: PWA Install */}
      <div
        className={`rounded-2xl border p-5 relative overflow-hidden transition-all ${
          pwaInstalled
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-purple-500/30 bg-purple-500/5"
        }`}
      >
        <div className="absolute right-4 top-4">
          {pwaInstalled ? (
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/15 px-2 py-1 rounded-full">
              INSTALLED
            </span>
          ) : pwaPrompt ? (
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/15 px-2 py-1 rounded-full">
              RECOMMENDED
            </span>
          ) : (
            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full">
              NOT AVAILABLE
            </span>
          )}
        </div>
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              pwaInstalled ? "bg-emerald-500/20" : "bg-purple-500/20"
            }`}
          >
            <Monitor
              className={`w-6 h-6 ${pwaInstalled ? "text-emerald-400" : "text-purple-400"}`}
            />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black text-sm mb-1">Install as Desktop App</h4>
            <p className="text-white/40 text-[11px] leading-relaxed mb-3">
              Creates a real icon on your desktop. Opens in its own window — no browser bar.
              Integrates flawlessly with your OS shortcuts.
            </p>
            {pwaInstalled ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Check className="w-4 h-4" /> Installed — check your desktop and Start Menu
              </div>
            ) : pwaStatus === "unavailable" ? (
              <div className="text-amber-400 text-xs leading-relaxed">
                Prompt not automatically triggered. <strong>In Edge/Chrome:</strong> look for
                the install icon (⊕) in your browser address bar.
              </div>
            ) : (
              <button
                onClick={installPwa}
                disabled={pwaStatus === "installing"}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {pwaStatus === "installing" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {pwaStatus === "installing" ? "Installing..." : "Install Desktop App"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OPTION 2: Windows Installer */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black text-sm mb-1">
              Windows Desktop Shortcut Installer (.bat)
            </h4>
            <p className="text-white/40 text-[11px] leading-relaxed mb-3">
              Download and run this interactive batch file. It creates a customized Shortcut link icon
              directly using Edge or Chrome app mode.
            </p>
            {batStep === "done" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <Check className="w-4 h-4" /> Install-AuraOS-Studio.bat downloaded
                </div>
                <button
                  onClick={() => setBatStep("idle")}
                  className="text-[10px] text-white/25 hover:text-white/60 transition-colors cursor-pointer"
                >
                  Download again
                </button>
              </div>
            ) : (
              <button
                onClick={downloadBat}
                disabled={batStep === "downloading"}
                className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-cyan-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {batStep === "downloading" ? "Preparing..." : "Download Batch Local Linker"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OPTION 3: Source Bundle */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-white/50" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black text-sm mb-1">Download Source Bundle</h4>
            <p className="text-white/40 text-[11px] leading-relaxed mb-3">
              Downloads the completely formatted studio project logic. Includes server, frontend definitions, and config templates.
            </p>
            {zipStep === "packing" ? (
              <div>
                <p className="text-white/30 text-[10px] mb-2 font-mono">{zipFile}</p>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-200"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
                <p className="text-white/25 text-[10px] font-mono">{Math.floor(zipProgress)}%</p>
              </div>
            ) : zipStep === "done" ? (
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Check className="w-4 h-4 text-green-400" /> Package complete, downloaded!
              </div>
            ) : (
              <button
                onClick={downloadZip}
                className="flex items-center gap-2 bg-white/8 border border-white/10 text-white/60 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/12 hover:text-white/80 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Create Source Bundle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SYSTEM NATIVE ACCESS MONITOR */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <h4 className="text-white font-black text-sm mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Native Environment Access
        </h4>
        <p className="text-white/35 text-[11px] mb-4">
          Authorized capabilities to bypass browser limitations.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-black/20 border border-white/8 rounded-xl">
            <div className="flex items-center gap-3">
              <Folder className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Local Directory Picker</div>
                <div className="text-[10px] text-white/35">File system sync authorizations</div>
              </div>
            </div>
            {fsAccess ? (
              <span className="text-[9px] text-emerald-400 font-black bg-emerald-500/15 px-2 py-1 rounded-full">
                CONNECTED
              </span>
            ) : (
              <button
                onClick={requestFs}
                className="text-[9px] font-black text-white/50 hover:text-white bg-white/8 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Connect Directory
              </button>
            )}
          </div>
          <div className="flex items-center justify-between p-3.5 bg-black/20 border border-white/8 rounded-xl">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">OS System Notifications</div>
                <div className="text-[10px] text-white/35">Standby prompt notices</div>
              </div>
            </div>
            {notifAccess ? (
              <span className="text-[9px] text-emerald-400 font-black bg-emerald-500/15 px-2 py-1 rounded-full">
                ENABLED
              </span>
            ) : (
              <button
                onClick={requestNotif}
                className="text-[9px] font-black text-white/50 hover:text-white bg-white/8 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Authorize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
