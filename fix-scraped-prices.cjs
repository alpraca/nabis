const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔧 Fixing scraped product prices...\n');

// Fix prices for scraped products (multiply by 1000)
db.run(`
  UPDATE products 
  SET price = ROUND(price * 1000, 2)
  WHERE created_at LIKE '2025-11-23%' 
  AND price < 100
`, function(err) {
  if (err) {
    console.error('Error updating prices:', err.message);
    db.close();
    return;
  }
  
  console.log(`✓ Updated ${this.changes} product prices\n`);
  
  // Verify the fix
  db.all(`SELECT name, price FROM products WHERE created_at LIKE '2025-11-23%' LIMIT 5`, (err, rows) => {
    console.log('Sample fixed prices:');
    rows.forEach(r => console.log(`  ${r.name.substring(0, 50)}... - ${r.price}L`));
    
    db.all(`SELECT COUNT(*) as count, MIN(price) as min, MAX(price) as max, AVG(price) as avg FROM products WHERE created_at LIKE '2025-11-23%'`, (err, stats) => {
      console.log('\n📊 Price statistics for scraped products:');
      console.log(`   Count: ${stats[0].count}`);
      console.log(`   Min: ${stats[0].min}L`);
      console.log(`   Max: ${stats[0].max}L`);
      console.log(`   Average: ${stats[0].avg.toFixed(2)}L\n`);
      
      console.log('✅ Price fix complete!\n');
      db.close();
    });
  });
});
