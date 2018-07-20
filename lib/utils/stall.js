const stall = time => new Promise(resolve => setTimeout(resolve, time))

module.exports = stall
