const axios = require('axios')

const FORBIDDEN = 403

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
    if (e.response) {
      if (e.response.status === FORBIDDEN) {
        console.error(`Hunter: Enrich ${company.name} failed. Request limit likely exceeded`)
      } else {
        const errors = e.response.data.errors.map(error =>
          `Hunter: Enrich ${company.name} failed. [${error.code}] ${error.id}, ${error.details}`
        )

        console.error(errors.join('\n'))
      }
    } else {
      console.error(`Hunter: Enrich ${company.name} failed`, e)
    }
  }

  return {
    ...company,
    hunter: true,
    emails: emails
  }
}

module.exports = domainToContacts
