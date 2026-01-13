const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 DUKE KËRKUAR PRODUKTET E GABUARA:\n');

const searchTerms = [
  { term: '%Klorane%Floral%', expected: 'dermokozmetikë/Fytyre' },
  { term: '%B-12%Complex%', expected: 'suplemente/Vitaminat dhe Mineralet' },
  { term: '%Oralbiotic%', expected: 'suplemente/Probiotic & Digestim' },
  { term: '%makeup%remover%', expected: 'dermokozmetikë/Fytyre' },
  { term: '%make%up%remove%', expected: 'dermokozmetikë/Fytyre' }
];

let checked = 0;
const allFixes = [];

searchTerms.forEach(search => {
  db.all(`SELECT id, name, brand, category, subcategory FROM products WHERE name LIKE ? COLLATE NOCASE`, 
    [search.term], 
    (err, products) => {
      if (products && products.length > 0) {
        console.log(`\n🔎 Gjetur për "${search.term}":`);
        products.forEach(p => {
          const current = `${p.category}/${p.subcategory}`;
          console.log(`   [${current}] ${p.brand} - ${p.name}`);
          
          if (!current.includes(search.expected.split('/')[1])) {
            const [newCat, newSubcat] = search.expected.split('/');
            allFixes.push({
              id: p.id,
              name: p.name,
              brand: p.brand,
              newCategory: newCat,
              newSubcat: newSubcat,
              oldCategory: p.category,
              oldSubcat: p.subcategory
            });
            console.log(`   ❌ Duhet: ${search.expected}`);
          } else {
            console.log(`   ✅ Është në vendin e saktë`);
          }
        });
      }
      
      checked++;
      if (checked === searchTerms.length) {
        if (allFixes.length === 0) {
          console.log('\n✅ Nuk u gjetën produkte të gabuara!');
          db.close();
          return;
        }
        
        console.log(`\n\n🔧 DUKE RREGULLUAR ${allFixes.length} PRODUKTE...\n`);
        
        let fixed = 0;
        const stmt = db.prepare('UPDATE products SET category = ?, subcategory = ? WHERE id = ?');
        
        allFixes.forEach(fix => {
          stmt.run([fix.newCategory, fix.newSubcat, fix.id], (err) => {
            if (err) {
              console.error(`❌ Gabim: ${err.message}`);
            } else {
              console.log(`✅ ${fix.brand} - ${fix.name.substring(0, 50)}`);
              console.log(`   ${fix.oldCategory}/${fix.oldSubcat} → ${fix.newCategory}/${fix.newSubcat}`);
            }
            
            fixed++;
            if (fixed === allFixes.length) {
              stmt.finalize();
              console.log(`\n🎉 U rregulluan ${allFixes.length} produkte!\n`);
              db.close();
            }
          });
        });
      }
  });
});
