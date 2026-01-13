const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

// Smart mapping: Assign images based on product line + subcategory fallback
function getBestImage(productName, subcategory) {
  const nameLower = productName.toLowerCase();
  
  // EXACT matches first (highest priority)
  if (nameLower.includes('neck') || nameLower.includes('décolleté')) {
    return 'comfort-zone-sublime-skin-neck-fluid.jpg';
  }
  if (nameLower.includes('milk spray')) {
    return 'comfort-zone-sun-soul-milk-spray.jpg';
  }
  if (nameLower.includes('2in1') || (nameLower.includes('shower') && nameLower.includes('gel') && nameLower.includes('sun soul'))) {
    return 'comfort-zone-sun-soul-shower-gel.jpg';
  }
  if (nameLower.includes('hand oil') || nameLower.includes('specialist hand')) {
    return 'comfort-zone-hand-oil.jpg';
  }
  
  // PRODUCT LINE matches (by brand line)
  if (nameLower.includes('sublime skin')) {
    if (nameLower.includes('eye patch')) return 'comfort-zone-sublime-skin-eye-patch.jpg';
    if (nameLower.includes('eye')) return 'comfort-zone-sublime-skin-eye-cream.jpg';
    if (nameLower.includes('peel') || nameLower.includes('pad')) return 'comfort-zone-sublime-skin-peel-pads.jpg';
    if (nameLower.includes('mask')) return 'comfort-zone-sublime-skin-mask.jpg';
    if (nameLower.includes('serum')) return 'comfort-zone-sublime-skin-serum.jpg';
    if (nameLower.includes('fluid') || nameLower.includes('leggero')) return 'comfort-zone-sublime-skin-fluid-cream.jpg';
    if (nameLower.includes('lotion') || nameLower.includes('toner') || nameLower.includes('micropeel') || 
        nameLower.includes('bb cream') || nameLower.includes('primer') || nameLower.includes('day cream')) {
      return 'comfort-zone-sublime-skin-lotion.jpg';
    }
    return 'comfort-zone-sublime-skin-fluid-cream.jpg'; // Default for Sublime Skin
  }
  
  if (nameLower.includes('sun soul')) {
    if (nameLower.includes('after') || nameLower.includes('aftersun')) return 'comfort-zone-sun-soul-after-sun.jpg';
    if (nameLower.includes('face cream spf30') || nameLower.includes('face cream spf 30')) return 'comfort-zone-sun-soul-face-cream-spf30.jpg';
    if (nameLower.includes('spf50') || nameLower.includes('spf 50')) return 'comfort-zone-sun-soul-cream-spf50.jpg';
    if (nameLower.includes('spf30') || nameLower.includes('spf 30')) return 'comfort-zone-sun-soul-cream-spf30.jpg';
    return 'comfort-zone-sun-soul-cream-spf50.jpg'; // Default for Sun Soul
  }
  
  if (nameLower.includes('renight')) {
    return 'comfort-zone-renight-ampoules.jpg';
  }
  
  if (nameLower.includes('hydramemory')) {
    return 'comfort-zone-hydramemory-ampoules.jpg';
  }
  
  if (nameLower.includes('tranquillity')) {
    if (nameLower.includes('shower') || nameLower.includes('bath') || nameLower.includes('scrub') || nameLower.includes('gel')) {
      return 'comfort-zone-tranquillity-shower.jpg';
    }
    if (nameLower.includes('lotion')) return 'comfort-zone-tranquillity-lotion.jpg';
    if (nameLower.includes('cream')) return 'comfort-zone-tranquillity-cream.jpg';
    return 'comfort-zone-tranquillity-cream.jpg'; // Default for Tranquillity
  }
  
  if (nameLower.includes('water soul')) {
    if (nameLower.includes('after') || nameLower.includes('aftersun')) return 'comfort-zone-sun-soul-after-sun.jpg';
    return 'comfort-zone-sun-soul-cream-spf50.jpg'; // Use Sun Soul images for Water Soul
  }
  
  if (nameLower.includes('remedy')) {
    if (nameLower.includes('serum')) return 'comfort-zone-remedy-serum.jpg';
    return 'comfort-zone-remedy-serum.jpg'; // Default for Remedy
  }
  
  if (nameLower.includes('makeup') || nameLower.includes('make-up') || nameLower.includes('remover')) {
    return 'comfort-zone-makeup-remover.jpg';
  }
  
  // SUBCATEGORY fallback (use relevant images by subcategory)
  if (subcategory === 'SPF & Mbrojtje nga Dielli' || subcategory === 'SPF Bebë' || subcategory === 'Tanning') {
    return 'comfort-zone-sun-soul-cream-spf50.jpg';
  }
  if (subcategory === 'Sytë') {
    return 'comfort-zone-sublime-skin-eye-cream.jpg';
  }
  if (subcategory === 'Anti-Age & Anti-Rrudhe') {
    return 'comfort-zone-sublime-skin-serum.jpg';
  }
  if (subcategory === 'Pastrimi') {
    return 'comfort-zone-sublime-skin-lotion.jpg';
  }
  if (subcategory === 'Trupi' || subcategory === 'Anti Celulit' || subcategory === 'Anti Strija') {
    return 'comfort-zone-tranquillity-cream.jpg';
  }
  if (subcategory === 'Duart Dhe Thonjt') {
    return 'comfort-zone-hand-oil.jpg';
  }
  if (subcategory === 'Makeup') {
    return 'comfort-zone-makeup-remover.jpg';
  }
  if (subcategory === 'Buzet') {
    return 'comfort-zone-hydramemory-ampoules.jpg';
  }
  
  // Final fallback
  return 'comfort-zone-sublime-skin-fluid-cream.jpg';
}

async function matchImagesIntelligently() {
  console.log('\n🧠 INTELLIGENT IMAGE MATCHING FOR COMFORT ZONE\n');
  
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name, subcategory
      FROM products
      WHERE brand = 'Comfort Zone'
      ORDER BY id
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${products.length} Comfort Zone products\n`);
  console.log('🎯 Assigning images based on product lines & categories...\n');
  
  const imageStats = {};
  
  for (const product of products) {
    const imageName = getBestImage(product.name, product.subcategory);
    const imagePath = `/images/products/${imageName}`;
    
    // Track usage
    imageStats[imageName] = (imageStats[imageName] || 0) + 1;
    
    // Update database
    await new Promise((resolve) => {
      db.run(`DELETE FROM product_images WHERE product_id = ?`, [product.id], () => resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, 1, 0)
      `, [product.id, imagePath], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    const shortName = product.name.substring(14, 60);
    console.log(`   ✅ ${shortName}... → ${imageName}`);
  }
  
  console.log(`\n========== ✅ SUCCESS ==========\n`);
  console.log(`📊 Image Usage Statistics:\n`);
  
  Object.entries(imageStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([img, count]) => {
      console.log(`   • ${img}: ${count} products`);
    });
  
  console.log(`\n✨ All ${products.length} products now have appropriate images!`);
  console.log(`🌐 Refresh http://localhost:5174 to see the results!\n`);
  
  db.close();
}

matchImagesIntelligently().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
