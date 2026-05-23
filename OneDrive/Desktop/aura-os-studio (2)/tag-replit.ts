import fs from "fs";
import path from "path";

const META_FILE = path.join(process.cwd(), "data", "zips_meta.json");
const ZIPS_DIR = path.join(process.cwd(), "data", "zips");

if (!fs.existsSync(META_FILE)) {
  console.log("No meta file found.");
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(META_FILE, "utf-8"));

let updated = 0;

function hasReplitMarkers(dirPath: string, depth = 0): boolean {
  if (depth > 2) return false;
  if (!fs.existsSync(dirPath)) return false;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".replit" || entry.name === "attached_assets" || entry.name === "artifacts") {
      return true;
    }
    if (entry.isDirectory() && entry.name !== "node_modules" && !entry.name.startsWith(".")) {
      if (hasReplitMarkers(path.join(dirPath, entry.name), depth + 1)) {
        return true;
      }
    }
  }
  return false;
}

for (const zip of meta) {
  const dirPath = path.join(ZIPS_DIR, zip.id);
  const isReplit = hasReplitMarkers(dirPath);
  
  if (isReplit) {
    zip.provider = "replit";
  } else {
    zip.provider = "google";
  }
  updated++;
}

fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
console.log(`Successfully tagged ${updated} zips with provider.`);
