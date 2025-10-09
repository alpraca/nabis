const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

console.log('🔧 Adding default images for products without images...');

// First, ensure we have a default product image
const imagesDir = './product_images';
const defaultImageName = 'default-product.jpg';
const defaultImagePath = path.join(imagesDir, defaultImageName);

// Create default image if it doesn't exist
if (!fs.existsSync(defaultImagePath)) {
  console.log('📷 Creating default product image...');
  // Get the first available image to use as template
  const availableImages = fs.readdirSync(imagesDir).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
  );
  
  if (availableImages.length > 0) {
    const sourceImage = path.join(imagesDir, availableImages[0]);
    fs.copyFileSync(sourceImage, defaultImagePath);
    console.log(`✅ Default image created using ${availableImages[0]} as template`);
  }
}

// Get products without images
db.all(`
  SELECT p.id, p.name, p.brand 
  FROM products p 
  LEFT JOIN product_images pi ON p.id = pi.product_id 
  WHERE pi.product_id IS NULL
`, (err, products) => {
  if (err) {
    console.error('Error fetching products:', err);
    db.close();
    return;
  }

  console.log(`🔍 Found ${products.length} products without images`);
  
  if (products.length === 0) {
    console.log('✅ All products already have images!');
    db.close();
    return;
  }
  
  let processed = 0;
  
  // Add default image for each product without images
  products.forEach(product => {
    db.run(`
      INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
      VALUES (?, ?, 1, 1)
    `, [product.id, defaultImageName], function(insertErr) {
      processed++;
      
      if (insertErr) {
        console.error(`❌ Error adding image for ${product.brand} - ${product.name}:`, insertErr.message);
      } else {
        console.log(`✅ Added default image for: ${product.brand} - ${product.name}`);
      }
      
      // When all products are processed
      if (processed === products.length) {
        console.log(`\n📊 Summary: Added default images for ${products.length} products`);
        
        // Verify the results
        db.get(`
          SELECT COUNT(*) as missing 
          FROM products p 
          LEFT JOIN product_images pi ON p.id = pi.product_id 
          WHERE pi.product_id IS NULL
        `, (err, result) => {
          if (!err) {
            console.log(`✅ Products still missing images: ${result.missing}`);
          }
          db.close();
        });
      }
    });
  });
});