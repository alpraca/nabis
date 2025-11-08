const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

db.all(`SELECT subcategory, COUNT(*) as cnt FROM products 
        WHERE subcategory IS NOT NULL AND subcategory != '' 
        GROUP BY subcategory 
        ORDER BY cnt DESC`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err)
  } else {
    console.log('\n=== SUBCATEGORIES IN DATABASE ===')
    rows.forEach(r => console.log(`${r.subcategory}: ${r.cnt} products`))
  }
  db.close()
})
