const json2csv = require('json2csv')
const fs = require('fs')
const data = require('../../data/json/enrichedData.json')
const fields = [
  {
    label: 'Name',
    value: 'name',
    default: 'N/A'
  },
  {
    label: 'Industry',
    value: 'category.industry',
    default: 'N/A'
  },
  {
    label: 'Website',
    value: 'domain',
    default: 'N/A'
  },
  {
    label: 'Tags',
    value: function (row) {
      return row.tags ? row.tags.join(', ') : ''
    },
    default: 'N/A'
  },
  {
    label: 'Description',
    value: 'description',
    default: 'N/A'
  },
  {
    label: 'City',
    value: 'geo.city',
    default: 'N/A'
  },
  {
    label: 'Country',
    value: 'geo.country',
    default: 'N/A'
  },
  {
    label: 'Address',
    value: 'location',
    default: 'N/A'
  },
  {
    label: 'Technology Used',
    value: function (row) {
      return row.tech ? row.tech.join(', ') : ''
    },
    default: 'N/A'
  },
  {
    label: 'No. of Employees',
    value: 'metrics.employees',
    default: 'N/A'
  },
  {
    label: 'Employee Range',
    value: 'metrics.employeesRange',
    default: 'N/A'
  },
  {
    label: 'Estimated Annual Revenue',
    value: 'metrics.estimatedAnnualRevenue',
    default: 'N/A'
  },
  {
    label: 'Investment Raised To Date',
    value: 'metrics.raised',
    default: 'N/A'
  }
]
const opts = {
  data: data,
  fields: fields
}
const csv = json2csv(opts)
// Note: Change Export File Location
fs.writeFile('../../data/csv/enrichedData.csv', csv, function (err) {
  if (err) throw err
  console.log('File saved')
})
