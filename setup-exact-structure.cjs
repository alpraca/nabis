const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// THE EXACT STRUCTURE YOU WANT
const structure = {
  'dermokozmetikë': {
    'Fytyre': ['face', 'facial', 'visage', 'serum', 'toner', 'cleanser', 'masque', 'fytyrë'],
    'Flokët': ['hair', 'shampoo', 'conditioner', 'mask', 'floket', 'flokë'],
    'Trupi': ['body', 'lotion', 'butter', 'cream', 'oil', 'soap', 'shower', 'trupi'],
    'SPF': ['sun', 'sunscreen', 'spf', 'uv', 'protector'],
    'Tanning': ['tanning', 'bronzing', 'autobronz'],
    'Makeup': ['makeup', 'foundation', 'powder', 'mascara', 'lipstick']
  },
  'higjena': {
    'Goja': ['tooth', 'toothpaste', 'oral', 'mouth', 'dental', 'gojë'],
    'Depilim dhe Intime': ['depilatory', 'wax', 'razor', 'intimate', 'intime'],
    'Këmbët': ['feet', 'foot', 'shoe'],
    'Trupi': ['body', 'deodorant', 'soap', 'shower']
  },
  'farmaci': {
    'OTC (pa recete)': [],
    'Mirëqenia seksuale': ['sexual', 'performance', 'vigor'],
    'Aparat mjeksore': ['device', 'apparatus', 'aparat'],
    'First Aid (Ndihma e Pare)': ['first aid', 'bandage', 'plaster'],
    'Ortopedike': ['orthopedic', 'joint', 'bone']
  },
  'mama-dhe-bebat': {
    'Kujdesi ndaj Nënës': {
      'Shtatzani': ['pregnancy', 'pregnant', 'mother', 'mama'],
      'Ushqyerje me Gji': ['breastfeed', 'nursing', 'lactation']
    },
    'Kujdesi ndaj Bebit': {
      'Pelena': ['diaper', 'nappy', 'pampers', 'pelena'],
      'Higjena': ['baby wash', 'baby shampoo', 'baby care'],
      'SPF': ['baby sun', 'sun care'],
      'Suplementa': ['vitamin', 'probiotic', 'dha', 'formula']
    },
    'Aksesor per Beba': ['bottle', 'stroller', 'chair', 'crib'],
    'Planifikim Familjar': ['contraceptive', 'planning', 'family']
  },
  'produkte-shtese': {
    'Sete': ['set', 'kit', 'pack', 'bundle'],
    'Vajra Esencial': ['essential oil', 'oil', 'aroma']
  },
  'suplemente': {
    'Vitaminat dhe Mineralet': ['vitamin', 'mineral', 'd3', 'b12', 'c'],
    'Çajra Mjekësore': ['tea', 'herbal', 'çaj', 'tisane'],
    'Proteinë dhe Fitness': ['protein', 'creatine', 'bcaa', 'fitness'],
    'Suplementet Natyrore': ['natural', 'organic', 'herbal', 'plant']
  }
}

let totalUpdated = 0

console.log('🔄 Populating with EXACT structure...\n')

// First, clear all subcategories for these categories
db.run(`
  DELETE FROM product_categories WHERE 1=1
`, (err) => {
  if (err) console.error('Error clearing:', err)
})

// Function to process category
function processCategory(category, mapping, level = 0) {
  Object.keys(mapping).forEach(subcategory => {
    const keywords = mapping[subcategory]
    
    // Check if this is a nested structure (sub-subcategory)
    if (typeof keywords === 'object' && !Array.isArray(keywords)) {
      // This is nested - process recursively
      processCategory(category, keywords, level + 1)
      return
    }

    if (!Array.isArray(keywords)) return

    // If no keywords defined, don't match anything
    if (keywords.length === 0) {
      console.log(`  ├─ ${subcategory}: (empty - waiting for products)`)
      return
    }

    let matched = 0
    
    keywords.forEach(keyword => {
      const query = `
        UPDATE products 
        SET subcategory = ?
        WHERE LOWER(category) = LOWER(?)
        AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
        AND (subcategory IS NULL OR subcategory = '')
      `
      
      const searchTerm = `%${keyword}%`
      db.run(query, [subcategory, category, searchTerm, searchTerm], function(err) {
        if (err) {
          console.error(`Error: ${err.message}`)
        } else if (this.changes > 0) {
          matched += this.changes
          totalUpdated += this.changes
        }
      })
    })
    
    // Log after a short delay
    setTimeout(() => {
      console.log(`  ├─ ${subcategory}: ✓`)
    }, 100)
  })
}

// Process each main category
Object.keys(structure).forEach(mainCat => {
  console.log(`\n${mainCat}:`)
  processCategory(mainCat, structure[mainCat])
})

setTimeout(() => {
  console.log(`\n✅ Total updated: ${totalUpdated}\n`)
  
  // Show what we have
  db.all(`
    SELECT category, subcategory, COUNT(*) as cnt 
    FROM products 
    WHERE subcategory IS NOT NULL AND subcategory != ''
    GROUP BY category, subcategory
    ORDER BY category, subcategory
  `, [], (err, rows) => {
    if (err) console.error(err)
    
    console.log('📊 CURRENT STATUS:\n')
    let currentCat = ''
    rows.forEach(r => {
      if (currentCat !== r.category) {
        currentCat = r.category
        console.log(`${r.category}:`)
      }
      console.log(`  └─ ${r.subcategory}: ${r.cnt}`)
    })
    
    console.log('\n')
    db.close()
  })
}, 3000)
