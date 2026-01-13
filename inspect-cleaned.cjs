const fs = require('fs');

const html = fs.readFileSync('farmaon-sample.html', 'utf8');
const cleaned = html.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');

const divs = cleaned.split('<div class="product-card');
const sample = divs[1].substring(0, 2000);

console.log('Sample after cleaning:');
console.log('='.repeat(80));
console.log(sample);

console.log('\n\n='.repeat(80));
console.log('Looking for h2:');
const h2Index = sample.indexOf('woocommerce-loop-product__title');
console.log(sample.substring(h2Index, h2Index + 200));
