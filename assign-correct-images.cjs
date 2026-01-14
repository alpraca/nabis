const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function assignCorrectImages() {
  console.log('\n✅ ASSIGNING CORRECT IMAGES\n');
  
  // Map of actual image files to their products
  const imageMap = [
    { image: 'nutriva-epaval-fegato.jpg', brand: 'Nutriva', keywords: ['epaval', 'fegato'] },
    { image: 'nutriva-omega-3-tg.jpg', brand: 'Nutriva', keywords: ['omega', '3', 'tg'] },
    { image: 'pharmasept-derma-balance-cleansing-gel.jpg', brand: 'Pharmasept', keywords: ['derma', 'balance', 'cleansing', 'gel'] },
    { image: 'pharmasept-hygienic-cleansing-scrub.jpg', brand: 'Pharmasept', keywords: ['hygienic', 'cleansing', 'scrub'] },
    { image: 'selfskn-acqua-pura-8211-cleansing-foam.jpg', brand: 'SelfSKN', keywords: ['acqua', 'pura', 'cleansing', 'foam'] }
  ];
  
  let assigned = 0;
  
  for (const mapping of imageMap) {
    // Find matching product
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, brand
        FROM products
        WHERE brand LIKE ?
        ORDER BY name
      `, [`%${mapping.brand}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (products.length === 0) {
      console.log(`⚠️  No products found for brand: ${mapping.brand}`);
      continue;
    }
    
    // Find best matching product
    let bestMatch = null;
    let maxScore = 0;
    
    for (const product of products) {
      const productNameLower = product.name.toLowerCase();
      const score = mapping.keywords.filter(keyword => 
        productNameLower.includes(keyword.toLowerCase())
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = product;
      }
    }
    
    if (bestMatch && maxScore > 0) {
      // Assign image
      await new Promise((resolve) => {
        db.run(`DELETE FROM product_images WHERE product_id = ?`, [bestMatch.id], () => resolve());
      });
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, 1, 0)
        `, [bestMatch.id, `/images/products/${mapping.image}`], (err) => {
          if (err) {
            console.log(`   ❌ ${mapping.brand} - ${mapping.image}`);
            reject(err);
          } else {
            assigned++;
            console.log(`   ✅ ${mapping.brand.padEnd(15)} - ${bestMatch.name.substring(0, 50)} → ${mapping.image}`);
            resolve();
          }
        });
      });
    } else {
      console.log(`   ⚠️  ${mapping.brand} - ${mapping.image} - No matching product found`);
    }
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Assigned: ${assigned} images`);
  console.log(`   • Total available: ${imageMap.length}`);
  console.log(`\n🌐 Refresh your browser!\n`);
  
  db.close();
}

assignCorrectImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
