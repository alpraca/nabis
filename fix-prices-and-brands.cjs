const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');

if (!fs.existsSync(excelFile)) {
  console.error('Excel file not found:', excelFile);
  process.exit(1);
}

const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB open error:', err.message);
    process.exit(1);
  }
});

function parsePriceRaw(raw) {
  if (raw === undefined || raw === null) return null;
  let s = String(raw).trim();
  // Remove currency letters at end (like 'L')
  s = s.replace(/[A-Za-z]+$/g, '').trim();
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    // Determine which is decimal by position: last separator is decimal
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastDot > lastComma) {
      // dot is decimal, remove commas (thousands)
      s = s.replace(/,/g, '');
    } else {
      // comma is decimal, remove dots and convert comma to dot
      s = s.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (hasComma && !hasDot) {
    // treat comma as decimal
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else {
    // only dot or no separator - remove commas
    s = s.replace(/,/g, '');
  }

  // Remove any characters except digits and dot
  s = s.replace(/[^0-9.\-]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.round(n * 100) / 100;
}

function inferBrandFromName(name) {
  if (!name) return null;
  // pick first token of the name, remove non-letter chars from ends
  const m = name.trim().match(/^([\p{L}0-9&\-]+)\b/u);
  if (m && m[1]) {
    // Normalize casing: capitalize first letter
    const b = m[1].replace(/[_\-]+/g, ' ');
    return b.charAt(0).toUpperCase() + b.slice(1);
  }
  return null;
}

let updatedCount = 0;
let skipped = 0;

(async () => {
  for (const row of data) {
    const name = row.Name || row.name || row['Product Name'] || row.Title || row.title;
    if (!name) {
      skipped++;
      continue;
    }
    const excelBrand = row.Brand || row.brand || '';
    const excelPriceRaw = row.Price || row.price || row.Cost || row.cost;
    const parsedPrice = parsePriceRaw(excelPriceRaw);
    const inferredBrand = excelBrand && excelBrand.toString().trim() ? excelBrand.toString().trim() : inferBrandFromName(name);

    // Update DB if product exists
    await new Promise((resolve) => {
      db.get('SELECT id, name, brand, price FROM products WHERE name = ?', [name], (err, prod) => {
        if (err || !prod) return resolve();

        const updates = [];
        const params = [];
        if (parsedPrice != null && Number(prod.price) !== Number(parsedPrice)) {
          updates.push('price = ?');
          params.push(parsedPrice);
        }
        if (inferredBrand && (!prod.brand || prod.brand === 'Unknown')) {
          updates.push('brand = ?');
          params.push(inferredBrand);
        }

        if (updates.length === 0) return resolve();

        params.push(prod.id);
        const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
        db.run(sql, params, function(err2) {
          if (err2) {
            console.error('Failed to update', name, err2.message);
          } else {
            updatedCount++;
          }
          resolve();
        });
      });
    });
  }

  console.log('\nDone. Updated rows:', updatedCount, 'Skipped rows without name:', skipped);
  db.close();
})();
