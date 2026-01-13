const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n✅ VERIFIKIMI FINAL I NËNKATEGORIVE\n');
console.log('═'.repeat(80));

// Check protein products
db.all(`SELECT COUNT(*) as count FROM products WHERE subcategory = 'Proteinat'`, (err, result) => {
  console.log(`\n💪 Proteinat: ${result[0].count} produkte`);
  
  // Check diapers
  db.all(`SELECT COUNT(*) as count FROM products WHERE subcategory = 'Pelena'`, (err, result2) => {
    console.log(`🍼 Pelenat: ${result2[0].count} produkte`);
    
    // Check maternity
    db.all(`SELECT COUNT(*) as count FROM products WHERE subcategory = 'Kujdesi për Nënën'`, (err, result3) => {
      console.log(`🤰 Kujdesi për Nënën: ${result3[0].count} produkte`);
      
      // Check baby skin care
      db.all(`SELECT COUNT(*) as count FROM products WHERE subcategory = 'Kujdesi për Lëkurën' AND category = 'mama-dhe-bebat'`, (err, result4) => {
        console.log(`👶 Kujdesi për Lëkurën (beba): ${result4[0].count} produkte`);
        
        // Show samples from each
        console.log('\n\n📋 SHEMBUJ:\n');
        console.log('─'.repeat(80));
        
        db.all(`SELECT name, brand FROM products WHERE subcategory = 'Proteinat' LIMIT 5`, (err, proteins) => {
          console.log('\n💪 PROTEINAT:');
          proteins.forEach(p => console.log(`   • ${p.brand} - ${p.name.substring(0, 70)}`));
          if (proteins.length === 0) console.log('   (bosh - nuk ka produkte protein)');
          
          db.all(`SELECT name, brand FROM products WHERE subcategory = 'Pelena' LIMIT 8`, (err, diapers) => {
            console.log('\n🍼 PELENAT:');
            diapers.forEach(p => console.log(`   • ${p.brand} - ${p.name.substring(0, 70)}`));
            
            db.all(`SELECT name, brand FROM products WHERE subcategory = 'Kujdesi për Nënën' LIMIT 5`, (err, maternity) => {
              console.log('\n🤰 KUJDESI PËR NËNËN:');
              maternity.forEach(p => console.log(`   • ${p.brand} - ${p.name.substring(0, 70)}`));
              
              db.all(`SELECT name, brand FROM products WHERE subcategory = 'Kujdesi për Lëkurën' AND category = 'mama-dhe-bebat' LIMIT 8`, (err, baby) => {
                console.log('\n👶 KUJDESI PËR LËKURËN (Beba):');
                baby.forEach(p => console.log(`   • ${p.brand} - ${p.name.substring(0, 70)}`));
                
                console.log('\n' + '═'.repeat(80));
                console.log('\n✅ Verifikimi u krye!\n');
                db.close();
              });
            });
          });
        });
      });
    });
  });
});
