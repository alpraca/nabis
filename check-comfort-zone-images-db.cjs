const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function checkImages() {
  console.log('\n🔍 CHECKING COMFORT ZONE IMAGES IN DATABASE\n');
  
  // Get sample products with their images
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, pi.image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      ORDER BY p.id
      LIMIT 10
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('📦 Sample Comfort Zone products:\n');
  products.forEach(p => {
    console.log(`   ${p.id}: ${p.name.substring(0, 50)}`);
    console.log(`      → ${p.image_url}\n`);
  });
  
  // Check for unique images
  const uniqueImages = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT pi.image_url, COUNT(*) as count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      GROUP BY pi.image_url
      ORDER BY count DESC
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('📊 Unique images used:\n');
  uniqueImages.forEach(img => {
    console.log(`   ${img.image_url} (used by ${img.count} products)`);
  });
  
  db.close();
}

checkImages();
