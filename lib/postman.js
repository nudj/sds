require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')
const promiseSerial = require('promise-serial')

const mailgun = require('./utils/mailgun')
const template = require('./utils/mailgun/template')
const { readJSON } = require('./utils/fs')
const stall = require('./utils/stall')

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}]

const filterEmails = contact => contact.type === 'personal'

const sendIndividualEmail = async contact => {
  await stall(200)
  return mailgun.send({
    from: 'Robyn McGirl <robyn@nudj.co>',
    to: contact.value,
    subject: 'The secret to hiring the best talent',
    html: template(contact)
  })
}

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)
    const companies = await readJSON(path.resolve(options.src))
    await promiseSerial(companies.map(company => async () => {
      return promiseSerial(
        company.emails
          .filter(filterEmails)
          .map(contact => async () => sendIndividualEmail(contact))
      )
    }))
  } catch (e) {
    console.error(e)
  }
}

run()
