const express = require('express')
const app = express()
const PORT = 3002

// Enable CORS for all requests with specific origins
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://192.168.100.96:5173',
    'http://192.168.100.96:5174'
  ]
  
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  console.log('Health check - working!')
  res.json({ status: 'OK', time: new Date().toISOString() })
})

app.get('/api/products', (req, res) => {
  console.log('Products requested - working!')
  res.json({ 
    products: [
      {
        id: 1,
        name: 'Test Product',
        price: 10.99,
        brand: 'Test Brand',
        description: 'Test description',
        images: []
      }
    ]
  })
})

app.get('/api/settings/banner/text', (req, res) => {
  console.log('Banner requested - working!')
  res.json({ 
    bannerText: 'Dërgesa po ditë dhe në ditën e ardhshme | Porosit përpara orës 14:00'
  })
})

// Auth routes for testing
app.post('/api/auth/login', (req, res) => {
  console.log('Login requested:', req.body)
  const { email, password } = req.body
  
  // Simple test login - accept both email formats
  if ((email === 'admin@nabisfarmaci.al' || email === 'admin@nabisfarmaci.com') && password === 'admin123') {
    res.json({
      user: {
        id: 1,
        email: email,
        name: 'Admin',
        role: 'admin'
      },
      token: 'test-token-123'
    })
  } else {
    res.status(401).json({ error: 'Email ose fjalëkalimi gabim' })
  }
})

app.post('/api/auth/register', (req, res) => {
  console.log('Register requested:', req.body)
  res.json({ message: 'Regjistrimi u krye me sukses' })
})

// Token verification endpoint
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (token === 'test-token-123') {
    res.json({
      user: {
        id: 1,
        email: 'admin@nabisfarmaci.com',
        name: 'Admin',
        role: 'admin'
      }
    })
  } else {
    res.status(401).json({ error: 'Token i pavlefshëm' })
  }
})

// Admin Panel endpoints
app.get('/api/orders/admin/stats', (req, res) => {
  console.log('Admin stats requested')
  res.json({
    stats: {
      totalProducts: 25,
      totalOrders: 156,
      verifiedOrders: 134,
      pendingOrders: 22,
      totalUsers: 89,
      totalRevenue: 12450.75
    }
  })
})

app.get('/api/orders/admin/all', (req, res) => {
  console.log('Admin orders requested')
  res.json({
    orders: [
      {
        id: 1,
        order_number: 'ORD-001',
        customer_name: 'Test Customer',
        email: 'test@example.com',
        phone: '069123456',
        status: 'pending',
        verification_status: 'verified',
        total: 45.99,
        created_at: new Date().toISOString(),
        items: [
          { name: 'Test Product', quantity: 2, price: 22.99 }
        ]
      }
    ]
  })
})

app.put('/api/orders/admin/:id/status', (req, res) => {
  const { id } = req.params
  const { status } = req.body
  console.log(`Order ${id} status updated to ${status}`)
  res.json({ success: true, message: 'Status u përditësua' })
})

app.post('/api/products', (req, res) => {
  console.log('New product created:', req.body)
  res.json({ 
    success: true, 
    message: 'Produkti u shtua me sukses',
    product: { id: Date.now(), ...req.body }
  })
})

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params
  console.log(`Product ${id} updated:`, req.body)
  res.json({ 
    success: true, 
    message: 'Produkti u përditësua me sukses'
  })
})

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params
  console.log(`Product ${id} deleted`)
  res.json({ 
    success: true, 
    message: 'Produkti u fshi me sukses'
  })
})

app.put('/api/settings/banner/text', (req, res) => {
  const { bannerText } = req.body
  console.log('Banner updated:', bannerText)
  res.json({ 
    success: true, 
    message: 'Banner u përditësua me sukses'
  })
})

// Also accept POST for banner update (for compatibility)
app.post('/api/settings/banner/text', (req, res) => {
  const { bannerText } = req.body
  console.log('Banner updated via POST:', bannerText)
  res.json({ 
    success: true, 
    message: 'Banner u përditësua me sukses'
  })
})

// Cart endpoint for CartContext
app.get('/api/cart', (req, res) => {
  console.log('Cart requested')
  res.json({ items: [] })
})

app.post('/api/cart/add', (req, res) => {
  console.log('Item added to cart:', req.body)
  res.json({ success: true, message: 'Produkti u shtua në shportë' })
})

// Get all brands
app.get('/api/brands', (req, res) => {
  console.log('Brands requested')
  res.json({
    brands: [
      { id: 1, name: 'La Roche-Posay', slug: 'la-roche-posay', productCount: 15 },
      { id: 2, name: 'Vichy', slug: 'vichy', productCount: 12 },
      { id: 3, name: 'Avène', slug: 'avene', productCount: 8 },
      { id: 4, name: 'Eucerin', slug: 'eucerin', productCount: 10 },
      { id: 5, name: 'CeraVe', slug: 'cerave', productCount: 6 },
      { id: 6, name: 'Bioderma', slug: 'bioderma', productCount: 9 },
      { id: 7, name: 'Pharmaceris', slug: 'pharmaceris', productCount: 7 },
      { id: 8, name: 'Ducray', slug: 'ducray', productCount: 5 }
    ]
  })
})

// Get all categories
app.get('/api/categories', (req, res) => {
  console.log('Categories requested')
  res.json({
    categories: [
      { id: 1, name: 'Dermokozmetikë', slug: 'dermokozmetike' },
      { id: 2, name: 'Higjena', slug: 'higjena' }
    ]
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`)
  console.log(`🔗 Try: http://localhost:${PORT}/api/health`)
})
