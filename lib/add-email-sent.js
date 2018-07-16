require('dotenv').config()
const uniqBy = require('lodash.uniqby')
const path = require('path')
const getArgs = require('command-line-args')
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
    await db.init()

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

    const update = db.read().map(company => {
      if (company.emails) {
        return {
          ...company,
          emails: company.emails.map(email => ({
            ...email,
            sent: true
          }))
        }
      }

      return company
    })

    await updateDB(update)
  } catch (e) {
    console.error(e)
  }
}

run()
