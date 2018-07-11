const domainToContacts = require('./domain-to-contacts')

const domainsToContacts = async (companies) => Promise.all(
  companies.map(domainToContacts)
)

module.exports = domainsToContacts