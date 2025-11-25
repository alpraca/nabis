const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.all('SELECT COUNT(*) as total FROM products', (err, rows) => {
  console.log('\n✅ DATABASE VERIFICATION\n');
  console.log('═══════════════════════════════════════');
  console.log(`  Total products: ${rows[0].total}`);
  
  db.all('SELECT COUNT(*) as total FROM product_images', (err, rows) => {
    console.log(`  Total images: ${rows[0].total}`);
    
    db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
      console.log('\n📊 Categories:');
      rows.forEach(r => console.log(`  ${r.category}: ${r.count} products`));
      
      db.all('SELECT brand, COUNT(*) as count FROM products GROUP BY brand ORDER BY count DESC LIMIT 15', (err, rows) => {
        console.log('\n🏷️  Top Brands:');
        rows.forEach(r => console.log(`  ${r.brand}: ${r.count} products`));
        
        db.all('SELECT name, price, brand, category FROM products ORDER BY RANDOM() LIMIT 5', (err, rows) => {
          console.log('\n📦 Sample Products:');
          rows.forEach((r, i) => {
            console.log(`\n  ${i+1}. ${r.name}`);
            console.log(`     Brand: ${r.brand}`);
            console.log(`     Category: ${r.category}`);
            console.log(`     Price: ${r.price.toFixed(2)}L`);
          });
          
          console.log('\n═══════════════════════════════════════\n');
          db.close();
        });
      });
    });
  });
});
