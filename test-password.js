const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./server/database.sqlite');

db.get('SELECT * FROM users WHERE email = ?', ['admin@nabisfarmaci.al'], async (err, user) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  if (!user) {
    console.log('User not found');
    db.close();
    return;
  }
  
  console.log('Testing password: Admin123!');
  
  try {
    const isValid = await bcrypt.compare('Admin123!', user.password);
    console.log('Admin123!:', isValid ? 'CORRECT ✅' : 'Wrong ❌');
  } catch (error) {
    console.log('Error testing password:', error.message);
  }
  
  db.close();
});
