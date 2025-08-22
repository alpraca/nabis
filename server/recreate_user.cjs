const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.sqlite');

// Create the user back
const email = 'muratiberti02@gmail.com';
const name = 'robert murati';
const password = 'password123'; // You can change this
const role = 'user';

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  const query = `
    INSERT INTO users (name, email, password, role, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  db.run(query, [name, email, hashedPassword, role], function(err) {
    if (err) {
      console.error('Error creating user:', err);
    } else {
      console.log(`✅ Created user: ${name} (${email})`);
      console.log(`🔑 Password: ${password}`);
      console.log(`🆔 User ID: ${this.lastID}`);
    }

    // Show final users
    console.log('\n📋 Final users:');
    db.all('SELECT id, name, email, role, email_verified FROM users', (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
      } else {
        console.table(rows);
      }
      db.close();
    });
  });
});
