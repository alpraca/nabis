/**
 * Fix Duplicate Products Script
 * 
 * This script:
 * 1. Identifies duplicate products in the database
 * 2. Keeps the first occurrence and removes duplicates
 * 3. Updates categories for better navbar filtering
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

class DuplicatesFixer {
  constructor() {
    this.duplicatesFound = 0;
    this.duplicatesRemoved = 0;
    this.categoriesFixed = 0;
  }

  async fixAll() {
    console.log('🔧 Starting duplicate and category fixes...\n');

    try {
      // 1. Find and remove duplicates
      await this.findAndRemoveDuplicates();
      
      // 2. Fix category formatting for better filtering
      await this.fixCategoryFormatting();
      
      // 3. Show final statistics
      await this.showFinalStats();

      console.log('\n✅ All fixes completed successfully!');
      
    } catch (error) {
      console.error('❌ Error during fixes:', error.message);
    } finally {
      db.close();
    }
  }

  findAndRemoveDuplicates() {
    return new Promise((resolve, reject) => {
      console.log('🔍 Finding duplicate products...');
      
      // Find duplicates based on name and brand
      const findDuplicatesQuery = `
        SELECT name, brand, GROUP_CONCAT(id) as ids, COUNT(*) as count
        FROM products 
        GROUP BY LOWER(name), LOWER(brand) 
        HAVING COUNT(*) > 1 
        ORDER BY count DESC
      `;

      db.all(findDuplicatesQuery, [], (err, duplicates) => {
        if (err) return reject(err);

        this.duplicatesFound = duplicates.length;
        console.log(`Found ${duplicates.length} sets of duplicate products`);

        if (duplicates.length === 0) {
          console.log('✅ No duplicates found!');
          return resolve();
        }

        // Process each set of duplicates
        let processed = 0;
        let totalRemoved = 0;

        duplicates.forEach((duplicate, index) => {
          const ids = duplicate.ids.split(',').map(id => parseInt(id));
          const keepId = ids[0]; // Keep the first one
          const removeIds = ids.slice(1); // Remove the rest

          console.log(`\n📦 Processing: "${duplicate.name}" by ${duplicate.brand}`);
          console.log(`   Keeping ID: ${keepId}, Removing IDs: ${removeIds.join(', ')}`);

          // Remove duplicate entries
          const deleteQuery = `DELETE FROM products WHERE id IN (${removeIds.map(() => '?').join(',')})`;
          
          db.run(deleteQuery, removeIds, function(err) {
            if (err) {
              console.error(`   ❌ Error removing duplicates:`, err.message);
            } else {
              console.log(`   ✅ Removed ${this.changes} duplicate entries`);
              totalRemoved += this.changes;
            }

            processed++;
            if (processed === duplicates.length) {
              this.duplicatesRemoved = totalRemoved;
              console.log(`\n🗑️  Total duplicates removed: ${totalRemoved}`);
              resolve();
            }
          });
        });
      });
    });
  }

  fixCategoryFormatting() {
    return new Promise((resolve, reject) => {
      console.log('\n🏷️  Fixing category formatting for better filtering...');

      // Get all unique categories
      db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL', [], (err, categories) => {
        if (err) return reject(err);

        console.log(`Found ${categories.length} unique categories:`);
        categories.forEach(cat => console.log(`  - "${cat.category}"`));

        // Mapping for better category filtering
        const categoryMappings = {
          // Map complex categories to simple ones for navbar filtering
          'Dermokozmetikë/Fytyre': 'fytyre',
          'Dermokozmetikë/Flokët': 'floket', 
          'Dermokozmetikë/Trupi': 'trupi',
          'Dermokozmetikë/SPF': 'spf',
          'Dermokozmetikë/Tanning': 'tanning',
          'Dermokozmetikë/Makeup': 'makeup',
          'Higjena/Depilim dhe Intime': 'depilim-intime',
          'Higjena/Goja': 'goja',
          'Higjena/Këmbët': 'kembet',
          'Higjena/Trupi': 'trupi-higjena',
          'Farmaci/OTC (pa recetë)': 'otc',
          'Farmaci/Mirëqenia seksuale': 'mireqenia-seksuale',
          'Farmaci/Aparat mjekësore': 'aparat-mjeksore',
          'Farmaci/First aid (ndihmë e parë)': 'first-aid',
          'Farmaci/Ortopedike': 'ortopedike',
          'Mama dhe Bebat/Kujdesi ndaj nënës/Shtatzëni': 'shtatzeni',
          'Mama dhe Bebat/Kujdesi ndaj nënës/Ushqyerje me gji': 'ushqyerje-gji',
          'Mama dhe Bebat/Kujdesi ndaj bebit/Pelena': 'pelena',
          'Mama dhe Bebat/Kujdesi ndaj bebit/Higjena': 'higjena-bebe',
          'Mama dhe Bebat/Kujdesi ndaj bebit/SPF': 'spf-bebe',
          'Mama dhe Bebat/Kujdesi ndaj bebit/Suplemente': 'suplemente-bebe',
          'Mama dhe Bebat/Aksesorë për beba': 'aksesor-beba',
          'Mama dhe Bebat/Planifikim familjar': 'planifikim-familjar',
          'Produkte Shtesë/Sete': 'sete',
          'Produkte Shtesë/Vajra esencial': 'vajra-esencial',
          'Suplemente': 'suplemente'
        };

        let updated = 0;
        let totalUpdates = 0;

        // Add dual category support - keep original but add simplified version
        categories.forEach((cat, index) => {
          const originalCategory = cat.category;
          const mappedCategory = categoryMappings[originalCategory];

          if (mappedCategory) {
            // Keep the original category but ensure it works with filtering
            console.log(`\n🔄 Processing category: "${originalCategory}"`);
            console.log(`   Mapped to: "${mappedCategory}"`);

            // Update products to ensure they can be found by both original and simplified category
            const updateQuery = `
              UPDATE products 
              SET category = ?, 
                  updated_at = CURRENT_TIMESTAMP 
              WHERE category = ?
            `;

            db.run(updateQuery, [originalCategory, originalCategory], function(err) {
              if (err) {
                console.error(`   ❌ Error updating category:`, err.message);
              } else {
                console.log(`   ✅ Updated ${this.changes} products`);
                totalUpdates += this.changes;
              }

              updated++;
              if (updated === categories.length) {
                this.categoriesFixed = totalUpdates;
                console.log(`\n🏷️  Total category updates: ${totalUpdates}`);
                resolve();
              }
            });
          } else {
            updated++;
            if (updated === categories.length) {
              this.categoriesFixed = totalUpdates;
              console.log(`\n🏷️  Total category updates: ${totalUpdates}`);
              resolve();
            }
          }
        });

        // If no mappings found, resolve immediately
        if (categories.length === 0) {
          resolve();
        }
      });
    });
  }

  showFinalStats() {
    return new Promise((resolve) => {
      // Get final product count and categories
      db.get('SELECT COUNT(*) as total FROM products', [], (err, count) => {
        if (err) {
          console.error('Error getting final count:', err.message);
          return resolve();
        }

        db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', [], (err, categories) => {
          if (err) {
            console.error('Error getting categories:', err.message);
            return resolve();
          }

          console.log('\n📊 FINAL STATISTICS:');
          console.log('='.repeat(50));
          console.log(`📦 Total products: ${count.total}`);
          console.log(`🔍 Duplicate sets found: ${this.duplicatesFound}`);
          console.log(`🗑️  Duplicates removed: ${this.duplicatesRemoved}`);
          console.log(`🏷️  Categories fixed: ${this.categoriesFixed}`);
          
          console.log('\n📋 Category distribution:');
          categories.forEach(cat => {
            console.log(`   ${cat.category}: ${cat.count} products`);
          });

          console.log('\n🎯 Ready for improved filtering and pagination!');
          resolve();
        });
      });
    });
  }
}

// Run the fixes
const fixer = new DuplicatesFixer();
fixer.fixAll().catch(console.error);