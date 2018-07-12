const chunk = require('lodash/chunk')
const promiseSerial = require('promise-serial')

const domainToContacts = require('./domain-to-contacts')

const BATCH_AMOUNT = 75 // half the request/second limit
const stall = time => new Promise(resolve => setTimeout(resolve, time))

const domainsToContacts = async (all) => {
  const chunkedCompanies = chunk(all, BATCH_AMOUNT)

  const chunkedEnriched = await promiseSerial(chunkedCompanies.map(companies => async () => {
    const enriched = await Promise.all(companies.map(domainToContacts))
    await stall(2000)
    return enriched
  }))

  return [].concat.apply([], chunkedEnriched)
}

module.exports = domainsToContacts