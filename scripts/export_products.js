const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, '..', 'server', 'database.sqlite')
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening DB:', err.message)
    process.exit(1)
  }
})

db.all("SELECT id, name, description, brand, category, subcategory, price FROM products", (err, rows) => {
  if (err) {
    console.error('Query error:', err.message)
    process.exit(1)
  }
  console.log(JSON.stringify(rows, null, 2))
  db.close()
})
