import ProductUploadSystem from './product-upload-system.js'

async function main(){
  const uploader = new ProductUploadSystem()
  // credentials already set in the script, but ensure they are present
  try{
    uploader.setCredentials('admin@nabisfarmaci.al','Admin123!')
  }catch(e){}
  await uploader.run()
}

main().catch(err=>{ console.error('Uploader failed:', err); process.exit(1) })
