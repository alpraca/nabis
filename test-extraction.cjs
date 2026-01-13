const fs = require('fs');

function extractProductsFromHTML(html) {
  const products = [];
  
  // Remove line breaks për më mirë parsing
  const cleaned = html.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
  
  // Gjej të gjitha div me class product-card
  const divs = cleaned.split('<div class="product-card');
  
  console.log(`Found ${divs.length - 1} product divs\n`);
  
  for (let i = 1; i < Math.min(6, divs.length); i++) {
    const section = divs[i];
    
    console.log(`Product ${i}:`);
    
    // Ekstrakto URL
    const urlMatch = section.match(/href="(https:\/\/farmaon\.al\/product\/[^"]+)"/);
    if (!urlMatch) {
      console.log('  ❌ No URL\n');
      continue;
    }
    const url = urlMatch[1];
    console.log(`  URL: ${url}`);
    
    // Ekstrakto emrin - titulli është në <h2> me class specifike
    const nameMatch = section.match(/<h2\s+class="woocommerce-loop-product__title">([^<]+)<\/h2>/);
    if (!nameMatch) {
      console.log('  ❌ No name\n');
      continue;
    }
    const name = nameMatch[1].trim();
    console.log(`  Name: ${name}`);
    
    // Ekstrakto çmimin - merr të gjitha çmimet dhe zgjidh të fundit (çmimi pas zbritjes)
    const allPrices = section.match(/<bdi>([\d,]+\.?\d*)<span class="woocommerce-Price-currencySymbol">/g);
    if (!allPrices || allPrices.length === 0) {
      console.log('  ❌ No price\n');
      continue;
    }
    
    const lastPriceTag = allPrices[allPrices.length - 1];
    const priceValue = lastPriceTag.match(/([\d,]+\.?\d*)/)[1];
    const price = parseFloat(priceValue.replace(/,/g, ''));
    console.log(`  Price: ${price}L\n`);
    
    products.push({ name, price, url });
  }
  
  return products;
}

const html = fs.readFileSync('farmaon-sample.html', 'utf8');
const products = extractProductsFromHTML(html);

console.log(`\n✅ Extracted ${products.length} products total`);
