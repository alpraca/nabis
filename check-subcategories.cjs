const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 DUKE KONTROLLUAR NËNKATEGORITE:\n');
console.log('═'.repeat(80));

// Check all category/subcategory combinations
db.all(`
  SELECT category, subcategory, COUNT(*) as count
  FROM products
  GROUP BY category, subcategory
  ORDER BY category, count DESC
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    db.close();
    return;
  }
  
  let currentCategory = '';
  rows.forEach(row => {
    if (row.category !== currentCategory) {
      currentCategory = row.category;
      console.log(`\n📁 ${currentCategory.toUpperCase()}`);
      console.log('─'.repeat(80));
    }
    const subcat = row.subcategory || '(NULL - pa nënkategori)';
    console.log(`   ${subcat.padEnd(50)} : ${row.count} produkte`);
  });
  
  // Check specific problematic areas
  console.log('\n\n🔴 PROBLEME TË IDENTIFIKUARA:\n');
  console.log('═'.repeat(80));
  
  // Check protein products
  db.all(`SELECT name, brand, category, subcategory FROM products WHERE name LIKE '%protein%' OR name LIKE '%proteine%' LIMIT 10`, (err, proteins) => {
    console.log('\n💪 PRODUKTET PROTEIN (duhet në suplemente/Proteinat):');
    proteins.forEach(p => console.log(`   [${p.category}/${p.subcategory || 'NULL'}] ${p.brand} - ${p.name.substring(0, 60)}`));
    
    // Check diapers
    db.all(`SELECT name, brand, category, subcategory FROM products WHERE name LIKE '%diaper%' OR name LIKE '%pamper%' OR name LIKE '%pannolin%' OR brand LIKE '%Bambo%' LIMIT 10`, (err, diapers) => {
      console.log('\n🍼 PELENAT (duhet në mama-dhe-bebat/Pelenat):');
      diapers.forEach(p => console.log(`   [${p.category}/${p.subcategory || 'NULL'}] ${p.brand} - ${p.name.substring(0, 60)}`));
      
      // Check maternity products
      db.all(`SELECT name, brand, category, subcategory FROM products WHERE name LIKE '%maternity%' OR name LIKE '%pregnancy%' OR name LIKE '%gravid%' OR name LIKE '%shtatzani%' LIMIT 10`, (err, maternity) => {
        console.log('\n🤰 PRODUKTET PËR SHTATZANI (duhet në mama-dhe-bebat/Kujdesi për Nënën):');
        maternity.forEach(p => console.log(`   [${p.category}/${p.subcategory || 'NULL'}] ${p.brand} - ${p.name.substring(0, 60)}`));
        
        db.close();
      });
    });
  });
});
