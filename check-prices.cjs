const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 Checking prices in database...\n');

db.all(`SELECT name, price, created_at FROM products WHERE created_at LIKE '2025-11-23%' LIMIT 5`, (err, rows) => {
  console.log('Scraped products (imported Nov 23):');
  rows.forEach(r => console.log(`  ${r.name.substring(0, 50)}... - ${r.price}L`));
  
  db.all(`SELECT name, price, created_at FROM products WHERE created_at NOT LIKE '2025-11-23%' LIMIT 5`, (err, rows) => {
    console.log('\nOriginal products:');
    rows.forEach(r => console.log(`  ${r.name.substring(0, 50)}... - ${r.price}L`));
    
    // Check if we need to fix scraped product prices
    db.all(`SELECT COUNT(*) as count, AVG(price) as avg_price FROM products WHERE created_at LIKE '2025-11-23%' AND price < 100`, (err, rows) => {
      console.log(`\n📊 Scraped products with price < 100: ${rows[0].count}`);
      console.log(`   Average price: ${rows[0].avg_price.toFixed(2)}L`);
      
      console.log('\n⚠️  The scraped products have incorrect prices (too low).');
      console.log('   Prices need to be multiplied by 1000 to match Albanian Lek format.\n');
      
      db.close();
    });
  });
});
