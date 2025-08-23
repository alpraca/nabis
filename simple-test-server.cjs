const express = require('express')
const cors = require('cors')

console.log('🚀 Starting simple server...')

const app = express()
const PORT = 3001

// Basic middleware
app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}))

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' })
})

// Auth test route
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body)
  res.json({ message: 'Login endpoint reached', data: req.body })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Simple server running on http://localhost:${PORT}`)
  console.log('🔗 Test URL: http://localhost:3001/api/test')
})

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
})
