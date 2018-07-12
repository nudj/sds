require('dotenv').config()
const getArgs = require('command-line-args')
const path = require('path')
const Parser = require('json2csv').Parser
const { writeFileAsync } = require('./utils/fs')
const DB = require('./utils/db')
const db = new DB()

const cliOptionsDefinitions = [{
  name: 'output',
  alias: 'o',
  type: String
}]

async function run () {
  await db.init()
  const options = getArgs(cliOptionsDefinitions)
  const parser = new Parser({
    fields: [
      'value',
      'type',
      'confidence',
      'first_name',
      'last_name',
      'position',
      'seniority',
      'department',
      'linkedin',
      'twitter',
      'phone_number',
      'company'
    ]
  })
  const outputPath = path.resolve(options.output)

  const contactsByCompany = db.read().map(company => {
    if (company.emails) {
      const contacts = company.emails.map(e => {
        return {
          ...e,
          company: company.name
        }
      })

      return contacts
    } else {
      return []
    }
  }).filter(contacts => contacts.length > 0)

  const contactsJSON = [].concat.apply([], contactsByCompany)
  const contactsCSV = parser.parse(contactsJSON)

  await writeFileAsync(outputPath, contactsCSV)
}

run()
