/**
 * https://stackoverflow.com/a/47190904
 */
const fs = require('fs')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const readJSON = async (path, opts = 'utf8') => {
  try {
    const data = await readFileAsync(path, opts)
    return JSON.parse(data)
  } catch (e) {
    console.error(`Error reading JSON file at ${path}:`, e)
  }
}

const writeJSON = async (path, data, opts = 'utf8') => {
  const str = JSON.stringify(data)
  try {
    await writeFileAsync(path, str, opts)
    return data
  } catch (e) {
    console.error(`Error writing JSON file at ${path}, with data ${str}:`, e)
  }
}

module.exports = {
  readFileAsync,
  writeFileAsync,
  readJSON,
  writeJSON
}
