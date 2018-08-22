const fs = require('fs')
const path = require('path')

const requireAQL = file => {
  return fs.readFileSync(`${path.resolve(__dirname, file)}.aql`, 'utf8')
}

module.exports = {
  fetchStatistics: requireAQL('./fetch-statistics'),
  fetchViewedHashes: requireAQL('./fetch-viewed-hashes'),
  fetchClickedIdsByHash: requireAQL('./fetch-clicked-ids-by-hash'),
  fetchMessageHashesBySample: requireAQL('./fetch-message-hashes-by-sample')
}
