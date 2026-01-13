const fs = require('fs');

const html = fs.readFileSync('farmaon-sample.html', 'utf8');
const cleaned = html.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');

// Gjej një h2 tag
const h2Index = cleaned.indexOf('<h2');
const sample = cleaned.substring(h2Index - 200, h2Index + 300);

console.log('H2 Context:');
console.log('='.repeat(80));
console.log(sample);

console.log('\n\n' + '='.repeat(80));
console.log('Testing regex on this:');

const nameMatch = sample.match(/<h2\s+class="woocommerce-loop-product__title">([^<]+)<\/h2>/);
console.log('Match result:', nameMatch);

if (nameMatch) {
  console.log('Captured name:', nameMatch[1]);
} else {
  console.log('NO MATCH!');
  
  // Try simpler
  const simpleMatch = sample.match(/<h2[^>]*>([^<]+)<\/h2>/);
  console.log('Simple match:', simpleMatch ? simpleMatch[1] : 'STILL NO MATCH');
}
