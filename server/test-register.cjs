const axios = require('axios');

(async ()=>{
  try{
    console.log('DEV_AUTO_VERIFY env:', process.env.DEV_AUTO_VERIFY)
    const payload = {
      name: 'Test User',
      email: process.env.TEST_EMAIL || 'anip2955@gmail.com',
      password: 'Test1234'
    };
    console.log('Registering with', payload.email);
    const res = await axios.post('http://localhost:3001/api/auth/register', payload);
    console.log('status', res.status);
    console.log(res.data);

    if(res.data.requiresVerification) {
      console.log('Registration requires verification. If TEST_EMAIL is set, check that inbox.');
    }
  }catch(e){
    if(e.response){
      console.error('status', e.response.status);
      console.error(e.response.data);
    } else {
      console.error(e.message);
    }
  }
})();