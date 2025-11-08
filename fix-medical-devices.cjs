const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')

console.log('🔧 FIXING APARAT MJEKSORE CATEGORIZATION\n')
console.log('═'.repeat(80) + '\n')

// Step 1: Move vitamins OUT of "Aparat mjeksore" to "Vitaminat dhe Mineralet"
console.log('Step 1: Moving vitamins OUT of "Aparat mjeksore"...\n')

const vitaminFixes = [
  'Now Liquid Vitamin D3',
  'Now Vitamin A 10000 UI',
  'Olimp Labs Gold Vitamin D3 Junior'
]

let step1Complete = 0

vitaminFixes.forEach(vitaminName => {
  db.run(
    `UPDATE products 
     SET subcategory = 'Vitaminat dhe Mineralet'
     WHERE name = ?`,
    [vitaminName],
    function(err) {
      if (err) {
        console.log(`❌ Error fixing ${vitaminName}`)
      } else if (this.changes > 0) {
        console.log(`✅ ${vitaminName}`)
        console.log(`   farmaci/Aparat mjeksore → suplemente/Vitaminat dhe Mineralet\n`)
      }
      
      step1Complete++
      
      if (step1Complete === vitaminFixes.length) {
        // Step 2: Find and move actual medical devices to "Aparat mjeksore"
        console.log('\nStep 2: Moving ACTUAL medical devices TO "Aparat mjeksore"...\n')
        
        db.all(`
          SELECT id, name, brand, category, subcategory
          FROM products
          WHERE (
            subcategory = 'OTC (pa recete)' AND (
              name LIKE '%blood glucose%' OR
              name LIKE '%glucose monitor%' OR
              name LIKE '%glucose test%' OR
              name LIKE '%lancet%' OR
              name LIKE '%accu-check%' OR
              name LIKE '%contour plus%' OR
              name LIKE '%ihealth%' OR
              name LIKE '%bionime%'
            )
          )
        `, [], (err, devices) => {
          if (err) {
            console.error('Error finding devices:', err.message)
            db.close()
            return
          }
          
          console.log(`Found ${devices.length} medical devices to move:\n`)
          
          let devicesProcessed = 0
          
          if (devices.length === 0) {
            console.log('✅ No medical devices need moving\n')
            db.close()
            return
          }
          
          devices.forEach(device => {
            db.run(
              `UPDATE products 
               SET subcategory = 'Aparat mjeksore'
               WHERE id = ?`,
              [device.id],
              function(err) {
                if (err) {
                  console.log(`❌ Error: ${device.brand} ${device.name}`)
                } else {
                  console.log(`✅ ${device.brand.toUpperCase()} - ${device.name}`)
                  console.log(`   farmaci/OTC → farmaci/Aparat mjeksore\n`)
                }
                
                devicesProcessed++
                
                if (devicesProcessed === devices.length) {
                  console.log('═'.repeat(80))
                  console.log('\n✅ CATEGORIZATION FIXED!\n')
                  db.close()
                }
              }
            )
          })
        })
      }
    }
  )
})
