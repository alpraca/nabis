const fs = require('fs');

function extractProductsFromHTML(html) {
  const products = [];
  
  // Find all product cards using a more robust method
  let searchStart = 0;
  
  while (true) {
    // Find next product URL
    const urlMarker = 'href="https://farmaon.al/product/';
    const urlIndex = html.indexOf(urlMarker, searchStart);
    if (urlIndex === -1) break;
    
    const urlStart = urlIndex + 6; // Skip 'href="'
    const urlEnd = html.indexOf('"', urlStart);
    const url = html.substring(urlStart, urlEnd);
    
    // Find the corresponding name (should be after this URL)
    const nameMarker = 'class="woocommerce-loop-product__title">';
    const nameSearchStart = urlEnd;
    const nameIndex = html.indexOf(nameMarker, nameSearchStart);
    
    if (nameIndex === -1 || nameIndex > nameSearchStart + 2000) {
      // Name not found or too far away, skip this URL
      searchStart = urlEnd;
      continue;
    }
    
    const nameStart = nameIndex + nameMarker.length;
    const nameEnd = html.indexOf('</h2>', nameStart);
    if (nameEnd === -1) {
      searchStart = urlEnd;
      continue;
    }
    
    let name = html.substring(nameStart, nameEnd).trim();
    name = name.replace(/\s+/g, ' '); // Normalize whitespace
    
    // Find price (should be after name)
    const priceMarker = '<bdi>';
    const priceSearchStart = nameEnd;
    const priceIndex = html.indexOf(priceMarker, priceSearchStart);
    
    let price = null;
    if (priceIndex !== -1 && priceIndex < priceSearchStart + 1000) {
      const priceStart = priceIndex + priceMarker.length;
      const priceEnd = html.indexOf('<span class="woocommerce-Price-currencySymbol">', priceStart);
      if (priceEnd !== -1) {
        const priceText = html.substring(priceStart, priceEnd).trim();
        price = parseFloat(priceText.replace(/,/g, ''));
      }
    }
    
    products.push({ url, name, price });
    console.log(`Product ${products.length}:`);
    console.log(`  Name: ${name}`);
    console.log(`  Price: ${price ? price + 'L' : 'N/A'}`);
    console.log(`  URL: ${url}\n`);
    
    // Move search pointer past this product
    searchStart = nameEnd;
  }
  
  return products;
}

// Test with the saved HTML
const html = fs.readFileSync('farmaon-sample.html', 'utf8');
const products = extractProductsFromHTML(html);

console.log(`\n✅ Successfully extracted ${products.length} products!`);
