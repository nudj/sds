const injectLog = require('./inject-log')

const injectLogs = async (companies, logs, callback) => {
  return companies.map(company => {
    console.log(`Mailgun: Add event logs to ${company.name}`)
    let returnVal = company

    try {
      if (company.contacts) {
        returnVal = {
          ...company,
          contacts: company.contacts.map(contact => injectLog(contact, logs))
        }
      }

      typeof callback === 'function' && callback([returnVal])

      console.log(`Mailgun: Add event logs to ${company.name} succeeded`)
    } catch (e) {
      console.error(`Mailgun: Add events log ${company.name} failed`, e)
    }

    return returnVal
  })
}

module.exports = injectLogs
