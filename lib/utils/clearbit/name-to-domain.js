const axios = require('axios')
const logger = require('../logger')({
  script: 'Clearbit'
})

const nameToDomain = async (company) => {
  logger.log(`Enrich ${company.name}`)

  let data = null
  let domain = null
  let enriched = false

  try {
    const response = await axios({
      url: 'https://company-stream.clearbit.com/v1/domains/find',
      auth: {
        username: process.env.CLEARBIT_API_KEY
      },
      params: {
        name: company.name
      }
    })

    if (!response.data.domain) {
      throw new Error('No domain returned')
    }

    logger.success(`Enrich ${company.name}`)

    enriched = true
    data = response.data
    domain = response.data.domain
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        enriched = true
        logger.error(`Enrich ${company.name}`, 'Company doesn\'t exist')
      } else {
        logger.error(`Enrich ${company.name}`, `${error.response.statusText}. ${error.response.data.error.message}`)
      }
    } else {
      logger.error(`Enrich ${company.name}`, error)
    }
  }

  return {
    ...company,
    domain: domain,
    clearbitMeta: data,
    clearbit: enriched
  }
}

module.exports = nameToDomain
