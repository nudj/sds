const requireTemplate = (filepath, data) => {
  const template = require(filepath)

  if (!data.hash) throw new Error('No hash')

  return template(data)
}

module.exports = requireTemplate
