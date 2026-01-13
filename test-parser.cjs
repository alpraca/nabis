const fs = require('fs');

// Test extraction function
function extractProductsFromHTML(html) {
  const products = [];
  
  // Gjej të gjitha div me class product-card
  const divs = html.split('<div class="product-card');
  
  console.log(`Found ${divs.length - 1} product sections\n`);
  
  for (let i = 1; i < Math.min(divs.length, 6); i++) { // Test first 5
    const section = divs[i];
    
    // Ekstrakto URL
    const urlMatch = section.match(/href="(https:\/\/farmaon\.al\/product\/[^"]+)"/);
    if (!urlMatch) {
      console.log(`Product ${i}: No URL found`);
      continue;
    }
    const url = urlMatch[1];
    
    // Ekstrakto emrin
    const nameMatch = section.match(/<h2[^>]*class="woocommerce-loop-product__title">([^<]+)<\/h2>/);
    if (!nameMatch) {
      console.log(`Product ${i}: No name found`);
      continue;
    }
    const name = nameMatch[1].trim();
    
    // Ekstrakto çmimin
    const priceMatches = section.match(/<bdi>([\d,]+\.?\d*)<span/g);
    if (!priceMatches || priceMatches.length === 0) {
      console.log(`Product ${i}: No price found`);
      continue;
    }
    
    const lastPrice = priceMatches[priceMatches.length - 1];
    const priceValue = lastPrice.match(/([\d,]+\.?\d*)/)[1];
    const price = parseFloat(priceValue.replace(/,/g, ''));
    
    console.log(`✅ Product ${i}: ${name} - ${price}L`);
    console.log(`   URL: ${url}\n`);
    
    products.push({ name, price, url });
  }
  
  return products;
}

// Load and test
const html = fs.readFileSync('farmaon-sample.html', 'utf8');
const products = extractProductsFromHTML(html);

console.log(`\n📊 Total: ${products.length} products extracted`);
