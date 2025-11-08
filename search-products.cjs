const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

// Search for specific brands/keywords
const searches = [
  { keyword: 'durex', expected: 'Mirëqenia seksuale' },
  { keyword: 'trojan', expected: 'Mirëqenia seksuale' },
  { keyword: 'condom', expected: 'Mirëqenia seksuale' },
  { keyword: 'preserv', expected: 'Mirëqenia seksuale' },
  { keyword: 'set', expected: 'Sete' },
  { keyword: 'oil', expected: 'Vajra Esencial' },
  { keyword: 'tea', expected: 'Çajra Mjekësore' },
  { keyword: 'protein', expected: 'Proteinë dhe Fitness' },
  { keyword: 'ibuprofen', expected: 'OTC' },
  { keyword: 'paracet', expected: 'OTC' }
]

console.log('🔍 SEARCHING FOR SPECIFIC PRODUCTS:\n')

searches.forEach(search => {
  const query = `
    SELECT id, name, brand, category, subcategory 
    FROM products 
    WHERE LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(description) LIKE ?
    LIMIT 5
  `
  
  const term = `%${search.keyword}%`
  
  db.all(query, [term, term, term], (err, rows) => {
    if (rows && rows.length > 0) {
      console.log(`\n🔎 "${search.keyword}" (expected: ${search.expected}):`)
      rows.forEach(r => {
        console.log(`  ├─ ${r.name.substring(0, 60)}`)
        console.log(`    Brand: ${r.brand} | Category: ${r.category}/${r.subcategory}`)
      })
    }
  })
})

setTimeout(() => {
  db.close()
}, 2000)
