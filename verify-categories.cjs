const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n📊 FINAL CATEGORY DISTRIBUTION:\n');
console.log('═'.repeat(60));

db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }
  
  let total = 0;
  rows.forEach(r => {
    console.log(`  ${r.category.padEnd(25)} : ${String(r.count).padStart(4)} products`);
    total += r.count;
  });
  
  console.log('═'.repeat(60));
  console.log(`  TOTAL${' '.repeat(20)}: ${String(total).padStart(4)} products\n`);
  
  db.close();
});
