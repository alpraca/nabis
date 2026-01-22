/**
 * Streamlined Product Uploader for Nabis Farmaci
 * 
 * This script skips initial API verification and goes directly to authentication and upload
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');

class StreamlinedProductUploader {
  constructor() {
    this.config = {
      apiBaseUrl: 'https://nabis.onrender.com',
      adminCredentials: {
        email: 'admin@nabisfarmaci.al',
        password: 'admin123'
      },
      excelFile: path.join(__dirname, 'farmaon_products.xlsx'),
      imagesFolder: path.join(__dirname, 'product_images'),
      batchSize: 5, // Smaller batches for better reliability
      delayBetweenBatches: 3000,
      retryAttempts: 2
    };

    this.results = {
      upload: {
        totalProducts: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        details: []
      }
    };

    this.authToken = null;
    this.categoryMapping = {
      'avene': 'Dermokozmetikë',
      'cleanance': 'Dermokozmetikë',
      'face': 'Dermokozmetikë',
      'skin': 'Dermokozmetikë',
      'cream': 'Dermokozmetikë',
      'serum': 'Dermokozmetikë',
      'cleanser': 'Dermokozmetikë',
      'moisturizer': 'Dermokozmetikë',
      'aptamil': 'Mama dhe Bebat',
      'baby': 'Mama dhe Bebat',
      'infant': 'Mama dhe Bebat',
      'comfort': 'Mama dhe Bebat',
      'formula': 'Mama dhe Bebat',
      'milk': 'Mama dhe Bebat',
      'vitamin': 'Suplementet',
      'supplement': 'Suplementet',
      'iron': 'Suplementet',
      'drops': 'Farmaci',
      'capsules': 'Farmaci',
      'tablets': 'Farmaci',
      'default': 'Farmaci'
    };
  }

  async run() {
    console.log('🚀 Streamlined Product Upload for Nabis Farmaci');
    console.log('================================================\n');

    try {
      // Quick verification
      console.log('📋 QUICK VERIFICATION');
      console.log('======================');
      if (!this.quickVerification()) {
        return;
      }

      // Authenticate
      console.log('\n🔑 AUTHENTICATION');
      console.log('================');
      const authSuccess = await this.authenticate();
      
      if (!authSuccess) {
        console.log('\n❌ Authentication failed. Cannot proceed.');
        return;
      }

      // Upload products
      console.log('\n📦 PRODUCT UPLOAD');
      console.log('================');
      await this.processAndUploadProducts();

      // Report
      this.generateReport();

    } catch (error) {
      console.error('\n💥 Fatal error:', error.message);
      this.generateReport();
    }
  }

  quickVerification() {
    console.log('🔍 Checking essential files...');
    
    if (!fs.existsSync(this.config.excelFile)) {
      console.log('   ❌ Excel file not found');
      return false;
    }
    
    if (!fs.existsSync(this.config.imagesFolder)) {
      console.log('   ❌ Images folder not found');
      return false;
    }

    console.log('   ✅ Excel file found');
    console.log('   ✅ Images folder found');
    console.log('   ✅ Ready to proceed');
    
    return true;
  }

  async authenticate() {
    console.log('🔐 Logging in as admin...');

    try {
      const response = await axios.post(`${this.config.apiBaseUrl}/api/auth/login`, 
        this.config.adminCredentials,
        { timeout: 15000 }
      );

      if (response.data && response.data.token) {
        this.authToken = response.data.token;
        console.log('   ✅ Authentication successful');
        return true;
      } else {
        console.log('   ❌ No token received');
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Login failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async processAndUploadProducts() {
    console.log('📦 Loading Excel data...');

    // Read Excel
    const workbook = XLSX.readFile(this.config.excelFile);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Clean data
    const cleanedData = this.cleanProductData(rawData);
    this.results.upload.totalProducts = cleanedData.length;

    console.log(`   📋 Found ${cleanedData.length} valid products`);
    console.log(`   📦 Processing in batches of ${this.config.batchSize}`);

    // Process in small batches
    for (let i = 0; i < cleanedData.length; i += this.config.batchSize) {
      const batch = cleanedData.slice(i, i + this.config.batchSize);
      const batchNumber = Math.floor(i / this.config.batchSize) + 1;
      const totalBatches = Math.ceil(cleanedData.length / this.config.batchSize);

      console.log(`\n   📦 Batch ${batchNumber}/${totalBatches} (${batch.length} products)`);

      for (const product of batch) {
        await this.uploadSingleProduct(product, `${batchNumber}.${batch.indexOf(product) + 1}`);
        await this.delay(1000); // Delay between individual uploads
      }

      if (i + this.config.batchSize < cleanedData.length) {
        console.log(`   ⏳ Waiting ${this.config.delayBetweenBatches/1000}s before next batch...`);
        await this.delay(this.config.delayBetweenBatches);
      }
    }
  }

  cleanProductData(rawData) {
    const cleaned = [];
    let skipped = 0;

    for (const row of rawData.slice(0, 50)) { // Process first 50 products for testing
      try {
        const name = this.cleanString(row.Name);
        const price = this.extractPrice(row.Price);
        const description = this.cleanString(row.Description || '');
        const stock = this.extractStock(row.Stock);
        const imageFile = this.cleanString(row.Image_File);

        if (!name || !price) {
          skipped++;
          continue;
        }

        const category = this.determineCategory(name, description);
        const brand = this.extractBrand(name);

        cleaned.push({
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
          imageFile: imageFile
        });

      } catch (error) {
        skipped++;
      }
    }

    this.results.upload.skipped = skipped;
    return cleaned;
  }

  async uploadSingleProduct(product, productNumber) {
    try {
      const formData = new FormData();
      
      // Add product fields
      formData.append('name', product.name);
      formData.append('brand', product.brand);
      formData.append('category', product.category);
      formData.append('description', product.description);
      formData.append('price', product.price.toString());
      formData.append('stock_quantity', product.stock_quantity.toString());
      formData.append('is_new', 'false');
      formData.append('on_sale', 'false');
      formData.append('in_stock', product.in_stock.toString());

      // Add image if available
      const imagePath = this.findProductImage(product);
      if (imagePath) {
        const imageStream = fs.createReadStream(imagePath);
        formData.append('images', imageStream, path.basename(imagePath));
      }

      // Upload
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
        console.log(`   ✅ ${productNumber}: ${product.name}`);
        this.results.upload.successful++;
        this.results.upload.details.push({
          product: product.name,
          status: 'success',
          productNumber,
          hasImage: !!imagePath
        });
      }

    } catch (error) {
      console.log(`   ❌ ${productNumber}: ${product.name} - ${error.message}`);
      this.results.upload.failed++;
      this.results.upload.details.push({
        product: product.name,
        status: 'failed',
        error: error.message,
        productNumber
      });
    }
  }

  findProductImage(product) {
    if (!product.imageFile) return null;

    const directPath = path.join(this.config.imagesFolder, product.imageFile);
    if (fs.existsSync(directPath)) {
      return directPath;
    }

    // Simple fuzzy matching
    try {
      const imageFiles = fs.readdirSync(this.config.imagesFolder);
      const productWords = product.name.toLowerCase().split(' ').slice(0, 2); // First 2 words
      
      for (const imageFile of imageFiles) {
        const imageName = imageFile.toLowerCase();
        if (productWords.some(word => word.length > 3 && imageName.includes(word))) {
          return path.join(this.config.imagesFolder, imageFile);
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return null;
  }

  // Helper methods
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
      return 10;
    }
    return 0;
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

  extractBrand(name) {
    const firstWord = name.split(' ')[0];
    const knownBrands = ['Avene', 'Aptamil', 'Eucerin', 'Vichy', 'Bioderma'];
    return knownBrands.find(brand => name.toLowerCase().includes(brand.toLowerCase())) || firstWord || 'Nabis Farmaci';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    console.log('\n📊 UPLOAD REPORT');
    console.log('================');
    console.log(`   📊 Total Products: ${this.results.upload.totalProducts}`);
    console.log(`   ✅ Successful: ${this.results.upload.successful}`);
    console.log(`   ❌ Failed: ${this.results.upload.failed}`);
    console.log(`   ⏭️  Skipped: ${this.results.upload.skipped}`);
    
    if (this.results.upload.totalProducts > 0) {
      const successRate = (this.results.upload.successful / (this.results.upload.totalProducts - this.results.upload.skipped) * 100).toFixed(1);
      console.log(`   📈 Success Rate: ${successRate}%`);
    }

    if (this.results.upload.successful > 0) {
      console.log('\n🎉 UPLOAD COMPLETED!');
      console.log(`Successfully uploaded ${this.results.upload.successful} products to Nabis Farmaci!`);
    }
  }
}

// Run the streamlined uploader
if (require.main === module) {
  const uploader = new StreamlinedProductUploader();
  uploader.run().catch(console.error);
}

module.exports = StreamlinedProductUploader;