const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

console.log('\n📋 LISTA E PRODUKTEVE QË DUHET TË SHTOHEN\n');
console.log('═'.repeat(100));

// Produktet që mungojnë sipas nënkategorive
const neededProducts = {
  'suplemente/Proteinat': {
    count: 0,
    suggestions: [
      '• Whey Protein Powder (vanilë, çokollatë, dyshe)',
      '• Whey Protein Isolate',
      '• Casein Protein (për natën)',
      '• Plant-Based Protein (vegan)',
      '• Protein Bars (format e ndryshme)',
      '• BCAA (Branch Chain Amino Acids)',
      '• Amino Acids kompleks',
      '• Creatine Monohydrate',
      '• Glutamine',
      '• Collagen Powder (oral supplement, jo krem)'
    ]
  },
  'suplemente/Omega-3 dhe DHA': {
    count: 'pak',
    suggestions: [
      '• Omega-3 Fish Oil 1000mg',
      '• Omega-3 Extra Strength',
      '• Vegan Omega-3 (nga alga)',
      '• Omega-3 për fëmijë (gummy bears)',
      '• Krill Oil',
      '• DHA për shtatzëna',
      '• EPA+DHA kombim'
    ]
  },
  'suplemente/Kontrollimi i peshës': {
    count: 1,
    suggestions: [
      '• Fat Burners',
      '• Appetite Suppressants',
      '• Carb Blockers',
      '• Green Tea Extract',
      '• CLA (Conjugated Linoleic Acid)',
      '• L-Carnitine',
      '• Garcinia Cambogia',
      '• Meal Replacement Shakes'
    ]
  },
  'dermokozmetikë/Anti Kallo': {
    count: 1,
    suggestions: [
      '• Alpecin Caffeine Shampoo',
      '• Alpecin After Shampoo Liquid',
      '• Bioscalin Signal Revolution',
      '• Bioscalin PhysioGenina',
      '• Crescina HFSC (për rritje flokësh)',
      '• Kérastase Specifique Anti-Chute',
      '• Phyto Phytocyane për gratë',
      '• Priorin Capsules',
      '• Viviscal Max Strength'
    ]
  },
  'dermokozmetikë/Bioscalin': {
    count: 1,
    suggestions: [
      '• Bioscalin Signal Revolution',
      '• Bioscalin PhysioGenina',
      '• Bioscalin Oil Shampoo Extra-Delicato',
      '• Bioscalin Triactive',
      '• Bioscalin Nutricolor për ngjyrosje',
      '• Bioscalin Energy Fiale',
      '• Bioscalin TricoAge 45+ për gratë'
    ]
  },
  'mama-dhe-bebat/Suplementa': {
    count: 1,
    suggestions: [
      '• Multivitamin për fëmijë (gummy)',
      '• Vitamin D drops për foshnja',
      '• Probiotics për fëmijë',
      '• Calcium për fëmijë',
      '• DHA për foshnja',
      '• Iron drops për fëmijë',
      '• Zinc syrup për fëmijë'
    ]
  },
  'mama-dhe-bebat/Kujdesi për Nënën': {
    count: 3,
    suggestions: [
      '• Prenatal Vitamins (format të ndryshme)',
      '• Folic Acid për shtatzëna',
      '• Pregnancy Omega-3',
      '• Nursing Tea (më shumë lloje)',
      '• Breast Pump dhe aksesorë',
      '• Nursing Pads',
      '• Nipple Cream (Lansinoh)',
      '• Maternity Stretch Mark Creams',
      '• Pelvic Floor Exercise Products'
    ]
  },
  'higjena/Këmbët': {
    count: 5,
    suggestions: [
      '• Scholl Cracked Heel Repair',
      '• Gehwol Foot Cream',
      '• Neutrogena Foot Cream',
      '• Foot Files/Rasps',
      '• Foot Masks',
      '• Anti-Fungal Foot Powder',
      '• Deodorant për këmbë',
      '• Insoles/Orthopedic Inserts'
    ]
  },
  'dermokozmetikë/Anti Celulit': {
    count: 9,
    suggestions: [
      '• Somatoline Cosmetic Anti-Cellulite',
      '• Collistar Body Care',
      '• Clarins Body Lift',
      '• Vichy Cellu Destock',
      '• Bio-Oil Cellulite',
      '• Massage rollers/cups',
      '• Body Brushes për celulit'
    ]
  },
  'suplemente/Probiotic & Digestim': {
    count: 3,
    suggestions: [
      '• Enterogermina (më shumë lloje)',
      '• Probiotics Multi-Strain',
      '• Prebiotics Fiber',
      '• Digestive Enzymes',
      '• VSL#3 për IBS',
      '• Acidophilus Complex',
      '• Symprove Probiotic Liquid'
    ]
  },
  'dermokozmetikë/Pastrimi': {
    count: 1,
    suggestions: [
      '• Micellar Water (Garnier, Bioderma, La Roche)',
      '• Cleansing Oil',
      '• Makeup Remover Wipes',
      '• Foaming Cleansers',
      '• Double Cleanse Sets',
      '• Makeup Eraser Cloths',
      '• Eye Makeup Remover'
    ]
  },
  'dermokozmetikë/Parfume': {
    count: 1,
    suggestions: [
      '• Burberry perfumes',
      '• Calvin Klein',
      '• Dior Sauvage/J\'adore',
      '• Chanel No.5/Bleu',
      '• Versace Eros/Bright Crystal',
      '• Hugo Boss',
      '• Armani Code',
      '• Tom Ford',
      '• Yves Saint Laurent',
      '• Paco Rabanne'
    ]
  },
  'farmaci/Aparat mjeksore': {
    count: 'pak',
    suggestions: [
      '• Blood Pressure Monitors',
      '• Glucose Meters',
      '• Thermometers (dixhital, infrared)',
      '• Pulse Oximeters',
      '• Nebulizers',
      '• Heating Pads',
      '• TENS Units',
      '• Pregnancy Tests',
      '• COVID Tests'
    ]
  },
  'higjena/Depilim dhe Intime': {
    count: 2,
    suggestions: [
      '• Veet Hair Removal Cream',
      '• Wax Strips',
      '• Epilators',
      '• Intimate Wash (Lactacyd, Saugella)',
      '• Vagisil Products',
      '• pH Balance Products',
      '• Intimate Moisturizers'
    ]
  }
};

db.serialize(() => {
  // Merr gjendjen aktuale
  db.all(`
    SELECT category, subcategory, COUNT(*) as count
    FROM products
    GROUP BY category, subcategory
    ORDER BY count ASC, category, subcategory
  `, (err, rows) => {
    if (err) {
      console.error('Gabim:', err.message);
      db.close();
      return;
    }

    // Update counts
    const categoryMap = {};
    rows.forEach(row => {
      categoryMap[`${row.category}/${row.subcategory}`] = row.count;
    });

    console.log('\n🔴 PRIORITET I LARTË - Nënkategori bosh ose me 1 produkt:\n');
    console.log('─'.repeat(100));

    Object.keys(neededProducts).forEach(key => {
      const count = categoryMap[key] || 0;
      if (count <= 1) {
        const data = neededProducts[key];
        console.log(`\n📦 ${key} (${count} produkt${count !== 1 ? 'e' : ''})`);
        console.log('─'.repeat(100));
        data.suggestions.forEach(suggestion => {
          console.log(`   ${suggestion}`);
        });
      }
    });

    console.log('\n\n🟡 PRIORITET MESATAR - Nënkategori me 2-5 produkte:\n');
    console.log('─'.repeat(100));

    Object.keys(neededProducts).forEach(key => {
      const count = categoryMap[key] || 0;
      if (count >= 2 && count <= 5) {
        const data = neededProducts[key];
        console.log(`\n📦 ${key} (${count} produkte)`);
        console.log('─'.repeat(100));
        data.suggestions.forEach(suggestion => {
          console.log(`   ${suggestion}`);
        });
      }
    });

    console.log('\n\n' + '═'.repeat(100));
    console.log('\n💡 SUGJERIME TË PËRGJITHSHME:\n');
    console.log('─'.repeat(100));
    console.log(`
1️⃣  PROTEINAT - Kjo është PRIORITET #1! Është nënkategori bosh dhe shumë e kërkuar.
   Filloni me: 2-3 lloje Whey Protein, 1 BCAA, 1 Creatine

2️⃣  ANTI KALLO - Shumë e kërkuar nga klientët. Shtoni të paktën 5 produkte.
   Fokus: Alpecin, Bioscalin, Crescina, Priorin

3️⃣  OMEGA-3 - Suplement bazë që duhet të keni në stok.
   Shtoni: Fish Oil format të ndryshme, Vegan Omega-3

4️⃣  PARFUME - Kategori me fitim të lartë.
   Shtoni: Dior, Chanel, Versace, Armani (5-10 parfume popullorë)

5️⃣  KONTROLLIMI I PESHËS - Kategori me kërkesë të lartë.
   Shtoni: Fat burners, L-Carnitine, meal replacements

6️⃣  APARAT MJEKSORE - Produkte thelbësore për farmaci.
   Shtoni: Pressure monitors, glucose meters, thermometers

7️⃣  PASTRIMI - Produkte të përditshme me shitje të shpeshta.
   Shtoni: Micellar water, cleansing oils, makeup removers

8️⃣  SUPLEMENTA PËR FËMIJË - Segment i rëndësishëm.
   Shtoni: Vitamin D drops, gummy vitamins, probiotics për fëmijë

9️⃣  KUJDESI PËR NËNËN - Treg specifik por i qëndrueshëm.
   Shtoni: Prenatal vitamins, folic acid, nursing products

🔟  DEPILIM DHE INTIME - Produkte të përdorimit të rregullt.
   Shtoni: Veet, Lactacyd, intimate care products
`);

    console.log('\n═'.repeat(100));
    console.log('\n📊 PËRMBLEDHJE:\n');
    console.log('   • Total nënkategori me pak produkte: ' + Object.keys(neededProducts).length);
    console.log('   • Produkte totale që rekomandohen: ~150-200 produkte të reja');
    console.log('   • Investim i parashikuar: varion sipas produkteve');
    console.log('   • Koha e zbatimit: fazuar në 2-3 muaj\n');

    db.close();
  });
});
