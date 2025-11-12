const fs = require('fs');
const data = JSON.parse(fs.readFileSync('classification_intelligent.json', 'utf8'));

const testCases = [
  'shampo', 'pampers', 'vitamin', 'spf', 'deodorant', 'toothpaste', 
  'serum', 'krem', 'tablet', 'termometer'
];

console.log('========== SHEMBUJ KLASIFIKIMI ==========\n');

testCases.forEach(keyword => {
  const found = data.find(p => p.emri.toLowerCase().includes(keyword));
  if (found) {
    console.log(`PRODUKT: ${found.emri}`);
    console.log(`KATEGORIA: ${found.kategoria} → ${found.nenkategoria}`);
    console.log(`ARSYETIM: ${found.arsyetim}\n`);
  }
});

// Statistika
const stats = {};
data.forEach(item => {
  const key = `${item.kategoria} → ${item.nenkategoria}`;
  stats[key] = (stats[key] || 0) + 1;
});

console.log('========== STATISTIKA ==========\n');
Object.entries(stats).sort((a,b) => b[1] - a[1]).forEach(([key, count]) => {
  console.log(`${count.toString().padStart(4)} produkte: ${key}`);
});
