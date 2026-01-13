const https = require('https');
const fs = require('fs');

console.log('\n🌐 DUKE SHKARKUAR PRODUKTE NGA FARMAON.AL\n');
console.log('═'.repeat(80));

// Kategorit që do të scrape-ojmë
const categories = [
  { name: 'Dermokozmetikë', url: 'https://farmaon.al/product-category/dermokozmetike/' },
  { name: 'Suplemente', url: 'https://farmaon.al/product-category/suplemente/' },
  { name: 'Farmaci', url: 'https://farmaon.al/product-category/farmaci/' },
  { name: 'Higjienë', url: 'https://farmaon.al/product-category/higjiene/' },
  { name: 'Bebe dhe nëna', url: 'https://farmaon.al/product-category/bebe-dhe-nena/' }
];

const allProducts = [];
let currentCategory = 0;
let currentPage = 1;
const maxPagesPerCategory = 65; // Maksimumi i faqeve për kategori

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractProducts(html, categoryName) {
  const products = [];
  
  // Regex për të gjetur produkte në HTML
  // Kërkon strukturën: product-name, price, dhe URL
  const productRegex = /<li[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*class="[^"]*product-title[^"]*"[^>]*>(.*?)<\/h2>[\s\S]*?<span[^>]*class="[^"]*price[^"]*"[^>]*>(.*?)<\/span>/gi;
  
  let match;
  while ((match = productRegex.exec(html)) !== null) {
    const url = match[1];
    const name = match[2].replace(/<[^>]*>/g, '').trim();
    const priceText = match[3].replace(/<[^>]*>/g, '').trim();
    
    // Parse çmimin
    const priceMatch = priceText.match(/[\d,]+\.?\d*L/);
    const price = priceMatch ? parseFloat(priceMatch[0].replace(/[^\d.]/g, '')) : 0;
    
    // Ekstrakto brand nga emri (zakonisht është fjala e parë)
    const brandMatch = name.match(/^([A-Z][A-Za-z\s&.-]+?)\s/);
    const brand = brandMatch ? brandMatch[1].trim() : 'Unknown';
    
    products.push({
      name: name,
      brand: brand,
      category: categoryName,
      price: price,
      url: url,
      stock_quantity: 100, // Default stock
      image_url: '' // Do të shkarkojmë më vonë
    });
  }
  
  return products;
}

async function scrapePage(category, page) {
  const url = page === 1 ? category.url : `${category.url}page/${page}/`;
  
  try {
    console.log(`\n📄 ${category.name} - Faqja ${page}`);
    const html = await fetchPage(url);
    
    const products = extractProducts(html, category.name);
    
    if (products.length === 0) {
      console.log('   ⚠️  Nuk u gjetën produkte (fund i listës)');
      return false; // Nuk ka më produkte
    }
    
    console.log(`   ✅ U gjetën ${products.length} produkte`);
    allProducts.push(...products);
    
    // Check nëse ka faqe të tjera
    const hasNextPage = html.includes('class="next page-numbers"') || html.includes(`page/${page + 1}/`);
    
    return hasNextPage && page < maxPagesPerCategory;
  } catch (error) {
    console.error(`   ❌ Gabim: ${error.message}`);
    return false;
  }
}

async function scrapeCategory(category) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📦 KATEGORIA: ${category.name.toUpperCase()}`);
  console.log('═'.repeat(80));
  
  let page = 1;
  let hasMore = true;
  
  while (hasMore && page <= maxPagesPerCategory) {
    hasMore = await scrapePage(category, page);
    page++;
    
    if (hasMore) {
      await delay(1000); // Prit 1 sekondë mes kërkesave
    }
  }
  
  console.log(`\n   📊 Total produkte nga ${category.name}: ${allProducts.filter(p => p.category === category.name).length}`);
}

async function main() {
  for (const category of categories) {
    await scrapeCategory(category);
    await delay(2000); // Prit 2 sekonda mes kategorive
  }
  
  console.log(`\n\n${'═'.repeat(80)}`);
  console.log('📊 PËRMBLEDHJE FINALE');
  console.log('═'.repeat(80));
  
  // Grupoj produktet sipas kategorisë
  const summary = {};
  allProducts.forEach(p => {
    summary[p.category] = (summary[p.category] || 0) + 1;
  });
  
  console.log('\nProdukte sipas kategorisë:');
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} produkte`);
  });
  
  console.log(`\n📦 TOTAL PRODUKTE: ${allProducts.length}`);
  
  // Ruaj në JSON
  const filename = `farmaon-products-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(allProducts, null, 2), 'utf8');
  console.log(`\n✅ Produktet u ruajtën në: ${filename}`);
  
  // Krijoni një file të thjeshtë për preview
  const csvFilename = `farmaon-products-${Date.now()}.csv`;
  const csvContent = 'Brand,Name,Category,Price,URL\n' + 
    allProducts.map(p => `"${p.brand}","${p.name}","${p.category}",${p.price},"${p.url}"`).join('\n');
  fs.writeFileSync(csvFilename, csvContent, 'utf8');
  console.log(`✅ CSV u ruajt në: ${csvFilename}\n`);
  
  console.log('\n💡 HAPI TJETËR:');
  console.log('   1. Hapni JSON file-in dhe verifikoni produktet');
  console.log('   2. Përdorni import-farmaon-products.cjs për t\'i importuar në databazë');
  console.log('   3. Shkarkoni imazhet e produkteve me download-farmaon-images.cjs\n');
}

main().catch(console.error);
