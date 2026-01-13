const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

console.log('\n🎯 DUKE MARRË VETËM PRODUKTET QË NA DUHEN\n');
console.log('═'.repeat(80));

const db = new sqlite3.Database('./server/database.sqlite');
const allProducts = [];
const existingProducts = new Set();

// Produktet specifike që na duhen
const targetKeywords = {
  'Proteinat': ['whey', 'protein', 'bcaa', 'amino', 'creatine', 'glutamine', 'mass gainer', 'isolate', 'casein'],
  'Omega-3': ['omega', 'fish oil', 'dha', 'epa', 'krill', 'vajë peshku', 'omega3'],
  'Kontrollimi i peshës': ['fat burner', 'carnitine', 'garcinia', 'weight loss', 'slimming', 'cla', 'thermogenic'],
  'Anti Kallo': ['alpecin', 'hair loss', 'hair growth', 'crescina', 'priorin', 'phytocyane', 'kallo', 'rënie', 'anticaduta', 'hair'],
  'Bioscalin': ['bioscalin', 'biosca'],
  'Pastrimi': ['micellar', 'makeup remover', 'cleansing', 'pastrues', 'cleanser', 'demaquillant'],
  'Suplementa për fëmijë': ['children', 'kids', 'baby', 'infant', 'femijet', 'bebé', 'bebe', 'pediatric']
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function loadExistingProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT LOWER(name) as name FROM products', (err, rows) => {
      if (err) reject(err);
      else {
        rows.forEach(row => existingProducts.add(row.name));
        console.log(`✅ U ngarkuan ${existingProducts.size} produkte ekzistues nga databaza\n`);
        resolve();
      }
    });
  });
}

function productExists(name) {
  const normalized = name.toLowerCase().trim();
  return existingProducts.has(normalized);
}

function matchesKeywords(productName, keywords) {
  const nameLower = productName.toLowerCase();
  return keywords.some(keyword => nameLower.includes(keyword.toLowerCase()));
}

function extractProductsFromHTML(html) {
  const products = [];
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
    searchStart = nameEnd;
  }
  
  return products;
}

async function searchForProducts(categoryName, keywords, maxPages = 5) {
  console.log(`\n📦 ${categoryName.toUpperCase()}`);
  console.log('─'.repeat(80));
  console.log(`   Keyword: ${keywords.join(', ')}`);
  
  const found = [];
  
  // Kërko në suplemente
  const suplementeUrl = 'https://farmaon.al/product-category/suplemente/';
  
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? suplementeUrl : `${suplementeUrl}page/${page}/`;
    
    try {
      const html = await fetchPage(url);
      const products = extractProductsFromHTML(html);
      
      console.log(`   Faqja ${page}: ${products.length} produkte u analizuan`);
      
      for (const product of products) {
        // Kontrollo nëse produkti përputhet me keyword-et
        if (matchesKeywords(product.name, keywords)) {
          // Kontrollo nëse e kemi tashmë
          if (productExists(product.name)) {
            console.log(`   ⚠️  SKIP: ${product.name} (e kemi tashmë)`);
          } else {
            const brandMatch = product.name.match(/^([A-Z][A-Za-z\s&.-]+?)[\s-]/);
            const brand = brandMatch ? brandMatch[1].trim() : product.name.split(' ')[0];
            
            found.push({
              name: product.name,
              brand: brand,
              category: 'suplemente',
              subcategory: categoryName,
              price: product.price,
              url: product.url,
              stock_quantity: 100,
              image_url: '',
              description: ''
            });
            
            console.log(`   ✅ FOUND: ${product.name} (${product.price}L)`);
          }
        }
      }
      
      await delay(1500);
      
      // Nëse nuk ka më produkte, dal
      if (products.length === 0) break;
      
    } catch (error) {
      console.error(`   ❌ Gabim në faqen ${page}: ${error.message}`);
      break;
    }
  }
  
  return found;
}

async function searchInDermokozmetike(categoryName, keywords, maxPages = 5) {
  console.log(`\n📦 ${categoryName.toUpperCase()} (Dermokozmetikë)`);
  console.log('─'.repeat(80));
  console.log(`   Keywords: ${keywords.join(', ')}`);
  
  const found = [];
  const dermoUrl = 'https://farmaon.al/product-category/dermokozmetike/';
  
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? dermoUrl : `${dermoUrl}page/${page}/`;
    
    try {
      const html = await fetchPage(url);
      const products = extractProductsFromHTML(html);
      
      console.log(`   Faqja ${page}: ${products.length} produkte u analizuan`);
      
      for (const product of products) {
        if (matchesKeywords(product.name, keywords)) {
          if (productExists(product.name)) {
            console.log(`   ⚠️  SKIP: ${product.name} (e kemi tashmë)`);
          } else {
            const brandMatch = product.name.match(/^([A-Z][A-Za-z\s&.-]+?)[\s-]/);
            const brand = brandMatch ? brandMatch[1].trim() : product.name.split(' ')[0];
            
            found.push({
              name: product.name,
              brand: brand,
              category: 'dermokozmetikë',
              subcategory: categoryName,
              price: product.price,
              url: product.url,
              stock_quantity: 100,
              image_url: '',
              description: ''
            });
            
            console.log(`   ✅ FOUND: ${product.name} (${product.price}L)`);
          }
        }
      }
      
      await delay(1500);
      if (products.length === 0) break;
      
    } catch (error) {
      console.error(`   ❌ Gabim: ${error.message}`);
      break;
    }
  }
  
  return found;
}

async function main() {
  // Ngarko produktet ekzistuese
  await loadExistingProducts();
  
  console.log('🔍 DUKE KËRKUAR PRODUKTE SPECIFIKE...\n');
  console.log('═'.repeat(80));
  
  // Kërko për çdo kategori
  const proteinat = await searchForProducts('Proteinat', targetKeywords['Proteinat'], 15);
  allProducts.push(...proteinat);
  
  const omega3 = await searchForProducts('Omega-3 dhe DHA', targetKeywords['Omega-3'], 15);
  allProducts.push(...omega3);
  
  const pesha = await searchForProducts('Kontrollimi i peshës', targetKeywords['Kontrollimi i peshës'], 10);
  allProducts.push(...pesha);
  
  const antiKallo = await searchInDermokozmetike('Anti Kallo', targetKeywords['Anti Kallo'], 15);
  allProducts.push(...antiKallo);
  
  const bioscalin = await searchInDermokozmetike('Bioscalin', targetKeywords['Bioscalin'], 10);
  allProducts.push(...bioscalin);
  
  const pastrimi = await searchInDermokozmetike('Pastrimi', targetKeywords['Pastrimi'], 10);
  allProducts.push(...pastrimi);
  
  const femijet = await searchForProducts('Suplementa për fëmijë', targetKeywords['Suplementa për fëmijë'], 10);
  allProducts.push(...femijet);
  
  console.log(`\n\n${'═'.repeat(80)}`);
  console.log('📊 PËRMBLEDHJE');
  console.log('═'.repeat(80));
  
  const summary = {};
  allProducts.forEach(p => {
    const key = `${p.category}/${p.subcategory}`;
    summary[key] = (summary[key] || 0) + 1;
  });
  
  console.log('\nProdukte të reja sipas nënkategorive:');
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} produkte të reja`);
  });
  
  console.log(`\n📦 TOTAL PRODUKTE TË REJA: ${allProducts.length}`);
  
  if (allProducts.length > 0) {
    const filename = `farmaon-needed-products-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(allProducts, null, 2), 'utf8');
    console.log(`\n✅ Produktet u ruajtën në: ${filename}`);
    
    console.log('\n💡 HAPI TJETËR:');
    console.log('   1. Verifikoni produktet në JSON file');
    console.log('   2. Ekzekutoni: node import-farmaon-needed.cjs');
    console.log('   3. Shkarkoni imazhet e produkteve\n');
  } else {
    console.log('\n⚠️  Nuk u gjetën produkte të reja që na duhen!\n');
  }
  
  db.close();
}

main().catch(console.error);
