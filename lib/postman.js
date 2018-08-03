require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const getArgs = require('command-line-args')
const _ = require('lodash')
const promiseSerial = require('promise-serial')
const generateHash = require('hash-generator')
const format = require('date-fns/format')
const startOfWeek = require('date-fns/start_of_week')

const setupLogger = require('./utils/logger')
const db = require('./utils/arango')
const mailgun = require('./utils/mailgun')
const stall = require('./utils/stall')
const fsStat = promisify(fs.stat)

const cliOptionsDefinitions = [{
  name: 'sample',
  alias: 's',
  type: String
}, {
  name: 'tap',
  type: Boolean
}]

const options = getArgs(cliOptionsDefinitions)
const dryrun = !options.tap
const logger = setupLogger({
  script: 'Postman',
  prefix: dryrun ? '[Dry run]' : ''
})

const campaign = format(startOfWeek(new Date()), 'DDMM')
const newISODate = () => (new Date()).toISOString()
const stripCarrots = thing => thing.slice(1, -1)

const blacklistedCompaniesCollection = db.collection('blacklistedCompanies')
const blacklistedEmailsCollection = db.collection('blacklistedEmails')
const companiesCollection = db.collection('companies')
const messageHashesCollection = db.collection('messageHashes')

const engagementLevels = [
  'opened',
  'new'
]

const getEngagementLevel = eventsByType => {
  const engagementLevel = engagementLevels.find(level => eventsByType[level])
  return engagementLevel || 'new'
}

const getTemplate = async ({ engagement, industry, sample, nextTrack, messages }, dryrun) => {
  // how far across the user is over all of the tracks, per engagement level
  const trackPositionsByEngagement = _.countBy(messages, 'engagement')
  const trackPosition = trackPositionsByEngagement[nextTrack] || 0

  let templatePath = path.join(
    __dirname,
    'templates',
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
      nextTrack,
      `${trackPosition}.js`
    )
  }

  return templatePath
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

async function sendIndividualEmail (contact, industry, sample, dryrun) {
  try {
    logger.log(`Send to ${contact.email}`)

    // Ensure email address is not blacklisted
    const blacklistedEmailCursor = await blacklistedEmailsCollection.byExample({
      email: contact.email
    })
    const blacklistedEmail = await blacklistedEmailCursor.next()
    if (blacklistedEmail) throw 'Blacklisted'

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

    const templatePath = await getTemplate({
      industry,
      sample,
      nextTrack,
      messages: contact.messages
    }, dryrun)

    const messageHash = generateHash(64)
    const { subject, html } =  mailgun.requireTemplate(
      templatePath,
      {
        ...contact,
        hash: messageHash,
        campaign
      }
    )

    if (dryrun) {
      logger.log(`Send ${messageHash} to ${contact.email}`)
      return contact
    }

    await stall(200)
    const result = await mailgun.send({
      from: 'Robyn McGirl <robyn@nudj.co>',
      to: contact.email,
      subject,
      html
    })

    const mailgunId = stripCarrots(result.id)

    await messageHashesCollection.save({
      created: newISODate(),
      modified: newISODate(),
      mailgunId,
      messageHash
    })

    return {
      ...contact,
      messages: (contact.messages || []).concat({
        mailgunId,
        engagement: nextTrack
      })
    }
  } catch (error) {
    logger.error(`Send to ${contact.email}`, error)
    return contact
  }
}

async function sendCompanyEmails (company, companiesBlacklist, dryrun) {
  const { industry, sample, name } = company
  logger.log(`Send to ${name}`)

  let updatedContacts = company.contacts

  try {
    if (_.find(companiesBlacklist, { name })) throw 'Blacklisted'

    if (company.contacts) {
      updatedContacts = await Promise.all(company.contacts.map(async contact => {
        if (!isPersonal(contact)) return contact
        return sendIndividualEmail(contact, industry, sample, dryrun)
      }))
    }
    logger.success(`Send to ${name}`)
  } catch (error) {
    logger.error(`Send to ${name}`, error)
  }

  return {
    ...company,
    contacts: updatedContacts
  }
}

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)
    if (!options.sample) throw 'You must provide a sample name with argument `-s`, e.g., `00001-jenesis`.'
    const dryrun = !options.tap

    const companies = await companiesCollection.byExample({
      sample: options.sample
    })
    const blacklistedCompaniesCursor = await blacklistedCompaniesCollection.all()
    const companiesBlacklist = await blacklistedCompaniesCursor.all()

    let i = 0

    await companies.each(async company => {
      const updatedCompany = await sendCompanyEmails(company, companiesBlacklist, dryrun)

      logger.log(`Send to ${++i} of ${companies.count} companies succeeded`)

      if (!dryrun) {
        await companiesCollection.update(company._key, updatedCompany)
      } else {
        logger.log(`Update company ${company.name}`)
      }
    })
  } catch (e) {
    logger.error(e)
  }
}

run()
