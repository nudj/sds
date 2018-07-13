require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')

const mailer = require('./utils/mailer')
const template = require('./utils/mailer/template')
const { readJSON } = require('./utils/fs')

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}]

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)
    const companies = await readJSON(path.resolve(options.src))
    await Promise.all(companies.map(company => {
      return Promise.all(company.emails.map(contact => {
        return mailer.send({
          from: 'Robyn McGirl <robyn@nudj.co>',
          to: contact.value,
          subject: 'The secret to hiring the best talent',
          html: template(contact)
        })
      }))
    }))
  } catch (e) {
    console.error(e)
  }
}

run()
