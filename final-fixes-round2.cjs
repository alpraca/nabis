const { db } = require('./server/config/database.cjs')

console.log('🔧 KORRIGJIME FINALE - RUNDI 2\n')

const fixes = [
  // Baby SPF products
  { ids: [496, 511, 813], category: 'mama-dhe-bebat', subcategory: 'SPF', reason: 'SPF për bebe (Baby në emër)' },
  
  // Baby hygiene products (Mister Baby, Rilastil Pediatric)
  { ids: [505, 507, 635, 637, 638], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Produkte higjene për bebe (Baby/Pediatric)' },
  
  // Baby vitamins
  { ids: [723], category: 'mama-dhe-bebat', subcategory: 'Suplementa', reason: 'Vitaminë për bebe (Babytol)' },
  
  // Adult SPF products that should stay in SPF
  { ids: [117, 133, 134, 170, 172, 173, 162], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF për të rritur' },
  
  // Baby food (HiPP organic with SPF in name but is food)
  { ids: [254], category: 'mama-dhe-bebat', subcategory: 'Ushqim', reason: 'Ushqim për bebe (HiPP)' }
]

let totalFixed = 0

console.log('📋 Do të korrigjoj këto produkte:\n')

fixes.forEach(fix => {
  console.log(`✓ ${fix.ids.length} produkte ➡️  ${fix.category}/${fix.subcategory}`)
  console.log(`  Arsye: ${fix.reason}`)
  console.log(`  IDs: ${fix.ids.join(', ')}\n`)
})

// Perform updates
let completed = 0
fixes.forEach(fix => {
  fix.ids.forEach(id => {
    db.run(
      'UPDATE products SET category = ?, subcategory = ? WHERE id = ?',
      [fix.category, fix.subcategory, id],
      (err) => {
        if (err) {
          console.error(`❌ Gabim në ID ${id}:`, err)
        } else {
          totalFixed++
        }
        
        completed++
        if (completed === fixes.reduce((sum, f) => sum + f.ids.length, 0)) {
          console.log(`\n✨ MBAROI!`)
          console.log(`✅ Korrigjuar: ${totalFixed} produkte\n`)
          process.exit(0)
        }
      }
    )
  })
})
