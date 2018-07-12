require('dotenv').config()
const uniqBy = require('lodash.uniqby')
const path = require('path')
const getArgs = require('command-line-args')
const { readJSON, writeJSON } = require('./utils/fs')
const { namesToDomains } = require('./utils/clearbit')
const { domainsToContacts } = require('./utils/hunter')

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}]

const writeDB = db => writeJSON(path.resolve('./db.json'), db)
const readDB = db => readJSON(path.resolve('./db.json'))

const getDB = async (input) => {
  const dbJSON = await readDB()
  const merged = [ ...dbJSON, ...input]
  const unique = uniqBy(merged, (n) => n.name)

  return writeDB(unique)
}

const updateDB = async (update) => {
  const dbJSON = await readDB()
  const merged = [ ...update, ...dbJSON]
  const unique = uniqBy(merged, (n) => n.name)

  return writeDB(unique)
}

async function run() {
  try {
    const options = getArgs(cliOptionsDefinitions)
    const inputJSON = await readJSON(path.resolve(options.src))

    let db = await getDB(inputJSON)

    const domainEnrichedData = await namesToDomains(db.filter(c => !c.clearbit))

    db = await updateDB(domainEnrichedData)

    const contactsEnrichedData = await domainsToContacts(db.filter(c => !c.hunter))

    db = await updateDB(contactsEnrichedData)
  } catch (e) {
    console.error(e)
  }
}

run()
