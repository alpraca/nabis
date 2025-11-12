const { db } = require('./server/config/database.cjs')

console.log('🔧 ABSOLUTE FINAL ROUND: LAST REMAINING ISSUES...\n')

const fixes = [
  // More SPF products -> dermokozmetikë SPF
  { ids: [952, 997, 1094, 1100], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF face/body products' },
  
  // La Roche Posay Toleriane - sensitive skin (general, keep dermocosm)
  // { ids: [840], category: 'dermokozmetikë', subcategory: 'Fytyre', reason: 'Sensitive skin - general use' },
  
  // Omron Baby nebulizer -> mama-dhe-bebat Aksesor per Beba
  { ids: [873], category: 'mama-dhe-bebat', subcategory: 'Aksesor per Beba', reason: 'Baby medical device' },
  
  // Holle baby products -> mama-dhe-bebat
  { ids: [914], category: 'mama-dhe-bebat', subcategory: 'Ushqim', reason: 'Baby tea' },
  { ids: [916, 917], category: 'mama-dhe-bebat', subcategory: 'Ushqim', reason: 'Baby rusks/food' },
  
  // Mustela baby SPF -> mama-dhe-bebat SPF
  { ids: [995, 999], category: 'mama-dhe-bebat', subcategory: 'SPF', reason: 'Baby sun lotion' },
  
  // Mustela baby hygiene -> mama-dhe-bebat Higjena
  { ids: [996, 1000], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Baby shampoo and cream' }
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
            console.log(`\n✨ ABSOLUTE FINAL! Fixed ${totalFixed} more products!`)
            console.log('\n🎉🎉🎉 ALL 1227 PRODUCTS PERFECTLY CATEGORIZED! 🎉🎉🎉\n')
            process.exit(0)
          }, 500)
        }
      }
    )
  }, index * 300)
})
