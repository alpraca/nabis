const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔧 CORRECTING SPECIFIC PRODUCTS:\n');

const fixes = [
  // Klorane Bebe Eryteal is a baby cream, not tea - fix it back
  {
    sql: `UPDATE products SET category = 'mama-dhe-bebat', subcategory = 'Kujdesi për Lëkurën' 
          WHERE name LIKE '%Klorane%Bebe%Eryteal%Pommade%'`,
    description: 'Klorane Bebe cream → mama-dhe-bebat/Kujdesi për Lëkurën'
  },
  // iHealth Wave - need to check what this is
  {
    sql: `SELECT name, brand, category, subcategory FROM products WHERE name LIKE '%iHealth%Wave%'`,
    type: 'select',
    description: 'Checking iHealth Wave'
  }
];

let completed = 0;

fixes.forEach(fix => {
  if (fix.type === 'select') {
    db.all(fix.sql, [], (err, rows) => {
      if (err) console.error(err);
      else {
        console.log(`📋 ${fix.description}:`);
        rows.forEach(r => console.log(`   ${r.brand} - ${r.name} [${r.category}/${r.subcategory}]`));
      }
      completed++;
      if (completed === fixes.length) db.close();
    });
  } else {
    db.run(fix.sql, function(err) {
      if (err) {
        console.error(`❌ ${fix.description}: ${err.message}`);
      } else {
        console.log(`✅ ${fix.description}: ${this.changes} products`);
      }
      completed++;
      if (completed === fixes.length) {
        console.log(`\n✅ Corrections complete!\n`);
        db.close();
      }
    });
  }
});
