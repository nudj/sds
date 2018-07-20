const chunk = require('lodash/chunk')
const promiseSerial = require('promise-serial')

const nameToDomain = require('./name-to-domain')

const BATCH_AMOUNT = process.env.CLEARBIT_BATCH_AMOUNT // 5 concurrent connections are allowed
const stall = time => new Promise(resolve => setTimeout(resolve, time))

const namesToDomains = async (all, callback) => {
  const chunkedCompanies = chunk(all, BATCH_AMOUNT)
  console.log(`Clearbit: Enriching ${all.length} companies, ${chunkedCompanies.length} chunks`)

  const chunkedEnriched = await promiseSerial(chunkedCompanies.map((companies, i) => async () => {
    const currentChunkIndex = i + 1
    console.log(`Clearbit: Enriching chunk ${currentChunkIndex} of ${chunkedCompanies.length}`)

    const enriched = await Promise.all(companies.map(nameToDomain))
    typeof callback === 'function' && callback(enriched)

    await stall(2000)
    return enriched
  }))

  console.log(`Clearbit: Enrichment attempt of ${all.length} companies complete`)

  return [].concat.apply([], chunkedEnriched)
}

module.exports = namesToDomains
