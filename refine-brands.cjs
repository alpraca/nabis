const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname,'server','database.sqlite');
const db = new sqlite3.Database(dbPath);

function inferBrandFromName(name) {
  if (!name) return null;
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return null;
  const first = words[0].replace(/[^\p{L}0-9\-]/gu, '');
  if (first.length <= 2 && words.length >= 2) {
    const second = words[1].replace(/[^\p{L}0-9\-]/gu, '');
    return (first + ' ' + second).trim();
  }
  return first;
}

let updated = 0;
db.each("SELECT id, name, brand FROM products WHERE brand IS NOT NULL", async (err, row) => {
  if (err) return;
  const b = row.brand;
  if (b && b.length <= 2) {
    const inferred = inferBrandFromName(row.name);
    if (inferred && inferred !== b) {
      db.run('UPDATE products SET brand = ? WHERE id = ?', [inferred, row.id], function(e) {
        if (!e) updated++;
      });
    }
  }
}, (err, n) => {
  setTimeout(()=>{
    console.log('Refine done. Updated brands:', updated);
    db.close();
  }, 500);
});
