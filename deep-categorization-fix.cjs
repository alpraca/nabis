const { db } = require('./server/config/database.cjs')

console.log('🔍 DEEP CATEGORIZATION - Duke lexuar PËRSHKRIMIN e të gjitha produkteve...\n')

// Enhanced rules based on DESCRIPTION content
const categoryRules = [
  // === DERMOKOZMETIKË - FYTYRE ===
  {
    category: 'dermokozmetikë',
    subcategory: 'Fytyre',
    keywords: [
      'face', 'fytyre', 'facial', 'visage', 'viso',
      'serum', 'cream face', 'krem fytyre', 'crème visage', 'crema viso',
      'anti-aging', 'anti-age', 'anti-rrudhosje', 'anti rrudh', 'wrinkle', 'rides',
      'moisturizer face', 'hydratant visage', 'idratante viso',
      'cleanser', 'pastrim fytyre', 'nettoyant visage', 'detergente viso',
      'toner', 'tonik', 'lotion tonique',
      'eye cream', 'krem syte', 'contour yeux', 'contorno occhi',
      'micellar', 'mikelare', 'micellaire',
      'mask face', 'maskë fytyre', 'masque visage', 'maschera viso',
      'peeling face', 'exfoliant visage', 'esfoliante viso',
      'bb cream', 'cc cream', 'fond de teint', 'fondotinta',
      'corrector', 'concealer', 'correcteur', 'correttore',
      'acne', 'anti-blemish', 'anti-imperfection', 'anti-acne'
    ]
  },
  
  // === DERMOKOZMETIKË - FLOKËT ===
  {
    category: 'dermokozmetikë',
    subcategory: 'Flokët',
    keywords: [
      'hair', 'flok', 'cheveux', 'capelli',
      'shampo', 'shampoo', 'shampooing',
      'conditioner', 'balzam', 'après-shampooing', 'balsamo',
      'hair treatment', 'trajtim flokësh', 'soin cheveux', 'trattamento capelli',
      'hair loss', 'rënie flokësh', 'chute cheveux', 'caduta capelli',
      'hair mask', 'maskë flokësh', 'masque cheveux', 'maschera capelli',
      'hair oil', 'vaj flokësh', 'huile cheveux', 'olio capelli',
      'hair serum', 'serum flokësh',
      'scalp', 'lëkura e kokës', 'cuir chevelu', 'cuoio capelluto',
      'anti-dandruff', 'anti-pelliculaire', 'antiforfora'
    ]
  },
  
  // === DERMOKOZMETIKË - TRUPI ===
  {
    category: 'dermokozmetikë',
    subcategory: 'Trupi',
    keywords: [
      'body lotion', 'locion trupi', 'lait corps', 'latte corpo',
      'body cream', 'krem trupi', 'crème corps', 'crema corpo',
      'body butter', 'butter trupi', 'beurre corps', 'burro corpo',
      'body oil', 'vaj trupi', 'huile corps', 'olio corpo',
      'body milk', 'qumësht trupi', 'lait corporel',
      'stretch marks', 'shenja', 'vergetures', 'smagliature',
      'firming body', 'firmues trupi', 'raffermissant corps', 'rassodante corpo',
      'cellulite', 'cellulit', 'cellulite', 'cellulite',
      'slimming', 'dobësues', 'minceur', 'dimagrante',
      'body moisturizer', 'hidratues trupi'
    ]
  },
  
  // === DERMOKOZMETIKË - SPF ===
  {
    category: 'dermokozmetikë',
    subcategory: 'SPF',
    keywords: [
      'spf', 'sun protection', 'protection solaire', 'protezione solare',
      'sunscreen', 'solar', 'solaire', 'solare',
      'sun cream', 'krem dielli', 'crème solaire', 'crema solare',
      'sun lotion', 'locion dielli', 'lait solaire', 'latte solare',
      'sun spray', 'spray dielli', 'spray solaire', 'spray solare',
      'photoprotect', 'fotoprotector', 'photoprotecteur',
      'uv protection', 'mbrojtje uv', 'protection uv',
      'after sun', 'pas dielli', 'après-soleil', 'doposole'
    ]
  },
  
  // === DERMOKOZMETIKË - TANNING ===
  {
    category: 'dermokozmetikë',
    subcategory: 'Tanning',
    keywords: [
      'self tan', 'tanning', 'bronzant', 'abbronzante',
      'tan', 'bronz', 'autobronzant', 'autoabbronzante',
      'after-sun', 'après-soleil', 'doposole'
    ]
  },
  
  // === DERMOKOZMETIKË - MAKEUP ===
  {
    category: 'dermokozmetikë',
    subcategory: 'Makeup',
    keywords: [
      'makeup', 'make-up', 'maquillage', 'trucco',
      'foundation', 'fond de teint', 'fondotinta',
      'concealer', 'correcteur', 'correttore',
      'mascara', 'mascara', 'mascara',
      'lipstick', 'rouge à lèvres', 'rossetto',
      'lip gloss', 'gloss', 'lucidalabbra',
      'eyeshadow', 'fard', 'ombretto',
      'blush', 'fard à joues', 'fard',
      'highlighter', 'illuminant', 'illuminante',
      'powder', 'pudër', 'poudre', 'cipria',
      'primer', 'bazë', 'base',
      'eyeliner', 'eye liner', 'eyeliner'
    ]
  },
  
  // === HIGJENA - GOJA ===
  {
    category: 'higjena',
    subcategory: 'Goja',
    keywords: [
      'toothpaste', 'paste dhëmbësh', 'dentifrice', 'dentifricio',
      'mouthwash', 'gojëlarje', 'bain de bouche', 'collutorio',
      'dental', 'dhëmbë', 'dentaire', 'dentale',
      'tooth', 'dhëmb', 'dent', 'dente',
      'oral', 'oral', 'bucal', 'orale',
      'interdental', 'interdentale',
      'gum', 'mishrat', 'gencive', 'gengiva',
      'misvak', 'siwak',
      'floss', 'fill dentar', 'fil dentaire', 'filo dentale',
      'teeth whitening', 'zbardhim dhëmbësh', 'blanchiment dents'
    ]
  },
  
  // === HIGJENA - DEPILIM DHE INTIME ===
  {
    category: 'higjena',
    subcategory: 'Depilim dhe Intime',
    keywords: [
      'depilim', 'depilation', 'épilation', 'depilazione',
      'wax', 'dyll', 'cire', 'cera',
      'epilat', 'epilator', 'épilateur', 'epilatore',
      'razor', 'rroje', 'rasoir', 'rasoio',
      'intimate', 'intime', 'intime', 'intimo',
      'vaginal', 'vaginal', 'vaginal', 'vaginale',
      'feminine hygiene', 'higjienë femërore', 'hygiène féminine',
      'intimate wash', 'larje intime', 'soin intime'
    ]
  },
  
  // === HIGJENA - KËMBËT ===
  {
    category: 'higjena',
    subcategory: 'Këmbët',
    keywords: [
      'foot', 'këmbë', 'pied', 'piede',
      'feet', 'këmbët', 'pieds', 'piedi',
      'nail', 'thonj', 'ongle', 'unghia',
      'cracked heel', 'thembra të plasura', 'talon crevassé', 'talloni screpolati',
      'callus', 'kallë', 'callosité', 'callo',
      'foot cream', 'krem këmbësh', 'crème pieds', 'crema piedi'
    ]
  },
  
  // === HIGJENA - TRUPI ===
  {
    category: 'higjena',
    subcategory: 'Trupi',
    keywords: [
      'shower gel', 'xhel dushi', 'gel douche', 'gel doccia',
      'bath', 'banjë', 'bain', 'bagno',
      'soap', 'sapun', 'savon', 'sapone',
      'body wash', 'larje trupi', 'gel nettoyant corps',
      'deodorant', 'deodorant', 'déodorant', 'deodorante',
      'antiperspirant', 'antiperspirant', 'anti-transpirant', 'antitraspirante',
      'deo', 'deo', 'déo'
    ]
  },
  
  // === FARMACI - OTC ===
  {
    category: 'farmaci',
    subcategory: 'OTC (pa recete)',
    keywords: [
      'pain relief', 'dhimbje', 'douleur', 'dolore',
      'analgesic', 'analgjetik', 'analgésique', 'analgesico',
      'fever', 'ethe', 'fièvre', 'febbre',
      'cold', 'ftohje', 'rhume', 'raffreddore',
      'flu', 'grip', 'grippe', 'influenza',
      'cough', 'kollë', 'toux', 'tosse',
      'antihistamine', 'antihistaminik', 'antihistaminique', 'antistaminico',
      'allergy', 'alergi', 'allergie', 'allergia',
      'digestive', 'tretës', 'digestif', 'digestivo',
      'laxative', 'laksativ', 'laxatif', 'lassativo',
      'anti-inflammatory', 'anti-inflamator', 'anti-inflammatoire'
    ]
  },
  
  // === FARMACI - MIRËQENIA SEKSUALE ===
  {
    category: 'farmaci',
    subcategory: 'Mirëqenia seksuale',
    keywords: [
      'condom', 'preservativ', 'préservatif', 'preservativo',
      'durex', 'durex', 'durex', 'durex',
      'lubricant', 'lubrikan', 'lubrifiant', 'lubrificante',
      'sexual wellness', 'mirëqenie seksuale', 'bien-être sexuel',
      'intimacy', 'intimitet', 'intimité', 'intimità'
    ]
  },
  
  // === FARMACI - APARAT MJEKSORE ===
  {
    category: 'farmaci',
    subcategory: 'Aparat mjeksore',
    keywords: [
      'thermometer', 'termometar', 'thermomètre', 'termometro',
      'blood pressure', 'tensioni', 'tension artérielle', 'pressione sanguigna',
      'glucose', 'glukozë', 'glucose', 'glucosio',
      'nebulizer', 'nebulizator', 'nébuliseur', 'nebulizzatore',
      'inhaler', 'inhalator', 'inhalateur', 'inalatore',
      'oximeter', 'oksimetar', 'oxymètre', 'ossimetro',
      'monitor', 'monitor', 'moniteur', 'monitor',
      'medical device', 'pajisje mjekësore', 'dispositif médical'
    ]
  },
  
  // === FARMACI - FIRST AID ===
  {
    category: 'farmaci',
    subcategory: 'First Aid (Ndihma e Pare)',
    keywords: [
      'first aid', 'ndihmë e parë', 'premiers soins', 'primo soccorso',
      'bandage', 'fashë', 'bandage', 'bendaggio',
      'plaster', 'pllastar', 'pansement', 'cerotto',
      'antiseptic', 'antiseptik', 'antiseptique', 'antisettico',
      'wound', 'plagë', 'plaie', 'ferita',
      'disinfect', 'dezinfektant', 'désinfectant', 'disinfettante'
    ]
  },
  
  // === MAMA DHE BEBAT - SHTATZANI ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Shtatzani',
    keywords: [
      'pregnancy', 'shtatzani', 'grossesse', 'gravidanza',
      'maternity', 'maternitet', 'maternité', 'maternità',
      'pregnant', 'shtatëzënë', 'enceinte', 'incinta',
      'prenatal', 'parafëmijëror', 'prénatal', 'prenatale',
      'stretch mark mama', 'shenja shtatzani', 'vergetures grossesse'
    ]
  },
  
  // === MAMA DHE BEBAT - USHQYERJE ME GJI ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Ushqyerje me Gji',
    keywords: [
      'breastfeeding', 'ushqyerje me gji', 'allaitement', 'allattamento',
      'nursing', 'gjithenë', 'allaitement', 'allattamento',
      'breast pump', 'pompë gjiri', 'tire-lait', 'tiralatte',
      'nipple', 'thithka', 'téterelle', 'capezzolo',
      'lactation', 'laktacion', 'lactation', 'lattazione',
      'nursing tea', 'çaj ushqyerje', 'tisane allaitement'
    ]
  },
  
  // === MAMA DHE BEBAT - PELENA ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Pelena',
    keywords: [
      'diaper', 'pelena', 'couche', 'pannolino',
      'nappy', 'pelena', 'couche', 'pannolino',
      'pants', 'pantalon pelena', 'culotte', 'mutandina',
      'pampers', 'pampers', 'pampers', 'pampers',
      'pingo', 'pingo', 'pingo', 'pingo',
      'bambo', 'bambo', 'bambo', 'bambo'
    ]
  },
  
  // === MAMA DHE BEBAT - HIGJENA ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Higjena',
    keywords: [
      'baby wipes', 'shami bebe', 'lingettes bébé', 'salviettine bambino',
      'baby shampoo', 'shampo bebe', 'shampooing bébé', 'shampoo bambino',
      'baby bath', 'banjë bebe', 'bain bébé', 'bagno bambino',
      'baby gel', 'xhel bebe', 'gel bébé', 'gel bambino',
      'baby soap', 'sapun bebe', 'savon bébé', 'sapone bambino',
      'baby lotion', 'locion bebe', 'lait bébé', 'latte bambino',
      'baby cream', 'krem bebe', 'crème bébé', 'crema bambino',
      'talc', 'talku', 'talc', 'talco',
      'nappy cream', 'krem pelene', 'crème change',
      'infant', 'foshnje', 'nourrisson', 'neonato',
      'mustela', 'mustela', 'mustela', 'mustela',
      'klorane bebe', 'klorane bébé', 'klorane baby'
    ]
  },
  
  // === MAMA DHE BEBAT - SPF ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'SPF',
    keywords: [
      'baby sun', 'diell bebe', 'solaire bébé', 'sole bambino',
      'spf baby', 'spf bebe', 'spf bébé', 'spf bambino',
      'sun baby', 'diell bebe',
      'enfant spf', 'children sun',
      'pediatric sun', 'pediatrike diell'
    ]
  },
  
  // === MAMA DHE BEBAT - SUPLEMENTA ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Suplementa',
    keywords: [
      'baby vitamin', 'vitaminë bebe', 'vitamine bébé', 'vitamina bambino',
      'infant drops', 'pika foshnje', 'gouttes nourrisson', 'gocce neonato',
      'baby drops', 'pika bebe', 'gouttes bébé', 'gocce bambino',
      'vitamin d baby', 'd3 baby', 'vitamine d bébé',
      'omega baby', 'dha baby', 'omega bébé',
      'baby supplement', 'suplement bebe'
    ]
  },
  
  // === MAMA DHE BEBAT - AKSESOR ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Aksesor per Beba',
    keywords: [
      'bottle', 'biberon', 'biberon', 'biberon',
      'pacifier', 'suzeta', 'tétine', 'ciuccio',
      'teether', 'dhëmballë', 'anneau dentition', 'massaggiagengive',
      'nipple', 'thithka biberon', 'tétine biberon',
      'baby accessories', 'aksesor bebe'
    ]
  },
  
  // === MAMA DHE BEBAT - USHQIM ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Ushqim',
    keywords: [
      'baby food', 'ushqim bebe', 'alimentation bébé', 'pappa bambino',
      'baby water', 'ujë bebe', 'eau bébé', 'acqua bambino',
      'baby tea', 'çaj bebe', 'tisane bébé', 'tisana bambino',
      'baby rusks', 'biskota bebe', 'biscuits bébé', 'biscotti bambino',
      'infant food', 'ushqim foshnje',
      'holle', 'holle', 'holle', 'holle',
      'hipp', 'hipp', 'hipp', 'hipp'
    ]
  },
  
  // === MAMA DHE BEBAT - PLANIFIKIM FAMILJAR ===
  {
    category: 'mama-dhe-bebat',
    subcategory: 'Planifikim Familjar',
    keywords: [
      'pregnancy test', 'test shtatzani', 'test grossesse', 'test gravidanza',
      'ovulation', 'ovulacion', 'ovulation', 'ovulazione',
      'fertility', 'pjellori', 'fertilité', 'fertilità'
    ]
  },
  
  // === SUPLEMENTE - VITAMINAT DHE MINERALET ===
  {
    category: 'suplemente',
    subcategory: 'Vitaminat dhe Mineralet',
    keywords: [
      'vitamin', 'vitaminë', 'vitamine', 'vitamina',
      'mineral', 'mineral', 'minéral', 'minerale',
      'omega', 'omega', 'oméga', 'omega',
      'calcium', 'kalcium', 'calcium', 'calcio',
      'magnesium', 'magnez', 'magnésium', 'magnesio',
      'iron', 'hekur', 'fer', 'ferro',
      'zinc', 'zink', 'zinc', 'zinco',
      'multivitamin', 'multivitaminë', 'multivitamine',
      'vitamin d', 'vitamin d3', 'vitamine d',
      'vitamin c', 'vitamin c', 'vitamine c',
      'vitamin b', 'vitamin b', 'vitamine b',
      'supplement', 'suplement', 'complément', 'integratore'
    ]
  },
  
  // === SUPLEMENTE - ÇAJRA MJEKËSORE ===
  {
    category: 'suplemente',
    subcategory: 'Çajra Mjekësore',
    keywords: [
      'tea', 'çaj', 'thé', 'tè',
      'herbal', 'bimor', 'herbal', 'erbe',
      'infusion', 'infuzion', 'infusion', 'infusione',
      'tisane', 'çaj mjekësor', 'tisane', 'tisana'
    ]
  },
  
  // === PRODUKTE SHTESË - SETE ===
  {
    category: 'produkte-shtese',
    subcategory: 'Sete',
    keywords: [
      'set', 'set', 'coffret', 'cofanetto',
      'kit', 'kit', 'kit', 'kit',
      'pack', 'paketë', 'pack', 'confezione',
      'bundle', 'tufë', 'bundle'
    ]
  },
  
  // === PRODUKTE SHTESË - VAJRA ESENCIAL ===
  {
    category: 'produkte-shtese',
    subcategory: 'Vajra Esencial',
    keywords: [
      'essential oil', 'vaj esencial', 'huile essentielle', 'olio essenziale',
      'aromatherapy', 'aromaterapy', 'aromathérapie', 'aromaterapia',
      'lavender oil', 'vaj lavandë', 'huile lavande',
      'tea tree', 'tea tree', 'arbre à thé',
      'eucalyptus', 'eukaliptus', 'eucalyptus'
    ]
  }
]

console.log('📖 Duke lexuar të gjitha produktet me përshkrime...\n')

db.all('SELECT id, name, description, category, subcategory FROM products ORDER BY id', [], (err, products) => {
  if (err) {
    console.error('Error:', err)
    return
  }

  console.log(`✅ Gjetur ${products.length} produkte\n`)
  
  let updated = 0
  let checked = 0
  const updates = []
  
  // Analyze each product
  products.forEach(product => {
    checked++
    
    const searchText = `${product.name} ${product.description || ''}`.toLowerCase()
    let bestMatch = null
    let bestScore = 0
    
    // Find best matching category based on keyword count
    categoryRules.forEach(rule => {
      let score = 0
      rule.keywords.forEach(keyword => {
        if (searchText.includes(keyword.toLowerCase())) {
          score++
        }
      })
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = rule
      }
    })
    
    // If we found a match and it's different from current
    if (bestMatch && bestScore > 0) {
      if (bestMatch.category !== product.category || bestMatch.subcategory !== product.subcategory) {
        updates.push({
          id: product.id,
          name: product.name,
          oldCat: product.category,
          oldSub: product.subcategory,
          newCat: bestMatch.category,
          newSub: bestMatch.subcategory,
          score: bestScore
        })
      }
    }
    
    if (checked % 100 === 0) {
      console.log(`⏳ Kontrolluara ${checked}/${products.length}...`)
    }
  })
  
  console.log(`\n✅ Analiza përfundoi!`)
  console.log(`📊 Produkte që duhen përditësuar: ${updates.length}\n`)
  
  if (updates.length === 0) {
    console.log('🎉 TË GJITHA PRODUKTET JANË NË KATEGORITË E SAKTA!\n')
    process.exit(0)
    return
  }
  
  // Show what will be updated
  console.log('🔄 Do të përditësohen këto produkte:\n')
  updates.slice(0, 20).forEach(u => {
    console.log(`[${u.id}] ${u.name.substring(0, 50)}...`)
    console.log(`   ${u.oldCat}/${u.oldSub} ➡️  ${u.newCat}/${u.newSub} (score: ${u.score})`)
  })
  
  if (updates.length > 20) {
    console.log(`\n... dhe ${updates.length - 20} produkte të tjera\n`)
  }
  
  // Perform updates
  console.log('\n🔧 Duke bërë përditësimet...\n')
  
  let completed = 0
  updates.forEach((update, index) => {
    db.run(
      'UPDATE products SET category = ?, subcategory = ? WHERE id = ?',
      [update.newCat, update.newSub, update.id],
      (err) => {
        if (err) {
          console.error(`❌ Gabim në përditësimin e produktit ${update.id}:`, err)
        } else {
          updated++
        }
        
        completed++
        if (completed === updates.length) {
          console.log(`\n✨ MBAROI!`)
          console.log(`✅ Përditësuar: ${updated}/${updates.length} produkte`)
          console.log(`📊 Total kontrolluar: ${checked} produkte\n`)
          process.exit(0)
        }
      }
    )
  })
})
