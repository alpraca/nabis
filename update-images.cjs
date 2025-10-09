/**
 * Update products with image URLs
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const excelFile = path.join(__dirname, 'farmaon_products.xlsx');
const imagesFolder = path.join(__dirname, 'product_images');

console.log('🖼️  Updating products with image URLs...');

const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

const db = new sqlite3.Database(dbPath);

let updated = 0;
let notFound = 0;

const stmt = db.prepare('UPDATE products SET image_url = ? WHERE name = ?');

data.forEach((row, index) => {
  if (row.Image_File) {
    const imagePath = path.join(imagesFolder, row.Image_File);
    if (fs.existsSync(imagePath)) {
      // Store relative path for web serving
      const imageUrl = `/uploads/images/${row.Image_File}`;
      stmt.run([imageUrl, row.Name], function(err) {
        if (err) {
          console.error(`❌ Failed to update ${row.Name}:`, err.message);
        } else if (this.changes > 0) {
          updated++;
          if (updated <= 5) {
            console.log(`✅ ${row.Name} -> ${imageUrl}`);
          }
        }
      });
    } else {
      notFound++;
      if (notFound <= 5) {
        console.log(`⚠️  Image not found: ${row.Image_File}`);
      }
    }
  }
  
  // Show progress
  if ((index + 1) % 200 === 0) {
    console.log(`📊 Processed ${index + 1}/${data.length} products...`);
  }
});

stmt.finalize();

setTimeout(() => {
  db.get('SELECT COUNT(*) as total, COUNT(image_url) as with_images FROM products', (err, row) => {
    console.log('\n📊 IMAGE UPDATE SUMMARY');
    console.log('=======================');
    console.log(`✅ Products updated with images: ${updated}`);
    console.log(`⚠️  Images not found: ${notFound}`);
    console.log(`📦 Total products: ${row.total}`);
    console.log(`🖼️  Products with images: ${row.with_images}`);
    
    db.close();
  });
}, 2000);