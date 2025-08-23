const { db } = require('./server/config/database.cjs');

console.log('🔍 Checking all user accounts...');

// Get all users
db.all('SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY created_at DESC', (err, users) => {
  if (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('❌ No users found in database');
    db.close();
    return;
  }

  console.log(`📋 Found ${users.length} user account(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. User ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
    console.log(`   Created: ${user.created_at}`);
    console.log('   ---');
  });

  // Count by role
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;
  const verifiedCount = users.filter(u => u.email_verified === 1).length;

  console.log('\n📊 Summary:');
  console.log(`   Total users: ${users.length}`);
  console.log(`   Admins: ${adminCount}`);
  console.log(`   Regular users: ${userCount}`);
  console.log(`   Verified accounts: ${verifiedCount}`);
  console.log(`   Unverified accounts: ${users.length - verifiedCount}`);

  db.close();
});
