const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function checkProductImages() {
  console.log('\n🔍 CHECKING PRODUCT IMAGES WITH sort_order = 1\n');
  
  // Get sample products with their primary images (sort_order = 1 or 0)
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name, p.brand, pi.image_url, pi.sort_order, pi.is_primary
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      ORDER BY p.id
      LIMIT 10
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('📦 Sample Comfort Zone products with images:\n');
  products.forEach(p => {
    console.log(`   ${p.id}: ${p.name.substring(0, 50)}`);
    console.log(`      Image: ${p.image_url || 'NONE'}`);
    console.log(`      sort_order: ${p.sort_order}, is_primary: ${p.is_primary}\n`);
  });
  
  // Check sort_order distribution
  const sortOrders = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT sort_order, COUNT(*) as count
      FROM product_images
      GROUP BY sort_order
      ORDER BY sort_order
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('📊 sort_order distribution in product_images:\n');
  sortOrders.forEach(row => {
    console.log(`   sort_order ${row.sort_order}: ${row.count} images`);
  });
  
  db.close();
}

checkProductImages();
