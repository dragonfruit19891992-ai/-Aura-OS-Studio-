const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\(\"\/api\/projects\", \(req, res\) => \{[\s\S]*?res\.json\(newProject\);\s*\}\);/;

const replacement = \pp.post("/api/projects", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const projects = readJSON("projects_meta.json", []);
    const id = "proj_" + Math.random().toString(36).substring(2, 10);
    const newProject = { id, name, createdAt: new Date().toISOString(), appCount: 1 };
    projects.push({ id, name, createdAt: newProject.createdAt });
    writeJSON("projects_meta.json", projects);
  
    // create physical project directory
    const projPath = path.join(PROJECTS_DIR, id);
    fs.mkdirSync(projPath, { recursive: true });
  
    // Scaffold Cinematic React App
    fs.writeFileSync(path.join(projPath, "package.json"), JSON.stringify({
      "name": name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      "private": true,
      "version": "0.0.0",
      "type": "module",
      "scripts": { "dev": "vite", "build": "tsc && vite build" },
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.263.1"
      },
      "devDependencies": {
        "@types/react": "^18.2.15",
        "@types/react-dom": "^18.2.7",
        "@vitejs/plugin-react": "^4.0.3",
        "autoprefixer": "^10.4.14",
        "postcss": "^8.4.27",
        "tailwindcss": "^3.3.3",
        "typescript": "^5.0.2",
        "vite": "^4.4.5"
      }
    }, null, 2));

    fs.writeFileSync(path.join(projPath, "vite.config.ts"), \\\import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})\\\);

    fs.writeFileSync(path.join(projPath, "tailwind.config.js"), \\\/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}\\\);

    fs.writeFileSync(path.join(projPath, "postcss.config.js"), \\\export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}\\\);

    fs.writeFileSync(path.join(projPath, "index.html"), \\\<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\\\</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>\\\);

    fs.mkdirSync(path.join(projPath, "src"), { recursive: true });

    fs.writeFileSync(path.join(projPath, "src/index.css"), \\\@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #050505;
  color: white;
}\\\);

    fs.writeFileSync(path.join(projPath, "src/main.tsx"), \\\import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)\\\);

    fs.writeFileSync(path.join(projPath, "src/App.tsx"), \\\import React from 'react';
import { Sparkles, Activity, Layers, Cpu } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        <div className="inline-flex items-center justify-center p-5 bg-white/[0.02] rounded-3xl border border-white/10 shadow-[0_0_100px_-20px_rgba(168,85,247,0.3)] relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl group-hover:blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
          <Sparkles className="w-14 h-14 text-purple-400 relative z-10" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20">
            \\\
          </h1>
          <p className="text-xl text-white/40 font-mono tracking-[0.2em] uppercase">
            Aura OS • Cinematic Core Initialized
          </p>
        </div>
        
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all duration-500 text-left group hover:bg-white/[0.04]">
            <h3 className="text-white/80 font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Live System
            </h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Your sovereign workspace is actively rendering. The environment is pure React + Vite + Tailwind.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all duration-500 text-left group hover:bg-white/[0.04]">
            <h3 className="text-white/80 font-bold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" />
              Immortal Memory
            </h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">George AI is directly connected to the Phase Two database. All conversations are stored permanently.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 text-left group hover:bg-white/[0.04]">
            <h3 className="text-white/80 font-bold mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Ready to Build
            </h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Open the George AI panel to start writing code. Changes will hot-reload instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;\\\);
  
    res.json(newProject);
  });\;

const newContent = content.replace(regex, replacement);
fs.writeFileSync('server.ts', newContent, 'utf8');
console.log('Replaced successfully');
