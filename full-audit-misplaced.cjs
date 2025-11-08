const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔍 FULL PRODUCT AUDIT - CHECKING ALL SUBCATEGORIES FOR MISPLACED PRODUCTS\n')
console.log('═'.repeat(85) + '\n')

// Get all products and their details
db.all(`
  SELECT id, name, brand, description, category, subcategory
  FROM products
  ORDER BY category, subcategory, name
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message)
    db.close()
    return
  }

  const issues = []
  
  // Check each product
  rows.forEach(product => {
    const name = product.name.toLowerCase()
    const brand = product.brand.toLowerCase()
    const desc = (product.description || '').toLowerCase()
    const fullText = `${name} ${brand} ${desc}`
    
    // DERMOKOZMETIKË checks
    if (product.category === 'dermokozmetikë') {
      // Makeup should NOT have vitamins, supplements, tools
      if (product.subcategory === 'Makeup') {
        if (fullText.includes('vitamin') || fullText.includes('supplement') || 
            fullText.includes('powder') && (name.includes('prebiotic') || name.includes('inulin'))) {
          issues.push({
            severity: 'HIGH',
            product: `${brand} ${name}`,
            current: `dermokozmetikë/Makeup`,
            shouldBe: 'suplemente/Vitaminat eller produkte-shtese',
            reason: 'Vitamin/supplement, not makeup'
          })
        }
        if (name.includes('brush') && !name.includes('eyebrow')) {
          issues.push({
            severity: 'MEDIUM',
            product: `${brand} ${name}`,
            current: `dermokozmetikë/Makeup`,
            shouldBe: 'produkte-shtese/Aksesor',
            reason: 'Tool/brush, not makeup product'
          })
        }
        if (name.includes('powder') && name.includes('toilet')) {
          issues.push({
            severity: 'HIGH',
            product: `${brand} ${name}`,
            current: `dermokozmetikë/Makeup`,
            shouldBe: 'mama-dhe-bebat/Higjena',
            reason: 'Baby toilet powder, not makeup'
          })
        }
      }
      
      // SPF checks
      if (product.subcategory === 'SPF') {
        if (fullText.includes('tanning') || fullText.includes('bronzer') || fullText.includes('self-tan')) {
          issues.push({
            severity: 'MEDIUM',
            product: `${brand} ${name}`,
            current: `dermokozmetikë/SPF`,
            shouldBe: 'dermokozmetikë/Tanning',
            reason: 'Tanning product, not SPF sunscreen'
          })
        }
      }
    }
    
    // HIGJENA checks
    if (product.category === 'higjena') {
      if (product.subcategory === 'Goja') {
        if (fullText.includes('perfum') || fullText.includes('cologne') || fullText.includes('fragrance')) {
          issues.push({
            severity: 'HIGH',
            product: `${brand} ${name}`,
            current: `higjena/Goja`,
            shouldBe: 'dermokozmetikë/Fytyre or produkte-shtese',
            reason: 'Fragrance/perfume, not dental care'
          })
        }
        if (fullText.includes('makeup remove') || fullText.includes('cleanse')) {
          issues.push({
            severity: 'MEDIUM',
            product: `${brand} ${name}`,
            current: `higjena/Goja`,
            shouldBe: 'dermokozmetikë/Fytyre',
            reason: 'Face cleanser, not dental care'
          })
        }
      }
    }
    
    // FARMACI checks
    if (product.category === 'farmaci') {
      if (product.subcategory === 'Mirëqenia seksuale') {
        if (!fullText.includes('condom') && !fullText.includes('durex') && 
            !fullText.includes('gel') && !fullText.includes('lubric')) {
          // Actually Durex products might be OK, but check for other stuff
        }
      }
      
      if (product.subcategory === 'OTC (pa recete)') {
        if (fullText.includes('vitamin') || fullText.includes('probiotic')) {
          issues.push({
            severity: 'MEDIUM',
            product: `${brand} ${name}`,
            current: `farmaci/OTC`,
            shouldBe: 'suplemente/Vitaminat',
            reason: 'Vitamin/supplement, not OTC medicine'
          })
        }
      }
    }
    
    // MAMA-DHE-BEBAT checks
    if (product.category === 'mama-dhe-bebat') {
      if (product.subcategory === 'Suplementa') {
        if (fullText.includes('toothbrush') || fullText.includes('brush')) {
          issues.push({
            severity: 'HIGH',
            product: `${brand} ${name}`,
            current: `mama-dhe-bebat/Suplementa`,
            shouldBe: 'mama-dhe-bebat/Aksesor per Beba',
            reason: 'Tool/brush, not supplement'
          })
        }
        if (fullText.includes('fragrance') || fullText.includes('cologne') || fullText.includes('perfume')) {
          issues.push({
            severity: 'HIGH',
            product: `${brand} ${name}`,
            current: `mama-dhe-bebat/Suplementa`,
            shouldBe: 'mama-dhe-bebat/Higjena',
            reason: 'Fragrance, not supplement'
          })
        }
      }
      
      if (product.subcategory === 'Higjena') {
        if (fullText.includes('perfum') || fullText.includes('cologne')) {
          issues.push({
            severity: 'HIGH',
            product: `${brand} ${name}`,
            current: `mama-dhe-bebat/Higjena`,
            shouldBe: 'mama-dhe-bebat/Suplementa or Higjena body care',
            reason: 'Fragrance, check proper placement'
          })
        }
      }
    }
    
    // SUPLEMENTE checks
    if (product.category === 'suplemente') {
      if (product.subcategory === 'Vitaminat dhe Mineralet') {
        if (fullText.includes('tea') || fullText.includes('herbal') || fullText.includes('çaj')) {
          issues.push({
            severity: 'MEDIUM',
            product: `${brand} ${name}`,
            current: `suplemente/Vitaminat`,
            shouldBe: 'suplemente/Çajra Mjekësore',
            reason: 'Herbal tea, not vitamin'
          })
        }
        if (fullText.includes('protein') || fullText.includes('creatine') || fullText.includes('amino')) {
          issues.push({
            severity: 'MEDIUM',
            product: `${brand} ${name}`,
            current: `suplemente/Vitaminat`,
            shouldBe: 'suplemente/Proteinë dhe Fitness',
            reason: 'Protein/fitness supplement, not vitamin'
          })
        }
      }
    }
  })

  // Display results
  console.log(`📊 FOUND ${issues.length} POTENTIAL CATEGORIZATION ISSUES:\n`)
  
  if (issues.length === 0) {
    console.log('✅ ALL PRODUCTS APPEAR TO BE CORRECTLY CATEGORIZED!\n')
  } else {
    const highSeverity = issues.filter(i => i.severity === 'HIGH')
    const mediumSeverity = issues.filter(i => i.severity === 'MEDIUM')
    
    console.log(`🔴 HIGH SEVERITY: ${highSeverity.length}`)
    console.log(`🟡 MEDIUM SEVERITY: ${mediumSeverity.length}\n`)
    
    if (highSeverity.length > 0) {
      console.log('🔴 HIGH PRIORITY FIXES:\n')
      highSeverity.forEach(issue => {
        console.log(`  ❌ ${issue.product}`)
        console.log(`     Current: ${issue.current}`)
        console.log(`     Should be: ${issue.shouldBe}`)
        console.log(`     Reason: ${issue.reason}\n`)
      })
    }
    
    if (mediumSeverity.length > 0) {
      console.log('\n🟡 MEDIUM PRIORITY FIXES:\n')
      mediumSeverity.forEach(issue => {
        console.log(`  ⚠️  ${issue.product}`)
        console.log(`     Current: ${issue.current}`)
        console.log(`     Should be: ${issue.shouldBe}`)
        console.log(`     Reason: ${issue.reason}\n`)
      })
    }
  }
  
  db.close()
})
