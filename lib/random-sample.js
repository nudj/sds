require('dotenv').config()
const uniqBy = require('lodash.uniqby')
const path = require('path')
const getArgs = require('command-line-args')
const { readJSON, writeJSON } = require('./utils/fs')
const { namesToDomains } = require('./utils/clearbit')
const { domainsToContacts } = require('./utils/hunter')
const DB = require('./utils/db')

const cliOptionsDefinitions = [{
  name: 'src',
  alias: 's',
  type: String
}, {
  name: 'sampleSize',
  type: Number,
  alias: 'n'
}, {
  name: 'industries',
  alias: 'i',
  multiple: true,
  type: String
}, {
  name: 'output',
  alias: 'o',
  type: String
}]

async function run () {
  const options = getArgs(cliOptionsDefinitions)
  const db = new DB(options.output)

  const inputJSON = await readJSON(path.resolve(options.src))

  const byIndustry = inputJSON.reduce((acc, company) => {
    const current = acc[company.industry]

    acc[company.industry] = current ? [...current, company] : [company]

    return acc
  }, {})

  const sampleSizePerIndustry = ~~(options.sampleSize / options.industries.length)

  const sample = [].concat.apply([], options.industries.map(industry => {
    return byIndustry[industry].slice(0, sampleSizePerIndustry)
  }))

  await db.write(sample)
}

run()
