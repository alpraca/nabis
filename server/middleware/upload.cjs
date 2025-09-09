const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/products/')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure storage for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Upload destination:', uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp + random + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = 'product-' + uniqueSuffix + path.extname(file.originalname)
    console.log('Generated filename:', filename)
    cb(null, filename)
  }
})

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Vetëm foto janë të lejuara (JPG, PNG, GIF, WebP)'))
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
})

// Upload multiple images for products
const uploadProductImages = upload.array('images', 10) // Max 10 images

// Handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Foto shumë e madhe. Maksimumi 5MB.' })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Shumë foto. Maksimumi 10 foto.' })
    }
  }
  
  if (err) {
    return res.status(400).json({ error: err.message })
  }
  
  next()
}

module.exports = {
  uploadProductImages,
  handleUploadError
}
