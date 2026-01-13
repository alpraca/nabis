const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

console.log('\n🎯 MBUSHJA E NËNKATEGORIVE BOSHE\n');
console.log('═'.repeat(80));

const db = new sqlite3.Database('./server/database.sqlite');
const allProducts = [];
const existingProducts = new Set();

// Fjalë kyçe për çdo nënkategori - MË TË THJESHTA
const targetCategories = {
  'Proteine Fitness': {
    category: 'suplemente',
    keywords: ['protein', 'whey', 'bcaa', 'amino', 'creatine', 'mass'],
    pages: 30
  },
  'Ortopedike': {
    category: 'higjiene',
    keywords: ['support', 'brace', 'elastic', 'bandage', 'belt', 'strap'],
    pages: 15
  },
  'SPF Bebë': {
    category: 'mama-dhe-bebat',
    keywords: ['spf', 'sun', 'solar', 'baby cream', 'bebe'],
    pages: 15
  },
  'Planifikim Familjar': {
    category: 'higjiene',
    keywords: ['condom', 'test', 'pregnancy', 'contraceptive'],
    pages: 10
  },
  'Shtatzani': {
    category: 'mama-dhe-bebat',
    keywords: ['prenatal', 'pregnancy', 'mama', 'maternity'],
    pages: 15
  },
  'Ushqyerje Gji': {
    category: 'mama-dhe-bebat',
    keywords: ['breast', 'nursing', 'lactation', 'pump'],
    pages: 15
  }
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
        console.log(`✅ U ngarkuan ${existingProducts.size} produkte ekzistues\n`);
        resolve();
      }
    });
  });
}

function productExists(name) {
  return existingProducts.has(name.toLowerCase().trim());
}

function matchesKeywords(productName, keywords) {
  const nameLower = productName.toLowerCase();
  return keywords.some(keyword => nameLower.includes(keyword.toLowerCase()));
}

function extractProductsFromHTML(html) {
  const products = [];
  let searchStart = 0;
  
  while (true) {
    const urlMarker = 'href="https://farmaon.al/product/';
    const urlIndex = html.indexOf(urlMarker, searchStart);
    if (urlIndex === -1) break;
    
    const urlStart = urlIndex + 6;
    const urlEnd = html.indexOf('"', urlStart);
    const url = html.substring(urlStart, urlEnd);
    
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
    name = name.replace(/\s+/g, ' ');
    
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

async function searchForProducts(subcategoryName, config) {
  console.log(`\n📦 ${subcategoryName.toUpperCase()}`);
  console.log('─'.repeat(80));
  console.log(`   Category: ${config.category}`);
  console.log(`   Keywords: ${config.keywords.join(', ')}`);
  
  const found = [];
  
  // Kërko në Suplemente
  if (config.category === 'suplemente') {
    const baseUrl = 'https://farmaon.al/product-category/suplemente/';
    
    for (let page = 1; page <= config.pages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
      
      try {
        const html = await fetchPage(url);
        const products = extractProductsFromHTML(html);
        
        if (products.length === 0) break;
        
        console.log(`   Faqja ${page}: ${products.length} produkte`);
        
        for (const product of products) {
          if (matchesKeywords(product.name, config.keywords)) {
            if (productExists(product.name)) {
              console.log(`   ⚠️  ${product.name} - ekziston`);
            } else {
              const brandMatch = product.name.match(/^([A-Z][A-Za-z\s&.-]+?)[\s-]/);
              const brand = brandMatch ? brandMatch[1].trim() : product.name.split(' ')[0];
              
              found.push({
                name: product.name,
                brand: brand,
                category: config.category,
                subcategory: subcategoryName,
                price: product.price,
                url: product.url,
                stock_quantity: 100,
                image_url: '',
                description: ''
              });
              
              console.log(`   ✅ ${product.name} (${product.price}L)`);
            }
          }
        }
        
        await delay(1500);
        
      } catch (error) {
        console.error(`   ❌ Gabim në faqen ${page}: ${error.message}`);
        break;
      }
    }
  }
  
  // Kërko në kategori të tjera
  else {
    const categoryUrls = {
      'mama-dhe-bebat': 'https://farmaon.al/product-category/bebe-dhe-nena/',
      'higjiene': 'https://farmaon.al/product-category/higjiene/'
    };
    
    const baseUrl = categoryUrls[config.category];
    if (!baseUrl) {
      console.log(`   ⚠️  Kategoria ${config.category} nuk është e disponueshme`);
      return found;
    }
    
    for (let page = 1; page <= config.pages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
      
      try {
        const html = await fetchPage(url);
        const products = extractProductsFromHTML(html);
        
        if (products.length === 0) break;
        
        console.log(`   Faqja ${page}: ${products.length} produkte`);
        
        for (const product of products) {
          if (matchesKeywords(product.name, config.keywords)) {
            if (productExists(product.name)) {
              console.log(`   ⚠️  ${product.name} - ekziston`);
            } else {
              const brandMatch = product.name.match(/^([A-Z][A-Za-z\s&.-]+?)[\s-]/);
              const brand = brandMatch ? brandMatch[1].trim() : product.name.split(' ')[0];
              
              found.push({
                name: product.name,
                brand: brand,
                category: config.category,
                subcategory: subcategoryName,
                price: product.price,
                url: product.url,
                stock_quantity: 100,
                image_url: '',
                description: ''
              });
              
              console.log(`   ✅ ${product.name} (${product.price}L)`);
            }
          }
        }
        
        await delay(1500);
        
      } catch (error) {
        console.error(`   ❌ Gabim: ${error.message}`);
        break;
      }
    }
  }
  
  return found;
}

async function main() {
  await loadExistingProducts();
  
  console.log('🔍 DUKE KËRKUAR PRODUKTE...\n');
  console.log('═'.repeat(80));
  
  // Kërko për çdo nënkategori
  for (const [subcatName, config] of Object.entries(targetCategories)) {
    const products = await searchForProducts(subcatName, config);
    allProducts.push(...products);
  }
  
  console.log(`\n\n${'═'.repeat(80)}`);
  console.log('📊 PËRMBLEDHJE');
  console.log('═'.repeat(80));
  
  const summary = {};
  allProducts.forEach(p => {
    const key = `${p.category}/${p.subcategory}`;
    summary[key] = (summary[key] || 0) + 1;
  });
  
  console.log('\nProdukte të reja:');
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} produkte`);
  });
  
  console.log(`\n📦 TOTAL: ${allProducts.length} produkte të reja`);
  
  if (allProducts.length > 0) {
    const filename = `fill-empty-subcats-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(allProducts, null, 2), 'utf8');
    console.log(`\n✅ Ruajtur në: ${filename}`);
    console.log('\n💡 Ekzekuto: node import-farmaon-needed.cjs\n');
  } else {
    console.log('\n⚠️  Nuk u gjetën produkte të reja!\n');
  }
  
  db.close();
}

main().catch(console.error);
