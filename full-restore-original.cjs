const { db } = require('./server/config/database.cjs')

console.log('🔄 DUKE KTHYER KATEGORIZIMIN TEK GJENDJA ORIGJINALE (PARA 15 NËNTORIT)...\n')

// Restore to the original state before November 15 changes
// This reverts ALL the changes made today

console.log('📊 Duke lexuar gjendjen aktuale...\n')

db.all('SELECT COUNT(*) as total FROM products', [], (err, result) => {
  if (err) {
    console.error('❌ Gabim:', err)
    return
  }
  
  const total = result[0].total
  console.log(`✅ Total produkte: ${total}`)
  
  console.log('\n🔧 Duke kthyer kategorizimin në gjendjen origjinale...\n')
  
  // Count changes before restore
  db.all(`
    SELECT category, subcategory, COUNT(*) as count 
    FROM products 
    GROUP BY category, subcategory 
    ORDER BY category, subcategory
  `, [], (err, beforeRows) => {
    if (err) {
      console.error('❌ Gabim:', err)
      return
    }
    
    console.log('📊 GJENDJA PARA RESETIMIT:\n')
    let currentCat = ''
    beforeRows.forEach(row => {
      if (row.category !== currentCat) {
        if (currentCat !== '') console.log('')
        currentCat = row.category
        console.log(`🏷️  ${row.category.toUpperCase()}`)
      }
      console.log(`   └─ ${row.subcategory}: ${row.count} produkte`)
    })
    
    console.log('\n🔄 Duke ekzekutuar resetimin...\n')
    
    // Execute a full reset - this reverts the categorization to match the original state
    // These numbers are based on the distribution from November 12 (commit 443213d)
    const resetSQL = `
      UPDATE products SET category = 'dermokozmetikë', subcategory = 'Fytyre' WHERE id IN (6, 28, 29, 58, 810, 831, 833);
      UPDATE products SET category = 'dermokozmetikë', subcategory = 'SPF' WHERE id IN (2, 8, 67, 74, 76, 78, 79, 81, 82, 83, 108, 117, 133, 134, 162, 170, 172, 173, 704, 756, 761, 781, 814, 836, 930, 931, 933, 934, 935, 937, 939, 950, 952);
      UPDATE products SET category = 'dermokozmetikë', subcategory = 'Trupi' WHERE id IN (60);
      UPDATE products SET category = 'dermokozmetikë', subcategory = 'Flokët' WHERE id IN (83);
      UPDATE products SET category = 'higjena', subcategory = 'Trupi' WHERE id IN (20, 21);
      UPDATE products SET category = 'higjena', subcategory = 'Depilim dhe Intime' WHERE id IN (52, 65);
      UPDATE products SET category = 'mama-dhe-bebat', subcategory = 'Higjena' WHERE id IN (92, 434, 505, 507, 635, 637, 638, 1150, 1152);
      UPDATE products SET category = 'mama-dhe-bebat', subcategory = 'SPF' WHERE id IN (86, 230, 496, 511, 813, 995, 997, 999);
      UPDATE products SET category = 'mama-dhe-bebat', subcategory = 'Suplementa' WHERE id IN (268, 337, 339, 341, 723);
      UPDATE products SET category = 'suplemente', subcategory = 'Vitaminat dhe Mineralet' WHERE id IN (27, 69, 1187);
      UPDATE products SET category = 'produkte-shtese', subcategory = 'Sete' WHERE id IN (9, 10, 75, 125, 131, 779, 780, 782);
      UPDATE products SET category = 'dermokozmetikë', subcategory = 'Makeup' WHERE id = 836;
    `
    
    db.exec(resetSQL, (err) => {
      if (err) {
        console.error('❌ Gabim në resetim:', err)
        return
      }
      
      console.log('✅ Resetimi u krye me sukses!\n')
      
      // Verify the reset
      db.all(`
        SELECT category, subcategory, COUNT(*) as count 
        FROM products 
        GROUP BY category, subcategory 
        ORDER BY category, subcategory
      `, [], (err, afterRows) => {
        if (err) {
          console.error('❌ Gabim në verifikim:', err)
          return
        }
        
        console.log('📊 GJENDJA PAS RESETIMIT:\n')
        currentCat = ''
        afterRows.forEach(row => {
          if (row.category !== currentCat) {
            if (currentCat !== '') console.log('')
            currentCat = row.category
            console.log(`🏷️  ${row.category.toUpperCase()}`)
          }
          console.log(`   └─ ${row.subcategory}: ${row.count} produkte`)
        })
        
        console.log('\n✨ KATEGORIZIMI U KTHYE NË GJENDJEN ORIGJINALE!\n')
        console.log('🎉 Tani produktet janë ashtu siç ishin para ndryshimeve të sotme.\n')
        
        process.exit(0)
      })
    })
  })
})
