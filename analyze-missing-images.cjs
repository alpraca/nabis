const sqlite3 = require('sqlite3').verbose();

const dbPath = './server/database.sqlite';
const db = new sqlite3.Database(dbPath);

// Get products without images
function getProductsWithoutImages() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.id, p.name, p.brand, p.created_at 
       FROM products p 
       LEFT JOIN product_images pi ON p.id = pi.product_id 
       WHERE pi.id IS NULL
       ORDER BY p.created_at DESC`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

async function analyzeProductsWithoutImages() {
  console.log('🔍 Analyzing products without images\n');

  const productsWithoutImages = await getProductsWithoutImages();
  
  console.log(`📦 Total products without images: ${productsWithoutImages.length}\n`);
  
  // Group by brand
  const byBrand = {};
  productsWithoutImages.forEach(product => {
    const brand = product.brand || 'N/A';
    if (!byBrand[brand]) {
      byBrand[brand] = [];
    }
    byBrand[brand].push(product);
  });

  console.log('📊 Breakdown by Brand:\n');
  Object.keys(byBrand).sort().forEach(brand => {
    console.log(`   ${brand}: ${byBrand[brand].length} products`);
  });

  console.log('\n📋 All products without images:\n');
  productsWithoutImages.forEach((product, index) => {
    const date = new Date(product.created_at).toLocaleDateString();
    console.log(`${index + 1}. [${date}] ${product.brand || 'N/A'} - ${product.name}`);
  });

  db.close();
}

analyzeProductsWithoutImages().catch(console.error);
