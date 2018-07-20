const path = require('path')
const uniqBy = require('lodash.uniqby')

const { readJSON, writeJSON } = require('../fs')

module.exports = class DB {
  static merge (...args) {
    const arrays = [].concat.apply([], args)
    const uniques = uniqBy(arrays, n => n.name)
    return uniques
  }

  constructor (src = './db.json') {
    this.src = path.resolve(src)
    this.db = null

    this.init = this.init.bind(this)
    this.read = this.read.bind(this)
    this.write = this.write.bind(this)
    this.update = this.update.bind(this)
  }

  async init () {
    this.db = await readJSON(this.src)
    return this
  }

  read () {
    return this.db
  }

  async write (data) {
    this.db = await writeJSON(this.src, data)
    return this.db
  }

  async update (update) {
    return await this.write(
      DB.merge(update, this.read())
    )
  }
}
