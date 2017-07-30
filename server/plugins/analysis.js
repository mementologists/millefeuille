const axios = require('axios');

const Promise = require('bluebird');

const config = require('config').servers;

const utils = require('../lib/processUtils');

const ctrls = require('../controllers');

module.exports.handleGet = (req, res) =>
  ctrls.Users.getUser(req.params.id)
  .then(record => res.status(200).send(record.doc))
  .catch(err => res.status(500).send(err));


module.exports.fetchData = (req) => {
  console.log('got Analysis Request!: ', req.body.moment); // eslint-disable-line no-console
  Object.keys(req.body.moment.media).forEach(
    mediaType => console.log( // eslint-disable-line no-console
      `${mediaType} analysis summary: ${JSON.stringify(req.body.moment.media[mediaType].summary)}`)
  );
  return Promise.resolve(req.body.moment);
};

module.exports.processData = moment =>
  ctrls.Sentiments.set(moment)
  .then(() => ctrls.Sentiments.getMomentSentiments(moment))
  .then((sentiments) => {
    if (sentiments.length === moment.keys.length) {
      /* eslint-disable no-param-reassign */
      moment.media = {};
      moment.summary = utils.summarize(sentiments);
      moment.sentiment = utils.getMaxEmotion(moment.summary);
      /* eslint-enable no-param-reassign */
      return ctrls.Users.upsertDonut(moment);
    }
    /* eslint-disable no-param-reassign */
    moment.summary = null;
    moment.sentiment = null;
    /* eslint-enable no-param-reassign */
    return Promise.resolve(moment);
  });

module.exports.saveResults = (moment) => {
  if (moment.sentiment) {
    const madeleinePort = config.madeleine.port ? `:${config.madeleine.port}` : '';
    const madeleineEndpoint = `${config.madeleine.uri}${madeleinePort}/api/process`;
    return axios.post(madeleineEndpoint, { moment }, { 'Content-Type': 'application/json' });
  }
  return Promise.resolve(moment);
};
