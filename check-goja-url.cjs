const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 ÇKA PO SHFAQET NË "/kategori/goja":\n');
console.log('Duke kontrolluar të gjitha produktet që mund të shfaqen në këtë URL...\n');

// Check what the URL /kategori/goja would show
// It could be matching by category OR subcategory

db.all(`
  SELECT name, brand, category, subcategory
  FROM products
  WHERE LOWER(category) = 'goja' OR LOWER(subcategory) = 'goja'
  ORDER BY category, subcategory, brand
`, [], (err, products) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }
  
  console.log(`Gjetur ${products.length} produkte që përputhen me "goja":\n`);
  console.log('═'.repeat(90));
  
  products.forEach(p => {
    console.log(`[${p.category}/${p.subcategory || 'NULL'}] ${p.brand} - ${p.name.substring(0, 65)}`);
  });
  
  console.log('\n═'.repeat(90));
  
  // Now check the exact products from the screenshot
  console.log('\n🔎 PRODUKTET NGA FOTO:\n');
  
  const photoProducts = [
    'Dr. Brown%Toothbrush',
    'Easy%Piercing%Mouthwash',
    'Klorane%Floral%Water',
    'Now%B-12%Complex',
    'Now%Oralbiotic',
    'Now%Xyli%White%Cinnafresh',
    'Now%Xyli%White%Kids',
    'Now%Xyli%White%Platinum'
  ];
  
  let checked = 0;
  photoProducts.forEach(prod => {
    db.all(`SELECT name, brand, category, subcategory FROM products WHERE name LIKE ?`, [prod], (err, results) => {
      if (results && results.length > 0) {
        results.forEach(r => {
          console.log(`✓ ${r.name.substring(0, 45).padEnd(45)} → [${r.category}/${r.subcategory}]`);
        });
      }
      checked++;
      if (checked === photoProducts.length) {
        db.close();
      }
    });
  });
});
