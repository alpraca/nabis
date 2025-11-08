const emailService = require('./services/emailService.cjs');

(async ()=>{
  try{
    const res = await emailService.sendPasswordResetEmail('anip2955@gmail.com', 'tokentest123', 'Dev Tester');
    console.log('sendPasswordResetEmail result:', res);
  }catch(e){
    console.error('fatal error:', e && e.message ? e.message : e);
  }
})();