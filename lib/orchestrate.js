require('dotenv').config()
const { namesToDomains } = require('./utils/clearbit')

const db = [
  {
    name: 'nudj'
  },
  {
    name: 'fundstack'
  }
]

async function run() {
  const domains = await namesToDomains(db)

  console.log(domains)
}

run()
