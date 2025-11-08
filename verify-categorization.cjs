const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔍 VERIFYING PRODUCT CATEGORIZATION:\n')

// Check the previously problematic products
const problemProducts = [
  { name: 'Nuxe Prodigieuse', issue: 'PERFUME (should NOT be in Higjena)' },
  { name: 'Klorane Floral', issue: 'MAKEUP REMOVER (should NOT be in Higjena)' },
  { name: 'Oralbiotic', issue: 'MEDICINAL LOZENGES (should be Farmaci/OTC)' },
  { name: 'Dr. Brown\'s', issue: 'TOOTHBRUSH (should be Aksesor per Beba)' },
  { name: 'Mister Baby', issue: 'FRAGRANCE (should be Higjena/Goja or Dermokozmetikë)' },
  { name: 'Durex', issue: 'CONDOMS (should be Farmaci/Mirëqenia seksuale)' }
]

console.log('❌ CHECKING PREVIOUSLY PROBLEMATIC PRODUCTS:\n')

problemProducts.forEach(product => {
  db.all(
    `SELECT name, brand, category, subcategory FROM products WHERE name LIKE ? LIMIT 3`,
    [`%${product.name}%`],
    (err, rows) => {
      if (err) {
        console.error(`Error: ${err.message}`)
      } else if (rows.length > 0) {
        rows.forEach(row => {
          const placement = `${row.category}/${row.subcategory}`
          console.log(`✓ ${row.brand} ${row.name}`)
          console.log(`  → ${placement}`)
          console.log(`  Issue: ${product.issue}\n`)
        })
      }
    }
  )
})

setTimeout(() => {
  console.log('\n\n📊 CATEGORY DISTRIBUTION BY SUBCATEGORY:\n')
  
  const categories = [
    { main: 'dermokozmetikë', subs: ['Fytyre', 'Flokët', 'Trupi', 'SPF', 'Makeup'] },
    { main: 'higjena', subs: ['Goja', 'Depilim dhe Intime', 'Këmbët', 'Trupi'] },
    { main: 'farmaci', subs: ['OTC (pa recete)', 'Mirëqenia seksuale', 'Aparat mjeksore', 'First Aid (Ndihma e Pare)', 'Ortopedike'] },
    { main: 'mama-dhe-bebat', subs: ['Shtatzani', 'Ushqyerje me Gji', 'Pelena', 'Higjena', 'SPF', 'Suplementa', 'Aksesor per Beba', 'Planifikim Familjar'] },
    { main: 'produkte-shtese', subs: ['Sete', 'Vajra Esencial'] },
    { main: 'suplemente', subs: ['Vitaminat dhe Mineralet', 'Çajra Mjekësore', 'Proteinë dhe Fitness', 'Suplementet Natyrore'] }
  ]
  
  let totalProducts = 0
  
  categories.forEach(cat => {
    console.log(`\n🏷️  ${cat.main.toUpperCase()}`)
    console.log('═'.repeat(50))
    
    let catTotal = 0
    
    cat.subs.forEach(sub => {
      db.get(
        `SELECT COUNT(*) as cnt FROM products WHERE LOWER(category) = LOWER(?) AND subcategory = ?`,
        [cat.main, sub],
        (err, row) => {
          if (err) {
            console.error(`Error: ${err.message}`)
          } else {
            const count = row.cnt || 0
            catTotal += count
            totalProducts += count
            
            if (count > 0) {
              console.log(`  • ${sub}: ${count}`)
            }
          }
        }
      )
    })
  })

  setTimeout(() => {
    db.get(`SELECT COUNT(*) as cnt FROM products`, [], (err, row) => {
      if (err) console.error(err)
      else {
        console.log(`\n\n✅ TOTAL ALL PRODUCTS: ${row.cnt}`)
        db.close()
      }
    })
  }, 1500)
}, 2500)
