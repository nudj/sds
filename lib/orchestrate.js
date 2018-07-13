require('dotenv').config()
const uniqBy = require('lodash.uniqby')
const path = require('path')
const getArgs = require('command-line-args')
const { readJSON, writeJSON } = require('./utils/fs')
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

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)

    const db = new DB(options.database)
    await db.init()

    const inputJSON = await readJSON(path.resolve(options.src))
    await primeDB(inputJSON)

    const domainEnrichedData = await namesToDomains(db.read().filter(c => !c.clearbit))
    await updateDB(domainEnrichedData)

    const contactsEnrichedData = await domainsToContacts(db.read().filter(c => !c.hunter && c.domain))
    await updateDB(contactsEnrichedData)
  } catch (e) {
    console.error(e)
  }
}

run()
