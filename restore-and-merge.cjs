const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const BACKUP_DB = './server/database-backup-20251116-181634.sqlite';
const CURRENT_DB = './server/database.sqlite';
const NEW_SCRAPED_DB = './server/database-scraped-temp.sqlite';

console.log('🔄 Restoring and merging databases...\n');

// Step 1: Backup current database (with scraped products)
console.log('Step 1: Backing up current database with scraped products...');
fs.copyFileSync(CURRENT_DB, NEW_SCRAPED_DB);
console.log('✓ Backed up to database-scraped-temp.sqlite\n');

// Step 2: Restore the old backup
console.log('Step 2: Restoring original database from backup...');
fs.copyFileSync(BACKUP_DB, CURRENT_DB);
console.log('✓ Restored from database-backup-20251116-181634.sqlite\n');

// Step 3: Merge the scraped products
console.log('Step 3: Merging scraped products into main database...');

const mainDb = new sqlite3.Database(CURRENT_DB);
const scrapedDb = new sqlite3.Database(NEW_SCRAPED_DB);

// Get scraped products
scrapedDb.all('SELECT * FROM products', [], (err, scrapedProducts) => {
  if (err) {
    console.error('Error reading scraped products:', err);
    return;
  }

  console.log(`Found ${scrapedProducts.length} scraped products to merge\n`);

  // Get scraped product images
  scrapedDb.all('SELECT * FROM product_images', [], (err, scrapedImages) => {
    if (err) {
      console.error('Error reading scraped images:', err);
      return;
    }

    console.log(`Found ${scrapedImages.length} scraped images to merge\n`);
    scrapedDb.close();

    // Insert scraped products into main database
    const insertProduct = mainDb.prepare(`
      INSERT INTO products 
      (name, brand, category, subcategory, description, price, stock_quantity, in_stock, is_new, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertImage = mainDb.prepare(`
      INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
      VALUES (?, ?, ?, ?)
    `);

    let inserted = 0;
    const productIdMap = new Map(); // Map old IDs to new IDs

    mainDb.serialize(() => {
      scrapedProducts.forEach((product, index) => {
        insertProduct.run(
          product.name,
          product.brand,
          product.category,
          product.subcategory,
          product.description,
          product.price,
          product.stock_quantity,
          product.in_stock,
          product.is_new,
          product.created_at,
          function(err) {
            if (err) {
              console.error(`Error inserting product ${product.name}:`, err.message);
            } else {
              productIdMap.set(product.id, this.lastID);
              inserted++;
              
              if (inserted % 100 === 0) {
                console.log(`  ✓ Inserted ${inserted} products...`);
              }
            }
          }
        );
      });

      insertProduct.finalize(() => {
        console.log(`\n✓ Inserted ${inserted} scraped products\n`);
        console.log('Step 4: Merging product images...');

        let imagesInserted = 0;
        scrapedImages.forEach(image => {
          const newProductId = productIdMap.get(image.product_id);
          if (newProductId) {
            insertImage.run(
              newProductId,
              image.image_url,
              image.is_primary,
              image.sort_order,
              function(err) {
                if (err) {
                  console.error(`Error inserting image:`, err.message);
                } else {
                  imagesInserted++;
                }
              }
            );
          }
        });

        insertImage.finalize(() => {
          console.log(`✓ Inserted ${imagesInserted} images\n`);

          // Get final count
          mainDb.get('SELECT COUNT(*) as total FROM products', (err, row) => {
            console.log('\n✨ Merge Complete!\n');
            console.log('═══════════════════════════════════════');
            console.log(`  Original products: 1227`);
            console.log(`  Scraped products: ${inserted}`);
            console.log(`  Total products now: ${row.total}`);
            console.log('═══════════════════════════════════════\n');
            
            mainDb.close();
            
            // Cleanup temp file
            try {
              fs.unlinkSync(NEW_SCRAPED_DB);
              console.log('✓ Cleaned up temporary file\n');
            } catch (e) {
              console.log('Note: Temporary file can be deleted manually: database-scraped-temp.sqlite\n');
            }
          });
        });
      });
    });
  });
});
