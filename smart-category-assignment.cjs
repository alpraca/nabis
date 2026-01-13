const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

// Smart category mapping with keyword detection
const smartMappings = [
  {
    subcategory: 'Proteine Fitness',
    category: 'suplemente',
    keywords: ['protein', 'whey', 'bcaa', 'amino', 'creatine', 'mass', 'muscle', 'fitness', 'gainer', 'isolate'],
    sourceSubcategories: ['Vitaminat dhe Mineralet', 'Suplemente Natyrore', 'Trime'],
    targetCount: 10
  },
  {
    subcategory: 'Ortopedike',
    category: 'higjiene',
    keywords: ['support', 'brace', 'elastic', 'bandage', 'belt', 'strap', 'knee', 'ankle', 'wrist', 'back', 'posture', 'compress'],
    sourceSubcategories: ['Banjë', 'Produkte Mbrojtëse', 'Produkte kundër Insekteve'],
    targetCount: 8
  },
  {
    subcategory: 'SPF Bebë',
    category: 'mama-dhe-bebat',
    keywords: ['spf', 'sun', 'solar', 'protect', 'uv'],
    nameFilters: ['bebe', 'baby', 'kids', 'child', 'fëmijë'],
    sourceSubcategories: ['Kujdesi për Lëkurën', 'Shampo dhe Produkte banje', 'Produkte Higjienike'],
    targetCount: 5
  },
  {
    subcategory: 'Planifikim Familjar',
    category: 'mama-dhe-bebat',
    keywords: ['test', 'pregnancy test', 'ovulation', 'condom', 'contraceptive', 'fertility', 'planning'],
    sourceSubcategories: ['Kujdesi për Lëkurën', 'Produkte Higjienike'],
    targetCount: 5
  },
  {
    subcategory: 'Shtatzani',
    category: 'mama-dhe-bebat',
    keywords: ['pregna', 'prenatal', 'maternity', 'shtatzani', 'pregnant', 'mama', 'gravida', 'folic'],
    sourceSubcategories: ['Kujdesi për Lëkurën', 'Vitaminat dhe Mineralet'],
    targetCount: 8
  }
];

async function findAndMoveProducts() {
  console.log('\n🔍 SMART CATEGORY ASSIGNMENT\n');
  
  for (const mapping of smartMappings) {
    console.log(`\n📦 Processing: ${mapping.subcategory}`);
    console.log(`   Keywords: ${mapping.keywords.join(', ')}`);
    
    // Build WHERE clause for keyword matching
    const keywordConditions = mapping.keywords.map(kw => 
      `(LOWER(name) LIKE '%${kw.toLowerCase()}%' OR LOWER(description) LIKE '%${kw.toLowerCase()}%')`
    ).join(' OR ');
    
    // Build WHERE clause for source subcategories
    const subcatConditions = mapping.sourceSubcategories.map(sc => 
      `subcategory = '${sc}'`
    ).join(' OR ');
    
    // Additional filter for name (for SPF Bebë)
    let nameFilter = '';
    if (mapping.nameFilters) {
      nameFilter = ' AND (' + mapping.nameFilters.map(nf => 
        `LOWER(name) LIKE '%${nf.toLowerCase()}%'`
      ).join(' OR ') + ')';
    }
    
    // Find matching products
    const query = `
      SELECT id, name, brand, category, subcategory, price
      FROM products
      WHERE category = '${mapping.category}'
        AND (${subcatConditions})
        AND (${keywordConditions})
        ${nameFilter}
      LIMIT ${mapping.targetCount}
    `;
    
    const products = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (products.length === 0) {
      console.log(`   ⚠️  No matching products found`);
      continue;
    }
    
    console.log(`   ✅ Found ${products.length} matching products:`);
    products.forEach(p => {
      console.log(`      • ${p.name} (${p.brand || 'No brand'}) - ${p.price}L`);
      console.log(`        FROM: ${p.subcategory} → TO: ${mapping.subcategory}`);
    });
    
    // Update products using subquery to avoid LIMIT issue
    const productIds = products.map(p => p.id).join(',');
    const updateQuery = `
      UPDATE products 
      SET subcategory = '${mapping.subcategory}'
      WHERE id IN (${productIds})
    `;
    
    await new Promise((resolve, reject) => {
      db.run(updateQuery, [], function(err) {
        if (err) reject(err);
        else {
          console.log(`   ✔️  Moved ${this.changes} products to ${mapping.subcategory}`);
          resolve();
        }
      });
    });
  }
  
  // Final verification
  console.log('\n\n========== VERIFICATION ==========\n');
  
  const verifyQuery = `
    SELECT subcategory, COUNT(*) as count
    FROM products
    WHERE subcategory IN ('Suplemente Natyrore', 'Proteine Fitness', 'Ortopedike', 'SPF Bebë', 'Planifikim Familjar', 'Shtatzani', 'Ushqyerje Gji')
    GROUP BY subcategory
    ORDER BY subcategory
  `;
  
  const results = await new Promise((resolve, reject) => {
    db.all(verifyQuery, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  results.forEach(row => {
    const icon = row.count > 0 ? '✅' : '❌';
    console.log(`${icon} ${row.subcategory}: ${row.count} produkte`);
  });
  
  console.log('\n✨ SMART ASSIGNMENT COMPLETE!\n');
  
  db.close();
}

findAndMoveProducts().catch(err => {
  console.error('❌ Error:', err.message);
  db.close();
  process.exit(1);
});
