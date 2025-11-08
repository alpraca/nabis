const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔍 CHECKING EMPTY SUBCATEGORIES:\n')

db.all(`
  SELECT category, subcategory, COUNT(*) as cnt
  FROM products
  GROUP BY category, subcategory
  ORDER BY category, subcategory
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  console.log('📊 CURRENT STATE:\n')
  
  let totalEmpty = 0
  const emptyByCategory = {}
  
  rows.forEach(row => {
    const status = row.subcategory ? '✓' : '✗'
    const subcat = row.subcategory || '(EMPTY)'
    console.log(`${status} ${row.category.padEnd(20)} → ${subcat.padEnd(30)} : ${row.cnt}`)
    
    if (!row.subcategory) {
      totalEmpty += row.cnt
      emptyByCategory[row.category] = row.cnt
    }
  })

  console.log(`\n❌ TOTAL EMPTY SUBCATEGORIES: ${totalEmpty} products\n`)
  
  if (totalEmpty > 0) {
    console.log('📋 BY CATEGORY:')
    Object.entries(emptyByCategory).forEach(([cat, cnt]) => {
      console.log(`  • ${cat}: ${cnt} products`)
    })
  }
  
  db.close()
})
