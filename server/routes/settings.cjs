const express = require('express')
const { db } = require('../config/database.cjs')
const { verifyToken, requireAdmin } = require('../middleware/auth.cjs')

const router = express.Router()

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

module.exports = router
