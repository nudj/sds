require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')
const { readJSON } = require('./utils/fs')
const DB = require('./utils/db')

const cliOptionsDefinitions = [{
  name: 'logPath',
  alias: 'l',
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
     * Updates the DB with new data
     */
    const updateDB = async (update) => db.write(
      DB.merge(update, db.read())
    )

    const logs = await readJSON(options.logPath)
    const update = db.read().map(company => {
      console.log(`Mailgun: Add event logs to ${company.name}`)
      let returnVal = company

      try {
        if (company.contacts) {
          returnVal = {
            ...company,
            contacts: company.contacts.map(contact => {
              const relevantLogs = logs
                .filter(log => log.recipient === contact.email)

              const updatedJourney = [...contact.journey]
              if (relevantLogs.length > 0) {
                updatedJourney[0].mailgunId = relevantLogs[0].message.headers['message-id']
                updatedJourney[0].events = relevantLogs.map(log => ({
                  id: log.id,
                  event: log.event,
                  timestamp: log.timestamp,
                  meta: {
                    clientInfo: log['client-info']
                  }
                }))
              }

              return {
                ...contact,
                journey: updatedJourney
              }
            })
          }
        }

        console.log(`Mailgun: Add event logs to ${company.name} succeeded`)
      } catch (e) {
        console.error(`Mailgun: Add events log ${company.name} failed`, e)
      }

      return returnVal
    })

    console.log('DB: Writing...')
    await updateDB(update)
  } catch (e) {
    console.error(e)
  }
}

run()
