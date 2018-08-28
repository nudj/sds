require('dotenv').config()
const uniq = require('lodash/uniq')
const chunk = require('lodash/chunk')
const flattenDeep = require('lodash/flattenDeep')
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

    // Fetch the dates on which the sample group has been emailed
    logger.log('Fetch batch dates')
    const batchDates = await stagingDB.query(queries.fetchBatchDates, { mailgunIds })
    logger.success('Fetch batch dates')

    logger.log(`Fetch main statistics for "${sample}"`)

    // Break mailgunIds into chunks and fetch statistics for each chunk to avoid
    // any timeout issues
    let chunkIndex = 0
    let queryResults = []
    const chunks = chunk(mailgunIds, 100)
    while (chunks[chunkIndex]) {
      logger.log(`Fetch statistics for chunk ${chunkIndex + 1} of ${chunks.length}`)

      const chunkData = await stagingDB.query(queries.fetchStatistics, {
        mailgunIds: chunks[chunkIndex],
        batchDates,
        clickedMailgunIDs
      })
      queryResults.push(chunkData)

      logger.success(`Fetch statistics for chunk ${chunkIndex + 1} of ${chunks.length}`)
      chunkIndex++
    }
    logger.success(`Fetch main statistics for "${sample}"`)

    // Combine the chunked data into single, unified statistics
    logger.log('Merge and compile chunked statistics')
    const queryData = flattenDeep(queryResults).reduce((all, one) => {
      if (all[one.date]) {
        all[one.date].push(one)
      } else {
        all[one.date] = [one]
      }
      return all
    }, {})

    const compiledData = Object.keys(queryData).map(key => {
      const batchData = queryData[key]

      return batchData.reduce((all, one) => ({
        ...all,
        'Sent': all['Sent'] + one.sent,
        'Delivered': all['Delivered'] + one.delivered,
        'Undelivered': all['Undelivered'] + one.undelivered,
        'Opens': all['Opens'] + one.opens,
        'Unique opens': all['Unique opens'] + one.uniqueOpens,
        'Clicks': all['Clicks'] + one.clicks,
      }), {
        Date: key,
        Sample: sample,
        'Sent': 0,
        'Delivered': 0,
        'Undelivered': 0,
        'Opens': 0,
        'Unique opens': 0,
        'Clicks': 0
      })
    })

    const data = compiledData.map(data => ({
      ...data,
      'Open rate': `${((data['Unique opens'] / data['Delivered']) * 100).toFixed(2)}%`,
      'Click rate': `${((data['Clicks'] / data['Delivered']) * 100).toFixed(2)}%`
    }))
    logger.success('Merge and compile chunked statistics')
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
