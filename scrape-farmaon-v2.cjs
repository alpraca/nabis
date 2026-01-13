const https = require('https');
const fs = require('fs');

console.log('\n🌐 DUKE SHKARKUAR PRODUKTE NGA FARMAON.AL (v2)\n');
console.log('═'.repeat(80));

const allProducts = [];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'sq-AL,sq;q=0.9,en;q=0.8'
      } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractProducts(html, categoryName) {
  const products = [];
  
  // Pattern më i thjeshtë - kërko href që përmbajnë /product/
  const urlRegex = /href="(https:\/\/farmaon\.al\/product\/[^"]+)"/g;
  const urls = new Set();
  
  let match;
  while ((match = urlRegex.exec(html)) !== null) {
    urls.add(match[1]);
  }
  
  console.log(`   🔍 U gjetën ${urls.size} URL produkte unike`);
  
  // Për çdo URL, kërko emrin dhe çmimin pranë tij
  urls.forEach(url => {
    // Gjej snippet-in e HTML rreth këtij URL
    const urlIndex = html.indexOf(url);
    const snippet = html.substring(Math.max(0, urlIndex - 500), urlIndex + 500);
    
    // Kërko product title (zakonisht në <h2> ose <a> me class woocommerce-loop-product__title)
    const titleMatch = snippet.match(/<h2[^>]*class="[^"]*product[^"]*title[^"]*"[^>]*>(.*?)<\/h2>/i) ||
                      snippet.match(/<a[^>]*href="[^"]*"[^>]*>(.*?)<\/a>.*?price/i) ||
                      snippet.match(/class="product-title"[^>]*>(.*?)<\//i);
    
    // Kërko çmimin
    const priceMatch = snippet.match(/<span[^>]*class="[^"]*amount[^"]*"[^>]*>.*?([\d,]+\.?\d*)\s*L/i) ||
                      snippet.match(/([\d,]+\.?\d*)\s*L/);
    
    if (titleMatch) {
      const name = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
      
      // Extract brand (zakonisht fjala e parë)
      const brandMatch = name.match(/^([A-Z][A-Za-z\s&.-]+?)\s+[-–]/);
      const brand = brandMatch ? brandMatch[1].trim() : name.split(' ')[0];
      
      products.push({
        name: name,
        brand: brand,
        category: categoryName,
        price: price,
        url: url,
        stock_quantity: 100,
        image_url: ''
      });
    }
  });
  
  return products;
}

async function scrapePage(url, categoryName, page) {
  try {
    console.log(`\n📄 ${categoryName} - Faqja ${page}`);
    console.log(`   URL: ${url}`);
    
    const html = await fetchPage(url);
    
    // Kontrollo nëse ka produkte
    if (!html.includes('/product/') && !html.includes('woocommerce-loop-product')) {
      console.log('   ⚠️  Nuk u gjet strukturë produkti');
      return { products: [], hasMore: false };
    }
    
    const products = extractProducts(html, categoryName);
    
    if (products.length === 0) {
      console.log('   ⚠️  Nuk u ekstraktuan produkte');
      return { products: [], hasMore: false };
    }
    
    console.log(`   ✅ U ekstraktuan ${products.length} produkte`);
    
    // Check për next page
    const hasNextPage = html.includes('next page-numbers') || 
                       html.includes(`page/${page + 1}/`) ||
                       html.includes(`/page/${page + 1}/`);
    
    return { products, hasMore: hasNextPage };
  } catch (error) {
    console.error(`   ❌ Gabim: ${error.message}`);
    return { products: [], hasMore: false };
  }
}

async function scrapeCategory(categoryName, baseUrl, maxPages = 65) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📦 KATEGORIA: ${categoryName.toUpperCase()}`);
  console.log('═'.repeat(80));
  
  let page = 1;
  let hasMore = true;
  let categoryProducts = [];
  
  while (hasMore && page <= maxPages) {
    const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
    const result = await scrapePage(url, categoryName, page);
    
    if (result.products.length > 0) {
      categoryProducts.push(...result.products);
      allProducts.push(...result.products);
    }
    
    hasMore = result.hasMore;
    page++;
    
    if (hasMore) {
      await delay(1500); // Prit 1.5 sekonda
    }
  }
  
  console.log(`\n   📊 Total produkte nga ${categoryName}: ${categoryProducts.length}`);
  return categoryProducts;
}

async function main() {
  const categories = [
    { name: 'Suplemente', url: 'https://farmaon.al/product-category/suplemente/', pages: 65 },
    { name: 'Dermokozmetikë', url: 'https://farmaon.al/product-category/dermokozmetike/', pages: 100 },
    { name: 'Farmaci', url: 'https://farmaon.al/product-category/farmaci/', pages: 30 },
    { name: 'Higjienë', url: 'https://farmaon.al/product-category/higjiene/', pages: 20 },
    { name: 'Bebe dhe nëna', url: 'https://farmaon.al/product-category/bebe-dhe-nena/', pages: 20 }
  ];
  
  // Testo me një faqe fillimisht
  console.log('\n🧪 TEST: Duke shkarkuar Suplemente faqja 1...\n');
  const testResult = await scrapePage(
    'https://farmaon.al/product-category/suplemente/',
    'Suplemente',
    1
  );
  
  if (testResult.products.length === 0) {
    console.log('\n❌ TEST FAILED: Nuk u ekstraktuan produkte.');
    console.log('💡 Do të provoj një metodë alternative...\n');
    
    // Ruaj HTML për analizë
    const html = await fetchPage('https://farmaon.al/product-category/suplemente/');
    fs.writeFileSync('farmaon-sample.html', html, 'utf8');
    console.log('✅ HTML i ruajtur në farmaon-sample.html për analizë\n');
    
    // Analizo HTML
    console.log('📝 ANALIZA E HTML:');
    console.log('─'.repeat(80));
    
    // Numro linqet e produkteve
    const productLinks = (html.match(/href="https:\/\/farmaon\.al\/product\//g) || []).length;
    console.log(`   • Linqe produkte gjetur: ${productLinks}`);
    
    // Kërko class të mundshme
    const classes = html.match(/class="[^"]*product[^"]*"/gi);
    if (classes) {
      const uniqueClasses = [...new Set(classes)].slice(0, 10);
      console.log(`   • Product classes: ${uniqueClasses.join(', ')}`);
    }
    
    return;
  }
  
  console.log(`\n✅ TEST SUCCESS: ${testResult.products.length} produkte u ekstraktuan!`);
  console.log('\n🚀 Duke vazhduar me të gjitha kategorit...\n');
  await delay(2000);
  
  // Fshi produktet e testit
  allProducts.length = 0;
  
  // Scrape të gjitha kategorit
  for (const category of categories) {
    await scrapeCategory(category.name, category.url, category.pages);
    await delay(3000); // Prit 3 sekonda mes kategorive
  }
  
  console.log(`\n\n${'═'.repeat(80)}`);
  console.log('📊 PËRMBLEDHJE FINALE');
  console.log('═'.repeat(80));
  
  const summary = {};
  allProducts.forEach(p => {
    summary[p.category] = (summary[p.category] || 0) + 1;
  });
  
  console.log('\nProdukte sipas kategorisë:');
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} produkte`);
  });
  
  console.log(`\n📦 TOTAL PRODUKTE: ${allProducts.length}`);
  
  if (allProducts.length > 0) {
    const filename = `farmaon-products-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(allProducts, null, 2), 'utf8');
    console.log(`\n✅ Produktet u ruajtën në: ${filename}`);
    
    const csvFilename = `farmaon-products-${Date.now()}.csv`;
    const csvContent = 'Brand,Name,Category,Price,URL\n' + 
      allProducts.map(p => `"${p.brand}","${p.name}","${p.category}",${p.price},"${p.url}"`).join('\n');
    fs.writeFileSync(csvFilename, csvContent, 'utf8');
    console.log(`✅ CSV u ruajt në: ${csvFilename}\n`);
  }
}

main().catch(console.error);
