const express = require('express')
const cors = require('cors')
const path = require('path')

console.log('🚀 Starting complete server on port 3002...')

const app = express()
const PORT = 3003  // Different port

// Initialize database path
const serverDir = path.join(__dirname, 'server')

// Basic middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],  // Specific origins instead of '*'
  credentials: true
}))

// Serve uploaded files
app.use('/uploads', express.static(path.join(serverDir, 'uploads')))

// Simple test route
app.get('/test', (req, res) => {
  console.log('📥 GET /test request received')
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    port: PORT
  })
})

// Include all routes from server directory
try {
  app.use('/api/auth', require('./server/routes/auth.cjs'))
  app.use('/api/products', require('./server/routes/products.cjs'))
  app.use('/api/cart', require('./server/routes/cart.cjs'))
  app.use('/api/orders', require('./server/routes/orders.cjs'))
  app.use('/api/settings', require('./server/routes/settings.cjs'))
  console.log('✅ All routes loaded successfully')
} catch (error) {
  console.error('❌ Error loading routes:', error.message)
  
  // Fallback routes for testing
  app.post('/api/auth/login', (req, res) => {
    console.log('📥 POST /api/auth/login request received:', req.body)
    const { email, password } = req.body
    
    if (email === 'muratiberti02@gmail.com') {
      res.json({
        message: 'Hyrja e suksesshme',
        token: 'test-token-123',
        user: {
          id: 71,
          name: 'robert murati',
          email: 'muratiberti02@gmail.com',
          role: 'user'
        }
      })
    } else if (email === 'admin@gmail.com') {
      res.json({
        message: 'Hyrja e suksesshme',
        token: 'admin-token-123',
        user: {
          id: 1,
          name: 'Admin',
          email: 'admin@gmail.com',
          role: 'admin'
        }
      })
    } else {
      res.status(401).json({ error: 'Email ose fjalëkalimi i gabuar' })
    }
  })

  // Cart endpoints
  app.get('/api/cart', (req, res) => {
    console.log('📥 GET /api/cart')
    res.json({ items: [] })
  })

  app.post('/api/cart/add', (req, res) => {
    console.log('📥 POST /api/cart/add:', req.body)
    res.json({ message: 'Produkti u shtua në shportë' })
  })

  // Products endpoints
  app.get('/api/products', (req, res) => {
    console.log('📥 GET /api/products')
    res.json([
      {
        id: 1,
        name: 'Test Product 1',
        price: 1500,
        image: '/uploads/products/test1.jpg',
        description: 'Test product description',
        brand: 'Test Brand',
        category: 'skincare'
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: 2500,
        image: '/uploads/products/test2.jpg',
        description: 'Another test product',
        brand: 'Test Brand',
        category: 'makeup'
      }
    ])
  })

  // Settings endpoints
  app.get('/api/settings/banner/text', (req, res) => {
    console.log('📥 GET /api/settings/banner/text')
    res.json({ text: 'Mirësevini në Nabis Farmaci - Test Mode' })
  })
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nabis Farmaci API is running on port 3002' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Gabim në server' })
})

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: 'Route nuk u gjet' })
})

// Keep the server alive
const server = app.listen(PORT, () => {
  console.log(`✅ Complete server running on http://localhost:${PORT}`)
  console.log('🔗 Test: http://localhost:3003/test')
  console.log('🔗 Health: http://localhost:3003/api/health')
  
  // Test the server itself
  setTimeout(() => {
    const http = require('http')
    const req = http.request({ hostname: 'localhost', port: PORT, path: '/test' }, (res) => {
      console.log('✅ Self-test successful!')
    })
    req.on('error', (err) => {
      console.error('❌ Self-test failed:', err.message)
    })
    req.end()
  }, 1000)
})

server.on('error', (err) => {
  console.error('❌ Server error:', err)
})

// Keep process alive
setInterval(() => {
  console.log('🔄 Server still running...', new Date().toLocaleTimeString())
}, 30000)
