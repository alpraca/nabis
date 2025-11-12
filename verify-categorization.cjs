const { db } = require('./server/config/database.cjs')

console.log('🔍 VERIFIKIMI FINAL I KATEGORIZIMIT\n')
console.log('=' .repeat(60))

// 1. Count products per category/subcategory
db.all(`
  SELECT category, subcategory, COUNT(*) as count 
  FROM products 
  GROUP BY category, subcategory 
  ORDER BY category, subcategory
`, [], (err, counts) => {
  if (err) {
    console.error('Error:', err)
    return
  }

  console.log('\n📊 PRODUKTET PËR KATEGORI/NËNKATEGORI:\n')
  
  let currentCategory = ''
  counts.forEach(row => {
    if (row.category !== currentCategory) {
      currentCategory = row.category
      console.log(`\n🏷️  ${row.category.toUpperCase()}`)
    }
    console.log(`   └─ ${row.subcategory || 'NULL'}: ${row.count} produkte`)
  })

  // 2. Check for potential issues
  setTimeout(() => {
    console.log('\n' + '='.repeat(60))
    console.log('\n🔎 KONTROLL PËR PROBLEME TË MUNDSHME:\n')

    // Check for oral products not in "Goja"
    db.all(`
      SELECT id, name, category, subcategory 
      FROM products 
      WHERE (
        LOWER(name) LIKE '%paste%dhëmb%' OR
        LOWER(name) LIKE '%toothpaste%' OR
        LOWER(name) LIKE '%gojëlar%' OR
        LOWER(name) LIKE '%mouthwash%' OR
        LOWER(description) LIKE '%dhëmbë%' OR
        LOWER(description) LIKE '%oral%'
      )
      AND subcategory != 'Goja'
      LIMIT 10
    `, [], (err2, oralProducts) => {
      if (err2) {
        console.error('Error checking oral products:', err2)
      } else {
        if (oralProducts.length > 0) {
          console.log('⚠️  PRODUKTE PËR GOJËN JO TEK "GOJA":')
          oralProducts.forEach(p => {
            console.log(`   [${p.id}] ${p.name}`)
            console.log(`       → ${p.category} -> ${p.subcategory}`)
          })
        } else {
          console.log('✅ Të gjitha produktet për gojën janë në vendin e duhur!')
        }
      }

      // Check for anti-aging products
      setTimeout(() => {
        db.all(`
          SELECT id, name, category, subcategory 
          FROM products 
          WHERE (
            LOWER(name) LIKE '%anti%aging%' OR
            LOWER(name) LIKE '%anti-aging%' OR
            LOWER(name) LIKE '%anti%rrudh%' OR
            LOWER(name) LIKE '%wrinkle%' OR
            LOWER(description) LIKE '%anti%aging%' OR
            LOWER(description) LIKE '%rrudh%'
          )
          AND category != 'dermokozmetikë'
          LIMIT 10
        `, [], (err3, antiAgingProducts) => {
          if (err3) {
            console.error('Error checking anti-aging:', err3)
          } else {
            if (antiAgingProducts.length > 0) {
              console.log('\n⚠️  PRODUKTE ANTI-AGING JO TEK DERMOKOZMETIKË:')
              antiAgingProducts.forEach(p => {
                console.log(`   [${p.id}] ${p.name}`)
                console.log(`       → ${p.category} -> ${p.subcategory}`)
              })
            } else {
              console.log('\n✅ Të gjitha produktet anti-aging janë në dermokozmetikë!')
            }
          }

          // Check for SPF products
          setTimeout(() => {
            db.all(`
              SELECT id, name, category, subcategory 
              FROM products 
              WHERE (
                LOWER(name) LIKE '%spf%' OR
                LOWER(name) LIKE '%sun%' OR
                LOWER(name) LIKE '%solar%' OR
                LOWER(description) LIKE '%spf%'
              )
              AND subcategory NOT IN ('SPF', 'Tanning')
              LIMIT 10
            `, [], (err4, spfProducts) => {
              if (err4) {
                console.error('Error checking SPF:', err4)
              } else {
                if (spfProducts.length > 0) {
                  console.log('\n⚠️  PRODUKTE SPF JO TEK SPF/TANNING:')
                  spfProducts.forEach(p => {
                    console.log(`   [${p.id}] ${p.name}`)
                    console.log(`       → ${p.category} -> ${p.subcategory}`)
                  })
                } else {
                  console.log('\n✅ Të gjitha produktet SPF janë në vendin e duhur!')
                }
              }

              // Check for baby products
              setTimeout(() => {
                db.all(`
                  SELECT id, name, category, subcategory 
                  FROM products 
                  WHERE (
                    LOWER(name) LIKE '%baby%' OR
                    LOWER(name) LIKE '%bebe%' OR
                    LOWER(name) LIKE '%pelena%' OR
                    LOWER(name) LIKE '%diaper%' OR
                    LOWER(description) LIKE '%bebe%'
                  )
                  AND category != 'mama-dhe-bebat'
                  LIMIT 10
                `, [], (err5, babyProducts) => {
                  if (err5) {
                    console.error('Error checking baby products:', err5)
                  } else {
                    if (babyProducts.length > 0) {
                      console.log('\n⚠️  PRODUKTE PËR BEBE JO TEK "MAMA DHE BEBAT":')
                      babyProducts.forEach(p => {
                        console.log(`   [${p.id}] ${p.name}`)
                        console.log(`       → ${p.category} -> ${p.subcategory}`)
                      })
                    } else {
                      console.log('\n✅ Të gjitha produktet për bebe janë në "Mama dhe Bebat"!')
                    }
                  }

                  // Sample random products
                  setTimeout(() => {
                    db.all(`
                      SELECT id, name, category, subcategory 
                      FROM products 
                      WHERE id IN (50, 100, 200, 300, 500, 700, 900, 1100)
                    `, [], (err6, samples) => {
                      if (err6) {
                        console.error('Error getting samples:', err6)
                      } else {
                        console.log('\n' + '='.repeat(60))
                        console.log('\n📋 MOSTRA E PRODUKTEVE (kontrollo manualisht):\n')
                        samples.forEach(p => {
                          console.log(`[${p.id}] ${p.name}`)
                          console.log(`    ${p.category} → ${p.subcategory}\n`)
                        })
                      }

                      // Final summary
                      setTimeout(() => {
                        console.log('='.repeat(60))
                        console.log('\n✨ VERIFIKIMI PËRFUNDOI!')
                        console.log('\n💡 Nëse sheh produkte në vend të gabuar, më thuaj ID-në dhe do ta korrigjoj!\n')
                        process.exit(0)
                      }, 500)
                    })
                  }, 500)
                })
              }, 500)
            })
          }, 500)
        })
      }, 500)
    })
  }, 500)
})
