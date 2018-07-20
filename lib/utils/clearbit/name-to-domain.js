const axios = require('axios')

const nameToDomain = async (company) => {
  console.log(`Clearbit: Enrich ${company.name}`)

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

    console.log(`Clearbit: Enrich ${company.name} succeeded`)

    enriched = true
    data = response.data
    domain = response.data.domain
  } catch (e) {
    if (e.response) {
      if (e.response.status === 404) {
        enriched = true
        console.error(`Clearbit: Enrich ${company.name} failed. Company doesn't exist`)
      } else {
        console.error(`Clearbit: Enrich ${company.name} failed. ${e.response.statusText}. ${e.response.data.error.message}`)
      }
    } else {
      console.error(`Clearbit: Enrich ${company.name} failed`, e)
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
