/*
 Add images to product_images table using mapping from farmaon_products.xlsx
*/

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');
const imagesFolder = path.join(__dirname, 'product_images');

console.log('🖼️  Inserting images for products from Excel...');

if (!fs.existsSync(excelFile)) {
  console.error('❌ Excel file not found:', excelFile);
  process.exit(1);
}

const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ DB open error:', err.message);
    process.exit(1);
  }
});

let inserted = 0;
let notFound = 0;

const insertStmt = db.prepare('INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 1)');

(async () => {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row.Name) continue;
    const imgFile = row.Image_File || row.Image || row.image || null;
    if (!imgFile) continue;

    const imgPath = path.join(imagesFolder, imgFile);
    if (!fs.existsSync(imgPath)) {
      notFound++;
      if (notFound <= 5) console.warn('⚠️ Image not found on disk:', imgFile);
      continue;
    }

    // Find product by name
    const productName = row.Name;
    const product = await new Promise((resolve) => {
      db.get('SELECT id FROM products WHERE name = ?', [productName], (err, r) => {
        if (err) return resolve(null);
        resolve(r);
      });
    });

    if (!product) {
      notFound++;
      if (notFound <= 5) console.warn('⚠️ Product not found in DB for:', productName);
      continue;
    }

    const imageUrl = `/uploads/images/${imgFile}`;

    // Remove existing primary image for product (set is_primary=0) to avoid duplicates
    await new Promise((resolve) => {
      db.run('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [product.id], (err) => resolve());
    });

    await new Promise((resolve, reject) => {
      insertStmt.run([product.id, imageUrl], function(err) {
        if (err) {
          console.error('❌ Failed to insert image for', productName, err.message);
          return reject(err);
        }
        inserted++;
        resolve();
      });
    });
  }

  insertStmt.finalize();

  console.log('\n📊 IMAGE INSERT SUMMARY');
  console.log('======================');
  console.log('✅ Inserted images:', inserted);
  console.log('⚠️  Missing items (products or files):', notFound);

  // Verify count
  db.get('SELECT COUNT(*) as total FROM product_images', (err, row) => {
    console.log('📁 Total images in DB:', row ? row.total : 0);
    db.close();
    process.exit(0);
  });
})();
