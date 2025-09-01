const express = require('express')
const { db } = require('../config/database.cjs')
const { verifyToken, requireAdmin } = require('../middleware/auth.cjs')
const { uploadProductImages, handleUploadError } = require('../middleware/upload.cjs')

const router = express.Router()

// Get all products (public)
router.get('/', (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query
  
  let query = `
    SELECT p.*, 
           GROUP_CONCAT(pi.image_url) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE 1=1
  `
  const params = []

  if (category) {
    query += ' AND p.category = ?'
    params.push(category)
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  query += ' GROUP BY p.id ORDER BY p.created_at DESC'
  
  if (limit !== 'all') {
    const offset = (page - 1) * limit
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)
  }

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e produkteve' })
    }

    // Process images
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? product.images.split(',') : [],
      is_new: Boolean(product.is_new),
      on_sale: Boolean(product.on_sale),
      in_stock: Boolean(product.in_stock)
    }))

    res.json({ products: processedProducts })
  })
})

// Get product categories (public)
router.get('/categories/list', (req, res) => {
  db.all(
    'SELECT DISTINCT category FROM products ORDER BY category',
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
  const query = `
    SELECT p.*, 
           GROUP_CONCAT(pi.image_url) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.in_stock = 1
    GROUP BY p.id 
    ORDER BY p.created_at DESC
    LIMIT 8
  `

  db.all(query, [], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e produkteve më të shitura' })
    }

    // Process images
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? product.images.split(',') : [],
      is_new: Boolean(product.is_new),
      on_sale: Boolean(product.on_sale),
      in_stock: Boolean(product.in_stock)
    }))

    res.json({ products: processedProducts })
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

    // Process images
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
          return res.status(500).json({ error: 'Gabim në krijimin e produktit' })
        }

        const productId = this.lastID

        // Insert images if uploaded
        if (req.files && req.files.length > 0) {
          const imageQueries = req.files.map((file, index) => {
            return new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                [productId, `/uploads/products/${file.filename}`, index === 0, index],
                (err) => err ? reject(err) : resolve()
              )
            })
          })

          Promise.all(imageQueries)
            .then(() => {
              res.status(201).json({
                message: 'Produkti u krijua me sukses',
                productId: productId
              })
            })
            .catch(() => {
              res.status(500).json({ error: 'Gabim në ruajtjen e fotove' })
            })
        } else {
          res.status(201).json({
            message: 'Produkti u krijua me sukses',
            productId: productId
          })
        }
      }
    )
  } catch (error) {
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
    SELECT p.*, 
           GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `

  db.get(query, [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e produktit' })
    }

    if (!product) {
      return res.status(404).json({ error: 'Produkti nuk u gjet' })
    }

    const processedProduct = {
      ...product,
      images: product.images ? product.images.split(',') : [],
      is_new: Boolean(product.is_new),
      on_sale: Boolean(product.on_sale),
      in_stock: Boolean(product.in_stock)
    }

    res.json({ product: processedProduct })
  })
})

module.exports = router
