/**
 * https://stackoverflow.com/a/47190904
 */
const fs = require('fs')

const readJSON = (path, opts = 'utf8') => new Promise((res, rej) => {
  fs.readFile(path, opts, (err, data) => {
    if (err) {
      rej(err)
    } else {
      res(JSON.parse(data))
    }
  })
})

const writeJSON = (path, data, opts = 'utf8') => new Promise((res, rej) => {
  fs.writeFile(path, JSON.stringify(data), opts, (err) => {
    if (err) {
      rej(err)
    } else {
      res(data)
    }
  })
})

module.exports = {
  readJSON,
  writeJSON,
  nativeFS: fs
}