const mailgun = require('mailgun.js')
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
  console.error(`Mailgun: Sending to ${to}`)

  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from,
      to,
      subject,
      html
    })

    console.error(`Mailgun: Send to ${to} succeeded`)
    return response
  } catch (e) {
    console.error(`Mailgun: Send to ${to} failed`)
  }
}

module.exports = send
