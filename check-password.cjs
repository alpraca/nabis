const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
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

// Check the specific user
db.get('SELECT * FROM users WHERE email = ?', ['muratiberti02@gmail.com'], async (err, user) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }
  
  if (!user) {
    console.log('❌ User not found with email: muratiberti02@gmail.com');
    db.close();
    return;
  }
  
  console.log('📋 User found:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Password hash:', user.password);
  console.log('   Email verified:', user.email_verified);
  
  // Test different passwords
  const passwords = ['tWest123!', 'password123', 'admin123', 'user123'];
  
  console.log('\n🔍 Testing passwords...');
  
  for (const password of passwords) {
    try {
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`   ${password}: ${isValid ? '✅ CORRECT' : '❌ Wrong'}`);
    } catch (error) {
      console.log(`   ${password}: ❌ Error - ${error.message}`);
    }
  }
  
  console.log('\n🔧 Would you like to reset the password to "tWest123!"?');
  
  // Set password to tWest123!
  try {
    const newHash = await bcrypt.hash('tWest123!', 10);
    console.log('🔄 Updating password...');
    
    db.run('UPDATE users SET password = ? WHERE email = ?', [newHash, 'muratiberti02@gmail.com'], function(err) {
      if (err) {
        console.error('❌ Error updating password:', err);
      } else {
        console.log('✅ Password updated to "tWest123!" successfully!');
      }
      db.close();
    });
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    db.close();
  }
});
