const { db } = require('./server/config/database.cjs')

console.log('🔧 FIXING REMAINING ISSUES...\n')

const fixes = [
  // Anti-aging products -> dermokozmetikë Fytyre
  { ids: [55, 115, 192, 528, 831, 833, 964], category: 'dermokozmetikë', subcategory: 'Fytyre', reason: 'Anti-aging face products' },
  
  // SPF products in face -> dermokozmetikë SPF
  { ids: [76, 78, 81, 82, 131], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'Face SPF products' },
  
  // SPF products in body/hair -> dermokozmetikë SPF  
  { ids: [74, 83, 133, 134, 162], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'Body/Hair SPF products' },
  
  // Baby products in SPF -> mama-dhe-bebat SPF
  { ids: [8, 86, 230], category: 'mama-dhe-bebat', subcategory: 'SPF', reason: 'Baby SPF products' },
  
  // Baby hygiene products -> mama-dhe-bebat Higjena
  { ids: [84, 92, 100, 112, 238], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Baby hygiene products' },
  
  // Baby water -> mama-dhe-bebat Ushqim
  { ids: [181], category: 'mama-dhe-bebat', subcategory: 'Ushqim', reason: 'Baby water/food' },
  
  // Baby set -> mama-dhe-bebat Higjena
  { ids: [125], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Baby care set' }
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
            console.log(`\n✨ COMPLETED! Fixed ${totalFixed} products total!\n`)
            process.exit(0)
          }, 500)
        }
      }
    )
  }, index * 300)
})
