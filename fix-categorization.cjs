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

async function fixCategorization() {
  console.log('\n🔧 FIXING PRODUCT CATEGORIZATION...\n');

  const updates = [];

  // 1. Fix Baby Products
  console.log('🍼 Moving baby products to "Mama dhe Bebat"...');
  
  const babyProductUpdates = [
    // Baby food and formula
    {
      condition: `(brand LIKE '%Holle%' OR brand LIKE '%Hipp%' OR brand LIKE '%Nan%') AND (
        name LIKE '%baby%' OR name LIKE '%infant%' OR name LIKE '%cereal%' OR 
        name LIKE '%porridge%' OR name LIKE '%milk%' OR name LIKE '%formula%'
      )`,
      category: 'Mama dhe Bebat',
      subcategory: 'Kujdesi ndaj Bebit',
      subsubcategory: 'Ushqimi i Bebit'
    },
    
    // Diapers and baby care
    {
      condition: `brand LIKE '%Bambo%' OR brand LIKE '%Pingo%' OR (
        name LIKE '%diaper%' OR name LIKE '%pamper%' OR name LIKE '%newborn%' OR
        name LIKE '%baby%'
      )`,
      category: 'Mama dhe Bebat',
      subcategory: 'Kujdesi ndaj Bebit',
      subsubcategory: 'Pelena dhe Higjena'
    },

    // Baby vitamins
    {
      condition: `brand LIKE '%4U Pharma%' AND name LIKE '%Babytol%'`,
      category: 'Mama dhe Bebat',
      subcategory: 'Kujdesi ndaj Bebit',
      subsubcategory: 'Vitaminat për Bebë'
    }
  ];

  // 2. Fix Supplements
  console.log('💊 Moving supplements to "Suplemente"...');
  
  const supplementUpdates = [
    // NOW supplements
    {
      condition: `brand LIKE '%Now%'`,
      category: 'Suplemente',
      subcategory: 'Vitaminat dhe Mineralet',
      subsubcategory: null
    },
    
    // Tea products
    {
      condition: `name LIKE '%çaj%' OR name LIKE '%tea%' OR brand LIKE '%ATC%'`,
      category: 'Suplemente',
      subcategory: 'Çajra Mjekësore',
      subsubcategory: null
    },
    
    // Other vitamin products
    {
      condition: `name LIKE '%vitamin%' OR name LIKE '%lecithin%' OR name LIKE '%supplement%'`,
      category: 'Suplemente',
      subcategory: 'Vitaminat dhe Mineralet',
      subsubcategory: null
    }
  ];

  // 3. Fix Medical Products
  console.log('🏥 Moving medical products to "Farmaci"...');
  
  const medicalUpdates = [
    // PIC medical devices
    {
      condition: `brand LIKE '%Pic%'`,
      category: 'Farmaci',
      subcategory: 'Aparat mjekësore',
      subsubcategory: null
    },
    
    // First aid products
    {
      condition: `name LIKE '%bandage%' OR name LIKE '%cerotti%' OR name LIKE '%plaster%' OR name LIKE '%gauze%'`,
      category: 'Farmaci',
      subcategory: 'First Aid (Ndihmë e Parë)',
      subsubcategory: null
    }
  ];

  // Combine all updates
  const allUpdates = [...babyProductUpdates, ...supplementUpdates, ...medicalUpdates];

  // Execute updates
  for (const update of allUpdates) {
    try {
      const result = await new Promise((resolve, reject) => {
        const sql = `
          UPDATE products 
          SET main_category = ?, sub_category = ?, sub_sub_category = ?
          WHERE ${update.condition}
        `;
        
        db.run(sql, [update.category, update.subcategory, update.subsubcategory], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      });

      if (result > 0) {
        console.log(`  ✅ Updated ${result} products: ${update.category} -> ${update.subcategory}`);
      }
    } catch (error) {
      console.error(`  ❌ Error updating products: ${error.message}`);
    }
  }

  // Show final category distribution
  console.log('\n📊 UPDATED CATEGORY DISTRIBUTION:\n');
  
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
    
    console.log('\n✅ Kategorizimi u rregullua me sukses!');
    db.close();
  });
}

fixCategorization();