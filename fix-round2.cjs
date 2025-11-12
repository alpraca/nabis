const { db } = require('./server/config/database.cjs')

console.log('🔧 ROUND 2: FIXING MORE ISSUES...\n')

const fixes = [
  // SPF products with "sun" "bronzante" -> dermokozmetikë SPF
  { ids: [171, 172, 174, 660, 681, 684, 687, 756, 761], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF sun protection products' },
  
  // After-sun shampoo -> SPF (still sun care)
  { ids: [704], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'After-sun hair care' },
  
  // Baby vitamins/water -> mama-dhe-bebat Suplementa
  { ids: [258, 268, 337, 339, 341], category: 'mama-dhe-bebat', subcategory: 'Suplementa', reason: 'Baby vitamins and water' },
  
  // Bambo Nature pants (diapers) -> mama-dhe-bebat Pelena
  { ids: [355, 359], category: 'mama-dhe-bebat', subcategory: 'Pelena', reason: 'Baby diaper pants' },
  
  // Mustela baby hygiene -> mama-dhe-bebat Higjena
  { ids: [434, 435], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Baby shampoo and cleansing' },
  
  // Baby SPF -> mama-dhe-bebat SPF
  { ids: [496], category: 'mama-dhe-bebat', subcategory: 'SPF', reason: 'Baby sun protection' }
]

let totalFixed = 0

fixes.forEach((fix, index) => {
  setTimeout(() => {
    const placeholders = fix.ids.map(() => '?').join(',')
    
    db.run(
      `UPDATE products SET category = ?, subcategory = ? WHERE id IN (${placeholders})`,
      [fix.category, fix.subcategory, ...fix.ids],
      function(err) {
        if (err) {
          console.error(`❌ Error fixing ${fix.reason}:`, err)
        } else {
          totalFixed += this.changes
          console.log(`✅ Fixed ${this.changes} products: ${fix.reason}`)
          console.log(`   → ${fix.category} -> ${fix.subcategory}`)
          console.log(`   IDs: [${fix.ids.join(', ')}]\n`)
        }
        
        // Final summary
        if (index === fixes.length - 1) {
          setTimeout(() => {
            console.log('=' .repeat(60))
            console.log(`\n✨ ROUND 2 COMPLETED! Fixed ${totalFixed} more products!\n`)
            process.exit(0)
          }, 500)
        }
      }
    )
  }, index * 300)
})
