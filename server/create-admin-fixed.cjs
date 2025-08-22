const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const path = require('path')

const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

// First check table structure
db.all("PRAGMA table_info(users)", (err, columns) => {
  if (err) {
    console.error('Error getting table info:', err)
    return
  }
  
  console.log('📋 Users table structure:')
  columns.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}`)
  })
  
  createAdmin()
})

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Delete existing admin
    db.run('DELETE FROM users WHERE email = ?', ['admin@nabisfarmaci.al'], (err) => {
      if (err) console.log('Note: Could not delete old admin (maybe doesn\'t exist)')
    })
    
    // Insert new admin with correct columns
    db.run(`
      INSERT INTO users (email, password, role, verified, verification_code, created_at)
      VALUES (?, ?, 'admin', 1, NULL, datetime('now'))
    `, ['admin@nabisfarmaci.al', hashedPassword], function(err) {
      if (err) {
        console.error('❌ Error creating admin:', err.message)
      } else {
        console.log('\n✅ Admin created successfully!')
        console.log('📧 Email: admin@nabisfarmaci.al')
        console.log('🔑 Password: admin123')
        console.log('\nYou can now login to the admin panel! 🎉')
      }
      db.close()
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    db.close()
  }
}
