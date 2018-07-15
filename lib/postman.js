require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')
const promiseSerial = require('promise-serial')

const mailer = require('./utils/mailer')
const template = require('./utils/mailer/template')
const { readJSON } = require('./utils/fs')

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}]

const stall = time => new Promise(resolve => setTimeout(resolve, time))

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)
    const companies = await readJSON(path.resolve(options.src))
    await promiseSerial(companies.map(company => async () => {
      return promiseSerial(company.emails.map(contact => async () => {
        if (contact.type === 'personal') {
          await stall(200)
          return mailer.send({
            from: 'Robyn McGirl <robyn@nudj.co>',
            to: contact.value,
            subject: 'The secret to hiring the best talent',
            html: template(contact)
          })
        }
      }))
    }))
  } catch (e) {
    console.error(e)
  }
}

run()
