const uniqBy = require('lodash.uniqby')

const injectLog = (contact, logs) => {
  const events = logs
    .filter(log => log.recipient === contact.email)
    .map(log => ({
      messageId: log.message.headers['message-id'],
      id: log.id,
      event: log.event,
      timestamp: log.timestamp,
      meta: {
        clientInfo: log['client-info']
      }
    }))

  let updatedJourney = contact.messages

  if (events.length > 0) {
    updatedJourney = contact.messages.map(message => {
      return {
        ...message,
        events: uniqBy([
          ...(message.events || []),
          ...(events || []).filter(event => event.messageId === message.mailgunId)
        ], 'id')
      }
    })
  }

  return {
    ...contact,
    messages: updatedJourney
  }
}

module.exports = injectLog
