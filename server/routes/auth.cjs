const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const validator = require('validator')
const { db } = require('../config/database.cjs')
const { generateToken, verifyToken, getUserById } = require('../middleware/auth.cjs')
const { sendVerificationEmail, sendPasswordResetEmail, sendTemporaryLoginCode } = require('../services/emailService.cjs')

const router = express.Router()

// Input validation middleware
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emri duhet të jetë midis 2 dhe 50 karaktere')
    .matches(/^[a-zA-ZëçËÇ\s]+$/)
    .withMessage('Emri mund të përmbajë vetëm shkronja dhe hapësira'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email jo i vlefshëm'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Fjalëkalimi duhet të jetë midis 6 dhe 128 karaktere')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Fjalëkalimi duhet të përmbajë të paktën një shkronjë të madhe, një të vogël dhe një numër'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('Numri i telefonit jo i vlefshëm'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Adresa nuk mund të jetë më e gjatë se 200 karaktere'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Qyteti nuk mund të jetë më i gjatë se 50 karaktere')
]

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email jo i vlefshëm'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Fjalëkalimi është i detyrueshëm')
]

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Të dhënat e futura janë të gabuara',
        details: errors.array().map(err => err.msg)
      })
    }

    const { name, email, password, phone, address, city } = req.body

    // Additional security: escape HTML and check for malicious content
    const sanitizedName = validator.escape(name.trim())
    const sanitizedEmail = validator.normalizeEmail(email.trim())
    const sanitizedPhone = phone ? validator.escape(phone.trim()) : null
    const sanitizedAddress = address ? validator.escape(address.trim()) : null
    const sanitizedCity = city ? validator.escape(city.trim()) : null

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [sanitizedEmail], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Gabim në server' })
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Ky email është përdorur tashmë' })
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Store pending registration temporarily (we'll create a pending_registrations table)
      db.run(
        `INSERT OR REPLACE INTO pending_registrations 
         (email, name, password, phone, address, city, verification_code, code_expires) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sanitizedEmail, sanitizedName, hashedPassword, sanitizedPhone, sanitizedAddress, sanitizedCity, verificationCode, codeExpires.toISOString()],
        async function(err) {
          if (err) {
            console.error('Error storing pending registration:', err)
            return res.status(500).json({ error: 'Gabim në ruajtjen e të dhënave' })
          }

          // Send verification code via email
          const emailResult = await sendVerificationEmail(email, verificationCode, name)
          
          if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error)
            return res.status(500).json({ error: 'Gabim në dërgimin e email-it' })
          }

          res.status(200).json({
            message: 'Kodi i verifikimit u dërgua në email-in tuaj',
            email: email,
            requiresVerification: true
          })
        }
      )
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// New endpoint to verify registration code and create account
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email dhe kodi janë të detyrueshëm' })
    }

    // Find pending registration
    db.get(
      'SELECT * FROM pending_registrations WHERE email = ? AND verification_code = ?',
      [email, code],
      (err, pending) => {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({ error: 'Gabim në server' })
        }

        if (!pending) {
          return res.status(400).json({ error: 'Kodi i verifikimit është i gabuar ose ka skaduar' })
        }

        // Check if code has expired
        const now = new Date()
        const expiresAt = new Date(pending.code_expires)
        if (now > expiresAt) {
          return res.status(400).json({ error: 'Kodi i verifikimit ka skaduar' })
        }

        // Create the actual user account
        db.run(
          `INSERT INTO users (name, email, password, phone, address, city, email_verified) 
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [pending.name, pending.email, pending.password, pending.phone, pending.address, pending.city],
          function(err) {
            if (err) {
              console.error('Error creating user:', err)
              return res.status(500).json({ error: 'Gabim në krijimin e llogarisë' })
            }

            // Delete pending registration
            db.run('DELETE FROM pending_registrations WHERE email = ?', [email])

            // Generate login token
            const token = generateToken(this.lastID)

            res.status(201).json({
              message: 'Llogaria u krijua me sukses!',
              token,
              user: {
                id: this.lastID,
                name: pending.name,
                email: pending.email,
                role: 'user'
              }
            })
          }
        )
      }
    )
  } catch (error) {
    console.error('Registration verification error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Të dhënat e futura janë të gabuara',
        details: errors.array().map(err => err.msg)
      })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dhe fjalëkalimi janë të detyrueshëm' })
    }

    // Find user
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në server' })
      }

      if (!user) {
        return res.status(401).json({ error: 'Email ose fjalëkalimi i gabuar' })
      }

      // Check if email is verified
      if (!user.email_verified) {
        return res.status(401).json({ 
          error: 'Ju duhet të verifikoni email-in tuaj para se të hyni',
          requiresVerification: true,
          email: user.email
        })
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ose fjalëkalimi i gabuar' })
      }

      // Generate token
      const token = generateToken(user)

      res.json({
        message: 'Hyrja e suksesshme',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    })
  } catch (error) {
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Përdoruesi nuk u gjet' })
    }
    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, address, city } = req.body

    db.run(
      `UPDATE users SET name = ?, phone = ?, address = ?, city = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, phone, address, city, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Gabim në përditësimin e profilit' })
        }

        res.json({ message: 'Profili u përditësua me sukses' })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Verify token (for frontend to check if user is still logged in)
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user })
})

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token i verifikimit është i nevojshëm' })
    }

    // Find user with this verification token
    db.get(
      'SELECT * FROM users WHERE email_verification_token = ? AND verification_token_expires > ?',
      [token, new Date().toISOString()],
      function(err, user) {
        if (err) {
          return res.status(500).json({ error: 'Gabim në server' })
        }

        if (!user) {
          return res.status(400).json({ error: 'Token i pavlefshëm ose i skaduar' })
        }

        // Update user to verified
        db.run(
          'UPDATE users SET email_verified = 1, email_verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
          [user.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Gabim në verifikimin e email-it' })
            }

            // Generate login token
            const loginToken = generateToken({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            })

            res.json({
              message: 'Email-i u verifikua me sukses!',
              token: loginToken,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            })
          }
        )
      }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email është i nevojshëm' })
    }

    // Find user
    db.get('SELECT * FROM users WHERE email = ? AND email_verified = 0', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në server' })
      }

      if (!user) {
        return res.status(400).json({ error: 'Përdoruesi nuk u gjet ose është tashmë i verifikuar' })
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Update user with new token
      db.run(
        'UPDATE users SET email_verification_token = ?, verification_token_expires = ? WHERE id = ?',
        [verificationToken, tokenExpires.toISOString(), user.id],
        async function(err) {
          if (err) {
            return res.status(500).json({ error: 'Gabim në përditësimin e token-it' })
          }

          // Send verification email
          const emailResult = await sendVerificationEmail(user.email, verificationToken, user.name)
          
          if (!emailResult.success) {
            return res.status(500).json({ error: 'Gabim në dërgimin e email-it' })
          }

          res.json({ message: 'Email-i i verifikimit u dërgua sërish' })
        }
      )
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email është i nevojshëm' })
    }

    // Find user
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në server' })
      }

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: 'Nëse email-i ekziston, do të merrni udhëzime për rivendosjen e fjalëkalimit' })
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Save reset token
      db.run(
        'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
        [resetToken, resetExpires.toISOString(), user.id],
        async function(err) {
          if (err) {
            return res.status(500).json({ error: 'Gabim në server' })
          }

          // Send reset email
          const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name)
          
          if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error)
            return res.status(500).json({ error: 'Gabim në dërgimin e email-it' })
          }

          res.json({ message: 'Udhëzimet për rivendosjen e fjalëkalimit u dërguan në email-in tuaj' })
        }
      )
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ error: 'Token dhe fjalëkalimi i ri janë të nevojshëm' })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Fjalëkalimi duhet të jetë të paktën 6 karaktere' })
    }

    // Find user with valid reset token
    db.get(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
      [token, new Date().toISOString()],
      async function(err, user) {
        if (err) {
          return res.status(500).json({ error: 'Gabim në server' })
        }

        if (!user) {
          return res.status(400).json({ error: 'Token i pavlefshëm ose i skaduar' })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update password and clear reset token
        db.run(
          'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
          [hashedPassword, user.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Gabim në përditësimin e fjalëkalimit' })
            }

            res.json({ message: 'Fjalëkalimi u rivendos me sukses!' })
          }
        )
      }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Request temporary login code
router.post('/request-temp-login', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email është i nevojshëm' })
    }

    // Find user
    db.get('SELECT * FROM users WHERE email = ? AND email_verified = 1', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në server' })
      }

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: 'Nëse email-i ekziston, do të merrni kodin e hyrjes së përkohshme' })
      }

      // Generate 6-digit login code
      const loginCode = Math.floor(100000 + Math.random() * 900000).toString()
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save login code
      db.run(
        'UPDATE users SET temp_login_code = ?, temp_login_expires = ? WHERE id = ?',
        [loginCode, codeExpires.toISOString(), user.id],
        async function(err) {
          if (err) {
            return res.status(500).json({ error: 'Gabim në server' })
          }

          // Send login code email
          const emailResult = await sendTemporaryLoginCode(user.email, loginCode, user.name)
          
          if (!emailResult.success) {
            console.error('Failed to send temp login code:', emailResult.error)
            return res.status(500).json({ error: 'Gabim në dërgimin e email-it' })
          }

          res.json({ message: 'Kodi i hyrjes së përkohshme u dërgua në email-in tuaj' })
        }
      )
    })
  } catch (error) {
    console.error('Request temp login error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

// Login with temporary code
router.post('/login-with-code', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email dhe kodi janë të nevojshëm' })
    }

    // Find user with valid temp login code
    db.get(
      'SELECT * FROM users WHERE email = ? AND temp_login_code = ? AND temp_login_expires > ? AND email_verified = 1',
      [email, code, new Date().toISOString()],
      async function(err, user) {
        if (err) {
          return res.status(500).json({ error: 'Gabim në server' })
        }

        if (!user) {
          return res.status(400).json({ error: 'Kod i pavlefshëm, i skaduar ose email i pasaktë' })
        }

        // Clear the temporary login code (single use)
        db.run(
          'UPDATE users SET temp_login_code = NULL, temp_login_expires = NULL WHERE id = ?',
          [user.id],
          function(err) {
            if (err) {
              console.error('Error clearing temp login code:', err)
              // Continue anyway as login is valid
            }

            // Generate login token
            const token = generateToken({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            })

            res.json({
              message: 'Hyrja e suksesshme me kod të përkohshëm',
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              },
              temporary: true // Flag to indicate this was a temporary login
            })
          }
        )
      }
    )
  } catch (error) {
    console.error('Login with code error:', error)
    res.status(500).json({ error: 'Gabim në server' })
  }
})

module.exports = router
