const Promise = require('bluebird');

const axios = require('axios');

const utils = require('../lib/processUtils');

const config = require('config').servers.services.image;

const axiosCfg = {
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': config.key
  }
};

module.exports.fetchData = req => Promise.resolve(req.body.moment);

module.exports.processData = moment =>
  axios.post(config.api_uri, { url: moment.media.image.uri }, axiosCfg)
  .then(res => utils.summarizeImage(res.data))
  .then((aggregate) => {
    const newMoment = utils.clone(moment);
    newMoment.media = {};
    newMoment.media.image = aggregate;
    return newMoment;
  });

