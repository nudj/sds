const db = require('../../arango')

const query = `
  LET mailgunIds = FLATTEN(
    FOR company IN companies
      // Filter out companies that have no contacts
      FILTER company.contacts != null

      // Form an array of company email addresses
      LET emails = (
        FOR contact IN company.contacts
          RETURN contact.email
      )

      // Check for the email address
      FILTER POSITION(emails, @email)

      // Fetch messages for appropriate contact
      FOR contact IN company.contacts
        FILTER contact.messages != null // Otherwise "contact.messages[*]" will fail
        FILTER CONTAINS(contact.email, @email)

        // Return combined array of mailgunIds
        RETURN contact.messages[*].mailgunId
  )

  // Find the logs with the relevant messageIds
  FOR log IN logs
    FILTER log.message != null && log.message.headers != null
    FILTER POSITION(mailgunIds, log.message.headers["message-id"])
    RETURN log
`

const fetchCampaignLogsByEmail = async (email, options = {}) => {
  const result = await db.query(query, { email })
  return options.cursor ? result : result.all()
}

module.exports = fetchCampaignLogsByEmail
