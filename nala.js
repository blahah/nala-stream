var path = require('path')
var natural = require('natural')

module.exports = {
  tokenize: gettokenize(),
  stem: getstem(),
  tag: gettag(),
  stop: require('stopword')
}

function gettokenize () {
  var tokenizer = new natural.TreebankWordTokenizer()
  return tokenizer.tokenize.bind(tokenizer)
}

function getstem () {
  var stemmer = natural.PorterStemmer
  return stemmer.stem.bind(stemmer)
}

function gettag () {
  var rulepath = path.join(__dirname, 'tagger', 'tr_from_posjs.txt')
  var rules = new natural.RuleSet(rulepath)

  var lexpath = path.join(__dirname, 'tagger', 'lexicon_from_posjs.json')
  var lexicon = new natural.Lexicon(lexpath, 'N')

  var tagger = new natural.BrillPOSTagger(lexicon, rules)
  return tagger.tag.bind(tagger)
}
