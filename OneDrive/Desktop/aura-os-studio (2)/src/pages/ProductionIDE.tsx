import React, { useState } from "react";
import IDEShell from "../components/IDEShell";
import { ArrowLeft } from "lucide-react";

interface ProductionIDEProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

/**
 * Production-Ready IDE - VS Code / Replit style editor
 * Features:
 * - Real file tree with CRUD operations
 * - Code editor with syntax highlighting
 * - Live preview panel
 * - Integrated terminal
 * - Tab-based file editing
 * - Save/auto-save
 * - Run/build commands
 */
export default function ProductionIDE({
  projectId,
  projectName,
  onClose,
}: ProductionIDEProps) {
  return (
    <div className="w-full h-full">
      <IDEShell
        projectId={projectId}
        projectName={projectName}
        onClose={onClose}
      />
    </div>
  );
}
