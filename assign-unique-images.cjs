const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./server/database.sqlite');
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'products');

async function assignIndividualImages() {
  console.log('\n🖼️  ASSIGNING INDIVIDUAL IMAGES TO ALL PRODUCTS\n');
  
  // Get all existing Comfort Zone image files
  const allImageFiles = fs.readdirSync(IMAGE_DIR)
    .filter(f => f.startsWith('comfort-zone-') && f.endsWith('.jpg'))
    .sort();
  
  console.log(`📸 Found ${allImageFiles.length} Comfort Zone images\n`);
  
  // Get all products
  const products = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.name
      FROM products p
      WHERE p.brand = 'Comfort Zone'
      ORDER BY p.id
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📦 Found ${products.length} Comfort Zone products\n`);
  console.log('🔄 Assigning unique images...\n');
  
  let updated = 0;
  let assigned = 0;
  
  for (const product of products) {
    const cleanName = product.name.replace('Comfort Zone ', '').trim();
    const sanitizedName = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Try to find an exact match with product ID
    let imageFile = allImageFiles.find(f => 
      f.includes(`-${product.id}.jpg`)
    );
    
    // If not found, try to match by name similarity
    if (!imageFile) {
      imageFile = allImageFiles.find(f => {
        const fileNamePart = f
          .replace('comfort-zone-', '')
          .replace(/-\d+\.jpg$/, '')
          .replace(/-/g, '');
        const productNamePart = sanitizedName.replace(/-/g, '');
        
        return fileNamePart === productNamePart ||
               fileNamePart.includes(productNamePart) ||
               productNamePart.includes(fileNamePart);
      });
    }
    
    // If still not found, assign the next unused image in order
    if (!imageFile && assigned < allImageFiles.length) {
      imageFile = allImageFiles[assigned];
      assigned++;
    }
    
    if (imageFile) {
      const imagePath = `/images/products/${imageFile}`;
      
      // Update database
      await new Promise((resolve) => {
        db.run(`DELETE FROM product_images WHERE product_id = ?`, [product.id], () => resolve());
      });
      
      await new Promise((resolve) => {
        db.run(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, 1, 0)
        `, [product.id, imagePath], () => {
          updated++;
          resolve();
        });
      });
      
      if (updated % 20 === 0) {
        console.log(`   ✅ Assigned ${updated} images...`);
      }
    }
  }
  
  console.log(`\n✅ Assigned ${updated} unique images to products\n`);
  
  // Verify uniqueness
  const uniqueCheck = await new Promise((resolve, reject) => {
    db.all(`
      SELECT pi.image_url, COUNT(*) as count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.brand = 'Comfort Zone'
      GROUP BY pi.image_url
      HAVING count > 1
      ORDER BY count DESC
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  if (uniqueCheck.length === 0) {
    console.log('🎉 SUCCESS! All products now have unique images!\n');
  } else {
    console.log(`⚠️  ${uniqueCheck.length} images are still shared:\n`);
    uniqueCheck.slice(0, 5).forEach(row => {
      console.log(`   ${row.image_url.split('/').pop()}: ${row.count} products`);
    });
  }
  
  console.log(`\n🌐 Refresh http://localhost:5173 to see all unique product images!\n`);
  
  db.close();
}

assignIndividualImages().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
