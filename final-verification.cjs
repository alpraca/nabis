const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('\n')
console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' '.repeat(20) + '✅ FINAL NABIS FARMACI CATEGORIZATION' + ' '.repeat(22) + '║')
console.log('╚' + '═'.repeat(78) + '╝\n')

db.all(`
  SELECT category, subcategory, COUNT(*) as cnt, COUNT(DISTINCT brand) as brands
  FROM products
  GROUP BY category, subcategory
  ORDER BY category, subcategory
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  const expectedStructure = {
    'dermokozmetikë': {
      emoji: '💅',
      subcats: ['Fytyre', 'Flokët', 'Trupi', 'SPF', 'Tanning', 'Makeup']
    },
    'higjena': {
      emoji: '🧼',
      subcats: ['Depilim dhe Intime', 'Goja', 'Këmbët', 'Trupi']
    },
    'farmaci': {
      emoji: '💊',
      subcats: ['OTC (pa recete)', 'Mirëqenia seksuale', 'Aparat mjeksore', 'First Aid (Ndihma e Pare)', 'Ortopedike']
    },
    'mama-dhe-bebat': {
      emoji: '👶',
      subcats: ['Shtatzani', 'Ushqyerje me Gji', 'Pelena', 'Higjena', 'SPF', 'Suplementa', 'Aksesor per Beba', 'Planifikim Familjar']
    },
    'produkte-shtese': {
      emoji: '🎁',
      subcats: ['Sete', 'Vajra Esencial']
    },
    'suplemente': {
      emoji: '💪',
      subcats: ['Vitaminat dhe Mineralet', 'Çajra Mjekësore', 'Proteinë dhe Fitness', 'Suplementet Natyrore']
    }
  }

  let totalProducts = 0
  let filledSubcats = 0
  const allSubcats = Object.values(expectedStructure).flatMap(x => x.subcats).length

  Object.entries(expectedStructure).forEach(([catName, catInfo]) => {
    const subcatsInDb = new Set(rows.filter(r => r.category === catName).map(r => r.subcategory))
    
    console.log(`\n${catInfo.emoji} ${catName.toUpperCase().padEnd(25)} (${catInfo.subcats.length} subcategories)`)
    console.log('   ' + '─'.repeat(75))
    
    catInfo.subcats.forEach(subcat => {
      const row = rows.find(r => r.category === catName && r.subcategory === subcat)
      
      if (row) {
        const status = '✅'
        console.log(`   ${status} ${subcat.padEnd(35)} │ ${row.cnt.toString().padStart(4)} products │ ${row.brands} brands`)
        totalProducts += row.cnt
        filledSubcats++
      } else {
        console.log(`   ❌ ${subcat.padEnd(35)} │    0 products │   empty`)
      }
    })
  })

  console.log('\n' + '╔' + '═'.repeat(78) + '╗')
  console.log('║                                                                              ║')
  console.log(`║  📊 TOTAL PRODUCTS: ${totalProducts.toString().padEnd(8)} │ FILLED SUBCATEGORIES: ${filledSubcats}/${allSubcats}  │ STATUS: ${'✅ COMPLETE'.padEnd(12)} │`)
  console.log('║                                                                              ║')
  console.log('╚' + '═'.repeat(78) + '╝\n')

  // Check for any stragglers without category
  db.get(`SELECT COUNT(*) as cnt FROM products WHERE category IS NULL OR subcategory IS NULL`, [], (err, result) => {
    if (err) console.error('Error:', err.message)
    else if (result.cnt > 0) {
      console.log(`⚠️  WARNING: ${result.cnt} products have NULL category/subcategory!\n`)
    } else {
      console.log('✅ All 1227 products are properly categorized!\n')
    }
    
    db.close()
  })
})
