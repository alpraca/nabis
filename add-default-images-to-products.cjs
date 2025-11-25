const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🖼️  Adding Default Images for Products Without Images...\n');

// Find all products without images
db.all(`
  SELECT p.id, p.name, p.brand
  FROM products p
  LEFT JOIN product_images pi ON p.id = pi.product_id
  WHERE pi.id IS NULL
`, (err, productsWithoutImages) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  if (productsWithoutImages.length === 0) {
    console.log('✅ All products already have images!');
    db.close();
    return;
  }

  console.log(`Found ${productsWithoutImages.length} products without images`);
  console.log('Adding placeholder images...\n');

  let completed = 0;
  let errors = 0;

  productsWithoutImages.forEach((product) => {
    // Use a placeholder image - you can change this to a real default image path
    const placeholderImage = '/uploads/images/placeholder.jpg';
    
    db.run(
      `INSERT INTO product_images (product_id, image_url, is_primary, sort_order, created_at)
       VALUES (?, ?, 1, 0, datetime('now'))`,
      [product.id, placeholderImage],
      (err) => {
        if (err) {
          console.error(`❌ Error adding image for ${product.name}:`, err.message);
          errors++;
        } else {
          completed++;
          if (completed % 50 === 0) {
            console.log(`   ✓ Processed ${completed}/${productsWithoutImages.length} products...`);
          }
        }

        // Check if all are done
        if (completed + errors === productsWithoutImages.length) {
          console.log('\n' + '='.repeat(60));
          console.log('📊 SUMMARY');
          console.log('='.repeat(60));
          console.log(`✅ Images added: ${completed}`);
          console.log(`❌ Errors: ${errors}`);
          console.log(`📦 Total processed: ${productsWithoutImages.length}`);
          
          // Verify
          db.all(`
            SELECT COUNT(*) as count
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE pi.id IS NULL
          `, (err, result) => {
            if (!err && result[0]) {
              console.log(`\n🔍 Products still without images: ${result[0].count}`);
            }
            db.close();
          });
        }
      }
    );
  });
});
