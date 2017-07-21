const config = require('config').servers.services.text;

const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const Promise = require('bluebird');

const toneAnalyzer = new ToneAnalyzerV3({
  username: config.username,
  password: config.password,
  version_date: config.version,
  headers: {
    'X-Watson-Learning-Opt-Out': true
  }
});

module.exports.text = text =>
  new Promise((resolve, reject) =>
    toneAnalyzer.tone({
      text,
      tones: 'emotion'
    }, (e, res) => (e ? reject(e) : resolve(res))
    ));
