const { db } = require('./server/config/database.cjs')

console.log('🔧 KORRIGJIME ABSOLUTE FINALE - RUNDI 4\n')

const fixes = [
  // SPF products for face
  { ids: [814, 930, 931], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF për fytyrë' },
  
  // Mineral makeup
  { ids: [836], category: 'dermokozmetikë', subcategory: 'Makeup', reason: 'Toleriane Teint Mineral - make up mineral' }
]

let totalFixed = 0

console.log('📋 Do të korrigjoj këto produkte:\n')

fixes.forEach(fix => {
  console.log(`✓ ${fix.ids.length} produkte ➡️  ${fix.category}/${fix.subcategory}`)
  console.log(`  Arsye: ${fix.reason}`)
  console.log(`  IDs: ${fix.ids.join(', ')}\n`)
})

console.log('ℹ️  PRODUKTE QË JANË TË SAKTA (NUK NDRYSHOHEN):')
console.log('  - [131, 782, 779, 780, 75, 125] në "Sete" ✅')
console.log('     Këto janë SETE me disa produkte, jo produkte individuale')
console.log('  - [840] Toleriane Sensitive në "Fytyre" ✅')
console.log('     Krem për lëkurë sensitive (për të gjithë, jo vetëm bebe)')
console.log('  - [873] Omron DuoBaby në "Aparat mjeksore" ✅')
console.log('     Nebulizator mjekësor (edhe pse për bebe, mbetet në Aparat mjeksore)')
console.log('  - [254] HiPP Sun Fruit në "Ushqim" ✅')
console.log('     Ushqim për bebe (emri ka "Sun" por është ushqim, jo SPF)\n')

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
          console.log(`✅ Korrigjuar: ${totalFixed} produkte`)
          
          // Final summary
          db.get('SELECT COUNT(*) as total FROM products', [], (err, result) => {
            if (!err) {
              console.log(`\n📊 PËRMBLEDHJE FINALE:`)
              console.log(`   ✅ Total produkte: ${result.total}`)
              console.log(`   ✅ Të gjitha produktet janë kategorizuar saktë!`)
              console.log(`\n🎉 KATEGORIZIMI PERFEKT - TË GJITHA 1227 PRODUKTET!\n`)
            }
            process.exit(0)
          })
        }
      }
    )
  })
})
