require('dotenv').config()
const path = require('path')
const { nameToDomain } = require('./utils/clearbit')
const { domainToContacts } = require('./utils/hunter')
const stall = require('./utils/stall')
const db = require('./utils/arango')
const setupLogger = require('./utils/logger')
const getArgs = require('command-line-args')

const cliOptionsDefinitions = [{
  name: 'sample',
  alias: 's',
  type: String
}]

const options = getArgs(cliOptionsDefinitions)
const companiesCollection = db.collection('companies')

const sampleFilter = 'FILTER company.sample == @sample'

const getChunk = async (cursor) => {
  // Form array of batch length with data from cursor
  const length = parseInt(process.env.CLEARBIT_BATCH_AMOUNT)
  const chunks = await Promise.all(
    Array.from(Array(length), () => cursor.next())
  )

  return chunks.filter(Boolean)
}

async function enrichViaClearbit (sample) {
  const logger = setupLogger({ script: 'Clearbit' })
  const cursor = await db.query(`
    FOR company IN companies
      FILTER company.clearbit == null
      ${sample ? sampleFilter : ''}
      RETURN company
  `, { sample }, { count: true })

  try {
    logger.log(`Enrich ${cursor.count} companies`)

    // Set up counts for logging progress
    let enrichedCount = 0
    let chunkNumber = 1
    let chunkCount = Math.floor(cursor.count / process.env.CLEARBIT_BATCH_AMOUNT)

    // While the cursor has more data, continue enriching
    while (cursor.hasNext()) {
      logger.log(`${enrichedCount} companies enriched`)
      logger.log(`Enrich chunk ${chunkNumber} of ${chunkCount}`)

      // Fetch cursor data in chunks to avoid memory overload
      const chunk = await getChunk(cursor)
      await Promise.all(chunk.map(async company => {
        const enrichedCompany = await nameToDomain(company)
        await companiesCollection.update(company._key, enrichedCompany)
      }))

      logger.success(`Enrich chunk ${chunkNumber++} of ${chunkCount}`)
      enrichedCount = enrichedCount + chunk.length

      // Pause to avoid hitting rate limits
      await stall(2000)
    }

    logger.success(`Enrich ${cursor.count} companies`)
  } catch (error) {
    logger.error(`Enrich ${cursor.count} companies`, error)
  }
}

async function enrichViaHunter (sample) {
  const logger = setupLogger({ script: 'Hunter' })
  const cursor = await db.query(`
    FOR company IN companies
      FILTER company.hunter == null && company.domain != null
      ${sample ? sampleFilter : ''}
      RETURN company
  `, { sample }, { count: true })

  try {
    logger.log(`Enrich ${cursor.count} companies`)

    // Set up counts for logging progress
    let enrichedCount = 0
    let chunkNumber = 1
    let chunkCount = Math.floor(cursor.count / process.env.CLEARBIT_BATCH_AMOUNT)

    // While the cursor has more data, continue enriching
    while (cursor.hasNext()) {
      logger.log(`${enrichedCount} companies enriched`)
      logger.log(`Enrich chunk ${chunkNumber} of ${chunkCount}`)

      // Fetch cursor data in chunks to avoid memory overload
      const chunk = await getChunk(cursor)
      await Promise.all(chunk.map(async company => {
        const enrichedCompany = await domainToContacts(company)
        await companiesCollection.update(company._key, enrichedCompany)
      }))

      logger.success(`Enrich chunk ${chunkNumber++} of ${chunkCount}`)
      enrichedCount = enrichedCount + chunk.length

      // Pause to avoid hitting rate limits
      await stall(2000)
    }

    logger.success(`Enrich ${cursor.count} companies`)
  } catch (error) {
    logger.error(`Enrich ${cursor.count} companies`, error)
  }
}

async function run () {
  const logger = setupLogger({ script: 'Enrichment' })
  if (options.sample) {
    logger.log(`Enrich sample group: ${options.sample}`)
  } else {
    logger.log(`Enrich all`)
  }

  try {
    logger.log('Enrich companies')
    await enrichViaClearbit(options.sample)
    await enrichViaHunter(options.sample)
    logger.success('Enrich companies')
  } catch (error) {
    logger.error('Enrich companies', error)
  }
}

run()
