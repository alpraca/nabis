const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const excelFile = path.join(__dirname, 'farmaon_products.xlsx');
if (!fs.existsSync(excelFile)) {
  console.error('Excel file not found:', excelFile);
  process.exit(1);
}
const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const headers = data[0] || [];
console.log('Headers found in Excel sheet:');
headers.forEach((h, i) => console.log(i+1, h));

console.log('\nSample first row values:');
const sample = XLSX.utils.sheet_to_json(worksheet)[0];
console.log(sample);
