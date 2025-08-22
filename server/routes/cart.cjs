const express = require('express')
const { db } = require('../config/database.cjs')
const { verifyToken } = require('../middleware/auth.cjs')

const router = express.Router()

// Get user's cart
router.get('/', verifyToken, (req, res) => {
  const query = `
    SELECT ci.*, p.name, p.brand, p.price, p.in_stock,
           pi.image_url as primary_image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `

  db.all(query, [req.user.id], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e shportës' })
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    res.json({
      cartItems: cartItems.map(item => ({
        ...item,
        in_stock: Boolean(item.in_stock)
      })),
      total: total.toFixed(2),
      itemCount: cartItems.length
    })
  })
})

// Add item to cart
router.post('/add', verifyToken, (req, res) => {
  const { product_id, quantity = 1 } = req.body

  if (!product_id) {
    return res.status(400).json({ error: 'ID e produktit është e detyrueshme' })
  }

  // First check if product exists and is in stock
  db.get('SELECT * FROM products WHERE id = ? AND in_stock = 1', [product_id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në server' })
    }

    if (!product) {
      return res.status(404).json({ error: 'Produkti nuk u gjet ose nuk është në stok' })
    }

    // Check if item already in cart
    db.get(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id],
      (err, existingItem) => {
        if (err) {
          return res.status(500).json({ error: 'Gabim në server' })
        }

        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + parseInt(quantity)
          
          db.run(
            'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newQuantity, existingItem.id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Gabim në përditësimin e shportës' })
              }

              res.json({ message: 'Produkti u përditësua në shportë' })
            }
          )
        } else {
          // Add new item
          db.run(
            'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
            [req.user.id, product_id, parseInt(quantity)],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Gabim në shtimin në shportë' })
              }

              res.status(201).json({ message: 'Produkti u shtua në shportë' })
            }
          )
        }
      }
    )
  })
})

// Update cart item quantity
router.put('/:id', verifyToken, (req, res) => {
  const { quantity } = req.body

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Sasia duhet të jetë të paktën 1' })
  }

  db.run(
    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [parseInt(quantity), req.params.id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gabim në përditësimin e sasisë' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Artikulli nuk u gjet në shportë' })
      }

      res.json({ message: 'Sasia u përditësua' })
    }
  )
})

// Remove item from cart
router.delete('/:id', verifyToken, (req, res) => {
  db.run(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gabim në heqjen nga shporta' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Artikulli nuk u gjet në shportë' })
      }

      res.json({ message: 'Produkti u hoq nga shporta' })
    }
  )
})

// Clear entire cart
router.delete('/', verifyToken, (req, res) => {
  db.run(
    'DELETE FROM cart_items WHERE user_id = ?',
    [req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gabim në pastrimin e shportës' })
      }

      res.json({ message: 'Shporta u pastrua' })
    }
  )
})

// Get cart item count
router.get('/count', verifyToken, (req, res) => {
  db.get(
    'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
    [req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në numërimin e shportës' })
      }

      res.json({ count: result.count })
    }
  )
})

module.exports = router
