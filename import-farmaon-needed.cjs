const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Lexo produktet nga JSON
const jsonFiles = fs.readdirSync('.').filter(f => f.startsWith('farmaon-needed-products-') && f.endsWith('.json'));
if (jsonFiles.length === 0) {
  console.log('❌ Nuk u gjet asnjë JSON file me produkte!');
  process.exit(1);
}

const latestFile = jsonFiles.sort().reverse()[0];
console.log(`📂 Duke lexuar: ${latestFile}\n`);

const products = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

if (products.length === 0) {
  console.log('❌ Nuk ka produkte për të importuar!');
  process.exit(0);
}

console.log(`✅ U ngarkuan ${products.length} produkte nga JSON\n`);

// Funksion për të shkarkuar një faqe produkt dhe gjetur imazhin
function downloadProductPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Ekstrakton URL-në e imazhit nga faqja e produktit
function extractImageUrl(html) {
  // Kërko për og:image meta tag (më e besueshme)
  let match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
  if (match) return match[1];
  
  // Kërko për imazhin kryesor të produktit
  match = html.match(/class="woocommerce-product-gallery__image"[^>]*><a href="([^"]+)"/);
  if (match) return match[1];
  
  // Kërko për data-thumb attribute
  match = html.match(/data-thumb="([^"]+)"/);
  if (match) return match[1];
  
  return null;
}

// Shkarkon një imazh
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Krijon direktorinë për imazhe nëse nuk ekziston
const imageDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Proceson produktet
async function processProducts() {
  console.log('🔍 DUKE SHKARKUAR IMAZHET...\n');
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i + 1}/${products.length}] ${product.name}`);
    
    try {
      // Shkarkon faqen e produktit
      const html = await downloadProductPage(product.url);
      
      // Ekstrakton URL-në e imazhit
      const imageUrl = extractImageUrl(html);
      
      if (!imageUrl) {
        console.log('   ❌ Nuk u gjet imazh\n');
        continue;
      }
      
      console.log(`   🌐 Imazh: ${imageUrl}`);
      
      // Krijon emër unik për imazhin
      const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const filename = `${slug}${ext}`;
      const filepath = path.join(imageDir, filename);
      
      // Shkarkon imazhin
      await downloadImage(imageUrl, filepath);
      console.log(`   ✅ Ruajtur: ${filename}\n`);
      
      // Përditëson objektin product me image_url
      product.image_url = `/images/products/${filename}`;
      
    } catch (error) {
      console.log(`   ❌ Gabim: ${error.message}\n`);
    }
    
    // Pauza 500ms midis kërkesave
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Ruaj JSON me imazhe
  const outputFile = latestFile.replace('.json', '-with-images.json');
  fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
  console.log(`\n✅ JSON me imazhe u ruajt: ${outputFile}\n`);
  
  // Tani importo në databazë
  await importToDatabase();
}

// Importon në databazë
async function importToDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./server/database.sqlite');
    
    console.log('💾 DUKE IMPORTUAR NË DATABAZË...\n');
    
    let imported = 0;
    let skipped = 0;
    
    db.serialize(() => {
      products.forEach((p, index) => {
        // Kontrollo nëse produkti ekziston
        db.get('SELECT id FROM products WHERE name = ?', [p.name], (err, row) => {
          if (row) {
            console.log(`[${index + 1}] ⏭️  ${p.name} - ekziston tashmë`);
            skipped++;
            
            // Kontrollo nëse i gjithë lista është procesuar
            if (index === products.length - 1) {
              finishImport();
            }
            return;
          }
          
          // Inserti produktin
          db.run(`
            INSERT INTO products (name, brand, category, subcategory, description, price, stock_quantity, in_stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            p.name,
            p.brand || '',
            p.category,
            p.subcategory,
            p.description || `${p.name} nga ${p.brand || 'FarmaOn'}`,
            p.price,
            p.stock_quantity || 100,
            1
          ], function(err) {
            if (err) {
              console.log(`[${index + 1}] ❌ ${p.name}: ${err.message}`);
              skipped++;
            } else {
              const productId = this.lastID;
              console.log(`[${index + 1}] ✅ ${p.name} (${p.price}L) - ID: ${productId}`);
              imported++;
              
              // Shto imazhin nëse ekziston
              if (p.image_url) {
                db.run(`
                  INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
                  VALUES (?, ?, ?, ?)
                `, [productId, p.image_url, 1, 0], (imgErr) => {
                  if (imgErr) {
                    console.log(`       ⚠️  Imazhi nuk u shtua: ${imgErr.message}`);
                  } else {
                    console.log(`       🖼️  Imazh: ${p.image_url}`);
                  }
                });
              }
            }
            
            // Kontrollo nëse i gjithë lista është procesuar
            if (index === products.length - 1) {
              // Prit 100ms për t'u siguruar që të gjitha imazhet janë procesuar
              setTimeout(finishImport, 100);
            }
          });
        });
      });
      
      function finishImport() {
        db.close(() => {
          console.log(`\n════════════════════════════════════════════════════════════════════════════════`);
          console.log(`✅ IMPORT I SUKSESSHËM!`);
          console.log(`   • ${imported} produkte të reja u shtuan`);
          console.log(`   • ${skipped} produkte u anashkaluan (ekzistojnë ose gabime)`);
          console.log(`════════════════════════════════════════════════════════════════════════════════\n`);
          resolve();
        });
      }
    });
  });
}

processProducts().catch(console.error);
