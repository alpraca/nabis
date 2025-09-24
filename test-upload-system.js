/**
 * Test script for Product Upload System
 * 
 * This script validates the environment and tests basic functionality
 * without actually uploading products.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadSystemTester {
  constructor() {
    this.results = {
      environment: { passed: 0, failed: 0, tests: [] },
      excel: { passed: 0, failed: 0, tests: [] },
      images: { passed: 0, failed: 0, tests: [] },
      api: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runAllTests() {
    console.log('🧪 Product Upload System - Test Suite');
    console.log('=====================================\n');

    await this.testEnvironment();
    await this.testExcelFile();
    await this.testImages();
    await this.testAPI();
    
    this.printSummary();
  }

  async testEnvironment() {
    console.log('🔍 Testing Environment...');
    
    // Test 1: Check Node.js version
    this.test('environment', 'Node.js version >= 16', () => {
      const version = process.version.slice(1).split('.')[0];
      return parseInt(version) >= 16;
    });

    // Test 2: Check required files exist
    this.test('environment', 'Excel file exists', () => {
      return fs.existsSync(path.join(__dirname, 'farmaon_products.xlsx'));
    });

    this.test('environment', 'Images folder exists', () => {
      return fs.existsSync(path.join(__dirname, 'product_images'));
    });

    this.test('environment', 'Upload script exists', () => {
      return fs.existsSync(path.join(__dirname, 'product-upload-system.js'));
    });

    this.test('environment', 'Config file exists', () => {
      return fs.existsSync(path.join(__dirname, 'upload-config.js'));
    });

    console.log();
  }

  async testExcelFile() {
    console.log('📊 Testing Excel File...');
    
    try {
      const excelPath = path.join(__dirname, 'farmaon_products.xlsx');
      
      // Test 1: File is readable
      this.test('excel', 'File is readable', () => {
        const workbook = XLSX.readFile(excelPath);
        return workbook && workbook.SheetNames.length > 0;
      });

      // Test 2: Has data
      this.test('excel', 'Contains data', () => {
        const workbook = XLSX.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        return data && data.length > 0;
      });

      // Test 3: Has required columns
      this.test('excel', 'Has identifiable columns', () => {
        const workbook = XLSX.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length === 0) return false;
        
        const headers = Object.keys(data[0]).map(h => h.toLowerCase());
        const hasName = headers.some(h => h.includes('name') || h.includes('product'));
        const hasPrice = headers.some(h => h.includes('price') || h.includes('cost'));
        
        return hasName && hasPrice;
      });

      // Sample data analysis
      const workbook = XLSX.readFile(excelPath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`   📋 Found ${data.length} rows of data`);
      console.log(`   📝 Columns: ${Object.keys(data[0] || {}).join(', ')}`);
      
    } catch (error) {
      this.test('excel', 'File parsing', () => false, error.message);
    }

    console.log();
  }

  async testImages() {
    console.log('🖼️  Testing Images...');
    
    try {
      const imagesPath = path.join(__dirname, 'product_images');
      
      // Test 1: Folder is readable
      this.test('images', 'Folder is readable', () => {
        const files = fs.readdirSync(imagesPath);
        return Array.isArray(files);
      });

      // Test 2: Contains images
      this.test('images', 'Contains image files', () => {
        const files = fs.readdirSync(imagesPath);
        const imageFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        });
        return imageFiles.length > 0;
      });

      // Test 3: Images are valid
      this.test('images', 'Images are accessible', () => {
        const files = fs.readdirSync(imagesPath);
        const imageFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        }).slice(0, 5); // Test first 5 images

        return imageFiles.every(file => {
          try {
            const filePath = path.join(imagesPath, file);
            const stats = fs.statSync(filePath);
            return stats.isFile() && stats.size > 0;
          } catch {
            return false;
          }
        });
      });

      const files = fs.readdirSync(imagesPath);
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      });

      console.log(`   📸 Found ${imageFiles.length} image files`);
      console.log(`   📂 Image formats: ${[...new Set(imageFiles.map(f => path.extname(f)))].join(', ')}`);
      
    } catch (error) {
      this.test('images', 'Folder access', () => false, error.message);
    }

    console.log();
  }

  async testAPI() {
    console.log('🌐 Testing API Connection...');
    
    try {
      // Dynamic import to handle potential missing axios
      const axios = (await import('axios')).default;
      
      // Test 1: API server is running
      await this.testAsync('api', 'Server is running', async () => {
        const response = await axios.get('http://localhost:3001/api/health', { timeout: 5000 });
        return response.status === 200;
      });

      // Test 2: Authentication endpoint exists
      await this.testAsync('api', 'Auth endpoint accessible', async () => {
        try {
          await axios.post('http://localhost:3001/api/auth/login', {
            email: 'test@test.com',
            password: 'wrongpassword'
          }, { timeout: 5000 });
          return false;
        } catch (error) {
          // We expect this to fail with 401/400, not connection error
          return error.response && error.response.status >= 400 && error.response.status < 500;
        }
      });

      // Test 3: Products endpoint exists
      await this.testAsync('api', 'Products endpoint accessible', async () => {
        const response = await axios.get('http://localhost:3001/api/products', { timeout: 5000 });
        return response.status === 200;
      });

    } catch (error) {
      if (error.message.includes('Cannot resolve module')) {
        console.log('   ⚠️  Axios not installed. Run: npm install axios');
      } else {
        this.test('api', 'Server connection', () => false, error.message);
      }
    }

    console.log();
  }

  test(category, name, testFn, errorDetails = '') {
    try {
      const result = testFn();
      const status = result ? '✅' : '❌';
      console.log(`   ${status} ${name}`);
      
      if (result) {
        this.results[category].passed++;
      } else {
        this.results[category].failed++;
        if (errorDetails) {
          console.log(`      Error: ${errorDetails}`);
        }
      }
      
      this.results[category].tests.push({
        name,
        passed: result,
        error: errorDetails
      });
    } catch (error) {
      console.log(`   ❌ ${name} - Error: ${error.message}`);
      this.results[category].failed++;
      this.results[category].tests.push({
        name,
        passed: false,
        error: error.message
      });
    }
  }

  async testAsync(category, name, testFn) {
    try {
      const result = await testFn();
      const status = result ? '✅' : '❌';
      console.log(`   ${status} ${name}`);
      
      if (result) {
        this.results[category].passed++;
      } else {
        this.results[category].failed++;
      }
      
      this.results[category].tests.push({
        name,
        passed: result
      });
    } catch (error) {
      console.log(`   ❌ ${name} - Error: ${error.message}`);
      this.results[category].failed++;
      this.results[category].tests.push({
        name,
        passed: false,
        error: error.message
      });
    }
  }

  printSummary() {
    console.log('📊 TEST SUMMARY');
    console.log('===============');
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const [category, results] of Object.entries(this.results)) {
      const status = results.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${category.toUpperCase()}: ${results.passed} passed, ${results.failed} failed`);
      totalPassed += results.passed;
      totalFailed += results.failed;
    }
    
    console.log(`\n🎯 OVERALL: ${totalPassed} passed, ${totalFailed} failed`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! Your system is ready for product upload.');
      console.log('👉 Run: node product-upload-system.js');
    } else {
      console.log('\n⚠️  Some tests failed. Please fix the issues above before running the upload system.');
    }
    
    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `test-report-${timestamp}.json`);
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: { totalPassed, totalFailed },
        results: this.results
      }, null, 2));
      
      console.log(`\n📄 Detailed test report saved: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Could not save test report: ${error.message}`);
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new UploadSystemTester();
  tester.runAllTests().catch(console.error);
}

export default UploadSystemTester;