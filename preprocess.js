var vector = require('./vector')

var zipobject = require('lodash.zipobject')
var transform = require('lodash.transform')
var identity = require('lodash.identity')
var isfunction = require('lodash.isfunction')
var bind = require('lodash.bind')
var isarray = require('lodash.isarray')
var map = require('lodash.map')
var flatten = require('lodash.flatten')

var jsonpath = require('jsonpath-plus')

function Preprocessor (opts) {
  if (!(this instanceof Preprocessor)) return new Preprocessor(opts)

  if (!opts.indexMap) throw new Error('preprocessor requires an indexMap option')

  this.opts = opts
  this.createPipeline(opts)
  this.cachePaths(opts)
}

Preprocessor.prototype.naturalize = function (str) {
  return vector(str)
    .trim()
    .tag()
    .filterPOS()
    .stripTags()
    .lowercase()
    .stripPunctuation()
    .filterNonWords()
    .removeStopwords()
    .stem()
    .terms
}

Preprocessor.prototype.createPipeline = function (opts) {
  var indexMap = opts.indexMap
  if (indexMap instanceof Array) {
    indexMap = zipobject(indexMap, [true])
  }

  var self = this
  this.pipeline = transform(indexMap, (pipeline, action, field) => {
    var op = identity
    if (isfunction(action)) {
      op = bind(action, self)
    } else if (action) {
      op = self.naturalize
    }
    pipeline[field] = op
  }, {})
}

Preprocessor.prototype.cachePaths = function (opts) {
  var map = opts.indexMap
  this.paths = isarray(map) ? map : Object.keys(map)
}

Preprocessor.prototype.pick = function (object) {
  return zipobject(this.paths, this.paths.map(path => {
    return jsonpath({ json: object, path: path }).join(' ')
  }))
}

Preprocessor.prototype.process = function (object) {
  var self = this
  var picked = this.pick(object)
  var parts = map(picked, (value, key) => {
    var step = self.pipeline[key]
    return step ? step(value) : value
  })
  return flatten(parts)
}

module.exports = Preprocessor
