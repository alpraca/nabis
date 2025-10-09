const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

console.log('🔧 Fixing products without images...');

// Get all available images
const imagesDir = './product_images';
const availableImages = fs.existsSync(imagesDir) ? 
  fs.readdirSync(imagesDir).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
  ) : [];

console.log(`📁 Found ${availableImages.length} images in product_images folder`);

// Create a function to match product name to image
function findImageForProduct(productName, brand) {
  const searchTerms = [
    `${brand}_${productName}`,
    productName,
    brand
  ].map(term => term
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
  );

  for (const term of searchTerms) {
    const matchingImage = availableImages.find(img => 
      img.toLowerCase().includes(term.toLowerCase()) ||
      term.toLowerCase().includes(img.replace(/\.[^/.]+$/, "").toLowerCase())
    );
    if (matchingImage) {
      return matchingImage;
    }
  }
  
  return null;
}

// Get products without images
db.all(`
  SELECT id, name, brand, image_url 
  FROM products 
  WHERE image_url IS NULL OR image_url = '' OR image_url = 'placeholder.jpg'
`, (err, products) => {
  if (err) {
    console.error('Error fetching products:', err);
    db.close();
    return;
  }

  console.log(`🔍 Found ${products.length} products without images`);
  
  let matched = 0;
  let processed = 0;
  
  const updatePromises = products.map(product => {
    return new Promise((resolve) => {
      const matchedImage = findImageForProduct(product.name, product.brand);
      
      if (matchedImage) {
        // Update product with matched image
        db.run(
          'UPDATE products SET image_url = ? WHERE id = ?',
          [matchedImage, product.id],
          function(updateErr) {
            if (!updateErr && this.changes > 0) {
              console.log(`✅ ${product.brand} - ${product.name} → ${matchedImage}`);
              matched++;
            }
            processed++;
            resolve();
          }
        );
      } else {
        // Set a default placeholder image
        db.run(
          'UPDATE products SET image_url = ? WHERE id = ?',
          ['default-product.jpg', product.id],
          function(updateErr) {
            if (!updateErr && this.changes > 0) {
              console.log(`⚪ ${product.brand} - ${product.name} → default-product.jpg`);
            }
            processed++;
            resolve();
          }
        );
      }
    });
  });

  Promise.all(updatePromises).then(() => {
    console.log(`\n📊 Summary:`);
    console.log(`- Products processed: ${processed}`);
    console.log(`- Images matched: ${matched}`);
    console.log(`- Using default placeholder: ${processed - matched}`);
    
    // Create default product image if it doesn't exist
    const defaultImagePath = path.join(imagesDir, 'default-product.jpg');
    if (!fs.existsSync(defaultImagePath)) {
      console.log('\n⚠️  Creating default-product.jpg placeholder...');
      // Copy one of the existing images as default or create a simple placeholder
      if (availableImages.length > 0) {
        const sourceImage = path.join(imagesDir, availableImages[0]);
        fs.copyFileSync(sourceImage, defaultImagePath);
        console.log('✅ Default placeholder created');
      }
    }
    
    db.close();
  });
});