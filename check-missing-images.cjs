const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

console.log('🔍 Checking products without images...');

// Check total products
db.get('SELECT COUNT(*) as total FROM products', (err, result) => {
  if (!err) {
    console.log(`📊 Total products: ${result.total}`);
  }
});

// Check products without images
db.all(`
  SELECT COUNT(*) as missing 
  FROM products 
  WHERE image_url IS NULL OR image_url = '' OR image_url = 'placeholder.jpg'
`, (err, result) => {
  if (!err) {
    console.log(`❌ Products without images: ${result[0].missing}`);
  }
});

// Get some examples of products without images
db.all(`
  SELECT id, name, brand, image_url 
  FROM products 
  WHERE image_url IS NULL OR image_url = '' OR image_url = 'placeholder.jpg'
  LIMIT 10
`, (err, products) => {
  if (!err) {
    console.log('\n📝 Examples of products without images:');
    products.forEach(product => {
      console.log(`- ID: ${product.id}, ${product.brand} - ${product.name}`);
    });
  }
  
  // Check what images are available in the product_images folder
  const imagesDir = './product_images';
  if (fs.existsSync(imagesDir)) {
    const availableImages = fs.readdirSync(imagesDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
    );
    console.log(`\n📁 Available images in product_images: ${availableImages.length}`);
    console.log('First 10 images:', availableImages.slice(0, 10));
  }
  
  db.close();
});