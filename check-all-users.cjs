const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/database.sqlite');

console.log('🔍 Checking user accounts and pending registrations...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Check users
db.all('SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY created_at DESC', (err, users) => {
  if (err) {
    console.error('❌ Error fetching users:', err);
  } else {
    console.log(`\n📋 REGISTERED USERS (${users.length} total):\n`);
    
    if (users.length === 0) {
      console.log('   No registered users found');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('   ---');
      });

      // Summary
      const adminCount = users.filter(u => u.role === 'admin').length;
      const userCount = users.filter(u => u.role === 'user').length;
      const verifiedCount = users.filter(u => u.email_verified === 1).length;

      console.log('\n📊 SUMMARY:');
      console.log(`   Total users: ${users.length}`);
      console.log(`   Admins: ${adminCount}`);
      console.log(`   Regular users: ${userCount}`);
      console.log(`   Verified: ${verifiedCount}`);
      console.log(`   Unverified: ${users.length - verifiedCount}`);
    }
  }

  // Check pending registrations
  db.all('SELECT email, name, created_at FROM pending_registrations ORDER BY created_at DESC', (err, pending) => {
    if (err) {
      console.error('❌ Error fetching pending registrations:', err);
    } else {
      console.log(`\n📋 PENDING REGISTRATIONS (${pending.length} total):\n`);
      
      if (pending.length === 0) {
        console.log('   No pending registrations');
      } else {
        pending.forEach((reg, index) => {
          console.log(`${index + 1}. ${reg.name} (${reg.email})`);
          console.log(`   Registered: ${reg.created_at}`);
          console.log('   ---');
        });
      }
    }

    db.close(() => {
      console.log('\n✅ Database check complete');
    });
  });
});
