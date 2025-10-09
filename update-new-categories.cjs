const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database('./server/database.sqlite');

console.log('🔄 Updating database with new navbar categories...');

// New category structure based on user requirements
const newCategories = [
  // Main categories
  { id: 'dermokozmetike', name: 'Dermokozmetikë', parent: null },
  { id: 'higjena', name: 'Higjena', parent: null },
  { id: 'farmaci', name: 'Farmaci', parent: null },
  { id: 'mama-bebat', name: 'Mama dhe Bebat', parent: null },
  { id: 'produkte-shtese', name: 'Produkte Shtesë', parent: null },
  { id: 'suplemente', name: 'Suplemente', parent: null },
  
  // Dermokozmetikë subcategories
  { id: 'fytyre', name: 'Fytyre', parent: 'dermokozmetike' },
  { id: 'floket', name: 'Floket', parent: 'dermokozmetike' },
  { id: 'trupi', name: 'Trupi', parent: 'dermokozmetike' },
  { id: 'spf', name: 'SPF', parent: 'dermokozmetike' },
  { id: 'tanning', name: 'Tanning', parent: 'dermokozmetike' },
  { id: 'makeup', name: 'Makeup', parent: 'dermokozmetike' },
  
  // Higjena subcategories
  { id: 'depilim-intime', name: 'Depilim dhe Intime', parent: 'higjena' },
  { id: 'goja', name: 'Goja', parent: 'higjena' },
  { id: 'kembet', name: 'Këmbët', parent: 'higjena' },
  { id: 'trupi-higjena', name: 'Trupi', parent: 'higjena' },
  
  // Farmaci subcategories
  { id: 'otc', name: 'OTC (pa recete)', parent: 'farmaci' },
  { id: 'seksuale', name: 'Mirëqenia seksuale', parent: 'farmaci' },
  { id: 'aparat-mjeksore', name: 'Aparat mjeksore', parent: 'farmaci' },
  { id: 'first-aid', name: 'First Aid (Ndihma e Pare)', parent: 'farmaci' },
  { id: 'ortopedike', name: 'Ortopedike', parent: 'farmaci' },
  
  // Mama dhe Bebat subcategories
  { id: 'shtatzani', name: 'Kujdesi ndaj Nënës - Shtatzani', parent: 'mama-bebat' },
  { id: 'ushqyerje-gji', name: 'Kujdesi ndaj Nënës - Ushqyerje me Gji', parent: 'mama-bebat' },
  { id: 'pelena', name: 'Kujdesi ndaj Bebit - Pelena', parent: 'mama-bebat' },
  { id: 'beba-higjena', name: 'Kujdesi ndaj Bebit - Higjena', parent: 'mama-bebat' },
  { id: 'beba-spf', name: 'Kujdesi ndaj Bebit - SPF', parent: 'mama-bebat' },
  { id: 'beba-suplementa', name: 'Kujdesi ndaj Bebit - Suplementa', parent: 'mama-bebat' },
  { id: 'aksesor-beba', name: 'Aksesor per Beba', parent: 'mama-bebat' },
  { id: 'planifikim-familjar', name: 'Planifikim Familjar', parent: 'mama-bebat' },
  
  // Produkte Shtesë subcategories
  { id: 'sete', name: 'Sete', parent: 'produkte-shtese' },
  { id: 'vajra-esencial', name: 'Vajra Esencial', parent: 'produkte-shtese' },
  
  // Suplemente subcategories
  { id: 'multivitamina', name: 'Multivitamina', parent: 'suplemente' },
  { id: 'vitamina-c', name: 'Vitamina C', parent: 'suplemente' },
  { id: 'vitamina-d', name: 'Vitamina D', parent: 'suplemente' },
  { id: 'omega-3', name: 'Omega 3', parent: 'suplemente' },
  { id: 'magneziu', name: 'Magneziu', parent: 'suplemente' },
  { id: 'kalsium', name: 'Kalsium', parent: 'suplemente' },
  { id: 'hekur', name: 'Hekur', parent: 'suplemente' }
];

db.serialize(() => {
  // Clear existing categories
  db.run('DELETE FROM categories', (err) => {
    if (err) {
      console.error('Error clearing categories:', err);
      return;
    }
    console.log('✅ Cleared existing categories');
    
    // Insert new categories
    let inserted = 0;
    newCategories.forEach(category => {
      db.run(
        'INSERT INTO categories (name, display_name, parent, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [category.id, category.name, category.parent],
        function(err) {
          inserted++;
          
          if (err) {
            console.error(`❌ Error inserting ${category.name}:`, err.message);
          } else {
            console.log(`✅ Added: ${category.name} (${category.id})`);
          }
          
          if (inserted === newCategories.length) {
            console.log(`\n📊 Successfully added ${newCategories.length} categories`);
            
            // Show summary
            db.all('SELECT COUNT(*) as total FROM categories', (err, result) => {
              if (!err) {
                console.log(`📈 Total categories in database: ${result[0].total}`);
              }
              db.close();
            });
          }
        }
      );
    });
  });
});