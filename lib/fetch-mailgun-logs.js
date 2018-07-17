require('dotenv').config()
const format = require('date-fns/format')
const startOfYesterday = require('date-fns/start_of_yesterday')
const endOfYesterday = require('date-fns/end_of_yesterday')
const { readJSON, writeJSON } = require('./utils/fs')
const { fetchLogs } = require('./utils/mailgun')

async function fetchMailgunLogs () {
  const previousDay = startOfYesterday()
  const previousDayEnd = endOfYesterday()
  const fileNamePrefix = format(previousDay, 'YYYY-MM-DD')

  const logs = await fetchLogs(previousDay, previousDayEnd)

  console.log(`Mailgun: Fetch complete. Writing log ${fileNamePrefix}.mailgun.log.json`)
  await writeJSON(`${process.env.MAILGUN_LOG_DESTINATION}${fileNamePrefix}.mailgun.log.json`, logs, 'utf-8')
}

fetchMailgunLogs()
