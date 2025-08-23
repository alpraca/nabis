const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'server', 'database.sqlite')
const db = new sqlite3.Database(dbPath)

const brandProducts = [
  {
    name: 'Roche Accu-Chek Active Glukometer',
    description: 'Glukometër modern për matjen e sheqerit në gjak me saktësi të lartë',
    price: 4500,
    brand: 'Roche',
    category: 'Pajisje Medicinale',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'La Roche-Posay Anthelios Ultra Cover SPF60',
    description: 'Krem mbrojtës nga dielli me faktor të lartë mbrojtjeje për lëkurën e ndjeshme',
    price: 2800,
    brand: 'La Roche-Posay',
    category: 'Dermatologji',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Vichy Mineral 89 Serum',
    description: 'Serum hidrues me ujë termal Vichy dhe acid hialuronik për lëkurën e dehidruar',
    price: 3200,
    brand: 'Vichy',
    category: 'Kujdes i Lëkurës',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Avène Eau Thermale Spray',
    description: 'Ujë termal natyror që qetëson dhe lehtëson lëkurën e irrituar dhe të ndjeshme',
    price: 1800,
    brand: 'Avène',
    category: 'Produkte të Buta',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Eucerin AtopiControl Krem',
    description: 'Krem i specializuar për lëkurën me tendencë atopike dhe ekzemë',
    price: 2400,
    brand: 'Eucerin',
    category: 'Shkencë për Lëkurën',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Bioderma Sensibio H2O Micellar Water',
    description: 'Ujë micelar për pastrimin e butë të lëkurës së ndjeshme pa fërkje',
    price: 2200,
    brand: 'Bioderma',
    category: 'Biologi në Shërbim',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Nuxe Huile Prodigieuse',
    description: 'Vaj shumëfunksional për fytyrën, trupin dhe flokët me përbërës natyrorë',
    price: 2600,
    brand: 'Nuxe',
    category: 'Bukuria Natyrale',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Ducray Anaphase+ Shampoo',
    description: 'Shampo stimulues për rritjen e flokëve dhe forcimin e tyre',
    price: 2000,
    brand: 'Ducray',
    category: 'Specialistë për Flokët',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Uriage Thermal Water Spray',
    description: 'Ujë termal për qetësimin dhe hidrimin e lëkurës së ndjeshme',
    price: 1600,
    brand: 'Uriage',
    category: 'Ujë Termal',
    image_url: '/api/placeholder/400/400'
  },
  {
    name: 'Mustela Hydra Bebe Body Lotion',
    description: 'Locion hidrues i butë i krijuar posaçërisht për lëkurën delikate të bebit',
    price: 1900,
    brand: 'Mustela',
    category: 'Kujdes i Specializuar për Bebat',
    image_url: '/api/placeholder/400/400'
  }
]

// Delete existing products to avoid duplicates
db.run('DELETE FROM products WHERE brand IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  ['Roche', 'La Roche-Posay', 'Vichy', 'Avène', 'Eucerin', 'Bioderma', 'Nuxe', 'Ducray', 'Uriage', 'Mustela'], 
  function(err) {
    if (err) {
      console.error('Error deleting existing brand products:', err)
      return
    }
    
    console.log(`🗑️ Deleted ${this.changes} existing brand products`)
    
    // Insert new products
    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, brand, category, stock_quantity, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 50, datetime('now'), datetime('now'))
    `)
    
    let insertedCount = 0
    
    brandProducts.forEach((product, index) => {
      stmt.run([
        product.name,
        product.description,
        product.price,
        product.brand,
        product.category
      ], function(err) {
        if (err) {
          console.error(`❌ Error inserting ${product.brand} product:`, err)
        } else {
          console.log(`✅ Added ${product.brand} product: ${product.name}`)
          insertedCount++
        }
        
        if (insertedCount + (brandProducts.length - insertedCount) === brandProducts.length) {
          stmt.finalize()
          
          // Verify the inserts
          db.all(`
            SELECT brand, COUNT(*) as count 
            FROM products 
            WHERE brand IN ('Roche', 'La Roche-Posay', 'Vichy', 'Avène', 'Eucerin', 'Bioderma', 'Nuxe', 'Ducray', 'Uriage', 'Mustela')
            GROUP BY brand 
            ORDER BY brand
          `, (err, rows) => {
            if (err) {
              console.error('Error verifying products:', err)
            } else {
              console.log('\n📊 Brand Product Summary:')
              rows.forEach(row => {
                console.log(`   ${row.brand}: ${row.count} product(s)`)
              })
              
              console.log(`\n🎉 Successfully added products for ${insertedCount} brands!`)
              console.log('🔗 These products will now link to their respective brand pages when clicked')
            }
            
            db.close()
          })
        }
      })
    })
})
