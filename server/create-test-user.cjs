const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

(async ()=>{
  try{
    const email = process.env.TEST_EMAIL || 'anip2955@gmail.com';
    const passwordPlain = process.env.TEST_PASSWORD || 'Test1234';
    const name = process.env.TEST_NAME || 'Dev Tester';

    const hashed = await bcrypt.hash(passwordPlain, 12);

    db.run('DELETE FROM users WHERE email = ?', [email], (delErr)=>{
      if(delErr) console.error('delete err', delErr.message);

      db.run(`INSERT INTO users (name, email, password, role, email_verified, created_at) VALUES (?, ?, ?, 'user', 1, datetime('now'))`, [name, email, hashed], function(err){
        if(err){
          console.error('Error inserting test user:', err.message);
          process.exit(1);
        }
        console.log('Test user created:', email, 'id:', this.lastID);
        process.exit(0);
      });
    });
  }catch(e){
    console.error('Fatal', e.message);
    process.exit(2);
  }
})();