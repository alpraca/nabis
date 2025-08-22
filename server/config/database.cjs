const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcryptjs')

const dbPath = path.join(__dirname, '../database.sqlite')

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
  } else {
    console.log('✅ Connected to SQLite database')
  }
})

// Initialize database tables
const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          phone TEXT,
          address TEXT,
          city TEXT,
          email_verified BOOLEAN DEFAULT 0,
          email_verification_token TEXT,
          verification_token_expires DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          stock_quantity INTEGER DEFAULT 0,
          is_new BOOLEAN DEFAULT 0,
          on_sale BOOLEAN DEFAULT 0,
          in_stock BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Product images table
      db.run(`
        CREATE TABLE IF NOT EXISTS product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT 0,
          sort_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )
      `)

      // Shopping cart table
      db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
          UNIQUE(user_id, product_id)
        )
      `)

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          order_number TEXT UNIQUE NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT DEFAULT 'cash_on_delivery',
          shipping_address TEXT NOT NULL,
          shipping_city TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          verification_code TEXT,
          verification_status TEXT DEFAULT 'pending',
          verification_attempts INTEGER DEFAULT 0,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `)

      // Settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Pending registrations table
      db.run(`
        CREATE TABLE IF NOT EXISTS pending_registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          city TEXT,
          verification_code TEXT NOT NULL,
          code_expires DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Insert default admin user and settings
      db.run(`
        INSERT OR IGNORE INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, [
        'Administrator',
        'admin@nabisfarmaci.al',
        bcrypt.hashSync('Admin123!', 10),
        'admin'
      ])

      db.run(`
        INSERT OR IGNORE INTO settings (key, value) 
        VALUES (?, ?)
      `, [
        'admin_banner_text',
        'Dërgesa po ditë dhe në ditën e ardhshme | Porosit përpara orës 14:00'
      ])

      // Add email verification columns if they don't exist
      db.run(`
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding email_verified column:', err.message)
        }
      })

      db.run(`
        ALTER TABLE users ADD COLUMN email_verification_token TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding email_verification_token column:', err.message)
        }
      })

      db.run(`
        ALTER TABLE users ADD COLUMN verification_token_expires DATETIME
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding verification_token_expires column:', err.message)
        }
      })

      // Add password reset columns
      db.run(`
        ALTER TABLE users ADD COLUMN reset_password_token TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding reset_password_token column:', err.message)
        }
      })

      db.run(`
        ALTER TABLE users ADD COLUMN reset_password_expires DATETIME
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding reset_password_expires column:', err.message)
        }
      })

      // Add temporary login code columns
      db.run(`
        ALTER TABLE users ADD COLUMN temp_login_code TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding temp_login_code column:', err.message)
        }
      })

      db.run(`
        ALTER TABLE users ADD COLUMN temp_login_expires DATETIME
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding temp_login_expires column:', err.message)
        }
      })

      // Add order verification columns if they don't exist
      db.run(`
        ALTER TABLE orders ADD COLUMN email TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding email column to orders:', err.message)
        }
      })

      db.run(`
        ALTER TABLE orders ADD COLUMN verification_code TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding verification_code column to orders:', err.message)
        }
      })

      db.run(`
        ALTER TABLE orders ADD COLUMN verification_status TEXT DEFAULT 'pending'
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding verification_status column to orders:', err.message)
        }
      })

      db.run(`
        ALTER TABLE orders ADD COLUMN verification_attempts INTEGER DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding verification_attempts column to orders:', err.message)
        }
      })

      console.log('✅ Database tables initialized')
      resolve()
    })
  })
}

module.exports = {
  db,
  initializeDatabase
}
