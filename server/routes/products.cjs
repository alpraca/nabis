const express = require('express')
const { db } = require('../config/database.cjs')
const { verifyToken, requireAdmin } = require('../middleware/auth.cjs')
const { uploadProductImages, handleUploadError } = require('../middleware/upload.cjs')

const router = express.Router()

// Debug route - temporary (must be before /:id route)
router.get('/debug/product/:id', (req, res) => {
  const productQuery = 'SELECT * FROM products WHERE id = ?'
  const imagesQuery = 'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order'
  
  db.get(productQuery, [req.params.id], (err, product) => {
    if (err) return res.status(500).json({ error: err.message })
    
    db.all(imagesQuery, [req.params.id], (err, images) => {
      if (err) return res.status(500).json({ error: err.message })
      
      res.json({ 
        product, 
        images,
        debug: {
          productId: req.params.id,
          imagesCount: images.length
        }
      })
    })
  })
})

// Get all products (public)
router.get('/', (req, res) => {
  const { category, search, page = 1, limit = 24, brand } = req.query
  
  // Build query that explicitly selects primary image (sort_order = 1) via LEFT JOIN
  let query = `
    SELECT p.*, pi.image_url as image_url
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
    WHERE 1=1
  `
  const params = []
  let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM products p WHERE 1=1'
  const countParams = []

  // Category filtering - use `category` and `subcategory` columns from the DB
  if (category && category !== 'te-gjitha') {
    const categoryParam = decodeURIComponent(category).toLowerCase()

    // Mapping of URL-friendly names -> actual database category/subcategory values
    const categoryMappings = {
      // Main categories
      'dermokozmetike': 'dermokozmetikë',
      'higjena': 'higjena',
      'farmaci': 'farmaci',
      'mama-dhe-bebat': 'mama-dhe-bebat',
      'produkte-shtese': 'produkte-shtese',
      'suplemente': 'suplemente',
      
      // Dermokozmetikë subcategories
      'fytyre': 'Fytyre',
      'floket': 'Flokët',
      'trupi': 'Trupi',
      'spf': 'SPF',
      'tanning': 'Tanning',
      'makeup': 'Makeup',
      
      // Higjena subcategories
      'depilim-intime': 'Depilim dhe Intime',
      'goja': 'Goja',
      'kembet': 'Këmbët',
      'trupi-higjena': 'Trupi',
      
      // Farmaci subcategories
      'otc': 'OTC (pa recete)',
      'mireqenia-seksuale': 'Mirëqenia seksuale',
      'aparat-mjeksore': 'Aparat mjeksore',
      'first-aid': 'First Aid (Ndihma e Pare)',
      'ortopedike': 'Ortopedike',
      
      // Mama dhe Bebat subcategories and sub-subcategories
      'kujdesi-nenes': 'Kujdesi ndaj Nënës',
      'shtatzani': 'Shtatzani',
      'ushqyerje-gji': 'Ushqyerje me Gji',
      'kujdesi-bebit': 'Kujdesi ndaj Bebit',
      'pelena': 'Pelena',
      'higjena-bebe': 'Higjena',
      'spf-bebe': 'SPF',
      'suplementa-bebe': 'Suplementa',
      'aksesor-beba': 'Aksesor per Beba',
      'planifikim-familjar': 'Planifikim Familjar',
      
      // Produkte Shtesë subcategories
      'sete': 'Sete',
      'vajra-esencial': 'Vajra Esencial',
      
      // Suplemente subcategories
      'vitaminat-mineralet': 'Vitaminat dhe Mineralet',
      'cajra-mjekesore': 'Çajra Mjekësore',
      'proteine-fitness': 'Proteinë dhe Fitness',
      'suplementet-natyrore': 'Suplementet Natyrore'
    }

    const actualCategoryName = categoryMappings[categoryParam] || categoryParam
    
    // Main categories in the database
    const mainCategories = ['dermokozmetikë', 'higjena', 'farmaci', 'mama-dhe-bebat', 'produkte-shtese', 'suplemente']
    
    // Determine if this is a main category or subcategory
    const isMainCategory = mainCategories.some(cat => cat.toLowerCase() === actualCategoryName.toLowerCase())
    
    if (isMainCategory) {
      // Search only in category column for main categories
      query += ` AND LOWER(p.category) = LOWER(?)`
      params.push(actualCategoryName)
      
      countQuery += ` AND LOWER(p.category) = LOWER(?)`
      countParams.push(actualCategoryName)
    } else {
      // Search only in subcategory column for subcategories
      query += ` AND LOWER(p.subcategory) = LOWER(?)`
      params.push(actualCategoryName)
      
      countQuery += ` AND LOWER(p.subcategory) = LOWER(?)`
      countParams.push(actualCategoryName)
    }
  }

  if (brand) {
    query += ' AND LOWER(p.brand) = ?'
    params.push(brand.toLowerCase())
    countQuery += ' AND LOWER(p.brand) = ?'
    countParams.push(brand.toLowerCase())
  }

  if (search) {
    query += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.brand) LIKE ? OR LOWER(p.description) LIKE ?)'
    const searchTerm = `%${search.toLowerCase()}%`
    params.push(searchTerm, searchTerm, searchTerm)
    countQuery += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.brand) LIKE ? OR LOWER(p.description) LIKE ?)'
    countParams.push(searchTerm, searchTerm, searchTerm)
  }

  // First get total count for pagination
  db.get(countQuery, countParams, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në numërimin e produkteve' })
    }

    const totalProducts = countResult.total
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const totalPages = Math.ceil(totalProducts / limitNum)

  // Ensure group by and ordering
  query += ' GROUP BY p.id ORDER BY p.created_at DESC'

    if (limit !== 'all') {
      const offset = (pageNum - 1) * limitNum
      query += ' LIMIT ? OFFSET ?'
      params.push(limitNum, offset)
    }

    db.all(query, params, (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në marrjen e produkteve' })
      }

      // Process images (pi.image_url comes from the LEFT JOIN)
      const processedProducts = products.map(product => ({
        ...product,
        images: product.image_url ? [product.image_url] : [],
        is_new: Boolean(product.is_new),
        on_sale: Boolean(product.on_sale),
        in_stock: Boolean(product.in_stock)
      }))

      res.json({ 
        products: processedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalProducts,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      })
    })
  })
})

// Get product categories (public)
router.get('/categories/list', (req, res) => {
  db.all(
    'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category',
    [],
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në marrjen e kategorive' })
      }

      res.json({ categories: categories.map(c => c.category) })
    }
  )
})

// Get best-selling products (public)
router.get('/best-sellers', (req, res) => {
  const { page = 1, limit = 24 } = req.query
  
  // First get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM products p
    WHERE p.in_stock = 1
  `
  
  db.get(countQuery, [], (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në numërimin e produkteve më të shitura' })
    }

    const totalProducts = countResult.total
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const totalPages = Math.ceil(totalProducts / limitNum)
    const offset = (pageNum - 1) * limitNum

    // Select primary image if exists via join
    const query = `
      SELECT p.id, p.name, p.brand, p.price, p.in_stock, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
      WHERE p.in_stock = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `

    db.all(query, [limitNum, offset], (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në marrjen e produkteve më të shitura' })
      }

      // Process images
      const processedProducts = products.map(product => ({
        ...product,
        images: product.image_url ? [product.image_url] : [],
        in_stock: Boolean(product.in_stock)
      }))

      res.json({ 
        products: processedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalProducts,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      })
    })
  })
})

// Get product brands (public)
router.get('/brands', (req, res) => {
  db.all(
    `SELECT brand, COUNT(*) as product_count 
     FROM products 
     WHERE brand IS NOT NULL AND brand != '' 
     GROUP BY brand 
     ORDER BY brand`,
    [],
    (err, brands) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në marrjen e brandeve' })
      }

      res.json(brands)
    }
  )
})

// Get products by brand (public)
router.get('/brand/:brand', (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const brand = decodeURIComponent(req.params.brand)
  
  let query = `
    SELECT p.*, 
           GROUP_CONCAT(pi.image_url) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.brand = ?
    GROUP BY p.id 
    ORDER BY p.created_at DESC
  `
  const params = [brand]

  if (limit !== 'all') {
    const offset = (page - 1) * limit
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)
  }

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e produkteve' })
    }

    // Process images (products may already contain concatenated images)
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? product.images.split(',') : [],
      is_new: Boolean(product.is_new),
      on_sale: Boolean(product.on_sale),
      in_stock: Boolean(product.in_stock)
    }))

    res.json({ products: processedProducts, brand })
  })
})

// Create new product (admin only)
router.post('/', verifyToken, requireAdmin, uploadProductImages, handleUploadError, (req, res) => {
  try {
    console.log('=== Product Creation Debug ===')
    console.log('Request body:', req.body)
    console.log('Uploaded files:', req.files)
    
    const {
      name, brand, category, description, price, original_price,
      stock_quantity, is_new, on_sale, in_stock
    } = req.body

    // Validate required fields
    if (!name || !brand || !category || !description || !price) {
      return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' })
    }

    // Insert product
    db.run(
      `INSERT INTO products (name, brand, category, description, price, original_price, 
                           stock_quantity, is_new, on_sale, in_stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, brand, category, description, parseFloat(price),
        original_price ? parseFloat(original_price) : null,
        parseInt(stock_quantity) || 0,
        Boolean(is_new), Boolean(on_sale), Boolean(in_stock)
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({ error: 'Gabim në krijimin e produktit' })
        }

        const productId = this.lastID
        console.log('Product created with ID:', productId)

        // Process uploaded images
        if (req.files && req.files.length > 0) {
          console.log('Processing', req.files.length, 'uploaded files')
          
          const imageQueries = req.files.map((file, index) => {
            return new Promise((resolve, reject) => {
              const imageUrl = `/uploads/products/${file.filename}`
              console.log('Saving image:', imageUrl)
              
              db.run(
                'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
                [productId, imageUrl, index + 1],
                (err) => {
                  if (err) {
                    console.error('Error saving image:', err)
                    reject(err)
                  } else {
                    console.log('Image saved:', imageUrl)
                    resolve()
                  }
                }
              )
            })
          })

          Promise.all(imageQueries)
            .then(() => {
              console.log('All images processed successfully')
              res.status(201).json({
                message: 'Produkti u krijua me sukses',
                productId: productId,
                debug: {
                  filesUploaded: req.files.length,
                  fileDetails: req.files.map(f => f.filename)
                }
              })
            })
            .catch((err) => {
              console.error('Error processing images:', err)
              res.status(500).json({ error: 'Produkti u krijua por pati gabim në ruajtjen e fotove' })
            })
        } else {
          console.log('No files uploaded')
          res.status(201).json({
            message: 'Produkti u krijua me sukses',
            productId: productId,
            debug: {
              filesUploaded: 0,
              fileDetails: []
            }
          })
        }
      }
    )
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Update product (admin only)
router.put('/:id', verifyToken, requireAdmin, uploadProductImages, handleUploadError, (req, res) => {
  try {
    const productId = req.params.id
    const {
      name, brand, category, description, price, original_price,
      stock_quantity, is_new, on_sale, in_stock
    } = req.body

    // Update product
    db.run(
      `UPDATE products SET name = ?, brand = ?, category = ?, description = ?, 
                          price = ?, original_price = ?, stock_quantity = ?, 
                          is_new = ?, on_sale = ?, in_stock = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, brand, category, description, parseFloat(price),
        original_price ? parseFloat(original_price) : null,
        parseInt(stock_quantity) || 0,
        Boolean(is_new), Boolean(on_sale), Boolean(in_stock),
        productId
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Gabim në përditësimin e produktit' })
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Produkti nuk u gjet' })
        }

        // If new images uploaded, add them
        if (req.files && req.files.length > 0) {
          const imageQueries = req.files.map((file, index) => {
            return new Promise((resolve, reject) => {
              // Get current max sort_order
              db.get(
                'SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?',
                [productId],
                (err, result) => {
                  if (err) return reject(err)

                  const nextOrder = (result.max_order || -1) + 1
                  db.run(
                    'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
                    [productId, `/uploads/products/${file.filename}`, nextOrder + index],
                    (err) => err ? reject(err) : resolve()
                  )
                }
              )
            })
          })

          Promise.all(imageQueries)
            .then(() => {
              res.json({ message: 'Produkti u përditësua me sukses' })
            })
            .catch(() => {
              res.status(500).json({ error: 'Gabim në ruajtjen e fotove' })
            })
        } else {
          res.json({ message: 'Produkti u përditësua me sukses' })
        }
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Delete product (admin only)
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Gabim në fshirjen e produktit' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Produkti nuk u gjet' })
    }

    res.json({ message: 'Produkti u fshi me sukses' })
  })
})

// Delete product image (admin only)
router.delete('/:id/images/:imageId', verifyToken, requireAdmin, (req, res) => {
  db.run(
    'DELETE FROM product_images WHERE id = ? AND product_id = ?',
    [req.params.imageId, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gabim në fshirjen e fotos' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Foto nuk u gjet' })
      }

      res.json({ message: 'Foto u fshi me sukses' })
    }
  )
})

// Get single product (public) - Must be last to avoid conflicts with other routes
router.get('/:id', (req, res) => {
  const query = `
    SELECT p.*
    FROM products p
    WHERE p.id = ?
  `

  db.get(query, [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e produktit' })
    }

    if (!product) {
      return res.status(404).json({ error: 'Produkti nuk u gjet' })
    }
    // Fetch all images for this product ordered by sort_order
    const imagesQuery = 'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order'
    db.all(imagesQuery, [req.params.id], (imgErr, images) => {
      if (imgErr) {
        return res.status(500).json({ error: 'Gabim në marrjen e fotove të produktit' })
      }

      const imageUrls = (images || []).map(i => i.image_url)

      const processedProduct = {
        ...product,
        images: imageUrls,
        is_new: Boolean(product.is_new),
        on_sale: Boolean(product.on_sale),
        in_stock: Boolean(product.in_stock)
      }

      res.json({ product: processedProduct })
    })
  })
})

module.exports = router
