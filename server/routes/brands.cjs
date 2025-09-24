const express = require('express')
const { db } = require('../config/database.cjs')

const router = express.Router()

// Get all brands with product counts
router.get('/', (req, res) => {
  const query = `
    SELECT 
      brand,
      COUNT(*) as product_count,
      MIN(price) as min_price,
      MAX(price) as max_price,
      GROUP_CONCAT(DISTINCT category) as categories
    FROM products 
    WHERE brand IS NOT NULL AND brand != '' 
    GROUP BY brand 
    ORDER BY product_count DESC, brand ASC
  `
  
  db.all(query, [], (err, brands) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ error: 'Gabim në server' })
    }

    // Process brands data
    const processedBrands = brands.map(brand => ({
      ...brand,
      categories: brand.categories ? brand.categories.split(',') : [],
      price_range: {
        min: brand.min_price,
        max: brand.max_price
      }
    }))

    res.json({ brands: processedBrands })
  })
})

// Get products by brand
router.get('/:brand', (req, res) => {
  const { brand } = req.params
  const { page = 1, limit = 20, category, sort = 'name' } = req.query
  
  let query = `
    SELECT p.*, 
           GROUP_CONCAT(pi.image_url) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE LOWER(p.brand) = LOWER(?)
  `
  const params = [brand]

  if (category) {
    query += ' AND p.category = ?'
    params.push(category)
  }

  query += ' GROUP BY p.id'

  // Add sorting
  switch (sort) {
    case 'price_asc':
      query += ' ORDER BY p.price ASC'
      break
    case 'price_desc':
      query += ' ORDER BY p.price DESC'
      break
    case 'newest':
      query += ' ORDER BY p.created_at DESC'
      break
    default:
      query += ' ORDER BY p.name ASC'
  }

  // Add pagination
  const offset = (page - 1) * limit
  query += ` LIMIT ? OFFSET ?`
  params.push(parseInt(limit), parseInt(offset))

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ error: 'Gabim në server' })
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products 
      WHERE LOWER(brand) = LOWER(?)` + (category ? ' AND category = ?' : '')
    
    const countParams = category ? [brand, category] : [brand]

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Gabim në server' })
      }

      // Process products
      const processedProducts = products.map(product => ({
        ...product,
        images: product.images ? product.images.split(',') : [],
        formatted_price: `${product.price.toLocaleString('sq-AL')} LEK`
      }))

      res.json({
        products: processedProducts,
        pagination: {
          total: countResult.total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.total / limit)
        },
        brand: {
          name: brand,
          total_products: countResult.total
        }
      })
    })
  })
})

// Get brand statistics
router.get('/:brand/stats', (req, res) => {
  const { brand } = req.params
  
  const query = `
    SELECT 
      COUNT(*) as total_products,
      COUNT(DISTINCT category) as categories_count,
      AVG(price) as avg_price,
      MIN(price) as min_price,
      MAX(price) as max_price,
      SUM(stock_quantity) as total_stock,
      GROUP_CONCAT(DISTINCT category) as categories
    FROM products 
    WHERE LOWER(brand) = LOWER(?)
  `
  
  db.get(query, [brand], (err, stats) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ error: 'Gabim në server' })
    }

    if (!stats || stats.total_products === 0) {
      return res.status(404).json({ error: 'Brandi nuk u gjet' })
    }

    res.json({
      brand: brand,
      stats: {
        ...stats,
        categories: stats.categories ? stats.categories.split(',') : [],
        avg_price: Math.round(stats.avg_price || 0),
        formatted_avg_price: `${Math.round(stats.avg_price || 0).toLocaleString('sq-AL')} LEK`,
        formatted_min_price: `${stats.min_price.toLocaleString('sq-AL')} LEK`,
        formatted_max_price: `${stats.max_price.toLocaleString('sq-AL')} LEK`
      }
    })
  })
})

module.exports = router