const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

console.log('🔍 Checking product images status...');

// Check total products
db.get('SELECT COUNT(*) as total FROM products', (err, result) => {
  if (!err) {
    console.log(`📊 Total products: ${result.total}`);
  }
});

// Check products with images
db.get(`
  SELECT COUNT(DISTINCT p.id) as with_images 
  FROM products p 
  INNER JOIN product_images pi ON p.id = pi.product_id
`, (err, result) => {
  if (!err) {
    console.log(`✅ Products with images: ${result.with_images}`);
  }
});

// Check products without images
db.all(`
  SELECT p.id, p.name, p.brand 
  FROM products p 
  LEFT JOIN product_images pi ON p.id = pi.product_id 
  WHERE pi.product_id IS NULL
  LIMIT 10
`, (err, products) => {
  if (!err) {
    console.log(`❌ Products without images: ${products.length} (showing first 10)`);
    products.forEach(product => {
      console.log(`- ID: ${product.id}, ${product.brand} - ${product.name}`);
    });
  }
});

// Get total count of products without images
db.get(`
  SELECT COUNT(*) as missing 
  FROM products p 
  LEFT JOIN product_images pi ON p.id = pi.product_id 
  WHERE pi.product_id IS NULL
`, (err, result) => {
  if (!err) {
    console.log(`📊 Total products missing images: ${result.missing}`);
  }
  
  // Check available images in folder
  const imagesDir = './product_images';
  if (fs.existsSync(imagesDir)) {
    const availableImages = fs.readdirSync(imagesDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
    );
    console.log(`📁 Available images in folder: ${availableImages.length}`);
  }
  
  db.close();
});