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

async function aggressiveRecategorization() {
  console.log('\n🔧 AGGRESSIVE PRODUCT RECATEGORIZATION...\n');

  // 1. Move ALL baby-related brands to "Mama dhe Bebat"
  console.log('🍼 Moving ALL baby brands...');
  
  const babyBrands = ['Holle', 'Hipp', 'Bambo', 'Pingo', 'Mustela', '4U Pharma'];
  
  for (const brand of babyBrands) {
    try {
      const result = await new Promise((resolve, reject) => {
        db.run(`
          UPDATE products 
          SET main_category = 'Mama dhe Bebat',
              sub_category = 'Kujdesi ndaj Bebit',
              sub_sub_category = CASE 
                WHEN name LIKE '%diaper%' OR name LIKE '%pamper%' OR name LIKE '%wet wipe%' THEN 'Pelena dhe Higjena'
                WHEN name LIKE '%food%' OR name LIKE '%cereal%' OR name LIKE '%milk%' OR name LIKE '%porridge%' THEN 'Ushqimi i Bebit'
                WHEN name LIKE '%vitamin%' OR name LIKE '%D3%' THEN 'Vitaminat për Bebë'
                ELSE 'Kujdesi ndaj Bebit'
              END
          WHERE brand LIKE ?
        `, [`%${brand}%`], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
      console.log(`  ✅ ${brand}: ${result} produkte`);
    } catch (error) {
      console.error(`  ❌ Error with ${brand}: ${error.message}`);
    }
  }

  // 2. Move ALL supplement brands to "Suplemente"
  console.log('\n💊 Moving ALL supplement brands...');
  
  const supplementBrands = ['Now', 'Vitabiotics', 'Solgar', 'ATC', 'Doppelherz'];
  
  for (const brand of supplementBrands) {
    try {
      const result = await new Promise((resolve, reject) => {
        db.run(`
          UPDATE products 
          SET main_category = 'Suplemente',
              sub_category = CASE 
                WHEN name LIKE '%çaj%' OR name LIKE '%tea%' OR brand LIKE '%ATC%' THEN 'Çajra Mjekësore'
                ELSE 'Vitaminat dhe Mineralet'
              END,
              sub_sub_category = NULL
          WHERE brand LIKE ?
        `, [`%${brand}%`], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
      console.log(`  ✅ ${brand}: ${result} produkte`);
    } catch (error) {
      console.error(`  ❌ Error with ${brand}: ${error.message}`);
    }
  }

  // 3. Move ALL medical brands to "Farmaci"
  console.log('\n🏥 Moving ALL medical brands...');
  
  const medicalBrands = ['Pic', 'Tena'];
  
  for (const brand of medicalBrands) {
    try {
      const result = await new Promise((resolve, reject) => {
        db.run(`
          UPDATE products 
          SET main_category = 'Farmaci',
              sub_category = CASE 
                WHEN brand LIKE '%Pic%' THEN 'Aparat mjekësore'
                WHEN brand LIKE '%Tena%' THEN 'First Aid (Ndihmë e Parë)'
                ELSE 'Aparat mjekësore'
              END,
              sub_sub_category = NULL
          WHERE brand LIKE ?
        `, [`%${brand}%`], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
      console.log(`  ✅ ${brand}: ${result} produkte`);
    } catch (error) {
      console.error(`  ❌ Error with ${brand}: ${error.message}`);
    }
  }

  // 4. Move products by keywords
  console.log('\n🔍 Moving products by keywords...');
  
  const keywordMoves = [
    {
      keywords: ['çaj', 'tea'],
      category: 'Suplemente',
      subcategory: 'Çajra Mjekësore'
    },
    {
      keywords: ['vitamin', 'supplement', 'omega', 'lecithin', 'biotin'],
      category: 'Suplemente', 
      subcategory: 'Vitaminat dhe Mineralet'
    },
    {
      keywords: ['diaper', 'pamper', 'baby', 'infant', 'newborn'],
      category: 'Mama dhe Bebat',
      subcategory: 'Kujdesi ndaj Bebit'
    }
  ];

  for (const move of keywordMoves) {
    for (const keyword of move.keywords) {
      try {
        const result = await new Promise((resolve, reject) => {
          db.run(`
            UPDATE products 
            SET main_category = ?, sub_category = ?
            WHERE name LIKE ? AND main_category = 'Dermokozmetikë'
          `, [move.category, move.subcategory, `%${keyword}%`], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          });
        });
        if (result > 0) {
          console.log(`  ✅ "${keyword}" keyword: ${result} produkte -> ${move.category}`);
        }
      } catch (error) {
        console.error(`  ❌ Error with keyword ${keyword}: ${error.message}`);
      }
    }
  }

  // Final check
  setTimeout(() => {
    console.log('\n📊 FINAL CATEGORY DISTRIBUTION:\n');
    
    db.all(`
      SELECT main_category, COUNT(*) as total
      FROM products 
      GROUP BY main_category 
      ORDER BY total DESC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error:', err.message);
        return;
      }
      
      rows.forEach(row => {
        console.log(`${row.main_category}: ${row.total} produkte`);
      });
      
      console.log('\n✅ Recategorization completed!');
      db.close();
    });
  }, 1000);
}

aggressiveRecategorization();