const mailgun = require('mailgun.js')
const logger = require('../logger')({
  script: 'Mailgun'
})

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
})

const send = async ({
  from,
  to,
  subject,
  html
}) => {
  logger.log(`Sending to ${to}`)

  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from,
      to,
      subject,
      html
    })

    logger.success(`Send to ${to} succeeded`)
    return response
  } catch (e) {
    logger.error(`Send to ${to} failed`)
  }
}

module.exports = send
