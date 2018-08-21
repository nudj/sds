const axios = require('axios')
const https = require('https')

const fetchAuthToken = async (url, { username, password }) => {
  const { data } = await axios({
    url: `${url}/_open/auth`,
    method: 'post',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    data: { username, password }
  })
  return data.jwt
}

const connectToDB = async (url, { db, username, password }) => {
  const authToken = await fetchAuthToken(url, { username, password })

  return {
    query: async (query, bindVars) => {
      const { data } = await axios({
        url: `${url}/_db/${db}/_api/cursor`,
        method: 'post',
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),
        headers: {
          Authorization: `bearer ${authToken}`
        },
        data: {
          "query": query,
          bindVars,
          "count": true,
          "batchSize": 50000
        }
      })
      return data.result
    }
  }
}

module.exports = connectToDB
