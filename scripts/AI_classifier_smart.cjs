const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.resolve(__dirname, '..', 'farmaon_products.xlsx');
const outputExcelPath = path.resolve(__dirname, '..', 'farmaon_products_AI_classified.xlsx');
const outputMapPath = path.resolve(__dirname, '..', 'category_map_AI.txt');

console.log('========== AI KLASIFIKUES I AVANCUAR ==========\n');

// Read Excel
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(sheet);

console.log(`✓ U lexuan ${rawData.length} produkte nga Excel\n`);

// AI Classification Engine - lexon përshkrimin me kujdes
function classifyProductAI(name, description) {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  // Normalize për matching më të mirë
  const normalize = (s) => s.toLowerCase()
    .replace(/ë/g, 'e').replace(/ç/g, 'c').replace(/'/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').trim();
  
  const norm = normalize(text);
  const hasDesc = description && description.length > 10;

  // ========== PRIORITETI 1: MAMA DHE BEBAT (ABSOLUT) ==========
  
  // Baby products - kontrollo për fjalë SPECIFIKE baby
  const isBaby = /\b(bebe|baby|infant|newborn|foshnj|femij|child|porsalindur|nga lindja|per femij)\b/i.test(text);
  
  if (isBaby) {
    // Pelena
    if (/(pampers|pelena|diaper|nappy)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Kujdesi ndaj Bebit > Pelena',
        category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Pelena',
        arsyetim_shkurt: 'Pelenë për foshnje (AI: zbuloi "pelena/diaper" në përshkrim).',
        confidence: 1.0
      };
    }
    
    // SPF për baby
    if (/(spf|sun|solar|diell|mbrojtje.*diell|rrezatim.*diellor|protection.*solaire)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Kujdesi ndaj Bebit > SPF',
        category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > SPF',
        arsyetim_shkurt: 'Mbrojtje diellore për fëmijë (AI: "SPF" + "për fëmijë" në përshkrim).',
        confidence: 0.98
      };
    }
    
    // Vitamina/suplementa për baby
    if (/(vitamin|suplement|mineral|d3|omega|calcium|ferro|pikatur|drops|junior)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Kujdesi ndaj Bebit > Suplementa',
        category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Suplementa',
        arsyetim_shkurt: 'Suplement për fëmijë (AI: zbuloi vitamin + baby në përshkrim).',
        confidence: 0.95
      };
    }
    
    // Aksesor për bebe
    if (/(biberon|bottle|pacifier|suze|steriliz|warmer|monitor|furce.*dhemb.*baby)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Aksesor per Beba',
        category_path: 'Mama dhe Bebat > Aksesor per Beba',
        arsyetim_shkurt: 'Aksesor për kujdesin e bebit (AI: zbuloi biberon/monitor).',
        confidence: 0.95
      };
    }
    
    // Higjena për baby (default për baby products që nuk janë SPF/vitamina/pelena)
    if (/(shampo|shampoo|gel|xhel|sapun|soap|vaj|oil|krem|cream|locion|lotion|balsam|puder|powder|paste|wet.*wipe|shami|pluhur)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Kujdesi ndaj Bebit > Higjena',
        category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Higjena',
        arsyetim_shkurt: 'Produkt higjenikë për bebe (AI: shampo/krem + baby në përshkrim).',
        confidence: 0.93
      };
    }
  }
  
  // Shtatzani (prenatal, për gra shtatzëna)
  if (/(shtatzani|shtatzane|gravid|pregnant|prenatal|maternal|per gra shtatzane|anti.*stria.*gravid)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës > Shtatzani',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Nënës > Shtatzani',
      arsyetim_shkurt: 'Produkt për shtatzani (AI: zbuloi "shtatzani/prenatal").',
      confidence: 0.98
    };
  }
  
  // Ushqyerje me Gji (shumë specifik)
  if (/(ushqyerje.*gji|ushqim.*gji|pompa.*gji|pump.*breast|lanolin|krem.*thithash|nipple.*cream|laktacion|lactation|allaitement)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës > Ushqyerje me Gji',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Nënës > Ushqyerje me Gji',
      arsyetim_shkurt: 'Produkt për ushqyerje me gji (AI: "pompa gjiri/lanolin").',
      confidence: 0.98
    };
  }
  
  // Planifikim Familjar
  if (/(test.*shtatzani|pregnancy.*test|test.*ovulation|test.*ovul)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Planifikim Familjar',
      category_path: 'Mama dhe Bebat > Planifikim Familjar',
      arsyetim_shkurt: 'Test për planifikim familjar (AI: "test shtatzani").',
      confidence: 0.98
    };
  }

  // ========== PRIORITETI 2: FARMACI ==========
  
  // Aparat mjekësore (devices)
  if (/(termometer|thermometer|tensiometer|tensio|blood.*pressure|presion|glukometer|glucometer|oximeter|nebulizer|inhalator|aerosol|test.*strip|aparat.*mjek)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Aparat mjeksore',
      category_path: 'Farmaci > Aparat mjeksore',
      arsyetim_shkurt: 'Aparat mjekësor (AI: zbuloi termometër/tensiometër/etj).',
      confidence: 0.98
    };
  }
  
  // Ortopedike
  if (/(ortopedi|orthoped|ortez|brace|mbajtes|support|knee|elbow|ankle|wrist|kompresion|insole|taban)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Ortopedike',
      category_path: 'Farmaci > Ortopedike',
      arsyetim_shkurt: 'Produkt ortopedik (AI: ortez/mbështetës).',
      confidence: 0.95
    };
  }
  
  // First Aid
  if (/(plaster|plasture|bandage|bandazh|gaze|garze|antiseptic|antiseptik|povidon|betadin|wound|plage|ferite|disinfect)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'First Aid (Ndihma e Pare)',
      category_path: 'Farmaci > First Aid (Ndihma e Pare)',
      arsyetim_shkurt: 'Produkt për ndihmë të parë (AI: plaster/antiseptik).',
      confidence: 0.95
    };
  }
  
  // Mirëqenia seksuale (MOS CAP fjalë të rastësishme)
  if (/(preservative|condom|kondom|durex|control|lubric.*intim|fertility.*enhance)/i.test(text) &&
      /(durex|control|contex|preservativ|kondom)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Mirëqenia seksuale',
      category_path: 'Farmaci > Mirëqenia seksuale',
      arsyetim_shkurt: 'Produkt për mirëqenien seksuale (AI: prezervativ/Durex).',
      confidence: 0.98
    };
  }
  
  // ========== PRIORITETI 2.5: PRODUKTE SHTESË (para çdo kategorie tjetër!) ==========
  
  // Sete (kit, pack, trio, gift set) - KONTROLLO PARA HIGJENA për të kapur "Hand Cream Trio" etj.
  if (/(set|kit|pack|trio|duo|coffret|canta|travel.*size|gift|dhurate|promocional|special.*price|special.*offer|perfito.*falas|set.*per.*lekure|routine|ritual|blini.*dhe.*perfitoni|permban.*produkte)/i.test(text)) {
    return {
      kategoria_main: 'Produkte Shtesë',
      nenkategoria: 'Sete',
      category_path: 'Produkte Shtesë > Sete',
      arsyetim_shkurt: 'Set ose paketim promocional (AI: "set/kit/trio" në përshkrim).',
      confidence: 0.93
    };
  }

  // ========== PRIORITETI 3: HIGJENA (para OTC) ==========
  
  // Goja - SHUMË SPECIFIK
  if (/(paste.*dhemb|pasta.*dhemb|toothpaste|tooth.*gel|tooth.*cream|dent.*paste|ujë.*goje|uje.*goje|mouthwash|collut|oral.*rinse|floss|konac|furce.*dhemb|toothbrush)/i.test(text) &&
      !/(baby|bebe|infant|femij)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Goja',
      category_path: 'Higjena > Goja',
      arsyetim_shkurt: 'Produkt për higjienën orale (AI: pastë dhëmbësh/ujë goje).',
      confidence: 0.98
    };
  }
  
  // Këmbët
  if (/(foot|kemb|feet|per kembet|krem.*kemb|spray.*kemb|kallo|callus|podolog|thonj.*kemb)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Këmbët',
      category_path: 'Higjena > Këmbët',
      arsyetim_shkurt: 'Produkt për kujdesin e këmbëve (AI: "për këmbët").',
      confidence: 0.95
    };
  }
  
  // Depilim dhe Intime
  if (/(depil|epilim|wax|dyll|razor|brisk|shav|rroj|intimate|intime|intim|vaginal|feminine|higjiene.*intime|wash.*intim)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Depilim dhe Intime',
      category_path: 'Higjena > Depilim dhe Intime',
      arsyetim_shkurt: 'Produkt për depilim/higjienë intime (AI: zbuloi në përshkrim).',
      confidence: 0.95
    };
  }
  
  // Deodorant/Antiperspirant
  if (/(deodorant|antiperspirant|anti.*transpirant|deo\b|roll.*on|per djers)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Deodorant për higjienë (AI: zbuloi "deodorant").',
      confidence: 0.98
    };
  }
  
  // Sapun, sanitizer, wet wipes (jo-baby)
  if (/(sapun|soap|sanitizer|disinfectant.*hand|wet.*wipe|shami.*lag|hand.*wash|lavar.*duar)/i.test(text) &&
      !/(face|fytyre|viso|baby|bebe)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Sapun/sanitizer për higjienë (AI: zbuloi në përshkrim).',
      confidence: 0.90
    };
  }
  
  // Krem për duar (SPECIFIK për duar)
  if (/(krem.*duar|krem.*per.*duar|hand.*cream|hand.*lotion|riparues.*per.*duar)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Krem për duar dhe higjienë (AI: "krem për duar").',
      confidence: 0.95
    };
  }
  
  // ========== PRIORITETI 4: OTC (pas Higjena) ==========
  
  if (/(tablet|pill|capsul|kapsula|sirop|syrup|shurup|drop|pikatur|spray.*nasal|lozenges|pastil|painkill|analges|ibuprofen|paracetamol|aspirin|antihistamin|antacid|omeprazol|pantoprazol|ranitid|loperamid|ambroxol|kolle|cough|grip|\bflu\b|ftohje)/i.test(text) &&
      !/(vitamin|suplement|mineral|omega|probiot|collagen)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'OTC (pa recete)',
      category_path: 'Farmaci > OTC (pa recete)',
      arsyetim_shkurt: 'Ilaç pa recetë (AI: tabletë/sirop për simptoma).',
      confidence: 0.90
    };
  }
  
  // ========== PRIORITETI 5: SUPLEMENTE ==========
  
  if (/(vitamin|suplement|mineral|omega|probiot|prebiot|magnes|calcium|zinc|ferro|iron|d3|b12|coenzym|lecithin|collagen|glucosamin|ginkgo|ginseng|protein|creatine|melatonin|ashwagandha|coq10)/i.test(text) &&
      !/(baby|bebe|infant|femij|junior|kids)/i.test(text)) {
    return {
      kategoria_main: 'Suplemente',
      nenkategoria: 'Suplemente',
      category_path: 'Suplemente > Suplemente',
      arsyetim_shkurt: 'Suplement ushqimor (AI: vitamin/mineral në përshkrim).',
      confidence: 0.93
    };
  }
  
  // ========== PRIORITETI 5.5: PRODUKTE SHTESË (Vajra Esencial vetëm) ==========
  
  // Vajra Esencial (essential oils, aromatherapy)
  if (/(essential.*oil|vaj.*esencial|aroma.*oil|vaj.*aroma|aromatherap|castor.*oil|vaj.*kastor|lavender.*oil|tea.*tree|eucalyptus.*oil)/i.test(text) &&
      !/(body.*oil|massage.*oil)/i.test(text)) {
    return {
      kategoria_main: 'Produkte Shtesë',
      nenkategoria: 'Vajra Esencial',
      category_path: 'Produkte Shtesë > Vajra Esencial',
      arsyetim_shkurt: 'Vaj esencial për aromaterapi (AI: "essential oil").',
      confidence: 0.92
    };
  }
  
  // ========== PRIORITETI 6: DERMOKOZMETIKË ==========
  
  // Makeup (BB/CC, foundation, concealer, etc.)
  if (/(makeup|make.*up|foundation|fond.*ten|bb.*cream|cc.*cream|concealer|powder|cipria|blush|bronzer.*face|highlighter|illuminat|mascara|rimel|eyeliner|eyebrow|lipstick|lip.*gloss|ngjyre.*buze|primer|setting)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Makeup',
      category_path: 'Dermokozmetikë > Makeup',
      arsyetim_shkurt: 'Produkt makeup (AI: foundation/mascara/etj).',
      confidence: 0.95
    };
  }
  
  // Tanning
  if (/(self.*tan|auto.*bronz|bronzing.*body|nxirje|tanning|after.*sun|pas.*diell|apres.*soleil)/i.test(text) &&
      !/(face|fytyre|bronzer.*powder)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Tanning',
      category_path: 'Dermokozmetikë > Tanning',
      arsyetim_shkurt: 'Produkt për nxirje/pas diellit (AI: self-tan).',
      confidence: 0.93
    };
  }
  
  // SPF (për të rritur) - POR nëse ka edhe "anti-acne/blemish", shko në Fytyre!
  if (/(spf|sunscreen|sunblock|sun.*protect|solar|protection.*solaire|mbrojtje.*diell|rrezatim.*diellor|uv.*filter|pa\+)/i.test(text) &&
      !/(baby|bebe|infant|femij|makeup|foundation|bb.*cream)/i.test(text) &&
      !/(anti.*blemish|anti.*spot|trajt.*akne|trajt.*pika)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'SPF',
      category_path: 'Dermokozmetikë > SPF',
      arsyetim_shkurt: 'Mbrojtje diellore (AI: SPF në përshkrim).',
      confidence: 0.96
    };
  }
  
  // Flokët
  if (/(shampo|shampoo|conditioner|balsam.*flok|balsam.*hair|mask.*flok|mask.*hair|scalp|skalp|renie.*flok|hair.*loss|zbokth|dandruff|serum.*flok|locion.*flok|trajtim.*flok)/i.test(text) &&
      !/(baby|bebe|infant|body|trup|shower)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Floket',
      category_path: 'Dermokozmetikë > Floket',
      arsyetim_shkurt: 'Produkt për flokët (AI: shampo/balsam/mask në përshkrim).',
      confidence: 0.96
    };
  }
  
  // Trupi (body lotion, scrub, anti-cellulite)
  if (/(body.*lotion|body.*cream|body.*butter|body.*oil|body.*milk|krem.*trup|locion.*trup|vaj.*trup|qumesht.*trup|body.*scrub|body.*gommage|eksfoliues.*trup|anti.*cellulite|anti.*stria)/i.test(text) &&
      !/(sun|spf|shower|gel.*dush|baby|bebe|shtatzani|pregnant)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Trupi',
      category_path: 'Dermokozmetikë > Trupi',
      arsyetim_shkurt: 'Kujdes dermokozmetik për trupin (AI: body lotion/scrub).',
      confidence: 0.92
    };
  }
  
  // Shower gel - shiko nëse është hidratues (dermo) apo thjesht pastrues (higjena)
  if (/(shower.*gel|gel.*dush|xhel.*dush|body.*wash)/i.test(text) &&
      !/(baby|bebe)/i.test(text)) {
    if (/(moistur|hidrat|nourish|ushqy|care|kujdes)/i.test(text)) {
      return {
        kategoria_main: 'Dermokozmetikë',
        nenkategoria: 'Trupi',
        category_path: 'Dermokozmetikë > Trupi',
        arsyetim_shkurt: 'Xhel dushi hidratues (AI: "moisturizing" në përshkrim).',
        confidence: 0.85
      };
    } else {
      return {
        kategoria_main: 'Higjena',
        nenkategoria: 'Trupi',
        category_path: 'Higjena > Trupi',
        arsyetim_shkurt: 'Xhel dushi për higjienë (AI: thjesht pastrues).',
        confidence: 0.80
      };
    }
  }
  
  // Fytyre (cleanser, serum, krem, mask, toner) - PËRFSHIN edhe anti-acne/blemish dhe "për fytyrë dhe trup"
  if (/(serum|ampoule|krem.*fytyr|cream.*face|fluid.*face|mask|maske|gel.*fytyr|gel.*face|xhel.*pastrues|pastrues.*per.*fytyren|per.*fytyren.*dhe.*trupin|locion.*fytyr|toner|tonic|tonik|micellar|micelar|cleanser|pastrues|demakij|cleansing|foaming.*gel|anti.*age|anti.*wrinkle|anti.*blemish|anti.*spot|rrudh|akne|acne|spot|njolla|imperfection|retinol|niacinamide|hyaluronic|acid.*aha|acid.*bha|hydra|hidrat|moistur|per.*lekuren|lekure.*normale|lekure.*yndyrshme|lekure.*thate|per.*fytyren|eye.*cream|krem.*sy|contour.*eye|lip.*balm|balsam.*buze|stick.*buze|collagen|elasticity|night.*cream|specialist|liftactiv|matifikues|trajt.*akne|trajt.*pika)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Fytyre',
      category_path: 'Dermokozmetikë > Fytyre',
      arsyetim_shkurt: 'Kujdes dermokozmetik për fytyrën (AI: serum/krem/cleanser/anti-acne).',
      confidence: 0.93
    };
  }
  
  // ========== FALLBACK ==========
  
  // Nëse ka përshkrim të gjatë por nuk u kap, përdor confidence të ulët
  return {
    kategoria_main: 'Dermokozmetikë',
    nenkategoria: 'Fytyre',
    category_path: 'Dermokozmetikë > Fytyre',
    arsyetim_shkurt: hasDesc 
      ? 'Produkt dermokozmetik (AI: nuk gjeti match të qartë, default me confidence të ulët).'
      : 'Produkt dermokozmetik (AI: përshkrim i shkurtër, default).',
    confidence: hasDesc ? 0.40 : 0.30
  };
}

// Process ALL products with AI
console.log('========== AI DUKE ANALIZUAR PËRSHKRIMET ==========\n');

const results = rawData.map((row, idx) => {
  const name = row.Name || '';
  const description = row.Description || '';
  
  const classification = classifyProductAI(name, description);
  
  // Shfaq progress çdo 100 produkte
  if ((idx + 1) % 100 === 0) {
    console.log(`   Përpunuar ${idx + 1}/${rawData.length} produkte...`);
  }
  
  return {
    ...row,
    kategoria_main: classification.kategoria_main,
    nenkategoria: classification.nenkategoria,
    category_path: classification.category_path,
    arsyetim_shkurt: classification.arsyetim_shkurt,
    confidence: classification.confidence
  };
});

console.log(`\n✓ U klasifikuan ${results.length} produkte me AI\n`);

// Statistics
const stats = {};
results.forEach(r => {
  const key = r.category_path;
  stats[key] = (stats[key] || 0) + 1;
});

console.log('========== STATISTIKA AI ==========\n');
Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([path, count]) => {
  console.log(`${count.toString().padStart(4)} produkte: ${path}`);
});

// Confidence distribution
console.log('\n========== BESUESHMËRIA AI ==========\n');
const confBuckets = {
  'Shumë e lartë (≥0.95)': 0,
  'E lartë (0.85-0.94)': 0,
  'Mesatare (0.75-0.84)': 0,
  'E ulët (0.50-0.74)': 0,
  'Shumë e ulët (<0.50)': 0
};

results.forEach(row => {
  const conf = row.confidence;
  if (conf >= 0.95) confBuckets['Shumë e lartë (≥0.95)']++;
  else if (conf >= 0.85) confBuckets['E lartë (0.85-0.94)']++;
  else if (conf >= 0.75) confBuckets['Mesatare (0.75-0.84)']++;
  else if (conf >= 0.50) confBuckets['E ulët (0.50-0.74)']++;
  else confBuckets['Shumë e ulët (<0.50)']++;
});

Object.entries(confBuckets).forEach(([bucket, count]) => {
  const percentage = ((count / results.length) * 100).toFixed(1);
  console.log(`${bucket}: ${count} produkte (${percentage}%)`);
});

// Write Excel
const newWorkbook = XLSX.utils.book_new();
const newSheet = XLSX.utils.json_to_sheet(results);
XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'AI_Classified');
XLSX.writeFile(newWorkbook, outputExcelPath);

console.log(`\n✓ U krijua: ${outputExcelPath}`);

// Write category map
const mapLines = results.map(r => {
  const name = r.Name || 'N/A';
  const conf = r.confidence.toFixed(2);
  return `${name} -> ${r.category_path} (confidence: ${conf})`;
});

fs.writeFileSync(outputMapPath, mapLines.join('\n'), 'utf8');
console.log(`✓ U krijua: ${outputMapPath}`);

console.log('\n========== AI KLASIFIKIMI PERFUNDOI! ==========');
