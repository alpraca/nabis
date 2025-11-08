const http = require('http')

const endpoint = '/api/products?category=farmaci'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: endpoint,
  method: 'GET'
}

console.log(`🔍 Testing endpoint: ${endpoint}\n`)

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`)
  console.log(`Headers: ${JSON.stringify(res.headers)}\n`)
  
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('Raw Response:')
    console.log(data)
    console.log('\n---\n')
    
    try {
      const json = JSON.parse(data)
      console.log('Parsed JSON:')
      console.log(JSON.stringify(json, null, 2))
      
      if (json.products) {
        console.log(`\n✅ Found ${json.products.length} products in farmaci category`)
      } else if (Array.isArray(json)) {
        console.log(`\n✅ Found ${json.length} products (direct array)`)
      } else {
        console.log('\n❌ Unexpected response format')
      }
    } catch (e) {
      console.log(`❌ JSON Parse Error: ${e.message}`)
    }
  })
})

req.on('error', (e) => {
  console.error(`❌ Connection Error: ${e.message}`)
})

req.end()
