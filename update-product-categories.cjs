const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Po përditësohen produktet me kategoritë e reja...');

// Mapping për të kaluar nga kategoritë e vjetra tek të rejat
const categoryMapping = [
  // Dermokozmetikë subcategories
  { oldCategory: 'Dermokozmetikë', subcategory: 'fytyre', newCategory: 'dermokozmetike' },
  { oldCategory: 'Dermokozmetikë', subcategory: 'floket', newCategory: 'dermokozmetike' },
  { oldCategory: 'Dermokozmetikë', subcategory: 'trupi', newCategory: 'dermokozmetike' },
  { oldCategory: 'Dermokozmetikë', subcategory: 'spf', newCategory: 'dermokozmetike' },
  { oldCategory: 'Dermokozmetikë', subcategory: 'anti-aging', newCategory: 'anti-aging' },
  { oldCategory: 'Dermokozmetikë', subcategory: 'akne', newCategory: 'akne' },
  { oldCategory: 'Dermokozmetikë', subcategory: 'makeup', newCategory: 'dermokozmetike' },
  
  // Suplemente
  { oldCategory: 'Suplemente', subcategory: 'multivitamina', newCategory: 'multivitamina' },
  { oldCategory: 'Suplemente', subcategory: 'vitamina-d', newCategory: 'vitamina-d' },
  { oldCategory: 'Suplemente', subcategory: 'vitamina-c', newCategory: 'vitamina-c' },
  { oldCategory: 'Suplemente', subcategory: 'omega-3', newCategory: 'omega-3' },
  { oldCategory: 'Suplemente', subcategory: 'magneziu', newCategory: 'magneziu' },
  { oldCategory: 'Suplemente', subcategory: 'kalsium', newCategory: 'kalsium' },
  { oldCategory: 'Suplemente', subcategory: 'hekur', newCategory: 'hekur' },
  { oldCategory: 'Suplemente', subcategory: 'suplemente', newCategory: 'vitamina-suplemente' },
  
  // Mama dhe Bebat
  { oldCategory: 'Mama dhe Bebat', subcategory: 'vitamina-shtatzeni', newCategory: 'vitamina-shtatzeni' },
  { oldCategory: 'Mama dhe Bebat', subcategory: 'kujdes-bebe', newCategory: 'kujdes-bebe' },
  { oldCategory: 'Mama dhe Bebat', subcategory: 'ushqim-bebe', newCategory: 'ushqim-bebe' },
  { oldCategory: 'Mama dhe Bebat', subcategory: 'vitamina-femije', newCategory: 'vitamina-femije' },
  { oldCategory: 'Mama dhe Bebat', subcategory: 'higjiene-femije', newCategory: 'higjiene-femije' },
  { oldCategory: 'Mama dhe Bebat', subcategory: 'aksesor-bebe', newCategory: 'aksesor-bebe' },
  
  // Farmaci
  { oldCategory: 'Farmaci', subcategory: 'otc', newCategory: 'farmaci-mjekesi' },
  { oldCategory: 'Farmaci', subcategory: 'aparat-mjeksore', newCategory: 'farmaci-mjekesi' },
  
  // Higjena
  { oldCategory: 'Higjena', subcategory: 'higjiene-orale', newCategory: 'higjiene-orale' },
  { oldCategory: 'Higjena', subcategory: 'higjiene-personale', newCategory: 'higjiene-personale' },
  { oldCategory: 'Higjena', subcategory: 'deodorante', newCategory: 'deodorante' },
  { oldCategory: 'Higjena', subcategory: 'shampo-balsam', newCategory: 'shampo-balsam' },
];

db.serialize(() => {
  let completed = 0;
  const total = categoryMapping.length;
  
  categoryMapping.forEach((mapping, index) => {
    const query = `
      UPDATE products 
      SET category = ? 
      WHERE category = ? AND subcategory = ?
    `;
    
    db.run(query, [mapping.newCategory, mapping.oldCategory, mapping.subcategory], function(err) {
      completed++;
      
      if (err) {
        console.error(`❌ Gabim në ${mapping.oldCategory}/${mapping.subcategory}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✅ ${mapping.oldCategory}/${mapping.subcategory} → ${mapping.newCategory} (${this.changes} produkte)`);
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
            console.log('\n🎯 Kategoritë e përditësuara:');
            rows.forEach(row => {
              console.log(`- ${row.category}: ${row.count} produkte`);
            });
          }
          
          console.log('\n✅ Produktet janë përditësuar me kategoritë e reja të navbar-it!');
          db.close();
        });
      }
    });
  });
});