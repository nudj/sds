const nameToDomain = require('./name-to-domain')

const namesToDomains = async (companies) => Promise.all(
  companies.map(nameToDomain)
)

module.exports = namesToDomains