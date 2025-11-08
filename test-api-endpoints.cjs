const http = require('http')

// Test API endpoints for each category
const testEndpoints = [
  '/api/products?category=dermokozmetike',
  '/api/products?category=higjena',
  '/api/products?category=farmaci',
  '/api/products?category=mama-dhe-bebat',
  '/api/products?category=produkte-shtese',
  '/api/products?category=suplemente'
]

const testSubcategoryEndpoints = [
  '/api/products?category=dermokozmetike&subcategory=Fytyre',
  '/api/products?category=dermokozmetike&subcategory=Flokët',
  '/api/products?category=higjena&subcategory=Goja',
  '/api/products?category=farmaci&subcategory=Mirëqenia%20seksuale',
  '/api/products?category=mama-dhe-bebat&subcategory=Suplementa'
]

console.log('🌐 TESTING API ENDPOINTS:\n')
console.log('═'.repeat(60))

let completed = 0
let totalTests = testEndpoints.length + testSubcategoryEndpoints.length

const allEndpoints = [
  ...testEndpoints.map(e => ({ type: 'Category', url: e })),
  ...testSubcategoryEndpoints.map(e => ({ type: 'Subcategory', url: e }))
]

const makeRequest = (endpoint) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
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
          const count = Array.isArray(json) ? json.length : json.count || 0
          
          // Extract display info
          let displayUrl = endpoint.url
          if (endpoint.url.includes('&subcategory=')) {
            const parts = endpoint.url.split('&subcategory=')
            const cat = parts[0].split('=')[1]
            const sub = decodeURIComponent(parts[1])
            displayUrl = `${cat}/${sub}`
          } else {
            displayUrl = endpoint.url.split('=')[1]
          }
          
          const status = count > 0 ? '✅' : '❌'
          console.log(`${status} ${endpoint.type.padEnd(15)} ${displayUrl.padEnd(40)} → ${count} products`)
          
          completed++
          resolve({ success: true, count })
        } catch (e) {
          console.log(`❌ ${endpoint.type.padEnd(15)} ${endpoint.url.padEnd(40)} → ERROR: ${e.message}`)
          completed++
          resolve({ success: false, count: 0 })
        }
      })
    })

    req.on('error', (e) => {
      console.log(`❌ ${endpoint.type.padEnd(15)} ${endpoint.url.padEnd(40)} → CONNECTION ERROR`)
      completed++
      resolve({ success: false, count: 0 })
    })

    req.end()
  })
}

// Run tests sequentially
const runTests = async () => {
  for (const endpoint of allEndpoints) {
    await makeRequest(endpoint)
  }
  
  console.log('\n' + '═'.repeat(60))
  console.log(`\n✅ All ${completed} tests completed!\n`)
}

runTests()
