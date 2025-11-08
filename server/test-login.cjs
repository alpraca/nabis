const axios = require('axios');

(async ()=>{
  try{
    const res = await axios.post('http://localhost:3001/api/auth/login', { email: 'admin@nabisfarmaci.al', password: 'Admin123!' });
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