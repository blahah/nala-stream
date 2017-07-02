var processor = require('./processor')
var through = require('through2').obj

const nalaify = opts => {
  var pipeline = processor(opts)
  return through((data, enc, next) => {
    next(null, {
      input: data,
      terms: pipeline.process(data)
    })
  })
}

module.exports = nalaify
