const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database.sqlite');

console.log('📋 Tables in database:');
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
  if (err) {
    console.error('Error fetching tables:', err);
    return;
  }
  
  console.table(rows);
  
  if (rows.some(row => row.name === 'users')) {
    console.log('\n📋 Current users:');
    db.all('SELECT id, name, email, role, email_verified FROM users', (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return;
      }
      
      console.table(rows);
      
      // Find users to keep
      const usersToKeep = rows.filter(user => 
        user.role === 'admin' || user.email === 'amuratiberti02@gmail.com'
      );
      
      console.log('\n🔒 Users to keep:');
      console.table(usersToKeep);
      
      // Find users to delete
      const usersToDelete = rows.filter(user => 
        user.role !== 'admin' && user.email !== 'amuratiberti02@gmail.com'
      );
      
      if (usersToDelete.length === 0) {
        console.log('\n✅ No users to delete');
        db.close();
        return;
      }
      
      console.log('\n🗑️ Users to delete:');
      console.table(usersToDelete);
      
      // Delete users
      const deleteIds = usersToDelete.map(user => user.id);
      const placeholders = deleteIds.map(() => '?').join(',');
      
      db.run(`DELETE FROM users WHERE id IN (${placeholders})`, deleteIds, function(err) {
        if (err) {
          console.error('Error deleting users:', err);
        } else {
          console.log(`\n✅ Deleted ${this.changes} users`);
        }
        
        // Also clean pending registrations
        db.run('DELETE FROM pending_registrations', (err) => {
          if (err) {
            console.error('Error cleaning pending registrations:', err);
          } else {
            console.log('✅ Cleaned pending registrations');
          }
          
          // Show final state
          console.log('\n📋 Final users:');
          db.all('SELECT id, name, email, role, email_verified FROM users', (err, rows) => {
            if (err) {
              console.error('Error fetching final users:', err);
            } else {
              console.table(rows);
            }
            db.close();
          });
        });
      });
    });
  } else {
    console.log('❌ No users table found');
    db.close();
  }
});
