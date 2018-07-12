const axios = require('axios')

const FORBIDDEN = 403

const domainToContacts = async (company) => {
  console.log(`Hunter: Enrich ${company.name}`)

  let emails = null
  let enriched = false

  try {
    const response = await axios({
      url: 'https://api.hunter.io/v2/domain-search',
      params: {
        domain: company.domain,
        api_key: process.env.HUNTER_API_KEY
      }
    })

    console.log(`Hunter: Enrich ${company.name} succeeded`)
    enriched = true

    emails = response.data.data.emails.map(({ sources, ...rest }) => rest)
  } catch (e) {
    if (e.response) {
      console.log(company.name, e.response.status)
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
    hunter: enriched,
    emails: emails
  }
}

module.exports = domainToContacts
