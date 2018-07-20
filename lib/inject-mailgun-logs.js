require('dotenv').config()
const path = require('path')
const getArgs = require('command-line-args')
const { readJSON } = require('./utils/fs')
const DB = require('./utils/db')
const { injectLogs } = require('./utils/mailgun')

const cliOptionsDefinitions = [{
  name: 'logPath',
  alias: 'l',
  type: String
}, {
  name: 'database',
  alias: 'd',
  type: String
}]

async function run () {
  try {
    const options = getArgs(cliOptionsDefinitions)

    const logs = await readJSON(options.logPath)
    const db = new DB(options.database)
    await db.init()

    await injectLogs(db.read(), logs, db.update)
  } catch (e) {
    console.error(e)
  }
}

run()
