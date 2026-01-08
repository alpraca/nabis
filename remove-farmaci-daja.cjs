const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

// First, find all products with both "Farmaci" and "DAJA" in the name (in any order)
db.all('SELECT id, name FROM products WHERE (LOWER(name) LIKE ? AND LOWER(name) LIKE ?)', ['%farmaci%', '%daja%'], (err, products) => {
  if (err) {
    console.error('Error finding products:', err);
    db.close();
    return;
  }

  console.log(`Found ${products.length} products with both "Farmaci" and "DAJA" in the name:`);
  products.forEach(p => console.log(`- ID ${p.id}: ${p.name}`));

  if (products.length === 0) {
    console.log('No products to remove.');
    db.close();
    return;
  }

  const productIds = products.map(p => p.id);
  const placeholders = productIds.map(() => '?').join(',');

  // Delete associated images first
  db.run(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, productIds, (err) => {
    if (err) {
      console.error('Error deleting product images:', err);
      db.close();
      return;
    }
    console.log('✓ Deleted associated product images');

    // Delete the products
    db.run(`DELETE FROM products WHERE id IN (${placeholders})`, productIds, (err) => {
      if (err) {
        console.error('Error deleting products:', err);
        db.close();
        return;
      }
      console.log(`✓ Deleted ${products.length} products with both "Farmaci" and "DAJA"`);
      
      // Verify deletion
      db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
        if (err) {
          console.error('Error counting products:', err);
        } else {
          console.log(`\nTotal products remaining in database: ${result.count}`);
        }
        db.close();
      });
    });
  });
});
