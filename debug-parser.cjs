const fs = require('fs');

const html = fs.readFileSync('farmaon-sample.html', 'utf8');

// Gjej një product-card të plotë
const startIndex = html.indexOf('<div class="product-card');
const endIndex = html.indexOf('<div class="product-card', startIndex + 1);

const sampleProduct = html.substring(startIndex, endIndex);

console.log('SAMPLE PRODUCT HTML:');
console.log('='.repeat(80));
console.log(sampleProduct.substring(0, 1500));
console.log('\n...\n');

// Test regex
console.log('\n\nTESTING REGEX:');
console.log('='.repeat(80));

const urlMatch = sampleProduct.match(/href="(https:\/\/farmaon\.al\/product\/[^"]+)"/);
console.log('URL Match:', urlMatch ? urlMatch[1] : 'NOT FOUND');

const nameMatch = sampleProduct.match(/<h2[^>]*class="woocommerce-loop-product__title">([^<]+)<\/h2>/);
console.log('Name Match:', nameMatch ? nameMatch[1] : 'NOT FOUND');

const priceMatches = sampleProduct.match(/<bdi>([\d,]+\.?\d*)<span/g);
console.log('Price Matches:', priceMatches);
