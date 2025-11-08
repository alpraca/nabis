const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔧 FIXING CRITICAL PRODUCT MISPLACEMENTS:\n')

// Direct fixes for known problematic products
const fixes = [
  {
    issue: 'Nuxe Prodigieuse Florale le parfum',
    from: 'higjena/Goja',
    to: 'dermokozmetikë/Fytyre',
    reason: 'Perfume, not dental product'
  },
  {
    issue: 'Klorane Floral Water Make-Up Remove',
    from: 'higjena/Goja',
    to: 'dermokozmetikë/Fytyre',
    reason: 'Makeup remover, skincare not dental'
  },
  {
    issue: 'Now Oralbiotic Lozenges',
    from: 'produkte-shtese/Sete',
    to: 'farmaci/OTC (pa recete)',
    reason: 'Medicinal throat lozenges are OTC farmaci'
  }
]

let fixCount = 0

fixes.forEach(fix => {
  const [fromCat, fromSub] = fix.from.split('/')
  const [toCat, toSub] = fix.to.split('/')
  
  db.run(
    `UPDATE products 
     SET category = ?, subcategory = ?
     WHERE name LIKE ? AND category = ? AND subcategory = ?`,
    [toCat, toSub, `%${fix.issue}%`, fromCat, fromSub],
    function(err) {
      if (err) {
        console.error(`❌ Error fixing "${fix.issue}": ${err.message}`)
      } else if (this.changes > 0) {
        fixCount += this.changes
        console.log(`✅ "${fix.issue}"`)
        console.log(`   FROM: ${fix.from}`)
        console.log(`   TO:   ${fix.to}`)
        console.log(`   REASON: ${fix.reason}\n`)
      }
    }
  )
})

setTimeout(() => {
  console.log(`\n🎯 Total critical fixes applied: ${fixCount}\n`)
  
  // Now verify the fixes
  console.log('🔍 VERIFICATION:\n')
  
  const toCheck = [
    { name: 'Nuxe Prodigieuse Florale le parfum', expected: 'dermokozmetikë/Fytyre' },
    { name: 'Klorane Floral Water Make-Up Remove', expected: 'dermokozmetikë/Fytyre' },
    { name: 'Now Oralbiotic Lozenges', expected: 'farmaci/OTC (pa recete)' }
  ]
  
  toCheck.forEach(item => {
    db.get(
      `SELECT name, category, subcategory FROM products WHERE name LIKE ?`,
      [`%${item.name}%`],
      (err, row) => {
        if (err) {
          console.error(`Error: ${err.message}`)
        } else if (row) {
          const actual = `${row.category}/${row.subcategory}`
          const status = actual === item.expected ? '✅' : '❌'
          console.log(`${status} ${row.name}`)
          console.log(`   Expected: ${item.expected}`)
          console.log(`   Actual:   ${actual}\n`)
        }
      }
    )
  })

  setTimeout(() => {
    db.close()
  }, 1000)
}, 1500)
