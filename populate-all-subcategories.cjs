const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Comprehensive rules based on product names/descriptions to categorize
const rules = [
  // DERMOKOZMETIKË
  {
    category: 'dermokozmetikë',
    mappings: [
      {
        subcategory: 'Fytyre',
        keywords: [
          'face', 'facial', 'visage', 'serum', 'toner', 'cleanser', 'masque', 'mask',
          'cream', 'gel', 'lotion', 'acne', 'pore', 'blackhead', 'whitehead',
          'moistur', 'hydrating', 'hydration', 'anti-aging', 'wrinkle',
          'dark circle', 'eye', 'under eye', 'youth', 'glow', 'brightening',
          'purifiant', 'purifié', 'visages', 'fytyrë'
        ]
      },
      {
        subcategory: 'Flokët',
        keywords: [
          'hair', 'shampoo', 'conditioner', 'mask', 'treatment', 'serum',
          'oil', 'balm', 'spray', 'styling', 'volumizing', 'moisturizing',
          'anti-frizz', 'keratin', 'biotin', 'color-treated', 'damaged',
          'repair', 'strengthen', 'flokë', 'shampon', 'conditioner'
        ]
      },
      {
        subcategory: 'Trupi',
        keywords: [
          'body', 'lotion', 'butter', 'cream', 'oil', 'gel', 'wash', 'soap',
          'shower', 'bath', 'exfoliating', 'scrub', 'peeling', 'moisturizing',
          'anti-cellulite', 'firming', 'slimming', 'skin', 'trupi'
        ]
      },
      {
        subcategory: 'SPF',
        keywords: [
          'sun', 'sunscreen', 'spf', 'uv', 'protector', 'protection',
          'solar', 'solaire', 'broad spectrum', 'waterproof', 'reef safe',
          'mineral', 'chemical', 'face spf', 'body spf'
        ]
      },
      {
        subcategory: 'Makeup',
        keywords: [
          'makeup', 'foundation', 'powder', 'blush', 'bronzer', 'highlight',
          'mascara', 'eyeliner', 'eyeshadow', 'lipstick', 'lip gloss',
          'concealer', 'primer', 'setting spray', 'contour', 'makeup'
        ]
      }
    ]
  },
  
  // HIGJENA
  {
    category: 'higjena',
    mappings: [
      {
        subcategory: 'Goja',
        keywords: [
          'tooth', 'toothpaste', 'toothbrush', 'oral', 'mouth', 'gum',
          'dental', 'brush', 'paste', 'mouthwash', 'rinse', 'floss',
          'whitening', 'enamel', 'cavity', 'gojë', 'dhëmbët'
        ]
      }
    ]
  },
  
  // MAMA DHE BEBAT
  {
    category: 'mama-dhe-bebat',
    mappings: [
      {
        subcategory: 'Pelena',
        keywords: [
          'diaper', 'nappy', 'pampers', 'pamper', 'huggies', 'pelena',
          'pull-ups', 'training pants', 'disposable', 'absorption'
        ]
      },
      {
        subcategory: 'Higjena',
        keywords: [
          'baby wash', 'baby shampoo', 'baby soap', 'baby lotion',
          'baby cream', 'diaper cream', 'rash cream', 'wipes',
          'baby care', 'bathing', 'bebi', 'foshnjë'
        ]
      },
      {
        subcategory: 'Suplementa',
        keywords: [
          'vitamin', 'probiotic', 'dha', 'omega', 'calcium', 'iron',
          'supplement', 'formula', 'cereal', 'food', 'nutrition',
          'protein', 'growth', 'development', 'suplemente'
        ]
      }
    ]
  },
  
  // SUPLEMENTE (main category)
  {
    category: 'suplemente',
    mappings: [
      {
        subcategory: 'Vitaminat dhe Mineralet',
        keywords: [
          'vitamin', 'mineral', 'zinc', 'iron', 'calcium', 'magnesium',
          'd3', 'b12', 'b6', 'c', 'e', 'multi-vitamin', 'multivitamin'
        ]
      },
      {
        subcategory: 'Çajra Mjekësore',
        keywords: [
          'tea', 'herbal', 'çaj', 'tisane', 'infusion', 'blend',
          'ginger', 'chamomile', 'mint', 'lemon', 'honey'
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

let totalUpdated = 0
let processedRules = 0

console.log('🔄 Populating subcategories...\n')

rules.forEach(categoryRule => {
  categoryRule.mappings.forEach(mapping => {
    // Build LIKE conditions for all keywords
    const keywords = mapping.keywords
    let updateCount = 0

    // For each keyword, try to match and update
    keywords.forEach(keyword => {
      const query = `
        UPDATE products 
        SET subcategory = ?
        WHERE LOWER(category) = LOWER(?)
        AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
        AND (subcategory IS NULL OR subcategory = '')
      `

      const searchTerm = `%${keyword}%`
      db.run(
        query,
        [mapping.subcategory, categoryRule.category, searchTerm, searchTerm],
        function(err) {
          if (err) {
            console.error(`❌ Error: ${err.message}`)
          } else if (this.changes > 0) {
            updateCount += this.changes
            totalUpdated += this.changes
            console.log(`  ✓ "${mapping.subcategory}" (${keyword}): +${this.changes}`)
          }
        }
      )
    })

    processedRules++
  })
})

setTimeout(() => {
  console.log(`\n✅ Done! Total products updated: ${totalUpdated}`)
  
  // Show summary
  db.all(`
    SELECT category, subcategory, COUNT(*) as cnt 
    FROM products 
    WHERE subcategory IS NOT NULL AND subcategory != ''
    GROUP BY category, subcategory
    ORDER BY category, cnt DESC
  `, [], (err, rows) => {
    if (err) console.error(err)
    console.log('\n📊 SUMMARY:\n')
    rows.forEach(r => {
      console.log(`  ${r.category} → ${r.subcategory}: ${r.cnt}`)
    })
    db.close()
  })
}, 3000)
