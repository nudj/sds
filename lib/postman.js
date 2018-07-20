require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const getArgs = require('command-line-args')
const promiseSerial = require('promise-serial')
const kebabCase = require('lodash/kebabCase')
const countBy = require('lodash/countBy')

const mailgun = require('./utils/mailgun')
const { readJSON } = require('./utils/fs')
const stall = require('./utils/stall')
const fsStat = promisify(fs.stat)

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}]

const engagementLevels = [
  'new',
  'opened',
  'clicked'
]

const reverse = arr => arr.map((value, key) => {
  return arr[arr.length - 1 - key]
})

const filterEmails = contact => contact.type === 'personal'
const stripCarrots = thing => thing.slice(1, -1)

const getEngagementAndStageFromContact = contact => {
  const engagementByCount = contact.messages.reduce((result, message) => {
    return message.events.reduce((result, event) => {
      const eventType = event.event
      if (!result[eventType]) {
        result[eventType] = 1
      } else {
        result[eventType] = result[eventType] + 1
      }
      return result
    }, result)
  }, {})
  const engagement = reverse(engagementLevels).find(level => engagementByCount[level]) || 'new'

  const messagesCountPerEngagement = countBy(contact.messages, 'engagement')
  const stage = messagesCountPerEngagement[engagement] ? messagesCountPerEngagement[engagement] - 1 : -1

  return {
    engagement,
    stage
  }
}

const sendIndividualEmail = async (company, contact) => {
  const { industry, sample } = company
  const { engagement, stage: latestStage } = getEngagementAndStageFromContact(contact)

  // We do not want to send them more than 3 emails per engagement level
  if (latestStage > 1) return

  const stage = latestStage + 1

  console.log(engagement, stage)

  let templatePath = path.join(__dirname, 'templates', kebabCase(industry), sample, engagement, `${stage}.js`)

  try {
    // confirm template exists
    await fsStat(templatePath)
  } catch (error) {
    // fallback on generic template for the contact's engagement level and stage
    templatePath = path.join(__dirname, 'templates', '_generic', engagement, `${stage}.js`)
  }

  const template = require(templatePath)
  const { subject, html } = template(contact)

  await stall(200)
  const result = await mailgun.send({
    from: 'Robyn McGirl <robyn@nudj.co>',
    to: contact.email,
    subject,
    html
  })
  const mailgunId = stripCarrots(result.id)

  // TODO: Update db.json with mailgunId
  console.log(mailgunId)
}

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)
    const companies = await readJSON(path.resolve(options.src))
    await promiseSerial(
      companies
        // .filter(blacklist)
        .map(company => async () => {
          return promiseSerial(
            company.contacts
              .filter(filterEmails)
              .map(contact => async () => sendIndividualEmail(company, contact))
          )
        })
    )
  } catch (e) {
    console.error(e)
  }
}

run()
