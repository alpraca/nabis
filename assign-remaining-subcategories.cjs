const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Assign remaining products to subcategories based on main category
const assignments = [
  {
    category: 'dermokozmetikë',
    defaultSubcategory: 'Trupi'  // Default for unclassified dermokozmetikë
  },
  {
    category: 'higjena',
    defaultSubcategory: 'Goja'   // Default for unclassified higjena
  },
  {
    category: 'mama-dhe-bebat',
    defaultSubcategory: 'Suplementa'  // Default for unclassified mama dhe bebat
  },
  {
    category: 'suplemente',
    defaultSubcategory: 'Vitaminat dhe Mineralet'  // Default for suplemente
  }
]

let totalAssigned = 0

console.log('🔄 Assigning remaining products to default subcategories...\n')

assignments.forEach(assignment => {
  const query = `
    UPDATE products 
    SET subcategory = ?
    WHERE LOWER(category) = LOWER(?)
    AND (subcategory IS NULL OR subcategory = '')
  `

  db.run(query, [assignment.defaultSubcategory, assignment.category], function(err) {
    if (err) {
      console.error(`❌ Error for ${assignment.category}: ${err.message}`)
    } else if (this.changes > 0) {
      totalAssigned += this.changes
      console.log(`✓ ${assignment.category} → ${assignment.defaultSubcategory}: +${this.changes}`)
    } else {
      console.log(`  ${assignment.category}: 0 unassigned`)
    }
  })
})

setTimeout(() => {
  console.log(`\n✅ Total assigned: ${totalAssigned}`)
  
  // Show final summary
  db.all(`
    SELECT category, subcategory, COUNT(*) as cnt 
    FROM products 
    GROUP BY category, subcategory
    ORDER BY category, subcategory
  `, [], (err, rows) => {
    if (err) console.error(err)
    
    console.log('\n📊 FINAL STRUCTURE:\n')
    let currentCat = null
    let catTotal = 0
    
    rows.forEach((r, idx) => {
      if (currentCat !== r.category) {
        if (currentCat) {
          console.log(`  Subtotal: ${catTotal}\n`)
        }
        currentCat = r.category
        catTotal = 0
        console.log(`${r.category}:`)
      }
      catTotal += r.cnt
      console.log(`  ├─ ${r.subcategory}: ${r.cnt}`)
      
      if (idx === rows.length - 1) {
        console.log(`  Subtotal: ${catTotal}\n`)
      }
    })
    
    db.close()
  })
}, 1500)
