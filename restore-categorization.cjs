const { db } = require('./server/config/database.cjs')

console.log('🔄 DUKE KTHYER KATEGORIZIMIN NË GJENDJEN E MËPARSHME...\n')

// This will restore the categorization from before today's changes
// Based on the commit 443213d which had the correct categorization

const restoreQuery = `
  UPDATE products SET category = 'dermokozmetikë', subcategory = 'SPF' WHERE id IN (2, 67, 76, 78, 79, 81, 82, 83, 108, 756, 761, 704, 781, 814, 930, 931, 937, 939, 950);
  UPDATE products SET category = 'mama-dhe-bebat', subcategory = 'SPF' WHERE id IN (8, 86, 230, 496, 511, 813, 995, 997, 999);
  UPDATE products SET category = 'mama-dhe-bebat', subcategory = 'Higjena' WHERE id IN (434, 92, 505, 507, 635, 637, 638, 1150, 1152);
  UPDATE products SET category = 'mama-dhe-bebat', subcategory = 'Suplementa' WHERE id IN (268, 337, 339, 341, 723);
  UPDATE products SET category = 'suplemente', subcategory = 'Vitaminat dhe Mineralet' WHERE id IN (28, 29, 58, 810, 831, 833, 1187);
  UPDATE products SET category = 'dermokozmetikë', subcategory = 'Trupi' WHERE id IN (60, 74);
  UPDATE products SET category = 'higjena', subcategory = 'Trupi' WHERE id IN (20, 21);
  UPDATE products SET category = 'higjena', subcategory = 'Depilim dhe Intime' WHERE id IN (52, 65);
`

console.log('📊 Duke resetuar kategorizimin...\n')

// Execute the restore
db.exec(restoreQuery, (err) => {
  if (err) {
    console.error('❌ Gabim:', err.message)
    process.exit(1)
  }
  
  console.log('✅ Kategorizimi u kthye në gjendjen e mëparshme!')
  
  // Verify
  db.all(`
    SELECT category, subcategory, COUNT(*) as count 
    FROM products 
    GROUP BY category, subcategory 
    ORDER BY category, subcategory
  `, [], (err, rows) => {
    if (err) {
      console.error('❌ Gabim në verifikim:', err.message)
      process.exit(1)
    }
    
    console.log('\n📊 SHPËRNDARJA E PRODUKTEVE PAS RESETIMIT:\n')
    let currentCat = ''
    rows.forEach(row => {
      if (row.category !== currentCat) {
        if (currentCat !== '') console.log('')
        currentCat = row.category
        console.log(`🏷️  ${row.category.toUpperCase()}`)
      }
      console.log(`   └─ ${row.subcategory}: ${row.count} produkte`)
    })
    
    console.log('\n✨ RESETIMI PËRFUNDOI ME SUKSES!\n')
    process.exit(0)
  })
})
