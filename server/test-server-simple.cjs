const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('✅ Environment loaded:', {
  PORT: process.env.PORT,
  EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET'
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.post('/api/auth/register', (req, res) => {
  console.log('📧 Registration request received:', req.body);
  res.json({ message: 'Test response', data: req.body });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple test server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});
