const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('✅ TESTING FIXED CATEGORIES\n')
console.log('═'.repeat(70) + '\n')

const tests = [
  { subcategory: 'Makeup', expectedExclude: ['Now Inulin', 'Klorane Bebe', 'brush', 'eyeshadow brush'] },
  { subcategory: 'Higjena', expectedExclude: ['Now Inulin', 'Korff brush'] },
  { subcategory: 'Vitaminat dhe Mineralet', expectedExclude: ['Korff brush', 'Klorane Bebe'] },
  { subcategory: 'Aksesor', expectedProducts: ['brush'] }
]

let completed = 0

tests.forEach(test => {
  db.all(
    `SELECT DISTINCT name FROM products WHERE subcategory = ?`,
    [test.subcategory],
    (err, rows) => {
      if (err) {
        console.error(`Error: ${err.message}`)
        return
      }
      
      console.log(`📂 ${test.subcategory} (${rows.length} products):`)
      
      let violations = 0
      if (test.expectedExclude) {
        rows.forEach(row => {
          const name = row.name.toLowerCase()
          test.expectedExclude.forEach(exclude => {
            if (name.includes(exclude.toLowerCase())) {
              console.log(`  ❌ WRONG: ${row.name}`)
              violations++
            }
          })
        })
      }
      
      if (violations === 0 && test.expectedExclude) {
        console.log(`  ✅ All products are correctly placed!`)
      }
      
      console.log()
      
      completed++
      if (completed === tests.length) {
        console.log('═'.repeat(70))
        console.log('\n✅ CATEGORIZATION TEST COMPLETE!')
        db.close()
      }
    }
  )
})
