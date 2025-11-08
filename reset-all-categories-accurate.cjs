const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// COMPREHENSIVE AND ACCURATE CATEGORIZATION RULES
const accurateRules = [
  // =============== DERMOKOZMETIKË ===============
  {
    category: 'dermokozmetikë',
    rules: [
      {
        subcategory: 'Fytyre',
        keywords: [
          'face', 'facial', 'visage', 'cleanser', 'toner', 'serum', 'mask', 'masque',
          'eye cream', 'under eye', 'moisturizer', 'hydrating', 'anti-aging', 'acne',
          'cleanance', 'keracnyl', 'fytyre', 'pore', 'wrinkle', 'dark circle'
        ]
      },
      {
        subcategory: 'Flokët',
        keywords: [
          'hair', 'shampoo', 'conditioner', 'hair mask', 'hair treatment',
          'hair oil', 'hair serum', 'floket', 'flokë', 'balm', 'spray styling'
        ]
      },
      {
        subcategory: 'Trupi',
        keywords: [
          'body', 'lotion', 'butter', 'body cream', 'body oil', 'body gel',
          'shower', 'soap', 'body wash', 'peeling', 'scrub', 'trupi'
        ]
      },
      {
        subcategory: 'SPF',
        keywords: [
          'sun', 'sunscreen', 'spf', 'uv', 'protector', 'protection',
          'solar', 'solaire', 'broad spectrum', 'waterproof', 'rilastil'
        ]
      },
      {
        subcategory: 'Makeup',
        keywords: [
          'makeup', 'foundation', 'powder', 'blush', 'bronzer', 'highlight',
          'mascara', 'eyeliner', 'eyeshadow', 'lipstick', 'lip gloss', 'concealer'
        ]
      }
    ]
  },
  
  // =============== HIGJENA ===============
  {
    category: 'higjena',
    rules: [
      {
        subcategory: 'Goja',
        keywords: [
          'tooth', 'toothpaste', 'toothbrush', 'oral', 'mouth', 'gum', 'dental',
          'brush', 'oralbiotic', 'gojë', 'dent'
        ]
      },
      {
        subcategory: 'Depilim dhe Intime',
        keywords: [
          'depilation', 'depilatory', 'wax', 'razor', 'intimate', 'intime',
          'vaginal', 'vagina'
        ]
      },
      {
        subcategory: 'Këmbët',
        keywords: [
          'foot', 'feet', 'toenail', 'corn', 'callus', 'shoe', 'këmbë'
        ]
      },
      {
        subcategory: 'Trupi',
        keywords: [
          'body wash', 'body soap', 'body gel', 'deodorant', 'body care'
        ]
      }
    ]
  },
  
  // =============== FARMACI ===============
  {
    category: 'farmaci',
    rules: [
      {
        subcategory: 'OTC (pa recete)',
        keywords: [
          'ibuprofen', 'paracetamol', 'aspirin', 'naproxen', 'pain', 'fever',
          'cold', 'flu', 'relief'
        ]
      },
      {
        subcategory: 'Mirëqenia seksuale',
        keywords: [
          'condom', 'durex', 'trojan', 'control', 'preservative', 'prezervatif',
          'lubricant', 'intimate care', 'sexual'
        ]
      },
      {
        subcategory: 'Aparat mjeksore',
        keywords: [
          'device', 'apparatus', 'aparat', 'thermometer', 'blood pressure',
          'inhaler', 'nebulizer'
        ]
      },
      {
        subcategory: 'First Aid (Ndihma e Pare)',
        keywords: [
          'first aid', 'bandage', 'plaster', 'gauze', 'antiseptic', 'wound'
        ]
      },
      {
        subcategory: 'Ortopedike',
        keywords: [
          'orthopedic', 'bone', 'joint', 'muscle', 'brace', 'support',
          'arthritis', 'arthro'
        ]
      }
    ]
  },
  
  // =============== MAMA DHE BEBAT ===============
  {
    category: 'mama-dhe-bebat',
    rules: [
      {
        subcategory: 'Pelena',
        keywords: [
          'diaper', 'nappy', 'pampers', 'pamper', 'huggies', 'pelena',
          'pull-ups', 'training pants'
        ]
      },
      {
        subcategory: 'Higjena',
        keywords: [
          'baby wash', 'baby shampoo', 'baby soap', 'baby lotion', 'baby cream',
          'diaper cream', 'rash cream', 'wipes', 'baby care', 'bebe', 'foshnje'
        ]
      },
      {
        subcategory: 'SPF',
        keywords: [
          'baby sun', 'kids sun', 'children sun', 'spf baby', 'spf kids',
          'sunscreen baby', 'sun protection baby'
        ]
      },
      {
        subcategory: 'Suplementa',
        keywords: [
          'vitamin', 'probiotic', 'dha', 'omega', 'formula', 'cereal',
          'food', 'nutrition', 'wellbaby', 'wellkid', 'vitabiotics', 'hipp'
        ]
      },
      {
        subcategory: 'Shtatzani',
        keywords: [
          'pregnancy', 'pregnant', 'mother', 'mama', 'prenatal', 'maternity'
        ]
      },
      {
        subcategory: 'Ushqyerje me Gji',
        keywords: [
          'breastfeed', 'nursing', 'lactation', 'breast care', 'nipple'
        ]
      },
      {
        subcategory: 'Aksesor per Beba',
        keywords: [
          'bottle', 'stroller', 'chair', 'crib', 'toothbrush', 'pacifier',
          'teether', 'toy', 'bed', 'carrier'
        ]
      },
      {
        subcategory: 'Planifikim Familjar',
        keywords: [
          'contraceptive', 'planning', 'family planning', 'birth control'
        ]
      }
    ]
  },
  
  // =============== PRODUKTE SHTESË ===============
  {
    category: 'produkte-shtese',
    rules: [
      {
        subcategory: 'Sete',
        keywords: [
          'set', 'kit', 'gift set', 'pack', 'bundle', 'collection', 'combo',
          'trio', 'routine', 'voyage', 'travel set', 'starter', 'couple'
        ]
      },
      {
        subcategory: 'Vajra Esencial',
        keywords: [
          'essential oil', 'oil', 'aroma', 'aromatic', 'diffuser', 'lavender',
          'eucalyptus', 'peppermint', 'tea tree', 'castor oil', 'argan oil',
          'bio-oil', 'skincare oil'
        ]
      }
    ]
  },
  
  // =============== SUPLEMENTE ===============
  {
    category: 'suplemente',
    rules: [
      {
        subcategory: 'Vitaminat dhe Mineralet',
        keywords: [
          'vitamin', 'mineral', 'd3', 'b12', 'c', 'zinc', 'iron', 'calcium',
          'magnesium', 'multi-vitamin', 'multivitamin', 'ultra'
        ]
      },
      {
        subcategory: 'Çajra Mjekësore',
        keywords: [
          'tea', 'herbal', 'çaj', 'tisane', 'infusion', 'blend', 'ginger',
          'chamomile', 'mint', 'fennel', 'lemon'
        ]
      },
      {
        subcategory: 'Proteinë dhe Fitness',
        keywords: [
          'protein', 'creatine', 'bcaa', 'amino', 'whey', 'powder',
          'fitness', 'workout', 'muscle', 'energy', 'pre-workout'
        ]
      },
      {
        subcategory: 'Suplementet Natyrore',
        keywords: [
          'natural', 'organic', 'herbal', 'plant', 'extract', 'root',
          'bark', 'leaf', 'flower', 'seed', 'ginseng', 'turmeric'
        ]
      }
    ]
  }
]

// First, clear all subcategories to start fresh
db.run(`UPDATE products SET subcategory = NULL`, (err) => {
  if (err) console.error('Error clearing subcategories:', err)
  else console.log('✓ Cleared all subcategories\n')

  let totalUpdated = 0
  
  // Process each category
  accurateRules.forEach(categoryRule => {
    console.log(`\n🔄 Processing ${categoryRule.category}...`)
    
    categoryRule.rules.forEach(rule => {
      rule.keywords.forEach(keyword => {
        const query = `
          UPDATE products 
          SET subcategory = ?
          WHERE LOWER(category) = LOWER(?)
          AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(description) LIKE ?)
          AND subcategory IS NULL
        `
        
        const searchTerm = `%${keyword}%`
        
        db.run(query, [rule.subcategory, categoryRule.category, searchTerm, searchTerm, searchTerm], function(err) {
          if (err) {
            console.error(`Error: ${err.message}`)
          } else if (this.changes > 0) {
            totalUpdated += this.changes
            console.log(`  ✓ "${keyword}" → ${rule.subcategory}: +${this.changes}`)
          }
        })
      })
    })
  })

  setTimeout(() => {
    console.log(`\n\n✅ Total updated: ${totalUpdated}\n`)
    
    // Show final summary
    db.all(`
      SELECT category, subcategory, COUNT(*) as cnt 
      FROM products 
      GROUP BY category, COALESCE(subcategory, 'NULL')
      ORDER BY category, subcategory
    `, [], (err, rows) => {
      if (err) console.error(err)
      
      console.log('📊 FINAL CATEGORIZATION:\n')
      let currentCat = ''
      let catTotal = 0
      
      rows.forEach((r, idx) => {
        if (currentCat !== r.category) {
          if (currentCat) {
            console.log(`  ═══════════════════════════`)
            console.log(`  TOTAL: ${catTotal}\n`)
          }
          currentCat = r.category
          catTotal = 0
          console.log(`\n${r.category.toUpperCase()}`)
          console.log('───────────────────────────')
        }
        catTotal += r.cnt
        const subcat = r.subcategory === 'NULL' ? '(unassigned)' : r.subcategory
        console.log(`  ├─ ${subcat}: ${r.cnt}`)
        
        if (idx === rows.length - 1) {
          console.log(`  ═══════════════════════════`)
          console.log(`  TOTAL: ${catTotal}\n`)
        }
      })
      
      db.close()
    })
  }, 3000)
})
