import sqlite3 from 'sqlite3'
const { Database } = sqlite3.verbose()
const db = new Database('server/database.sqlite')

db.run("UPDATE users SET email_verified=1 WHERE email=?", ['admin@nabisfarmaci.al'], function(err){
  if(err){ console.error('update error', err.message); process.exit(1) }
  console.log('updated rows', this.changes)
  db.close()
})
