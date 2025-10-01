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

console.log('\n🔍 INVESTIGATING MISPLACED PRODUCTS:\n');

// Check for baby products in wrong categories
db.all(`
  SELECT name, brand, main_category, sub_category
  FROM products 
  WHERE (
    name LIKE '%baby%' OR 
    name LIKE '%bebé%' OR 
    name LIKE '%infant%' OR
    name LIKE '%newborn%' OR
    brand LIKE '%Holle%' OR
    brand LIKE '%Bambo%' OR
    brand LIKE '%Pingo%' OR
    name LIKE '%pamper%' OR
    name LIKE '%diaper%'
  ) AND main_category != 'Mama dhe Bebat'
  ORDER BY brand, name
  LIMIT 20
`, [], (err, babyRows) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  
  console.log('🍼 BABY PRODUCTS IN WRONG CATEGORIES:');
  babyRows.forEach(row => {
    console.log(`  ❌ ${row.brand} - ${row.name.substring(0, 50)}...`);
    console.log(`      Kategori aktuale: ${row.main_category} -> ${row.sub_category}`);
    console.log(`      Duhet të jetë: Mama dhe Bebat\n`);
  });

  // Check for supplements in wrong categories
  db.all(`
    SELECT name, brand, main_category, sub_category
    FROM products 
    WHERE (
      name LIKE '%vitamin%' OR 
      name LIKE '%supplement%' OR 
      name LIKE '%çaj%' OR
      name LIKE '%tea%' OR
      brand LIKE '%Now%' OR
      brand LIKE '%Vitabiotics%' OR
      name LIKE '%prebiotic%' OR
      name LIKE '%probiotic%' OR
      name LIKE '%omega%'
    ) AND main_category != 'Suplemente'
    ORDER BY brand, name
    LIMIT 20
  `, [], (err, suppRows) => {
    if (err) {
      console.error('Error:', err.message);
      return;
    }
    
    console.log('💊 SUPPLEMENTS IN WRONG CATEGORIES:');
    suppRows.forEach(row => {
      console.log(`  ❌ ${row.brand} - ${row.name.substring(0, 50)}...`);
      console.log(`      Kategori aktuale: ${row.main_category} -> ${row.sub_category}`);
      console.log(`      Duhet të jetë: Suplemente\n`);
    });

    // Check for medical/pharmacy products in wrong categories
    db.all(`
      SELECT name, brand, main_category, sub_category
      FROM products 
      WHERE (
        name LIKE '%bandage%' OR 
        name LIKE '%cerotto%' OR 
        name LIKE '%plaster%' OR
        name LIKE '%gauze%' OR
        brand LIKE '%Pic%' OR
        name LIKE '%syringe%' OR
        name LIKE '%thermometer%' OR
        name LIKE '%pressure%'
      ) AND main_category != 'Farmaci'
      ORDER BY brand, name
      LIMIT 15
    `, [], (err, medRows) => {
      if (err) {
        console.error('Error:', err.message);
        return;
      }
      
      console.log('🏥 MEDICAL PRODUCTS IN WRONG CATEGORIES:');
      medRows.forEach(row => {
        console.log(`  ❌ ${row.brand} - ${row.name.substring(0, 50)}...`);
        console.log(`      Kategori aktuale: ${row.main_category} -> ${row.sub_category}`);
        console.log(`      Duhet të jetë: Farmaci\n`);
      });

      db.close();
    });
  });
});