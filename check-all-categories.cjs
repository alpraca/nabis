const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Check what categories exist
db.all(`SELECT DISTINCT LOWER(category) as cat, COUNT(*) as cnt FROM products GROUP BY LOWER(category) ORDER BY cnt DESC`, [], (err, rows) => {
  console.log('📊 CATEGORIES IN DATABASE:\n')
  rows.forEach(r => console.log(`  ${r.cat}: ${r.cnt}`))
  db.close()
})
