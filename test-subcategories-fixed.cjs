const http = require('http')

// Test subcategory endpoints to make sure they work AFTER the fix
const testEndpoints = [
  { name: 'Fytyre subcategory', url: '/api/products?category=fytyre' },
  { name: 'Flokët subcategory', url: '/api/products?category=floket' },
  { name: 'Makeup subcategory', url: '/api/products?category=makeup' },
  { name: 'SPF main category', url: '/api/products?category=spf' },
  { name: 'Goja subcategory', url: '/api/products?category=goja' },
  { name: 'Durex / Mirëqenia seksuale', url: '/api/products?category=mireqenia-seksuale' },
  { name: 'Mama-dhe-bebat main category', url: '/api/products?category=mama-dhe-bebat' },
  { name: 'Pelena subcategory', url: '/api/products?category=pelena' },
  { name: 'Sete subcategory', url: '/api/products?category=sete' }
]

console.log('\n🌐 TESTING FIXED API ENDPOINTS:\n')
console.log('═'.repeat(75))

let completed = 0

const makeRequest = (endpoint) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint.url,
      method: 'GET'
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const products = json.products || (Array.isArray(json) ? json : [])
          const count = products.length
          
          const status = count > 0 ? '✅' : '⚠️'
          console.log(`${status} ${endpoint.name.padEnd(35)} → ${count.toString().padStart(3)} products`)
          
          // Show first product name for verification
          if (count > 0) {
            console.log(`   └─ First: ${products[0].brand} ${products[0].name.substring(0, 40)}`)
          }
          
          completed++
          resolve({ success: true, count })
        } catch (e) {
          console.log(`❌ ${endpoint.name.padEnd(35)} → ERROR: ${e.message}`)
          completed++
          resolve({ success: false, count: 0 })
        }
      })
    })

    req.on('error', (e) => {
      console.log(`❌ ${endpoint.name.padEnd(35)} → CONNECTION ERROR`)
      completed++
      resolve({ success: false, count: 0 })
    })

    req.end()
  })
}

// Run tests sequentially
const runTests = async () => {
  for (const endpoint of testEndpoints) {
    await makeRequest(endpoint)
  }
  
  console.log('═'.repeat(75))
  console.log(`\n✅ All ${completed} tests completed!\n`)
}

runTests()
