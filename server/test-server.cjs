const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3002

// Basic middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://192.168.100.96:5173'
  ],
  credentials: true
}))

app.use(express.json())

// Test route
app.get('/api/health', (req, res) => {
  console.log('Health check requested')
  res.json({ status: 'OK', message: 'Server is running!' })
})

// Test products route
app.get('/api/products', (req, res) => {
  console.log('Products requested')
  res.json({ 
    products: [
      {
        id: 1,
        name: 'Test Product',
        price: 10.99,
        brand: 'Test Brand',
        description: 'Test description',
        images: ['/uploads/test.jpg']
      }
    ]
  })
})

// Banner route
app.get('/api/settings/banner/text', (req, res) => {
  console.log('Banner text requested')
  res.json({ 
    bannerText: 'Dërgesa po ditë dhe në ditën e ardhshme | Porosit përpara orës 14:00'
  })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test Server running on http://localhost:${PORT}`)
  console.log(`🌐 Network: http://192.168.100.96:${PORT}`)
})

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})
