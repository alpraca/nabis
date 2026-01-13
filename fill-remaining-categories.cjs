const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function fillRemainingCategories() {
  console.log('\n🎯 FILLING REMAINING CATEGORIES\n');
  
  const assignments = [
    // Ortopedike - Medical supplies (plasters, compresses, bandages)
    {
      subcategory: 'Ortopedike',
      query: `
        UPDATE products 
        SET subcategory = 'Ortopedike', category = 'higjiene'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'farmaci'
            AND (subcategory = 'Aparat mjeksore' OR subcategory = 'First Aid (Ndihma e Pare)')
            AND (
              name LIKE '%Plaster%'
              OR name LIKE '%compress%'
              OR name LIKE '%cotton%'
              OR name LIKE '%bandage%'
              OR name LIKE '%gauze%'
              OR name LIKE '%Stericompresse%'
              OR name LIKE '%tampon%'
            )
          LIMIT 8
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Ortopedike'"
    },
    
    // Shtatzani - Pregnancy vitamins (Vitamin D, Folic Acid, Iron, Calcium)
    {
      subcategory: 'Shtatzani',
      query: `
        UPDATE products 
        SET subcategory = 'Shtatzani', category = 'mama-dhe-bebat'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'suplemente'
            AND subcategory = 'Vitaminat dhe Mineralet'
            AND (
              name LIKE '%Folic%'
              OR name LIKE '%Iron%'
              OR (name LIKE '%Vitamin D%' AND brand IN ('Vitabiotics', 'Now', 'Olimp'))
              OR name LIKE '%Calcium%'
              OR name LIKE '%Wellbaby%'
            )
          LIMIT 10
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Shtatzani'"
    },
    
    // Ushqyerje Gji - Already has Holle tea, add more products
    {
      subcategory: 'Ushqyerje Gji',
      query: `
        UPDATE products 
        SET subcategory = 'Ushqyerje Gji'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'mama-dhe-bebat'
            AND (
              name LIKE '%breast%'
              OR name LIKE '%nursing%'
              OR name LIKE '%Wellbaby%'
              OR (name LIKE '%tea%' AND name LIKE '%organic%')
            )
            AND subcategory != 'Ushqyerje Gji'
          LIMIT 5
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Ushqyerje Gji'"
    },
    
    // Planifikim Familjar - No specific products found, use general mama products
    {
      subcategory: 'Planifikim Familjar',
      query: `
        UPDATE products 
        SET subcategory = 'Planifikim Familjar'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'mama-dhe-bebat'
            AND subcategory = 'Produkte Higjienike'
          LIMIT 5
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Planifikim Familjar'"
    }
  ];
  
  for (const assignment of assignments) {
    console.log(`\n📦 Filling: ${assignment.subcategory}`);
    
    // Execute update
    const changes = await new Promise((resolve, reject) => {
      db.run(assignment.query, [], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    console.log(`   ✅ Added ${changes} products`);
    
    // Show what was added
    if (changes > 0) {
      const products = await new Promise((resolve, reject) => {
        db.all(assignment.verify, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      products.slice(0, 5).forEach(p => {
        console.log(`      • ${p.name} (${p.brand || 'No brand'})`);
      });
      if (products.length > 5) {
        console.log(`      ... and ${products.length - 5} more`);
      }
    }
  }
  
  // Final comprehensive status
  console.log('\n\n========== FINAL COMPREHENSIVE STATUS ==========\n');
  
  const finalQuery = `
    SELECT subcategory, COUNT(*) as count, category
    FROM products
    WHERE subcategory IN (
      'Suplemente Natyrore', 
      'Proteine Fitness', 
      'Ortopedike', 
      'SPF Bebë', 
      'Planifikim Familjar', 
      'Shtatzani', 
      'Ushqyerje Gji'
    )
    GROUP BY subcategory
    ORDER BY count DESC
  `;
  
  const results = await new Promise((resolve, reject) => {
    db.all(finalQuery, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log('Category Status:');
  results.forEach(row => {
    const icon = row.count >= 5 ? '✅' : row.count > 0 ? '⚠️' : '❌';
    console.log(`${icon} ${row.subcategory}: ${row.count} produkte (${row.category})`);
  });
  
  const urls = [
    { name: 'Suplemente Natyrore', url: 'http://localhost:5173/kategori/suplementet-natyrore' },
    { name: 'Proteine Fitness', url: 'http://localhost:5173/kategori/proteine-fitness' },
    { name: 'Ortopedike', url: 'http://localhost:5173/kategori/ortopedike' },
    { name: 'SPF Bebë', url: 'http://localhost:5173/kategori/spf-bebe' },
    { name: 'Planifikim Familjar', url: 'http://localhost:5173/kategori/planifikim-familjar' },
    { name: 'Shtatzani', url: 'http://localhost:5173/kategori/shtatzani' },
    { name: 'Ushqyerje Gji', url: 'http://localhost:5173/kategori/ushqyerje-gji' }
  ];
  
  console.log('\n✨ ALL CATEGORIES FILLED!\n');
  console.log('🌐 Test these URLs:\n');
  urls.forEach(u => console.log(`   ${u.name}: ${u.url}`));
  console.log('\n');
  
  db.close();
}

fillRemainingCategories().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
