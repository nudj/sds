const axios = require('axios')

const nameToDomain = async (company) => {
  if (process.env.DEBUG === 'true') console.log(`Clearbit: Enrich ${company.name}`)

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

    if (process.env.DEBUG === 'true') console.log(`Clearbit: Enrich ${company.name} succeeded`)

    return {
      ...company,
      domain: response.data.domain,
      clearbit: true
    }
  } catch (e) {
    if (e.data.error) {
      console.error(`Clearbit: Enrich ${company.name} failed`, e.data.error)
    } else {
      console.error(`Clearbit: Enrich ${company.name} failed`, e)
    }

    return {
      ...company,
      domain: null,
      clearbit: true
    }
  }
}

module.exports = nameToDomain