const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.resolve(__dirname, '..', 'farmaon_products.xlsx');
const outputExcelPath = path.resolve(__dirname, '..', 'farmaon_products_classified_v2.xlsx');
const outputMapPath = path.resolve(__dirname, '..', 'category_map_v2.txt');

console.log('========== KLASIFIKIM STRIKT ME PRIORITET V2 ==========\n');

// Read Excel
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(sheet);

console.log(`✓ U lexuan ${rawData.length} rreshta nga Excel`);

// Auto-detect columns
function detectColumns(data) {
  if (data.length === 0) return null;
  
  const firstRow = data[0];
  let nameCol = null, descCol = null;
  
  // Detect name column
  for (const key of Object.keys(firstRow)) {
    const lower = key.toLowerCase();
    if (/(^name$|^emri$|^produkt|^title|^product.*name|product_name)/i.test(lower)) {
      nameCol = key;
      break;
    }
  }
  
  if (!nameCol) {
    nameCol = Object.keys(firstRow).find(k => 
      typeof firstRow[k] === 'string' && firstRow[k].length > 0
    ) || Object.keys(firstRow)[0];
  }
  
  // Detect description column
  for (const key of Object.keys(firstRow)) {
    const lower = key.toLowerCase();
    if (/(description|pershkrim|details|detaje|info)/i.test(lower)) {
      descCol = key;
      break;
    }
  }
  
  return { nameCol, descCol };
}

const cols = detectColumns(rawData);
console.log(`✓ Kolona emri: "${cols.nameCol}"`);
console.log(`✓ Kolona përshkrim: "${cols.descCol || 'N/A'}"\n`);

// STRICT PRIORITY CLASSIFICATION (aplikuar sipas rendit të specifikuar)
function classifyProductStrict(name, description) {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  // ========== PRIORITETI 1: MAMA DHE BEBAT (OVERRIDE TË GJITHA) ==========
  
  // Check if it's baby/child product - MUST be explicit
  const isBabyProduct = /(^baby|^bebe|bebe[^r]|baby[^-]|\bbaby\b|\bbebe\b|infant|newborn|kids.*age|children.*age|neonato|pediatri[ck]|femij|porsalindur|^pampers|junior.*age|enfant|bambino)/i.test(text) &&
                        !/(specialist|control|formula|routine|care.*adult|adult.*care)/i.test(text);
  
  if (isBabyProduct) {
    // Pelena/diaper
    if (/(pelena|diaper|pampers|nappy)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Kujdesi ndaj Bebit > Pelena',
        category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Pelena',
        arsyetim_shkurt: 'Pelenë për foshnje.',
        confidence: 1.0
      };
    }
    
    // SPF për bebe
    if (/(spf|sun|solar|sunscreen|sunblock|diell|mbrojtje.*diell)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Kujdesi ndaj Bebit > SPF',
        category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > SPF',
        arsyetim_shkurt: 'Mbrojtje diellore për foshnje.',
        confidence: 0.98
      };
    }
    
    // Vitamina/probiotikë për bebe (drops, junior, etc.)
    if (/(vitamin|suplement|mineral|omega|probiot|ferro|iron|d3|calcium|drops|pikatur|junior)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Kujdesi ndaj Bebit > Suplementa',
        category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Suplementa',
        arsyetim_shkurt: 'Suplement për foshnje dhe fëmijë.',
        confidence: 0.98
      };
    }
    
    // Aksesor për bebe
    if (/(biberon|bottle|pacifier|ciuccio|suza|steriliz|warmer|monitor|termometer)/i.test(text)) {
      return {
        kategoria_main: 'Mama dhe Bebat',
        nenkategoria: 'Aksesor per Beba',
        category_path: 'Mama dhe Bebat > Aksesor per Beba',
        arsyetim_shkurt: 'Aksesor për kujdesin e bebit.',
        confidence: 0.95
      };
    }
    
    // Higjena për bebe (default për baby products)
    // shampoo/gel/cream/wet wipes/vaj/puder/diaper cream
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit > Higjena',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Higjena',
      arsyetim_shkurt: 'Produkt higjenikë për foshnje.',
      confidence: 0.9
    };
  }
  
  // Shtatzani
  if (/(shtatzani|gravid|pregnant|prenatal|maternal|anti.*stria.*gravid|acid.*folik|folate.*pregn)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës > Shtatzani',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Nënës > Shtatzani',
      arsyetim_shkurt: 'Produkt për shtatzani.',
      confidence: 0.98
    };
  }
  
  // Ushqyerje me Gji
  if (/(ushqyer.*gji|laktacion|lactation|breast.*pump|pompa.*gjiri|nipple.*cream|lanolin|krem.*thithash|allaitement|allattamento|sein)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës > Ushqyerje me Gji',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Nënës > Ushqyerje me Gji',
      arsyetim_shkurt: 'Produkt për ushqyerje me gji.',
      confidence: 0.98
    };
  }
  
  // Planifikim Familjar
  if (/(pregnancy.*test|test.*shtatzani|ovulation.*test|test.*ovul)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Planifikim Familjar',
      category_path: 'Mama dhe Bebat > Planifikim Familjar',
      arsyetim_shkurt: 'Test për planifikim familjar.',
      confidence: 0.98
    };
  }
  
  // ========== PRIORITETI 2: APARATE MJEKËSORE & FARMACI ==========
  
  // Aparat mjeksore (devices)
  if (/(tensiometer|tensio|termometer|thermometer|glukometer|glucometer|oximeter|nebulizer|inhalator|aparat.*mjek|blood.*pressure|presion|test.*strip|strip.*gluko|ecg|ekg)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Aparat mjeksore',
      category_path: 'Farmaci > Aparat mjeksore',
      arsyetim_shkurt: 'Aparat mjekësor për përdorim diagnostik.',
      confidence: 0.98
    };
  }
  
  // First Aid
  if (/(plaster|plasture|bandage|bandazh|gaze|garze|gaza|antiseptic|antiseptik|povidon|betadin|wound|plage|ferite|disinfect|first.*aid)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'First Aid (Ndihma e Pare)',
      category_path: 'Farmaci > First Aid (Ndihma e Pare)',
      arsyetim_shkurt: 'Produkt për ndihmë të parë dhe kujdes plagësh.',
      confidence: 0.95
    };
  }
  
  // Ortopedike
  if (/(orthoped|ortoped|ortez|brace|support|knee|elbow|ankle|wrist|back|lumbar|postur|compression.*sock|insole|taban|solette|mbajtese)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Ortopedike',
      category_path: 'Farmaci > Ortopedike',
      arsyetim_shkurt: 'Produkt ortopedik për mbështetje.',
      confidence: 0.95
    };
  }
  
  // ========== PRIORITETI 3: HIGJENA (PARA OTC) ==========
  
  // Goja (toothpaste, mouthwash, floss, toothbrush)
  if (/(toothpaste|paste.*dhemb|pasta.*dhemb|tooth.*gel|tooth.*cream|dent.*paste|mouthwash|gojelaj|uje.*goje|collut|oral.*rinse|floss|konac|toothbrush|furce.*dhemb|whitening.*pen)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Goja',
      category_path: 'Higjena > Goja',
      arsyetim_shkurt: 'Produkt për higjienën orale.',
      confidence: 0.98
    };
  }
  
  // Depilim dhe Intime
  if (/(intimate.*wash|intimate.*gel|gel.*intime|wash.*intime|hygiene.*intime|feminine.*wash|vaginal|depil|wax|razor|brisk|rroj|shav|lubric.*intim)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Depilim dhe Intime',
      category_path: 'Higjena > Depilim dhe Intime',
      arsyetim_shkurt: 'Produkt për depilim ose higjienë intime.',
      confidence: 0.95
    };
  }
  
  // Këmbët
  if (/(foot.*cream|foot.*spray|krem.*kemb|spray.*kemb|callus|kallo|corn|podolog|talc.*foot|nail.*toe|thonj.*kemb)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Këmbët',
      category_path: 'Higjena > Këmbët',
      arsyetim_shkurt: 'Produkt për kujdesin e këmbëve.',
      confidence: 0.95
    };
  }
  
  // Deodorant/antiperspirant → Higjena Trupi
  if (/(deodorant|antiperspirant|anti.*transpirant|deo|roll.*on|djers)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Deodorant për higjienë personale.',
      confidence: 0.98
    };
  }
  
  // Soap, sanitizer, wet wipes (jo-baby) → Higjena Trupi
  if (/(soap|sapun|sanitizer|disinfectant.*hand|wet.*wipe|shami.*lag|hand.*wash|gel.*igjen)/i.test(text) &&
      !/(face|fytyre|viso)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Produkt higjenik për trupin.',
      confidence: 0.9
    };
  }
  
  // Hand cream → Higjena Trupi
  if (/(hand.*cream|krem.*duar|hand.*lotion|locion.*duar|hand.*care)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Krem për duar dhe higjienë.',
      confidence: 0.95
    };
  }
  
  // ========== PRIORITETI 4: MIRËQENIA SEKSUALE ==========
  
  // Kontraceptivë/condoms/lubrikantë (PARA Dermokozmetikë për të evituar "specialist" → "cialis")
  if (/(^condom|^preservat|^durex|^control.*condom|lubric.*sexual|kontracep.*sexual|viagra|^cialis|erecti.*dysfunction|sexual.*wellness|fertility.*supplement)/i.test(text) ||
      (/durex/i.test(text) && /(play|massage|gel|love)/i.test(text))) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Mirëqenia seksuale',
      category_path: 'Farmaci > Mirëqenia seksuale',
      arsyetim_shkurt: 'Produkt për mirëqenien seksuale.',
      confidence: 0.98
    };
  }
  
  // ========== PRIORITETI 5: OTC (PA RECETE) ==========
  
  // OTC medications (analgjezikë, antihistaminikë, antacid, shurup kollë, spray nazal, etj.)
  if (/(paracetamol|ibuprofen|aspirin|diclo|diclofenac|omeprazole|pantoprazole|antacid|antihistamin|loratadin|cetirizin|shurup|syrup.*cough|kollë|spray.*nazal|nasal.*spray|throat.*spray|lozenges|pastil|painkill|analges|grip|flu|antidiarr|loperamid|rehydrat|ambroxol)/i.test(text) &&
      !/(vitamin|suplement|mineral|omega|probiot|collagen)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'OTC (pa recete)',
      category_path: 'Farmaci > OTC (pa recete)',
      arsyetim_shkurt: 'Ilaç pa recetë për simptoma.',
      confidence: 0.9
    };
  }
  
  // ========== PRIORITETI 6: SUPLEMENTE ==========
  
  // Suplemente (vitaminë, minerale, omega, collagen, probiotik, protein, etj.)
  if (/(vitamin|suplement|mineral|omega|probiot|prebiot|magnes|calcium|zinc|ferro|iron|d3|b12|k2|coenzym|lecithin|collagen|glucosamin|ginkgo|ginseng|protein|creatine|melatonin|ashwagandha|coq10|selen)/i.test(text)) {
    return {
      kategoria_main: 'Suplemente',
      nenkategoria: 'Suplemente',
      category_path: 'Suplemente > Suplemente',
      arsyetim_shkurt: 'Suplement ushqimor për të rritur.',
      confidence: 0.95
    };
  }
  
  // ========== PRIORITETI 7: DERMOKOZMETIKË ==========
  
  // Makeup (foundation, BB/CC si mbulim, concealer, powder, blush, bronzer face, highlighter, mascara, eyeliner, brow, lipstick/gloss, primer, setting)
  if (/(makeup|make.*up|foundation|bb.*cream|cc.*cream|concealer|powder.*face|cipria|blush|bronzer.*face|bronzer.*powder|highlighter|illuminat|mascara|rimel|eyeliner|eyebrow|pencil.*brow|lipstick|lip.*gloss|ngjyre.*buze|fond.*ten|primer|setting|kajal)/i.test(text) &&
      !/(toothpaste|whitening.*pen)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Makeup',
      category_path: 'Dermokozmetikë > Makeup',
      arsyetim_shkurt: 'Produkt makeup për fytyrë.',
      confidence: 0.98
    };
  }
  
  // Tanning (self-tan për trup, auto-bronzant, body bronzer)
  if (/(self.*tan|auto.*bronz|bronzing.*body|bronzer.*body|nxir|tanning.*lotion|after.*sun|apres.*soleil|pas.*diell)/i.test(text) &&
      !/(face|fytyre|powder|makeup)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Tanning',
      category_path: 'Dermokozmetikë > Tanning',
      arsyetim_shkurt: 'Produkt për nxirje ose kujdes pas diellit.',
      confidence: 0.95
    };
  }
  
  // SPF (sunscreen për të rritur, face/body)
  if (/(spf|sun.*protect|solar|sunscreen|sunblock|suncream|mbrojtje.*diell|photo.*protect|uv.*filter|protection.*solaire|pa\+)/i.test(text) &&
      !/(makeup|foundation|bb.*cream.*mbulim)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'SPF',
      category_path: 'Dermokozmetikë > SPF',
      arsyetim_shkurt: 'Mbrojtje diellore për të rritur.',
      confidence: 0.98
    };
  }
  
  // Floket (shampoo, conditioner, mask, scalp, anti-hair-loss, dandruff)
  if (/(shampo|shampoo|conditioner|balsam.*hair|balsam.*flok|hair.*mask|mask.*hair|maske.*flok|scalp|skalp|hair.*loss|renie.*flok|dandruff|zbokth|hair.*serum|serum.*flok|hair.*treatment|trajtim.*flok|locion.*hair)/i.test(text) &&
      !/(body|trup|shower)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Floket',
      category_path: 'Dermokozmetikë > Floket',
      arsyetim_shkurt: 'Produkt për kujdesin e flokëve.',
      confidence: 0.98
    };
  }
  
  // Trupi dermo (body lotion/cream/butter, anti-cellulite/striae jo-baby, body scrub/gommage/exfoliant)
  if (/(body.*cream|krem.*trup|body.*lotion|locion.*trup|body.*butter|body.*oil|vaj.*trup|body.*milk|qumesht.*trup|anti.*cellulite|anti.*stria|body.*scrub|body.*gommage|body.*exfoliant|gommage.*corps|scrub.*body)/i.test(text) &&
      !/(sun|spf|shower|gel.*dush|face|fytyre)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Trupi',
      category_path: 'Dermokozmetikë > Trupi',
      arsyetim_shkurt: 'Kujdes dermokozmetik për lëkurën e trupit.',
      confidence: 0.9
    };
  }
  
  // Shower gel → check if moisturizing (Dermo) or cleansing (Higjena)
  if (/(shower.*gel|gel.*dush|body.*wash)/i.test(text)) {
    if (/(moistur|hidrat|nourish|ushqy)/i.test(text)) {
      return {
        kategoria_main: 'Dermokozmetikë',
        nenkategoria: 'Trupi',
        category_path: 'Dermokozmetikë > Trupi',
        arsyetim_shkurt: 'Xhel dushi hidratues (dermokozmetikë).',
        confidence: 0.8
      };
    } else {
      return {
        kategoria_main: 'Higjena',
        nenkategoria: 'Trupi',
        category_path: 'Higjena > Trupi',
        arsyetim_shkurt: 'Xhel dushi për higjienë.',
        confidence: 0.8
      };
    }
  }
  
  // Fytyre (cleanser, toner, serum, ampoule, cream, moisturizer, anti-acne, retinol, niacinamide, HA, eye cream, lip balm)
  // Include: spray/eau for face care (NOT parfum)
  if (/(cleanser|lares|pastrues|demakij|cleansing|toner|tonik|serum|ampoule|face.*cream|krem.*fytyr|mask|maske|gel.*face|xhel.*fytyr|locion.*fytyr|micellar|micelar|anti.*age|anti.*wrinkle|rrudh|acne|akne|spot|njolla|imperfection|retinol|niacinamide|hyaluronic|acid.*aha|acid.*bha|glycolic|salicylic|hydra|hidrat|moistur|eye.*cream|krem.*sy|contour.*eye|lip.*balm|balsam.*buze|stick.*buze|lip.*care|night.*cream|nuit|liftactiv|collagen.*specialist|foaming.*gel|gel.*pastrues|spray.*face|eau.*face|cicalfate.*spray|xeracalm)/i.test(text) &&
      !/(parfum|fragrant.*water|le.*parfum|eau.*parfum)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Fytyre',
      category_path: 'Dermokozmetikë > Fytyre',
      arsyetim_shkurt: 'Kujdes dermokozmetik për fytyrën.',
      confidence: 0.95
    };
  }
  
  // ========== PRIORITETI 8: PRODUKTE SHTESË ==========
  
  // Parfume/fragrant water (nuk ka kategori specifike, shko te Produkte Shtesë)
  if (/(parfum|fragrant.*water|eau.*parfum|le.*parfum|cologne|perfume|fragrance)/i.test(text) &&
      !/(free|pa.*parfum|fragrance.*free)/i.test(text)) {
    return {
      kategoria_main: 'Produkte Shtesë',
      nenkategoria: 'Sete',
      category_path: 'Produkte Shtesë > Sete',
      arsyetim_shkurt: 'Parfum ose ujë aromatik (kategori shtesë).',
      confidence: 0.7
    };
  }
  
  // Essential oils (aromatherapy) - JO body oil kozmetik
  if (/(essential.*oil|vaj.*esencial|aroma.*oil|vaj.*aroma|aromatherap|castor.*oil|vaj.*kastor|lavender.*oil|tea.*tree.*oil|eucalyptus.*oil|rosemary.*oil)/i.test(text) &&
      !/(body.*oil|massage.*oil|trup)/i.test(text)) {
    return {
      kategoria_main: 'Produkte Shtesë',
      nenkategoria: 'Vajra Esencial',
      category_path: 'Produkte Shtesë > Vajra Esencial',
      arsyetim_shkurt: 'Vaj esencial për aromaterapi.',
      confidence: 0.95
    };
  }
  
  // Set/kit/gift
  if (/(set|kit|pack|trio|duo|coffret|canta|travel.*size|pack.*voyage|special.*offer|promo|gift|dhurate)/i.test(text)) {
    // Përjashtim: nëse është set me aparat mjekësor
    if (/(diabetes.*kit|gluco.*kit|starter.*kit.*aparat)/i.test(text)) {
      return {
        kategoria_main: 'Farmaci',
        nenkategoria: 'Aparat mjeksore',
        category_path: 'Farmaci > Aparat mjeksore',
        arsyetim_shkurt: 'Set me aparat mjekësor.',
        confidence: 0.9
      };
    }
    return {
      kategoria_main: 'Produkte Shtesë',
      nenkategoria: 'Sete',
      category_path: 'Produkte Shtesë > Sete',
      arsyetim_shkurt: 'Set ose paketim promocional.',
      confidence: 0.9
    };
  }
  
  // ========== FALLBACK (DEFAULT) ==========
  
  // Nëse asgjë nuk u kap, vendos në Dermokozmetikë > Fytyre me confidence të ulët
  return {
    kategoria_main: 'Dermokozmetikë',
    nenkategoria: 'Fytyre',
    category_path: 'Dermokozmetikë > Fytyre',
    arsyetim_shkurt: 'Produkt dermokozmetik (kategori default).',
    confidence: 0.5
  };
}

// Process ALL rows
console.log('========== DUKE KLASIFIKUAR 1,227 PRODUKTE (STRICT MODE) ==========\n');

const results = rawData.map((row, idx) => {
  const name = row[cols.nameCol] || '';
  const description = cols.descCol ? (row[cols.descCol] || '') : '';
  
  const classification = classifyProductStrict(name, description);
  
  return {
    ...row,
    kategoria_main: classification.kategoria_main,
    nenkategoria: classification.nenkategoria,
    category_path: classification.category_path,
    arsyetim_shkurt: classification.arsyetim_shkurt,
    confidence: classification.confidence
  };
});

console.log(`✓ U klasifikuan ${results.length} produkte\n`);

// Generate statistics
const stats = {};
results.forEach(r => {
  const key = r.category_path;
  stats[key] = (stats[key] || 0) + 1;
});

console.log('========== STATISTIKA ==========\n');
Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([path, count]) => {
  console.log(`${count.toString().padStart(4)} produkte: ${path}`);
});

// Confidence distribution
console.log('\n========== BESUESHMËRIA ==========\n');
const confBuckets = {
  'Shumë e lartë (≥0.95)': 0,
  'E lartë (0.85-0.94)': 0,
  'Mesatare (0.75-0.84)': 0,
  'E ulët (<0.75)': 0
};

results.forEach(row => {
  const conf = row.confidence;
  if (conf >= 0.95) confBuckets['Shumë e lartë (≥0.95)']++;
  else if (conf >= 0.85) confBuckets['E lartë (0.85-0.94)']++;
  else if (conf >= 0.75) confBuckets['Mesatare (0.75-0.84)']++;
  else confBuckets['E ulët (<0.75)']++;
});

Object.entries(confBuckets).forEach(([bucket, count]) => {
  const percentage = ((count / results.length) * 100).toFixed(1);
  console.log(`${bucket}: ${count} produkte (${percentage}%)`);
});

// Write new Excel
const newWorkbook = XLSX.utils.book_new();
const newSheet = XLSX.utils.json_to_sheet(results);
XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Classified');
XLSX.writeFile(newWorkbook, outputExcelPath);

console.log(`\n✓ U krijua skedari Excel: ${outputExcelPath}`);

// Write category map text file
const mapLines = results.map(r => {
  const name = r[cols.nameCol] || 'N/A';
  return `${name} -> ${r.category_path}`;
});

fs.writeFileSync(outputMapPath, mapLines.join('\n'), 'utf8');
console.log(`✓ U krijua category_map_v2.txt: ${outputMapPath}`);

console.log('\n========== PERFUNDOI ME SUKSES! ==========');
