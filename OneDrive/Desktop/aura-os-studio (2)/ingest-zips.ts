import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ZIPS_DIR = path.join(process.cwd(), "data", "zips");
const META_FILE = path.join(process.cwd(), "data", "zips_meta.json");

function readJSON(file: string, def: any = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return def; }
}

function writeJSON(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Ensure meta exists
if (!fs.existsSync(META_FILE)) writeJSON(META_FILE, []);

const zipsMeta = readJSON(META_FILE, []);
const files = fs.readdirSync(ZIPS_DIR);

console.log(`Found ${files.length} items in data/zips...`);

for (const file of files) {
  if (file.toLowerCase().endsWith('.zip')) {
    const zipPath = path.join(ZIPS_DIR, file);
    const stat = fs.statSync(zipPath);
    
    // Skip if it's already processed or we just want to process .zip
    const nameWithoutExt = file.substring(0, file.length - 4);
    
    // Generate a unique ID (or use the name directly but make sure it's valid)
    // To avoid breaking existing references, we use a clean ID
    const id = "zip_" + Math.random().toString(36).substring(2, 10);
    const destDir = path.join(ZIPS_DIR, id);
    
    console.log(`\n📦 Processing: ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   Extracting to: ${id}`);
    
    fs.mkdirSync(destDir, { recursive: true });
    
    try {
      // Use tar -xf which is built into modern Windows 10/11 and is highly efficient
      execSync(`tar -xf "${file}" -C "${id}"`, { cwd: ZIPS_DIR, stdio: 'inherit' });
      
      console.log(`   Extraction complete. Registering in Vault...`);
      
      // Count files roughly
      let fileCount = 0;
      const countFiles = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          if (e.isDirectory()) countFiles(path.join(dir, e.name));
          else fileCount++;
        }
      };
      countFiles(destDir);
      
      zipsMeta.push({
        id,
        name: nameWithoutExt,
        fileCount,
        createdAt: new Date().toISOString()
      });
      writeJSON(META_FILE, zipsMeta);
      
      console.log(`   Registered ${fileCount} files.`);
      
      // Rename to mark as processed
      fs.renameSync(zipPath, zipPath + ".processed");
      console.log(`   Marked as processed.`);
      
    } catch (err: any) {
      console.error(`   ❌ Failed to extract ${file}:`, err.message);
    }
  }
}

console.log("\n✅ All local zips synced to Vault!");
