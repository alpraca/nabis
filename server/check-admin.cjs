const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

console.log('🔍 Checking admin users...')

db.all('SELECT email, password, role FROM users WHERE role = ?', ['admin'], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message)
  } else if (rows.length === 0) {
    console.log('❌ No admin users found')
  } else {
    console.log('✅ Admin users found:')
    rows.forEach((row, index) => {
      console.log(`${index + 1}. Email: ${row.email}`)
      console.log(`   Password: ${row.password}`)
      console.log(`   Role: ${row.role}`)
      console.log('---')
    })
  }
  db.close()
})
