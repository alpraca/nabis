const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/database.sqlite');

db.run('DELETE FROM orders WHERE customer_name IS NULL OR customer_name = ""', (err) => {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('✅ Cleaned invalid orders');
  }
  db.close();
});
