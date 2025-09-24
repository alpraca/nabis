/**
 * Automated Product Upload System for Nabis Pharmacy
 * 
 * This script automatically:
 * 1. Parses Excel file dynamically (works with any number of columns/products)
 * 2. Matches images to products intelligently 
 * 3. Uploads products to the website via API
 * 4. Handles errors gracefully and provides detailed reports
 * 5. Is completely modular and maintainable
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3001/api',
  
  // File paths
  EXCEL_FILE: path.join(__dirname, 'farmaon_products.xlsx'),
  IMAGES_FOLDER: path.join(__dirname, 'product_images'),
  
  // Upload settings
  MAX_CONCURRENT_UPLOADS: 5,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
  
  // Image matching settings
  IMAGE_SIMILARITY_THRESHOLD: 0.7,
  SUPPORTED_IMAGE_FORMATS: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // Default values for missing data
  DEFAULTS: {
    category: 'General',
    brand: 'Unknown',
    stock_quantity: 0,
    is_new: false,
    on_sale: false,
    in_stock: true
  }
};

// Authentication credentials (to be set by user)
let AUTH_CREDENTIALS = {
  email: '',
  password: '',
  token: null
};

class ProductUploadSystem {
  constructor() {
    this.uploadResults = {
      successful: [],
      failed: [],
      skipped: [],
      totalProcessed: 0
    };
    
    this.imageCache = new Map();
    this.similarityCache = new Map();
  }

  /**
   * Main entry point for the upload system
   */
  async run() {
    try {
      console.log('🚀 Starting Nabis Pharmacy Product Upload System');
      console.log('================================================\n');

      // Validate environment
      await this.validateEnvironment();

      // Authenticate
      await this.authenticate();

      // Parse Excel file
      const products = await this.parseExcelFile();
      console.log(`📊 Found ${products.length} products in Excel file\n`);

      // Load and cache images
      await this.loadImages();

      // Process products in batches
      await this.processProductsInBatches(products);

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate that all required files and folders exist
   */
  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    // Check Excel file
    if (!fs.existsSync(CONFIG.EXCEL_FILE)) {
      throw new Error(`Excel file not found: ${CONFIG.EXCEL_FILE}`);
    }
    
    // Check images folder
    if (!fs.existsSync(CONFIG.IMAGES_FOLDER)) {
      throw new Error(`Images folder not found: ${CONFIG.IMAGES_FOLDER}`);
    }
    
    // Check API connectivity
    try {
      await axios.get(`${CONFIG.API_BASE_URL}/health`);
      console.log('✅ API server is running');
    } catch (error) {
      throw new Error('API server is not running. Please start the server first.');
    }
    
    console.log('✅ Environment validation complete\n');
  }

  /**
   * Authenticate with the API
   */
  async authenticate() {
    console.log('🔐 Authenticating...');
    
    if (!AUTH_CREDENTIALS.email || !AUTH_CREDENTIALS.password) {
      throw new Error('Please set authentication credentials using setCredentials() method');
    }

    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/auth/login`, {
        email: AUTH_CREDENTIALS.email,
        password: AUTH_CREDENTIALS.password
      });

      AUTH_CREDENTIALS.token = response.data.token;
      console.log('✅ Authentication successful\n');
    } catch (error) {
      throw new Error(`Authentication failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Parse Excel file dynamically to handle any structure
   */
  async parseExcelFile() {
    console.log('📋 Parsing Excel file...');
    
    try {
      const workbook = XLSX.readFile(CONFIG.EXCEL_FILE);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row as keys
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      if (!rawData || rawData.length === 0) {
        throw new Error('Excel file is empty or has no data');
      }

      console.log(`📊 Raw data sample:`, rawData[0]);
      
      // Normalize and validate products
      const products = rawData.map((row, index) => this.normalizeProductData(row, index + 2));
      
      // Filter out invalid products
      const validProducts = products.filter(product => product !== null);
      
      console.log(`✅ Parsed ${validProducts.length} valid products from ${rawData.length} rows\n`);
      return validProducts;
      
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Normalize product data from Excel row to API format
   */
  normalizeProductData(row, rowNumber) {
    try {
      // Try to identify common column names dynamically
      const columnMappings = this.identifyColumns(Object.keys(row));
      
      const product = {
        // Required fields
        name: this.getValueFromRow(row, columnMappings.name) || `Product ${rowNumber}`,
        brand: this.getValueFromRow(row, columnMappings.brand) || CONFIG.DEFAULTS.brand,
        category: this.getValueFromRow(row, columnMappings.category) || CONFIG.DEFAULTS.category,
        description: this.getValueFromRow(row, columnMappings.description) || 'No description available',
        price: this.parsePrice(this.getValueFromRow(row, columnMappings.price)),
        
        // Optional fields
        original_price: this.parsePrice(this.getValueFromRow(row, columnMappings.original_price)),
        stock_quantity: this.parseInteger(this.getValueFromRow(row, columnMappings.stock_quantity)) || CONFIG.DEFAULTS.stock_quantity,
        is_new: this.parseBoolean(this.getValueFromRow(row, columnMappings.is_new)) || CONFIG.DEFAULTS.is_new,
        on_sale: this.parseBoolean(this.getValueFromRow(row, columnMappings.on_sale)) || CONFIG.DEFAULTS.on_sale,
        in_stock: this.parseBoolean(this.getValueFromRow(row, columnMappings.in_stock)) !== false, // Default to true
        
        // Metadata
        _rowNumber: rowNumber,
        _originalData: row
      };

      // Validate required fields
      if (!product.name || !product.price || product.price <= 0) {
        console.warn(`⚠️  Skipping row ${rowNumber}: Missing required data`);
        this.uploadResults.skipped.push({
          row: rowNumber,
          reason: 'Missing required fields (name or price)',
          data: row
        });
        return null;
      }

      return product;
      
    } catch (error) {
      console.warn(`⚠️  Error processing row ${rowNumber}:`, error.message);
      this.uploadResults.skipped.push({
        row: rowNumber,
        reason: error.message,
        data: row
      });
      return null;
    }
  }

  /**
   * Dynamically identify column mappings from header row
   */
  identifyColumns(headers) {
    const mappings = {};
    
    // Common patterns for each field (case insensitive)
    const patterns = {
      name: ['name', 'product_name', 'title', 'product', 'emri', 'emër'],
      brand: ['brand', 'manufacturer', 'producer', 'marka', 'brand_name'],
      category: ['category', 'type', 'kategori', 'lloji', 'group'],
      description: ['description', 'desc', 'details', 'përshkrimi', 'pershkrimi'],
      price: ['price', 'cost', 'amount', 'çmimi', 'cmimi', 'value'],
      original_price: ['original_price', 'old_price', 'was_price', 'çmimi_origjinal'],
      stock_quantity: ['stock', 'quantity', 'qty', 'amount', 'sasia', 'stoku'],
      is_new: ['new', 'is_new', 'i_ri', 'new_product'],
      on_sale: ['sale', 'on_sale', 'discount', 'zbritje', 'në_zbritje'],
      in_stock: ['in_stock', 'available', 'availability', 'në_stok', 'disponueshëm']
    };

    // Match headers to patterns
    for (const [field, fieldPatterns] of Object.entries(patterns)) {
      for (const header of headers) {
        for (const pattern of fieldPatterns) {
          if (header.toLowerCase().includes(pattern.toLowerCase())) {
            mappings[field] = header;
            break;
          }
        }
        if (mappings[field]) break;
      }
    }

    // If no specific mapping found, use the first available header for required fields
    if (!mappings.name && headers.length > 0) mappings.name = headers[0];
    if (!mappings.description && headers.length > 1) mappings.description = headers[1];
    if (!mappings.price && headers.length > 2) mappings.price = headers[2];

    console.log('📋 Column mappings:', mappings);
    return mappings;
  }

  /**
   * Get value from row using column mapping
   */
  getValueFromRow(row, columnKey) {
    if (!columnKey || !row.hasOwnProperty(columnKey)) return null;
    
    const value = row[columnKey];
    return value !== null && value !== undefined && value !== '' ? String(value).trim() : null;
  }

  /**
   * Parse price from string/number
   */
  parsePrice(value) {
    if (!value) return null;
    
    // Remove currency symbols and convert to number
    const cleaned = String(value).replace(/[^\d.,]/g, '');
    const number = parseFloat(cleaned.replace(',', '.'));
    
    return isNaN(number) ? null : Math.round(number * 100) / 100; // Round to 2 decimals
  }

  /**
   * Parse integer from string/number
   */
  parseInteger(value) {
    if (!value) return null;
    
    const number = parseInt(String(value).replace(/[^\d]/g, ''));
    return isNaN(number) ? null : number;
  }

  /**
   * Parse boolean from various formats
   */
  parseBoolean(value) {
    if (value === null || value === undefined) return null;
    
    const str = String(value).toLowerCase().trim();
    return ['true', '1', 'yes', 'po', 'da'].includes(str);
  }

  /**
   * Load and cache all images from the images folder
   */
  async loadImages() {
    console.log('🖼️  Loading images from folder...');
    
    try {
      const files = fs.readdirSync(CONFIG.IMAGES_FOLDER);
      
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (CONFIG.SUPPORTED_IMAGE_FORMATS.includes(ext)) {
          const fullPath = path.join(CONFIG.IMAGES_FOLDER, file);
          const stats = fs.statSync(fullPath);
          
          this.imageCache.set(file, {
            path: fullPath,
            name: file,
            nameWithoutExt: path.basename(file, ext),
            size: stats.size,
            searchTokens: this.generateSearchTokens(file)
          });
        }
      }
      
      console.log(`✅ Loaded ${this.imageCache.size} images\n`);
    } catch (error) {
      throw new Error(`Failed to load images: ${error.message}`);
    }
  }

  /**
   * Generate search tokens for image matching
   */
  generateSearchTokens(filename) {
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    
    // Split by common separators and clean
    const tokens = nameWithoutExt
      .split(/[_\-\s\.]+/)
      .map(token => token.toLowerCase().trim())
      .filter(token => token.length > 1);
    
    return tokens;
  }

  /**
   * Find matching images for a product using intelligent matching
   */
  findMatchingImages(product) {
    const productTokens = this.generateSearchTokens(product.name + ' ' + product.brand);
    const matches = [];

    for (const [filename, imageInfo] of this.imageCache.entries()) {
      const similarity = this.calculateSimilarity(productTokens, imageInfo.searchTokens);
      
      if (similarity >= CONFIG.IMAGE_SIMILARITY_THRESHOLD) {
        matches.push({
          ...imageInfo,
          similarity
        });
      }
    }

    // Sort by similarity (highest first) and return top matches
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  /**
   * Calculate similarity between product and image tokens
   */
  calculateSimilarity(productTokens, imageTokens) {
    if (productTokens.length === 0 || imageTokens.length === 0) return 0;

    let matches = 0;
    let totalTokens = productTokens.length;

    for (const productToken of productTokens) {
      for (const imageToken of imageTokens) {
        // Exact match
        if (productToken === imageToken) {
          matches += 1;
          break;
        }
        // Partial match (one contains the other)
        else if (productToken.length > 3 && imageToken.length > 3) {
          if (productToken.includes(imageToken) || imageToken.includes(productToken)) {
            matches += 0.7;
            break;
          }
        }
      }
    }

    return matches / totalTokens;
  }

  /**
   * Process products in batches to avoid overwhelming the server
   */
  async processProductsInBatches(products) {
    console.log(`🔄 Processing ${products.length} products in batches of ${CONFIG.MAX_CONCURRENT_UPLOADS}...\n`);
    
    for (let i = 0; i < products.length; i += CONFIG.MAX_CONCURRENT_UPLOADS) {
      const batch = products.slice(i, i + CONFIG.MAX_CONCURRENT_UPLOADS);
      const batchNumber = Math.floor(i / CONFIG.MAX_CONCURRENT_UPLOADS) + 1;
      const totalBatches = Math.ceil(products.length / CONFIG.MAX_CONCURRENT_UPLOADS);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)...`);
      
      const promises = batch.map(product => this.uploadSingleProduct(product));
      await Promise.allSettled(promises);
      
      // Small delay between batches
      if (i + CONFIG.MAX_CONCURRENT_UPLOADS < products.length) {
        await this.delay(1000);
      }
    }
  }

  /**
   * Upload a single product with retry logic
   */
  async uploadSingleProduct(product, attempt = 1) {
    try {
      console.log(`⬆️  Uploading: ${product.name} (${product.brand})`);
      
      // Find matching images
      const matchingImages = this.findMatchingImages(product);
      console.log(`   📸 Found ${matchingImages.length} matching images`);

      // Create form data
      const formData = new FormData();
      
      // Add product data
      Object.keys(product).forEach(key => {
        if (!key.startsWith('_') && product[key] !== null && product[key] !== undefined) {
          formData.append(key, product[key]);
        }
      });

      // Add images
      for (const image of matchingImages) {
        try {
          const imageStream = fs.createReadStream(image.path);
          formData.append('images', imageStream, image.name);
        } catch (error) {
          console.warn(`   ⚠️  Could not read image ${image.name}:`, error.message);
        }
      }

      // Upload to API
      const response = await axios.post(
        `${CONFIG.API_BASE_URL}/products`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${AUTH_CREDENTIALS.token}`
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log(`   ✅ Success: ${product.name}`);
      this.uploadResults.successful.push({
        product: product.name,
        brand: product.brand,
        productId: response.data.productId,
        imagesUploaded: matchingImages.length,
        rowNumber: product._rowNumber
      });

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.log(`   ❌ Failed: ${product.name} - ${errorMessage}`);
      
      // Retry logic
      if (attempt < CONFIG.RETRY_ATTEMPTS && !error.response?.status === 400) {
        console.log(`   🔄 Retrying (${attempt + 1}/${CONFIG.RETRY_ATTEMPTS})...`);
        await this.delay(CONFIG.RETRY_DELAY * attempt);
        return this.uploadSingleProduct(product, attempt + 1);
      }
      
      this.uploadResults.failed.push({
        product: product.name,
        brand: product.brand,
        error: errorMessage,
        rowNumber: product._rowNumber,
        attempts: attempt
      });
    }
    
    this.uploadResults.totalProcessed++;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 UPLOAD REPORT');
    console.log('================');
    console.log(`Total Products Processed: ${this.uploadResults.totalProcessed}`);
    console.log(`✅ Successful: ${this.uploadResults.successful.length}`);
    console.log(`❌ Failed: ${this.uploadResults.failed.length}`);
    console.log(`⏭️  Skipped: ${this.uploadResults.skipped.length}`);
    
    const successRate = this.uploadResults.totalProcessed > 0 
      ? ((this.uploadResults.successful.length / this.uploadResults.totalProcessed) * 100).toFixed(1)
      : 0;
    console.log(`📈 Success Rate: ${successRate}%\n`);

    // Detailed results
    if (this.uploadResults.successful.length > 0) {
      console.log('✅ SUCCESSFUL UPLOADS:');
      this.uploadResults.successful.forEach(item => {
        console.log(`   • ${item.product} (${item.brand}) - ${item.imagesUploaded} images - Row ${item.rowNumber}`);
      });
      console.log();
    }

    if (this.uploadResults.failed.length > 0) {
      console.log('❌ FAILED UPLOADS:');
      this.uploadResults.failed.forEach(item => {
        console.log(`   • ${item.product} (${item.brand}) - ${item.error} - Row ${item.rowNumber}`);
      });
      console.log();
    }

    if (this.uploadResults.skipped.length > 0) {
      console.log('⏭️  SKIPPED PRODUCTS:');
      this.uploadResults.skipped.forEach(item => {
        console.log(`   • Row ${item.row} - ${item.reason}`);
      });
      console.log();
    }

    // Save detailed report to file
    this.saveReportToFile();
  }

  /**
   * Save detailed report to file
   */
  saveReportToFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `upload-report-${timestamp}.json`);
    
    const detailedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProcessed: this.uploadResults.totalProcessed,
        successful: this.uploadResults.successful.length,
        failed: this.uploadResults.failed.length,
        skipped: this.uploadResults.skipped.length,
        successRate: this.uploadResults.totalProcessed > 0 
          ? ((this.uploadResults.successful.length / this.uploadResults.totalProcessed) * 100)
          : 0
      },
      results: this.uploadResults
    };

    try {
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      console.log(`📄 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.warn(`⚠️  Could not save report file: ${error.message}`);
    }
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set authentication credentials
   */
  setCredentials(email, password) {
    AUTH_CREDENTIALS.email = email;
    AUTH_CREDENTIALS.password = password;
  }
}

// Example usage and exports
export default ProductUploadSystem;

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const uploader = new ProductUploadSystem();
  
  // Set your admin credentials here
  uploader.setCredentials('admin@nabisfarmaci.al', 'Admin123!');
  
  // Run the upload system
  uploader.run().catch(console.error);
}