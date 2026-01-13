const fs = require('fs');

function extractProductsFromHTML(html) {
  const products = [];
  
  // Split by product card divs
  const parts = html.split('<div class="product-card');
  
  console.log(`Found ${parts.length - 1} product sections\n`);
  
  // Skip first part (before first product)
  for (let i = 1; i < parts.length; i++) {
    const section = parts[i];
    
    console.log(`\n--- Section ${i} ---`);
    console.log(`First 200 chars: ${section.substring(0, 200)}`);
    
    // Find URL
    let url = null;
    const hrefIndex = section.indexOf('href="https://farmaon.al/product/');
    console.log(`URL search: hrefIndex = ${hrefIndex}`);
    if (hrefIndex !== -1) {
      const urlStart = hrefIndex + 6; // Skip 'href="'
      const urlEnd = section.indexOf('"', urlStart);
      url = section.substring(urlStart, urlEnd);
      console.log(`Found URL: ${url}`);
    }
    
    // Find name using indexOf
    let name = null;
    const nameMarker = 'class="woocommerce-loop-product__title">';
    const nameIndex = section.indexOf(nameMarker);
    console.log(`Name search: nameIndex = ${nameIndex}`);
    if (nameIndex !== -1) {
      const nameStart = nameIndex + nameMarker.length;
      const nameEnd = section.indexOf('</h2>', nameStart);
      console.log(`Name bounds: start=${nameStart}, end=${nameEnd}`);
      if (nameEnd !== -1) {
        name = section.substring(nameStart, nameEnd).trim();
        // Remove extra whitespace and line breaks
        name = name.replace(/\s+/g, ' ');
        console.log(`Found name: ${name}`);
      }
    }
    
    if (i === 2) break; // Only test first product
    
    // Find price using indexOf
    let price = null;
    const priceMarker = '<bdi>';
    const priceIndex = section.indexOf(priceMarker);
    if (priceIndex !== -1) {
      const priceStart = priceIndex + priceMarker.length;
      const priceEnd = section.indexOf('<span class="woocommerce-Price-currencySymbol">', priceStart);
      if (priceEnd !== -1) {
        const priceText = section.substring(priceStart, priceEnd).trim();
        price = parseFloat(priceText.replace(/,/g, ''));
      }
    }
    
    if (url && name && price) {
      products.push({ url, name, price });
      console.log(`Product ${products.length}:`);
      console.log(`  Name: ${name}`);
      console.log(`  Price: ${price}L`);
      console.log(`  URL: ${url}\n`);
    }
  }
  
  return products;
}

// Test with the saved HTML
const html = fs.readFileSync('farmaon-sample.html', 'utf8');
const products = extractProductsFromHTML(html);

console.log(`\n✅ Successfully extracted ${products.length} products!`);
