const { db } = require('./server/config/database.cjs')

console.log('🔧 KORRIGJIME MANUALE FINALE\n')

const fixes = [
  // Anti-aging serums back to Fytyre (they're for face, not supplements)
  { ids: [28, 29, 58, 810, 831, 833], category: 'dermokozmetikë', subcategory: 'Fytyre', reason: 'Serum/krem për fytyrë' },
  
  // SPF products that are specifically for face/body
  { ids: [67, 76, 78, 79, 81, 82], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF për fytyrë' },
  { ids: [74, 83], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF për trup' },
  { ids: [108], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF mineral' },
  
  // Baby SPF products
  { ids: [8, 86, 230], category: 'mama-dhe-bebat', subcategory: 'SPF', reason: 'SPF për bebe' },
  
  // Baby vitamins
  { ids: [268, 337, 339, 341], category: 'mama-dhe-bebat', subcategory: 'Suplementa', reason: 'Vitamina për bebe' },
  
  // Baby shampoo and hygiene
  { ids: [434], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Shampo për bebe' },
  { ids: [92], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Produkt për bebe' },
  
  // SPF sets stay as sets (they are promotional bundles)
  { ids: [75, 131, 782, 125], category: 'produkte-shtese', subcategory: 'Sete', reason: 'Set promotional' }
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
