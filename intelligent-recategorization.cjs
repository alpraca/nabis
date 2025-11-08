const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔧 INTELLIGENT RE-CATEGORIZATION - MOVING MISPLACED PRODUCTS\n')
console.log('═'.repeat(100) + '\n')

// Define correct categories for products based on keywords
const recategorizationRules = [
  // ATC TEAS → Suplemente
  {
    condition: product => product.name.toLowerCase().includes('çaj') && product.brand.toLowerCase() === 'atc',
    newCategory: 'suplemente',
    newSubcategory: 'Çajra Mjekësore',
    reason: 'ATC medicinal tea'
  },
  // INFANT FORMULAS → Mama-dhe-Bebat
  {
    condition: product => {
      const name = product.name.toLowerCase()
      return ['aptamil', 'hipp', 'holle', 'formula', 'milk 1', 'milk 2', 'combiotic'].some(term => name.includes(term))
    },
    newCategory: 'mama-dhe-bebat',
    newSubcategory: 'Ushqim',
    reason: 'Infant formula/baby food'
  },
  // BABY DIAPERS → Mama-dhe-Bebat
  {
    condition: product => {
      const name = product.name.toLowerCase()
      return ['diaper', 'diapers', 'pants', 'wet wipes'].some(term => name.includes(term))
    },
    newCategory: 'mama-dhe-bebat',
    newSubcategory: 'Pelena',
    reason: 'Baby diapers/wipes'
  },
  // BABY ACCESSORIES → Mama-dhe-Bebat
  {
    condition: product => {
      const name = product.name.toLowerCase()
      const brand = product.brand.toLowerCase()
      return (name.includes('nipple') || name.includes('bottle brush') || name.includes('soother')) &&
             (brand.includes('dr brown') || brand.includes('dr.brown'))
    },
    newCategory: 'mama-dhe-bebat',
    newSubcategory: 'Aksesor per Beba',
    reason: 'Baby bottle accessories'
  },
  // BLOOD GLUCOSE METERS → Farmaci (OTC)
  {
    condition: product => {
      const name = product.name.toLowerCase()
      return ['blood glucose', 'accu-check', 'contour', 'bionime'].some(term => name.includes(term))
    },
    newCategory: 'farmaci',
    newSubcategory: 'OTC (pa recete)',
    reason: 'Medical device/OTC'
  },
  // VITAMINS/SUPPLEMENTS IN WRONG PLACE
  {
    condition: product => {
      const name = product.name.toLowerCase()
      return ['kollagen', 'doppelherz', 'vitabiotics', 'solgar'].some(term => name.includes(term))
    },
    newCategory: 'suplemente',
    newSubcategory: 'Vitaminat dhe Mineralet',
    reason: 'Vitamin/supplement brand'
  },
  // OIL PRODUCTS → Suplemente or Produkte-shtese
  {
    condition: product => {
      const name = product.name.toLowerCase()
      const brand = product.brand.toLowerCase()
      return brand === 'bio' && name.includes('oil')
    },
    newCategory: 'produkte-shtese',
    newSubcategory: 'Produkte Natyrore',
    reason: 'Natural oils'
  },
  // TATTOO/PIERCING CARE → Higjena
  {
    condition: product => {
      const name = product.name.toLowerCase()
      return ['tattoo', 'piercing'].some(term => name.includes(term))
    },
    newCategory: 'higjena',
    newSubcategory: 'Trupat',
    reason: 'Tattoo/piercing aftercare'
  },
  // MALE GROOMING PRODUCTS → Dermokozmetikë/Fytyre or Higjena
  {
    condition: product => {
      const name = product.name.toLowerCase()
      return name.includes('after shave') || name.includes('mousse a raser')
    },
    newCategory: 'dermokozmetikë',
    newSubcategory: 'Fytyre',
    reason: 'Male grooming/aftercare'
  },
  // CELLULITE/BODY TREATMENTS → Dermokozmetikë or Produkte-shtese
  {
    condition: product => {
      const name = product.name.toLowerCase()
      const brand = product.brand.toLowerCase()
      return brand === 'guam' && (name.includes('crema') || name.includes('mud') || name.includes('leggings'))
    },
    newCategory: 'dermokozmetikë',
    newSubcategory: 'Trupat',
    reason: 'Body care/cellulite treatment'
  },
  // ELANCYL SERUMS → Dermokozmetikë
  {
    condition: product => product.brand.toLowerCase() === 'elancyl',
    newCategory: 'dermokozmetikë',
    newSubcategory: 'Trupat',
    reason: 'Anti-cellulite serum'
  },
  // MAKEUP BRUSHES THAT SLIPPED → Produkte-shtese
  {
    condition: product => {
      const name = product.name.toLowerCase()
      return name.includes('brush') && (name.includes('eyeshadow') || name.includes('foundation') || name.includes('powder'))
    },
    newCategory: 'produkte-shtese',
    newSubcategory: 'Aksesor',
    reason: 'Makeup brush tool'
  }
]

// Get all products
db.all(`SELECT * FROM products`, [], (err, products) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  const toUpdate = []
  let processedCount = 0

  products.forEach(product => {
    // Check each rule
    for (let rule of recategorizationRules) {
      if (rule.condition(product)) {
        // Check if it's already in the correct category
        if (product.category !== rule.newCategory || product.subcategory !== rule.newSubcategory) {
          toUpdate.push({
            product,
            newCategory: rule.newCategory,
            newSubcategory: rule.newSubcategory,
            reason: rule.reason
          })
        }
        break // Use first matching rule only
      }
    }
  })

  console.log(`Found ${toUpdate.length} products to recategorize:\n`)

  let updated = 0
  let failed = 0

  const processNext = (idx) => {
    if (idx >= toUpdate.length) {
      console.log(`\n✅ RECATEGORIZATION COMPLETE!`)
      console.log(`   Updated: ${updated}`)
      console.log(`   Failed: ${failed}\n`)
      db.close()
      return
    }

    const item = toUpdate[idx]
    const oldCat = `${item.product.category}/${item.product.subcategory}`
    const newCat = `${item.newCategory}/${item.newSubcategory}`

    db.run(
      `UPDATE products SET category = ?, subcategory = ? WHERE id = ?`,
      [item.newCategory, item.newSubcategory, item.product.id],
      function(err) {
        if (err) {
          console.log(`❌ Error: ${item.product.brand} ${item.product.name}`)
          failed++
        } else {
          console.log(`✅ ${item.product.brand.toUpperCase()} - ${item.product.name}`)
          console.log(`   ${oldCat} → ${newCat}`)
          console.log(`   Reason: ${item.reason}\n`)
          updated++
        }
        processNext(idx + 1)
      }
    )
  }

  processNext(0)
})
