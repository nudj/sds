require('dotenv').config()
const path = require('path')
const _ = require('lodash')
const promiseSerial = require('promise-serial')
const db = require('./utils/arango')
const { readJSON } = require('./utils/fs')

const filenames = {
  logs: [
    'log.json'
  ],
  companies: [ 'companies.json' ]
}

async function run() {
  console.log('Arango: Seed database')

  try {
    const companiesCollection = db.collection('companies')
    const logsCollection = db.collection('logs')

    await promiseSerial(filenames.logs.map(log => async () => {
      const filepath = path.resolve(path.join('sample', log))

      try {
        console.log(`Arango: Import log ${log}`)
        const data = await readJSON(filepath)
        const result = await logsCollection.import(data)
        console.log(`Arango: Import log ${log} succeeded`)
      } catch (error) {
        console.error(`Arango: Import log ${log} failed`, error)
      }
    }))

    await promiseSerial(filenames.companies.map(company => async () => {
      const filepath = path.resolve(path.join('sample', company))

      try {
        console.log(`Arango: Import company ${company}`)
        const data = await readJSON(filepath)
        const result = await companiesCollection.import(data)
        console.log(`Arango: Import company ${company} succeeded`)
      } catch (error) {
        console.error(`Arango: Import company ${company} failed`, error)
      }
    }))

    console.log('Arango: Seed database succeeded')
  } catch (error) {
    console.error('Arango: Seed database failed', error)
  }
}

run()
