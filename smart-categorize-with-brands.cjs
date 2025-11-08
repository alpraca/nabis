const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Brand-based classification (much more reliable!)
const brandRules = [
  // DERMOKOZMETIKË - Fytyre brands
  {
    category: 'dermokozmetikë',
    subcategory: 'Fytyre',
    brands: ['avene', 'eucerin', 'cetaphil', 'la roche', 'roche', 'vichy', 'ducray', 'bioderma', 'bepanthen', 'neutrogena', 'cetyl', 'caudalie', 'nuxe', 'klorane', 'weleda', 'natural'],
    includesKeywords: ['face', 'facial', 'serum', 'toner', 'cleanser', 'cream', 'therapy']
  },
  // DERMOKOZMETIKË - Flokët brands
  {
    category: 'dermokozmetikë',
    subcategory: 'Flokët',
    brands: ['schauma', 'syoss', 'gliss', 'pantene', 'garnier', 'schwarzkopf', 'wella', 'tresemme', 'clear', 'head shoulders', 'kérastase', 'l\'oreal', 'loreal'],
    includesKeywords: ['shampoo', 'conditioner', 'hair', 'scalp']
  },
  // DERMOKOZMETIKË - Trupi brands
  {
    category: 'dermokozmetikë',
    subcategory: 'Trupi',
    brands: ['dove', 'lux', 'palmolive', 'nivea', 'body', 'bath', 'soap'],
    includesKeywords: ['body', 'shower', 'soap', 'gel', 'lotion']
  },
  // HIGJENA - Goja brands
  {
    category: 'higjena',
    subcategory: 'Goja',
    brands: ['colgate', 'signal', 'oral', 'meridol', 'perio', 'parodontol', 'sensodyne', 'elmex', 'blend', 'spar', 'gum', 'listerine', 'waterpik'],
    includesKeywords: ['tooth', 'toothpaste', 'toothbrush', 'oral', 'dental', 'gum', 'mouth', 'oral-b']
  },
  // FARMACI - OTC
  {
    category: 'farmaci',
    subcategory: 'OTC (pa recete)',
    brands: ['ibuprofen', 'tylenol', 'advil', 'ben-u-ron', 'aspirin', 'paracetamol', 'lemsip', 'strepsils', 'throat', 'cough'],
    includesKeywords: ['relief', 'pain', 'fever', 'cold', 'flu', 'throat', 'cough', 'sore']
  },
  // FARMACI - Condoms
  {
    category: 'farmaci',
    subcategory: 'Mirëqenia seksuale',
    brands: ['durex', 'trojan', 'ansell', 'control'],
    includesKeywords: []
  },
  // MAMA DHE BEBAT - Pelena
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Pelena',
    brands: ['pampers', 'huggies', 'libero', 'moltex', 'diaper', 'pelena', 'nappy'],
    includesKeywords: ['diaper', 'nappy']
  },
  // MAMA DHE BEBAT - Aksesor
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Aksesor per Beba',
    brands: ['dr brown', 'tommee tippee', 'philips avent', 'mam', 'suavinex', 'nuk', 'bottle', 'teether', 'pacifier', 'brush', 'toothbrush'],
    includesKeywords: ['bottle', 'brush', 'pacifier', 'teether', 'toy', 'stroller', 'chair', 'crib']
  },
  // SUPLEMENTE - Vitaminat
  {
    category: 'suplemente',
    subcategory: 'Vitaminat dhe Mineralet',
    brands: ['vitabiotics', 'wellbaby', 'wellkid', 'wellman', 'wellwoman', 'vitamin', 'centrum', 'one-a-day', 'multi', 'nutrilett', 'ultra'],
    includesKeywords: ['vitamin', 'mineral', 'supplement', 'tablet', 'capsule']
  }
]

// Process by brand/inclusion keywords
console.log('🔍 Applying brand-based rules...\n')

let brandUpdates = 0

brandRules.forEach(rule => {
  rule.brands.forEach(brand => {
    const query = `
      UPDATE products 
      SET subcategory = ?
      WHERE LOWER(category) = LOWER(?)
      AND (LOWER(brand) LIKE ? OR LOWER(name) LIKE ?)
      AND subcategory IS NULL
    `
    
    const searchTerm = `%${brand}%`
    
    db.run(query, [rule.subcategory, rule.category, searchTerm, searchTerm], function(err) {
      if (err) {
        console.error(`Error: ${err.message}`)
      } else if (this.changes > 0) {
        brandUpdates += this.changes
        console.log(`  ✓ Brand "${brand}" → ${rule.category}/${rule.subcategory}: +${this.changes}`)
      }
    })
  })
})

setTimeout(() => {
  console.log(`\n✅ Brand updates: ${brandUpdates}\n`)
  
  // Now assign remaining with defaults
  console.log('🔄 Assigning remaining products to defaults...\n')
  
  const defaults = {
    'dermokozmetikë': 'Fytyre',
    'higjena': 'Goja',
    'farmaci': 'OTC (pa recete)',
    'mama-dhe-bebat': 'Suplementa',
    'produkte-shtese': 'Sete',
    'suplemente': 'Vitaminat dhe Mineralet'
  }
  
  let defaultUpdates = 0
  
  Object.entries(defaults).forEach(([cat, subcat]) => {
    db.run(
      `UPDATE products SET subcategory = ? WHERE LOWER(category) = LOWER(?) AND subcategory IS NULL`,
      [subcat, cat],
      function(err) {
        if (err) {
          console.error(`Error: ${err.message}`)
        } else if (this.changes > 0) {
          defaultUpdates += this.changes
          console.log(`  ✓ ${cat} → default ${subcat}: +${this.changes}`)
        }
      }
    )
  })

  setTimeout(() => {
    console.log(`\n✅ Default assignments: ${defaultUpdates}\n`)
    
    // Final summary
    db.all(`
      SELECT category, subcategory, COUNT(*) as cnt 
      FROM products 
      GROUP BY category, subcategory
      ORDER BY category, subcategory
    `, [], (err, rows) => {
      if (err) console.error(err)
      
      console.log('\n📊 ════════════════════════════════════════')
      console.log('📊 FINAL CATEGORIZATION - ALL PRODUCTS:')
      console.log('📊 ════════════════════════════════════════\n')
      
      let currentCat = ''
      let catTotal = 0
      let grandTotal = 0
      
      rows.forEach((r, idx) => {
        if (currentCat !== r.category) {
          if (currentCat) {
            console.log(`  ╰─ SUBTOTAL: ${catTotal}\n`)
          }
          currentCat = r.category
          catTotal = 0
          console.log(`\n📦 ${r.category.toUpperCase()}`)
          console.log('   ────────────────────────────')
        }
        catTotal += r.cnt
        grandTotal += r.cnt
        console.log(`   ├─ ${r.subcategory || '(unassigned)'}: ${r.cnt}`)
        
        if (idx === rows.length - 1) {
          console.log(`  ╰─ SUBTOTAL: ${catTotal}\n`)
        }
      })
      
      console.log('📊 ════════════════════════════════════════')
      console.log(`✅ GRAND TOTAL: ${grandTotal} products\n`)
      
      db.close()
    })
  }, 2000)
}, 2000)
