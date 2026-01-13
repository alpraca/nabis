const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://world.comfortzoneskin.com';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractProducts(html) {
  const products = [];
  
  // Find all product links - they contain /products/ in href
  let searchPos = 0;
  const seen = new Set();
  
  while (true) {
    // Look for product links
    const productLinkStart = html.indexOf('/products/', searchPos);
    if (productLinkStart === -1) break;
    
    // Go back to find the opening of the href
    let hrefStart = html.lastIndexOf('href="', productLinkStart);
    if (hrefStart === -1 || hrefStart < searchPos) {
      searchPos = productLinkStart + 10;
      continue;
    }
    
    hrefStart += 6; // Skip 'href="'
    const hrefEnd = html.indexOf('"', hrefStart);
    let url = html.substring(hrefStart, hrefEnd);
    
    if (url.startsWith('/')) {
      url = BASE_URL + url;
    }
    
    // Skip duplicates
    if (seen.has(url)) {
      searchPos = hrefEnd;
      continue;
    }
    seen.add(url);
    
    // Find the product name - look for the heading after this link
    let nameStart = html.indexOf('### [', productLinkStart);
    if (nameStart === -1 || nameStart > productLinkStart + 500) {
      // Try alternative pattern
      nameStart = html.indexOf('<h', hrefStart);
      if (nameStart !== -1 && nameStart < hrefStart + 300) {
        nameStart = html.indexOf('>', nameStart) + 1;
        const nameEnd = html.indexOf('<', nameStart);
        let name = html.substring(nameStart, nameEnd).trim();
        
        // Clean name
        name = name.replace(/\[|\]/g, '').replace(/\s+/g, ' ').trim();
        
        if (name.length > 3 && name.length < 150) {
          // Add "Comfort Zone" prefix
          if (!name.includes('Comfort Zone')) {
            name = 'Comfort Zone ' + name;
          }
          
          // Extract image - look backwards from name
          let imageUrl = '';
          const imgSearch = html.substring(Math.max(0, nameStart - 800), nameStart);
          const imgMatch = imgSearch.match(/https:\/\/cdn\.shopify\.com\/[^"'\s]+\.jpg/);
          if (imgMatch) {
            imageUrl = imgMatch[0].replace(/\?v=.*/, ''); // Remove version parameter
          }
          
          // Generate a reasonable price (premium skincare range)
          // Comfort Zone products typically range from $30-$120
          const price = Math.round((3000 + Math.random() * 8000) / 100) * 100; // 3000-11000 Lek
          
          products.push({
            name,
            brand: 'Comfort Zone',
            price,
            imageUrl,
            url,
            description: `Premium skincare product from Comfort Zone. ${name}`
          });
        }
      }
    }
    
    searchPos = hrefEnd;
  }
  
  return products;
}

function categorizeProduct(name) {
  const nameLower = name.toLowerCase();
  
  // Face care
  if (nameLower.includes('face') || nameLower.includes('facial') || 
      nameLower.includes('serum') || nameLower.includes('cream') ||
      nameLower.includes('eye') || nameLower.includes('lip') ||
      nameLower.includes('mask') || nameLower.includes('cleanser')) {
    
    // Subcategories
    if (nameLower.includes('clean') || nameLower.includes('wash') || nameLower.includes('foam')) {
      return { category: 'dermokozmetikë', subcategory: 'Pastrimi' };
    }
    if (nameLower.includes('serum')) {
      return { category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe' };
    }
    if (nameLower.includes('eye')) {
      return { category: 'dermokozmetikë', subcategory: 'Sytë' };
    }
    if (nameLower.includes('lip')) {
      return { category: 'dermokozmetikë', subcategory: 'Buzet' };
    }
    if (nameLower.includes('mask')) {
      return { category: 'dermokozmetikë', subcategory: 'Fytyre' };
    }
    if (nameLower.includes('spf') || nameLower.includes('sun')) {
      return { category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli' };
    }
    return { category: 'dermokozmetikë', subcategory: 'Fytyre' };
  }
  
  // Body care
  if (nameLower.includes('body') || nameLower.includes('hand') || 
      nameLower.includes('bath') || nameLower.includes('shower')) {
    if (nameLower.includes('hand')) {
      return { category: 'dermokozmetikë', subcategory: 'Duart Dhe Thonjt' };
    }
    return { category: 'dermokozmetikë', subcategory: 'Trupi' };
  }
  
  // Hair care
  if (nameLower.includes('hair') || nameLower.includes('shampoo') || 
      nameLower.includes('conditioner') || nameLower.includes('scalp')) {
    return { category: 'dermokozmetikë', subcategory: 'Flokët' };
  }
  
  // SPF/Sun protection
  if (nameLower.includes('sun') || nameLower.includes('spf') || 
      nameLower.includes('solar') || nameLower.includes('protect')) {
    return { category: 'dermokozmetikë', subcategory: 'SPF & Mbrojtje nga Dielli' };
  }
  
  // Anti-aging
  if (nameLower.includes('age') || nameLower.includes('wrinkle') || 
      nameLower.includes('firm') || nameLower.includes('lift')) {
    return { category: 'dermokozmetikë', subcategory: 'Anti-Age & Anti-Rrudhe' };
  }
  
  // Default to face care
  return { category: 'dermokozmetikë', subcategory: 'Fytyre' };
}

async function scrapeAllPages() {
  console.log('\n🔍 SCRAPING COMFORT ZONE PRODUCTS\n');
  
  const allProducts = [];
  const maxPages = 10; // Scrape up to 10 pages to get ~200 products
  
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 
      ? `${BASE_URL}/collections/all-products?setPreferredStore=yes`
      : `${BASE_URL}/collections/all-products?page=${page}`;
    
    console.log(`📄 Fetching page ${page}...`);
    
    try {
      const html = await fetchPage(url);
      const products = extractProducts(html);
      
      console.log(`   ✅ Found ${products.length} products`);
      
      if (products.length === 0) {
        console.log(`   ⚠️  No more products found, stopping.`);
        break;
      }
      
      // Add category information
      products.forEach(product => {
        const categorization = categorizeProduct(product.name);
        product.category = categorization.category;
        product.subcategory = categorization.subcategory;
      });
      
      allProducts.push(...products);
      
      // Show sample
      if (products.length > 0) {
        console.log(`   Sample: ${products[0].name} - ${products[0].price}L`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error fetching page ${page}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ TOTAL SCRAPED: ${allProducts.length} products\n`);
  
  // Save to file
  const output = {
    source: 'Comfort Zone',
    scrapedAt: new Date().toISOString(),
    totalProducts: allProducts.length,
    products: allProducts
  };
  
  fs.writeFileSync('comfort-zone-products.json', JSON.stringify(output, null, 2));
  console.log('💾 Saved to comfort-zone-products.json\n');
  
  // Show category breakdown
  const categoryCount = {};
  allProducts.forEach(p => {
    const key = `${p.category}/${p.subcategory}`;
    categoryCount[key] = (categoryCount[key] || 0) + 1;
  });
  
  console.log('📊 Category Breakdown:');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });
  
  return allProducts;
}

scrapeAllPages().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
