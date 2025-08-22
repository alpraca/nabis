const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const path = require('path')

const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

const createAdmin = async () => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Delete existing admin if exists
    db.run('DELETE FROM users WHERE email = ?', ['admin@nabisfarmaci.al'], (err) => {
      if (err) console.error('Error deleting old admin:', err)
    })
    
    // Insert new admin
    db.run(`
      INSERT INTO users (email, password, role, isVerified, verificationCode, createdAt)
      VALUES (?, ?, 'admin', 1, NULL, datetime('now'))
    `, ['admin@nabisfarmaci.al', hashedPassword], function(err) {
      if (err) {
        console.error('❌ Error creating admin:', err.message)
      } else {
        console.log('✅ Admin created successfully!')
        console.log('📧 Email: admin@nabisfarmaci.al')
        console.log('🔑 Password: admin123')
      }
      db.close()
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    db.close()
  }
}

createAdmin()
