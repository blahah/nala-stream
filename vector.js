var inherits = require('util').inherits
var nala = require('./nala')

inherits(Vector, Array)

function Vector (terms) {
  if (!(this instanceof Vector)) return new Vector(terms)
  if (terms instanceof Vector) terms = terms.terms

  if (typeof terms === 'string') {
    this.eatString(terms)
  } else {
    this.terms = terms
  }
}

function stripPunctuation (term) {
  return term.replace(/<[^>]+>/g, '').replace(/\W+/g, '')
}

function stripTag (pair) {
  return pair[0]
}

function isWord (term) {
  return term.replace(/[0-9]+/g, '').length > 0
}

Vector.prototype.eatString = function (string) {
  this.terms = nala.tokenize(string.replace(/[|'.,/\\(\n)]+/, ' '))
}

Vector.prototype.lowercase = function () {
  return Vector(this.terms.map(s => s.toLowerCase()))
}

Vector.prototype.trim = function () {
  return Vector(this.terms.map(s => s.trim()))
}

Vector.prototype.removeStopwords = function (lang) {
  return Vector(nala.stop.removeStopwords(this.terms, nala.stop[lang || 'en']))
}

Vector.prototype.tag = function () {
  this.tags = nala.tag(this.terms)
  return this
}

Vector.prototype.filterPOS = function () {
  var filtered = this.tags.filter(part => {
    // see
    // https://en.wikipedia.org/wiki/Brown_Corpus#Part-of-speech_tags_used
    var tag = part[1]
    if (!tag) return false

    // keep
    var first = tag[0]
    if (first === 'N') return true // nouns
    if (first === 'V') return true // verbs
    if (first === 'J') return true // adjectives
    if (first === 'R') return true // adverbs

    // discard
    return false
  })
  return Vector(filtered)
}

Vector.prototype.stripTags = function () {
  return Vector(this.terms.map(stripTag))
}

Vector.prototype.stripPunctuation = function () {
  return Vector(this.terms.map(stripPunctuation))
}

Vector.prototype.filterNonWords = function () {
  return Vector(this.terms.filter(isWord))
}

Vector.prototype.stem = function () {
  return Vector(this.terms.map(nala.stem))
}

module.exports = Vector
