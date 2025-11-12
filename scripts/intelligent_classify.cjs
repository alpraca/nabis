const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '..', 'products.json');
const outPath = path.resolve(__dirname, '..', 'classification_intelligent.json');

// Read and parse UTF-16LE encoded products.json
const buf = fs.readFileSync(productsPath);
let raw = buf.toString('utf16le').replace(/^\uFEFF/, '').replace(/[\u0000-\u001F]/g, ' ');
const products = JSON.parse(raw);

function classifyProduct(name, description) {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  // Remove diacritics and normalize for better matching
  const normalize = (s) => s.toLowerCase()
    .replace(/ë/g, 'e').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ').trim();
  
  const norm = normalize(text);

  // ========== MAMA DHE BEBAT ==========
  
  // Pelena
  if (/(pampers|pelena|diaper)/i.test(text)) {
    return {
      kategoria: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit → Pelena',
      arsyetim: 'Produkt është pelenë për foshnje.'
    };
  }
  
  // Produkte për shtatzani
  if (/(shtatzani|gravide|pregnant|maternal|prenatal|gravid)/i.test(text)) {
    return {
      kategoria: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës → Shtatzani',
      arsyetim: 'Produkt specifik për shtatzani.'
    };
  }
  
  // Produkte për ushqyerje me gji
  if (/(gji|laktacion|alattamento|breastfeed|latte)/i.test(text) && !/(qumesht|milk)/i.test(text)) {
    return {
      kategoria: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Nënës → Ushqyerje me Gji',
      arsyetim: 'Produkt për ushqyerje me gji (laktacion).'
    };
  }

  // Aksesor për bebe (termomet, furçe dhëmbësh për fëmijë, etj)
  if (/(infant.*toothbrush|furce.*femij|furce.*bebe|biberon|shishe.*bebe|bottle.*baby|nail.*clipper.*baby|thonj.*bebe)/i.test(text)) {
    return {
      kategoria: 'Mama dhe Bebat',
      nenkategoria: 'Aksesor per Beba',
      arsyetim: 'Aksesor për kujdesin e bebit (furçe, biberon, etj).'
    };
  }

  // Vitaminë/suplement për bebe/fëmijë
  if (/(vitamin|suplement|mineral|d3|omega|calcium|ferro|junior|kids)/i.test(text) && 
      /(bebe|baby|infant|femij|child|neonato|pediatri|junior|kids|f├½mij|porsalindur)/i.test(text)) {
    return {
      kategoria: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit → Suplementa',
      arsyetim: 'Suplement ose vitaminë për foshnje dhe fëmijë.'
    };
  }
  
  // SPF për bebe/fëmijë
  if (/(spf|sun|solar|diell|mbrojtje.*diell)/i.test(text) && 
      /(bebe|baby|infant|femij|child|enfant|pediatri)/i.test(text)) {
    return {
      kategoria: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit → SPF',
      arsyetim: 'Mbrojtje diellore specifike për foshnje dhe fëmijë.'
    };
  }

  // Higjenë për bebe (shampo, xhel, sapun, vaj, krem për bebe)
  if (/(bebe|baby|infant|enfant|neonato|pediatri)/i.test(text) && 
      /(shampo|xhel|gel|sapun|soap|vaj|oil|krem|cream|locion|lotion|balsam|balm|paste|pomade)/i.test(text)) {
    return {
      kategoria: 'Mama dhe Bebat',
      nenkategoria: 'Kujdesi ndaj Bebit → Higjena',
      arsyetim: 'Produkt higjenikë për kujdesin ditor të bebit.'
    };
  }

  // ========== FARMACI ==========
  
  // Aparat mjekësore (termometra, aparate presioni, nebulizer, etj)
  if (/(termometer|thermometer|pressio|blood.*pressure|nebulizer|aerosol|aparat|glukometer|glucometer|oximeter)/i.test(text)) {
    return {
      kategoria: 'Farmaci',
      nenkategoria: 'Aparat mjeksore',
      arsyetim: 'Aparat mjekësor për matje dhe monitorim.'
    };
  }

  // Ortopedike
  if (/(orthoped|ortoped|brace|support|knee|elbow|ankle|wrist|back|lumbar|postur)/i.test(text)) {
    return {
      kategoria: 'Farmaci',
      nenkategoria: 'Ortopedike',
      arsyetim: 'Produkt ortopedik për mbështetje dhe korrigjim.'
    };
  }

  // First Aid
  if (/(gaze|gaza|bandage|fasho|plaster|cerotto|disinfect|antiseptic|wound|plage|ferite)/i.test(text)) {
    return {
      kategoria: 'Farmaci',
      nenkategoria: 'First Aid (Ndihma e Pare)',
      arsyetim: 'Produkt për kujdes të plagëve dhe ndihmë të parë.'
    };
  }

  // Mirëqenia seksuale
  if (/(preservat|condom|durex|lubric|kontracep|viagra|cialis|erecti)/i.test(text)) {
    return {
      kategoria: 'Farmaci',
      nenkategoria: 'Mirëqenia seksuale',
      arsyetim: 'Produkt për mirëqenien dhe shëndetin seksual.'
    };
  }

  // ========== HIGJENA (para OTC për të evituar konfliktet) ==========
  
  // Goja (pastë dhëmbësh, ujë goje, furçe dhëmbësh për të rritur) - PARA se të kontrollojmë OTC
  if (/(toothpaste|paste.*dhemb|tooth.*gel|tooth.*cream|dent.*paste|oral.*care|dh├½mb.*paste)/i.test(text) &&
      !/(infant.*toothbrush|furce.*femij.*bebe)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Goja',
      arsyetim: 'Pastë ose produkt për higjienën e dhëmbëve.'
    };
  }

  // Ujë goje, kollutore
  if (/(mouthwash|uje.*goje|collut|oral.*rinse|gargara)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Goja',
      arsyetim: 'Produkt për higjienën e gojës.'
    };
  }

  // Furçe dhëmbësh për të rritur
  if (/(toothbrush|furce.*dhemb|brush.*teeth)/i.test(text) && 
      !/(infant|bebe|baby|femij|child)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Goja',
      arsyetim: 'Furçë dhëmbësh për higjienën orale.'
    };
  }

  // OTC (tabletë, kapsulë, sirupe, etj që nuk janë vitaminë/suplement)
  if (/(tablet|pill|capsul|sirop|syrup|drop|pikatur|spray.*nasal|throat|fyti|kollë|cough|grip|flu|painkill|analges|ibuprofen|paracetamol|aspirin)/i.test(text)) {
    return {
      kategoria: 'Farmaci',
      nenkategoria: 'OTC (pa recete)',
      arsyetim: 'Produkt farmaceutik pa recetë për trajtimin e simptomave.'
    };
  }

  // ========== SUPLEMENTE ==========
  
  // Suplemente (vitaminë, minerale, omega, probiotik për të rritur)
  if (/(vitamin|suplement|mineral|omega|probiot|prebiot|magnes|calcium|zinc|ferro|iron|d3|b12|coenzym|lecithin|collagen|glucosamin|ginkgo|ginseng)/i.test(text) &&
      !/(bebe|baby|infant|femij|child)/i.test(text)) {
    return {
      kategoria: 'Suplemente',
      nenkategoria: '',
      arsyetim: 'Suplement ushqimor për të rritur (vitaminë, minerale, etj).'
    };
  }

  // ========== HIGJENA (Të tjera) ==========

  // Këmbët
  if (/(foot|kemb|feet|talc|podolog|corn|callus|nails.*toe|thonj.*kemb)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Këmbët',
      arsyetim: 'Produkt specifik për kujdesin e këmbëve.'
    };
  }

  // Krem/locion për duar (specifik për duar, jo fytyrë)
  if (/(hand.*cream|krem.*duar|hand.*lotion|locion.*duar|hand.*care|kujdes.*duar)/i.test(text) &&
      !/(face|fytyre|viso)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Trupi',
      arsyetim: 'Produkt për kujdesin e duarve dhe higjienën personale.'
    };
  }

  // Depilim dhe Intime
  if (/(depil|wax|razor|rroj|shav|intimate|intime|vaginal|feminine|wash.*intim|hygiene.*intim)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Depilim dhe Intime',
      arsyetim: 'Produkt për depilim ose higjienë intime.'
    };
  }

  // Deodorant, anti-transpirant → Higjena Trupi
  if (/(deodorant|antiperspirant|anti.*transpirant|deo|roll.*on|djers)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Trupi',
      arsyetim: 'Deodorant për higjienën e trupit.'
    };
  }

  // Xhel dushi, sapun trupi, locion trupi → Higjena Trupi
  if (/(gel.*douche|xhel.*dush|body.*wash|shower.*gel|soap|sapun|locion.*trup|body.*lotion|body.*cream|scrub.*body)/i.test(text) &&
      !/(face|fytyre|viso)/i.test(text)) {
    return {
      kategoria: 'Higjena',
      nenkategoria: 'Trupi',
      arsyetim: 'Produkt për higjienën dhe kujdesin e trupit.'
    };
  }

  // ========== DERMOKOZMETIKË ==========
  
  // Makeup
  if (/(makeup|make.*up|mascara|lipstick|foundation|concealer|eyeshadow|eyeliner|blush|powder|rimel|ngjyre.*buze|fond.*ten)/i.test(text)) {
    return {
      kategoria: 'Dermokozmetikë',
      nenkategoria: 'Makeup',
      arsyetim: 'Produkt kozmetik për makeup.'
    };
  }

  // Tanning (vetë-nxirës, bronzer, after sun)
  if (/(self.*tan|auto.*bronz|bronzing|nxir|tanning|after.*sun|apres.*soleil|pas.*diell)/i.test(text)) {
    return {
      kategoria: 'Dermokozmetikë',
      nenkategoria: 'Tanning',
      arsyetim: 'Produkt për nxirje ose kujdes pas diellit.'
    };
  }

  // SPF (mbrojtje diellore për të rritur)
  if (/(spf|sun.*protect|solar|sunscreen|suncream|mbrojtje.*diell|photo.*protect|uv)/i.test(text) &&
      !/(bebe|baby|infant|femij|child)/i.test(text)) {
    return {
      kategoria: 'Dermokozmetikë',
      nenkategoria: 'SPF',
      arsyetim: 'Mbrojtje diellore për lëkurën e të rriturve.'
    };
  }

  // Flokët (shampo, balsam, serum flokësh, mask për flokë, trajtim skalp)
  if (/(shampo|shampoo|conditioner|balsam|hair|flok|capell|scalp|skalp|mask.*hair|serum.*hair|locion.*hair|hair.*loss|renie.*flok)/i.test(text) &&
      !/(body|trup|shower)/i.test(text)) {
    return {
      kategoria: 'Dermokozmetikë',
      nenkategoria: 'Floket',
      arsyetim: 'Produkt për kujdesin dhe trajtimin e flokëve.'
    };
  }

  // Trupi (krem trupi, vaj trupi, locion trupi dermokozmetik - jo higjenë)
  if (/(body.*cream|krem.*trup|body.*oil|vaj.*trup|body.*butter|balm.*body|body.*milk|qumesht.*trup)/i.test(text) &&
      !/(face|fytyre|sun|spf|shower|gel.*dush)/i.test(text)) {
    return {
      kategoria: 'Dermokozmetikë',
      nenkategoria: 'Trupi',
      arsyetim: 'Kujdes dermokozmetik për lëkurën e trupit.'
    };
  }

  // Fytyre (serum, krem, mask, xhel, locion, tonik, demakijues, anti-age, acne, hidratues për fytyrë)
  if (/(serum|face.*cream|krem.*fytyr|mask|maske|gel.*face|xhel.*fytyr|locion.*fytyr|tonic|tonik|micellar|micelar|cleanser|pastrues|demakij|anti.*age|anti.*wrinkle|rrudh|acne|akne|spot|imperfection|hydra|hidrat|moistur|eye.*cream|krem.*sy|contour.*eye)/i.test(text)) {
    return {
      kategoria: 'Dermokozmetikë',
      nenkategoria: 'Fytyre',
      arsyetim: 'Kujdes dermokozmetik për lëkurën e fytyres.'
    };
  }

  // Balsam buzësh
  if (/(lip.*balm|balsam.*buze|stick.*buze|lip.*care)/i.test(text)) {
    return {
      kategoria: 'Dermokozmetikë',
      nenkategoria: 'Fytyre',
      arsyetim: 'Balsam për kujdesin e buzëve.'
    };
  }

  // ========== PRODUKTE SHTESË ==========
  
  // Sete (set, pack, trio, duo, kit, çantë, paketim promocional)
  if (/(set|kit|pack|trio|duo|coffret|canta|travel.*size|pack.*voyage|special.*offer|promo|gift)/i.test(text)) {
    return {
      kategoria: 'Produkte Shtesë',
      nenkategoria: 'Sete',
      arsyetim: 'Set ose paketim promocional me produkte të ndryshme.'
    };
  }

  // Vajra esencial
  if (/(essential.*oil|vaj.*esencial|aroma.*oil|vaj.*aroma|castor.*oil|vaj.*kastor)/i.test(text)) {
    return {
      kategoria: 'Produkte Shtesë',
      nenkategoria: 'Vajra Esencial',
      arsyetim: 'Vaj esencial për përdorim të ndryshëm.'
    };
  }

  // ========== FALLBACK ==========
  
  // Nëse nuk bie në asnjë kategori, vendose në Dermokozmetikë → Fytyre (si fallback i sigurt)
  return {
    kategoria: 'Dermokozmetikë',
    nenkategoria: 'Fytyre',
    arsyetim: 'Produkt dermokozmetik pa specifikë të qartë, vendosur në Fytyre si default.'
  };
}

// Process all products
const results = products.map(p => {
  const classification = classifyProduct(p.name, p.description);
  return {
    emri: p.name || '',
    pershkrimi: (p.description || '').substring(0, 200), // truncate for readability
    kategoria: classification.kategoria,
    nenkategoria: classification.nenkategoria,
    arsyetim: classification.arsyetim
  };
});

fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`✓ Klasifikova ${results.length} produkte me inteligjencë.`);
console.log(`✓ Rezultati u ruajt në: ${outPath}`);
