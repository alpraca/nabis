require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
console.log('EMAIL_USER:', emailUser ? 'SET' : 'MISSING');
console.log('EMAIL_PASS:', emailPass ? 'SET' : 'MISSING');

if (!emailUser || !emailPass) {
  console.error('EMAIL credentials missing in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error('Transporter verify error:', error && error.message ? error.message : error);
    process.exit(2);
  } else {
    console.log('Transporter verified: ready to send');
    // send a small test message
    transporter.sendMail({
      from: emailUser,
      to: process.env.TEST_EMAIL || emailUser,
      subject: 'Nabis test',
      text: 'This is a test from nabis local dev'
    }, (err, info) => {
      if (err) {
        console.error('sendMail error:', err && err.message ? err.message : err);
        process.exit(3);
      }
      console.log('sendMail success, messageId:', info && info.messageId);
      process.exit(0);
    });
  }
});
