const requireTemplate = (filepath, { contact, hash }) => {
  const template = require(filepath)

  if (!hash) throw new Error('No hash')

  return template(contact, hash)
}

module.exports = requireTemplate
