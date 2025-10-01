const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

console.log('\n📊 ANALIZA E PLOTË E KATEGORIVE DHE NËNKATEGORIVE\n');
console.log('='.repeat(80));

// Get all categories, subcategories, and sub-subcategories with product counts
db.all(`
  SELECT 
    main_category,
    sub_category,
    sub_sub_category,
    COUNT(*) as product_count
  FROM products 
  WHERE main_category IS NOT NULL
  GROUP BY main_category, sub_category, sub_sub_category
  ORDER BY main_category, sub_category, sub_sub_category
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  
  let currentMainCat = '';
  let currentSubCat = '';
  let mainCatTotal = 0;
  let subCatTotal = 0;
  
  const categoryStructure = {};
  
  rows.forEach(row => {
    const mainCat = row.main_category;
    const subCat = row.sub_category || 'Pa nënkategori';
    const subSubCat = row.sub_sub_category || null;
    const count = row.product_count;
    
    // Initialize structure
    if (!categoryStructure[mainCat]) {
      categoryStructure[mainCat] = { total: 0, subcategories: {} };
    }
    if (!categoryStructure[mainCat].subcategories[subCat]) {
      categoryStructure[mainCat].subcategories[subCat] = { total: 0, subsubcategories: {} };
    }
    
    // Add counts
    categoryStructure[mainCat].total += count;
    categoryStructure[mainCat].subcategories[subCat].total += count;
    
    if (subSubCat) {
      categoryStructure[mainCat].subcategories[subCat].subsubcategories[subSubCat] = count;
    }
  });
  
  // Print the structure
  Object.keys(categoryStructure).forEach(mainCat => {
    const mainData = categoryStructure[mainCat];
    console.log(`\n🏷️  ${mainCat.toUpperCase()} (${mainData.total} produkte gjithsej)`);
    console.log('─'.repeat(60));
    
    Object.keys(mainData.subcategories).forEach(subCat => {
      const subData = mainData.subcategories[subCat];
      console.log(`\n   📂 ${subCat} (${subData.total} produkte)`);
      
      // Check if there are sub-subcategories
      if (Object.keys(subData.subsubcategories).length > 0) {
        Object.keys(subData.subsubcategories).forEach(subSubCat => {
          const count = subData.subsubcategories[subSubCat];
          console.log(`      └── ${subSubCat}: ${count} produkte`);
        });
      }
    });
  });
  
  // Summary of empty categories/subcategories
  console.log('\n\n🔍 KATEGORITË QË DUHEN KONTROLLUAR:\n');
  console.log('='.repeat(50));
  
  // Check what navbar categories we have vs database
  const navbarCategories = [
    'Dermokozmetikë',
    'Higjena', 
    'Farmaci',
    'Mama dhe Bebat',
    'Produkte Shtesë',
    'Suplemente'
  ];
  
  navbarCategories.forEach(navCat => {
    if (categoryStructure[navCat]) {
      console.log(`✅ ${navCat}: ${categoryStructure[navCat].total} produkte`);
    } else {
      console.log(`❌ ${navCat}: 0 produkte (BOSH!)`);
    }
  });
  
  // Show navbar subcategories that might be empty
  console.log('\n📋 NËNKATEGORITE NGA NAVBAR-I:\n');
  
  const navbarSubcategories = {
    'Dermokozmetikë': ['Fytyre', 'Trupi', 'Flokët', 'SPF', 'Makeup', 'Tanning'],
    'Higjena': ['Goja', 'Trupi', 'Depilim dhe Intime', 'Këmbët'],
    'Farmaci': ['OTC (pa recetë)', 'First Aid (Ndihmë e Parë)', 'Aparat mjekësore', 'Ortopedike', 'Mirëqenia seksuale'],
    'Mama dhe Bebat': ['Kujdesi ndaj Nënës', 'Kujdesi ndaj Bebit', 'Planifikim Familjar'],
    'Produkte Shtesë': ['Sete', 'Pajisje', 'Aksesorë'],
    'Suplemente': ['Vitaminat dhe Mineralet', 'Çajra Mjekësore', 'Proteinë dhe Fitness', 'Suplementet Natyrore']
  };
  
  Object.keys(navbarSubcategories).forEach(mainCat => {
    console.log(`\n${mainCat}:`);
    navbarSubcategories[mainCat].forEach(subCat => {
      if (categoryStructure[mainCat] && categoryStructure[mainCat].subcategories[subCat]) {
        const count = categoryStructure[mainCat].subcategories[subCat].total;
        console.log(`   ✅ ${subCat}: ${count} produkte`);
      } else {
        console.log(`   ❌ ${subCat}: 0 produkte (BOSH!)`);
      }
    });
  });
  
  db.close();
});