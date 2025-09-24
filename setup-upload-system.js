#!/usr/bin/env node

/**
 * Simple setup and usage script for the Product Upload System
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Nabis Pharmacy Product Upload System Setup');
console.log('==============================================\n');

// Check if required files exist
const requiredFiles = [
  'farmaon_products.xlsx',
  'product_images'
];

let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n⚠️  Please ensure all required files are present before running the upload system.');
  process.exit(1);
}

// Check if dependencies are installed
try {
  import('xlsx');
  import('axios');
  import('form-data');
  console.log('✅ All dependencies are installed');
} catch (error) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install xlsx axios form-data', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install dependencies. Please run: npm install xlsx axios form-data');
    process.exit(1);
  }
}

console.log('\n🎉 Setup complete! You can now run the upload system.');
console.log('\n📋 Usage Instructions:');
console.log('======================');
console.log('1. Make sure your server is running (npm run server)');
console.log('2. Update credentials in product-upload-system.js if needed');
console.log('3. Run: node product-upload-system.js');
console.log('\n💡 The system will:');
console.log('   • Parse your Excel file dynamically');
console.log('   • Match images to products intelligently');
console.log('   • Upload products with error handling');
console.log('   • Generate a detailed report');