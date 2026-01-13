const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔧 RREGULLIM SPECIFIK: Bambo produkte dhe tjera\n');

// Fix Bambo products that are body wash, lotion, cream etc (NOT diapers)
const fixes = [
  // Bambo lotions, creams, washes -> Kujdesi për Lëkurën
  {
    sql: `UPDATE products SET subcategory = 'Kujdesi për Lëkurën' 
          WHERE brand LIKE '%Bambo%' 
          AND (name LIKE '%lotion%' OR name LIKE '%cream%' OR name LIKE '%oil%')
          AND category = 'mama-dhe-bebat'`,
    description: 'Bambo lotions/creams → Kujdesi për Lëkurën'
  },
  // Bambo shampoo, wash -> Higjena
  {
    sql: `UPDATE products SET subcategory = 'Higjena' 
          WHERE brand LIKE '%Bambo%' 
          AND (name LIKE '%wash%' OR name LIKE '%shampoo%' OR name LIKE '%bath%')
          AND category = 'mama-dhe-bebat'`,
    description: 'Bambo wash/shampoo → Higjena'
  },
  // Actual diapers -> Pelena
  {
    sql: `UPDATE products SET subcategory = 'Pelena' 
          WHERE brand LIKE '%Bambo%' 
          AND (name LIKE '%diaper%' OR name LIKE '%pants%' OR name LIKE '%pannolin%')
          AND category = 'mama-dhe-bebat'`,
    description: 'Bambo diapers/pants → Pelena'
  },
  // Pampers -> Pelena
  {
    sql: `UPDATE products SET subcategory = 'Pelena' 
          WHERE brand LIKE '%Pampers%'
          AND category = 'mama-dhe-bebat'`,
    description: 'Pampers → Pelena'
  },
  // Protein supplements
  {
    sql: `UPDATE products SET subcategory = 'Proteinat' 
          WHERE (name LIKE '%protein%' OR name LIKE '%whey%' OR name LIKE '%amino%' OR name LIKE '%bcaa%')
          AND category = 'suplemente'`,
    description: 'Protein products → Proteinat'
  },
  // Maternity products
  {
    sql: `UPDATE products SET subcategory = 'Kujdesi për Nënën' 
          WHERE (name LIKE '%maternity%' OR name LIKE '%pregnancy%' OR name LIKE '%gravid%' OR name LIKE '%breast%' OR name LIKE '%nursing%')
          AND category = 'mama-dhe-bebat'`,
    description: 'Maternity products → Kujdesi për Nënën'
  }
];

let completed = 0;

fixes.forEach((fix, index) => {
  db.run(fix.sql, function(err) {
    if (err) {
      console.error(`❌ ${fix.description}: Error - ${err.message}`);
    } else {
      console.log(`✅ ${fix.description}: ${this.changes} produkte`);
    }
    
    completed++;
    if (completed === fixes.length) {
      console.log('\n🎉 Rregullimet specifike u kryen!\n');
      db.close();
    }
  });
});
