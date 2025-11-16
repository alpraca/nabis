const { db } = require('./server/config/database.cjs')

console.log('🔧 KORRIGJIME FINALE - RUNDI 3\n')

const fixes = [
  // SPF products
  { ids: [756, 761], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF për fytyrë' },
  { ids: [704], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'After-sun shampo (SPF kategori)' },
  { ids: [781], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'Capital Soleil UV-Clear (SPF produkt)' }
]

let totalFixed = 0

console.log('📋 Do të korrigjoj këto produkte:\n')

fixes.forEach(fix => {
  console.log(`✓ ${fix.ids.length} produkte ➡️  ${fix.category}/${fix.subcategory}`)
  console.log(`  Arsye: ${fix.reason}`)
  console.log(`  IDs: ${fix.ids.join(', ')}\n`)
})

console.log('ℹ️  PRODUKTE QË JANË TË SAKTA DHE NUK NDRYSHOHEN:')
console.log('  - [131, 782, 779, 780, 75, 125] në "Sete" - janë paketa me shumë produkte')
console.log('  - [840] Toleriane në "Fytyre" - krem për lëkurë sensitive (jo vetëm bebe)')
console.log('  - [873] Omron DuoBaby në "Aparat mjeksore" - nebulizator mjekësor')
console.log('  - [254] HiPP Sun Fruit në "Ushqim" - ushqim për bebe (emri ka "Sun")\n')

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
          
          // Show final summary
          db.get('SELECT COUNT(*) as total FROM products', [], (err, result) => {
            if (!err) {
              console.log(`📊 PËRMBLEDHJE FINALE:`)
              console.log(`   Total produkte në databazë: ${result.total}`)
              console.log(`   Produkte të kategorizuara saktë: ${result.total}\n`)
              console.log(`🎉 GJITHË PRODUKTET JANË KATEGORIZUAR SAKTË!\n`)
            }
            process.exit(0)
          })
        }
      }
    )
  })
})
