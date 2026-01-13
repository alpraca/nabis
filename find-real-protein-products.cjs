const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 DUKE KËRKUAR PRODUKTE TË VËRTETA PROTEINE:\n');

// Kërkojmë produkte që kanë fjalë që tregojnë se janë vërtet proteine/suplementedhe jo krem
const queries = [
  { label: 'Whey Protein', pattern: '%whey%protein%' },
  { label: 'Protein Powder', pattern: '%protein%powder%' },
  { label: 'Protein Bar', pattern: '%protein%bar%' },
  { label: 'Amino Acids', pattern: '%amino%acid%' },
  { label: 'BCAA', pattern: '%bcaa%' },
  { label: 'Creatine', pattern: '%creatine%' },
  { label: 'Collagen Suplement (oral)', pattern: '%collagen%' },
];

db.serialize(() => {
  queries.forEach(({ label, pattern }) => {
    db.all(`
      SELECT id, name, brand, category, subcategory
      FROM products
      WHERE LOWER(name) LIKE LOWER(?)
        AND LOWER(name) NOT LIKE '%cream%'
        AND LOWER(name) NOT LIKE '%krem%'
        AND LOWER(name) NOT LIKE '%lotion%'
        AND LOWER(name) NOT LIKE '%serum%'
        AND LOWER(name) NOT LIKE '%shampoo%'
        AND LOWER(name) NOT LIKE '%conditioner%'
        AND LOWER(name) NOT LIKE '%wash%'
        AND LOWER(name) NOT LIKE '%gel%face%'
        AND LOWER(name) NOT LIKE '%mask%'
        AND category != 'suplemente'
      ORDER BY name
    `, [pattern], (err, rows) => {
      if (err) {
        console.error(`Gabim për ${label}:`, err.message);
      } else if (rows.length > 0) {
        console.log(`\n📦 ${label} (${rows.length} produkte):`);
        console.log('─'.repeat(80));
        rows.forEach(row => {
          console.log(`   [${row.category}/${row.subcategory}]`);
          console.log(`   ${row.brand} - ${row.name}\n`);
        });
      }
    });
  });

  // Gjithashtu, shikoni çfarë ka në nënkategorinë Proteinat aktualisht
  setTimeout(() => {
    console.log('\n' + '═'.repeat(80));
    console.log('GJENDJA E NËNKATEGORISË "PROTEINAT":');
    console.log('═'.repeat(80));
    db.all(`
      SELECT name, brand, category, subcategory
      FROM products
      WHERE subcategory = 'Proteinat'
      ORDER BY name
    `, (err, rows) => {
      if (err) {
        console.error('Gabim:', err.message);
      } else {
        console.log(`\n📊 Total: ${rows.length} produkt(e)\n`);
        rows.forEach(row => {
          console.log(`   ${row.brand} - ${row.name}`);
          console.log(`   [${row.category}/${row.subcategory}]\n`);
        });
      }
      db.close();
    });
  }, 1000);
});
