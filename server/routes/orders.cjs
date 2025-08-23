const express = require('express')
const crypto = require('crypto')
const { db } = require('../config/database.cjs')
const { verifyToken, requireAdmin } = require('../middleware/auth.cjs')
const { sendOrderConfirmationEmail, sendOrderVerificationCode } = require('../services/emailService.cjs')

const router = express.Router()

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `NF${timestamp.slice(-6)}${random}`
}

// Create new order
router.post('/', verifyToken, (req, res) => {
  const { name, email, shipping_address, shipping_city, phone, notes = '' } = req.body

  if (!email || !shipping_address || !shipping_city || !phone) {
    return res.status(400).json({ error: 'Email-i, adresa, qyteti dhe telefoni janë të detyrueshëm' })
  }

  // Get user's cart
  const cartQuery = `
    SELECT ci.*, p.price, p.name, p.in_stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `

  db.all(cartQuery, [req.user.id], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e shportës' })
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Shporta është bosh' })
    }

    // Check if all items are in stock
    const outOfStockItems = cartItems.filter(item => !item.in_stock)
    if (outOfStockItems.length > 0) {
      return res.status(400).json({ 
        error: 'Disa produkte nuk janë në stok',
        outOfStockItems: outOfStockItems.map(item => item.name)
      })
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const orderNumber = generateOrderNumber()
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Start transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      // Create order
      db.run(
        `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, 
                           shipping_city, phone, notes, email, verification_code, verification_status, name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, orderNumber, totalAmount, shipping_address, shipping_city, phone, notes, email, verificationCode, 'pending', name || ''],
        function(err) {
          if (err) {
            db.run('ROLLBACK')
            return res.status(500).json({ error: 'Gabim në krijimin e porosisë' })
          }

          const orderId = this.lastID

          // Create order items
          const orderItemPromises = cartItems.map(item => {
            return new Promise((resolve, reject) => {
              const itemTotal = item.price * item.quantity
              db.run(
                `INSERT INTO order_items (order_id, product_id, quantity, price, total)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price, itemTotal],
                (err) => err ? reject(err) : resolve()
              )
            })
          })

          Promise.all(orderItemPromises)
            .then(() => {
              // Clear cart
              db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id], (err) => {
                if (err) {
                  db.run('ROLLBACK')
                  return res.status(500).json({ error: 'Gabim në pastrimin e shportës' })
                }

                // Update product stock
                const stockUpdates = cartItems.map(item => {
                  return new Promise((resolve, reject) => {
                    db.run(
                      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                      [item.quantity, item.product_id],
                      (err) => err ? reject(err) : resolve()
                    )
                  })
                })

                Promise.all(stockUpdates)
                  .then(async () => {
                    db.run('COMMIT')
                    
                    // Send order verification code email only
                    try {
                      await sendOrderVerificationCode(email, orderNumber, verificationCode)
                      console.log('✅ Order verification code sent')
                    } catch (emailError) {
                      console.error('❌ Failed to send verification code:', emailError)
                      // Continue with success response even if email fails
                    }
                    
                    // Don't send order confirmation email yet - only send after verification
                    
                    res.status(201).json({
                      message: 'Porosia u krijua me sukses. Kodi i verifikimit u dërgua në email.',
                      orderNumber,
                      orderId,
                      totalAmount,
                      verificationRequired: true,
                      email: email
                    })
                  })
                  .catch(() => {
                    db.run('ROLLBACK')
                    res.status(500).json({ error: 'Gabim në përditësimin e stokut' })
                  })
              })
            })
            .catch(() => {
              db.run('ROLLBACK')
              res.status(500).json({ error: 'Gabim në krijimin e artikujve të porosisë' })
            })
        }
      )
    })
  })
})

// Get user's orders
router.get('/my-orders', verifyToken, (req, res) => {
  const query = `
    SELECT o.*, 
           COUNT(oi.id) as item_count,
           GROUP_CONCAT(p.name) as product_names
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `

  db.all(query, [req.user.id], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e porosive' })
    }

    res.json({ orders })
  })
})

// Get single order details
router.get('/:id', verifyToken, (req, res) => {
  const orderId = req.params.id

  // Get order info
  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, req.user.id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në marrjen e porosisë' })
      }

      if (!order) {
        return res.status(404).json({ error: 'Porosia nuk u gjet' })
      }

      // Get order items
      const itemsQuery = `
        SELECT oi.*, p.name, p.brand
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `

      db.all(itemsQuery, [orderId], (err, items) => {
        if (err) {
          return res.status(500).json({ error: 'Gabim në marrjen e artikujve' })
        }

        res.json({
          order: {
            ...order,
            items
          }
        })
      })
    }
  )
})

// Admin: Get all orders
router.get('/admin/all', verifyToken, requireAdmin, (req, res) => {
  const { status, verification_status, page = 1, limit = 20 } = req.query

  let query = `
    SELECT o.*, u.name as user_name, u.email as user_email,
           COUNT(oi.id) as item_count
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE 1=1
  `
  const params = []

  if (status) {
    query += ' AND o.status = ?'
    params.push(status)
  }

  if (verification_status) {
    query += ' AND o.verification_status = ?'
    params.push(verification_status)
  }

  query += ' GROUP BY o.id ORDER BY o.order_number DESC'

  if (limit !== 'all') {
    const offset = (page - 1) * limit
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)
  }

  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e porosive' })
    }

    res.json({ orders })
  })
})

// Admin: Update order status
router.put('/admin/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { status } = req.body
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status i pavlefshëm' })
  }

  db.run(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gabim në përditësimin e statusit' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Porosia nuk u gjet' })
      }

      res.json({ message: 'Statusi u përditësua me sukses' })
    }
  )
})

// Get order statistics (admin)
router.get('/admin/stats', verifyToken, requireAdmin, (req, res) => {
  const queries = {
    totalOrders: 'SELECT COUNT(*) as count FROM orders',
    pendingOrders: 'SELECT COUNT(*) as count FROM orders WHERE verification_status = "pending"',
    verifiedOrders: 'SELECT COUNT(*) as count FROM orders WHERE verification_status = "verified"',
    totalRevenue: 'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE verification_status = "verified"',
    totalProducts: 'SELECT COUNT(*) as count FROM products',
    totalUsers: 'SELECT COUNT(*) as count FROM users WHERE role != "admin"'
  }

  const results = {}
  const queryPromises = Object.entries(queries).map(([key, query]) => {
    return new Promise((resolve, reject) => {
      db.get(query, [], (err, result) => {
        if (err) reject(err)
        else {
          results[key] = result.count || result.total || 0
          resolve()
        }
      })
    })
  })

  Promise.all(queryPromises)
    .then(() => {
      res.json({ 
        stats: {
          totalOrders: results.totalOrders,
          pendingOrders: results.pendingOrders,
          verifiedOrders: results.verifiedOrders,
          totalRevenue: parseFloat(results.totalRevenue).toFixed(2),
          totalProducts: results.totalProducts,
          totalUsers: results.totalUsers
        }
      })
    })
    .catch(() => {
      res.status(500).json({ error: 'Gabim në marrjen e statistikave' })
    })
})

// Verify order with verification code
router.post('/verify', (req, res) => {
  const { orderNumber, verificationCode } = req.body

  if (!orderNumber || !verificationCode) {
    return res.status(400).json({ error: 'Numri i porosisë dhe kodi i verifikimit janë të nevojshëm' })
  }

  // Find order with verification code
  db.get(
    'SELECT * FROM orders WHERE order_number = ? AND verification_status = ?',
    [orderNumber, 'pending'],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në server' })
      }

      if (!order) {
        return res.status(400).json({ error: 'Porosia nuk u gjet ose është tashmë e verifikuar' })
      }

      // Check if order is already cancelled due to too many attempts
      if (order.verification_status === 'cancelled') {
        return res.status(400).json({ error: 'Porosia është anulluar për shkak të tentativave të shumta të gabuara' })
      }

      // Check if verification code is correct
      if (order.verification_code !== verificationCode) {
        // Increment verification attempts
        const newAttempts = (order.verification_attempts || 0) + 1
        const maxAttempts = 3

        if (newAttempts >= maxAttempts) {
          // Cancel order after 3 failed attempts
          db.run(
            'UPDATE orders SET verification_status = ?, verification_attempts = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['cancelled', newAttempts, order.id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Gabim në server' })
              }

              // Restore product stock since order is cancelled
              const restoreStockQuery = `
                UPDATE products 
                SET stock_quantity = stock_quantity + (
                  SELECT quantity FROM order_items WHERE order_id = ? AND product_id = products.id
                )
                WHERE id IN (SELECT product_id FROM order_items WHERE order_id = ?)
              `
              
              db.run(restoreStockQuery, [order.id, order.id], (err) => {
                if (err) {
                  console.error('Error restoring stock:', err)
                }
              })

              return res.status(400).json({ 
                error: `Kodi i verifikimit është i gabuar. Porosia u anullua pas ${maxAttempts} tentativave të gabuara.`,
                orderCancelled: true,
                remainingAttempts: 0
              })
            }
          )
        } else {
          // Update attempts count
          db.run(
            'UPDATE orders SET verification_attempts = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newAttempts, order.id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Gabim në server' })
              }

              const remainingAttempts = maxAttempts - newAttempts
              return res.status(400).json({ 
                error: `Kodi i verifikimit është i gabuar. Ju keni ${remainingAttempts} tentativa të tjera.`,
                remainingAttempts: remainingAttempts
              })
            }
          )
        }
        return
      }

      // Verification code is correct - proceed with verification
      db.run(
        'UPDATE orders SET verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['verified', order.id],
        async function(err) {
          if (err) {
            return res.status(500).json({ error: 'Gabim në verifikim' })
          }

          // After successful verification, send order confirmation email
          try {
            // Get order items for the confirmation email
            const itemsQuery = `
              SELECT oi.*, p.name
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              WHERE oi.order_id = ?
            `
            
            db.all(itemsQuery, [order.id], async (err, orderItems) => {
              if (!err && orderItems) {
                const orderData = {
                  orderId: order.order_number,
                  items: orderItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price.toFixed(2)
                  })),
                  total: order.total_amount.toFixed(2),
                  shippingAddress: `${order.shipping_address}, ${order.shipping_city}`,
                  phoneNumber: order.phone
                }

                // Get user name for the email
                db.get('SELECT name FROM users WHERE id = ?', [order.user_id], async (err, user) => {
                  if (!err && user) {
                    try {
                      await sendOrderConfirmationEmail(order.email, orderData, user.name)
                      console.log('✅ Order confirmation email sent after verification')
                    } catch (emailError) {
                      console.error('❌ Failed to send order confirmation email:', emailError)
                    }
                  }
                })
              }
            })
          } catch (emailError) {
            console.error('❌ Failed to send order confirmation email:', emailError)
          }

          res.json({
            message: 'Porosia u verifikua me sukses!',
            orderNumber: order.order_number,
            verified: true
          })
        }
      )
    }
  )
})

module.exports = router
