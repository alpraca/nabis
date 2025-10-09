const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Po kontrolloj strukturën e database...');

// Shiko tabela që ekzistojnë
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Gabim në tabela:', err);
  } else {
    console.log('\n📁 Tabelat në database:');
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // Kontrollo strukturën e tabelës categories nëse ekziston
    if (tables.find(t => t.name === 'categories')) {
      db.all("PRAGMA table_info(categories)", (err, columns) => {
        if (!err) {
          console.log('\n🏗️ Struktura e tabelës categories:');
          columns.forEach(col => {
            console.log(`- ${col.name}: ${col.type}`);
          });
        }
        db.close();
      });
    } else {
      console.log('\n⚠️ Tabela categories nuk ekziston!');
      db.close();
    }
  }
});