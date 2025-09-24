const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')
const { db } = require('./server/config/database.cjs')

// Category mapping based on navbar structure and product keywords
const categoryMappings = {
  // Dermokozmetikë subcategories
  'fytyre': {
    parent: 'Dermokozmetikë',
    keywords: [
      'serum', 'cream', 'face', 'facial', 'cleanser', 'toner', 'moisturizer', 
      'anti-aging', 'wrinkle', 'cleanance', 'foaming gel', 'matt', 'fluid',
      'hydra', 'hydrating', 'exfoliating', 'aha', 'bha', 'vitamin c',
      'hyaluronic', 'niacinamide', 'retinol', 'peptide', 'collagen',
      'fytyre', 'balsam', 'krem', 'pastrues'
    ]
  },
  'floket': {
    parent: 'Dermokozmetikë',
    keywords: [
      'shampoo', 'conditioner', 'hair', 'shampo', 'flok', 'balsam',
      'mask', 'treatment', 'styling', 'gel', 'oil', 'serum',
      'anti-dandruff', 'volume', 'repair', 'color', 'keratin'
    ]
  },
  'trupi': {
    parent: 'Dermokozmetikë',
    keywords: [
      'body', 'lotion', 'cream', 'oil', 'butter', 'scrub',
      'trupi', 'krem', 'vaj', 'qumësht', 'eksfoliant',
      'moisturizing', 'nourishing', 'firming', 'anti-cellulite'
    ]
  },
  'spf': {
    parent: 'Dermokozmetikë',
    keywords: [
      'spf', 'sun', 'solar', 'sunscreen', 'protection', 'uv',
      'diellor', 'mbrojtje', 'krem diellor', 'spray'
    ]
  },
  'tanning': {
    parent: 'Dermokozmetikë',
    keywords: [
      'tanning', 'self-tan', 'bronzing', 'tan', 'bronze',
      'vetë-bronzues', 'ngjyrosës'
    ]
  },
  'makeup': {
    parent: 'Dermokozmetikë',
    keywords: [
      'makeup', 'foundation', 'concealer', 'powder', 'lipstick',
      'eyeshadow', 'mascara', 'blush', 'primer', 'setting',
      'makeup', 'fondacion', 'pudër', 'buzëkuq', 'maskara'
    ]
  },

  // Higjena subcategories
  'depilim-intime': {
    parent: 'Higjena',
    keywords: [
      'wax', 'shaving', 'intimate', 'depilatory', 'razor',
      'depilim', 'intim', 'rrojë', 'kujdes intim'
    ]
  },
  'goja': {
    parent: 'Higjena',
    keywords: [
      'toothpaste', 'mouthwash', 'dental', 'oral', 'teeth',
      'pastë dhëmbësh', 'gojëlarës', 'dhëmbë', 'gingiva',
      'breath', 'whitening', 'fluoride'
    ]
  },
  'kembet': {
    parent: 'Higjena',
    keywords: [
      'foot', 'feet', 'pedicu', 'callus', 'heel',
      'këmbë', 'thua', 'thonj', 'kallus'
    ]
  },
  'trupi-higjena': {
    parent: 'Higjena',
    keywords: [
      'shower gel', 'soap', 'deodorant', 'antiperspirant',
      'xhel dushi', 'sapun', 'deodorant', 'higjenë trupore'
    ]
  },

  // Farmaci subcategories
  'otc': {
    parent: 'Farmaci',
    keywords: [
      'pain relief', 'headache', 'fever', 'cold', 'cough',
      'ibuprofen', 'paracetamol', 'aspirin', 'antibiotic',
      'dhimbje', 'temperaturë', 'kollë', 'gripi'
    ]
  },
  'mireqenia-seksuale': {
    parent: 'Farmaci',
    keywords: [
      'condom', 'lubricant', 'contraceptive', 'pregnancy test',
      'prezervativ', 'lubrifikant', 'test shtatzënie'
    ]
  },
  'aparat-mjeksore': {
    parent: 'Farmaci',
    keywords: [
      'blood pressure', 'thermometer', 'glucose', 'nebulizer',
      'omron', 'monitor', 'digital', 'automatic', 'electronic',
      'presion', 'termometër', 'glukozë', 'aerosol'
    ]
  },
  'first-aid': {
    parent: 'Farmaci',
    keywords: [
      'bandage', 'plaster', 'wound', 'antiseptic', 'gauze',
      'first aid', 'emergency', 'ndihmë e parë', 'plagë'
    ]
  },
  'ortopedike': {
    parent: 'Farmaci',
    keywords: [
      'brace', 'support', 'compression', 'orthopedic', 'joint',
      'ortopedik', 'mbështetës', 'ngjeshje'
    ]
  },

  // Mama dhe Bebat subcategories
  'shtatzeni': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'pregnancy', 'prenatal', 'maternity', 'stretch marks',
      'shtatzëni', 'shtatzënë', 'barkë', 'kujdes gjatë shtatzënisë'
    ]
  },
  'ushqyerje-gji': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'breastfeeding', 'nipple', 'breast', 'nursing',
      'ushqyerje me gji', 'gji', 'thithje'
    ]
  },
  'pelena': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'diaper', 'nappy', 'pampers', 'pelena'
    ]
  },
  'higjena-bebe': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'baby wash', 'baby shampoo', 'baby cream', 'baby lotion',
      'bebe', 'baby', 'foshnje', 'kujdes për bebë'
    ]
  },
  'spf-bebe': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'baby sun', 'baby spf', 'baby sunscreen',
      'bebe diellor', 'foshnje spf'
    ]
  },
  'suplemente-bebe': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'baby vitamin', 'baby drops', 'infant formula',
      'vitamin bebe', 'pikë për bebe'
    ]
  },
  'aksesor-beba': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'baby bottle', 'pacifier', 'baby accessories',
      'biberon', 'dude', 'aksesorë bebe'
    ]
  },
  'planifikim-familjar': {
    parent: 'Mama dhe Bebat',
    keywords: [
      'family planning', 'fertility', 'ovulation',
      'planifikim familjar', 'fertilitet'
    ]
  },

  // Produkte Shtesë subcategories
  'sete': {
    parent: 'Produkte Shtesë',
    keywords: [
      'set', 'kit', 'bundle', 'routine', 'collection',
      'set', 'komplet', 'koleksion'
    ]
  },
  'vajra-esencial': {
    parent: 'Produkte Shtesë',
    keywords: [
      'essential oil', 'aromatherapy', 'natural oil',
      'vaj esencial', 'aromaterapi', 'vaj natyral'
    ]
  },

  // Suplemente (no subcategories)
  'suplemente': {
    parent: 'Suplemente',
    keywords: [
      'supplement', 'vitamin', 'mineral', 'protein', 'omega',
      'suplement', 'vitaminë', 'mineral', 'proteinë'
    ]
  }
}

// Function to categorize a product based on its name and description
function categorizeProduct(productName, productDescription = '') {
  const searchText = `${productName} ${productDescription}`.toLowerCase()
  
  // Score each category based on keyword matches
  const scores = {}
  
  for (const [categoryId, categoryData] of Object.entries(categoryMappings)) {
    let score = 0
    
    for (const keyword of categoryData.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        // Give higher score for exact matches and longer keywords
        score += keyword.length * (searchText.split(keyword.toLowerCase()).length - 1)
      }
    }
    
    if (score > 0) {
      scores[categoryId] = score
    }
  }
  
  // Return the category with the highest score
  if (Object.keys(scores).length > 0) {
    const bestCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
    return {
      subcategory: bestCategory,
      category: categoryMappings[bestCategory].parent,
      confidence: scores[bestCategory]
    }
  }
  
  // Default fallback - try to match main categories
  if (searchText.includes('shampoo') || searchText.includes('hair') || searchText.includes('flok')) {
    return { subcategory: 'floket', category: 'Dermokozmetikë', confidence: 1 }
  }
  if (searchText.includes('cream') || searchText.includes('serum') || searchText.includes('krem')) {
    return { subcategory: 'fytyre', category: 'Dermokozmetikë', confidence: 1 }
  }
  if (searchText.includes('baby') || searchText.includes('bebe')) {
    return { subcategory: 'higjena-bebe', category: 'Mama dhe Bebat', confidence: 1 }
  }
  
  // Ultimate fallback
  return { subcategory: 'fytyre', category: 'Dermokozmetikë', confidence: 0 }
}

// Function to process Excel file and update database
async function processExcelAndUpdateDatabase() {
  try {
    console.log('📁 Reading Excel file...')
    
    // Read Excel file
    const workbook = xlsx.readFile('./farmaon_products.xlsx')
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet)
    
    console.log(`📊 Found ${data.length} products in Excel file`)
    
    // Clear existing products
    console.log('🗑️ Clearing existing products...')
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM products', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM product_images', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    
    let processed = 0
    let categorized = {}
    
    console.log('⚙️ Processing and categorizing products...')
    
    for (const row of data) {
      try {
        const name = row.Name || row.name || ''
        // Improved price parsing for Albanian format (e.g., "3,700.00L")
        const priceStr = String(row.Price || row.price || '0')
        let price = 0
        if (priceStr && priceStr !== '0') {
          // Remove currency symbol and spaces
          let cleanPrice = priceStr.replace(/L$/i, '').trim()
          // Handle Albanian number format: "3,700.00" -> 3700.00
          if (cleanPrice.includes(',') && cleanPrice.includes('.')) {
            // Format: "3,700.00" - comma is thousands separator
            cleanPrice = cleanPrice.replace(/,/g, '')
          } else if (cleanPrice.includes(',') && !cleanPrice.includes('.')) {
            // Format: "3,70" - comma is decimal separator
            cleanPrice = cleanPrice.replace(/,/g, '.')
          }
          price = parseFloat(cleanPrice) || 0
        }
        const description = row.Description || row.description || ''
        const imageFile = row.Image_File || row.image_file || ''
        const stock = row.Stock || row.stock || ''
        
        if (!name) continue
        
        // Categorize the product
        const categoryResult = categorizeProduct(name, description)
        const category = categoryResult.category
        const subcategory = categoryResult.subcategory
        
        // Track categorization stats
        if (!categorized[subcategory]) categorized[subcategory] = 0
        categorized[subcategory]++
        
        // Determine stock status
        const inStock = stock && !stock.toLowerCase().includes('pa stok') && !stock.toLowerCase().includes('out of stock')
        
        // Insert product
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO products (name, brand, category, subcategory, description, price, stock_quantity, in_stock, is_new, on_sale)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              name,
              extractBrand(name), // Extract brand from product name
              category,
              subcategory,
              description,
              price,
              inStock ? 10 : 0,
              inStock ? 1 : 0,
              1, // Mark as new
              price > 0 ? 1 : 0 // Mark as on sale if has price
            ],
            function(err) {
              if (err) {
                console.error(`❌ Error inserting product "${name}":`, err.message)
                reject(err)
              } else {
                const productId = this.lastID
                
                // Insert image if available
                if (imageFile) {
                  const imagePath = `/uploads/products/${imageFile}`
                  db.run(
                    'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
                    [productId, imagePath, 1],
                    (imgErr) => {
                      if (imgErr) {
                        console.error(`⚠️ Error inserting image for "${name}":`, imgErr.message)
                      }
                    }
                  )
                }
                
                resolve()
              }
            }
          )
        })
        
        processed++
        if (processed % 100 === 0) {
          console.log(`✅ Processed ${processed}/${data.length} products...`)
        }
        
      } catch (error) {
        console.error(`❌ Error processing product "${row.Name}":`, error.message)
      }
    }
    
    console.log('\n📈 Categorization Summary:')
    for (const [cat, count] of Object.entries(categorized)) {
      console.log(`  ${cat}: ${count} products`)
    }
    
    console.log(`\n✅ Successfully processed ${processed} products!`)
    
  } catch (error) {
    console.error('❌ Error processing Excel file:', error)
  } finally {
    db.close()
  }
}

// Helper function to extract brand from product name
function extractBrand(productName) {
  const commonBrands = [
    'Avene', 'Ducray', 'Caudalie', 'Rilastil', 'La Roche Posay', 'Vichy',
    'Eucerin', 'Bioderma', 'Uriage', 'Nuxe', 'Clarins', 'Clinique',
    'Estee Lauder', 'Lancome', 'Shiseido', 'SK-II', 'Olay', 'Nivea',
    'Garnier', 'L\'Oreal', 'Maybelline', 'Revlon', 'CoverGirl',
    'Omron', 'Holle', 'Bioscalin', 'Splat', 'Elancyl'
  ]
  
  const name = productName.toLowerCase()
  
  for (const brand of commonBrands) {
    if (name.includes(brand.toLowerCase())) {
      return brand
    }
  }
  
  // Try to extract brand from the beginning of the product name
  const words = productName.split(' ')
  if (words.length > 0) {
    return words[0]
  }
  
  return 'Generic'
}

// Run the processing
if (require.main === module) {
  processExcelAndUpdateDatabase()
}

module.exports = {
  categoryMappings,
  categorizeProduct,
  processExcelAndUpdateDatabase
}