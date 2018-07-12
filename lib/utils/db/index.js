const path = require('path')
const uniqBy = require('lodash.uniqby')

const { readJSON, writeJSON } = require('../fs')

module.exports = class DB {
  static merge(...args) {
    const arrays = [].concat.apply([], args)
    const uniques = uniqBy(arrays, n => n.name)
    return uniques
  }

  constructor(src = './db.json') {
    this.src = path.resolve(src)
    this.db = null
  }

  async init() {
    this.db = await readJSON(this.src)
    return this
  }

  read() {
    return this.db
  }

  async write(data) {
    this.db = await writeJSON(this.src, data)
    return this.db
  }
}