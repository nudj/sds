const axios = require('axios')

const domainToContacts = async (company) => {
  console.log(`Hunter: Enrich ${company.name}`)

  let emails = null

  try {
    const response = await axios({
      url: 'https://api.hunter.io/v2/domain-search',
      params: {
        domain: company.domain,
        api_key: process.env.HUNTER_API_KEY
      }
    })

    console.log(`Hunter: Enrich ${company.name} succeeded`)

    emails = response.data.data.emails.map(({ sources, ...rest }) => rest)
  } catch (e) {
    console.error(`Hunter: Enrich ${company.name} failed`, e)
  }

  return {
    ...company,
    hunter: true,
    emails: emails
  }
}

module.exports = domainToContacts
