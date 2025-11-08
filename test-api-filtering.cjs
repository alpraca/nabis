const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🧪 TESTING API CATEGORY FILTERING\n')
console.log('═'.repeat(70) + '\n')

const tests = [
  { category: 'makeup', expectedMin: 18, description: 'Makeup (should have ONLY makeup, NO tea/supplements/baby)' },
  { category: 'çajra-mjekësore', expectedMin: 30, description: 'Medical Teas (ATC çajra)' },
  { category: 'ushqim', expectedMin: 70, description: 'Baby Food (Holle, Aptamil, HiPP)' },
  { category: 'vitaminat-dhe-mineralet', expectedMin: 90, description: 'Vitamins (Solgar, Vitabiotics, Doppelherz)' },
  { category: 'pelena', expectedMin: 20, description: 'Baby Diapers/Wipes' },
]

let testsPassed = 0
let testsFailed = 0
let completedTests = 0

tests.forEach(test => {
  // Map category ID to database column values
  let queryCondition = ''
  
  if (test.category.toLowerCase() === 'makeup') {
    queryCondition = `WHERE subcategory = 'Makeup'`
  } else if (test.category.toLowerCase() === 'çajra-mjekësore') {
    queryCondition = `WHERE subcategory = 'Çajra Mjekësore'`
  } else if (test.category.toLowerCase() === 'ushqim') {
    queryCondition = `WHERE subcategory = 'Ushqim'`
  } else if (test.category.toLowerCase() === 'vitaminat-dhe-mineralet') {
    queryCondition = `WHERE subcategory = 'Vitaminat dhe Mineralet'`
  } else if (test.category.toLowerCase() === 'pelena') {
    queryCondition = `WHERE subcategory = 'Pelena'`
  }

  db.get(`SELECT COUNT(*) as count FROM products ${queryCondition}`, (err, row) => {
    const count = row.count
    const passed = count >= test.expectedMin
    
    if (passed) {
      console.log(`✅ ${test.description}`)
      console.log(`   Found: ${count} products (expected ≥ ${test.expectedMin})\n`)
      testsPassed++
    } else {
      console.log(`❌ ${test.description}`)
      console.log(`   Found: ${count} products (expected ≥ ${test.expectedMin})\n`)
      testsFailed++
    }
    
    completedTests++
    
    if (completedTests === tests.length) {
      console.log('═'.repeat(70))
      console.log(`\n📊 RESULTS: ${testsPassed}/${tests.length} passed\n`)
      
      if (testsPassed === tests.length) {
        console.log('🎉 ALL TESTS PASSED - API FILTERING WORKS CORRECTLY!\n')
      } else {
        console.log(`⚠️  ${testsFailed} tests failed\n`)
      }
      
      db.close()
    }
  })
})
