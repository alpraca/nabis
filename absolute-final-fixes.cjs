const { db } = require('./server/config/database.cjs')

console.log('🔧 KORRIGJIME ABSOLUTE FINALE\n')

const fixes = [
  // SPF products with specific purposes (tinted, anti-aging, etc.) should be in SPF
  { ids: [525, 660, 687, 688, 695], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF për fytyrë (me SPF në emër)' },
  { ids: [681, 684], category: 'dermokozmetikë', subcategory: 'SPF', reason: 'SPF për trup' },
  
  // Klorane Bebe products
  { ids: [1150], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Klorane Bebe - sapun për bebe' },
  { ids: [1152], category: 'mama-dhe-bebat', subcategory: 'Higjena', reason: 'Klorane Bebe - pudër për bebe' },
  
  // Sets remain as sets (promotional bundles) - these are intentionally in Sete
  // [75, 125, 131, 782] - do NOT change these, they are multi-product sets
  
  // [840] La Roche Posay Toleriane Sensitive - stays in Fytyre (general sensitive cream, not baby-specific)
  // [873] Omron DuoBaby - stays in Aparat mjeksore (it's a medical device, even though for babies)
  // [254] HiPP Organic Sun Fruit - stays in Ushqim (it's baby food, "Sun" is just the name)
]

let totalFixed = 0

console.log('📋 Do të korrigjoj këto produkte:\n')

fixes.forEach(fix => {
  console.log(`✓ ${fix.ids.length} produkte ➡️  ${fix.category}/${fix.subcategory}`)
  console.log(`  Arsye: ${fix.reason}`)
  console.log(`  IDs: ${fix.ids.join(', ')}\n`)
})

console.log('ℹ️  PRODUKTE QË MBETEN SI JANË (të sakta):')
console.log('  - [75, 125, 131, 782] në "Sete" - janë paketa promocionale')
console.log('  - [840] Toleriane në "Fytyre" - krem për lëkurë të ndjeshme (jo vetëm për bebe)')
console.log('  - [873] Omron DuoBaby në "Aparat mjeksore" - pajisje mjekësore')
console.log('  - [254] HiPP Sun Fruit në "Ushqim" - ushqim për bebe (jo SPF)\n')

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
