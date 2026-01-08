const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { db } = require('../config/database.cjs')
const { verifyToken, requireAdmin } = require('../middleware/auth.cjs')

const router = express.Router()

// Configure multer for hero image upload
const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'hero')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `hero-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const heroUpload = multer({
  storage: heroStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Vetëm imazhe janë të lejuara (jpg, png, gif, webp)'))
    }
  }
})

// Get all settings (public for some, admin for others)
router.get('/', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e cilësimeve' })
    }

    const settingsObj = {}
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value
    })

    res.json({ settings: settingsObj })
  })
})

// Get specific setting
router.get('/:key', (req, res) => {
  db.get('SELECT * FROM settings WHERE key = ?', [req.params.key], (err, setting) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e cilësimit' })
    }

    if (!setting) {
      return res.status(404).json({ error: 'Cilësimi nuk u gjet' })
    }

    res.json({ setting })
  })
})

// Update setting (admin only)
router.put('/:key', verifyToken, requireAdmin, (req, res) => {
  const { value } = req.body

  if (!value && value !== '') {
    return res.status(400).json({ error: 'Vlera është e detyrueshme' })
  }

  db.run(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) 
     VALUES (?, ?, CURRENT_TIMESTAMP)`,
    [req.params.key, value],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gabim në përditësimin e cilësimit' })
      }

      res.json({ 
        message: 'Cilësimi u përditësua me sukses',
        setting: { key: req.params.key, value }
      })
    }
  )
})

// Update banner text specifically (supports both PUT and POST)
const updateBannerHandler = (req, res) => {
  const { text, bannerText } = req.body
  const bannerTextValue = text || bannerText

  if (!bannerTextValue) {
    return res.status(400).json({ error: 'Teksti i banner-it është i detyrueshëm' })
  }

  db.run(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) 
     VALUES ('admin_banner_text', ?, CURRENT_TIMESTAMP)`,
    [bannerTextValue],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gabim në përditësimin e banner-it' })
      }

      res.json({ 
        message: 'Banner-i u përditësua me sukses',
        bannerText: bannerTextValue
      })
    }
  )
}

router.put('/banner/text', verifyToken, requireAdmin, updateBannerHandler)
router.post('/banner/text', verifyToken, requireAdmin, updateBannerHandler)

// Get banner text (public)
router.get('/banner/text', (req, res) => {
  db.get(
    'SELECT value FROM settings WHERE key = "admin_banner_text"',
    [],
    (err, setting) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në marrjen e banner-it' })
      }

      const bannerText = setting ? setting.value : 'Dërgesa po ditë dhe në ditën e ardhshme | Porosit përpara orës 14:00'
      res.json({ bannerText })
    }
  )
})

// Upload hero image (admin only)
router.post('/hero/image', verifyToken, requireAdmin, heroUpload.single('heroImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nuk u ngarkua asnjë imazh' })
  }

  const imageUrl = `/uploads/hero/${req.file.filename}`

  // Delete old hero image if exists
  db.get('SELECT value FROM settings WHERE key = "hero_image"', [], (err, oldSetting) => {
    if (!err && oldSetting && oldSetting.value) {
      const oldImagePath = path.join(__dirname, '..', oldSetting.value)
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
    }

    // Save new image path to database
    db.run(
      `INSERT OR REPLACE INTO settings (key, value, updated_at) 
       VALUES ('hero_image', ?, CURRENT_TIMESTAMP)`,
      [imageUrl],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Gabim në ruajtjen e imazhit' })
        }

        res.json({ 
          message: 'Imazhi u ngarkua me sukses',
          imageUrl
        })
      }
    )
  })
})

// Get hero image (public)
router.get('/hero/image', (req, res) => {
  db.get('SELECT value FROM settings WHERE key = "hero_image"', [], (err, setting) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e imazhit' })
    }

    res.json({ imageUrl: setting ? setting.value : null })
  })
})

// Delete hero image (admin only)
router.delete('/hero/image', verifyToken, requireAdmin, (req, res) => {
  db.get('SELECT value FROM settings WHERE key = "hero_image"', [], (err, setting) => {
    if (err) {
      return res.status(500).json({ error: 'Gabim në marrjen e imazhit' })
    }

    if (!setting || !setting.value) {
      return res.status(404).json({ error: 'Nuk ka imazh për të fshirë' })
    }

    // Delete file from disk
    const imagePath = path.join(__dirname, '..', setting.value)
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }

    // Remove from database
    db.run('DELETE FROM settings WHERE key = "hero_image"', [], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Gabim në fshirjen e imazhit' })
      }

      res.json({ message: 'Imazhi u fshi me sukses' })
    })
  })
})

module.exports = router
