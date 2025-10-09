const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Po përshtaten produktet me subcategories-it...');

// Mapping për të përshatshëm produktet me subcategory sipas brand-eve dhe keywords
const subcategoryMappings = [
  // Dermokozmetikë subcategories
  { brand: 'La Roche Posay', category: 'Dermokozmetikë', subcategory: 'fytyre' },
  { brand: 'Vichy', category: 'Dermokozmetikë', subcategory: 'fytyre' },
  { brand: 'A-Derma', category: 'Dermokozmetikë', subcategory: 'fytyre' },
  { brand: 'Avene', category: 'Dermokozmetikë', subcategory: 'fytyre' },
  { brand: 'Rilastil', category: 'Dermokozmetikë', subcategory: 'fytyre' },
  { brand: 'Noreva', category: 'Dermokozmetikë', subcategory: 'fytyre' },
  { brand: 'Korff', category: 'Dermokozmetikë', subcategory: 'fytyre' },
  
  // Flokët
  { brand: 'Ducray', category: 'Dermokozmetikë', subcategory: 'floket' },
  { brand: 'Klorane', category: 'Dermokozmetikë', subcategory: 'floket' },
  { brand: 'Phyto', category: 'Dermokozmetikë', subcategory: 'floket' },
  
  // Trupi  
  { brand: 'Nuxe', category: 'Dermokozmetikë', subcategory: 'trupi' },
  { brand: 'Lierac', category: 'Dermokozmetikë', subcategory: 'trupi' },
  
  // SPF (mbrojtje diellore)
  { nameContains: 'SPF', category: 'Dermokozmetikë', subcategory: 'spf' },
  { nameContains: 'Sun', category: 'Dermokozmetikë', subcategory: 'spf' },
  { nameContains: 'Soleil', category: 'Dermokozmetikë', subcategory: 'spf' },
  
  // Anti-aging
  { nameContains: 'Anti-age', category: 'Dermokozmetikë', subcategory: 'anti-aging' },
  { nameContains: 'Lift', category: 'Dermokozmetikë', subcategory: 'anti-aging' },
  { nameContains: 'Wrinkle', category: 'Dermokozmetikë', subcategory: 'anti-aging' },
  { brand: 'Teoxane', category: 'Dermokozmetikë', subcategory: 'anti-aging' },
  
  // Akne
  { nameContains: 'Acne', category: 'Dermokozmetikë', subcategory: 'akne' },
  { nameContains: 'Effaclar', category: 'Dermokozmetikë', subcategory: 'akne' },
  { nameContains: 'Normaderm', category: 'Dermokozmetikë', subcategory: 'akne' },
  { nameContains: 'Cleanance', category: 'Dermokozmetikë', subcategory: 'akne' },
  
  // Suplemente subcategories  
  { brand: 'Vitabiotics', category: 'Suplemente', subcategory: 'multivitamina' },
  { brand: 'Solgar', category: 'Suplemente', subcategory: 'multivitamina' },
  { brand: 'Now', category: 'Suplemente', subcategory: 'multivitamina' },
  { brand: 'Doppelherz', category: 'Suplemente', subcategory: 'multivitamina' },
  
  { nameContains: 'Vitamin D', category: 'Suplemente', subcategory: 'vitamina-d' },
  { nameContains: 'Vitamin C', category: 'Suplemente', subcategory: 'vitamina-c' },
  { nameContains: 'Omega', category: 'Suplemente', subcategory: 'omega-3' },
  { nameContains: 'Magnesium', category: 'Suplemente', subcategory: 'magneziu' },
  { nameContains: 'Calcium', category: 'Suplemente', subcategory: 'kalsium' },
  { nameContains: 'Iron', category: 'Suplemente', subcategory: 'hekur' },
  
  // Mama dhe Bebat subcategories
  { nameContains: 'Pregnacare', category: 'Mama dhe Bebat', subcategory: 'vitamina-shtatzeni' },
  { nameContains: 'Conception', category: 'Mama dhe Bebat', subcategory: 'vitamina-shtatzeni' },
  { nameContains: 'Maternity', category: 'Mama dhe Bebat', subcategory: 'vitamina-shtatzeni' },
  
  { brand: 'Mustela', category: 'Mama dhe Bebat', subcategory: 'kujdes-bebe' },
  { nameContains: 'Baby', category: 'Mama dhe Bebat', subcategory: 'kujdes-bebe' },
  { nameContains: 'Bebe', category: 'Mama dhe Bebat', subcategory: 'kujdes-bebe' },
  
  { brand: 'HiPP', category: 'Mama dhe Bebat', subcategory: 'ushqim-bebe' },
  { brand: 'Holle', category: 'Mama dhe Bebat', subcategory: 'ushqim-bebe' },
  
  { nameContains: 'Kids', category: 'Mama dhe Bebat', subcategory: 'vitamina-femije' },
  { nameContains: 'Junior', category: 'Mama dhe Bebat', subcategory: 'vitamina-femije' },
  { nameContains: 'Children', category: 'Mama dhe Bebat', subcategory: 'vitamina-femije' },
  
  { brand: 'Pampers', category: 'Mama dhe Bebat', subcategory: 'higjiene-femije' },
  { brand: 'Pingo', category: 'Mama dhe Bebat', subcategory: 'higjiene-femije' },
  
  { brand: 'Dr. Brown', category: 'Mama dhe Bebat', subcategory: 'aksesor-bebe' },
  
  // Farmaci subcategories
  { brand: 'Omron', category: 'Farmaci', subcategory: 'aparat-mjeksore' },
  { brand: 'PIC', category: 'Farmaci', subcategory: 'aparat-mjeksore' },
  { brand: 'iHealth', category: 'Farmaci', subcategory: 'aparat-mjeksore' },
  { brand: 'Medel', category: 'Farmaci', subcategory: 'aparat-mjeksore' },
  
  // Higjena subcategories
  { brand: 'Splat', category: 'Higjena', subcategory: 'higjiene-orale' },
  { nameContains: 'Toothpaste', category: 'Higjena', subcategory: 'higjiene-orale' },
  { nameContains: 'Dhëmb', category: 'Higjena', subcategory: 'higjiene-orale' },
  
  { brand: 'Durex', category: 'Higjena', subcategory: 'higjiene-personale' },
  { brand: 'Natracare', category: 'Higjena', subcategory: 'higjiene-personale' },
  
  { nameContains: 'Deodorant', category: 'Higjena', subcategory: 'deodorante' },
  { nameContains: 'Anti-perspirant', category: 'Higjena', subcategory: 'deodorante' },
  
  { nameContains: 'Shampoo', category: 'Higjena', subcategory: 'shampo-balsam' },
  { nameContains: 'Shampooing', category: 'Higjena', subcategory: 'shampo-balsam' },
  { nameContains: 'Conditioner', category: 'Higjena', subcategory: 'shampo-balsam' },
];

db.serialize(() => {
  let completed = 0;
  const total = subcategoryMappings.length;
  
  subcategoryMappings.forEach((mapping, index) => {
    let query;
    let params;
    
    if (mapping.brand) {
      query = `UPDATE products SET subcategory = ? WHERE LOWER(brand) = ? AND category = ?`;
      params = [mapping.subcategory, mapping.brand.toLowerCase(), mapping.category];
    } else if (mapping.nameContains) {
      query = `UPDATE products SET subcategory = ? WHERE LOWER(name) LIKE ? AND category = ?`;
      params = [mapping.subcategory, `%${mapping.nameContains.toLowerCase()}%`, mapping.category];
    }
    
    db.run(query, params, function(err) {
      completed++;
      
      if (err) {
        console.error(`❌ Gabim në ${mapping.brand || mapping.nameContains}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✅ ${mapping.brand || mapping.nameContains} → ${mapping.category}/${mapping.subcategory} (${this.changes} produkte)`);
      }
      
      if (completed === total) {
        console.log('\n📊 Po llogariten statistikat e subcategory...');
        
        // Statistikat e subcategorizimit
        db.all(`
          SELECT category, subcategory, COUNT(*) as count 
          FROM products 
          WHERE category IS NOT NULL AND subcategory IS NOT NULL
          GROUP BY category, subcategory 
          ORDER BY category, count DESC
        `, (err, rows) => {
          if (err) {
            console.error('Gabim në statistika:', err);
          } else {
            console.log('\n🎯 Subcategoritë e përditësuara:');
            let currentCategory = '';
            rows.forEach(row => {
              if (row.category !== currentCategory) {
                console.log(`\n📁 ${row.category}:`);
                currentCategory = row.category;
              }
              console.log(`  - ${row.subcategory}: ${row.count} produkte`);
            });
          }
          
          console.log('\n✅ Subcategorizimi i produkteve është kompletuar!');
          console.log('🌐 Tani navbar-i duhet të shfaqë produktet e duhura për çdo kategori dhe subcategori.');
          db.close();
        });
      }
    });
  });
});