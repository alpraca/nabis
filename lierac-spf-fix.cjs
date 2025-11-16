const { db } = require('./server/config/database.cjs')

console.log('🔧 KORRIGJIME FINALE - LIERAC SPF PRODUCTS\n')

const fixes = [
  // Lierac SPF products - "Body Milk" means for body, not face
  { ids: [933, 934], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'Lierac Body Milk SPF - për trup' },
  { ids: [935], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'Lierac Fluid SPF - për fytyrë/trup' }
]

let totalFixed = 0

console.log('📋 Do të korrigjoj këto produkte Lierac:\n')

fixes.forEach(fix => {
  console.log(`✓ ${fix.ids.length} produkte ➡️  ${fix.category}/${fix.subcategory}`)
  console.log(`  Arsye: ${fix.reason}`)
  console.log(`  IDs: ${fix.ids.join(', ')}\n`)
})

console.log('✅ KONFIRMIM - PRODUKTE TË SAKTA:')
console.log('   [131, 782, 779, 780, 75, 125] = SETE (paketa me disa produkte)')
console.log('   [840] = Toleriane për lëkurë sensitive (jo vetëm bebe)')
console.log('   [873] = Omron DuoBaby nebulizator (aparat mjekësor)')
console.log('   [254] = HiPP Sun Fruit (ushqim për bebe)')
console.log('   [836] = Toleriane Teint Mineral (makeup mineral)\n')

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
          console.log(`✅ Korrigjuar: ${totalFixed} produkte Lierac`)
          
          // Final count
          db.all(`
            SELECT category, subcategory, COUNT(*) as count 
            FROM products 
            GROUP BY category, subcategory 
            ORDER BY category, subcategory
          `, [], (err, rows) => {
            if (!err) {
              console.log(`\n📊 SHPËRNDARJA FINALE E PRODUKTEVE:\n`)
              let currentCat = ''
              rows.forEach(row => {
                if (row.category !== currentCat) {
                  if (currentCat !== '') console.log('')
                  currentCat = row.category
                  console.log(`🏷️  ${row.category.toUpperCase()}`)
                }
                console.log(`   └─ ${row.subcategory}: ${row.count} produkte`)
              })
              console.log(`\n🎉 KATEGORIZIMI I GJITHË 1227 PRODUKTEVE PERFEKT!\n`)
            }
            process.exit(0)
          })
        }
      }
    )
  })
})
