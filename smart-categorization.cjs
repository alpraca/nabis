const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Smart categorization rules based on brand + product name patterns
const rules = [
  // MAMA DHE BEBAT - Mirëqenia Seksuale (Durex, Trojan, etc.)
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Mirëqenia seksuale',
    triggers: [
      { field: 'brand', values: ['durex', 'trojan', 'control', 'mates', 'lifestyles'] },
      { field: 'name', keywords: ['condom', 'preservative', 'prezervatif', 'durex', 'trojan'] }
    ]
  },
  
  // MAMA DHE BEBAT - SPF për Fëmijë
  {
    category: 'mama-dhe-bebat',
    subcategory: 'SPF',
    triggers: [
      { field: 'name', keywords: ['kids sun', 'children sun', 'baby sun', 'spf bebe', 'sunscreen baby', 'bebe sun'] },
      { field: 'description', keywords: ['kids spf', 'children spf', 'baby protection', 'foshnje'] }
    ]
  },
  
  // MAMA DHE BEBAT - Sete (Baby sets, kits)
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Suplemente',
    triggers: [
      { field: 'name', keywords: ['baby set', 'kit bebe', 'gift set baby', 'starter kit'] },
      { field: 'description', keywords: ['baby kit', 'newborn set', 'baby care set'] }
    ]
  },
  
  // FARMACI - OTC
  {
    category: 'farmaci',
    subcategory: 'OTC (pa recete)',
    triggers: [
      { field: 'brand', values: ['ibuprofen', 'paracetamol', 'aspirin', 'naproxen'] },
      { field: 'name', keywords: ['ibuprofen', 'paracetamol', 'aspirin', 'pain relief', 'fever'] }
    ]
  },
  
  // FARMACI - Mirëqenia Seksuale
  {
    category: 'farmaci',
    subcategory: 'Mirëqenia seksuale',
    triggers: [
      { field: 'brand', values: ['durex', 'trojan', 'control', 'mates', 'lifestyles', 'ansell'] },
      { field: 'name', keywords: ['condom', 'preservative', 'prezervatif', 'intimate'] }
    ]
  },
  
  // PRODUKTE SHTESË - Sete
  {
    category: 'produkte-shtese',
    subcategory: 'Sete',
    triggers: [
      { field: 'name', keywords: ['set', 'kit', 'gift set', 'pack', 'bundle', 'collection'] },
      { field: 'description', keywords: ['set of', 'kit includes', 'gift package'] }
    ]
  },
  
  // PRODUKTE SHTESË - Vajra Esencial
  {
    category: 'produkte-shtese',
    subcategory: 'Vajra Esencial',
    triggers: [
      { field: 'brand', values: ['now', 'doterra', 'young living', 'aroma'] },
      { field: 'name', keywords: ['essential oil', 'oil', 'aroma', 'diffuser', 'lavender', 'eucalyptus'] },
      { field: 'description', keywords: ['essential oil', 'aromatherapy', 'pure oil'] }
    ]
  },
  
  // SUPLEMENTE - Çajra Mjekësore
  {
    category: 'suplemente',
    subcategory: 'Çajra Mjekësore',
    triggers: [
      { field: 'brand', values: ['twinings', 'lipton', 'Ahmad', 'dilmah'] },
      { field: 'name', keywords: ['tea', 'herbal', 'çaj', 'infusion', 'blend', 'ginger tea', 'chamomile'] },
      { field: 'description', keywords: ['herbal tea', 'tea blend', 'infusion'] }
    ]
  },
  
  // SUPLEMENTE - Proteinë dhe Fitness
  {
    category: 'suplemente',
    subcategory: 'Proteinë dhe Fitness',
    triggers: [
      { field: 'brand', values: ['optimum', 'isopure', 'xpure', 'musclepharm', 'celltech'] },
      { field: 'name', keywords: ['protein', 'creatine', 'bcaa', 'whey', 'pre-workout', 'post-workout'] },
      { field: 'description', keywords: ['protein powder', 'workout', 'fitness', 'muscle'] }
    ]
  },
  
  // SUPLEMENTE - Suplementet Natyrore
  {
    category: 'suplemente',
    subcategory: 'Suplementet Natyrore',
    triggers: [
      { field: 'name', keywords: ['ginseng', 'turmeric', 'curcumin', 'echinacea', 'goldenseal', 'garlic'] },
      { field: 'description', keywords: ['natural extract', 'herbal supplement', 'plant-based'] }
    ]
  },
  
  // HIGJENA - Depilim dhe Intime
  {
    category: 'higjena',
    subcategory: 'Depilim dhe Intime',
    triggers: [
      { field: 'name', keywords: ['depilation', 'wax', 'razor', 'intimate care', 'vaginal', 'intime'] },
      { field: 'brand', values: ['veet', 'nair', 'shaving gel'] }
    ]
  },
  
  // HIGJENA - Këmbët
  {
    category: 'higjena',
    subcategory: 'Këmbët',
    triggers: [
      { field: 'name', keywords: ['foot', 'feet', 'shoe', 'toenail', 'corn', 'callus', 'këmbë'] },
      { field: 'description', keywords: ['foot care', 'feet treatment'] }
    ]
  }
]

let totalUpdated = 0

console.log('🔍 Smart categorization in progress...\n')

// Get all products without proper subcategory
db.all(`
  SELECT id, name, brand, description, category, subcategory 
  FROM products 
  WHERE category IN ('farmaci', 'produkte-shtese', 'higjena')
  OR (category = 'mama-dhe-bebat' AND subcategory IS NULL)
  LIMIT 5000
`, [], (err, products) => {
  if (err) {
    console.error('Error fetching products:', err)
    process.exit(1)
  }

  console.log(`Processing ${products.length} products...\n`)

  products.forEach(product => {
    // Find matching rule
    rules.forEach(rule => {
      let matches = false

      // Check triggers
      rule.triggers.forEach(trigger => {
        if (matches) return

        const fieldValue = product[trigger.field]?.toLowerCase() || ''

        if (trigger.values) {
          // Brand/exact match
          matches = trigger.values.some(val => fieldValue.includes(val.toLowerCase()))
        } else if (trigger.keywords) {
          // Keyword search
          matches = trigger.keywords.some(keyword => fieldValue.includes(keyword.toLowerCase()))
        }
      })

      if (matches && product.category !== rule.category) {
        // Update product
        const query = `
          UPDATE products 
          SET category = ?, subcategory = ?
          WHERE id = ?
        `
        
        db.run(query, [rule.category, rule.subcategory, product.id], function(err) {
          if (err) {
            console.error(`❌ Error updating product ${product.id}:`, err.message)
          } else if (this.changes > 0) {
            totalUpdated++
            console.log(`✓ "${product.name.substring(0, 50)}"`)
            console.log(`  ${product.category} → ${rule.category}/${rule.subcategory}\n`)
          }
        })
      }
    })
  })

  setTimeout(() => {
    console.log(`\n✅ Total recategorized: ${totalUpdated}\n`)
    
    // Show summary
    db.all(`
      SELECT category, subcategory, COUNT(*) as cnt 
      FROM products 
      GROUP BY category, subcategory
      ORDER BY category, subcategory
    `, [], (err, rows) => {
      if (err) console.error(err)
      
      console.log('📊 FINAL STRUCTURE:\n')
      let currentCat = ''
      let catTotal = 0
      
      rows.forEach((r, idx) => {
        if (currentCat !== r.category) {
          if (currentCat) {
            console.log(`  TOTAL: ${catTotal}\n`)
          }
          currentCat = r.category
          catTotal = 0
          console.log(`${r.category}:`)
        }
        catTotal += r.cnt
        const subcat = r.subcategory || '(none)'
        console.log(`  ├─ ${subcat}: ${r.cnt}`)
        
        if (idx === rows.length - 1) {
          console.log(`  TOTAL: ${catTotal}\n`)
        }
      })
      
      db.close()
    })
  }, 2000)
})
