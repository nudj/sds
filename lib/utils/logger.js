const { cyan, underline, red, green } = require('colors/safe')

const logger = ({
  script,
  prefix
}) => {
  const log = (...args) => {
    if (prefix) {
      console.log(cyan(prefix), underline(script + ':'), ...args)
    } else {
      console.log(underline(script + ':'), ...args)
    }
  }

  return {
    log: (...args) => log(...args),
    success: (...args) => log(green(...args, 'succeeded')),
    error: (...args) => {
      const [ first, ...rest ] = args
      log(red(first, 'failed', ...rest))
    }
  }
}


module.exports = logger
