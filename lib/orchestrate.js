require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')
const { readJSON } = require('./utils/fs')
const { namesToDomains } = require('./utils/clearbit')
const { domainsToContacts } = require('./utils/hunter')
const DB = require('./utils/db')

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}, {
  name: 'database',
  alias: 'd',
  type: String
}]

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)

    const db = new DB(options.database)

    /**
     * Primes the DB cache with the input file. Current
     * entries take precedence as they're likely to be
     * more complete
     */
    const primeDB = async (input) => db.write(
      DB.merge(db.read(), input)
    )

    /**
     * Updates the DB with new data
     */
    const updateDB = async (update) => db.write(
      DB.merge(update, db.read())
    )

    await db.init()

    const inputJSON = await readJSON(path.resolve(options.src))
    await primeDB(inputJSON)

    const domainEnrichedData = await namesToDomains(
      db.read().filter(c => !c.clearbit),
      updateDB
    )

    const contactsEnrichedData = await domainsToContacts(
      db.read().filter(c => !c.hunter && c.domain),
      updateDB
    )
  } catch (e) {
    console.error(e)
  }
}

run()
