const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

db.get(`SELECT COUNT(*) as total FROM products`, (err, row) => {
  console.log(`Total products in DB: ${row.total}`)
  db.close()
})
