const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n🔍 SEARCHING FOR MISPLACED TEAS AND OTHER PRODUCTS:\n');

// Check specific problem areas
const checks = [
  {
    query: `SELECT id, name, brand, category, subcategory FROM products 
            WHERE (LOWER(name) LIKE '%çaj%' OR LOWER(name) LIKE '%tea%' OR LOWER(name) LIKE '%tisana%')
            AND category != 'suplemente'`,
    description: 'Teas not in suplemente'
  },
  {
    query: `SELECT id, name, brand, category, subcategory FROM products 
            WHERE subcategory = 'Tanning'
            AND NOT (LOWER(name) LIKE '%tan%' OR LOWER(name) LIKE '%bronze%' OR LOWER(name) LIKE '%abbronzante%' OR LOWER(name) LIKE '%self tan%')`,
    description: 'Non-tanning products in Tanning subcategory'
  },
  {
    query: `SELECT id, name, brand, category, subcategory FROM products 
            WHERE (LOWER(name) LIKE '%vitamin%' OR LOWER(name) LIKE '%supplement%' OR LOWER(name) LIKE '%integratore%')
            AND (LOWER(name) NOT LIKE '%serum%' AND LOWER(name) NOT LIKE '%cream%' AND LOWER(name) NOT LIKE '%lotion%')
            AND category != 'suplemente'`,
    description: 'Supplements not in suplemente category'
  }
];

let checksDone = 0;
const allProblems = [];

checks.forEach((check, index) => {
  db.all(check.query, [], (err, products) => {
    if (err) {
      console.error(`Error in check ${index + 1}:`, err.message);
    } else if (products.length > 0) {
      console.log(`\n❌ ${check.description} (${products.length} products):`);
      products.forEach(p => {
        console.log(`   [${p.category}/${p.subcategory}] ${p.brand} - ${p.name.substring(0, 60)}`);
        allProblems.push({
          id: p.id,
          name: p.name,
          brand: p.brand,
          currentCategory: p.category,
          currentSubcategory: p.subcategory
        });
      });
    }
    
    checksDone++;
    if (checksDone === checks.length) {
      if (allProblems.length === 0) {
        console.log('\n✅ No misplaced products found!');
        db.close();
      } else {
        console.log(`\n\n🔧 FIXING ${allProblems.length} PRODUCTS...\n`);
        fixProblems(allProblems);
      }
    }
  });
});

function fixProblems(problems) {
  let fixed = 0;
  
  problems.forEach(problem => {
    const name = problem.name.toLowerCase();
    let newCategory = problem.currentCategory;
    let newSubcategory = problem.currentSubcategory;
    
    // Determine correct category/subcategory
    if (name.includes('çaj') || name.includes('tea') || name.includes('tisana')) {
      newCategory = 'suplemente';
      newSubcategory = 'Çajra Mjekësore';
    }
    else if ((name.includes('vitamin') || name.includes('supplement') || name.includes('integratore')) &&
             !name.includes('serum') && !name.includes('cream')) {
      newCategory = 'suplemente';
      newSubcategory = 'Vitaminat dhe Mineralet';
    }
    
    if (newCategory !== problem.currentCategory || newSubcategory !== problem.currentSubcategory) {
      db.run('UPDATE products SET category = ?, subcategory = ? WHERE id = ?',
        [newCategory, newSubcategory, problem.id],
        function(err) {
          if (err) {
            console.error(`❌ Error fixing ${problem.name}: ${err.message}`);
          } else {
            console.log(`✅ ${problem.brand} - ${problem.name.substring(0, 50)}`);
            console.log(`   ${problem.currentCategory}/${problem.currentSubcategory} → ${newCategory}/${newSubcategory}`);
          }
          
          fixed++;
          if (fixed === problems.length) {
            console.log(`\n🎉 Fixed ${fixed} products!\n`);
            db.close();
          }
        }
      );
    } else {
      fixed++;
      if (fixed === problems.length) {
        console.log(`\n🎉 All products checked!\n`);
        db.close();
      }
    }
  });
}
