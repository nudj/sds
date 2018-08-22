const uniq = require('lodash/uniq')
const getArgs = require('command-line-args')
const { parse: parseToCSV } = require('json2csv')

const connectToDB = require('./utils/arango/helpers/connect-to-db')
const queries = require('./utils/arango/helpers/queries')
const setupLogger = require('./utils/logger')

const cliOptionsDefinitions = [
  {
    name: 'sample',
    alias: 's',
    type: String
  },
  {
    name: 'format',
    alias: 'f',
    type: String
  }
]

const options = getArgs(cliOptionsDefinitions)
const logger = setupLogger({
  script: 'Campaign Stats'
})

async function run () {
  const { sample } = options
  logger.log('Fetch campaign statistics')

  try {
    if (!sample) throw 'You must provide a sample name with argument `-s`, e.g., `00001-jenesis`.'

    logger.log('Connect to Staging DB and Production DB')
    const [ stagingDB, productionDB ] = await Promise.all([
      connectToDB(process.env.STAGING_DB_URL, {
        db: process.env.STAGING_DB_NAME,
        username: process.env.STAGING_DB_USERNAME,
        password: process.env.STAGING_DB_PASSWORD
      }),
      connectToDB(process.env.PRODUCTION_DB_URL, {
        db: process.env.PRODUCTION_DB_NAME,
        username: process.env.PRODUCTION_DB_USERNAME,
        password: process.env.PRODUCTION_DB_PASSWORD
      })
    ])
    logger.success('Connect to Staging DB and Production DB')

    logger.log(`Fetch Mailgun IDs for sample group "${sample}"`)
    const messageHashes = await stagingDB.query(
      queries.fetchMessageHashesBySample,
      { sample: options.sample }
    )
    logger.success(`Fetch Mailgun IDs for sample group "${sample}"`)

    const { hashes, mailgunIds } = messageHashes.reduce((all, next) => {
      all.hashes = all.hashes.concat(next.messageHash)
      all.mailgunIds = all.mailgunIds.concat(next.mailgunId)
      return all
    }, { hashes: [], mailgunIds: [] })

    logger.log('Fetch viewed message hashes')
    const viewedHashes = await productionDB.query(queries.fetchViewedHashes, { hashes })
    logger.success('Fetch viewed message hashes')

    logger.log('Fetch clicked Mailgun IDs')
    const clickedMailgunIDs = await stagingDB.query(queries.fetchClickedIdsByHash, { viewedHashes })
    logger.success('Fetch clicked Mailgun IDs')

    // Long-running query
    logger.log(`Fetch and format main statistics for "${sample}"`)
    const data = await stagingDB.query(queries.fetchStatistics, {
      mailgunIds,
      clickedMailgunIDs,
      sample
    })
    logger.success(`Fetch and format main statistics for "${sample}"`)

    if (options.format === 'csv') {
      const csv = parseToCSV(data, {
        fields: [
          "Sample",
          "Date",
          "Sent",
          "Delivered",
          "Undelivered",
          "Opens",
          "Unique opens",
          "Clicks",
          "Open rate",
          "Click rate"
        ]
      })
      console.log(csv)
    } else {
      console.log(data)
    }
  } catch (error) {
    logger.error('Fetch campaign statistics', error)
  }
}

run()
