const { db } = require('./server/config/database.cjs')

// Category mapping based on product keywords
const categoryRules = {
  // DERMOKOZMETIKË - FYTYRE
  fytyre: {
    category: 'dermokozmetikë',
    subcategory: 'Fytyre',
    keywords: ['fytyre', 'face', 'serum', 'krem fytyre', 'anti-aging', 'anti-rrudhosje', 'anti rrudh', 'wrinkle', 'moisturizer fytyre', 'cleanser', 'pastrim', 'toner', 'eye cream', 'krem syte', 'micellar', 'mask', 'maskë', 'peeling', 'exfoliant']
  },
  
  // DERMOKOZMETIKË - FLOKËT
  floket: {
    category: 'dermokozmetikë',
    subcategory: 'Flokët',
    keywords: ['shampo', 'shampoo', 'balzam', 'conditioner', 'hair', 'flok', 'rënie flokësh', 'hair loss', 'treatment flokë', 'maska flokësh', 'vaj flokësh']
  },
  
  // DERMOKOZMETIKË - TRUPI
  trupi: {
    category: 'dermokozmetikë',
    subcategory: 'Trupi',
    keywords: ['locion trupi', 'body lotion', 'krem trupi', 'body cream', 'body butter', 'vaj trupi', 'body oil', 'stretch marks', 'shenja', 'firmues', 'cellulit']
  },
  
  // DERMOKOZMETIKË - SPF
  spf: {
    category: 'dermokozmetikë',
    subcategory: 'SPF',
    keywords: ['spf', 'sun', 'diell', 'solar', 'sunscreen', 'protection', 'mbrojtje dielli', 'photoprotect']
  },
  
  // DERMOKOZMETIKË - TANNING
  tanning: {
    category: 'dermokozmetikë',
    subcategory: 'Tanning',
    keywords: ['self tan', 'tanning', 'tan', 'bronz', 'after sun']
  },
  
  // DERMOKOZMETIKË - MAKEUP
  makeup: {
    category: 'dermokozmetikë',
    subcategory: 'Makeup',
    keywords: ['makeup', 'foundation', 'concealer', 'mascara', 'lipstick', 'buze', 'sytë make', 'fard', 'blush', 'highlighter', 'powder', 'primer']
  },
  
  // HIGJENA - GOJA
  goja: {
    category: 'higjena',
    subcategory: 'Goja',
    keywords: ['paste dhëmbësh', 'toothpaste', 'gojëlarje', 'mouthwash', 'dental', 'dhëmbë', 'teeth', 'oral', 'tooth', 'interdental', 'gum', 'misvak', 'floss']
  },
  
  // HIGJENA - DEPILIM DHE INTIME
  depilimIntime: {
    category: 'higjena',
    subcategory: 'Depilim dhe Intime',
    keywords: ['depilim', 'wax', 'epilat', 'razor', 'intimate', 'intime', 'vaginal', 'feminin', 'hygiene intimate']
  },
  
  // HIGJENA - KËMBËT
  kembet: {
    category: 'higjena',
    subcategory: 'Këmbët',
    keywords: ['këmbë', 'foot', 'feet', 'thonj', 'nail', 'kallë', 'talons', 'cracked heel']
  },
  
  // HIGJENA - TRUPI
  trupiHigjena: {
    category: 'higjena',
    subcategory: 'Trupi',
    keywords: ['xhel dushi', 'shower gel', 'sapun', 'soap', 'bath', 'dush', 'hygiene body', 'deodorant', 'antiperspirant']
  },
  
  // FARMACI - OTC
  otc: {
    category: 'farmaci',
    subcategory: 'OTC (pa recete)',
    keywords: ['analgesic', 'dhimbje', 'pain', 'fever', 'ethe', 'cold', 'flu', 'grip', 'cough', 'kollë', 'antihistamin', 'alergi']
  },
  
  // FARMACI - MIRËQENIA SEKSUALE
  mireqeniaSeksuale: {
    category: 'farmaci',
    subcategory: 'Mirëqenia seksuale',
    keywords: ['preservativ', 'condom', 'durex', 'lubricant', 'lubrikan', 'seksual', 'intimacy', 'sexual wellness']
  },
  
  // FARMACI - APARAT MJEKSORE
  aparatMjeksore: {
    category: 'farmaci',
    subcategory: 'Aparat mjeksore',
    keywords: ['termometar', 'thermometer', 'blood pressure', 'tensioni', 'glucose', 'glukozë', 'nebulizer', 'inhaler', 'oximeter']
  },
  
  // FARMACI - FIRST AID
  firstAid: {
    category: 'farmaci',
    subcategory: 'First Aid (Ndihma e Pare)',
    keywords: ['first aid', 'bandage', 'fashë', 'plaster', 'antiseptic', 'wound', 'plagë', 'disinfect', 'dezinfekt']
  },
  
  // MAMA DHE BEBAT - SHTATZANI
  shtatzani: {
    category: 'mama-dhe-bebat',
    subcategory: 'Shtatzani',
    keywords: ['shtatzani', 'pregnancy', 'maternity', 'gravid', 'prenatal', 'stretch mark mama']
  },
  
  // MAMA DHE BEBAT - USHQYERJE ME GJI
  ushqyerjeGji: {
    category: 'mama-dhe-bebat',
    subcategory: 'Ushqyerje me Gji',
    keywords: ['breastfeed', 'nursing', 'gjiri', 'breast pump', 'pompe', 'nipple', 'thithka', 'lactation']
  },
  
  // MAMA DHE BEBAT - PELENA
  pelena: {
    category: 'mama-dhe-bebat',
    subcategory: 'Pelena',
    keywords: ['pelena', 'diaper', 'nappy', 'pants', 'pantalon']
  },
  
  // MAMA DHE BEBAT - HIGJENA BEBE
  higjenaBebe: {
    category: 'mama-dhe-bebat',
    subcategory: 'Higjena',
    keywords: ['wipes bebe', 'shampoo baby', 'bath baby', 'gel bebe', 'sapun bebe', 'locion bebe', 'krem bebe', 'talc']
  },
  
  // MAMA DHE BEBAT - SPF BEBE
  spfBebe: {
    category: 'mama-dhe-bebat',
    subcategory: 'SPF',
    keywords: ['spf bebe', 'sun baby', 'solar baby', 'diell bebe']
  },
  
  // MAMA DHE BEBAT - SUPLEMENTA BEBE
  suplementaBebe: {
    category: 'mama-dhe-bebat',
    subcategory: 'Suplementa',
    keywords: ['vitamin bebe', 'vitaminë foshnje', 'drops baby', 'supplement baby', 'omega baby']
  },
  
  // MAMA DHE BEBAT - AKSESOR
  aksesorBeba: {
    category: 'mama-dhe-bebat',
    subcategory: 'Aksesor per Beba',
    keywords: ['biberon', 'bottle', 'pacifier', 'suzeta', 'teether', 'dhëmballë']
  },
  
  // MAMA DHE BEBAT - PLANIFIKIM FAMILJAR
  planifikimFamiljar: {
    category: 'mama-dhe-bebat',
    subcategory: 'Planifikim Familjar',
    keywords: ['test shtatzani', 'pregnancy test', 'ovulation', 'ovulacion', 'fertility', 'pjellori']
  },
  
  // SUPLEMENTE - VITAMINAT DHE MINERALET
  vitamina: {
    category: 'suplemente',
    subcategory: 'Vitaminat dhe Mineralet',
    keywords: ['vitamin', 'vitaminë', 'mineral', 'omega', 'calcium', 'kalcium', 'magnesium', 'iron', 'hekur', 'zinc', 'multivitamin']
  },
  
  // SUPLEMENTE - ÇAJRA MJEKËSORE
  cajra: {
    category: 'suplemente',
    subcategory: 'Çajra Mjekësore',
    keywords: ['çaj', 'tea', 'herbal', 'infusion', 'bimor']
  },
  
  // PRODUKTE SHTESË - SETE
  sete: {
    category: 'produkte-shtese',
    subcategory: 'Sete',
    keywords: ['set', 'kit', 'coffret', 'paketë', 'bundle']
  },
  
  // PRODUKTE SHTESË - VAJRA ESENCIAL
  vajraEsencial: {
    category: 'produkte-shtese',
    subcategory: 'Vajra Esencial',
    keywords: ['essential oil', 'vaj esencial', 'aromatherapy', 'lavender oil', 'tea tree', 'eucalyptus']
  }
}

console.log('🔍 Starting category fix for ALL products...\n')

// Get all products
db.all('SELECT id, name, description, category, subcategory FROM products ORDER BY id', [], async (err, products) => {
  if (err) {
    console.error('Error:', err)
    return
  }

  console.log(`📦 Found ${products.length} products\n`)
  
  let fixed = 0
  let checked = 0
  
  for (const product of products) {
    checked++
    const searchText = `${product.name} ${product.description || ''}`.toLowerCase()
    
    let newCategory = product.category
    let newSubcategory = product.subcategory
    let matched = false
    
    // Check each rule
    for (const [ruleName, rule] of Object.entries(categoryRules)) {
      if (matched) break
      
      for (const keyword of rule.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          newCategory = rule.category
          newSubcategory = rule.subcategory
          matched = true
          break
        }
      }
    }
    
    // Update if changed
    if (newCategory !== product.category || newSubcategory !== product.subcategory) {
      db.run(
        'UPDATE products SET category = ?, subcategory = ? WHERE id = ?',
        [newCategory, newSubcategory, product.id],
        (updateErr) => {
          if (updateErr) {
            console.error(`❌ Error updating product ${product.id}:`, updateErr)
          } else {
            fixed++
            console.log(`✅ [${product.id}] ${product.name}`)
            console.log(`   ${product.category} -> ${product.subcategory} ➡️  ${newCategory} -> ${newSubcategory}`)
          }
        }
      )
    }
    
    // Progress indicator
    if (checked % 100 === 0) {
      console.log(`\n⏳ Checked ${checked}/${products.length} products...`)
    }
  }
  
  // Wait a bit for all updates to complete
  setTimeout(() => {
    console.log(`\n✨ DONE!`)
    console.log(`📊 Checked: ${checked} products`)
    console.log(`🔧 Fixed: ${fixed} products`)
    console.log(`✅ Categories are now correct!\n`)
    process.exit(0)
  }, 3000)
})
