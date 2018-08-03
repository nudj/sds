const axios = require('axios')
const logger = require('../logger')({
  script: 'Hunter'
})

const FORBIDDEN = 403

const domainToContacts = async (company) => {
  logger.log(`Enrich ${company.name}`)

  let data = null
  let emails = null
  let enriched = false

  try {
    const response = await axios({
      url: 'https://api.hunter.io/v2/domain-search',
      params: {
        domain: company.domain,
        type: 'personal',
        api_key: process.env.HUNTER_API_KEY
      }
    })

    logger.success(`Enrich ${company.name}`)
    enriched = true

    data = response.data
    emails = response.data.data.emails.map(({ sources, value, ...rest }) => ({
      ...rest,
      email: value
    }))
  } catch (error) {
    if (error.response) {
      logger.log(company.name, error.response.status)
      if (error.response.status === FORBIDDEN) {
        logger.error(`Enrich ${company.name}`, 'Request limit likely exceeded')
      } else {
        const errors = error.response.data.errors.map(error =>
          `Enrich ${company.name} failed. [${error.code}] ${error.id}, ${error.details}`
        )

        logger.error(errors.join('\n'))
      }
    } else {
      logger.error(`Enrich ${company.name}`, error)
    }
  }

  return {
    ...company,
    hunter: enriched,
    hunterMeta: data,
    contacts: emails
  }
}

module.exports = domainToContacts
