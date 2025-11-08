const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Rules to move products to correct categories
const moves = [
  // Mirëqenia Seksuale (Condoms)
  {
    find: { name: 'condom', description: 'condom' },
    moveTo: { category: 'farmaci', subcategory: 'Mirëqenia seksuale' }
  },
  {
    find: { brand: 'durex' },
    moveTo: { category: 'farmaci', subcategory: 'Mirëqenia seksuale' }
  },
  {
    find: { brand: 'trojan' },
    moveTo: { category: 'farmaci', subcategory: 'Mirëqenia seksuale' }
  },
  
  // Çajra Mjekësore (Baby teas)
  {
    find: { name: 'fennel tea', brand: 'hipp' },
    moveTo: { category: 'suplemente', subcategory: 'Çajra Mjekësore' }
  },
  {
    find: { name: 'nursing tea', brand: 'holle' },
    moveTo: { category: 'suplemente', subcategory: 'Çajra Mjekësore' }
  },
  {
    find: { name: 'tea', brand: 'atc' },
    moveTo: { category: 'suplemente', subcategory: 'Çajra Mjekësore' }
  },
  
  // Vajra Esencial
  {
    find: { brand: 'bio oil' },
    moveTo: { category: 'produkte-shtese', subcategory: 'Vajra Esencial' }
  },
  {
    find: { name: 'castor oil', brand: 'now' },
    moveTo: { category: 'produkte-shtese', subcategory: 'Vajra Esencial' }
  },
  
  // Sete (Sets/Kits)
  {
    find: { name: ['trio', 'routine', 'pack voyage', 'gift set'] },
    moveTo: { category: 'produkte-shtese', subcategory: 'Sete' }
  }
]

let totalMoved = 0

console.log('🔄 Moving products to correct categories...\n')

moves.forEach((move, idx) => {
  let query = 'UPDATE products SET category = ?, subcategory = ? WHERE '
  let params = [move.moveTo.category, move.moveTo.subcategory]
  let conditions = []

  if (move.find.name) {
    const names = Array.isArray(move.find.name) ? move.find.name : [move.find.name]
    const nameConditions = names.map(n => `LOWER(name) LIKE '%${n}%'`).join(' OR ')
    conditions.push(`(${nameConditions})`)
  }

  if (move.find.brand) {
    conditions.push(`LOWER(brand) LIKE '%${move.find.brand}%'`)
  }

  if (move.find.description) {
    conditions.push(`LOWER(description) LIKE '%${move.find.description}%'`)
  }

  query += conditions.join(' AND ')

  db.run(query, params, function(err) {
    if (err) {
      console.error(`❌ Error in rule ${idx}:`, err.message)
    } else if (this.changes > 0) {
      totalMoved += this.changes
      const findStr = JSON.stringify(move.find).substring(0, 50)
      console.log(`✓ Moved ${this.changes} to ${move.moveTo.category}/${move.moveTo.subcategory}`)
      console.log(`  Condition: ${findStr}\n`)
    }
  })
})

setTimeout(() => {
  console.log(`\n✅ Total moved: ${totalMoved}\n`)
  
  // Show Durex products
  db.all(`
    SELECT id, name, brand, category, subcategory 
    FROM products 
    WHERE LOWER(brand) LIKE '%durex%'
    LIMIT 10
  `, [], (err, rows) => {
    console.log('🎯 DUREX PRODUCTS NOW:\n')
    rows.forEach(r => {
      console.log(`  ✓ ${r.name}`)
      console.log(`    → ${r.category}/${r.subcategory}\n`)
    })
    
    // Show final summary
    db.all(`
      SELECT category, subcategory, COUNT(*) as cnt 
      FROM products 
      GROUP BY category, subcategory
      ORDER BY category, subcategory
    `, [], (err, rows) => {
      console.log('\n📊 FINAL SUMMARY:\n')
      let currentCat = ''
      let catTotal = 0
      
      rows.forEach((r, idx) => {
        if (currentCat !== r.category) {
          if (currentCat) {
            console.log(`  TOTAL: ${catTotal}\n`)
          }
          currentCat = r.category
          catTotal = 0
          console.log(`${r.category}:`)
        }
        catTotal += r.cnt
        const subcat = r.subcategory || '(none)'
        console.log(`  ├─ ${subcat}: ${r.cnt}`)
        
        if (idx === rows.length - 1) {
          console.log(`  TOTAL: ${catTotal}\n`)
        }
      })
      
      db.close()
    })
  })
}, 1500)
