const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// All expected subcategories per category structure
const expectedStructure = {
  'dermokozmetikë': ['Fytyre', 'Flokët', 'Trupi', 'SPF', 'Tanning', 'Makeup'],
  'higjena': ['Depilim dhe Intime', 'Goja', 'Këmbët', 'Trupi'],
  'farmaci': ['OTC (pa recete)', 'Mirëqenia seksuale', 'Aparat mjeksore', 'First Aid (Ndihma e Pare)', 'Ortopedike'],
  'mama-dhe-bebat': ['Shtatzani', 'Ushqyerje me Gji', 'Pelena', 'Higjena', 'SPF', 'Suplementa', 'Aksesor per Beba', 'Planifikim Familjar'],
  'produkte-shtese': ['Sete', 'Vajra Esencial'],
  'suplemente': ['Vitaminat dhe Mineralet', 'Çajra Mjekësore', 'Proteinë dhe Fitness', 'Suplementet Natyrore']
}

console.log('📋 CHECKING FOR MISSING SUBCATEGORIES:\n')
console.log('═'.repeat(70))

let totalMissing = 0

Object.entries(expectedStructure).forEach(([category, subcats]) => {
  console.log(`\n🏷️  ${category.toUpperCase()}`)
  console.log('─'.repeat(70))
  
  db.all(
    `SELECT DISTINCT subcategory FROM products WHERE category = ?`,
    [category],
    (err, rows) => {
      if (err) {
        console.error(`Error for ${category}:`, err.message)
        return
      }
      
      const existingSubcats = new Set(rows.map(r => r.subcategory).filter(Boolean))
      
      subcats.forEach(expected => {
        if (existingSubcats.has(expected)) {
          db.get(
            `SELECT COUNT(*) as cnt FROM products WHERE category = ? AND subcategory = ?`,
            [category, expected],
            (err, result) => {
              if (err) console.error(err)
              else console.log(`  ✓ ${expected.padEnd(30)} : ${result.cnt} products`)
            }
          )
        } else {
          totalMissing++
          console.log(`  ❌ ${expected.padEnd(30)} : NO PRODUCTS`)
        }
      })
    }
  )
})

setTimeout(() => {
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`\n⚠️  Missing subcategories: ${totalMissing}`)
  console.log('These need products assigned to them.\n')
  db.close()
}, 1500)
