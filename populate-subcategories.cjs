const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Mapping of main categories to their subcategories based on brand/name patterns
const categoryMappings = {
  'dermokozmetikë': {
    'Fytyre': ['face', 'facial', 'visage', 'mascarilla', 'cream', 'serum'],
    'Flokët': ['hair', 'shampoo', 'conditioner', 'keratina'],
    'Trupi': ['body', 'bath', 'shower', 'soap', 'oil'],
    'SPF': ['sunscreen', 'sun', 'protector', 'spf'],
    'Tanning': ['tanning', 'bronzing', 'autobronz'],
    'Makeup': ['makeup', 'foundation', 'powder', 'mascara', 'lipstick', 'maquillage']
  },
  'higjena': {
    'Goja': ['tooth', 'toothpaste', 'mouth', 'oral', 'gojë', 'dent'],
    'Këmbët': ['feet', 'foot', 'këmbë'],
    'Trupi': ['body', 'deodorant', 'soap', 'shower'],
    'Depilim dhe Intime': ['depilation', 'wax', 'razor', 'intimate', 'intime']
  },
  'farmaci': {
    'OTC (pa recetë)': [],
    'Mirëqenia seksuale': ['sexual', 'performance', 'vigor'],
    'Aparat mjekësore': ['device', 'apparatus', 'aparat'],
    'First Aid': ['first aid', 'bandage', 'plaster'],
    'Ortopedike': ['orthopedic', 'ortoped', 'joint', 'bone']
  },
  'mama-dhe-bebat': {
    'Pelena': ['nappy', 'diaper', 'pampers', 'pelena'],
    'Higjena': ['baby wash', 'baby care', 'baby shampoo'],
    'SPF': ['sun care', 'spf', 'protector'],
    'Suplementa': ['vitamin', 'supplement', 'probio', 'dha']
  },
  'suplemente': {
    'Vitaminat dhe Mineralet': ['vitamin', 'mineral', 'd3', 'c', 'b12'],
    'Çajra Mjekësore': ['tea', 'herbal', 'çaj'],
    'Proteinë dhe Fitness': ['protein', 'creatine', 'fitness'],
    'Suplementet Natyrore': ['natural', 'organic', 'herbal', 'plant']
  }
}

// Simpler approach: Assign subcategories based on the main categories we know exist
const simpleMapping = [
  {
    category: 'dermokozmetikë',
    rules: [
      { subcategory: 'Fytyre', keywords: ['face', 'facial', 'cleanser', 'toner', 'serum', 'masque'] },
      { subcategory: 'Flokët', keywords: ['hair', 'shampoo', 'conditioner', 'mask'] },
      { subcategory: 'Trupi', keywords: ['body', 'lotion', 'cream', 'oil', 'bath'] },
      { subcategory: 'SPF', keywords: ['sun', 'spf', 'sunscreen'] },
      { subcategory: 'Makeup', keywords: ['makeup', 'foundation', 'powder', 'mascara', 'lipstick'] }
    ]
  },
  {
    category: 'higjena',
    rules: [
      { subcategory: 'Goja', keywords: ['toothpaste', 'tooth', 'oral', 'mouth'] },
      { subcategory: 'Këmbët', keywords: ['feet', 'foot', 'shoe'] },
      { subcategory: 'Depilim dhe Intime', keywords: ['depilatory', 'wax', 'razor', 'intimate'] }
    ]
  },
  {
    category: 'mama-dhe-bebat',
    rules: [
      { subcategory: 'Pelena', keywords: ['diaper', 'nappy', 'pampers'] },
      { subcategory: 'Higjena', keywords: ['baby wash', 'baby shampoo', 'wipe'] },
      { subcategory: 'Suplementa', keywords: ['vitamin', 'probiotic', 'dha'] }
    ]
  }
]

let updated = 0

simpleMapping.forEach(mapping => {
  mapping.rules.forEach(rule => {
    const keywords = rule.keywords.map(k => `'%${k}%'`).join(',')
    const query = `
      UPDATE products 
      SET subcategory = ?
      WHERE category = ? 
      AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
      AND (subcategory IS NULL OR subcategory = '')
    `
    
    rule.keywords.forEach(keyword => {
      db.run(query, [rule.subcategory, mapping.category, `%${keyword}%`, `%${keyword}%`], function(err) {
        if (err) {
          console.error(`Error updating ${mapping.category}/${rule.subcategory}:`, err)
        } else if (this.changes > 0) {
          updated += this.changes
          console.log(`✓ Updated ${this.changes} products: ${mapping.category} → ${rule.subcategory}`)
        }
      })
    })
  })
})

setTimeout(() => {
  console.log(`\n✅ Total updated: ${updated} products`)
  db.close()
}, 2000)
