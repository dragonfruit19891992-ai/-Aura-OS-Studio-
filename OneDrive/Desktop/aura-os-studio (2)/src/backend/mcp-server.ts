// ── MODEL CONTEXT PROTOCOL (MCP) SERVER ─────────────────────────────────────
// Provides local file system access to AI models safely within workspace boundary
// Implements MCP over Server-Sent Events (SSE)
// 
// Security: All paths are validated against WORKSPACE_ROOT to prevent traversal
// attacks (e.g., ../../etc/passwd)

import express, { Express, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

interface MCPRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: { code: number; message: string };
}

const WORKSPACE_ROOT = process.cwd();

// Tool definitions that tell the AI what it can do
const AVAILABLE_TOOLS = [
  {
    name: "read_file",
    description: "Read the contents of a local file in the codebase. Returns file content as text.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Relative path to the file (e.g., 'src/main.ts', 'package.json')"
        }
      },
      required: ["filePath"]
    }
  },
  {
    name: "list_directory",
    description: "List all files and folders in a directory. Returns newline-separated file names.",
    inputSchema: {
      type: "object",
      properties: {
        dirPath: {
          type: "string",
          description: "Relative path to directory (e.g., 'src', 'src/components'). Empty string = root."
        }
      },
      required: ["dirPath"]
    }
  },
  {
    name: "search_files",
    description: "Search for files matching a pattern",
    inputSchema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Glob or filename pattern (e.g., '*.tsx', 'test-*.ts')"
        },
        dirPath: {
          type: "string",
          description: "Directory to search in (default: root)"
        }
      },
      required: ["pattern"]
    }
  }
];

/**
 * Handle tool execution requests
 * Returns either a successful result or an error that the LLM can interpret
 */
async function handleToolCall(
  toolName: string,
  args: Record<string, any>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    if (toolName === "read_file") {
      return await handleReadFile(args.filePath);
    }

    if (toolName === "list_directory") {
      return await handleListDirectory(args.dirPath || "");
    }

    if (toolName === "search_files") {
      return await handleSearchFiles(args.pattern, args.dirPath || "");
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
      isError: true
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error executing ${toolName}: ${error.message}` }],
      isError: true
    };
  }
}

/**
 * Read a single file with security validation
 */
async function handleReadFile(filePath: string) {
  const targetPath = path.resolve(WORKSPACE_ROOT, filePath);

  // Security: Prevent directory traversal (e.g., ../../etc/passwd)
  if (!targetPath.startsWith(WORKSPACE_ROOT)) {
    return {
      content: [{ type: "text", text: "Access denied: Path outside workspace boundary" }],
      isError: true
    };
  }

  // Check if it's a file and readable
  const stat = await fs.stat(targetPath);
  if (!stat.isFile()) {
    return {
      content: [{ type: "text", text: `${filePath} is not a file` }],
      isError: true
    };
  }

  const content = await fs.readFile(targetPath, "utf-8");
  return {
    content: [{ type: "text", text: content }]
  };
}

/**
 * List directory contents
 */
async function handleListDirectory(dirPath: string) {
  const targetPath = dirPath ? path.resolve(WORKSPACE_ROOT, dirPath) : WORKSPACE_ROOT;

  // Security check
  if (!targetPath.startsWith(WORKSPACE_ROOT)) {
    return {
      content: [{ type: "text", text: "Access denied: Path outside workspace" }],
      isError: true
    };
  }

  const entries = await fs.readdir(targetPath);
  return {
    content: [{ type: "text", text: entries.join("\n") }]
  };
}

/**
 * Simple glob-style pattern matching
 * Recursively searches and returns matching files
 */
async function handleSearchFiles(pattern: string, baseDir: string): Promise<any> {
  const targetPath = baseDir ? path.resolve(WORKSPACE_ROOT, baseDir) : WORKSPACE_ROOT;

  if (!targetPath.startsWith(WORKSPACE_ROOT)) {
    return {
      content: [{ type: "text", text: "Access denied: Path outside workspace" }],
      isError: true
    };
  }

  const results: string[] = [];
  const patternRegex = new RegExp(
    "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
  );

  async function search(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(WORKSPACE_ROOT, fullPath);

        if (patternRegex.test(entry.name)) {
          results.push(relPath);
        }

        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await search(fullPath);
        }
      }
    } catch {
      // Silently skip inaccessible directories
    }
  }

  await search(targetPath);

  if (results.length === 0) {
    return {
      content: [{ type: "text", text: `No files matching pattern: ${pattern}` }]
    };
  }

  return {
    content: [{ type: "text", text: results.join("\n") }]
  };
}

/**
 * Process JSON-RPC MCP requests
 * This is the core handler called by the HTTP endpoints
 */
function processMCPRequest(request: MCPRequest): MCPResponse {
  if (request.method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: { tools: AVAILABLE_TOOLS }
    };
  }

  if (request.method === "tools/call") {
    const { name, arguments: args } = request.params || {};
    // Note: this is async, so we need to handle it in the express route
    // Return a placeholder; the route handler will process this
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: { _pending: true, toolName: name, toolArgs: args }
    };
  }

  return {
    jsonrpc: "2.0",
    id: request.id,
    error: { code: -32601, message: `Unknown method: ${request.method}` }
  };
}

/**
 * Setup MCP routes on your Express app
 * Call this after creating your app but before server.listen()
 */
export function setupMCPServer(app: Express) {
  // SSE endpoint: Client connects here to receive responses
  app.get("/mcp/sse", (req: Request, res: Response) => {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Send initial connection confirmation
    res.write("data: {\"jsonrpc\":\"2.0\",\"method\":\"initialization\",\"params\":{\"protocolVersion\":\"2024-11-05\"}}\n\n");

    // Keep connection alive
    const keepAliveInterval = setInterval(() => {
      res.write(": keep-alive\n\n");
    }, 30000);

    res.on("close", () => {
      clearInterval(keepAliveInterval);
    });
  });

  // JSON-RPC endpoint: Client posts requests here
  app.post("/mcp/messages", async (req: Request, res: Response) => {
    try {
      const request = req.body as MCPRequest;

      if (!request.method) {
        return res.status(400).json({
          jsonrpc: "2.0",
          id: request.id,
          error: { code: -32600, message: "Invalid Request" }
        });
      }

      // Handle tools/call specially since it's async
      if (request.method === "tools/call") {
        const { name, arguments: args } = request.params || {};
        const result = await handleToolCall(name, args || {});
        return res.json({
          jsonrpc: "2.0",
          id: request.id,
          result: result
        });
      }

      // All other methods are synchronous
      const response = processMCPRequest(request);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({
        jsonrpc: "2.0",
        id: req.body?.id,
        error: { code: -32603, message: `Internal error: ${error.message}` }
      });
    }
  });

  // Simple info endpoint to verify MCP is running
  app.get("/mcp/info", (req: Request, res: Response) => {
    res.json({
      name: "Aura OS MCP Server",
      version: "1.0.0",
      capabilities: ["tools"],
      workspaceRoot: WORKSPACE_ROOT
    });
  });

  console.log("✓ MCP Server initialized on /mcp/sse, /mcp/messages, /mcp/info");
}

export default { setupMCPServer, AVAILABLE_TOOLS };
