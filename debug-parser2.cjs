const fs = require('fs');

const html = fs.readFileSync('farmaon-sample.html', 'utf8');

// Test me more flexible regex
const sampleProduct = html.substring(html.indexOf('<div class="product-card'), html.indexOf('<div class="product-card', html.indexOf('<div class="product-card') + 1));

console.log('Testing name extraction:');
console.log('='.repeat(80));

// Original regex
const nameMatch1 = sampleProduct.match(/<h2[^>]*class="woocommerce-loop-product__title">([^<]+)<\/h2>/);
console.log('Regex 1:', nameMatch1 ? nameMatch1[1] : 'NOT FOUND');

// With \s* for whitespace
const nameMatch2 = sampleProduct.match(/<h2[^>]*class="woocommerce-loop-product__title">\s*([^<]+)\s*<\/h2>/);
console.log('Regex 2:', nameMatch2 ? nameMatch2[1].trim() : 'NOT FOUND');

// With [\s\S] for any char including newlines  
const nameMatch3 = sampleProduct.match(/<h2[^>]*class="woocommerce-loop-product__title">([\s\S]*?)<\/h2>/);
console.log('Regex 3:', nameMatch3 ? nameMatch3[1].trim() : 'NOT FOUND');

console.log('\n\nTesting price extraction:');
console.log('='.repeat(80));

// Look for price pattern
const priceMatch1 = sampleProduct.match(/<bdi>([\d,]+\.?\d*)<span/g);
console.log('Regex 1:', priceMatch1);

const priceMatch2 = sampleProduct.match(/<bdi>\s*([\d,]+\.?\d*)\s*<span/g);
console.log('Regex 2:', priceMatch2);

const priceMatch3 = sampleProduct.match(/<span class="woocommerce-Price-amount amount"><bdi>([\d,]+\.?\d*)</g);
console.log('Regex 3:', priceMatch3);
