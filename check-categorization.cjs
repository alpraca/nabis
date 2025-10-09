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

// Check categorization
console.log('\n📊 CATEGORY DISTRIBUTION:\n');

db.all(`
  SELECT 
    main_category,
    COUNT(*) as total_products
  FROM products 
  GROUP BY main_category 
  ORDER BY total_products DESC
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  
  rows.forEach(row => {
    console.log(`${row.main_category}: ${row.total_products} produkte`);
  });
  
  console.log('\n📋 SUBCATEGORY DISTRIBUTION:\n');
  
  // Check subcategories
  db.all(`
    SELECT 
      main_category,
      sub_category,
      COUNT(*) as count
    FROM products 
    WHERE sub_category IS NOT NULL
    GROUP BY main_category, sub_category 
    ORDER BY main_category, count DESC
  `, [], (err, subRows) => {
    if (err) {
      console.error('Error:', err.message);
      return;
    }
    
    let currentMainCat = '';
    subRows.forEach(row => {
      if (row.main_category !== currentMainCat) {
        console.log(`\n${row.main_category}:`);
        currentMainCat = row.main_category;
      }
      console.log(`  - ${row.sub_category}: ${row.count} produkte`);
    });
    
    console.log('\n🔍 SAMPLE PRODUCTS BY CATEGORY:\n');
    
    // Show sample products from each main category
    db.all(`
      SELECT 
        main_category,
        sub_category,
        name,
        brand
      FROM products 
      ORDER BY main_category, RANDOM()
      LIMIT 50
    `, [], (err, sampleRows) => {
      if (err) {
        console.error('Error:', err.message);
        return;
      }
      
      let currentCat = '';
      sampleRows.forEach(row => {
        if (row.main_category !== currentCat) {
          console.log(`\n${row.main_category} - Shembuj produktesh:`);
          currentCat = row.main_category;
        }
        console.log(`  📦 ${row.brand} - ${row.name.substring(0, 60)}...`);
        if (row.sub_category) {
          console.log(`      └── Nënkategori: ${row.sub_category}`);
        }
      });
      
      db.close();
    });
  });
});