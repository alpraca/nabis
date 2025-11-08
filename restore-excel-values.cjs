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

function addColumnIfNotExists(columnName) {
  return new Promise((resolve, reject) => {
    db.get("PRAGMA table_info(products)", (err, row) => {
      // We'll attempt to add column; if it errors because column exists, ignore
      db.run(`ALTER TABLE products ADD COLUMN ${columnName} TEXT`, (e) => {
        if (e) {
          // If error indicates duplicate column, ignore
          if (e.message && e.message.includes('duplicate column name')) {
            return resolve(false);
          }
          return reject(e);
        }
        resolve(true);
      });
    });
  });
}

(async () => {
  try {
    console.log('Adding columns price_raw and brand_raw if missing...');
    await addColumnIfNotExists('price_raw');
    await addColumnIfNotExists('brand_raw');

    console.log('Updating products from Excel...');
    let updated = 0;
    for (const row of data) {
      const name = row.Name || row.name;
      if (!name) continue;
      const priceRaw = row.Price != null ? String(row.Price).trim() : null;
      const brandRaw = row.Brand != null ? String(row.Brand).trim() : null;

      await new Promise((resolve) => {
        db.run(`UPDATE products SET price_raw = ?, brand_raw = ? WHERE name = ?`, [priceRaw, brandRaw, name], function(err) {
          if (!err && this.changes > 0) updated++;
          resolve();
        });
      });
    }

    console.log('Done. Updated products with price_raw/brand_raw:', updated);

    // Print sample verification for first 30 rows by Name
    console.log('\nSample verification (first 30):');
    const sample = data.slice(0,30);
    for (const r of sample) {
      const name = r.Name;
      await new Promise((resolve) => {
        db.get(`SELECT name, price, price_raw, brand, brand_raw FROM products WHERE name = ?`, [name], (err, prod) => {
          if (!err && prod) {
            console.log('\nProduct:', prod.name);
            console.log(' - price (numeric):', prod.price);
            console.log(' - price_raw (excel):', prod.price_raw);
            console.log(' - brand (db):', prod.brand);
            console.log(' - brand_raw (excel):', prod.brand_raw || '<empty>');
          } else {
            console.log('\nProduct not found in DB for name:', name);
          }
          resolve();
        });
      });
    }

    db.close();
  } catch (err) {
    console.error('Migration failed:', err);
    db.close();
    process.exit(1);
  }
})();
