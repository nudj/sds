require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')
const promiseSerial = require('promise-serial')
const kebabCase = require('lodash/kebabCase')

const mailgun = require('./utils/mailgun')
const { readJSON } = require('./utils/fs')
const stall = require('./utils/stall')

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}]

const filterEmails = contact => contact.type === 'personal'

const sendIndividualEmail = async (company, contact) => {
  const industry = company.industry
  const sample = company.sample
  const stage = '1'
  const template = require(`./templates/${kebabCase(industry)}/${sample}/${stage}`)
  const { subject, html } = template(contact)

  await stall(200)
  return mailgun.send({
    from: 'Robyn McGirl <robyn@nudj.co>',
    to: contact.email,
    subject,
    html
  })
}

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)
    const companies = await readJSON(path.resolve(options.src))
    await promiseSerial(companies.map(company => async () => {
      return promiseSerial(
        company.contacts
          .filter(filterEmails)
          .map(contact => async () => sendIndividualEmail(company, contact))
      )
    }))
  } catch (e) {
    console.error(e)
  }
}

run()
