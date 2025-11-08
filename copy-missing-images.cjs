const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const uploadsImagesDir = path.join(__dirname, 'server', 'uploads', 'images');
const sourceImagesDir = path.join(__dirname, 'product_images');

if (!fs.existsSync(uploadsImagesDir)) {
  fs.mkdirSync(uploadsImagesDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function findSourceFile(filename) {
  const candidate = path.join(sourceImagesDir, filename);
  if (fs.existsSync(candidate)) return candidate;
  // try case-insensitive search in sourceImagesDir
  const files = fs.readdirSync(sourceImagesDir);
  const lower = filename.toLowerCase();
  const found = files.find(f => f.toLowerCase() === lower);
  if (found) return path.join(sourceImagesDir, found);
  // fallback: try replacing special characters (normalize)
  const normalized = filename.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const found2 = files.find(f => f.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase() === normalized);
  if (found2) return path.join(sourceImagesDir, found2);
  return null;
}

db.all("SELECT DISTINCT image_url FROM product_images WHERE image_url LIKE '/uploads/images/%'", (err, rows) => {
  if (err) {
    console.error('DB error:', err);
    process.exit(1);
  }

  let copied = 0;
  let missing = [];

  rows.forEach(r => {
    const imageUrl = r.image_url;
    const filename = path.basename(imageUrl);
    const destPath = path.join(uploadsImagesDir, filename);
    if (fs.existsSync(destPath)) return; // already copied

    const src = findSourceFile(filename);
    if (src) {
      try {
        fs.copyFileSync(src, destPath);
        copied++;
      } catch (e) {
        console.error('Failed to copy', src, '->', destPath, e.message);
        missing.push(filename);
      }
    } else {
      missing.push(filename);
    }
  });

  console.log('Copy complete. Copied:', copied, 'Missing:', missing.length);
  if (missing.length) console.log('Missing files (sample 50):', missing.slice(0,50));
  db.close();
});
