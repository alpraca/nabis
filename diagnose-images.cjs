const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const uploadsDir = path.join(__dirname, 'server', 'uploads');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get('SELECT COUNT(*) as c FROM products', (err, r) => {
    console.log('Total products:', r ? r.c : 'N/A');
  });

  db.get('SELECT COUNT(DISTINCT p.id) as c FROM products p JOIN product_images pi ON p.id = pi.product_id', (err, r) => {
    console.log('Products with >=1 image (via join):', r ? r.c : 'N/A');
  });

  db.get('SELECT COUNT(*) as c FROM product_images', (err, r) => {
    console.log('Total product_images rows:', r ? r.c : 'N/A');
  });

  db.all('SELECT p.id, p.name, pi.image_url FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1 LIMIT 20', (err, rows) => {
    if (err) return console.error(err);
    console.log('\nSample products with primary image:');
    rows.forEach(row => {
      const imagePath = row.image_url ? path.join(__dirname, row.image_url) : null;
      const exists = imagePath ? fs.existsSync(imagePath) : false;
      console.log(`- [${row.id}] ${row.name}`);
      console.log(`   image_url: ${row.image_url || '<none>'}`);
      console.log(`   file exists: ${exists} ${exists ? '-> '+imagePath : ''}`);
    });

    // Also list products that have no images
    db.all('SELECT id, name FROM products WHERE id NOT IN (SELECT DISTINCT product_id FROM product_images) LIMIT 20', (err2, missing) => {
      if (err2) return console.error(err2);
      console.log('\nProducts missing images (sample):', missing.length);
      missing.forEach(m => console.log(`- [${m.id}] ${m.name}`));
      db.close();
    });
  });
});
