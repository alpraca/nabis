const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.resolve(__dirname, 'farmaon_products_classified_v2.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('========== VERIFIKIM PRIORITETI V2 ==========\n');

// Test specific keywords
const testCases = [
  { keyword: 'baby', desc: 'Produkte për bebe' },
  { keyword: 'pampers', desc: 'Pelena' },
  { keyword: 'vitamin.*baby', desc: 'Vitaminë për bebe', regex: true },
  { keyword: 'condom', desc: 'Prezervativë' },
  { keyword: 'toothpaste', desc: 'Pastë dhëmbësh' },
  { keyword: 'deodorant', desc: 'Deodorant' },
  { keyword: 'spf.*baby', desc: 'SPF për bebe', regex: true },
  { keyword: 'thermometer', desc: 'Termometer' },
  { keyword: 'shampoo', desc: 'Shampo' }
];

testCases.forEach(test => {
  let found;
  if (test.regex) {
    const regex = new RegExp(test.keyword, 'i');
    found = data.find(p => p.Name && regex.test(p.Name));
  } else {
    found = data.find(p => p.Name && p.Name.toLowerCase().includes(test.keyword.toLowerCase()));
  }
  
  if (found) {
    console.log(`${test.desc.toUpperCase()}:`);
    console.log(`  Produkt: ${found.Name}`);
    console.log(`  Kategoria: ${found.category_path}`);
    console.log(`  Confidence: ${found.confidence}\n`);
  }
});

// Show baby hygiene products
console.log('========== PRODUKTE BABY HYGIENE (5 SHEMBUJ) ==========\n');
const babyHygiene = data.filter(p => p.category_path === 'Mama dhe Bebat > Kujdesi ndaj Bebit > Higjena').slice(0, 5);
babyHygiene.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.Name}`);
  console.log(`   Arsyetim: ${p.arsyetim_shkurt}\n`);
});

// Show Mirëqenia seksuale products
console.log('========== MIRËQENIA SEKSUALE (DISA SHEMBUJ) ==========\n');
const sexual = data.filter(p => p.category_path === 'Farmaci > Mirëqenia seksuale').slice(0, 8);
sexual.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.Name} (confidence: ${p.confidence})`);
});

// Check for potential misclassifications
console.log('\n========== PRODUKTE ME CONFIDENCE TË ULËT (<0.75) ==========\n');
const lowConf = data.filter(p => p.confidence < 0.75).slice(0, 10);
lowConf.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.Name}`);
  console.log(`   Kategoria: ${p.category_path} (${p.confidence})`);
  console.log(`   Arsyetim: ${p.arsyetim_shkurt}\n`);
});
