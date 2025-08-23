const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')

console.log('🚀 Starting minimal server...')

const app = express()
const PORT = 3001

// Basic middleware
app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() })
})

// Mock login route for testing
app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body)
  
  const { email, password } = req.body
  
  // Mock response for muratiberti02@gmail.com
  if (email === 'muratiberti02@gmail.com') {
    // This is just for testing - normally we'd check against database
    res.json({
      message: 'Hyrja e suksesshme',
      token: 'mock-token-for-testing',
      user: {
        id: 71,
        name: 'robert murati',
        email: 'muratiberti02@gmail.com',
        role: 'user'
      }
    })
  } else {
    res.status(401).json({ error: 'Email ose fjalëkalimi i gabuar' })
  }
})

// Products route
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: [
      {
        id: 1,
        name: 'Test Product',
        brand: 'Test Brand',
        price: 1000
      }
    ]
  })
})

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on http://localhost:${PORT}`)
  console.log('🔗 Test URLs:')
  console.log(`   GET  http://localhost:${PORT}/api/test`)
  console.log(`   GET  http://localhost:${PORT}/api/products`)
  console.log(`   POST http://localhost:${PORT}/api/auth/login`)
})

// Handle errors
server.on('error', (err) => {
  console.error('❌ Server error:', err)
})

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
})

console.log('🎯 Server setup complete')
