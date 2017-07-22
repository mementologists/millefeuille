const axios = require('axios');

const Promise = require('bluebird');

const config = require('config').servers;

// const models = require('../../db');

const utils = require('../lib/processUtils');

module.exports.fetchData = (req) => {
  /* eslint-disable no-console */
  console.log('got Analysis Request!: ', JSON.stringify(req.body.moment));
  /* eslint-enable no-console */

  // Get the current summary record from the DB or create a new one if it's not there
  return Promise.resolve(req.body.moment);
};

module.exports.processData = (moment) => {
  // process the incoming data combined with the current summary information
  const newMoment = utils.clone(moment);
  newMoment.media = {};
  newMoment.sentiment = utils.textSummary(moment.media.text);
  return Promise.resolve(newMoment);
};

module.exports.saveResults = (moment) => {
  // Update the Sentiment Database with the processed results

  // Make API call to web server to update average sentiment for the moment
  const madeleinePort = config.madeleine.port ? `:${config.madeleine.port}` : '';
  const madeleineEndpoint = `${config.madeleine.uri}${madeleinePort}/api/process`;

  return axios.post(madeleineEndpoint, { moment }).data;
};
