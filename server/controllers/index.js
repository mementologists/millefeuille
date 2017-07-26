module.exports.Plugins = require('./plugins');
/* eslint-disable global-require */
if (process.env.PROCESS_SERVER === 'analysis') {
  module.exports.Users = require('./users');
  module.exports.Sentiments = require('./sentiments');
}
/* eslint-enable global-require */
