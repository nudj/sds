require('dotenv').config()
const path = require('path')
const _ = require('lodash')
const db = require('./utils/arango')
const getArgs = require('command-line-args')
const logger = require('./utils/logger')({
  script: 'Blacklist'
})

const blacklistedEmailsCollection = db.collection('blacklistedEmails')
const blacklistedCompaniesCollection = db.collection('blacklistedCompanies')

const options = getArgs([{
  name: 'unsubscribes',
  alias: 'u',
  type: String,
  multiple: true
}, {
  name: 'leads',
  alias: 'l',
  type: String,
  multiple: true
}, {
  name: 'companies',
  alias: 'c',
  type: String,
  multiple: true
}])

async function run() {
  try {
    const unsubscribes = options.unsubscribes || [] // Users who requested to unsubscribe
    const leads = options.leads || [] // Users who have responded and we are already engaging with
    const companies = options.companies || [] // Companies that have request to unsubscribe

    logger.log(`Add ${unsubscribes.length + leads.length} emails & ${companies.length} companies`)

    // Blacklist unsubscribed email addresses
    logger.log(`Add ${unsubscribes.length} unsubscribed emails`)
    await Promise.all(unsubscribes.map(async email => {
      logger.log(`Add ${email}`)
      try {
        const existingEmailCursor = await blacklistedEmailsCollection.byExample({ email })

        // If email is not already blacklisted
        if (!existingEmailCursor.hasNext()) {
          await blacklistedEmailsCollection.save({ email, type: 'unsubscribe' })
        }

        logger.success(`Add ${email}`)
      } catch (error) {
        logger.error(`Add ${index + 1} of ${unsubscribes.length} emails`)
      }
    }))
    logger.success(`Add ${unsubscribes.length} unsubscribed emails`)

    // Blacklist leads' email addresses
    logger.log(`Add ${leads.length} leads`)
    await Promise.all(leads.map(async email => {
      logger.log(`Add ${email}`)
      try {
        const existingEmailCursor = await blacklistedEmailsCollection.byExample({ email })

        // If email is not already blacklisted
        if (!existingEmailCursor.hasNext()) {
          await blacklistedEmailsCollection.save({ email, type: 'lead' })
        }

        logger.success(`Add ${email}`)
      } catch (error) {
        logger.error(`Add ${email}`)
      }
    }))
    logger.success(`Add ${leads.length} leads`)

    // Blacklist companies
    logger.log(`Add ${companies.length} unsubscribed companies`)
    await Promise.all(companies.map(async name => {
      logger.log(`Add ${name}`)
      try {
        const exisitingCompanyCursor = await blacklistedCompaniesCollection.byExample({ name })

        // If company is not already blacklisted
        if (!exisitingCompanyCursor.hasNext()) {
          await blacklistedCompaniesCollection.save({ name })
        }

        logger.success(`Add ${name}`)
      } catch (error) {
        logger.error(`Add ${name}`)
      }
    }))
    logger.success(`Add ${companies.length} unsubscribed companies`)

    logger.success(`Add ${unsubscribes.length + leads.length} emails & ${companies.length} companies`)
  } catch (error) {
    logger.error(`Add ${unsubscribes.length + leads.length} emails & ${companies.length} companies`, error)
  }
}

run()
