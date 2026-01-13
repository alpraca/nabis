const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

async function intelligentAssignment() {
  console.log('\n🎯 INTELLIGENT CATEGORY ASSIGNMENT\n');
  
  const assignments = [
    // SPF Bebë - Baby sun/protection creams
    {
      subcategory: 'SPF Bebë',
      query: `
        UPDATE products 
        SET subcategory = 'SPF Bebë'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'mama-dhe-bebat' 
            AND subcategory = 'Kujdesi për Lëkurën'
            AND (
              name LIKE '%Bambo%' 
              OR name LIKE '%Mister Baby%'
              OR name LIKE '%Mustela%'
              OR name LIKE '%Rilastil%'
              OR (name LIKE '%cream%' AND name LIKE '%baby%')
            )
          LIMIT 8
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'SPF Bebë'"
    },
    
    // Shtatzani - Pregnancy/prenatal vitamins
    {
      subcategory: 'Shtatzani',
      query: `
        UPDATE products 
        SET subcategory = 'Shtatzani'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'mama-dhe-bebat'
            AND (
              name LIKE '%pregna%'
              OR name LIKE '%folic%'
              OR name LIKE '%mama%'
              OR name LIKE '%Wellbaby%'
              OR name LIKE '%Wellkid%'
            )
          LIMIT 10
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Shtatzani'"
    },
    
    // Proteine Fitness - High-quality supplements from sport brands
    {
      subcategory: 'Proteine Fitness',
      query: `
        UPDATE products 
        SET subcategory = 'Proteine Fitness'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'suplemente'
            AND subcategory = 'Vitaminat dhe Mineralet'
            AND brand IN ('Solgar', 'Nature''s Bounty', 'Nutriva')
            AND (
              name LIKE '%B-Complex%'
              OR name LIKE '%Magnesium%'
              OR name LIKE '%Multi%'
              OR name LIKE '%Energy%'
              OR name LIKE '%Sport%'
            )
          LIMIT 8
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Proteine Fitness'"
    },
    
    // Ortopedike - Support/bandage products
    {
      subcategory: 'Ortopedike',
      query: `
        UPDATE products 
        SET subcategory = 'Ortopedike'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'higjiene'
            AND (
              name LIKE '%support%'
              OR name LIKE '%elastic%'
              OR name LIKE '%bandage%'
              OR name LIKE '%belt%'
              OR name LIKE '%compress%'
              OR name LIKE '%strap%'
            )
          LIMIT 6
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Ortopedike'"
    },
    
    // Planifikim Familjar - Tests & contraceptives
    {
      subcategory: 'Planifikim Familjar',
      query: `
        UPDATE products 
        SET subcategory = 'Planifikim Familjar'
        WHERE id IN (
          SELECT id FROM products 
          WHERE category = 'mama-dhe-bebat'
            AND (
              name LIKE '%test%'
              OR name LIKE '%pregnancy%'
              OR name LIKE '%ovulation%'
            )
          LIMIT 5
        )
      `,
      verify: "SELECT name, brand FROM products WHERE subcategory = 'Planifikim Familjar'"
    }
  ];
  
  for (const assignment of assignments) {
    console.log(`\n📦 Assigning products to: ${assignment.subcategory}`);
    
    // Execute update
    const changes = await new Promise((resolve, reject) => {
      db.run(assignment.query, [], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    console.log(`   ✅ Moved ${changes} products`);
    
    // Show what was moved
    if (changes > 0) {
      const products = await new Promise((resolve, reject) => {
        db.all(assignment.verify, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      products.forEach(p => {
        console.log(`      • ${p.name} (${p.brand || 'No brand'})`);
      });
    }
  }
  
  // Final count
  console.log('\n\n========== FINAL STATUS ==========\n');
  
  const finalQuery = `
    SELECT subcategory, COUNT(*) as count
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
  
  results.forEach(row => {
    const icon = row.count >= 5 ? '✅' : row.count > 0 ? '⚠️' : '❌';
    console.log(`${icon} ${row.subcategory}: ${row.count} produkte`);
  });
  
  console.log('\n✨ ASSIGNMENT COMPLETE!\n');
  console.log('🌐 Website: http://localhost:5173\n');
  
  db.close();
}

intelligentAssignment().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
