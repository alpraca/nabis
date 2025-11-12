const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.resolve(__dirname, '..', 'farmaon_products.xlsx');
const outputExcelPath = path.resolve(__dirname, '..', 'farmaon_products_classified.xlsx');
const outputMapPath = path.resolve(__dirname, '..', 'category_map.txt');

console.log('========== DUKE FILLUAR KLASIFIKIMIN E PLOTË ==========\n');

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
  const headers = Object.keys(firstRow).map(h => h.toLowerCase());
  
  let nameCol = null, descCol = null;
  
  // Detect name column
  for (const key of Object.keys(firstRow)) {
    const lower = key.toLowerCase();
    if (/(^name$|^emri$|^produkt|^title|^product.*name|product_name)/i.test(lower)) {
      nameCol = key;
      break;
    }
  }
  
  // Fallback: first column that looks like text
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

// Classification function (EXACT rules from user requirements)
function classifyProduct(name, description) {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  // Normalize for matching
  const normalize = (s) => s.toLowerCase()
    .replace(/ë/g, 'e').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ').trim();
  
  const norm = normalize(text);

  // ========== MAMA DHE BEBAT (HIGHEST PRIORITY) ==========
  
  // Planifikim Familjar (pregnancy/ovulation tests, OTC contraceptives)
  if (/(pregnancy.*test|test.*shtatzani|ovulation.*test|test.*ovul|contracepti)/i.test(text) &&
      !/(preservat|condom)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Planifikim Familjar',
      category_path: 'Mama dhe Bebat > Planifikim Familjar',
      arsyetim_shkurt: 'Test ose produkt për planifikim familjar.',
      confidence: 0.95
    };
  }
  
  // Pelena (diapers)
  if (/(pampers|pelena|diaper|nappy)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit > Pelena',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Pelena',
      arsyetim_shkurt: 'Pelenë për foshnje.',
      confidence: 1.0
    };
  }
  
  // Shtatzani (prenatal, folate, anti-striae for pregnant)
  if (/(shtatzani|gravid|pregnant|prenatal|maternal|anti.*stria.*gravid|folate.*pregn)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës > Shtatzani',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Nënës > Shtatzani',
      arsyetim_shkurt: 'Produkt për shtatzani.',
      confidence: 0.95
    };
  }
  
  // Ushqyerje me Gji (nipple cream, breast pump, lactation) - MUST be explicit, not just "milk"
  if (/(gji|laktacion|lactation|breast.*pump|nipple.*cream|allattamento|allaitement|sein.*creme)/i.test(text) &&
      !/(solar|sun|spf|body)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës > Ushqyerje me Gji',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Nënës > Ushqyerje me Gji',
      arsyetim_shkurt: 'Produkt për ushqyerje me gji.',
      confidence: 0.95
    };
  }

  // Aksesor për bebe (bottles, pacifiers, sterilizers, warmers, monitors)
  if (/(biberon|bottle.*baby|pacifier|ciuccio|suza|steriliz.*baby|warmer.*bottle|baby.*monitor|termometer.*baby)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Aksesor per Beba',
      category_path: 'Mama dhe Bebat > Aksesor per Beba',
      arsyetim_shkurt: 'Aksesor për kujdesin e bebit.',
      confidence: 0.9
    };
  }

  // Suplementa për bebe/fëmijë (vitamin D drops, iron drops, etc.)
  if (/(vitamin|suplement|mineral|d3|omega|calcium|ferro|junior|kids|pediatr)/i.test(text) && 
      /(bebe|baby|infant|femij|child|neonato|pediatri|junior|kids|drop.*baby|picature.*femij)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit > Suplementa',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Suplementa',
      arsyetim_shkurt: 'Suplement për foshnje dhe fëmijë.',
      confidence: 0.95
    };
  }
  
  // SPF për bebe (sunscreen baby)
  if (/(spf|sun|solar|diell|mbrojtje.*diell|sunscreen|suncream)/i.test(text) && 
      /(bebe|baby|infant|femij|child|enfant|pediatri)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit > SPF',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > SPF',
      arsyetim_shkurt: 'Mbrojtje diellore për foshnje.',
      confidence: 0.95
    };
  }

  // Higjena për bebe (baby shampoo, oil, powder, wet wipes, diaper cream)
  if (/(bebe|baby|infant|enfant|neonato|pediatri)/i.test(text) && 
      /(shampo|xhel|gel|sapun|soap|vaj|oil|krem|cream|locion|lotion|balsam|balm|paste|pomade|powder|pluhur|wipe|shami|diaper.*cream)/i.test(text)) {
    return {
      kategoria_main: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit > Higjena',
      category_path: 'Mama dhe Bebat > Kujdesi ndaj Bebit > Higjena',
      arsyetim_shkurt: 'Produkt higjenikë për bebe.',
      confidence: 0.9
    };
  }

  // ========== FARMACI ==========
  
  // Aparat mjeksore (BP monitors, thermometers, glucometers, oximeters, nebulizers, test kits)
  if (/(termometer|thermometer|tensiometer|blood.*pressure|presion.*arter|glukometer|glucometer|oximeter|nebulizer|aerosol|aparat.*mjek|test.*kit.*medical|ecg|ekg)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Aparat mjeksore',
      category_path: 'Farmaci > Aparat mjeksore',
      arsyetim_shkurt: 'Aparat mjekësor.',
      confidence: 0.95
    };
  }

  // Ortopedike (braces, compression socks, insoles)
  if (/(orthoped|ortoped|brace|support|knee|elbow|ankle|wrist|back|lumbar|postur|compression.*sock|insole|solette)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Ortopedike',
      category_path: 'Farmaci > Ortopedike',
      arsyetim_shkurt: 'Produkt ortopedik.',
      confidence: 0.9
    };
  }

  // First Aid (plasters, bandages, gauze, antiseptics)
  if (/(gaze|gaza|bandage|fasho|plaster|cerotto|disinfect|antiseptic|povidon|betadin|wound|plage|ferite|first.*aid)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'First Aid (Ndihma e Pare)',
      category_path: 'Farmaci > First Aid (Ndihma e Pare)',
      arsyetim_shkurt: 'Produkt për ndihmë të parë.',
      confidence: 0.9
    };
  }

  // Mirëqenia seksuale (condoms, medicinal lubes, fertility/sexual wellness)
  if (/(preservat|condom|durex|lubric|kontracep|viagra|cialis|erecti|sexual.*wellness|fertility.*enhance)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'Mirëqenia seksuale',
      category_path: 'Farmaci > Mirëqenia seksuale',
      arsyetim_shkurt: 'Produkt për mirëqenien seksuale.',
      confidence: 0.95
    };
  }

  // ========== HIGJENA (must come before OTC to catch toothpaste) ==========
  
  // Goja (toothpaste, mouthwash, floss, toothbrush)
  if (/(toothpaste|paste.*dhemb|tooth.*gel|tooth.*cream|dent.*paste|mouthwash|uje.*goje|collut|oral.*rinse|floss|konac.*dent|toothbrush|furce.*dhemb)/i.test(text) &&
      !/(infant|bebe|baby.*toothbrush)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Goja',
      category_path: 'Higjena > Goja',
      arsyetim_shkurt: 'Produkt për higjienën orale.',
      confidence: 0.95
    };
  }

  // Këmbët (foot cream/spray/powder, callus/corn care)
  if (/(foot|kemb|feet|talc.*foot|podolog|corn|callus|kallo|nail.*toe|thonj.*kemb)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Këmbët',
      category_path: 'Higjena > Këmbët',
      arsyetim_shkurt: 'Produkt për kujdesin e këmbëve.',
      confidence: 0.9
    };
  }

  // Depilim dhe Intime (razors, wax, depilatory, intimate wash, non-Rx lubricants)
  if (/(depil|wax|razor|rroj|shav|intimate|intime|vaginal|feminine|wash.*intim|hygiene.*intim|lubric.*intim)/i.test(text) &&
      !/(preservat|condom|medicinal)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Depilim dhe Intime',
      category_path: 'Higjena > Depilim dhe Intime',
      arsyetim_shkurt: 'Produkt për depilim ose higjienë intime.',
      confidence: 0.9
    };
  }

  // Deodorant/antiperspirant → Higjena Trupi
  if (/(deodorant|antiperspirant|anti.*transpirant|deo|roll.*on|djers)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Deodorant për higjienë personale.',
      confidence: 0.95
    };
  }

  // Soap, sanitizer, wet wipes (general) → Higjena Trupi
  if (/(soap|sapun|sanitizer|disinfectant.*hand|wet.*wipe|shami.*lag|hand.*wash)/i.test(text) &&
      !/(face|fytyre|viso|bebe|baby)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Produkt higjenik për trupin.',
      confidence: 0.85
    };
  }

  // Hand cream/lotion → Higjena Trupi
  if (/(hand.*cream|krem.*duar|hand.*lotion|locion.*duar|hand.*care)/i.test(text) &&
      !/(face|fytyre|viso)/i.test(text)) {
    return {
      kategoria_main: 'Higjena',
      nenkategoria: 'Trupi',
      category_path: 'Higjena > Trupi',
      arsyetim_shkurt: 'Krem për duar dhe higjienë.',
      confidence: 0.9
    };
  }

  // ========== OTC (after hygiene to avoid conflicts) ==========
  
  // OTC medications (pain/fever, antihistamines, cough, antacids, nasal sprays, etc.)
  if (/(tablet|pill|capsul|sirop|syrup|drop.*oral|pikatur|spray.*nasal|throat.*spray|lozenges|pastil|painkill|analges|ibuprofen|paracetamol|aspirin|antihistamin|cough|kollë|grip|flu|antacid|proton.*pump|omeprazol|ranitid|antidiarr|loperamid|rehydrat)/i.test(text) &&
      !/(vitamin|suplement|mineral|omega|probiot|collagen)/i.test(text)) {
    return {
      kategoria_main: 'Farmaci',
      nenkategoria: 'OTC (pa recete)',
      category_path: 'Farmaci > OTC (pa recete)',
      arsyetim_shkurt: 'Ilac pa recetë.',
      confidence: 0.85
    };
  }

  // ========== SUPLEMENTE ==========
  
  // Supplements (vitamins, minerals, omega, collagen, probiotics, protein, melatonin)
  if (/(vitamin|suplement|mineral|omega|probiot|prebiot|magnes|calcium|zinc|ferro|iron|d3|b12|coenzym|lecithin|collagen|glucosamin|ginkgo|ginseng|protein|creatine|melatonin|multivitamin)/i.test(text) &&
      !/(bebe|baby|infant|femij|child|junior|kids|pediatr)/i.test(text)) {
    return {
      kategoria_main: 'Suplemente',
      nenkategoria: 'Suplemente',
      category_path: 'Suplemente > Suplemente',
      arsyetim_shkurt: 'Suplement ushqimor.',
      confidence: 0.9
    };
  }

  // ========== DERMOKOZMETIKË ==========
  
  // Makeup (foundation, BB/CC, concealer, powder, blush, bronzer, highlighter, mascara, eyeliner, brow, lipstick)
  if (/(makeup|make.*up|foundation|bb.*cream|cc.*cream|concealer|powder|cipria|blush|bronzer.*cosmet|highlighter|illuminat|mascara|eyeliner|eyebrow|pencil.*brow|lipstick|lip.*gloss|ngjyre.*buze|fond.*ten|rimel)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Makeup',
      category_path: 'Dermokozmetikë > Makeup',
      arsyetim_shkurt: 'Produkt makeup.',
      confidence: 0.95
    };
  }

  // Tanning (self-tan, auto-bronzant, body bronzer)
  if (/(self.*tan|auto.*bronz|bronzing.*body|nxir|tanning|after.*sun|apres.*soleil|pas.*diell)/i.test(text) &&
      !/(face|fytyre|bronzer.*powder)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Tanning',
      category_path: 'Dermokozmetikë > Tanning',
      arsyetim_shkurt: 'Produkt për nxirje ose kujdes pas diellit.',
      confidence: 0.9
    };
  }

  // SPF (sunscreen for adults) - BEFORE OTC
  if (/(spf|sun.*protect|solar|sunscreen|suncream|mbrojtje.*diell|photo.*protect|uv.*filter|protection.*solaire)/i.test(text) &&
      !/(bebe|baby|infant|femij|child|makeup|foundation|bb.*cream)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'SPF',
      category_path: 'Dermokozmetikë > SPF',
      arsyetim_shkurt: 'Mbrojtje diellore për të rritur.',
      confidence: 0.95
    };
  }

  // Floket (shampoo, conditioner, mask, scalp, anti-hair loss, dandruff)
  if (/(shampo|shampoo|conditioner|balsam.*hair|hair.*mask|mask.*hair|scalp|skalp|hair.*loss|renie.*flok|dandruff|zbokth|hair.*serum|locion.*hair|hair.*treatment|trajtim.*flok)/i.test(text) &&
      !/(bebe|baby|infant|body|trup|shower)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Floket',
      category_path: 'Dermokozmetikë > Floket',
      arsyetim_shkurt: 'Produkt për kujdesin e flokëve.',
      confidence: 0.95
    };
  }

  // Trupi dermo (body lotion/cream/butter, anti-cellulite/striae for non-pregnant)
  if (/(body.*cream|krem.*trup|body.*lotion|locion.*trup|body.*butter|body.*oil|vaj.*trup|body.*milk|qumesht.*trup|anti.*cellulite|anti.*stria)/i.test(text) &&
      !/(sun|spf|shower|gel.*dush|shtatzani|gravid|pregnant|face|fytyre)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Trupi',
      category_path: 'Dermokozmetikë > Trupi',
      arsyetim_shkurt: 'Kujdes dermokozmetik për trupin.',
      confidence: 0.85
    };
  }

  // Shower gel → check if more dermo (moisturizing) or hygiene (cleansing)
  if (/(shower.*gel|gel.*dush|body.*wash)/i.test(text) &&
      !/(bebe|baby)/i.test(text)) {
    // If mentions moisturizing/hydrating → Dermokozmetikë, else Higjena
    if (/(moistur|hidrat|nourish|ushqy)/i.test(text)) {
      return {
        kategoria_main: 'Dermokozmetikë',
        nenkategoria: 'Trupi',
        category_path: 'Dermokozmetikë > Trupi',
        arsyetim_shkurt: 'Xhel dushi hidratues (dermokozmetikë).',
        confidence: 0.75
      };
    } else {
      return {
        kategoria_main: 'Higjena',
        nenkategoria: 'Trupi',
        category_path: 'Higjena > Trupi',
        arsyetim_shkurt: 'Xhel dushi për higjienë.',
        confidence: 0.75
      };
    }
  }

  // Fytyre (cleanser, toner, serum, ampoule, face cream, moisturizer, anti-acne, retinol, niacinamide, HA, eye cream, lip balm)
  // Include: night cream, specialist, liftactiv, collagen for face, foaming gel for face
  if (/(serum|ampoule|face.*cream|krem.*fytyr|mask|maske|gel.*face|xhel.*fytyr|locion.*fytyr|tonic|tonik|micellar|micelar|cleanser|pastrues|demakij|cleansing|anti.*age|anti.*wrinkle|rrudh|acne|akne|spot|imperfection|retinol|niacinamide|hyaluronic|acid.*aha|acid.*bha|hydra|hidrat|moistur|eye.*cream|krem.*sy|contour.*eye|lip.*balm|balsam.*buze|stick.*buze|lip.*care|night.*cream|nuit.*cream|liftactiv|collagen.*specialist|specialist.*face|foaming.*gel|gel.*pastrues)/i.test(text)) {
    return {
      kategoria_main: 'Dermokozmetikë',
      nenkategoria: 'Fytyre',
      category_path: 'Dermokozmetikë > Fytyre',
      arsyetim_shkurt: 'Kujdes dermokozmetik për fytyrën.',
      confidence: 0.9
    };
  }

  // ========== PRODUKTE SHTESË ==========
  
  // Sete (kits, gift sets, pack, trio, duo)
  if (/(set|kit|pack|trio|duo|coffret|canta|travel.*size|pack.*voyage|special.*offer|promo|gift|dhurate)/i.test(text)) {
    return {
      kategoria_main: 'Produkte Shtesë',
      nenkategoria: 'Sete',
      category_path: 'Produkte Shtesë > Sete',
      arsyetim_shkurt: 'Set ose paketim promocional.',
      confidence: 0.85
    };
  }

  // Vajra Esencial (essential oils, aromatherapy - NOT generic body oils)
  if (/(essential.*oil|vaj.*esencial|aroma.*oil|vaj.*aroma|aromatherap|castor.*oil|vaj.*kastor|lavender.*oil|tea.*tree.*oil|eucalyptus.*oil)/i.test(text) &&
      !/(body.*oil|massage.*oil|trup)/i.test(text)) {
    return {
      kategoria_main: 'Produkte Shtesë',
      nenkategoria: 'Vajra Esencial',
      category_path: 'Produkte Shtesë > Vajra Esencial',
      arsyetim_shkurt: 'Vaj esencial për aromaterapi.',
      confidence: 0.9
    };
  }

  // ========== FALLBACK ==========
  
  // If nothing matched, default to most common: Dermokozmetikë > Fytyre
  return {
    kategoria_main: 'Dermokozmetikë',
    nenkategoria: 'Fytyre',
    category_path: 'Dermokozmetikë > Fytyre',
    arsyetim_shkurt: 'Produkt dermokozmetik (default).',
    confidence: 0.5
  };
}

// Process ALL rows
console.log('========== DUKE KLASIFIKUAR 1,227 PRODUKTE ==========\n');

const results = rawData.map((row, idx) => {
  const name = row[cols.nameCol] || '';
  const description = cols.descCol ? (row[cols.descCol] || '') : '';
  
  const classification = classifyProduct(name, description);
  
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
console.log(`✓ U krijua category_map.txt: ${outputMapPath}`);

console.log('\n========== PERFUNDOI ME SUKSES! ==========');
