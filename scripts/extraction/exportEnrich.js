require('dotenv').config()
const osmosis = require('osmosis')
const axios = require('axios')
const fs = require('fs')

let savedData = []
osmosis
  .get('http://example.com') // Insert URL of web page you'd like to scrape
  .find('someElement.someClass') // Choose the CSS selector that represents the company name (e.g. element.class)
  .set('name')
  .data(function (data) {
    savedData.push(data)
  })
  .done(function () {
    return Promise.all(savedData.map(record => {
      console.log(record)
      return axios({
        url: 'https://company.clearbit.com/v1/domains/find',
        auth: {
          username: process.env.CLEARBIT_USERNAME
        },
        params: {
          name: record.name
        }
      })
        .then(result => {
          return axios({
            url: 'https://company.clearbit.com/v2/companies/find',
            auth: {
              username: process.env.CLEARBIT_USERNAME
            },
            params: {
              domain: result.data.domain
            }
          })
            .then(result => result.data)
            .catch(() => null)
        })
        .catch((error) => console.log(error) || null)
    }))
      .then(result => {
        console.log(result)
        fs.writeFile('enrichedData.json', JSON.stringify(result.filter(record => !!record), null, 4), function (err) {
          if (err) console.error(err)
          else console.log('Data saved to enrichedData.json file')
        })
      })
      .catch(error => console.log(error))
  })
