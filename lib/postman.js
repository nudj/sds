require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')

const mailer = require('./utils/mailer')
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
          from: 'robyn@nudj.co',
          to: contact.email,
          subject: 'Test subject',
          html: 'Test content'
        })
      }))
    }))
  } catch (e) {
    console.error(e)
  }
}

run()
