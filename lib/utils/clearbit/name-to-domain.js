const axios = require('axios')

const nameToDomain = async (company) => {
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

    return {
      ...company,
      domain: response.data.domain,
      clearbit: true
    }
  } catch (e) {
    if (e.data.error) {
      console.error(e.data.error)
    } else {
      console.error(`Unable to enrich company ${company.name}`, e)
    }

    return {
      ...company,
      domain: null,
      clearbit: true
    }
  }
}

module.exports = nameToDomain