const chunk = require('lodash/chunk')
const promiseSerial = require('promise-serial')

const nameToDomain = require('./name-to-domain')

const BATCH_AMOUNT = process.env.CLEARBIT_BATCH_AMOUNT // 5 concurrent connections are allowed
const stall = time => new Promise(resolve => setTimeout(resolve, time))

const namesToDomains = async (all) => {
  console.log(`Clearbit: Enriching ${all.length} companies`)
  const chunkedCompanies = chunk(all, BATCH_AMOUNT)

  const chunkedEnriched = await promiseSerial(chunkedCompanies.map(companies => async () => {
    console.log(`Clearbit: Enriching ${companies.length} companies...`)
    const enriched = await Promise.all(companies.map(nameToDomain))
    await stall(2000)
    return enriched
  }))

  console.log(`Clearbit: Enrichment attempt of ${all.length} companies complete`)

  return [].concat.apply([], chunkedEnriched)
}

module.exports = namesToDomains
