const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n📊 RAPORTI FINAL I NËNKATEGORIVE ME PAK PRODUKTE:\n');
console.log('═'.repeat(80));

db.all(`
  SELECT category, subcategory, COUNT(*) as count
  FROM products
  GROUP BY category, subcategory
  HAVING count <= 5
  ORDER BY count ASC, category, subcategory
`, (err, rows) => {
  if (err) {
    console.error('Gabim:', err.message);
    db.close();
    return;
  }

  const emptyCategories = rows.filter(r => r.count === 0);
  const sparse = rows.filter(r => r.count > 0 && r.count <= 5);

  if (emptyCategories.length > 0) {
    console.log('\n❌ NËNKATEGORI PA ASNJË PRODUKT:\n');
    emptyCategories.forEach(row => {
      console.log(`   ${row.category}/${row.subcategory}: ${row.count} produkte`);
    });
  } else {
    console.log('\n✅ NUK KA NËNKATEGORI PA PRODUKTE\n');
  }

  console.log('\n📉 NËNKATEGORI ME 1-5 PRODUKTE:\n');
  sparse.forEach(row => {
    const emoji = row.count === 1 ? '⚠️ ' : row.count === 2 ? '📦' : '📦';
    console.log(`   ${emoji} ${row.category}/${row.subcategory}: ${row.count} produkt${row.count > 1 ? 'e' : ''}`);
  });

  console.log('\n' + '═'.repeat(80));
  console.log(`\n📊 TOTALI: ${sparse.length} nënkategori me pak produkte\n`);

  // Listoni disa që duhet të mbushen me produkte të reja
  console.log('\n💡 SUGJERIME:');
  console.log('─'.repeat(80));
  console.log('\nNënkategorit që duhet të mbushen me produkte të reja:');
  console.log('   • Proteinat (0) - shtoni whey protein, protein bars, BCAA, amino acids');
  console.log('   • Bioscalin (1) - shtoni më shumë produkte Bioscalin për flokë');
  console.log('   • Anti Kallo (1) - shtoni produkte kundër kallove për kokë');
  console.log('   • Kontrollimi i peshës (1) - shtoni produkte për dietë dhe humbje peshe');
  console.log('   • Omega-3 dhe DHA (2) - shtoni më shumë suplement vaji peshku');
  console.log('\n');

  db.close();
});
