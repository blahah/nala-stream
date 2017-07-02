var processor = require('./processor')
var through = require('through2').obj

module.exports = opts => {
  var pipeline = processor(opts)
  return through(
    (data, enc, next) => next(null, pipeline.process(data))
  )
}
