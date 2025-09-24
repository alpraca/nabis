/**
 * Configuration file for Product Upload System
 * 
 * Modify these settings according to your needs
 */

export const UPLOAD_CONFIG = {
  // =================
  // API CONFIGURATION
  // =================
  
  // Base URL for your API (update if different)
  API_BASE_URL: 'http://localhost:3001/api',
  
  // Authentication credentials
  // IMPORTANT: Update these with your admin credentials
  ADMIN_EMAIL: 'admin@nabisfarmaci.al',
  ADMIN_PASSWORD: 'Admin123!',
  
  // =================
  // FILE PATHS
  // =================
  
  // Path to your Excel file (relative to script location)
  EXCEL_FILE_NAME: 'farmaon_products.xlsx',
  
  // Path to your images folder (relative to script location)
  IMAGES_FOLDER_NAME: 'product_images',
  
  // =================
  // UPLOAD SETTINGS
  // =================
  
  // How many products to upload simultaneously
  // Lower values = more stable, higher values = faster
  MAX_CONCURRENT_UPLOADS: 3,
  
  // How many times to retry failed uploads
  RETRY_ATTEMPTS: 3,
  
  // Delay between retries (milliseconds)
  RETRY_DELAY: 2000,
  
  // Delay between batches (milliseconds)
  BATCH_DELAY: 1000,
  
  // =================
  // IMAGE MATCHING
  // =================
  
  // How similar product name and image name should be (0.0 to 1.0)
  // 0.7 = 70% similarity required
  IMAGE_SIMILARITY_THRESHOLD: 0.6,
  
  // Maximum number of images per product
  MAX_IMAGES_PER_PRODUCT: 5,
  
  // Supported image formats
  SUPPORTED_IMAGE_FORMATS: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // =================
  // DEFAULT VALUES
  // =================
  
  // Values to use when data is missing from Excel
  DEFAULTS: {
    category: 'Farmaci',
    brand: 'Generic',
    stock_quantity: 10,
    is_new: false,
    on_sale: false,
    in_stock: true,
    description: 'Produkt farmaceutik cilësor'
  },
  
  // =================
  // COLUMN MAPPING
  // =================
  
  // Help the system find the right columns in your Excel file
  // Add more variations if your Excel uses different column names
  COLUMN_PATTERNS: {
    name: [
      'name', 'product_name', 'title', 'product', 'emri', 'emër',
      'Name', 'Product Name', 'Title', 'Product', 'Emri', 'Emër'
    ],
    brand: [
      'brand', 'manufacturer', 'producer', 'marka', 'brand_name',
      'Brand', 'Manufacturer', 'Producer', 'Marka', 'Brand Name'
    ],
    category: [
      'category', 'type', 'kategori', 'lloji', 'group',
      'Category', 'Type', 'Kategori', 'Lloji', 'Group'
    ],
    description: [
      'description', 'desc', 'details', 'përshkrimi', 'pershkrimi',
      'Description', 'Desc', 'Details', 'Përshkrimi', 'Pershkrimi'
    ],
    price: [
      'price', 'cost', 'amount', 'çmimi', 'cmimi', 'value',
      'Price', 'Cost', 'Amount', 'Çmimi', 'Cmimi', 'Value'
    ],
    original_price: [
      'original_price', 'old_price', 'was_price', 'çmimi_origjinal',
      'Original Price', 'Old Price', 'Was Price', 'Çmimi Origjinal'
    ],
    stock_quantity: [
      'stock', 'quantity', 'qty', 'amount', 'sasia', 'stoku',
      'Stock', 'Quantity', 'Qty', 'Amount', 'Sasia', 'Stoku'
    ],
    is_new: [
      'new', 'is_new', 'i_ri', 'new_product',
      'New', 'Is New', 'I Ri', 'New Product'
    ],
    on_sale: [
      'sale', 'on_sale', 'discount', 'zbritje', 'në_zbritje',
      'Sale', 'On Sale', 'Discount', 'Zbritje', 'Në Zbritje'
    ],
    in_stock: [
      'in_stock', 'available', 'availability', 'në_stok', 'disponueshëm',
      'In Stock', 'Available', 'Availability', 'Në Stok', 'Disponueshëm'
    ]
  },
  
  // =================
  // ADVANCED OPTIONS
  // =================
  
  // Enable detailed debug logging
  DEBUG_MODE: false,
  
  // Save uploaded images to server uploads folder
  SAVE_IMAGES_TO_SERVER: true,
  
  // Create backup of Excel file before processing
  CREATE_BACKUP: true,
  
  // Validate image files before upload
  VALIDATE_IMAGES: true,
  
  // Maximum file size for images (bytes)
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Generate detailed CSV report
  GENERATE_CSV_REPORT: true
};

export default UPLOAD_CONFIG;