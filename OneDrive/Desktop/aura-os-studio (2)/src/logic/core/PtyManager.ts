import * as pty from 'node-pty';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

// Helper to strip ANSI color codes from raw PTY output for the Memory Lasso
function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  const pattern = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  return text.replace(pattern, '');
}

export class PtyManager {
  private ptys: Map<string, pty.IPty> = new Map();
  private dataCallbacks: Map<string, (data: string) => void> = new Map();

  /**
   * Spawns a PTY for the given project, hooked into the Memory Lasso.
   */
  public spawnPty(projectId: string, projectDir: string, onData: (data: string) => void) {
    if (this.ptys.has(projectId)) {
      this.ptys.get(projectId)!.kill();
    }

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    
    const projectBin = path.join(projectDir, '.bin');
    const customEnv = { ...process.env };
    customEnv.PATH = `${projectBin}${path.delimiter}${customEnv.PATH || ''}`;

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: projectDir,
      env: customEnv as any
    });

    this.ptys.set(projectId, ptyProcess);
    this.dataCallbacks.set(projectId, onData);

    // Setup Memory Lasso directory
    const georgeDir = path.join(projectDir, '.george');
    if (!fs.existsSync(georgeDir)) {
      fs.mkdirSync(georgeDir, { recursive: true });
    }
    const lassoLogPath = path.join(georgeDir, 'terminal_memory_lasso.log');

    // Handle incoming data from the shell
    ptyProcess.onData((data) => {
      // 1. Send raw data (with colors) to the frontend xterm.js
      onData(data);

      // 2. Lasso the memory (strip colors and log it for the cognitive engine)
      const cleanText = stripAnsi(data);
      if (cleanText) {
        fs.appendFile(lassoLogPath, cleanText, (err) => {
          if (err) console.error(`[Memory Lasso] Failed to log terminal data for ${projectId}`, err);
        });
      }
    });

    // Write initial boot command to clear screen or show custom motd?
    // Let's just let the native shell print its preamble.
  }

  public write(projectId: string, data: string) {
    const ptyProcess = this.ptys.get(projectId);
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  }

  public resize(projectId: string, cols: number, rows: number) {
    const ptyProcess = this.ptys.get(projectId);
    if (ptyProcess) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (e) {
        // Ignore resize errors
      }
    }
  }

  public kill(projectId: string) {
    const ptyProcess = this.ptys.get(projectId);
    if (ptyProcess) {
      ptyProcess.kill();
      this.ptys.delete(projectId);
      this.dataCallbacks.delete(projectId);
    }
  }
}

export const TerminalManager = new PtyManager();
