const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔧 FIXING MISPLACED PRODUCTS...\n')

const fixes = [
  {
    name: 'klorane bebe protective toilet powder 100g',
    newCategory: 'mama-dhe-bebat',
    newSubcategory: 'Higjena',
    reason: 'Baby toilet powder - belongs in baby hygiene'
  },
  {
    name: 'now inulin prebiotic pure powder',
    newCategory: 'suplemente',
    newSubcategory: 'Vitaminat dhe Mineralet',
    reason: 'Prebiotic supplement - belongs in supplements'
  },
  {
    name: 'korff cure make up classic eyeshadow brush',
    newCategory: 'produkte-shtese',
    newSubcategory: 'Aksesor',
    reason: 'Makeup brush tool - belongs in accessories'
  },
  {
    name: 'korff cure make up concealer brush',
    newCategory: 'produkte-shtese',
    newSubcategory: 'Aksesor',
    reason: 'Makeup brush tool - belongs in accessories'
  },
  {
    name: 'korff cure make up double eyeshadow brush',
    newCategory: 'produkte-shtese',
    newSubcategory: 'Aksesor',
    reason: 'Makeup brush tool - belongs in accessories'
  },
  {
    name: 'korff cure make up eyebuki eyeshadow brush',
    newCategory: 'produkte-shtese',
    newSubcategory: 'Aksesor',
    reason: 'Makeup brush tool - belongs in accessories'
  },
  {
    name: 'korff cure make up flat powder brush',
    newCategory: 'produkte-shtese',
    newSubcategory: 'Aksesor',
    reason: 'Makeup brush tool - belongs in accessories'
  },
  {
    name: 'korff cure make up oval foundation brush',
    newCategory: 'produkte-shtese',
    newSubcategory: 'Aksesor',
    reason: 'Makeup brush tool - belongs in accessories'
  }
]

let fixed = 0
let failed = 0

const processNextFix = (index) => {
  if (index >= fixes.length) {
    console.log(`\n✅ COMPLETE!`)
    console.log(`   Fixed: ${fixed}`)
    console.log(`   Failed: ${failed}\n`)
    db.close()
    return
  }

  const fix = fixes[index]
  
  db.run(
    `UPDATE products 
     SET category = ?, subcategory = ?
     WHERE LOWER(name) LIKE LOWER(?)`,
    [fix.newCategory, fix.newSubcategory, `%${fix.name}%`],
    function(err) {
      if (err) {
        console.log(`❌ Error fixing "${fix.name}": ${err.message}`)
        failed++
      } else if (this.changes > 0) {
        console.log(`✅ Fixed: ${fix.name}`)
        console.log(`   → ${fix.newCategory}/${fix.newSubcategory}`)
        console.log(`   Reason: ${fix.reason}\n`)
        fixed += this.changes
      } else {
        console.log(`⚠️  Not found: ${fix.name}\n`)
        failed++
      }
      
      processNextFix(index + 1)
    }
  )
}

processNextFix(0)
