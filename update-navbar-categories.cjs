const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Konektimi me database
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Po përditësohen kategoritë e produkteve për navbar...');

// Mapping i brendshëm për të lidhur produkte me kategoritë e navbar-it
const categoryMappings = [
  // Dermokozmetikë - La Roche Posay, Vichy, etc.
  { brand: 'La Roche Posay', category: 'fytyre' },
  { brand: 'Vichy', category: 'fytyre' },
  { brand: 'A-Derma', category: 'fytyre' },
  { brand: 'Rilastil', category: 'fytyre' },
  { brand: 'Noreva', category: 'fytyre' },
  { brand: 'Korff', category: 'fytyre' },
  
  // Flokët
  { brand: 'Ducray', category: 'floket' },
  { brand: 'Klorane', category: 'floket' },
  { brand: 'Phyto', category: 'floket' },
  
  // Trupi
  { brand: 'Nuxe', category: 'trupi' },
  { brand: 'Lierac', category: 'trupi' },
  
  // Anti-aging
  { nameContains: 'Anti-age', category: 'anti-aging' },
  { nameContains: 'Lift', category: 'anti-aging' },
  { nameContains: 'Wrinkle', category: 'anti-aging' },
  { nameContains: 'Collagen', category: 'anti-aging' },
  { brand: 'Teoxane', category: 'anti-aging' },
  { brand: 'Skincode', category: 'anti-aging' },
  
  // SPF
  { nameContains: 'SPF', category: 'spf' },
  { nameContains: 'Sun', category: 'spf' },
  { nameContains: 'Soleil', category: 'spf' },
  
  // Akne
  { nameContains: 'Acne', category: 'akne' },
  { nameContains: 'Effaclar', category: 'akne' },
  { nameContains: 'Normaderm', category: 'akne' },
  { nameContains: 'Sebum', category: 'akne' },
  
  // Vitamina & Suplemente
  { brand: 'Vitabiotics', category: 'multivitamina' },
  { brand: 'Solgar', category: 'multivitamina' },
  { brand: 'Now', category: 'multivitamina' },
  { brand: 'Doppelherz', category: 'multivitamina' },
  { brand: 'Olimp Labs', category: 'multivitamina' },
  
  // Vitamina specifike
  { nameContains: 'Vitamin D', category: 'vitamina-d' },
  { nameContains: 'Vitamin C', category: 'vitamina-c' },
  { nameContains: 'Omega', category: 'omega-3' },
  { nameContains: 'Magnesium', category: 'magneziu' },
  { nameContains: 'Calcium', category: 'kalsium' },
  { nameContains: 'Iron', category: 'hekur' },
  { nameContains: 'Hekur', category: 'hekur' },
  
  // Gratë Shtatzëna
  { nameContains: 'Pregnacare', category: 'vitamina-shtatzeni' },
  { nameContains: 'Conception', category: 'vitamina-shtatzeni' },
  { nameContains: 'Breastfeeding', category: 'vitamina-shtatzeni' },
  { nameContains: 'Maternity', category: 'vitamina-shtatzeni' },
  
  // Fëmijët dhe Bebet
  { brand: 'HiPP', category: 'ushqim-bebe' },
  { brand: 'Holle', category: 'ushqim-bebe' },
  { brand: 'Mustela', category: 'kujdes-bebe' },
  { brand: 'Pampers', category: 'higjiene-femije' },
  { brand: 'Pingo', category: 'higjiene-femije' },
  { brand: 'Dr. Brown', category: 'aksesor-bebe' },
  
  { nameContains: 'Baby', category: 'kujdes-bebe' },
  { nameContains: 'Bebe', category: 'kujdes-bebe' },
  { nameContains: 'Kids', category: 'vitamina-femije' },
  { nameContains: 'Junior', category: 'vitamina-femije' },
  { nameContains: 'Children', category: 'vitamina-femije' },
  
  // Farmaci & Mjekësi
  { brand: 'Omron', category: 'aparat-mjeksore' },
  { brand: 'PIC', category: 'aparat-mjeksore' },
  { brand: 'iHealth', category: 'aparat-mjeksore' },
  { brand: 'Medel', category: 'aparat-mjeksore' },
  { brand: 'Imetec', category: 'aparat-mjeksore' },
  { brand: 'Farmaci DAJA', category: 'otc' },
  
  // Higjienë dhe Kujdes
  { brand: 'Splat', category: 'higjiene-orale' },
  { nameContains: 'Toothpaste', category: 'higjiene-orale' },
  { nameContains: 'Dhëmb', category: 'higjiene-orale' },
  
  { brand: 'Durex', category: 'higjiene-personale' },
  { brand: 'Natracare', category: 'higjiene-personale' },
  
  { nameContains: 'Deodorant', category: 'deodorante' },
  { nameContains: 'Anti-perspirant', category: 'deodorante' },
  
  { nameContains: 'Shampoo', category: 'shampo-balsam' },
  { nameContains: 'Shampooing', category: 'shampo-balsam' },
  { nameContains: 'Conditioner', category: 'shampo-balsam' },
];

db.serialize(() => {
  let completed = 0;
  const total = categoryMappings.length;
  
  categoryMappings.forEach((mapping, index) => {
    let query;
    let params;
    
    if (mapping.brand) {
      query = `UPDATE products SET category = ? WHERE LOWER(brand) = ? AND (category IS NULL OR category = '' OR category = 'Uncategorized')`;
      params = [mapping.category, mapping.brand.toLowerCase()];
    } else if (mapping.nameContains) {
      query = `UPDATE products SET category = ? WHERE LOWER(name) LIKE ? AND (category IS NULL OR category = '' OR category = 'Uncategorized')`;
      params = [mapping.category, `%${mapping.nameContains.toLowerCase()}%`];
    }
    
    db.run(query, params, function(err) {
      completed++;
      
      if (err) {
        console.error(`❌ Gabim në ${mapping.brand || mapping.nameContains}:`, err.message);
      } else if (this.changes > 0) {
        console.log(`✅ ${mapping.brand || mapping.nameContains} → ${mapping.category} (${this.changes} produkte)`);
      }
      
      // Kur të gjitha janë përfunduar
      if (completed === total) {
        console.log('\n📊 Po llogariten statistikat finale...');
        
        // Statistikat e kategorizimit
        db.all(`
          SELECT category, COUNT(*) as count 
          FROM products 
          WHERE category IS NOT NULL AND category != '' AND category != 'Uncategorized'
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
          
          // Produktet pa kategori
          db.get(`SELECT COUNT(*) as count FROM products WHERE category IS NULL OR category = '' OR category = 'Uncategorized'`, (err, row) => {
            if (!err) {
              console.log(`\n⚠️  Produkte pa kategori: ${row.count}`);
            }
            
            console.log('\n✅ Kategorizimi i produkteve për navbar është kompletuar!');
            console.log('🌐 Tani kategoritë në navbar do të shfaqin produktet përkatëse.');
            db.close();
          });
        });
      }
    });
  });
});