export interface Project {
  id: string;
  name: string;
  createdAt: string;
  appCount?: number;
}


export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
}

export interface ChatMessage {
  role: "user" | "george";
  text: string;
  ts?: number;
}

export interface WorkspaceItem {
  id: string;
  type: "file" | "folder";
  name: string;
  content: string;
  parentId: string | null;
  section: "mine" | "george";
  isBinary?: boolean;
  ts: string;
}

export interface IntelEntry {
  text: string;
  fileName?: string;
  imageBase64?: string;
  ts: string;
}

export interface IntelFolder {
  category: string;
  count: number;
  entries: IntelEntry[];
}
