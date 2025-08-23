const { db } = require('./server/config/database.cjs');

console.log('🔍 Checking admin user...');

// Check current admin user status
db.get('SELECT * FROM users WHERE email = ?', ['admin@nabisfarmaci.al'], (err, user) => {
  if (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }

  if (!user) {
    console.log('❌ Admin user not found');
    process.exit(1);
  }

  console.log('📋 Current admin user status:');
  console.log('  ID:', user.id);
  console.log('  Name:', user.name);
  console.log('  Email:', user.email);
  console.log('  Role:', user.role);
  console.log('  Email verified:', user.email_verified);

  if (!user.email_verified) {
    console.log('🔧 Fixing admin user - setting email_verified to 1...');
    
    db.run('UPDATE users SET email_verified = 1 WHERE email = ?', ['admin@nabisfarmaci.al'], function(err) {
      if (err) {
        console.error('❌ Error updating admin user:', err);
      } else {
        console.log('✅ Admin user email verification status updated successfully!');
        console.log('✅ Admin user can now log in and access the admin panel');
      }
      db.close();
    });
  } else {
    console.log('✅ Admin user is already verified and ready to use');
    db.close();
  }
});
