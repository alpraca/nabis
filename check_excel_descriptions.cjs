const XLSX = require('xlsx');

const wb = XLSX.readFile('farmaon_products.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('Total produkte:', data.length);
console.log('\n========== SHEMBUJ PRODUKTE ==========\n');

data.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.Name}`);
  console.log(`   Përshkrimi: ${p.Description || 'N/A'}`);
  console.log('');
});
