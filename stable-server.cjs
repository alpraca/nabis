const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcryptjs')
const path = require('path')
const crypto = require('crypto')

// Load environment variables
require('dotenv').config()

// Email service
const { 
  sendOrderVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail 
} = require('./server/services/emailService.cjs')

console.log('🚀 Starting stable server...')

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  Email credentials not configured. Using mock service.')
} else {
  console.log('📧 Real email service enabled with Gmail')
}

// Use real email service
const emailService = {
  sendOrderVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail
};

const app = express()
const PORT = 3001

// Database setup
const dbPath = path.join(__dirname, 'server', 'database.sqlite')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message)
  } else {
    console.log('✅ Connected to SQLite database')
  }
})

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'server', 'uploads')))

// Health check
app.get('/api/health', (req, res) => {
  console.log('📥 GET /api/health')
  res.json({ status: 'OK', message: 'Nabis Farmaci API is running', port: PORT })
})

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('📥 POST /api/auth/login:', req.body)
  const { email, password } = req.body

  if (!email || !password) {
    console.log('❌ Missing email or password')
    return res.status(400).json({ error: 'Email dhe fjalëkalimi janë të detyrueshëm' })
  }

  const query = 'SELECT * FROM users WHERE email = ?'
  db.get(query, [email], async (err, user) => {
    if (err) {
      console.error('❌ Database error:', err)
      return res.status(500).json({ error: 'Gabim në bazën e të dhënave' })
    }

    if (!user) {
      console.log('❌ User not found:', email)
      return res.status(401).json({ error: 'Email ose fjalëkalimi i gabuar' })
    }

    try {
      console.log('🔍 Checking password for user:', email)
      const isValid = await bcrypt.compare(password, user.password)
      
      if (!isValid) {
        console.log('❌ Invalid password for user:', email)
        return res.status(401).json({ error: 'Email ose fjalëkalimi i gabuar' })
      }

      console.log('✅ Login successful for user:', email)
      const token = 'stable-token-' + Date.now()
      
      res.json({
        message: 'Hyrja e suksesshme',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user'
        }
      })
    } catch (error) {
      console.error('❌ Password comparison error:', error)
      res.status(500).json({ error: 'Gabim në server' })
    }
  })
})

// Token verification endpoint
app.get('/api/auth/verify', (req, res) => {
  console.log('📥 GET /api/auth/verify')
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    console.log('❌ No token provided')
    return res.status(401).json({ error: 'Token mungon' })
  }

  // For simplicity, we'll accept any token that starts with 'stable-token-'
  // In production, you'd verify JWT tokens properly
  if (token.startsWith('stable-token-')) {
    // Extract email from localStorage or use a stored session
    // For now, return a success response - the frontend handles user data
    console.log('✅ Token verified successfully')
    res.json({ message: 'Token i vlefshëm', valid: true })
  } else {
    console.log('❌ Invalid token format')
    res.status(401).json({ error: 'Token i pavlefshëm' })
  }
})

// Products endpoints
app.get('/api/products', (req, res) => {
  console.log('📥 GET /api/products')
  
  const query = 'SELECT * FROM products ORDER BY created_at DESC'
  db.all(query, [], (err, products) => {
    if (err) {
      console.error('❌ Database error:', err)
      return res.status(500).json({ error: 'Gabim në bazën e të dhënave' })
    }
    
    console.log(`✅ Found ${products ? products.length : 0} products`)
    res.json({ products: products || [] })
  })
})

// Get best-selling products (simulated by most recent or you can add sales_count field)
app.get('/api/products/best-sellers', (req, res) => {
  console.log('📥 GET /api/products/best-sellers')
  
  // For now, we'll get products ordered by id DESC (newest first) to simulate best sellers
  // In a real app, you'd have a sales_count field and order by that
  const query = 'SELECT * FROM products ORDER BY id DESC LIMIT 8'
  db.all(query, [], (err, products) => {
    if (err) {
      console.error('❌ Database error:', err)
      return res.status(500).json({ error: 'Gabim në bazën e të dhënave' })
    }
    
    console.log(`✅ Found ${products ? products.length : 0} best-selling products`)
    res.json({ products: products || [] })
  })
})

// Get all unique brands
app.get('/api/products/brands', (req, res) => {
  console.log('📥 GET /api/products/brands')
  
  const query = `
    SELECT brand, COUNT(*) as product_count 
    FROM products 
    WHERE brand IS NOT NULL AND brand != "" 
    GROUP BY brand 
    ORDER BY brand
  `
  db.all(query, [], (err, brands) => {
    if (err) {
      console.error('❌ Database error:', err)
      return res.status(500).json({ error: 'Gabim në bazën e të dhënave' })
    }
    
    console.log(`✅ Found ${brands.length} brands with product counts:`, brands.map(b => `${b.brand}: ${b.product_count}`))
    res.json(brands)
  })
})

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params
  console.log(`📥 GET /api/products/${id}`)
  
  if (!id || isNaN(id)) {
    console.log('❌ Invalid product ID:', id)
    return res.status(400).json({ error: 'ID e produktit duhet të jetë numër i vlefshëm' })
  }
  
  const query = 'SELECT * FROM products WHERE id = ?'
  db.get(query, [parseInt(id)], (err, product) => {
    if (err) {
      console.error('❌ Database error:', err)
      return res.status(500).json({ error: 'Gabim në bazën e të dhënave' })
    }
    
    if (!product) {
      console.log(`❌ Product with ID ${id} not found`)
      return res.status(404).json({ error: 'Produkti nuk u gjet' })
    }
    
    console.log(`✅ Found product: ${product.name}`)
    res.json(product)
  })
})

// Get products by brand
app.get('/api/products/brand/:brand', (req, res) => {
  const { brand } = req.params
  console.log(`📥 GET /api/products/brand/${brand}`)
  
  if (!brand || brand === 'undefined') {
    console.log('❌ Brand parameter is missing or undefined')
    return res.status(400).json({ error: 'Brand parameter is required' })
  }
  
  const query = 'SELECT * FROM products WHERE brand = ? ORDER BY created_at DESC'
  db.all(query, [brand], (err, products) => {
    if (err) {
      console.error('❌ Database error:', err)
      return res.status(500).json({ error: 'Gabim në bazën e të dhënave' })
    }
    
    console.log(`✅ Found ${products ? products.length : 0} products for brand "${brand}"`)
    res.json(products || [])
  })
})

// In-memory storage for verification codes and reset tokens
const verificationCodes = new Map(); // email -> { code, expires, type, data }
const resetTokens = new Map(); // token -> { email, expires }

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('📥 POST /api/auth/register:', req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Të gjitha fushat janë të detyrueshme' });
  }

  try {
    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Përdoruesi me këtë email ekziston tashmë' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store verification data
    verificationCodes.set(email, {
      code: verificationCode,
      expires,
      type: 'registration',
      data: { name, email, password }
    });

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(email, verificationCode, name);
    
    if (emailResult.success) {
      console.log(`✅ Verification email sent to ${email}`);
      res.json({ 
        message: 'Kodi i verifikimit u dërgua në email. Kontrolloni inbox-in tuaj.',
        success: true 
      });
    } else {
      console.error('❌ Failed to send verification email:', emailResult.error);
      res.status(500).json({ error: 'Gabim në dërgimin e email-it' });
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// Verify registration code
app.post('/api/auth/verify-registration', async (req, res) => {
  console.log('📥 POST /api/auth/verify-registration:', req.body);
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email dhe kodi janë të detyrueshëm' });
  }

  const verification = verificationCodes.get(email);
  
  if (!verification || verification.type !== 'registration') {
    return res.status(400).json({ error: 'Kodi i verifikimit nuk u gjet' });
  }

  if (Date.now() > verification.expires) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Kodi i verifikimit ka skaduar' });
  }

  if (verification.code !== code) {
    return res.status(400).json({ error: 'Kodi i verifikimit është i gabuar' });
  }

  try {
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(verification.data.password, 10);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [verification.data.name, verification.data.email, hashedPassword, 'user'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Remove verification code
    verificationCodes.delete(email);

    console.log(`✅ User registered successfully: ${email}`);
    res.json({ 
      message: 'Regjistrimi u përfundua me sukses! Mund të hyni në llogari tani.',
      success: true 
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ error: 'Gabim në krijimin e llogarisë' });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  console.log('📥 POST /api/auth/forgot-password:', req.body);
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email është i detyrueshëm' });
  }

  try {
    // Check if user exists
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT name, email FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Përdoruesi me këtë email nuk ekziston' });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store reset token
    resetTokens.set(resetToken, {
      email,
      expires
    });

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(email, resetToken, user.name);
    
    if (emailResult.success) {
      console.log(`✅ Password reset email sent to ${email}`);
      res.json({ 
        message: 'Linku për rivendosjen e fjalëkalimit u dërgua në email.',
        success: true 
      });
    } else {
      console.error('❌ Failed to send password reset email:', emailResult.error);
      res.status(500).json({ error: 'Gabim në dërgimin e email-it' });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  console.log('📥 POST /api/auth/reset-password:', req.body);
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token dhe fjalëkalimi i ri janë të detyrueshëm' });
  }

  const resetData = resetTokens.get(token);
  
  if (!resetData) {
    return res.status(400).json({ error: 'Token i pavlefshëm' });
  }

  if (Date.now() > resetData.expires) {
    resetTokens.delete(token);
    return res.status(400).json({ error: 'Token ka skaduar' });
  }

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, updated_at = datetime("now") WHERE email = ?',
        [hashedPassword, resetData.email],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Remove reset token
    resetTokens.delete(token);

    console.log(`✅ Password reset successfully for: ${resetData.email}`);
    res.json({ 
      message: 'Fjalëkalimi u rivendos me sukses! Mund të hyni në llogari tani.',
      success: true 
    });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ error: 'Gabim në rivendosjen e fjalëkalimit' });
  }
});

// In-memory cart storage (for demonstration - in production use database)
const userCarts = new Map(); // userId -> cart items

// Cart endpoints
app.get('/api/cart', (req, res) => {
  console.log('📥 GET /api/cart')
  const userId = req.headers['user-id'] || 'guest';
  const cartItems = userCarts.get(userId) || [];
  res.json({ cartItems })
})

app.post('/api/cart/add', (req, res) => {
  console.log('📥 POST /api/cart/add:', req.body)
  const { product_id, quantity = 1 } = req.body;
  const userId = req.headers['user-id'] || 'guest';
  
  if (!product_id) {
    return res.status(400).json({ error: 'Product ID është i detyrueshëm' });
  }
  
  // Get current cart
  const currentCart = userCarts.get(userId) || [];
  
  // Check if product already exists in cart
  const existingItemIndex = currentCart.findIndex(item => item.product_id === product_id);
  
  if (existingItemIndex > -1) {
    // Update quantity if item exists
    currentCart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    const newItem = {
      id: Date.now() + Math.random(), // Simple ID generation
      product_id: parseInt(product_id),
      quantity: parseInt(quantity),
      added_at: new Date().toISOString()
    };
    currentCart.push(newItem);
  }
  
  // Save updated cart
  userCarts.set(userId, currentCart);
  
  console.log(`✅ Added product ${product_id} to cart for user ${userId}. Cart now has ${currentCart.length} items.`);
  res.json({ message: 'Produkti u shtua në shportë', success: true });
})

app.put('/api/cart/:itemId', (req, res) => {
  console.log('📥 PUT /api/cart/:itemId:', req.params.itemId, req.body);
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.headers['user-id'] || 'guest';
  
  const currentCart = userCarts.get(userId) || [];
  const itemIndex = currentCart.findIndex(item => item.id == itemId);
  
  if (itemIndex > -1) {
    currentCart[itemIndex].quantity = parseInt(quantity);
    userCarts.set(userId, currentCart);
    res.json({ message: 'Sasia u përditësua', success: true });
  } else {
    res.status(404).json({ error: 'Produkti nuk u gjet në shportë' });
  }
})

app.delete('/api/cart/:itemId', (req, res) => {
  console.log('📥 DELETE /api/cart/:itemId:', req.params.itemId);
  const { itemId } = req.params;
  const userId = req.headers['user-id'] || 'guest';
  
  const currentCart = userCarts.get(userId) || [];
  const filteredCart = currentCart.filter(item => item.id != itemId);
  
  userCarts.set(userId, filteredCart);
  res.json({ message: 'Produkti u hoq nga shporta', success: true });
})

app.delete('/api/cart', (req, res) => {
  console.log('📥 DELETE /api/cart - Clear cart');
  const userId = req.headers['user-id'] || 'guest';
  
  userCarts.set(userId, []);
  res.json({ message: 'Shporta u zbraze', success: true });
})

// Settings endpoints
app.get('/api/settings/banner/text', (req, res) => {
  console.log('📥 GET /api/settings/banner/text')
  
  const query = 'SELECT value FROM settings WHERE key = "banner_text"'
  db.get(query, [], (err, setting) => {
    if (err) {
      console.error('Database error:', err)
      return res.json({ text: 'Mirësevini në Nabis Farmaci' })
    }
    
    res.json({ text: setting?.value || 'Mirësevini në Nabis Farmaci' })
  })
})

// Orders endpoints
app.post('/api/orders', async (req, res) => {
  console.log('📥 POST /api/orders:', req.body);
  const { customerInfo, items, total } = req.body;
  
  if (!customerInfo || !items || !total) {
    return res.status(400).json({ error: 'Të dhënat e porosisë janë të pakompletuara' });
  }

  try {
    const orderId = 'ORDER-' + Date.now();
    const verificationCode = generateVerificationCode();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store order verification data with proper timestamp
    verificationCodes.set(customerInfo.email, {
      code: verificationCode,
      expires,
      type: 'order',
      data: { 
        orderId, 
        customerInfo, 
        items, 
        total,
        created_at: new Date().toISOString() // Add proper timestamp
      }
    });

    // Send verification email
    const emailResult = await emailService.sendOrderVerificationCode(
      customerInfo.email,
      orderId,
      verificationCode
    );

    if (emailResult.success) {
      console.log(`✅ Order verification email sent for order ${orderId}`);
      res.json({ 
        message: 'Porosia u regjistrua. Kodi i verifikimit u dërgua në email.',
        orderId: orderId,
        success: true 
      });
    } else {
      console.error('❌ Failed to send order verification email:', emailResult.error);
      res.status(500).json({ error: 'Gabim në dërgimin e email-it të verifikimit' });
    }
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// Verify order endpoint
app.post('/api/orders/verify', async (req, res) => {
  console.log('📥 POST /api/orders/verify:', req.body);
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email dhe kodi janë të detyrueshëm' });
  }

  const verification = verificationCodes.get(email);
  
  if (!verification || verification.type !== 'order') {
    return res.status(400).json({ error: 'Kodi i verifikimit për porosi nuk u gjet' });
  }

  if (Date.now() > verification.expires) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Kodi i verifikimit ka skaduar' });
  }

  if (verification.code !== code) {
    return res.status(400).json({ error: 'Kodi i verifikimit është i gabuar' });
  }

  try {
    // Save the verified order to database
    const orderData = verification.data;
    
    // Insert order into database
    const orderResult = await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO orders (
          order_number, name, email, phone,
          shipping_address, shipping_city, notes, total_amount,
          verification_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      stmt.run(
        orderData.orderId,
        orderData.customerInfo.name,
        orderData.customerInfo.email,
        orderData.customerInfo.phone,
        orderData.customerInfo.shipping_address,
        orderData.customerInfo.shipping_city,
        orderData.customerInfo.notes || '',
        orderData.total,
        'verified',
        function(err) {
          if (err) reject(err);
          else resolve({ orderId: orderData.orderId, dbOrderId: this.lastID });
        }
      );
      
      stmt.finalize();
    });

    // Insert order items using the database order ID
    for (const item of orderData.items) {
      await new Promise((resolve, reject) => {
        const stmt = db.prepare(`
          INSERT INTO order_items (
            order_id, product_id, quantity, price, total
          ) VALUES (?, ?, ?, ?, ?)
        `);
        
        // Ensure we have valid price data
        const itemPrice = item.product?.price || 0;
        const itemQuantity = parseInt(item.quantity) || 1;
        const itemTotal = itemQuantity * itemPrice;
        
        stmt.run(
          orderResult.dbOrderId,
          item.product_id,
          itemQuantity,
          itemPrice,
          itemTotal,
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
        
        stmt.finalize();
      });
    }
    
    // Remove verification code
    verificationCodes.delete(email);

    console.log(`✅ Order ${orderData.orderId} verified and saved to database`);
    res.json({ 
      message: 'Porosia u verifikua me sukses! Do të përgatitet për dërgim.',
      orderId: orderData.orderId,
      success: true 
    });
  } catch (error) {
    console.error('❌ Order verification error:', error);
    res.status(500).json({ error: 'Gabim në verifikimin e porosisë' });
  }
});

// Admin endpoints for orders
// Get order statistics
app.get('/api/orders/admin/stats', async (req, res) => {
  console.log('📥 GET /api/orders/admin/stats');
  
  try {
    console.log('🔍 Getting order stats...');
    
    // Get total orders count
    const totalOrders = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
        if (err) {
          console.error('❌ Error counting orders:', err);
          reject(err);
        } else {
          console.log('✅ Total orders:', row.count);
          resolve(row.count);
        }
      });
    });

    // Get total revenue
    const totalRevenue = await new Promise((resolve, reject) => {
      db.get('SELECT SUM(total_amount) as total FROM orders WHERE verification_status = "verified"', (err, row) => {
        if (err) {
          console.error('❌ Error calculating revenue:', err);
          reject(err);
        } else {
          console.log('✅ Total revenue:', row.total || 0);
          resolve(row.total || 0);
        }
      });
    });

    // Get orders by status
    const ordersByStatus = await new Promise((resolve, reject) => {
      db.all('SELECT verification_status as status, COUNT(*) as count FROM orders GROUP BY verification_status', (err, rows) => {
        if (err) {
          console.error('❌ Error getting orders by status:', err);
          reject(err);
        } else {
          console.log('✅ Orders by status:', rows);
          resolve(rows);
        }
      });
    });

    // Get recent orders (last 7 days)
    const recentOrders = await new Promise((resolve, reject) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      db.get('SELECT COUNT(*) as count FROM orders WHERE created_at >= ?', [weekAgo], (err, row) => {
        if (err) {
          console.error('❌ Error getting recent orders:', err);
          reject(err);
        } else {
          console.log('✅ Recent orders:', row.count);
          resolve(row.count);
        }
      });
    });

    const stats = {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders
    };
    
    console.log('✅ Sending stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting order stats:', error);
    res.status(500).json({ error: 'Gabim në marrjen e statistikave' });
  }
});

// Get all orders for admin
app.get('/api/orders/admin/all', async (req, res) => {
  console.log('📥 GET /api/orders/admin/all');
  
  try {
    // First check if we have any orders
    const orderCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (orderCount === 0) {
      console.log('✅ No orders found');
      return res.json([]);
    }

    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, 
               GROUP_CONCAT(
                 oi.product_id || ':' || oi.quantity || ':' || oi.price, 
                 '|'
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Format the orders with items
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items ? order.items.split('|').map(item => {
        const [product_id, quantity, price] = item.split(':');
        return {
          product_id: parseInt(product_id),
          quantity: parseInt(quantity),
          price_per_item: parseFloat(price)
        };
      }) : []
    }));

    console.log(`✅ Found ${formattedOrders.length} orders`);
    res.json(formattedOrders);
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    res.status(500).json({ error: 'Gabim në marrjen e porosive' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack)
  res.status(500).json({ error: 'Gabim në server' })
})

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: 'Route nuk u gjet' })
})

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Stable server running on http://localhost:${PORT}`)
  console.log(`🌐 Network: http://192.168.100.96:${PORT}`)
  console.log(`🗄️  Database: ${dbPath}`)
  
  // Self-test
  setTimeout(() => {
    const http = require('http')
    const req = http.request({ 
      hostname: 'localhost', 
      port: PORT, 
      path: '/api/health',
      timeout: 2000
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log('✅ Self-test successful! Response:', data.substring(0, 100))
      })
    })
    req.on('error', (err) => {
      console.error('❌ Self-test failed:', err.message)
    })
    req.on('timeout', () => {
      console.log('⚠️ Self-test timeout (server still running)')
      req.destroy()
    })
    req.end()
  }, 1000)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop other servers first.`)
    process.exit(1)
  } else {
    console.error('❌ Server error:', err)
  }
})

// Keep server alive - removed SIGINT handler for stability

// Status updates  
setInterval(() => {
  console.log(`🔄 Server running... ${new Date().toLocaleTimeString()}`)
}, 60000) // Every minute
