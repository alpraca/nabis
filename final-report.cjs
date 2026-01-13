const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🎯 RAPORT FINAL - NËNKATEGORIT\n');
console.log('═'.repeat(90));

db.all(`
  SELECT category, subcategory, COUNT(*) as count
  FROM products
  WHERE subcategory IS NOT NULL
  GROUP BY category, subcategory
  ORDER BY category, count DESC
`, [], (err, rows) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }
  
  const categories = {};
  let totalWithSubcat = 0;
  
  rows.forEach(row => {
    if (!categories[row.category]) {
      categories[row.category] = { total: 0, subcats: [] };
    }
    categories[row.category].subcats.push({ name: row.subcategory, count: row.count });
    categories[row.category].total += row.count;
    totalWithSubcat += row.count;
  });
  
  // Display summary
  Object.keys(categories).sort().forEach(cat => {
    const catData = categories[cat];
    console.log(`\n📁 ${cat.toUpperCase()} (${catData.total} produkte me nënkategori)`);
    console.log('─'.repeat(90));
    
    // Show top 10 subcategories
    catData.subcats.slice(0, 10).forEach(sub => {
      const bar = '█'.repeat(Math.ceil(sub.count / 5));
      console.log(`   ${sub.name.padEnd(45)} : ${String(sub.count).padStart(3)} ${bar}`);
    });
    
    if (catData.subcats.length > 10) {
      console.log(`   ... dhe ${catData.subcats.length - 10} nënkategori të tjera`);
    }
  });
  
  // Check products without subcategory
  db.get('SELECT COUNT(*) as count FROM products WHERE subcategory IS NULL', (err, result) => {
    console.log('\n' + '═'.repeat(90));
    console.log(`\n📊 STATISTIKA:`);
    console.log(`   ✅ Me nënkategori: ${totalWithSubcat} produkte`);
    console.log(`   ❌ Pa nënkategori: ${result.count} produkte`);
    console.log(`   📦 TOTAL: ${totalWithSubcat + result.count} produkte`);
    
    console.log('\n✅ Raporti u krye!\n');
    db.close();
  });
});
