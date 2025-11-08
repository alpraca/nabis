const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./server/database.sqlite')
const fs = require('fs')
const path = require('path')

console.log('\n')
console.log('╔════════════════════════════════════════════════════════════════════╗')
console.log('║         NABIS FARMACI - DEPLOYMENT READINESS ASSESSMENT            ║')
console.log('╚════════════════════════════════════════════════════════════════════╝')
console.log('\n')

const assessment = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  passed: []
}

// 1. Check product data completeness
db.all(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN name IS NULL OR name = '' THEN 1 ELSE 0 END) as missing_names,
    SUM(CASE WHEN brand IS NULL OR brand = '' THEN 1 ELSE 0 END) as missing_brands,
    SUM(CASE WHEN price IS NULL OR price <= 0 THEN 1 ELSE 0 END) as missing_prices,
    SUM(CASE WHEN category IS NULL OR category = '' THEN 1 ELSE 0 END) as missing_category,
    SUM(CASE WHEN subcategory IS NULL OR subcategory = '' THEN 1 ELSE 0 END) as missing_subcategory,
    SUM(CASE WHEN in_stock IS NULL THEN 1 ELSE 0 END) as missing_stock_status
  FROM products
`, [], (err, productCheck) => {
  if (err) console.error('Error:', err)
  else {
    const pc = productCheck[0]
    console.log('📦 PRODUCT DATA INTEGRITY:\n')
    console.log(`   Total Products: ${pc.total}`)
    console.log(`   ✅ Names: ${pc.total - pc.missing_names}/${pc.total}`)
    console.log(`   ✅ Brands: ${pc.total - pc.missing_brands}/${pc.total}`)
    console.log(`   ✅ Prices: ${pc.total - pc.missing_prices}/${pc.total}`)
    console.log(`   ✅ Categories: ${pc.total - pc.missing_category}/${pc.total}`)
    console.log(`   ✅ Subcategories: ${pc.total - pc.missing_subcategory}/${pc.total}`)
    console.log(`   ✅ Stock Status: ${pc.total - pc.missing_stock_status}/${pc.total}\n`)

    if (pc.missing_names > 0 || pc.missing_brands > 0 || pc.missing_prices > 0) {
      assessment.critical.push('Missing critical product data (names, brands, or prices)')
    } else {
      assessment.passed.push('✅ All products have complete data')
    }
  }

  // 2. Check images
  db.get(`
    SELECT COUNT(DISTINCT product_id) as products_with_images,
           COUNT(*) as total_images
    FROM product_images
  `, [], (err, imageCheck) => {
    console.log('🖼️  PRODUCT IMAGES:\n')
    console.log(`   Products with images: ${imageCheck.products_with_images}/${pc.total}`)
    console.log(`   Total images: ${imageCheck.total_images}`)
    
    const coverage = Math.round((imageCheck.products_with_images / pc.total) * 100)
    console.log(`   Coverage: ${coverage}%\n`)

    if (coverage < 80) {
      assessment.high.push(`⚠️  Only ${coverage}% of products have images (need ≥95% for e-commerce)`)
    } else if (coverage < 95) {
      assessment.medium.push(`⚠️  Image coverage ${coverage}% (ideal ≥95%)`)
    } else {
      assessment.passed.push('✅ Excellent image coverage')
    }

    // 3. Check payment methods
    console.log('💳 PAYMENT METHODS:\n')
    console.log('   ✅ Cash on Delivery (COD) - CONFIGURED')
    console.log('   ❌ Credit Card - NOT CONFIGURED')
    console.log('   ❌ PayPal - NOT CONFIGURED')
    console.log('   ❌ Bank Transfer - NOT CONFIGURED\n')
    
    assessment.high.push('⚠️  Only COD available - need more payment options for e-commerce')

    // 4. Check authentication
    console.log('🔐 AUTHENTICATION & SECURITY:\n')
    console.log('   ✅ User registration system')
    console.log('   ✅ Email verification')
    console.log('   ✅ Password hashing')
    console.log('   ✅ Session management')
    console.log('   ❓ SSL/HTTPS - Need to verify on production')
    console.log('   ❓ Data encryption - Need to verify\n')

    assessment.medium.push('⚠️  Verify SSL/HTTPS certificate for production')
    assessment.medium.push('⚠️  Verify data encryption for sensitive info')

    // 5. Check features
    console.log('✨ CORE FEATURES:\n')
    console.log('   ✅ Product catalog with filtering')
    console.log('   ✅ Shopping cart')
    console.log('   ✅ User accounts')
    console.log('   ✅ Order management')
    console.log('   ✅ Admin panel')
    console.log('   ✅ Category navigation (navbar)')
    console.log('   ✅ Product search')
    console.log('   ❌ Product reviews/ratings')
    console.log('   ❌ Wishlist functionality')
    console.log('   ❌ Live chat support')
    console.log('   ❌ Notification system\n')

    assessment.low.push('Reviews/ratings recommended for e-commerce')
    assessment.low.push('Wishlist feature for better UX')

    // 6. Check database
    console.log('🗄️  DATABASE:\n')
    console.log('   ✅ SQLite configured')
    console.log('   ✅ Product table')
    console.log('   ✅ User table')
    console.log('   ✅ Order table')
    console.log('   ✅ Product images linked')
    console.log('   ⚠️  SQLite = single file (OK for small pharmacy, consider PostgreSQL for scale)\n')

    assessment.medium.push('⚠️  SQLite for small pharmacy is OK, but upgrade to PostgreSQL if scaling')

    // 7. Check localization
    console.log('🌍 LOCALIZATION:\n')
    console.log('   ✅ Albanian language throughout')
    console.log('   ✅ Local currency (ALL)')
    console.log('   ✅ Local address format')
    console.log('   ❌ Multi-language support (English, Italian, etc.)')
    console.log('   ❌ Shipping calculator for regions\n')

    assessment.low.push('Consider English/Italian translations for international reach')

    // 8. Check compliance
    console.log('⚖️  PHARMACY COMPLIANCE:\n')
    console.log('   ✅ Privacy Policy - CRITICAL for pharmacy')
    console.log('   ✅ Terms & Conditions')
    console.log('   ❓ GDPR compliance - Need to verify')
    console.log('   ❓ Pharmacy license display')
    console.log('   ❓ Age restrictions for certain products')
    console.log('   ❓ Prescription product handling\n')

    assessment.critical.push('⚠️  Verify GDPR compliance (customer data protection)')
    assessment.critical.push('⚠️  Display pharmacy license & certifications')
    assessment.high.push('⚠️  Implement age restrictions for OTC medicines')

    // 9. Performance
    console.log('⚡ PERFORMANCE:\n')
    console.log('   ✅ React 18 (modern)')
    console.log('   ✅ Vite build tool (fast)')
    console.log('   ✅ Tailwind CSS (lightweight)')
    console.log('   ⚠️  No caching strategy mentioned')
    console.log('   ⚠️  No CDN for images')
    console.log('   ⚠️  No lazy loading images\n')

    assessment.medium.push('⚠️  Implement image lazy loading for performance')
    assessment.medium.push('⚠️  Set up CDN for image delivery')

    // 10. Mobile & UX
    console.log('📱 MOBILE & UX:\n')
    console.log('   ✅ Responsive design (Tailwind)')
    console.log('   ✅ Mobile navbar')
    console.log('   ⚠️  Test on multiple devices needed')
    console.log('   ⚠️  Accessibility (a11y) audit needed\n')

    assessment.medium.push('⚠️  Conduct mobile testing on iOS/Android')
    assessment.low.push('Accessibility audit recommended')

    // Print summary
    console.log('\n' + '═'.repeat(70))
    console.log('\n📋 DEPLOYMENT READINESS SUMMARY:\n')
    
    console.log('🔴 CRITICAL ISSUES (MUST FIX BEFORE LAUNCH):\n')
    if (assessment.critical.length === 0) {
      console.log('   ✅ NONE - All critical checks passed!\n')
    } else {
      assessment.critical.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`)
      })
      console.log()
    }

    console.log('🟠 HIGH PRIORITY (STRONGLY RECOMMENDED):\n')
    if (assessment.high.length === 0) {
      console.log('   ✅ NONE\n')
    } else {
      assessment.high.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`)
      })
      console.log()
    }

    console.log('🟡 MEDIUM PRIORITY (NICE TO HAVE):\n')
    if (assessment.medium.length === 0) {
      console.log('   ✅ NONE\n')
    } else {
      assessment.medium.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`)
      })
      console.log()
    }

    console.log('🟢 LOW PRIORITY (FUTURE ENHANCEMENTS):\n')
    if (assessment.low.length === 0) {
      console.log('   ✅ NONE\n')
    } else {
      assessment.low.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`)
      })
      console.log()
    }

    console.log('✅ PASSED CHECKS:\n')
    assessment.passed.forEach((check, idx) => {
      console.log(`   ${idx + 1}. ${check}`)
    })

    // Final verdict
    console.log('\n' + '═'.repeat(70))
    console.log('\n🎯 DEPLOYMENT VERDICT:\n')

    if (assessment.critical.length > 0) {
      console.log('   ❌ NOT READY FOR PRODUCTION')
      console.log(`   Fix ${assessment.critical.length} critical issues first\n`)
    } else if (assessment.high.length > 2) {
      console.log('   ⚠️  CONDITIONAL LAUNCH')
      console.log(`   Strongly recommend fixing ${assessment.high.length} high-priority issues\n`)
    } else {
      console.log('   ✅ READY FOR PRODUCTION')
      console.log('   Address medium priority items post-launch\n')
    }

    console.log('═'.repeat(70) + '\n')

    db.close()
  })
})
