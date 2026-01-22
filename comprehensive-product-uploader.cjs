/**
 * Comprehensive Product Upload System for Nabis Farmaci (CommonJS Version)
 * 
 * This script performs complete verification and product upload:
 * 1. Verifies project structure and API endpoints
 * 2. Validates and cleans Excel data
 * 3. Matches images dynamically
 * 4. Uploads products with comprehensive logging
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');

class ComprehensiveProductUploader {
  constructor() {
    this.config = {
      apiBaseUrl: 'https://nabis.onrender.com',
      adminCredentials: {
        email: 'admin@nabisfarmaci.al',
        password: 'admin123'
      },
      excelFile: path.join(__dirname, 'farmaon_products.xlsx'),
      imagesFolder: path.join(__dirname, 'product_images'),
      batchSize: 10,
      delayBetweenBatches: 2000,
      retryAttempts: 3
    };

    this.results = {
      verification: {
        projectStructure: false,
        apiEndpoints: false,
        excelFile: false,
        imagesFolder: false
      },
      upload: {
        totalProducts: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        details: []
      }
    };

    this.authToken = null;
    this.categoryMapping = this.setupCategoryMapping();
  }

  /**
   * Setup category mapping for Albanian pharmacy structure
   */
  setupCategoryMapping() {
    return {
      'skincare': 'Dermokozmetikë',
      'face': 'Dermokozmetikë',
      'hair': 'Dermokozmetikë', 
      'body': 'Dermokozmetikë',
      'suncare': 'Dermokozmetikë',
      'makeup': 'Dermokozmetikë',
      'hygiene': 'Higjena',
      'oral': 'Higjena',
      'intimate': 'Higjena',
      'feet': 'Higjena',
      'pharmacy': 'Farmaci',
      'otc': 'Farmaci',
      'medical': 'Farmaci',
      'orthopedic': 'Farmaci',
      'baby': 'Mama dhe Bebat',
      'mother': 'Mama dhe Bebat',
      'maternal': 'Mama dhe Bebat',
      'infant': 'Mama dhe Bebat',
      'supplements': 'Suplementet',
      'vitamins': 'Suplementet',
      'nutrition': 'Suplementet',
      'default': 'Farmaci' // Default category
    };
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🚀 Comprehensive Product Upload System for Nabis Farmaci');
    console.log('=========================================================\n');

    try {
      // Step 1: Verify everything
      console.log('📋 STEP 1: COMPREHENSIVE VERIFICATION');
      console.log('=====================================');
      await this.verifyProjectStructure();
      await this.verifyApiEndpoints();
      await this.verifyExcelFile();
      await this.verifyImagesFolder();

      // Check critical verifications (allow API endpoint check to fail initially)
      const criticalVerificationsPassed = this.results.verification.projectStructure && 
                                          this.results.verification.excelFile && 
                                          this.results.verification.imagesFolder;

      if (!criticalVerificationsPassed) {
        console.log('\n❌ Critical verification failed. Cannot proceed with upload.');
        this.generateReport();
        return;
      }

      if (!this.results.verification.apiEndpoints) {
        console.log('\n⚠️  API endpoints check failed, but proceeding with authentication test...');
      } else {
        console.log('\n✅ All verifications passed!');
      }

      // Step 2: Authenticate
      console.log('🔑 STEP 2: AUTHENTICATION');
      console.log('=========================');
      const authSuccess = await this.authenticate();
      
      if (!authSuccess) {
        console.log('\n❌ Authentication failed. Cannot proceed with upload.');
        this.generateReport();
        return;
      }

      // Step 3: Process and upload products
      console.log('\n📦 STEP 3: PRODUCT UPLOAD');
      console.log('=========================');
      await this.processAndUploadProducts();

      // Step 4: Generate final report
      console.log('\n📊 STEP 4: FINAL REPORT');
      console.log('=======================');
      this.generateReport();

    } catch (error) {
      console.error('\n💥 Fatal error:', error.message);
      console.error('Stack trace:', error.stack);
      this.generateReport();
    }
  }

  /**
   * Verify project structure and required files
   */
  async verifyProjectStructure() {
    console.log('🔍 Verifying project structure...');
    
    const requiredPaths = [
      { path: path.join(__dirname, 'server'), name: 'Server directory' },
      { path: path.join(__dirname, 'server', 'routes'), name: 'Routes directory' },
      { path: path.join(__dirname, 'server', 'services'), name: 'Services directory' },
      { path: path.join(__dirname, 'server', 'uploads'), name: 'Uploads directory' },
      { path: path.join(__dirname, 'server', 'routes', 'products.cjs'), name: 'Products routes' },
      { path: path.join(__dirname, 'server', 'routes', 'auth.cjs'), name: 'Auth routes' },
      { path: path.join(__dirname, 'package.json'), name: 'Package.json' }
    ];

    let allExists = true;
    for (const item of requiredPaths) {
      const exists = fs.existsSync(item.path);
      console.log(`   ${exists ? '✅' : '❌'} ${item.name}`);
      if (!exists) allExists = false;
    }

    this.results.verification.projectStructure = allExists;
    return allExists;
  }

  /**
   * Verify API endpoints are accessible
   */
  async verifyApiEndpoints() {
    console.log('🌐 Verifying API endpoints...');

    const endpoints = [
      { url: '/api/products', method: 'GET', name: 'Products endpoint (GET)' },
      { url: '/api/auth/login', method: 'POST', name: 'Auth login endpoint' }
    ];

    let allAccessible = true;
    for (const endpoint of endpoints) {
      try {
        if (endpoint.method === 'GET') {
          const response = await axios.get(`${this.config.apiBaseUrl}${endpoint.url}`, { timeout: 5000 });
          console.log(`   ✅ ${endpoint.name} (${response.status})`);
        } else if (endpoint.method === 'POST' && endpoint.url.includes('login')) {
          // Test login endpoint with invalid credentials to check if it's accessible
          try {
            await axios.post(`${this.config.apiBaseUrl}${endpoint.url}`, {
              email: 'test@test.com',
              password: 'wrong'
            }, { timeout: 5000 });
          } catch (error) {
            // We expect 401/400, not connection error
            if (error.response && error.response.status >= 400 && error.response.status < 500) {
              console.log(`   ✅ ${endpoint.name} (accessible)`);
            } else {
              throw error;
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name} - ${error.message}`);
        allAccessible = false;
      }
    }

    this.results.verification.apiEndpoints = allAccessible;
    return allAccessible;
  }

  /**
   * Verify Excel file and analyze its structure
   */
  async verifyExcelFile() {
    console.log('📊 Verifying Excel file...');

    try {
      // Check if file exists
      if (!fs.existsSync(this.config.excelFile)) {
        console.log('   ❌ Excel file not found');
        this.results.verification.excelFile = false;
        return false;
      }

      // Read and analyze Excel file
      const workbook = XLSX.readFile(this.config.excelFile);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`   ✅ Excel file found with ${data.length} rows`);
      console.log(`   📋 Columns: ${Object.keys(data[0] || {}).join(', ')}`);

      // Validate required columns
      const requiredColumns = ['Name', 'Price'];
      const availableColumns = Object.keys(data[0] || {});
      const hasRequiredColumns = requiredColumns.every(col => 
        availableColumns.some(available => available.toLowerCase().includes(col.toLowerCase()))
      );

      if (hasRequiredColumns) {
        console.log('   ✅ Required columns found');
      } else {
        console.log('   ❌ Missing required columns');
        this.results.verification.excelFile = false;
        return false;
      }

      // Sample validation
      const validRows = data.filter(row => row.Name && row.Price);
      console.log(`   📈 Valid rows: ${validRows.length}/${data.length}`);

      this.results.verification.excelFile = true;
      return true;

    } catch (error) {
      console.log(`   ❌ Excel file error: ${error.message}`);
      this.results.verification.excelFile = false;
      return false;
    }
  }

  /**
   * Verify images folder and count available images
   */
  async verifyImagesFolder() {
    console.log('🖼️  Verifying images folder...');

    try {
      if (!fs.existsSync(this.config.imagesFolder)) {
        console.log('   ❌ Images folder not found');
        this.results.verification.imagesFolder = false;
        return false;
      }

      const files = fs.readdirSync(this.config.imagesFolder);
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      });

      console.log(`   ✅ Images folder found with ${imageFiles.length} images`);
      console.log(`   📸 Image formats: ${[...new Set(imageFiles.map(f => path.extname(f)))].join(', ')}`);

      // Test accessibility of a few images
      const testImages = imageFiles.slice(0, 5);
      let accessibleImages = 0;
      for (const img of testImages) {
        try {
          const stats = fs.statSync(path.join(this.config.imagesFolder, img));
          if (stats.isFile() && stats.size > 0) accessibleImages++;
        } catch (error) {
          // Image not accessible
        }
      }

      console.log(`   ✅ Sample images accessible: ${accessibleImages}/${testImages.length}`);

      this.results.verification.imagesFolder = true;
      return true;

    } catch (error) {
      console.log(`   ❌ Images folder error: ${error.message}`);
      this.results.verification.imagesFolder = false;
      return false;
    }
  }

  /**
   * Check if all verifications passed
   */
  allVerificationsPassed() {
    return Object.values(this.results.verification).every(result => result === true);
  }

  /**
   * Authenticate with the API
   */
  async authenticate() {
    console.log('🔐 Authenticating with admin credentials...');

    try {
      const response = await axios.post(`${this.config.apiBaseUrl}/api/auth/login`, 
        this.config.adminCredentials,
        { timeout: 10000 }
      );

      if (response.data && response.data.token) {
        this.authToken = response.data.token;
        console.log('   ✅ Authentication successful');
        return true;
      } else {
        console.log('   ❌ Authentication failed - no token received');
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Authentication failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  /**
   * Process Excel data and upload products
   */
  async processAndUploadProducts() {
    console.log('📦 Processing and uploading products...');

    // Read Excel data
    const workbook = XLSX.readFile(this.config.excelFile);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Clean and validate data
    const cleanedData = this.cleanProductData(rawData);
    this.results.upload.totalProducts = cleanedData.length;

    console.log(`   📋 Processing ${cleanedData.length} products in batches of ${this.config.batchSize}`);

    // Process in batches
    for (let i = 0; i < cleanedData.length; i += this.config.batchSize) {
      const batch = cleanedData.slice(i, i + this.config.batchSize);
      const batchNumber = Math.floor(i / this.config.batchSize) + 1;
      const totalBatches = Math.ceil(cleanedData.length / this.config.batchSize);

      console.log(`\n   📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`);

      await this.processBatch(batch, batchNumber);

      // Delay between batches to avoid overwhelming the API
      if (i + this.config.batchSize < cleanedData.length) {
        console.log(`   ⏳ Waiting ${this.config.delayBetweenBatches/1000}s before next batch...`);
        await this.delay(this.config.delayBetweenBatches);
      }
    }
  }

  /**
   * Clean and validate product data from Excel
   */
  cleanProductData(rawData) {
    console.log('🧹 Cleaning and validating product data...');

    const cleaned = [];
    let skipped = 0;

    for (const row of rawData) {
      try {
        // Extract and clean basic fields
        const name = this.cleanString(row.Name);
        const price = this.extractPrice(row.Price);
        const description = this.cleanString(row.Description || '');
        const stock = this.extractStock(row.Stock);
        const imageFile = this.cleanString(row.Image_File);

        // Skip if essential data is missing
        if (!name || !price) {
          skipped++;
          continue;
        }

        // Determine category and brand
        const category = this.determineCategory(name, description);
        const brand = this.extractBrand(name, description);

        const cleanedProduct = {
          name,
          brand,
          category,
          description: description || `${name} - kvalitet i lartë nga Nabis Farmaci`,
          price,
          original_price: null,
          stock_quantity: stock,
          is_new: false,
          on_sale: false,
          in_stock: stock > 0,
          imageFile: imageFile,
          originalData: row
        };

        cleaned.push(cleanedProduct);

      } catch (error) {
        console.log(`   ⚠️  Skipping product due to error: ${error.message}`);
        skipped++;
      }
    }

    console.log(`   ✅ Cleaned: ${cleaned.length} products, Skipped: ${skipped} products`);
    this.results.upload.skipped = skipped;
    
    return cleaned;
  }

  /**
   * Process a batch of products
   */
  async processBatch(batch, batchNumber) {
    const promises = batch.map((product, index) => 
      this.uploadSingleProduct(product, `${batchNumber}.${index + 1}`)
    );

    const results = await Promise.allSettled(promises);
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        this.results.upload.successful++;
      } else {
        this.results.upload.failed++;
        console.log(`   ❌ Batch upload failed: ${result.reason}`);
      }
    }
  }

  /**
   * Upload a single product with retry logic
   */
  async uploadSingleProduct(product, productNumber) {
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await this.performUpload(product, productNumber, attempt);
      } catch (error) {
        if (attempt === this.config.retryAttempts) {
          const errorMsg = `Failed after ${this.config.retryAttempts} attempts: ${error.message}`;
          console.log(`   ❌ ${productNumber}: ${product.name} - ${errorMsg}`);
          
          this.results.upload.details.push({
            product: product.name,
            status: 'failed',
            error: errorMsg,
            productNumber
          });
          
          throw new Error(errorMsg);
        } else {
          console.log(`   ⚠️  ${productNumber}: Attempt ${attempt} failed, retrying...`);
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }
  }

  /**
   * Perform the actual product upload
   */
  async performUpload(product, productNumber, attempt) {
    // Create form data
    const formData = new FormData();
    
    // Add product fields
    Object.keys(product).forEach(key => {
      if (key !== 'imageFile' && key !== 'originalData' && product[key] !== null && product[key] !== undefined) {
        formData.append(key, product[key].toString());
      }
    });

    // Add image if available
    const imagePath = this.findProductImage(product);
    if (imagePath) {
      try {
        const imageStream = fs.createReadStream(imagePath);
        const imageFilename = path.basename(imagePath);
        formData.append('images', imageStream, imageFilename);
      } catch (imageError) {
        console.log(`   ⚠️  ${productNumber}: Image not found: ${imagePath}`);
      }
    }

    // Upload to API
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/products`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.authToken}`
        },
        timeout: 30000
      }
    );

    if (response.status === 201) {
      console.log(`   ✅ ${productNumber}: ${product.name} (ID: ${response.data.product?.id || 'N/A'})`);
      
      this.results.upload.details.push({
        product: product.name,
        status: 'success',
        productId: response.data.product?.id,
        productNumber,
        hasImage: !!imagePath
      });
      
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  }

  /**
   * Find matching image for a product
   */
  findProductImage(product) {
    if (!product.imageFile) return null;

    // Direct match with Image_File column
    const directPath = path.join(this.config.imagesFolder, product.imageFile);
    if (fs.existsSync(directPath)) {
      return directPath;
    }

    // Fuzzy matching based on product name
    const imageFiles = fs.readdirSync(this.config.imagesFolder);
    const cleanProductName = this.normalizeForMatching(product.name);

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const imageFile of imageFiles) {
      const cleanImageName = this.normalizeForMatching(path.parse(imageFile).name);
      const similarity = this.calculateSimilarity(cleanProductName, cleanImageName);
      
      if (similarity > bestScore && similarity > 0.3) { // Minimum 30% similarity
        bestScore = similarity;
        bestMatch = path.join(this.config.imagesFolder, imageFile);
      }
    }

    return bestMatch;
  }

  // Helper methods for data processing
  cleanString(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ');
  }

  extractPrice(priceStr) {
    if (!priceStr) return 0;
    // Extract numbers from prices like "3,700.00L" or "2.500 LEK"
    const cleanPrice = priceStr.toString().replace(/[^\d.,]/g, '');
    let numericPrice = parseFloat(cleanPrice.replace(',', ''));
    
    // If price seems too small, might be in thousands format (3,700 = 3700)
    if (cleanPrice.includes(',') && !cleanPrice.includes('.')) {
      numericPrice = parseFloat(cleanPrice.replace(',', ''));
    }
    
    return isNaN(numericPrice) ? 0 : numericPrice;
  }

  extractStock(stockStr) {
    if (!stockStr) return 0;
    const stockString = stockStr.toString().toLowerCase();
    if (stockString.includes('ka stok') || stockString.includes('in stock')) {
      return 10; // Default stock amount
    }
    const numMatch = stockString.match(/\d+/);
    return numMatch ? parseInt(numMatch[0]) : 0;
  }

  determineCategory(name, description) {
    const text = `${name} ${description}`.toLowerCase();
    
    for (const [keyword, category] of Object.entries(this.categoryMapping)) {
      if (keyword !== 'default' && text.includes(keyword)) {
        return category;
      }
    }
    
    return this.categoryMapping.default;
  }

  extractBrand(name, description) {
    // Extract brand from product name (usually the first word)
    const words = name.split(' ');
    const potentialBrand = words[0];
    
    // Common pharmacy brands
    const knownBrands = ['Avene', 'La Roche', 'Vichy', 'Eucerin', 'Cetaphil', 'Bioderma', 'Uriage'];
    const foundBrand = knownBrands.find(brand => 
      name.toLowerCase().includes(brand.toLowerCase())
    );
    
    return foundBrand || potentialBrand || 'Nabis Farmaci';
  }

  normalizeForMatching(str) {
    return str.toLowerCase()
              .replace(/[^\w\s]/g, '')
              .replace(/\s+/g, '_')
              .trim();
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 COMPREHENSIVE UPLOAD REPORT');
    console.log('===============================');
    
    // Verification summary
    console.log('\n🔍 VERIFICATION RESULTS:');
    for (const [check, passed] of Object.entries(this.results.verification)) {
      console.log(`   ${passed ? '✅' : '❌'} ${check.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }

    // Upload summary
    if (this.results.upload.totalProducts > 0) {
      console.log('\n📦 UPLOAD RESULTS:');
      console.log(`   📊 Total Products: ${this.results.upload.totalProducts}`);
      console.log(`   ✅ Successful: ${this.results.upload.successful}`);
      console.log(`   ❌ Failed: ${this.results.upload.failed}`);
      console.log(`   ⏭️  Skipped: ${this.results.upload.skipped}`);
      
      const successRate = this.results.upload.totalProducts > 0 
        ? (this.results.upload.successful / (this.results.upload.totalProducts - this.results.upload.skipped) * 100).toFixed(1)
        : 0;
      console.log(`   📈 Success Rate: ${successRate}%`);
    }

    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `upload-report-${timestamp}.json`);
    
    try {
      const fullReport = {
        timestamp: new Date().toISOString(),
        verification: this.results.verification,
        upload: this.results.upload,
        config: {
          apiBaseUrl: this.config.apiBaseUrl,
          batchSize: this.config.batchSize,
          totalFiles: this.results.upload.totalProducts
        }
      };

      fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
      console.log(`\n📄 Detailed report saved: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Could not save report: ${error.message}`);
    }

    // Final status
    if (this.allVerificationsPassed() && this.results.upload.failed === 0) {
      console.log('\n🎉 UPLOAD COMPLETED SUCCESSFULLY!');
    } else {
      console.log('\n⚠️  UPLOAD COMPLETED WITH ISSUES - Please check the report above');
    }
  }
}

// Run the comprehensive uploader if this script is executed directly
if (require.main === module) {
  const uploader = new ComprehensiveProductUploader();
  uploader.run().catch(console.error);
}

module.exports = ComprehensiveProductUploader;