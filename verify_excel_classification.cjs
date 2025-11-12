const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.resolve(__dirname, 'farmaon_products_classified.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('========== SHEMBUJ KLASIFIKIMI (10 PRODUKTE) ==========\n');

// Show first 10 products with classifications
data.slice(0, 10).forEach((row, idx) => {
  console.log(`${idx + 1}. ${row.Name}`);
  console.log(`   Kategoria: ${row.category_path}`);
  console.log(`   Arsyetim: ${row.arsyetim_shkurt}`);
  console.log(`   Besueshmëri: ${row.confidence}\n`);
});

// Show some specific examples
console.log('========== SHEMBUJ SPECIFIK ==========\n');

const keywords = ['Pampers', 'toothpaste', 'vitamin', 'SPF', 'shampoo', 'thermometer', 'condom', 'serum'];

keywords.forEach(kw => {
  const found = data.find(p => p.Name && p.Name.toLowerCase().includes(kw.toLowerCase()));
  if (found) {
    console.log(`${kw.toUpperCase()}:`);
    console.log(`  Produkt: ${found.Name}`);
    console.log(`  Kategoria: ${found.category_path}`);
    console.log(`  Besueshmëri: ${found.confidence}\n`);
  }
});

// Confidence distribution
console.log('========== SHPËRNDARJA E BESUESHMËRISË ==========\n');
const confBuckets = {
  'Shumë e lartë (≥0.95)': 0,
  'E lartë (0.85-0.94)': 0,
  'Mesatare (0.75-0.84)': 0,
  'E ulët (<0.75)': 0
};

data.forEach(row => {
  const conf = row.confidence;
  if (conf >= 0.95) confBuckets['Shumë e lartë (≥0.95)']++;
  else if (conf >= 0.85) confBuckets['E lartë (0.85-0.94)']++;
  else if (conf >= 0.75) confBuckets['Mesatare (0.75-0.84)']++;
  else confBuckets['E ulët (<0.75)']++;
});

Object.entries(confBuckets).forEach(([bucket, count]) => {
  const percentage = ((count / data.length) * 100).toFixed(1);
  console.log(`${bucket}: ${count} produkte (${percentage}%)`);
});
