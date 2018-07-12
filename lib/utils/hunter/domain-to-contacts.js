const axios = require('axios')

const domainToContacts = async (company) => {
  if (process.env.DEBUG === 'true') console.log(`Hunter: Enrich ${company.name}`)

  try {
    const response = await axios({
      url: 'https://api.hunter.io/v2/domain-search',
      params: {
        domain: company.domain,
        api_key: 'f3ba39dac86a5dbf5694610daf045f2ab8e22608'
      }
    })

    if (process.env.DEBUG === 'true') console.log(`Hunter: Enrich ${company.name} succeeded`)

    return {
      ...company,
      emails: response.data.data.emails.map(({ sources, ...rest }) => rest),
      hunter: true
    }
  } catch (e) {
    console.error(`Hunter: Enrich ${company.name} failed`, e)

    return {
      ...company,
      hunter: true,
      emails: null
    }
  }
}

module.exports = domainToContacts