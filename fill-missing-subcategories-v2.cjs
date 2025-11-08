const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔧 FILLING MISSING SUBCATEGORIES:\n')
console.log('═'.repeat(70))

// Smart redistribution rules: move products from populated to empty subcategories
const redistributeRules = [
  // DERMOKOZMETIKË: Tanning can come from SPF products (sun care)
  {
    from: { category: 'dermokozmetikë', subcategory: 'SPF' },
    to: { category: 'dermokozmetikë', subcategory: 'Tanning' },
    keywords: ['tanning', 'bronzer', 'self-tan', 'spray tan', 'gradual'],
    count: 5
  },
  
  // HIGJENA: Goja (dental) - from face care products with mouth keywords
  {
    from: { category: 'dermokozmetikë', subcategory: 'Fytyre' },
    to: { category: 'higjena', subcategory: 'Goja' },
    keywords: ['oral', 'mouth', 'breath', 'lip'],
    count: 3
  },
  
  // HIGJENA: Depilim dhe Intime - from body care
  {
    from: { category: 'dermokozmetikë', subcategory: 'Trupi' },
    to: { category: 'higjena', subcategory: 'Depilim dhe Intime' },
    keywords: ['depilation', 'wax', 'razor', 'intimate', 'sensitive area'],
    count: 3
  },
  
  // HIGJENA: Këmbët - from body care
  {
    from: { category: 'dermokozmetikë', subcategory: 'Trupi' },
    to: { category: 'higjena', subcategory: 'Këmbët' },
    keywords: ['foot', 'feet', 'toenail', 'corn', 'callus'],
    count: 3
  },
  
  // HIGJENA: Trupi - general body wash from dermokozmetikë
  {
    from: { category: 'dermokozmetikë', subcategory: 'Trupi' },
    to: { category: 'higjena', subcategory: 'Trupi' },
    keywords: ['body wash', 'body gel', 'body soap'],
    count: 5
  },
  
  // SUPLEMENTE: Çajra Mjekësore - from Vitaminat
  {
    from: { category: 'suplemente', subcategory: 'Vitaminat dhe Mineralet' },
    to: { category: 'suplemente', subcategory: 'Çajra Mjekësore' },
    keywords: ['tea', 'herbal', 'çaj', 'tisane', 'infusion'],
    count: 4
  },
  
  // SUPLEMENTE: Proteinë dhe Fitness - from Vitaminat
  {
    from: { category: 'suplemente', subcategory: 'Vitaminat dhe Mineralet' },
    to: { category: 'suplemente', subcategory: 'Proteinë dhe Fitness' },
    keywords: ['protein', 'creatine', 'bcaa', 'amino', 'whey', 'fitness', 'workout'],
    count: 5
  },
  
  // SUPLEMENTE: Suplementet Natyrore - from Vitaminat
  {
    from: { category: 'suplemente', subcategory: 'Vitaminat dhe Mineralet' },
    to: { category: 'suplemente', subcategory: 'Suplementet Natyrore' },
    keywords: ['natural', 'organic', 'herbal', 'plant', 'extract', 'root', 'ginseng', 'turmeric'],
    count: 4
  },
  
  // MAMA-DHE-BEBAT: SPF - from main SPF
  {
    from: { category: 'dermokozmetikë', subcategory: 'SPF' },
    to: { category: 'mama-dhe-bebat', subcategory: 'SPF' },
    keywords: ['baby', 'kids', 'children'],
    count: 5
  },
  
  // MAMA-DHE-BEBAT: Shtatzani - from supplements
  {
    from: { category: 'suplemente', subcategory: 'Vitaminat dhe Mineralet' },
    to: { category: 'mama-dhe-bebat', subcategory: 'Shtatzani' },
    keywords: ['pregnancy', 'prenatal', 'mother'],
    count: 2
  },
  
  // MAMA-DHE-BEBAT: Ushqyerje me Gji - from supplements
  {
    from: { category: 'suplemente', subcategory: 'Vitaminat dhe Mineralet' },
    to: { category: 'mama-dhe-bebat', subcategory: 'Ushqyerje me Gji' },
    keywords: ['lactation', 'breastfeed', 'nursing'],
    count: 2
  },
  
  // MAMA-DHE-BEBAT: Planifikim Familjar - from suplemente
  {
    from: { category: 'suplemente', subcategory: 'Vitaminat dhe Mineralet' },
    to: { category: 'mama-dhe-bebat', subcategory: 'Planifikim Familjar' },
    keywords: ['planning', 'family', 'contraceptive'],
    count: 2
  }
]

let totalMoved = 0

// Process each redistribution rule with proper pagination
const processRule = (index) => {
  if (index >= redistributeRules.length) {
    console.log('\n' + '═'.repeat(70))
    console.log(`\n✅ REDISTRIBUTION COMPLETE!`)
    console.log(`📊 Total products moved: ${totalMoved}\n`)
    
    setTimeout(() => {
      // Show final state
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

        console.log('\n📊 FINAL STATE:\n')
        
        let currentCat = ''
        rows.forEach(row => {
          if (currentCat !== row.category) {
            if (currentCat) console.log()
            currentCat = row.category
            console.log(`${row.category.toUpperCase()}`)
          }
          console.log(`  • ${row.subcategory.padEnd(30)} : ${row.cnt}`)
        })
        
        console.log()
        db.close()
      })
    }, 500)
    return
  }

  const rule_item = redistributeRules[index]
  
  // First, select the IDs to update
  let selectQuery = `
    SELECT id FROM products 
    WHERE category = ? AND subcategory = ?
  `
  let selectParams = [rule_item.from.category, rule_item.from.subcategory]
  
  // Add keyword filter if specified
  if (rule_item.keywords && rule_item.keywords.length > 0) {
    const keywordConditions = rule_item.keywords.map(() => '(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)').join(' OR ')
    selectQuery += ` AND (${keywordConditions})`
    rule_item.keywords.forEach(kw => {
      selectParams.push(`%${kw}%`, `%${kw}%`)
    })
  }
  
  selectQuery += ` LIMIT ${rule_item.count}`
  
  db.all(selectQuery, selectParams, (err, rows) => {
    if (err) {
      console.error(`Error selecting for rule ${index}:`, err.message)
      processRule(index + 1)
      return
    }
    
    if (rows.length === 0) {
      processRule(index + 1)
      return
    }
    
    // Now update the selected IDs
    const ids = rows.map(r => r.id)
    const placeholders = ids.map(() => '?').join(',')
    
    const updateQuery = `
      UPDATE products
      SET category = ?, subcategory = ?
      WHERE id IN (${placeholders})
    `
    const updateParams = [rule_item.to.category, rule_item.to.subcategory, ...ids]
    
    db.run(updateQuery, updateParams, function(err) {
      if (err) {
        console.error(`Error updating for rule ${index}:`, err.message)
      } else if (this.changes > 0) {
        const from = `${rule_item.from.category}/${rule_item.from.subcategory}`
        const to = `${rule_item.to.category}/${rule_item.to.subcategory}`
        console.log(`  ✓ ${from.padEnd(45)} → ${to.padEnd(45)} : +${this.changes}`)
        totalMoved += this.changes
      }
      
      processRule(index + 1)
    })
  })
}

console.log('🔄 Moving products to empty subcategories...\n')
processRule(0)
