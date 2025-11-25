#!/usr/bin/env node
/**
 * Re-import Products Script
 * 
 * Use this script if you need to re-import products from the scraped data.
 * WARNING: This will DELETE all existing products and images!
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DB_PATH = './server/database.sqlite';
const UPLOADS_DIR = './server/uploads/products';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askConfirmation() {
  return new Promise((resolve) => {
    console.log('\n⚠️  WARNING: This will DELETE all products and images!\n');
    rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function clearDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    db.serialize(() => {
      db.run('DELETE FROM product_images', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.run('DELETE FROM products', (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log('✓ Cleared database');
          db.close();
          resolve();
        });
      });
    });
  });
}

function clearImages() {
  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(UPLOADS_DIR, file));
    });
    console.log('✓ Cleared images');
  }
}

async function runImport() {
  console.log('🚀 Starting import...\n');
  
  const { spawn } = require('child_process');
  const child = spawn('node', ['scripts/import-scraped-products.cjs'], {
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Import failed with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  RE-IMPORT PRODUCTS FROM SCRAPED DATA');
  console.log('═══════════════════════════════════════\n');
  
  const confirmed = await askConfirmation();
  
  if (!confirmed) {
    console.log('\n❌ Import cancelled.\n');
    process.exit(0);
  }
  
  try {
    console.log('\n🗑️  Clearing existing data...\n');
    await clearDatabase();
    clearImages();
    
    console.log('\n📦 Running import...\n');
    await runImport();
    
    console.log('\n✅ Re-import complete!\n');
    console.log('Run `node scripts/verify-import.cjs` to verify the import.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
