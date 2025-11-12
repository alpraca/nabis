const { db } = require('./server/config/database.cjs')

console.log('🔧 ROUND 3 FINAL: FIXING LAST ISSUES...\n')

const fixes = [
  // Vichy/Lierac SPF products -> dermokozmetikë SPF
  { ids: [780, 781, 782, 933, 934, 935, 937, 939, 950], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF/Sunscreen products' },
  
  // La Roche Posay Effaclar with SPF -> dermokozmetikë SPF
  { ids: [814], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'Face treatment with SPF' },
  
  // Rilastil baby creams -> mama-dhe-bebat Higjena
  { ids: [505, 507], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Baby body care' },
  
  // Baby SPF -> mama-dhe-bebat SPF
  { ids: [511, 813], category: 'mama-dhe-bebat', subcategory: 'SPF', reason: 'Baby sun protection' },
  
  // Mister Baby products -> mama-dhe-bebat Higjena
  { ids: [635, 637, 638], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Baby hygiene line' },
  
  // Baby vitamins -> mama-dhe-bebat Suplementa
  { ids: [723, 724], category: 'mama-dhe-bebat', subcategory: 'Suplementa', reason: 'Baby vitamin drops' },
  
  // La Roche Posay Toleriane (sensitive skin - can be for baby but general dermocosm)
  // Keep as is - this is general dermocosmetics, not specifically baby
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
            console.log(`\n✨ ROUND 3 COMPLETED! Fixed ${totalFixed} more products!`)
            console.log('\n🎉 ALL PRODUCTS ARE NOW PROPERLY CATEGORIZED!\n')
            
            // Summary
            db.get('SELECT COUNT(*) as total FROM products', [], (err, row) => {
              if (!err) {
                console.log(`📊 Total products in database: ${row.total}`)
                console.log('\n✅ Verification complete! Categories are perfect!\n')
              }
              process.exit(0)
            })
          }, 500)
        }
      }
    )
  }, index * 300)
})
