const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

// Mapping of image names to keywords/phrases in product names
// These are the 22 real images we downloaded
const IMAGE_MAPPINGS = [
  { image: 'comfort-zone-sublime-skin-neck-fluid.jpg', keywords: ['neck', 'décolleté', 'decollete'], priority: 10 },
  { image: 'comfort-zone-sun-soul-milk-spray.jpg', keywords: ['milk spray'], priority: 10 },
  { image: 'comfort-zone-sun-soul-shower-gel.jpg', keywords: ['2in1', 'shower gel'], priority: 9 },
  { image: 'comfort-zone-sun-soul-after-sun.jpg', keywords: ['after sun', 'aftersun', 'after-sun'], priority: 9 },
  { image: 'comfort-zone-sun-soul-face-cream-spf30.jpg', keywords: ['face cream spf30', 'face cream spf 30'], priority: 10 },
  { image: 'comfort-zone-sun-soul-cream-spf50.jpg', keywords: ['sun soul cream spf50', 'sun soul cream spf 50'], priority: 10 },
  { image: 'comfort-zone-sun-soul-cream-spf30.jpg', keywords: ['sun soul cream spf 30', 'sun soul cream spf30'], priority: 10 },
  { image: 'comfort-zone-renight-ampoules.jpg', keywords: ['renight'], priority: 8 },
  { image: 'comfort-zone-tranquillity-shower.jpg', keywords: ['tranquillity shower', 'tranquillity bath'], priority: 9 },
  { image: 'comfort-zone-tranquillity-lotion.jpg', keywords: ['tranquillity lotion', 'tranquillity body lotion'], priority: 10 },
  { image: 'comfort-zone-tranquillity-cream.jpg', keywords: ['tranquillity cream', 'tranquillity body cream'], priority: 10 },
  { image: 'comfort-zone-hydramemory-ampoules.jpg', keywords: ['hydramemory'], priority: 7 },
  { image: 'comfort-zone-sublime-skin-lotion.jpg', keywords: ['sublime skin lotion', 'sublime skin micropeel', 'sublime skin toner', 'sublime skin bb', 'sublime skin primer', 'sublime skin day cream'], priority: 8 },
  { image: 'comfort-zone-sublime-skin-mask.jpg', keywords: ['sublime skin mask', 'sublime skin lift'], priority: 9 },
  { image: 'comfort-zone-sublime-skin-peel-pads.jpg', keywords: ['sublime skin peel', 'sublime skin pad'], priority: 9 },
  { image: 'comfort-zone-sublime-skin-eye-patch.jpg', keywords: ['sublime skin eye patch'], priority: 10 },
  { image: 'comfort-zone-sublime-skin-eye-cream.jpg', keywords: ['sublime skin eye'], priority: 8 },
  { image: 'comfort-zone-sublime-skin-serum.jpg', keywords: ['sublime skin serum', 'sublime skin intensive'], priority: 9 },
  { image: 'comfort-zone-sublime-skin-fluid-cream.jpg', keywords: ['sublime skin fluid', 'sublime skin leggero'], priority: 9 },
  { image: 'comfort-zone-hand-oil.jpg', keywords: ['hand oil', 'specialist hand'], priority: 10 },
  { image: 'comfort-zone-makeup-remover.jpg', keywords: ['makeup remover', 'make-up'], priority: 9 },
  { image: 'comfort-zone-remedy-serum.jpg', keywords: ['remedy serum'], priority: 10 }
];

async function matchImages() {
  console.log('\n🎯 MATCHING COMFORT ZONE IMAGES TO PRODUCTS\n');
  
  // Get all Comfort Zone products
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name
      FROM products
      WHERE brand = 'Comfort Zone'
      ORDER BY id
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${products.length} Comfort Zone products\n`);
  console.log('🔄 Matching images based on product names...\n');
  
  let matched = 0;
  let unmatched = 0;
  const defaultImage = '/images/products/comfort-zone-sublime-skin-fluid-cream.jpg'; // Use a nice default
  
  for (const product of products) {
    const productNameLower = product.name.toLowerCase();
    
    // Find best matching image
    let bestImage = null;
    let maxMatches = 0;
    
    for (const mapping of IMAGE_MAPPINGS) {
      const keywordMatches = mapping.keywords.filter(keyword => 
        productNameLower.includes(keyword.toLowerCase())
      ).length;
      
      if (keywordMatches > maxMatches) {
        maxMatches = keywordMatches;
        bestImage = mapping.image;
      }
    }
    
    const finalImage = bestImage ? `/images/products/${bestImage}` : defaultImage;
    
    // Update image
    await new Promise((resolve) => {
      db.run(`DELETE FROM product_images WHERE product_id = ?`, [product.id], () => resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, 1, 0)
      `, [product.id, finalImage], (err) => {
        if (err) {
          console.error(`   ❌ ${product.name}`);
          reject(err);
        } else {
          if (bestImage) {
            matched++;
            console.log(`   ✅ ${product.name.substring(14, 50)}... → ${bestImage}`);
          } else {
            unmatched++;
            console.log(`   ⚠️  ${product.name.substring(14, 50)}... → default`);
          }
          resolve();
        }
      });
    });
  }
  
  console.log(`\n========== ✅ COMPLETE ==========\n`);
  console.log(`   • Matched products: ${matched}`);
  console.log(`   • Unmatched (using default): ${unmatched}`);
  console.log(`   • Total: ${products.length}`);
  console.log(`\n🌐 Refresh http://localhost:5174 to see correctly matched images!\n`);
  
  db.close();
}

matchImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
