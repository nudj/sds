const mailgun = require('mailgun.js')
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
})

const fetchLogs = async (begin, end) => {
  console.log(`Mailgun: fetching initial logs for ${begin} to ${end}`)

  let data = []
  let page = 1
  const beginTime = begin.getTime() / 1000
  const endTime = end.getTime() / 1000

  try {
    let response = await mg.events.get(process.env.MAILGUN_DOMAIN, {
      begin: beginTime,
      end: endTime,
      limit: 300
    })

    data = [...data, ...response.items]

    while (response.pages && response.pages.next && response.items.length > 0) {
      page += 1

      console.log(`Mailgun: additional page detected. Fetching... (Page ${page})`)
      response = await mg.events.get(process.env.MAILGUN_DOMAIN, {
        begin: beginTime,
        end: endTime,
        limit: 300,
        page: response.pages.next.number
      })

      data = [...data, ...response.items]
    }
  } catch (e) {
    console.error(e)
  }

  return data
}

module.exports = fetchLogs
