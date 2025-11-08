const http = require('http')

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products?category=fytyre',
  method: 'GET'
}

console.log('Testing: GET http://localhost:3001/api/products?category=fytyre\n')

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)
  
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data)
      console.log(`Products returned: ${json.products.length}`)
      if (json.products.length > 0) {
        console.log(`First: ${json.products[0].brand} ${json.products[0].name.substring(0, 40)}`)
      }
    } catch (e) {
      console.log('Error parsing:', e.message)
    }
    process.exit(0)
  })
})

req.on('error', (e) => {
  console.error('Connection error:', e.message)
  process.exit(1)
})

req.end()
