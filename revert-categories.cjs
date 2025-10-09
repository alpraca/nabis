const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Po rikthehen kategoritë origjinale...');

// Rikthej kategoritë në gjendjen origjinale
const categoryRevert = [
  { newCategory: 'dermokozmetike', oldCategory: 'Dermokozmetikë' },
  { newCategory: 'vitamina-suplemente', oldCategory: 'Suplemente' },
  { newCategory: 'farmaci-mjekesi', oldCategory: 'Farmaci' }
];

db.serialize(() => {
  let completed = 0;
  const total = categoryRevert.length;
  
  categoryRevert.forEach((mapping, index) => {
    const query = `UPDATE products SET category = ? WHERE category = ?`;
    
    db.run(query, [mapping.oldCategory, mapping.newCategory], function(err) {
      completed++;
      
      if (err) {
        console.error(`❌ Gabim në ${mapping.newCategory}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✅ ${mapping.newCategory} → ${mapping.oldCategory} (${this.changes} produkte)`);
      }
      
      if (completed === total) {
        console.log('\n📊 Po llogariten statistikat finale...');
        
        // Statistikat e kategorizimit
        db.all(`
          SELECT category, COUNT(*) as count 
          FROM products 
          WHERE category IS NOT NULL AND category != ''
          GROUP BY category 
          ORDER BY count DESC
        `, (err, rows) => {
          if (err) {
            console.error('Gabim në statistika:', err);
          } else {
            console.log('\n🎯 Kategoritë e rikthyera:');
            rows.forEach(row => {
              console.log(`- ${row.category}: ${row.count} produkte`);
            });
          }
          
          console.log('\n✅ Kategoritë u rikthyen në gjendjen origjinale!');
          db.close();
        });
      }
    });
  });
});