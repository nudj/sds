const provinces = [
  'ontario',
  'quebec',
  'british columbia',
  'alberta',
  'manitoba',
  'saskatchewan',
  'nova scotia',
  'new brunswick',
  'newfoundland',
  'labrador',
  'prince edward island',
  'northwest territories',
  'nunavut',
  'yukon'
]

const isCanadianCompany = company => {
  if (company.location) {
    const location = company.location.toLowerCase()

    let isCanadianProvince = false
    provinces.forEach(province => {
      if (location.includes(province)) {
        isCanadianProvince = true
      }
    })

    if (location.includes('canada') || isCanadianProvince) {
      return true
    }
  }

  return !!company.domain && company.domain.endsWith('.ca')
}

module.exports = isCanadianCompany
