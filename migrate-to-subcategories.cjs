const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Map primary categories to dermokozmetikë subcategories
const mappings = [
  { fromCategory: 'fytyre', toCategory: 'dermokozmetikë', subcategory: 'Fytyre' },
  { fromCategory: 'flokët', toCategory: 'dermokozmetikë', subcategory: 'Flokët' },
  { fromCategory: 'trupi', toCategory: 'dermokozmetikë', subcategory: 'Trupi' },
  { fromCategory: 'spf', toCategory: 'dermokozmetikë', subcategory: 'SPF' }
]

let totalUpdated = 0

console.log('🔄 Migrating primary categories to subcategories...\n')

mappings.forEach(mapping => {
  const query = `
    UPDATE products 
    SET category = ?, subcategory = ?
    WHERE LOWER(category) = LOWER(?)
  `
  
  db.run(query, [mapping.toCategory, mapping.subcategory, mapping.fromCategory], function(err) {
    if (err) {
      console.error(`❌ Error for ${mapping.fromCategory}:`, err.message)
    } else {
      totalUpdated += this.changes
      console.log(`✓ ${mapping.fromCategory} → ${mapping.toCategory}/${mapping.subcategory}: ${this.changes} products`)
    }
  })
})

setTimeout(() => {
  console.log(`\n✅ Total migrated: ${totalUpdated}\n`)
  
  // Show final structure
  db.all(`
    SELECT category, subcategory, COUNT(*) as cnt 
    FROM products 
    GROUP BY category, COALESCE(subcategory, 'NULL')
    ORDER BY category, subcategory
  `, [], (err, rows) => {
    if (err) console.error(err)
    
    console.log('📊 FINAL STRUCTURE:\n')
    let currentCat = ''
    let catCount = 0
    let catTotal = 0
    
    rows.forEach((r, idx) => {
      if (currentCat !== r.category) {
        if (currentCat) {
          console.log(`  TOTAL for ${currentCat}: ${catTotal}\n`)
        }
        currentCat = r.category
        catTotal = 0
        console.log(`${r.category}:`)
      }
      catTotal += r.cnt
      const subcat = r.subcategory === 'NULL' ? '(no subcategory)' : r.subcategory
      console.log(`  ├─ ${subcat}: ${r.cnt}`)
      
      if (idx === rows.length - 1) {
        console.log(`  TOTAL for ${currentCat}: ${catTotal}\n`)
      }
    })
    
    db.close()
  })
}, 1500)
