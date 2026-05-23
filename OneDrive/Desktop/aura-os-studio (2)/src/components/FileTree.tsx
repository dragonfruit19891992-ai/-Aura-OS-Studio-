import React, { useState, useEffect } from "react";
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Plus, Trash2, Edit2
} from "lucide-react";
import { FileNode } from "../types";

interface FileTreeProps {
  projectId: string;
  onSelectFile: (path: string, name: string) => void;
  selectedPath?: string;
  onRefresh?: () => void;
}

export default function FileTree({ projectId, onSelectFile, selectedPath, onRefresh }: FileTreeProps) {
  const [tree, setTree] = useState<FileNode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadTree();
  }, [projectId]);

  const loadTree = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/tree`);
      const data = await res.json();
      setTree(data);
    } catch (err) {
      console.error("Failed to load file tree:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const handleCreateFile = async () => {
    const name = prompt("New file name:");
    if (!name) return;
    try {
      await fetch(`/api/projects/${projectId}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: name, type: "file" })
      });
      loadTree();
      onRefresh?.();
    } catch (err) {
      alert("Failed to create file");
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("New folder name:");
    if (!name) return;
    try {
      await fetch(`/api/projects/${projectId}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: name, type: "folder" })
      });
      loadTree();
      onRefresh?.();
    } catch (err) {
      alert("Failed to create folder");
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;
    try {
      await fetch(`/api/projects/${projectId}/file`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      loadTree();
      onRefresh?.();
    } catch (err) {
      alert("Failed to delete file");
    }
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedPath === node.path;
    const isFolder = node.type === "folder";
    const paddingLeft = depth * 16;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-slate-700/50 rounded ${
            isSelected ? "bg-blue-600/30 border-l-2 border-blue-500" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {isFolder && (
            <button
              onClick={() => toggleExpand(node.path)}
              className="p-0 hover:bg-slate-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {!isFolder && <div className="w-4" />}

          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={16} className="text-yellow-400" />
            ) : (
              <Folder size={16} className="text-yellow-400" />
            )
          ) : (
            <FileText size={16} className="text-slate-400" />
          )}

          <span
            onClick={() => !isFolder && onSelectFile(node.path, node.name)}
            className="text-sm flex-1 truncate text-slate-200 hover:text-white"
          >
            {node.name}
          </span>

          <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDelete(node.path)}
              className="p-0.5 hover:bg-red-600/30 rounded text-red-400"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700">
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Files</h3>
        <div className="flex gap-1">
          <button
            onClick={handleCreateFile}
            className="p-1 hover:bg-slate-700 rounded text-slate-400"
            title="New File"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleCreateFolder}
            className="p-1 hover:bg-slate-700 rounded text-slate-400"
            title="New Folder"
          >
            <Folder size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto text-slate-200 text-sm">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Loading...</div>
        ) : tree ? (
          renderNode(tree)
        ) : (
          <div className="p-4 text-center text-slate-500">Empty project</div>
        )}
      </div>
    </div>
  );
}
