const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/database.sqlite');

console.log('🚀 Loading sample products and brands...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Sample products data
const sampleProducts = [
  {
    name: 'La Roche-Posay Effaclar H Multi-Compensating Soothing Moisturizer',
    brand: 'La Roche-Posay',
    category: 'fytyre',
    description: 'Krem me efekt qetësues dhe hidratues për lëkurën e irrituar nga trajtimet anti-akne. Përmban niacinamide dhe aqua posae filiformis për të riequilibruar lëkurën.',
    price: 2850.00,
    original_price: 3200.00,
    stock_quantity: 25,
    is_new: 1,
    on_sale: 1,
    in_stock: 1
  },
  {
    name: 'CeraVe Hydrating Foaming Oil Cleanser',
    brand: 'CeraVe',
    category: 'fytyre',
    description: 'Pastrues me vaj që shndërrohet në shkumë për pastrimin e thellë dhe hidrimin e lëkurës. Përmban ceramide dhe acid hyaluronic.',
    price: 1890.00,
    original_price: null,
    stock_quantity: 40,
    is_new: 0,
    on_sale: 0,
    in_stock: 1
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'fytyre',
    description: 'Serum me 10% niacinamide dhe 1% zinc për të kontrolluar prodhimin e vajit dhe për të minimizuar poret e dukshme.',
    price: 890.00,
    original_price: null,
    stock_quantity: 60,
    is_new: 1,
    on_sale: 0,
    in_stock: 1
  },
  {
    name: 'Eucerin Sun Cream SPF 50+',
    brand: 'Eucerin',
    category: 'spf',
    description: 'Krem dielli me mbrojtje të lartë SPF 50+ për fytyrë dhe trup. Formula rezistente ndaj ujit.',
    price: 2200.00,
    original_price: 2450.00,
    stock_quantity: 30,
    is_new: 0,
    on_sale: 1,
    in_stock: 1
  },
  {
    name: 'Vichy Liftactiv Supreme Vitamin C Serum',
    brand: 'Vichy',
    category: 'fytyre',
    description: 'Serum me vitamin C 15% dhe rhamnose për anti-aging dhe ndriçim të lëkurës. Përmban ujin termal të Vichy.',
    price: 4200.00,
    original_price: null,
    stock_quantity: 20,
    is_new: 1,
    on_sale: 0,
    in_stock: 1
  },
  {
    name: 'Nivea Soft Light Moisturising Cream',
    brand: 'Nivea',
    category: 'trupi',
    description: 'Krem i lehtë hidratues për trup me formulë që thithet shpejt dhe jep lëkurë të butë.',
    price: 650.00,
    original_price: 780.00,
    stock_quantity: 50,
    is_new: 0,
    on_sale: 1,
    in_stock: 1
  },
  {
    name: 'Bioderma Sensibio H2O Micellar Water',
    brand: 'Bioderma',
    category: 'fytyre',
    description: 'Ujë micellar për pastrimin e fytyrës dhe heqjen e make-up. I përshtatshëm për lëkurën sensitive.',
    price: 1450.00,
    original_price: null,
    stock_quantity: 35,
    is_new: 0,
    on_sale: 0,
    in_stock: 1
  },
  {
    name: 'Avène Thermal Spring Water Spray',
    brand: 'Avène',
    category: 'fytyre',
    description: 'Ujë termal natyral në spray për qetësimin dhe hidrimin e lëkurës sensitive.',
    price: 980.00,
    original_price: null,
    stock_quantity: 45,
    is_new: 0,
    on_sale: 0,
    in_stock: 1
  },
  {
    name: 'L\'Oréal Paris Revitalift Laser X3 Anti-Age Cream',
    brand: 'L\'Oréal Paris',
    category: 'fytyre',
    description: 'Krem anti-age me Pro-Xylane dhe Adenosine për të luftuar shenjat e plakjes.',
    price: 1690.00,
    original_price: 1890.00,
    stock_quantity: 28,
    is_new: 0,
    on_sale: 1,
    in_stock: 1
  },
  {
    name: 'Garnier Micellar Cleansing Water',
    brand: 'Garnier',
    category: 'fytyre',
    description: 'Ujë micellar për pastrimin e fytyrës dhe heqjen e make-up. Formula pa alkool.',
    price: 750.00,
    original_price: null,
    stock_quantity: 55,
    is_new: 0,
    on_sale: 0,
    in_stock: 1
  }
];

// Function to insert products
const insertProducts = () => {
  return new Promise((resolve, reject) => {
    console.log('📦 Inserting sample products...');
    
    let completed = 0;
    const total = sampleProducts.length;
    
    sampleProducts.forEach((product, index) => {
      db.run(
        `INSERT OR IGNORE INTO products (name, brand, category, description, price, original_price, stock_quantity, is_new, on_sale, in_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.brand,
          product.category,
          product.description,
          product.price,
          product.original_price,
          product.stock_quantity,
          product.is_new,
          product.on_sale,
          product.in_stock
        ],
        function(err) {
          if (err) {
            console.error(`❌ Error inserting product ${index + 1}:`, err);
          } else {
            console.log(`✅ Inserted: ${product.name}`);
          }
          
          completed++;
          if (completed === total) {
            resolve();
          }
        }
      );
    });
  });
};

// Function to check existing products
const checkProducts = () => {
  return new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) {
        console.error('❌ Error checking products:', err);
        resolve(0);
      } else {
        resolve(row.count);
      }
    });
  });
};

// Main execution
const main = async () => {
  try {
    const existingCount = await checkProducts();
    console.log(`📊 Existing products in database: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('⚠️  Products already exist. Adding new sample products...');
    }
    
    await insertProducts();
    
    // Check final count
    const finalCount = await checkProducts();
    console.log(`📊 Total products after insertion: ${finalCount}`);
    
    // Show brand summary
    db.all('SELECT brand, COUNT(*) as count FROM products GROUP BY brand ORDER BY count DESC', (err, brands) => {
      if (err) {
        console.error('❌ Error getting brand summary:', err);
      } else {
        console.log('\n🏷️  Brands summary:');
        brands.forEach(brand => {
          console.log(`   ${brand.brand}: ${brand.count} products`);
        });
      }
      
      db.close(() => {
        console.log('\n✅ Database populated successfully!');
        console.log('🚀 You can now start the servers with: npm run dev:full');
      });
    });
    
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    db.close();
  }
};

main();
