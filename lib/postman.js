require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const getArgs = require('command-line-args')
const _ = require('lodash')
const promiseSerial = require('promise-serial')

const db = require('./utils/arango')
const mailgun = require('./utils/mailgun')
// const { readJSON } = require('./utils/fs')
const stall = require('./utils/stall')
const fsStat = promisify(fs.stat)

const cliOptionsDefinitions = [{
  name: 'sample',
  alias: 's',
  type: String
}]

const stripCarrots = thing => thing.slice(1, -1)

const blacklistCollection = db.collection('blacklistedCompanies')
const companiesCollection = db.collection('companies')

const engagementLevels = [
  'clicked',
  'opened',
  'new'
]

const getEngagementLevel = eventsByType => {
  const engagementLevel = engagementLevels.find(level => eventsByType[level])
  return engagementLevel || 'new'
}

const getTemplate = async ({ engagement, industry, sample, nextTrack, messages }) => {
  // how far across the user is over all of the tracks, per engagement level
  const trackPositionsByEngagement = _.countBy(messages, 'engagement')
  const trackPosition = trackPositionsByEngagement[nextTrack] || 0

  let templatePath = path.join(
    __dirname,
    'templates',
    _.kebabCase(industry),
    sample,
    nextTrack,
    `${trackPosition}.js`
  )

  try {
    await fsStat(templatePath)
  } catch (e) {
    // fallback on generic template for the contact's engagement level and stage
    templatePath = path.join(
      __dirname,
      'templates',
      '_generic',
      sample,
      nextTrack,
      `${trackPosition}.js`
    )
  }

  return require(templatePath)
}

const isPersonal = contact => contact.type === 'personal'

const getEvents = (logs) => logs.map(log => ({
  messageId: log.message.headers['message-id'],
  id: log.id,
  event: log.event,
  timestamp: log.timestamp,
  meta: {
    clientInfo: log['client-info']
  }
}))

async function sendIndividualEmail (contact, industry, sample) {
  const logCursor = await db.query(`
    FOR log IN logs
      FILTER log.recipient == @email
      RETURN log
  `, {
    email: contact.email
  })

  const events = await getEvents(logCursor)
  const eventsByType = _.groupBy(events, 'event')

  // the level of engagement the user has reached based on events
  const nextTrack = getEngagementLevel(eventsByType)

  const template = await getTemplate({
    industry,
    sample,
    nextTrack,
    messages: contact.messages
  })

  const { subject, html } = template(contact)

  await stall(200)
  const result = await mailgun.send({
    from: 'Robyn McGirl <robyn@nudj.co>',
    to: contact.email,
    subject,
    html
  })

  const mailgunId = stripCarrots(result.id)

  return {
    ...contact,
    messages: (contact.messages || []).concat({
      mailgunId,
      engagement: nextTrack
    })
  }
}

async function sendCompanyEmails (company, blacklist) {
  const { industry, sample, name } = company
  console.log(`Mailgun: Send to ${name}`)

  let updatedContacts = company.contacts

  try {
    if (_.find(blacklist, { name })) throw 'Blacklisted'

    if (company.contacts) {
      updatedContacts = await Promise.all(company.contacts.map(async contact => {
        if (!isPersonal(contact)) return contact
        return sendIndividualEmail(contact, industry, sample)
      }))
    }
    console.log(`Mailgun: Send to ${name} succeeded`)
  } catch (error) {
    console.error(`Mailgun: Send to ${name} failed.`, error)
  }

  return {
    ...company,
    contacts: updatedContacts
  }
}

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)
    if (!options.sample) throw 'Postman: You must provide a sample name with argument `-s`, e.g., `00001-jenesis`.'

    const companies = await companiesCollection.byExample({
      sample: options.sample
    })
    const blacklistCursor = await blacklistCollection.all()
    const blacklist = await blacklistCursor.all()

    await companies.each(async company => {
      const updatedCompany = await sendCompanyEmails(company, blacklist)

      companiesCollection.update(company._key, updatedCompany)
    })
  } catch (e) {
    console.error(e)
  }
}

run()
