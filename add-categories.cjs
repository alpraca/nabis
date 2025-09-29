const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Konektimi me database
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Kategoritë e reja që duhen shtuar
const categories = [
  // Dermokozmetikë subcategories
  { name: 'anti-aging', display_name: 'Anti-aging', parent: 'dermokozmetike' },
  { name: 'akne', display_name: 'Akne dhe probleme', parent: 'dermokozmetike' },
  
  // Gratë Shtatzëna
  { name: 'grate-shtatzena', display_name: 'Gratë Shtatzëna', parent: null },
  { name: 'vitamina-shtatzeni', display_name: 'Vitamina për shtatzëni', parent: 'grate-shtatzena' },
  { name: 'kujdes-lekure-shtatzeni', display_name: 'Kujdes për lëkurën', parent: 'grate-shtatzena' },
  { name: 'suplemente-shtatzeni', display_name: 'Suplemente të nevojshme', parent: 'grate-shtatzena' },
  { name: 'kujdes-gjiri', display_name: 'Kujdes gjiri', parent: 'grate-shtatzena' },
  
  // Fëmijët dhe Bebet
  { name: 'femijet-bebet', display_name: 'Fëmijët dhe Bebet', parent: null },
  { name: 'vitamina-femije', display_name: 'Vitamina për fëmijë', parent: 'femijet-bebet' },
  { name: 'kujdes-bebe', display_name: 'Kujdes për bebet', parent: 'femijet-bebet' },
  { name: 'ushqim-bebe', display_name: 'Ushqim për bebe', parent: 'femijet-bebet' },
  { name: 'higjiene-femije', display_name: 'Higjienë fëmijësh', parent: 'femijet-bebet' },
  { name: 'aksesor-bebe', display_name: 'Aksesorë bebesh', parent: 'femijet-bebet' },
  
  // Vitamina & Suplemente
  { name: 'vitamina-suplemente', display_name: 'Vitamina & Suplemente', parent: null },
  { name: 'multivitamina', display_name: 'Multivitamina', parent: 'vitamina-suplemente' },
  { name: 'vitamina-c', display_name: 'Vitamina C', parent: 'vitamina-suplemente' },
  { name: 'vitamina-d', display_name: 'Vitamina D', parent: 'vitamina-suplemente' },
  { name: 'omega-3', display_name: 'Omega 3', parent: 'vitamina-suplemente' },
  { name: 'magneziu', display_name: 'Magneziu', parent: 'vitamina-suplemente' },
  { name: 'kalsium', display_name: 'Kalsium', parent: 'vitamina-suplemente' },
  { name: 'hekur', display_name: 'Hekur', parent: 'vitamina-suplemente' },
  { name: 'suplemente-sportive', display_name: 'Suplemente sportive', parent: 'vitamina-suplemente' },
  
  // Farmaci & Mjekësi (shtoj të rejat)
  { name: 'farmaci-mjekesi', display_name: 'Farmaci & Mjekësi', parent: null },
  { name: 'teste-shtepi', display_name: 'Teste shtëpie', parent: 'farmaci-mjekesi' },
  { name: 'dezinfektues', display_name: 'Dezinfektues', parent: 'farmaci-mjekesi' },
  
  // Higjienë dhe Kujdes  
  { name: 'higjiene-kujdes', display_name: 'Higjienë dhe Kujdes', parent: null },
  { name: 'higjiene-orale', display_name: 'Higjienë orale', parent: 'higjiene-kujdes' },
  { name: 'higjiene-personale', display_name: 'Higjienë personale', parent: 'higjiene-kujdes' },
  { name: 'deodorante', display_name: 'Deodorantë', parent: 'higjiene-kujdes' },
  { name: 'shampo-balsam', display_name: 'Shampo dhe balsam', parent: 'higjiene-kujdes' },
  { name: 'sapun-gel', display_name: 'Sapunë dhe gel', parent: 'higjiene-kujdes' }
];

// Krijon tabelën e kategorive nëse nuk ekziston
db.serialize(() => {
  // Krijo tabelën e kategorive
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    parent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Shto kategoritë e reja
  const stmt = db.prepare(`INSERT OR IGNORE INTO categories (name, display_name, parent) VALUES (?, ?, ?)`);
  
  categories.forEach(category => {
    stmt.run(category.name, category.display_name, category.parent);
  });
  
  stmt.finalize();
  
  console.log('✅ Kategoritë e reja janë shtuar në database!');
  
  // Shfaq kategoritë e shtuara
  db.all("SELECT * FROM categories ORDER BY parent, name", (err, rows) => {
    if (err) {
      console.error('Gabim në leximin e kategorive:', err);
    } else {
      console.log('📋 Kategoritë në database:');
      rows.forEach(row => {
        console.log(`- ${row.display_name} (${row.name}) ${row.parent ? `[parent: ${row.parent}]` : ''}`);
      });
    }
    db.close();
  });
});