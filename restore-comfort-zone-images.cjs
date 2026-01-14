/**
 * RESTORE COMFORT ZONE IMAGES
 * Re-match Comfort Zone products that lost their images during duplicate cleanup
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);
const { promisify } = require('util');

const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'products');

console.log('\n🔧 RESTORING COMFORT ZONE IMAGES\n');

async function run() {
  // Get all Comfort Zone products without images
  const productsWithoutImages = await dbAll(`
    SELECT p.id, p.name, p.brand
    FROM products p
    WHERE p.brand LIKE '%Comfort Zone%'
      AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
    ORDER BY p.name
  `);

  console.log(`📦 Found ${productsWithoutImages.length} Comfort Zone products without images\n`);

  if (productsWithoutImages.length === 0) {
    console.log('✅ All Comfort Zone products already have images!\n');
    db.close();
    return;
  }

  // Get all available Comfort Zone images
  const allFiles = fs.readdirSync(IMAGES_DIR);
  const comfortZoneImages = allFiles
    .filter(f => f.toLowerCase().startsWith('comfort-zone') || f.toLowerCase().startsWith('comfort_zone'))
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    })
    .filter(f => {
      // Check file is not empty
      const stats = fs.statSync(path.join(IMAGES_DIR, f));
      return stats.size > 0;
    });

  console.log(`🖼️  Available Comfort Zone images: ${comfortZoneImages.length}\n`);

  // Get images already in use
  const usedImages = await dbAll(`
    SELECT image_url FROM product_images
  `);
  const usedSet = new Set(usedImages.map(row => path.basename(row.image_url)));

  const availableImages = comfortZoneImages.filter(img => !usedSet.has(img));
  console.log(`🆓 Unused Comfort Zone images: ${availableImages.length}\n`);

  let matched = 0;

  // Match each product to best available image
  for (const product of productsWithoutImages) {
    const productName = product.name.toLowerCase()
      .replace(/comfort\s*zone/gi, '')
      .trim();
    
    const productWords = productName
      .split(/[\s\-_]+/)
      .filter(w => w.length > 3)
      .map(w => w.replace(/[^a-z0-9]/g, ''));

    let bestMatch = null;
    let bestScore = 0;

    for (const imgFile of availableImages) {
      const imgName = path.basename(imgFile, path.extname(imgFile))
        .toLowerCase()
        .replace(/comfort[-_]zone[-_]/gi, '')
        .replace(/-\d{4}$/g, ''); // Remove year suffix

      const imgWords = imgName.split(/[-_\s]+/);

      let score = 0;
      let matchingWords = 0;

      // Count matching words
      for (const pw of productWords) {
        if (pw.length < 3) continue;
        for (const iw of imgWords) {
          if (iw.length < 3) continue;
          if (iw.includes(pw) || pw.includes(iw)) {
            matchingWords++;
            score += 100;
            break;
          }
        }
      }

      // Require at least 2 matching words
      if (matchingWords >= 2 && score > bestScore) {
        bestScore = score;
        bestMatch = imgFile;
      }
    }

    if (bestMatch && bestScore >= 200) {
      // Insert image for this product
      await dbRun(`
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, 1, 0)
      `, [product.id, `/images/products/${bestMatch}`]);

      // Remove from available pool
      const idx = availableImages.indexOf(bestMatch);
      if (idx > -1) availableImages.splice(idx, 1);

      console.log(`✅ ${product.name}`);
      console.log(`   → ${bestMatch} (score: ${bestScore})\n`);
      matched++;
    } else {
      console.log(`⚠️  No good match for: ${product.name}`);
    }
  }

  console.log(`\n✅ Matched ${matched} out of ${productsWithoutImages.length} products\n`);

  db.close();
}

run().catch(err => {
  console.error('Error:', err);
  db.close();
  process.exit(1);
});
