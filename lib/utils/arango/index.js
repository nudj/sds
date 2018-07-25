const { Database } = require('arangojs')
const db = new Database({ url: process.env.DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

module.exports = db
