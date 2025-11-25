const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');

const db = new sqlite3.Database('./server/database.sqlite');

async function fullCheck() {
  // Get ALL products without images
  const noImages = await new Promise((resolve, reject) => {
    db.all(
      `SELECT p.id, p.name, p.brand FROM products p 
       LEFT JOIN product_images pi ON p.id = pi.product_id 
       WHERE pi.id IS NULL 
       ORDER BY p.id DESC
       LIMIT 20`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  console.log(`Total products without images: ${noImages.length}\n`);
  console.log('First 10 products without images:');
  for (let i = 0; i < Math.min(10, noImages.length); i++) {
    console.log(`${i + 1}. [${noImages[i].id}] ${noImages[i].brand || 'NO BRAND'} - ${noImages[i].name.substring(0, 50)}`);
  }

  // Read Excel
  const workbook = xlsx.readFile('C:\\Users\\Admin\\joanfarm\\nabis\\products.xlsx');
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  // Check matches
  console.log('\n🔍 Checking for matches in Excel:\n');
  let found = 0;
  let notFound = 0;
  
  for (let i = 0; i < Math.min(10, noImages.length); i++) {
    const dbProd = noImages[i];
    const match = data.find(row => row.Name === dbProd.name);
    
    if (match) {
      console.log(`✅ ${dbProd.name.substring(0, 40)}... HAS IMAGE URL`);
      found++;
    } else {
      console.log(`❌ ${dbProd.name.substring(0, 40)}... NOT IN EXCEL`);
      notFound++;
    }
  }

  console.log(`\n📊 Found in Excel: ${found}`);
  console.log(`📊 Not in Excel: ${notFound}`);

  db.close();
}

fullCheck().catch(err => {
  console.error(err);
  db.close();
});
