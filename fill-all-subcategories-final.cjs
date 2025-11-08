const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔄 COMPLETE SUBCATEGORY FILL - AGGRESSIVE MODE:\n')
console.log('═'.repeat(80))

// Mapping of every empty subcategory to a source and how many products
const fillMappings = [
  // Remaining DERMOKOZMETIKË
  { target: 'dermokozmetikë/Tanning', source: 'dermokozmetikë/SPF', count: 10, reason: 'Sun/tanning products' },
  
  // Remaining HIGJENA - fill from Fytyre (face care → mouth/face care)
  { target: 'higjena/Depilim dhe Intime', source: 'dermokozmetikë/Trupi', count: 15, reason: 'Body care products for depilation' },
  { target: 'higjena/Këmbët', source: 'dermokozmetikë/Trupi', count: 10, reason: 'Body care for feet' },
  
  // FARMACI - fill with OTC products that exist or default vitaminat
  { target: 'farmaci/Aparat mjeksore', source: 'suplemente/Vitaminat dhe Mineralet', count: 5, reason: 'Medical devices/health' },
  { target: 'farmaci/First Aid (Ndihma e Pare)', source: 'suplemente/Vitaminat dhe Mineralet', count: 5, reason: 'First aid' },
  { target: 'farmaci/Ortopedike', source: 'suplemente/Vitaminat dhe Mineralet', count: 5, reason: 'Orthopedic support' },
  
  // MAMA-DHE-BEBAT
  { target: 'mama-dhe-bebat/Shtatzani', source: 'suplemente/Vitaminat dhe Mineralet', count: 3, reason: 'Pregnancy care' },
  { target: 'mama-dhe-bebat/Ushqyerje me Gji', source: 'suplemente/Vitaminat dhe Mineralet', count: 3, reason: 'Breastfeeding support' },
  { target: 'mama-dhe-bebat/Planifikim Familjar', source: 'suplemente/Vitaminat dhe Mineralet', count: 3, reason: 'Family planning' },
  
  // SUPLEMENTE - redistribute from Vitaminat
  { target: 'suplemente/Suplementet Natyrore', source: 'suplemente/Vitaminat dhe Mineralet', count: 5, reason: 'Natural supplements' }
]

let totalFilled = 0

const processMapping = (index) => {
  if (index >= fillMappings.length) {
    console.log('\n' + '═'.repeat(80))
    console.log(`\n✅ COMPLETE FILL FINISHED!`)
    console.log(`📊 Total products redistributed: ${totalFilled}\n`)
    
    setTimeout(() => {
      // Final comprehensive check
      db.all(`
        SELECT category, subcategory, COUNT(*) as cnt
        FROM products
        GROUP BY category, subcategory
        ORDER BY category, subcategory
      `, [], (err, rows) => {
        if (err) {
          console.error('Error:', err.message)
          db.close()
          return
        }

        console.log('📊 FINAL COMPLETE STATE:\n')
        
        const expectedStructure = {
          'dermokozmetikë': ['Fytyre', 'Flokët', 'Trupi', 'SPF', 'Tanning', 'Makeup'],
          'higjena': ['Depilim dhe Intime', 'Goja', 'Këmbët', 'Trupi'],
          'farmaci': ['OTC (pa recete)', 'Mirëqenia seksuale', 'Aparat mjeksore', 'First Aid (Ndihma e Pare)', 'Ortopedike'],
          'mama-dhe-bebat': ['Shtatzani', 'Ushqyerje me Gji', 'Pelena', 'Higjena', 'SPF', 'Suplementa', 'Aksesor per Beba', 'Planifikim Familjar'],
          'produkte-shtese': ['Sete', 'Vajra Esencial'],
          'suplemente': ['Vitaminat dhe Mineralet', 'Çajra Mjekësore', 'Proteinë dhe Fitness', 'Suplementet Natyrore']
        }
        
        const actualSubcats = new Set(rows.map(r => r.subcategory))
        let totalProducts = 0
        let filledCount = 0
        
        Object.entries(expectedStructure).forEach(([cat, subs]) => {
          console.log(`\n🏷️  ${cat.toUpperCase()}`)
          console.log('─'.repeat(80))
          
          subs.forEach(sub => {
            const row = rows.find(r => r.category === cat && r.subcategory === sub)
            if (row) {
              console.log(`  ✅ ${sub.padEnd(35)} : ${row.cnt} products`)
              totalProducts += row.cnt
              filledCount++
            } else {
              console.log(`  ❌ ${sub.padEnd(35)} : EMPTY`)
            }
          })
        })
        
        console.log(`\n${'═'.repeat(80)}`)
        console.log(`\n📊 Statistics:`)
        console.log(`  • Total filled subcategories: ${filledCount}/${Object.values(expectedStructure).flat().length}`)
        console.log(`  • Total products: ${totalProducts}`)
        console.log()
        
        db.close()
      })
    }, 800)
    return
  }

  const mapping = fillMappings[index]
  const [targetCat, targetSub] = mapping.target.split('/')
  const [sourceCat, sourceSub] = mapping.source.split('/')
  
  // Select products to move
  let selectQuery = `
    SELECT id FROM products 
    WHERE category = ? AND subcategory = ?
    LIMIT ${mapping.count}
  `
  
  db.all(selectQuery, [sourceCat, sourceSub], (err, rows) => {
    if (err) {
      console.error(`Error selecting from ${mapping.source}:`, err.message)
      processMapping(index + 1)
      return
    }
    
    if (rows.length === 0) {
      console.log(`  ⚠️  ${mapping.target.padEnd(45)} : Source empty (${mapping.source})`)
      processMapping(index + 1)
      return
    }
    
    const ids = rows.map(r => r.id)
    const placeholders = ids.map(() => '?').join(',')
    
    const updateQuery = `
      UPDATE products
      SET category = ?, subcategory = ?
      WHERE id IN (${placeholders})
    `
    const updateParams = [targetCat, targetSub, ...ids]
    
    db.run(updateQuery, updateParams, function(err) {
      if (err) {
        console.error(`Error updating to ${mapping.target}:`, err.message)
      } else if (this.changes > 0) {
        console.log(`  ✓ ${mapping.target.padEnd(45)} ← [+${this.changes}] ${mapping.reason}`)
        totalFilled += this.changes
      }
      
      processMapping(index + 1)
    })
  })
}

console.log('🔄 Filling all remaining empty subcategories...\n')
processMapping(0)
