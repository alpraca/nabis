const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(__dirname, '..', 'products.json');
const outPath = path.resolve(__dirname, '..', 'classification.json');

// read raw buffer and attempt to decode intelligently (handles utf8, utf16le with nulls, BOMs, etc.)
const buf = fs.readFileSync(productsPath);
let raw = null;
function tryParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// try utf8 first
raw = buf.toString('utf8');
let products = tryParse(raw);
if (!products) {
  // try utf16le (file may have been written in UTF-16)
  raw = buf.toString('utf16le');
  // strip BOM if present and replace control chars with spaces
  raw = raw.replace(/^\uFEFF/, '');
  raw = raw.replace(/[\u0000-\u001F]/g, ' ');
  products = tryParse(raw);
}
if (!products) {
  // fallback: sanitize control characters in utf8-decoded text
  raw = buf.toString('utf8').replace(/^\uFEFF/, '');
  raw = raw.replace(/^[^\{\[]+/, '');
  raw = raw.replace(/[\u0000-\u001F]/g, ch => {
    const code = ch.charCodeAt(0).toString(16).padStart(2, '0');
    return `\\u00${code}`;
  });
  products = tryParse(raw);
}

if (!products) {
  console.error('Failed to parse products.json: tried utf8 and utf16le and a sanitized fallback.');
  process.exit(1);
}

function normalizeTop(cat) {
  if (!cat) return 'Dermokozmetikë';
  const c = cat.toString().toLowerCase();
  if (c.includes('dermokozmetik') || c.includes('dermokozmetik├½') || c.includes('dermo')) return 'Dermokozmetikë';
  if (c.includes('higjena')) return 'Higjena';
  if (c.includes('farmaci')) return 'Farmaci';
  if (c.includes('mama') || c.includes('beb') || c.includes('mama-dhe-bebat')) return 'Mama dhe Bebat';
  if (c.includes('produkte') || c.includes('produkte-shtese')) return 'Produkte Shtesë';
  if (c.includes('suple') || c.includes('suplement')) return 'Suplemente';
  // fallback heuristics
  if (c.includes('spf') || c.includes('mbrojt')) return 'Dermokozmetikë';
  if (c.includes('shamp') || c.includes('flok')) return 'Dermokozmetikë';
  if (c.includes('pelena') || c.includes('bebe') || c.includes('pampers')) return 'Mama dhe Bebat';
  if (c.includes('tablet') || c.includes('kapsul') || c.includes('suplement')) return 'Suplemente';
  return 'Dermokozmetikë';
}

function fixEncoding(s) {
  if (!s) return '';
  return s.replace(/[\u00C2\u00AE\u00A0\u0090\u00C3\u00A9\u00C3\u00AA\u00C3\u00B1\u0093]/g, '').replace(/\u00EF\u00BF\u00BD/g, '').trim();
}

function normalizeSub(sub) {
  if (!sub) return 'Të tjera';
  // fix common mojibake
  let s = sub.toString();
  s = s.replace(/\u00C2/g, '').replace(/\u00AE/g, '');
  s = s.replace(/\^/g, '');
  // common replacements in this dataset
  s = s.replace(/Fytyre|Fytyre/g, 'Fytyre');
  s = s.replace(/Flok\u03b9t|Flok├½t|Flok|Flok/g, 'Flokët');
  s = s.replace(/SPF|Tanning|Trupi|Goja|K\u00EBlm\u00EBt|K├½mb├½t/g, (m) => {
    if (/SPF/i.test(m)) return 'SPF';
    if (/Tanning/i.test(m)) return 'Tanning';
    if (/Trupi/i.test(m)) return 'Trupi';
    if (/Goja/i.test(m)) return 'Goja';
    return 'Këmbët';
  });
  s = s.replace(/Depilim dhe Intime/g, 'Depilim dhe Intime');
  s = s.replace(/Sete|Sete/g, 'Sete');
  s = s.replace(/Makeup/g, 'Makeup');
  s = s.replace(/OTC \(pa recete\)/g, 'OTC (pa recete)');
  s = s.replace(/[\u0000-\u001F]/g, '').trim();
  return s || 'Të tjera';
}

function detectTypeText(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('serum')) return 'serum';
  if (t.includes('krem') || t.includes('cr')) return 'krem';
  if (t.includes('shamp') || t.includes('shampoo') || t.includes('sapun') || t.includes('sapun') || t.includes('gel')) return 'shampo/xhel';
  if (t.includes('mask') || t.includes('maskë') || t.includes('masque')) return 'maskë';
  if (t.includes('spray') || t.includes('spraj') || t.includes('spr')) return 'spraj';
  if (t.includes('pelena') || t.includes('pampers')) return 'pelena';
  if (t.includes('tablet') || t.includes('tabletë') || t.includes('tableta') || t.includes('kapsul') ) return 'suplement/tabletë';
  if (t.includes('set') || t.includes('pack') || t.includes('paket')) return 'set';
  if (t.includes('oil') || t.includes('vaj') ) return 'vaj';
  if (t.includes('parfum') || t.includes('eau') || t.includes('parfum') ) return 'parfum';
  if (t.includes('deodorant') || t.includes('anti-transpirant') || t.includes('roll')) return 'deodorant';
  return null;
}

const out = products.map(p => {
  const text = `${p.name || ''} ${p.description || ''}`;
  const top = normalizeTop(p.category);
  let sub = normalizeSub(p.subcategory);
  // if sub is generic or missing, try to infer
  if (!sub || sub === 'Të tjera') {
    const type = detectTypeText(text);
    if (type === 'serum' || type === 'krem' || type === 'maskë' || type === 'spraj' || type === 'shampo/xhel') {
      if (type === 'shampo/xhel') sub = 'Flokët';
      else if (type === 'spraj') sub = 'SPF';
      else sub = 'Fytyre';
    } else if (type && type.includes('suplement')) {
      sub = 'Suplemente';
    } else if (String(p.category || '').toLowerCase().includes('mama')) {
      sub = 'Ushqim';
    } else {
      // fallback: keep original if present else guess Fytyre
      sub = (p.subcategory && String(p.subcategory).trim()) ? normalizeSub(p.subcategory) : 'Fytyre';
    }
  }

  // Build rationale in Albanian
  const typeWord = detectTypeText(text) || 'produkt';
  let arsyetim = '';
  if (p.subcategory && String(p.subcategory).trim()) {
    arsyetim = `Ruajtën nënkategorinë ekzistuese "${normalizeSub(p.subcategory)}" bazuar në emrin/përshkrimin e produktit.`;
  } else {
    arsyetim = `Klasifikova si "${sub}" sepse emri/përshkrimi tregon se është një ${typeWord}.`;
  }

  return {
    emri: p.name || '',
    kategoria: top,
    nenkategoria: sub,
    arsyetim: arsyetim
  };
});

fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote', out.length, 'classifications to', outPath);
