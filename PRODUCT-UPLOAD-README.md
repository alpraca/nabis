# 🏥 Nabis Pharmacy - Automated Product Upload System

A comprehensive, intelligent system for automatically uploading products from Excel files to your pharmacy website, with smart image matching and detailed reporting.

## 🌟 Features

- **📊 Dynamic Excel Parsing**: Works with any Excel structure - automatically detects columns
- **🖼️ Smart Image Matching**: Intelligently matches product images based on names
- **🔄 Batch Processing**: Handles large product catalogs efficiently 
- **🛡️ Error Handling**: Robust retry logic and graceful failure handling
- **📈 Detailed Reporting**: Comprehensive success/failure reports with logs
- **⚙️ Highly Configurable**: Easy to customize for different data formats
- **🚀 Production Ready**: Built for reliability and maintainability

## 📋 Prerequisites

1. **Node.js** (version 16 or higher)
2. **Your pharmacy website server running** (default: http://localhost:3001)
3. **Admin access credentials** to your website
4. **Excel file** with product data
5. **Product images folder** with product photos

## 🚀 Quick Start

### 1. Setup

```bash
# Navigate to your project folder
cd nabis

# Run the setup script
node setup-upload-system.js
```

### 2. Prepare Your Data

Make sure you have:
- `farmaon_products.xlsx` - Your Excel file with product data
- `product_images/` - Folder containing product images

### 3. Configure (Optional)

Edit `upload-config.js` to customize:
- API credentials
- Upload settings  
- Image matching preferences
- Default values

### 4. Run Upload

```bash
# Start your server first
npm run server

# In another terminal, run the upload
node product-upload-system.js
```

## 📊 Excel File Format

The system works with **any Excel structure** by automatically detecting columns. Common column names it recognizes:

| Data Type | Recognized Column Names |
|-----------|------------------------|
| **Product Name** | name, product_name, title, emri |
| **Brand** | brand, manufacturer, marka |
| **Category** | category, type, kategori |
| **Description** | description, desc, përshkrimi |
| **Price** | price, cost, çmimi |
| **Stock** | stock, quantity, sasia |

### Example Excel Structure:
```
| Name                | Brand    | Price | Category | Description        |
|---------------------|----------|-------|----------|--------------------|
| Paracetamol 500mg   | Bayer    | 2.50  | Medicine | Pain relief tablets|
| Vitamin D3 Drops    | Centrum  | 8.90  | Vitamins | Daily supplement   |
```

## 🖼️ Image Matching

The system intelligently matches images to products using:

### Smart Algorithm
- **Name similarity**: Matches product names with image filenames
- **Brand recognition**: Considers brand names in matching
- **Fuzzy matching**: Handles slight name variations
- **Multiple images**: Can assign multiple images per product

### Image Naming Examples
For a product "Paracetamol 500mg Bayer":
- ✅ `Paracetamol_500mg_Bayer.jpg`
- ✅ `bayer_paracetamol.png`
- ✅ `Paracetamol-Bayer-500mg.jpeg`
- ✅ `PARACETAMOL_BAYER.jpg`

### Supported Formats
- JPG/JPEG
- PNG  
- WebP

## ⚙️ Configuration Options

Edit `upload-config.js` for these settings:

### Basic Settings
```javascript
API_BASE_URL: 'http://localhost:3001/api',
ADMIN_EMAIL: 'admin@nabisfarmaci.al',
ADMIN_PASSWORD: 'Admin123!',
```

### Upload Control
```javascript
MAX_CONCURRENT_UPLOADS: 3,    // Products uploaded simultaneously
RETRY_ATTEMPTS: 3,            // Retry failed uploads
IMAGE_SIMILARITY_THRESHOLD: 0.6, // Image matching sensitivity
```

### Default Values
```javascript
DEFAULTS: {
  category: 'Farmaci',
  brand: 'Generic',
  stock_quantity: 10,
  in_stock: true
}
```

## 📈 Reports & Logging

### Console Output
Real-time progress with:
- ✅ Successful uploads
- ❌ Failed uploads  
- ⚠️ Skipped products
- 📊 Success rate

### Detailed JSON Report
Automatically saved as `upload-report-[timestamp].json`:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalProcessed": 150,
    "successful": 145,
    "failed": 3,
    "skipped": 2,
    "successRate": 96.7
  },
  "results": {
    "successful": [...],
    "failed": [...],
    "skipped": [...]
  }
}
```

## 🛠️ Advanced Usage

### Custom Credentials
```javascript
import ProductUploadSystem from './product-upload-system.js';

const uploader = new ProductUploadSystem();
uploader.setCredentials('your-email@domain.com', 'your-password');
await uploader.run();
```

### Custom Configuration
```javascript
// Override default config
import { UPLOAD_CONFIG } from './upload-config.js';

UPLOAD_CONFIG.MAX_CONCURRENT_UPLOADS = 5;
UPLOAD_CONFIG.IMAGE_SIMILARITY_THRESHOLD = 0.8;
```

## 🚨 Troubleshooting

### Common Issues

#### "API server is not running"
```bash
# Make sure your server is started
npm run server
```

#### "Authentication failed"
- Check credentials in `upload-config.js`
- Ensure admin account exists
- Verify server is accessible

#### "No images found for products"
- Check image filenames match product names
- Lower `IMAGE_SIMILARITY_THRESHOLD` in config
- Ensure images are in correct folder

#### "Excel file parsing errors"
- Verify Excel file exists and is readable
- Check for required columns (name, price)
- Try opening Excel file manually first

### Debug Mode
Enable detailed logging:
```javascript
// In upload-config.js
DEBUG_MODE: true
```

## 📁 File Structure

```
nabis/
├── product-upload-system.js    # Main upload script
├── upload-config.js            # Configuration file
├── setup-upload-system.js      # Setup script
├── farmaon_products.xlsx       # Your product data
├── product_images/             # Your product images
│   ├── product1.jpg
│   ├── product2.png
│   └── ...
└── upload-report-*.json        # Generated reports
```

## 🔒 Security Notes

- **Never commit credentials** to version control
- Use environment variables for production credentials
- Ensure admin account has proper permissions
- Keep backup of original data

## 🆘 Support

### If You Need Help:

1. **Check this README** first
2. **Enable debug mode** for detailed logs
3. **Check the generated report** for specific errors
4. **Verify server logs** for API errors

### Error Codes:
- `400`: Invalid data (check Excel format)
- `401`: Authentication failed (check credentials)  
- `500`: Server error (check server logs)

## 🔄 Updates & Maintenance

### Updating Product Data
1. Update your Excel file
2. Add new images to product_images folder
3. Run the upload script again

### Bulk Operations
The system handles:
- ✅ Large catalogs (tested with 1000+ products)
- ✅ Multiple image formats
- ✅ Various Excel structures
- ✅ Network interruptions
- ✅ Partial failures

## 📝 Changelog

### Version 1.0.0
- Initial release
- Dynamic Excel parsing
- Smart image matching
- Batch upload processing
- Comprehensive error handling
- Detailed reporting

---

**Happy uploading! 🚀**

For technical support, please check the generated reports and server logs for detailed error information.