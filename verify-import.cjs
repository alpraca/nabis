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
  if (err) return console.error('DB open error:', err.message);
});

const sample = data.slice(0, 30); // first 30 rows to inspect

(async () => {
  console.log('Comparing first', sample.length, 'Excel rows to DB by product name');

  for (const row of sample) {
    const name = row.Name || row.name || row['Product Name'] || row['product_name'] || row.Title || row.title;
    const excelBrand = row.Brand || row.brand || row.Manufacturer || row.manufacturer || '';
    const excelPrice = row.Price || row.price || row.Cost || row.cost || '';
    const excelImage = row.Image_File || row.Image || row.image || '';

    if (!name) {
      console.log('\n--- Excel row missing a name key, raw row keys:');
      console.log(Object.keys(row));
      continue;
    }

    const dbRow = await new Promise((resolve) => {
      db.get('SELECT id, name, brand, price FROM products WHERE name = ?', [name], (err, r) => {
        if (err) return resolve(null);
        resolve(r);
      });
    });

    const images = await new Promise((resolve) => {
      if (!dbRow) return resolve([]);
      db.all('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order', [dbRow.id], (err, rows) => {
        if (err) return resolve([]);
        resolve(rows.map(r => r.image_url));
      });
    });

    console.log('\nProduct:', name);
    console.log(' - Excel brand:', excelBrand || '<empty>');
    console.log(' - DB brand  :', dbRow ? (dbRow.brand || '<empty>') : '<not found>');
    console.log(' - Excel price:', excelPrice || '<empty>');
    console.log(' - DB price  :', dbRow ? (dbRow.price != null ? dbRow.price : '<empty>') : '<not found>');
    console.log(' - Excel image:', excelImage || '<empty>');
    console.log(' - DB images  :', images.length ? images.join(', ') : '<none>');
  }

  db.close();
})();
