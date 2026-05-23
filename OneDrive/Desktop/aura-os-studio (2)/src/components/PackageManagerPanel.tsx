import React, { useState, useEffect, useCallback } from "react";
import { Search, Package, Download, Trash2, Loader2, RefreshCw } from "lucide-react";

interface Props {
  projectId: string;
}

export default function PackageManagerPanel({ projectId }: Props) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [dependencies, setDependencies] = useState<Record<string, string>>({});
  const [devDependencies, setDevDependencies] = useState<Record<string, string>>({});
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  
  const [managingPkg, setManagingPkg] = useState<string | null>(null);

  const loadPackages = useCallback(async () => {
    setIsLoadingPackages(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/packages`);
      const data = await res.json();
      setDependencies(data.dependencies || {});
      setDevDependencies(data.devDependencies || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPackages(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const searchNpm = async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/packages/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchNpm(query);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const managePackage = async (action: "install" | "uninstall", packageName: string, isDev = false) => {
    setManagingPkg(packageName);
    try {
      await fetch(`/api/projects/${projectId}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, packageName, isDev })
      });
      await loadPackages();
    } catch (err) {
      console.error(err);
    } finally {
      setManagingPkg(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#07070B]/80 text-white font-mono text-[11px]">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-400" />
          <span className="font-bold uppercase tracking-wider text-white/80">Packages</span>
        </div>
        <button onClick={loadPackages} className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPackages ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NPM packages..."
            className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-3 focus:outline-none focus:border-emerald-500/50 text-white placeholder-white/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {query.trim() ? (
          <div className="p-3 space-y-3">
            <h3 className="text-[9px] uppercase tracking-widest text-white/40 mb-2">Search Results</h3>
            {isSearching ? (
              <div className="flex items-center gap-2 text-white/50"><Loader2 className="w-3.5 h-3.5 animate-spin"/> Searching...</div>
            ) : searchResults.map((pkg) => (
              <div key={pkg.name} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] flex flex-col gap-2 group hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-300">{pkg.name}</div>
                  <div className="text-[9px] text-white/40">{pkg.version}</div>
                </div>
                <div className="text-white/60 text-[10px] line-clamp-2 leading-relaxed">{pkg.description}</div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => managePackage("install", pkg.name)}
                    disabled={managingPkg === pkg.name}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                  >
                    {managingPkg === pkg.name ? <Loader2 className="w-3 h-3 animate-spin"/> : <Download className="w-3 h-3"/>}
                    Install
                  </button>
                  <button
                    onClick={() => managePackage("install", pkg.name, true)}
                    disabled={managingPkg === pkg.name}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 text-white/70"
                  >
                    Dev Dependency
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-6">
            <div>
              <h3 className="text-[9px] uppercase tracking-widest text-white/40 mb-3 flex items-center justify-between">
                <span>Dependencies</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded">{Object.keys(dependencies).length}</span>
              </h3>
              <div className="space-y-1">
                {Object.entries(dependencies).map(([name, version]) => (
                  <div key={name} className="flex items-center justify-between group py-1.5 px-2 rounded hover:bg-white/5 transition-colors">
                    <div>
                      <span className="text-white/90">{name}</span>
                      <span className="text-white/40 ml-2">{String(version)}</span>
                    </div>
                    <button 
                      onClick={() => managePackage("uninstall", name)}
                      disabled={managingPkg === name}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                      {managingPkg === name ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[9px] uppercase tracking-widest text-white/40 mb-3 flex items-center justify-between">
                <span>Dev Dependencies</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded">{Object.keys(devDependencies).length}</span>
              </h3>
              <div className="space-y-1">
                {Object.entries(devDependencies).map(([name, version]) => (
                  <div key={name} className="flex items-center justify-between group py-1.5 px-2 rounded hover:bg-white/5 transition-colors">
                    <div>
                      <span className="text-white/90">{name}</span>
                      <span className="text-white/40 ml-2">{String(version)}</span>
                    </div>
                    <button 
                      onClick={() => managePackage("uninstall", name)}
                      disabled={managingPkg === name}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                      {managingPkg === name ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
