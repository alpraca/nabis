const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔄 UNDOING WRONG CHANGES - Restoring vitamin serums to Fytyre\n');

// The serums with vitamin names are skincare, not supplements
const fixes = [
  {
    sql: `UPDATE products SET category = 'dermokozmetikë', subcategory = 'Fytyre' 
          WHERE name LIKE '%serum%' AND name LIKE '%vitamin%' AND category = 'suplemente'`,
    description: 'Vitamin serums → dermokozmetikë/Fytyre'
  },
  {
    sql: `UPDATE products SET category = 'dermokozmetikë', subcategory = 'Fytyre' 
          WHERE name LIKE '%serum%' AND (name LIKE '%B3%' OR name LIKE '%C12%' OR name LIKE '%Hyalu B5%' OR name LIKE '%Retinol B3%')`,
    description: 'B3/C serums → dermokozmetikë/Fytyre'
  },
  {
    sql: `UPDATE products SET category = 'dermokozmetikë', subcategory = 'SPF & Mbrojtje nga Dielli' 
          WHERE name LIKE '%After-Sun%' OR (name LIKE '%sun%' AND name LIKE '%shampoo%')`,
    description: 'After-sun shampoo → SPF & Mbrojtje nga Dielli'
  }
];

let completed = 0;
let totalFixed = 0;

fixes.forEach(fix => {
  db.run(fix.sql, function(err) {
    if (err) {
      console.error(`❌ ${fix.description}: ${err.message}`);
    } else {
      console.log(`✅ ${fix.description}: ${this.changes} products`);
      totalFixed += this.changes;
    }
    
    completed++;
    if (completed === fixes.length) {
      console.log(`\n🎉 Restored ${totalFixed} products!\n`);
      db.close();
    }
  });
});
