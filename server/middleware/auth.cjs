const jwt = require('jsonwebtoken')
const { db } = require('../config/database.cjs')

const JWT_SECRET = process.env.JWT_SECRET || 'nabis-farmaci-secret-2025'

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token i kërkuar' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token i pavlefshëm' })
    }

    req.user = decoded
    next()
  })
}

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Qasje e ndaluar. Vetëm admin.' })
  }
  next()
}

// Get user from database
const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, name, email, role, phone, address, city FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) reject(err)
        else resolve(user)
      }
    )
  })
}

module.exports = {
  generateToken,
  verifyToken,
  requireAdmin,
  getUserById,
  JWT_SECRET
}
