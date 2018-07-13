const Mailgun = require('mailgun-js')
const mailgun = Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})

module.exports.send = ({
  from,
  to,
  subject,
  html
}) => {
  return mailgun
    .messages()
    .send({
      from,
      to,
      subject,
      html
    })
    .then((reply) => {
      console.log('info', 'Mailer response', reply)
      return {
        success: true
      }
    })
}
