const XLSX = require('xlsx');

const wb = XLSX.readFile('farmaon_products_AI_classified.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('========== AI SHEMBUJ (10 produkte) ==========\n');

data.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.Name}`);
  console.log(`   Përshkrimi: ${(p.Description || '').substring(0, 80)}...`);
  console.log(`   AI vendosi: ${p.category_path}`);
  console.log(`   Confidence: ${p.confidence}`);
  console.log(`   Arsyetimi: ${p.arsyetim_shkurt}\n`);
});

// Shembuj specifik
console.log('\n========== SHEMBUJ TË VEÇANTË ==========\n');

// Baby products
const babyProduct = data.find(p => p.Name.includes('Baby Spray SPF'));
if (babyProduct) {
  console.log('PRODUKT BABY (AI kuptoi "për fëmijë që nga lindja"):');
  console.log(`  Emri: ${babyProduct.Name}`);
  console.log(`  Përshkrimi: ${babyProduct.Description}`);
  console.log(`  AI vendosi: ${babyProduct.category_path}`);
  console.log(`  Confidence: ${babyProduct.confidence}\n`);
}

// Set promocional
const setProduct = data.find(p => p.Name.includes('Hand Cream Trio'));
if (setProduct) {
  console.log('SET PROMOCIONAL (AI kuptoi nga "set promocional"):');
  console.log(`  Emri: ${setProduct.Name}`);
  console.log(`  Përshkrimi: ${setProduct.Description}`);
  console.log(`  AI vendosi: ${setProduct.category_path}`);
  console.log(`  Confidence: ${setProduct.confidence}\n`);
}

// Produkt për akne
const acneProduct = data.find(p => p.Name.includes('Keracnyl'));
if (acneProduct) {
  console.log('PRODUKT PËR AKNE (AI kuptoi "trajton aknet"):');
  console.log(`  Emri: ${acneProduct.Name}`);
  console.log(`  Përshkrimi: ${acneProduct.Description}`);
  console.log(`  AI vendosi: ${acneProduct.category_path}`);
  console.log(`  Confidence: ${acneProduct.confidence}\n`);
}

// Products me confidence të ulët
console.log('\n========== PRODUKTE ME CONFIDENCE TË ULËT ==========\n');
const lowConf = data.filter(p => p.confidence < 0.5).slice(0, 5);
lowConf.forEach(p => {
  console.log(`• ${p.Name}`);
  console.log(`  Përshkrimi: ${(p.Description || 'N/A').substring(0, 60)}...`);
  console.log(`  Confidence: ${p.confidence}\n`);
});
