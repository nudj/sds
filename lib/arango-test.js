require('dotenv').config()
const path = require('path')
const _ = require('lodash')
const db = require('./utils/arango')
const { readJSON } = require('./utils/fs')

const reverse = arr => arr.map((value, key) => {
  return arr[arr.length - 1 - key]
})

const engagementLevels = [
  'clicked',
  'opened',
  'new'
]

const getEngagementLevel = eventsByType => {
  const engagementLevel = engagementLevels.find(level => eventsByType[level])
  return engagementLevel || 'new'
}

const getTemplate = (industry, sample, engagement, stage) => path.join(
  __dirname,
  'templates',
  _.kebabCase(industry),
  sample,
  engagement,
  `${stage}.js`
)

const filterEmails = contact => contact.type === 'personal'

async function run() {
  const companiesCollection = db.collection('companies')
  const logsCollection = db.collection('logs')

  // const logs = await readJSON('./data/2018-07-22.mailgun.log.json')

  // const logsImportResult = await logsCollection.import(logs)
  // console.log(logsImportResult)

  const cursor = await companiesCollection.all()
  await cursor.each(company => {
    const { industry, sample } = company

    company.contacts && company.contacts.filter(filterEmails).forEach(async contact => {
      const logCursor = await db.query(`
        FOR log IN logs
          FILTER log.recipient == @email
          RETURN log
      `, {
        email: contact.email
      })

      const logs = await logCursor.all()
      const events = logs.map(log => ({
        messageId: log.message.headers['message-id'],
        id: log.id,
        event: log.event,
        timestamp: log.timestamp,
        meta: {
          clientInfo: log['client-info']
        }
      }))

      const eventsByType = _.groupBy(events, 'event')

      // the level of engagement the user has reached based on events 
      const nextTrack = getEngagementLevel(eventsByType)

      // how far across the user is over all of the tracks, per engagement level 
      const trackPositionsByEngagement = _.countBy(contact.messages, 'engagement')
      const trackPosition = trackPositionsByEngagement[nextTrack] || 0

      console.log(company._key, contact.email, getTemplate(industry, sample, nextTrack, trackPosition))
    })
  })
}

run()
