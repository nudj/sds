require('dotenv').config()
const format = require('date-fns/format')
const startOfYesterday = require('date-fns/start_of_yesterday')
const endOfYesterday = require('date-fns/end_of_yesterday')
const promiseSerial = require('promise-serial')

const { fetchLogs } = require('./utils/mailgun')
const db = require('./utils/arango')

async function fetchMailgunLogs () {
  const previousDay = startOfYesterday()
  const previousDayEnd = endOfYesterday()


  try {
    console.log('Mailgun: Fetch and save logs')
    const logs = await fetchLogs(previousDay, previousDayEnd)
    const logsCollection = db.collection('logs')

    await promiseSerial(logs.map(log => async () => {
      const existingLogCursor = await logsCollection.byExample({ id: log.id })
      const existingLog = await existingLogCursor.all()

      if (!existingLog.length) {
        console.log(`Mailgun: Save log ${log.id}`)
        return logsCollection.save(log)
      }
      console.log(`Mailgun: Log ${log.id} already exists. Skipping.`)
    }))
    console.log('Mailgun: Fetch and save logs succeeded')
  } catch (error) {
    console.error('Mailgun: Fetch and save logs failed', error)
  }
}

fetchMailgunLogs()
