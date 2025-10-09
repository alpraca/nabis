const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

console.log('\n🔍 TESTING CATEGORY FILTERING:\n');

// Test Suplemente category
const testCategory = 'suplemente';

console.log(`Testing category filter for: "${testCategory}"`);

db.all(`
  SELECT COUNT(*) as count, main_category, sub_category
  FROM products 
  WHERE LOWER(main_category) = LOWER(?)
  GROUP BY main_category, sub_category
`, [testCategory], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  
  console.log('\n📊 Results for exact match:');
  if (rows.length === 0) {
    console.log('❌ No products found with exact match');
  } else {
    rows.forEach(row => {
      console.log(`✅ ${row.main_category} -> ${row.sub_category}: ${row.count} produkte`);
    });
  }
  
  // Now test what categories we actually have
  console.log('\n📋 ALL AVAILABLE CATEGORIES:');
  
  db.all(`
    SELECT DISTINCT main_category, COUNT(*) as count
    FROM products 
    GROUP BY main_category
    ORDER BY count DESC
  `, [], (err, categories) => {
    if (err) {
      console.error('Error:', err.message);
      return;
    }
    
    categories.forEach(cat => {
      console.log(`"${cat.main_category}": ${cat.count} produkte`);
    });
    
    // Test with actual database column names
    console.log('\n🔍 CHECKING DATABASE SCHEMA:');
    
    db.all(`PRAGMA table_info(products)`, [], (err, columns) => {
      if (err) {
        console.error('Error:', err.message);
        return;
      }
      
      console.log('Database columns:');
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
      });
      
      // Show sample products
      console.log('\n📦 SAMPLE PRODUCTS:');
      
      db.all(`
        SELECT name, brand, main_category, sub_category
        FROM products 
        WHERE main_category = 'Suplemente'
        LIMIT 5
      `, [], (err, samples) => {
        if (err) {
          console.error('Error:', err.message);
          return;
        }
        
        if (samples.length === 0) {
          console.log('❌ No products found in "Suplemente" category');
        } else {
          samples.forEach(product => {
            console.log(`✅ ${product.brand} - ${product.name.substring(0, 50)}...`);
            console.log(`   Category: "${product.main_category}" -> "${product.sub_category}"`);
          });
        }
        
        db.close();
      });
    });
  });
});