const axios = require('axios');

(async ()=>{
  try{
    const email = process.env.TEST_EMAIL || 'anip2955@gmail.com';
    console.log('Requesting forgot-password for', email);
    const res = await axios.post('http://localhost:3001/api/auth/forgot-password', { email });
    console.log('status', res.status);
    console.log(res.data);
  }catch(e){
    if(e.response){
      console.error('status', e.response.status);
      console.error(e.response.data);
    } else {
      console.error(e.message);
    }
  }
})();