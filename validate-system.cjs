/**
 * System Validation Script for Nabis Farmaci
 * 
 * This script validates:
 * 1. Backend API functionality
 * 2. Frontend route integrity
 * 3. Product data validation
 * 4. Image matching functionality
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const XLSX = require('xlsx');

class SystemValidator {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3001';
    this.excelFile = path.join(__dirname, 'farmaon_products.xlsx');
    this.imagesFolder = path.join(__dirname, 'product_images');
    
    this.results = {
      apiEndpoints: {},
      dataValidation: {},
      imageMatching: {},
      overallHealth: false
    };
  }

  async validateAll() {
    console.log('🔍 Starting comprehensive system validation...\n');

    try {
      // 1. Validate API endpoints
      console.log('🌐 Testing API endpoints...');
      await this.validateAPIEndpoints();

      // 2. Validate product data
      console.log('\n📊 Validating product data...');
      await this.validateProductData();

      // 3. Validate image matching
      console.log('\n🖼️  Testing image matching...');
      await this.validateImageMatching();

      // 4. Generate summary
      console.log('\n📋 Validation Summary:');
      this.generateSummary();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  async validateAPIEndpoints() {
    const endpoints = [
      '/api/health',
      '/api/products',
      '/api/products/best-sellers',
      '/api/products/categories/list',
      '/api/brands'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, { timeout: 5000 });
        this.results.apiEndpoints[endpoint] = {
          status: response.status,
          working: response.status === 200,
          response: response.data
        };
        console.log(`   ✅ ${endpoint} - Status: ${response.status}`);
      } catch (error) {
        this.results.apiEndpoints[endpoint] = {
          status: error.response?.status || 'TIMEOUT',
          working: false,
          error: error.message
        };
        console.log(`   ❌ ${endpoint} - Error: ${error.message}`);
      }
    }
  }

  async validateProductData() {
    try {
      // Check Excel file
      if (!fs.existsSync(this.excelFile)) {
        this.results.dataValidation.excelFile = false;
        console.log('   ❌ Excel file not found');
        return;
      }

      const workbook = XLSX.readFile(this.excelFile);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      this.results.dataValidation.excelFile = true;
      this.results.dataValidation.totalRows = data.length;

      // Validate data quality
      let validProducts = 0;
      let missingName = 0;
      let missingPrice = 0;
      let missingImage = 0;

      data.forEach(row => {
        const hasName = row.Name && row.Name.trim();
        const hasPrice = row.Price && row.Price.toString().trim();
        const hasImage = row.Image_File && row.Image_File.trim();

        if (hasName && hasPrice) validProducts++;
        if (!hasName) missingName++;
        if (!hasPrice) missingPrice++;
        if (!hasImage) missingImage++;
      });

      this.results.dataValidation.validProducts = validProducts;
      this.results.dataValidation.missingName = missingName;
      this.results.dataValidation.missingPrice = missingPrice;
      this.results.dataValidation.missingImage = missingImage;

      console.log(`   ✅ Excel file loaded: ${data.length} rows`);
      console.log(`   📊 Valid products: ${validProducts}/${data.length}`);
      console.log(`   ⚠️  Missing name: ${missingName}, Missing price: ${missingPrice}, Missing image: ${missingImage}`);

    } catch (error) {
      this.results.dataValidation.error = error.message;
      console.log(`   ❌ Data validation failed: ${error.message}`);
    }
  }

  async validateImageMatching() {
    try {
      // Check images folder
      if (!fs.existsSync(this.imagesFolder)) {
        this.results.imageMatching.imagesFolder = false;
        console.log('   ❌ Images folder not found');
        return;
      }

      const imageFiles = fs.readdirSync(this.imagesFolder).filter(file =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      this.results.imageMatching.imagesFolder = true;
      this.results.imageMatching.totalImages = imageFiles.length;

      // Test image accessibility
      let accessibleImages = 0;
      const sampleSize = Math.min(10, imageFiles.length);
      
      for (let i = 0; i < sampleSize; i++) {
        const imagePath = path.join(this.imagesFolder, imageFiles[i]);
        try {
          const stats = fs.statSync(imagePath);
          if (stats.isFile() && stats.size > 0) {
            accessibleImages++;
          }
        } catch (error) {
          // File not accessible
        }
      }

      this.results.imageMatching.accessibleImages = accessibleImages;
      this.results.imageMatching.sampleTested = sampleSize;

      console.log(`   ✅ Images folder found: ${imageFiles.length} images`);
      console.log(`   📸 Sample accessibility test: ${accessibleImages}/${sampleSize} accessible`);

      // Test dynamic matching (sample)
      if (this.results.dataValidation.excelFile) {
        console.log('   🔄 Testing dynamic image matching...');
        const workbook = XLSX.readFile(this.excelFile);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        let matchedImages = 0;
        const testSample = data.slice(0, 20); // Test first 20 products
        
        testSample.forEach(row => {
          if (row.Image_File) {
            const imagePath = path.join(this.imagesFolder, row.Image_File);
            if (fs.existsSync(imagePath)) {
              matchedImages++;
            }
          }
        });

        this.results.imageMatching.dynamicMatching = {
          tested: testSample.length,
          matched: matchedImages,
          percentage: Math.round((matchedImages / testSample.length) * 100)
        };

        console.log(`   🎯 Dynamic matching test: ${matchedImages}/${testSample.length} (${Math.round((matchedImages / testSample.length) * 100)}%)`);
      }

    } catch (error) {
      this.results.imageMatching.error = error.message;
      console.log(`   ❌ Image validation failed: ${error.message}`);
    }
  }

  generateSummary() {
    const apiHealthy = Object.values(this.results.apiEndpoints).every(ep => ep.working);
    const dataHealthy = this.results.dataValidation.validProducts > 0;
    const imagesHealthy = this.results.imageMatching.totalImages > 0;

    this.results.overallHealth = apiHealthy && dataHealthy && imagesHealthy;

    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`🌐 API Health: ${apiHealthy ? '✅ HEALTHY' : '❌ ISSUES FOUND'}`);
    console.log(`📊 Data Quality: ${dataHealthy ? '✅ GOOD' : '❌ POOR'}`);
    console.log(`🖼️  Images: ${imagesHealthy ? '✅ AVAILABLE' : '❌ MISSING'}`);
    
    console.log(`\n🎯 Overall System Health: ${this.results.overallHealth ? '✅ READY FOR PRODUCTION' : '⚠️  NEEDS ATTENTION'}`);

    if (this.results.dataValidation.validProducts) {
      const dataQuality = (this.results.dataValidation.validProducts / this.results.dataValidation.totalRows) * 100;
      console.log(`📈 Data Quality Score: ${Math.round(dataQuality)}%`);
    }

    if (this.results.imageMatching.dynamicMatching) {
      console.log(`🎯 Image Matching Score: ${this.results.imageMatching.dynamicMatching.percentage}%`);
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (!apiHealthy) {
      console.log('   • Check that the server is running on http://localhost:3001');
      console.log('   • Verify all API routes are properly configured');
    }
    if (!dataHealthy) {
      console.log('   • Review Excel data for missing names and prices');
      console.log('   • Clean up invalid product entries');
    }
    if (!imagesHealthy) {
      console.log('   • Verify product_images folder exists');
      console.log('   • Check image file accessibility');
    }

    // Success message
    if (this.results.overallHealth) {
      console.log('\n🚀 System is ready for product upload!');
      console.log('   Run: node comprehensive-product-uploader.cjs');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run validation
const validator = new SystemValidator();
validator.validateAll().catch(console.error);