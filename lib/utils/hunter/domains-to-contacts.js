const chunk = require('lodash/chunk')
const promiseSerial = require('promise-serial')

const domainToContacts = require('./domain-to-contacts')

const BATCH_AMOUNT = process.env.HUNTER_BATCH_AMOUNT // half the request/second limit
const stall = time => new Promise(resolve => setTimeout(resolve, time))

const domainsToContacts = async (all, callback) => {
  const chunkedCompanies = chunk(all, BATCH_AMOUNT)
  console.log(`Hunter: Enriching ${all.length} companies, ${chunkedCompanies.length} chunks`)

  const chunkedEnriched = await promiseSerial(chunkedCompanies.map((companies, i) => async () => {
    const currentChunkIndex = i + 1
    console.log(`Hunter: Enriching chunk ${currentChunkIndex} of ${chunkedCompanies.length}`)

    const enriched = await Promise.all(companies.map(domainToContacts))

    typeof callback === 'function' && callback(enriched)

    await stall(2000)
    return enriched
  }))

  console.log(`Hunter: Enrichment attempt of ${all.length} companies complete`)

  return [].concat.apply([], chunkedEnriched)
}

module.exports = domainsToContacts
