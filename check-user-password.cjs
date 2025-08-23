const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/database.sqlite');

console.log('🔍 Checking password for: muratiberti02@gmail.com');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Get user details including password hash
db.get('SELECT id, name, email, password, role, email_verified, created_at FROM users WHERE email = ?', ['muratiberti02@gmail.com'], (err, user) => {
  if (err) {
    console.error('❌ Error:', err);
  } else if (user) {
    console.log('📋 User details:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Email Verified:', user.email_verified ? 'Yes ✅' : 'No ❌');
    console.log('   Created:', user.created_at);
    console.log('   Password Hash:', user.password);
    console.log('');
    console.log('ℹ️  Note: Password is hashed for security. Original password cannot be retrieved.');
    console.log('ℹ️  If you need to reset the password, you can set a new one.');
  } else {
    console.log('❌ User not found with email: muratiberti02@gmail.com');
  }
  
  db.close(() => {
    console.log('✅ Database check complete');
  });
});
