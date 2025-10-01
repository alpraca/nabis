const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Konektimi me database
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Mapping i produkteve me kategoritë e reja bazuar në brand dhe emër
const productCategoryMapping = [
  // Vitamina & Suplemente
  { brand: 'Vitabiotics', category: 'multivitamina' },
  { brand: 'Solgar', category: 'multivitamina' },
  { brand: 'Now', category: 'multivitamina' },
  { brand: 'Doppelherz', category: 'multivitamina' },
  
  // Produktet për fëmijë dhe bebe
  { brand: 'HiPP', category: 'ushqim-bebe' },
  { brand: 'Holle', category: 'ushqim-bebe' },
  { brand: 'Mustela', category: 'kujdes-bebe' },
  { brand: 'Pampers', category: 'higjiene-femije' },
  { brand: 'Pingo', category: 'higjiene-femije' },
  { brand: 'Dr. Brown', category: 'aksesor-bebe' },
  
  // Dermokozmetikë
  { brand: 'La Roche Posay', category: 'fytyre' },
  { brand: 'Vichy', category: 'fytyre' },
  { brand: 'A-Derma', category: 'fytyre' },
  { brand: 'Ducray', category: 'floket' },
  { brand: 'Klorane', category: 'floket' },
  { brand: 'Phyto', category: 'floket' },
  { brand: 'Nuxe', category: 'trupi' },
  { brand: 'Lierac', category: 'anti-aging' },
  { brand: 'Korff', category: 'fytyre' },
  { brand: 'Rilastil', category: 'spf' },
  { brand: 'Noreva', category: 'akne' },
  { brand: 'Teoxane', category: 'anti-aging' },
  { brand: 'Skincode', category: 'anti-aging' },
  
  // Aparat mjekësore
  { brand: 'Omron', category: 'aparat-mjeksore' },
  { brand: 'PIC', category: 'aparat-mjeksore' },
  { brand: 'iHealth', category: 'aparat-mjeksore' },
  { brand: 'Medel', category: 'aparat-mjeksore' },
  { brand: 'Imetec', category: 'aparat-mjeksore' },
  
  // Higjienë
  { brand: 'Splat', category: 'higjiene-orale' },
  { brand: 'Now', category: 'higjiene-orale' }, // Për produktet XyliWhite
  
  // Kontracepsion dhe higjienë intime
  { brand: 'Durex', category: 'higjiene-personale' },
  { brand: 'Natracare', category: 'higjiene-personale' },
  
  // Produktet për gratë shtatzëna
  { brand: 'Vitabiotics', category: 'vitamina-shtatzeni' }, // Pregnacare serie
  
  // Farmaci vendor (Farmaci DAJA)
  { brand: 'Farmaci DAJA', category: 'otc' }
];

// Mapping specifik për emra produktesh
const specificProductMapping = [
  // Vitamina specifike
  { keyword: 'Vitamin D', category: 'vitamina-d' },
  { keyword: 'Vitamin C', category: 'vitamina-c' },
  { keyword: 'Omega', category: 'omega-3' },
  { keyword: 'Magnesium', category: 'magneziu' },
  { keyword: 'Calcium', category: 'kalsium' },
  { keyword: 'Iron', category: 'hekur' },
  { keyword: 'Hekur', category: 'hekur' },
  
  // Produktet për shtatzëni
  { keyword: 'Pregnacare', category: 'vitamina-shtatzeni' },
  { keyword: 'Conception', category: 'vitamina-shtatzeni' },
  { keyword: 'Breastfeeding', category: 'vitamina-shtatzeni' },
  
  // Produktet për fëmijë
  { keyword: 'Baby', category: 'kujdes-bebe' },
  { keyword: 'Bebe', category: 'kujdes-bebe' },
  { keyword: 'Kids', category: 'vitamina-femije' },
  { keyword: 'Junior', category: 'vitamina-femije' },
  { keyword: 'Children', category: 'vitamina-femije' },
  
  // SPF dhe mbrojtje diellore
  { keyword: 'SPF', category: 'spf' },
  { keyword: 'Sun', category: 'spf' },
  { keyword: 'Soleil', category: 'spf' },
  
  // Anti-aging
  { keyword: 'Anti-age', category: 'anti-aging' },
  { keyword: 'Lift', category: 'anti-aging' },
  { keyword: 'Wrinkle', category: 'anti-aging' },
  { keyword: 'Collagen', category: 'anti-aging' },
  
  // Akne
  { keyword: 'Acne', category: 'akne' },
  { keyword: 'Effaclar', category: 'akne' },
  { keyword: 'Normaderm', category: 'akne' },
  { keyword: 'Sebum', category: 'akne' },
  
  // Shampo dhe flokë
  { keyword: 'Shampoo', category: 'shampo-balsam' },
  { keyword: 'Shampooing', category: 'shampo-balsam' },
  { keyword: 'Conditioner', category: 'shampo-balsam' },
  { keyword: 'Hair', category: 'floket' },
  
  // Higjienë orale
  { keyword: 'Toothpaste', category: 'higjiene-orale' },
  { keyword: 'Dhëmb', category: 'higjiene-orale' },
  
  // Deodorantë
  { keyword: 'Deodorant', category: 'deodorante' },
  { keyword: 'Anti-perspirant', category: 'deodorante' }
];

console.log('🔄 Po përditësohen kategoritë e produkteve...');

db.serialize(() => {
  // Përditëso bazuar në brand
  productCategoryMapping.forEach(mapping => {
    db.run(
      `UPDATE products SET category = ? WHERE brand = ? AND (category IS NULL OR category = '')`,
      [mapping.category, mapping.brand],
      function(err) {
        if (err) {
          console.error(`Gabim në përditësimin e produkteve për brand ${mapping.brand}:`, err);
        } else if (this.changes > 0) {
          console.log(`✅ Përditësuar ${this.changes} produkte për brand: ${mapping.brand} → ${mapping.category}`);
        }
      }
    );
  });

  // Përditëso bazuar në fjalë kyçe në emër
  specificProductMapping.forEach(mapping => {
    db.run(
      `UPDATE products SET category = ? WHERE name LIKE ? AND (category IS NULL OR category = '')`,
      [mapping.category, `%${mapping.keyword}%`],
      function(err) {
        if (err) {
          console.error(`Gabim në përditësimin e produkteve për keyword ${mapping.keyword}:`, err);
        } else if (this.changes > 0) {
          console.log(`✅ Përditësuar ${this.changes} produkte për keyword: ${mapping.keyword} → ${mapping.category}`);
        }
      }
    );
  });

  // Shfaq statistikat finale pas 2 sekondash
  setTimeout(() => {
    db.all(`
      SELECT category, COUNT(*) as count 
      FROM products 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY count DESC
    `, (err, rows) => {
      if (err) {
        console.error('Gabim në leximin e statistikave:', err);
      } else {
        console.log('\n📊 Statistikat e kategorizimit:');
        rows.forEach(row => {
          console.log(`- ${row.category}: ${row.count} produkte`);
        });
        
        // Numri i produkteve pa kategori
        db.get(`SELECT COUNT(*) as count FROM products WHERE category IS NULL OR category = ''`, (err, row) => {
          if (!err) {
            console.log(`\n⚠️  Produkte pa kategori: ${row.count}`);
          }
          console.log('\n✅ Kategorizimi i produkteve është kompletuar!');
          db.close();
        });
      }
    });
  }, 2000);
});