const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/database.sqlite');

console.log('🔍 Checking user: muratiberti02@gmail.com');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Check the specific user
db.get('SELECT * FROM users WHERE email = ?', ['muratiberti02@gmail.com'], (err, user) => {
  if (err) {
    console.error('❌ Error:', err);
  } else if (user) {
    console.log('📋 User found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Email Verified:', user.email_verified ? 'Yes ✅' : 'No ❌');
    console.log('   Created:', user.created_at);
    
    if (!user.email_verified) {
      console.log('\n🔧 Fixing email verification...');
      db.run('UPDATE users SET email_verified = 1 WHERE email = ?', ['muratiberti02@gmail.com'], function(err) {
        if (err) {
          console.error('❌ Error updating user:', err);
        } else {
          console.log('✅ Email verification fixed! User can now login.');
        }
        db.close();
      });
    } else {
      console.log('\n✅ User is already verified and should be able to login');
      db.close();
    }
  } else {
    console.log('❌ User not found with email: muratiberti02@gmail.com');
    
    // Check if there's a pending registration
    db.get('SELECT * FROM pending_registrations WHERE email = ?', ['muratiberti02@gmail.com'], (err, pending) => {
      if (err) {
        console.error('❌ Error checking pending:', err);
      } else if (pending) {
        console.log('📋 Found in pending registrations:');
        console.log('   Name:', pending.name);
        console.log('   Email:', pending.email);
        console.log('   Created:', pending.created_at);
        console.log('\n🔧 User needs to complete registration verification');
      } else {
        console.log('❌ No pending registration found either');
      }
      db.close();
    });
  }
});
