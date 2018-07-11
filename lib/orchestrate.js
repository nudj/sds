require('dotenv').config()
const { namesToDomains } = require('./utils/clearbit')
const { domainsToContacts } = require('./utils/hunter')

const db = [
  {
    name: 'nudj'
  },
  {
    name: 'fundstack'
  }
]

async function run() {
  const domainEnrichedData = await namesToDomains(db)
  const contactsEnrichedData = await domainsToContacts(domainEnrichedData)

  console.log(contactsEnrichedData)
}

run()
