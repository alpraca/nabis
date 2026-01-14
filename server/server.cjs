const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { initializeDatabase } = require('./config/database.cjs')
const { runAutostart } = require('./autostart/index.cjs')

const app = express()
const PORT = process.env.PORT || 3001

// Rate limiting - DISABLED FOR DEVELOPMENT
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999999, // Essentially unlimited for development
  message: 'Shumë kërkesa nga ky IP, provoni përsëri më vonë.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth rate limiting - DISABLED FOR DEVELOPMENT
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999999, // Essentially unlimited for development
  message: 'Shumë tentativa hyrjeje, provoni përsëri pas 15 minutave.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply rate limiting (disabled in dev)
// app.use(limiter)

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://192.168.0.166:5173',
    'http://192.168.0.166:5174',
    'http://192.168.0.166:5175',
    'http://192.168.100.96:5173',
    'http://192.168.100.96:5174',
    'http://192.168.100.96:5175'
  ], // Allow both localhost and network access
  credentials: true
}))
// Ensure CORS headers are present for all responses (extra safety for dev)
app.use((req, res, next) => {
  // If you prefer to allow any origin during development, change to '*'.
  const allowed = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://192.168.0.166:5173',
    'http://192.168.0.166:5174',
    'http://192.168.0.166:5175',
    'http://192.168.100.96:5173',
    'http://192.168.100.96:5174',
    'http://192.168.100.96:5175'
  ];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Serve public images (for product images)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

// Routes with rate limiting
app.use('/api/auth', authLimiter, require('./routes/auth.cjs'))
app.use('/api/products', require('./routes/products.cjs'))
app.use('/api/brands', require('./routes/brands.cjs'))
app.use('/api/cart', require('./routes/cart.cjs'))
app.use('/api/orders', require('./routes/orders.cjs'))

// Settings routes
app.use('/api/settings', require('./routes/settings.cjs'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nabis Farmaci API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Gabim në server' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route nuk u gjet' })
})

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
      console.log(`🌐 Network: http://192.168.100.96:${PORT}`)
      console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`)
      console.log(`🗄️  Database: ${path.join(__dirname, 'database.sqlite')}`)
      
      // Run autostart tasks after server is up
      runAutostart().catch(err => {
        console.error('⚠️  Autostart encountered an error:', err.message)
      })
    })
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  })

module.exports = app
