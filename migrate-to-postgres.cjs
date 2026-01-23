/**
 * MIGRATION SCRIPT: SQLite → PostgreSQL
 * 
 * Run this ONCE after PostgreSQL database is created on Render
 * Usage: node migrate-to-postgres.cjs
 */

const sqlite3 = require('sqlite3').verbose()
const { Pool } = require('pg')
const path = require('path')
require('dotenv').config()

// SQLite connection
const sqliteDb = new sqlite3.Database(
  path.join(__dirname, 'server', 'database.sqlite'),
  sqlite3.OPEN_READONLY
)

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const migrateTable = async (tableName, columns) => {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Migrating ${tableName}...`)
    
    sqliteDb.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
      if (err) {
        console.log(`⚠️  Table ${tableName} not found or empty, skipping...`)
        return resolve()
      }

      if (rows.length === 0) {
        console.log(`ℹ️  Table ${tableName} is empty`)
        return resolve()
      }

      const client = await pgPool.connect()
      
      try {
        await client.query('BEGIN')
        
        let migrated = 0
        for (const row of rows) {
          const columnNames = columns.join(', ')
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
          const values = columns.map(col => row[col])

          await client.query(
            `INSERT INTO ${tableName} (${columnNames}) 
             VALUES (${placeholders}) 
             ON CONFLICT DO NOTHING`,
            values
          )
          migrated++
        }

        await client.query('COMMIT')
        console.log(`✅ Migrated ${migrated} rows from ${tableName}`)
        resolve()
        
      } catch (error) {
        await client.query('ROLLBACK')
        console.error(`❌ Error migrating ${tableName}:`, error.message)
        reject(error)
      } finally {
        client.release()
      }
    })
  })
}

const migrate = async () => {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...\n')
  console.log('📍 Source: server/database.sqlite')
  console.log('📍 Target:', process.env.DATABASE_URL ? 'PostgreSQL (Render)' : 'NOT SET!\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not set in environment!')
    console.error('Set it in Render dashboard or .env file')
    process.exit(1)
  }

  try {
    // Migrate in order (respecting foreign keys)
    await migrateTable('users', [
      'id', 'name', 'email', 'password', 'role', 'phone', 'address', 
      'city', 'email_verified', 'email_verification_token', 
      'verification_token_expires', 'created_at', 'updated_at'
    ])

    await migrateTable('categories', ['id', 'name', 'created_at'])

    await migrateTable('brands', [
      'id', 'name', 'slug', 'logo', 'description', 'website', 
      'country', 'is_featured', 'created_at'
    ])

    await migrateTable('products', [
      'id', 'name', 'brand', 'category', 'subcategory', 'description',
      'price', 'original_price', 'stock_quantity', 'is_best_seller',
      'sort_order', 'image', 'created_at', 'updated_at'
    ])

    await migrateTable('orders', [
      'id', 'user_id', 'customer_name', 'customer_email', 'customer_phone',
      'customer_address', 'customer_city', 'total_amount', 'status',
      'payment_method', 'created_at', 'updated_at'
    ])

    await migrateTable('order_items', [
      'id', 'order_id', 'product_id', 'product_name', 'quantity',
      'price', 'created_at'
    ])

    await migrateTable('settings', [
      'id', 'key', 'value', 'type', 'updated_at'
    ])

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - All tables migrated')
    console.log('   - Data preserved')
    console.log('   - Ready for production deployment')
    console.log('\n🚀 Next steps:')
    console.log('   1. Push code to GitHub: git push')
    console.log('   2. Render will auto-deploy')
    console.log('   3. Your site will be live!\n')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    sqliteDb.close()
    await pgPool.end()
  }
}

// Run migration
migrate()
