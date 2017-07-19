const Promise = require('bluebird');

module.exports.fetchData = (req) => {
  /* eslint-disable no-console */
  console.log('got Analysis Request!: ', req.body.moment);
  /* eslint-enable no-console */
  return Promise.resolve(req.body.moment);
};

module.exports.processData = moment => Promise.resolve(moment);

module.exports.saveResults = moment => Promise.resolve(moment);
