const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.env.USERPROFILE, '.aura_os_data');
const metaPath = path.join(dataDir, 'zips_meta.json');
const zipsDir = path.join(dataDir, 'zips');

let zips = [];
try {
  zips = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
} catch(e) {
  console.log('No zips_meta.json found');
  process.exit(1);
}

const cleaned = [];
const seenNames = new Set();

// Sort by fileCount descending so we keep the duplicate with the most files
zips.sort((a, b) => b.fileCount - a.fileCount);

for (const zip of zips) {
  // Normalize name to remove (1), (2) etc.
  const baseName = zip.name.replace(/\s\(\d+\)$/, '').trim();
  
  if (seenNames.has(baseName.toLowerCase())) {
    console.log('Removing duplicate:', zip.name);
    continue;
  }

  // Always keep if physical folder exists
  const folderPath = path.join(zipsDir, zip.id);
  const exists = fs.existsSync(folderPath);

  // Keep rule: exists OR > 100 files OR name includes joseph-bouchrd
  if (exists || zip.fileCount > 100 || zip.name.includes('joseph-bouchrd-')) {
    cleaned.push(zip);
    seenNames.add(baseName.toLowerCase());
    console.log('Keeping:', zip.name, '(', zip.fileCount, 'files)');
  } else {
    console.log('Removing ghost < 100 files:', zip.name);
  }
}

fs.writeFileSync(metaPath, JSON.stringify(cleaned, null, 2));
console.log('Done! Cleaned array length:', cleaned.length);
