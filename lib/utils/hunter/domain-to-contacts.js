const axios = require('axios')

const domainToContacts = async (company) => {
  try {
    const response = await axios({
      url: 'https://api.hunter.io/v2/domain-search',
      params: {
        domain: company.domain,
        api_key: 'f3ba39dac86a5dbf5694610daf045f2ab8e22608'
      }
    })

    return {
      ...company,
      emails: response.data.data.emails,
      hunter: true
    }
  } catch (e) {
    console.error(e)

    return {
      ...company,
      hunter: true,
      emails: null
    }
  }
}

module.exports = domainToContacts