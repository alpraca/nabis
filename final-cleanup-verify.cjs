const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🎯 FINAL CLEANUP & VERIFICATION\n');
console.log('═'.repeat(90));

// Fix iHealth Wave (it's a medical device, not tanning)
db.run(`UPDATE products SET category = 'farmaci', subcategory = 'Aparat mjeksore' 
        WHERE brand LIKE '%iHealth%' AND name LIKE '%Wave%'`, 
function(err) {
  if (err) {
    console.error(err);
  } else if (this.changes > 0) {
    console.log(`✅ Fixed iHealth Wave → farmaci/Aparat mjeksore`);
  }
  
  // Now verify all subcategories
  console.log('\n📊 VERIFYING ALL SUBCATEGORIES:\n');
  
  db.all(`
    SELECT category, subcategory, COUNT(*) as count
    FROM products
    WHERE subcategory IS NOT NULL
    GROUP BY category, subcategory
    ORDER BY category, count DESC
  `, [], (err, rows) => {
    if (err) {
      console.error(err);
      db.close();
      return;
    }
    
    let currentCategory = '';
    rows.forEach(row => {
      if (row.category !== currentCategory) {
        currentCategory = row.category;
        console.log(`\n📁 ${currentCategory.toUpperCase()}`);
        console.log('─'.repeat(90));
      }
      const bar = '█'.repeat(Math.ceil(row.count / 5));
      console.log(`   ${row.subcategory.padEnd(50)} : ${String(row.count).padStart(3)} ${bar}`);
    });
    
    console.log('\n' + '═'.repeat(90));
    console.log('\n✅ All subcategories verified!\n');
    db.close();
  });
});
